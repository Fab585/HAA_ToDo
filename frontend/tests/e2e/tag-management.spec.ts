import { test, expect } from '@playwright/test';

/**
 * E2E tests for tag management
 * Tests creating, applying, and managing tags
 */

test.describe('Tag Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('text=HABoard', { timeout: 10000 });
	});

	test('should open tag manager', async ({ page }) => {
		// Click the tags button
		await page.click('button[aria-label="Manage tags"]');

		// Verify the tag manager modal opens
		await expect(page.locator('h2:has-text("Manage Tags")')).toBeVisible();
		await expect(page.locator('text=Create New Tag')).toBeVisible();
	});

	test('should create a new tag', async ({ page }) => {
		// Open tag manager
		await page.click('button[aria-label="Manage tags"]');

		// Fill in tag details
		await page.fill('input[id="tag-name-input"]', 'Work');

		// Select a color (click the blue color button)
		await page.click('button[aria-label="Blue color"]');

		// Click Create Tag button
		await page.click('button:has-text("Create Tag")');

		// Verify the tag appears in the list
		await expect(page.locator('text=Work')).toBeVisible();

		// Close the modal
		await page.click('button:has-text("Done")');
	});

	test('should apply tag to a task', async ({ page }) => {
		// First, create a tag
		await page.click('button[aria-label="Manage tags"]');
		await page.fill('input[id="tag-name-input"]', 'Important');
		await page.click('button[aria-label="Red color"]');
		await page.click('button:has-text("Create Tag")');
		await page.click('button:has-text("Done")');

		// Create a task
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task with Tag');

		// Select the tag
		await page.click('button:has-text("Important")');

		// Submit the form
		await page.click('button:has-text("Create Task")');

		// Verify the task has the tag
		const taskItem = page.locator('div:has-text("Task with Tag")').first();
		await expect(taskItem.locator('text=Important')).toBeVisible();
	});

	test('should create tag inline during task creation', async ({ page }) => {
		// Create a task
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task with New Tag');

		// Click "+ Add Tag" button
		await page.click('button[aria-label="Add new tag"]');

		// Fill in the new tag name
		await page.fill('input[id="new-tag-input"]', 'Urgent');

		// Press Enter to create the tag
		await page.press('input[id="new-tag-input"]', 'Enter');

		// Verify the tag is now selected
		await expect(page.locator('button:has-text("Urgent")[aria-pressed="true"]')).toBeVisible();

		// Submit the task
		await page.click('button:has-text("Create Task")');

		// Verify the task has the tag
		const taskItem = page.locator('div:has-text("Task with New Tag")').first();
		await expect(taskItem.locator('text=Urgent')).toBeVisible();
	});

	test('should select custom color for tag', async ({ page }) => {
		// Open tag manager
		await page.click('button[aria-label="Manage tags"]');

		// Fill in tag name
		await page.fill('input[id="tag-name-input"]', 'Custom Color Tag');

		// Click the custom color input and set a color
		await page.locator('input[id="custom-color-input"]').fill('#ff6b6b');

		// Create the tag
		await page.click('button:has-text("Create Tag")');

		// Verify the tag appears
		await expect(page.locator('text=Custom Color Tag')).toBeVisible();

		// Close modal
		await page.click('button:has-text("Done")');
	});

	test('should delete a tag', async ({ page }) => {
		// Create a tag first
		await page.click('button[aria-label="Manage tags"]');
		await page.fill('input[id="tag-name-input"]', 'Tag to Delete');
		await page.click('button:has-text("Create Tag")');

		// Verify it appears
		await expect(page.locator('text=Tag to Delete')).toBeVisible();

		// Set up dialog handler to accept confirmation
		page.on('dialog', (dialog) => dialog.accept());

		// Click delete button
		const tagRow = page.locator('div:has-text("Tag to Delete")').first();
		await tagRow.locator('button[aria-label="Delete tag"]').click();

		// Verify the tag is removed
		await expect(page.locator('text=Tag to Delete')).not.toBeVisible();

		// Close modal
		await page.click('button:has-text("Done")');
	});

	test('should close tag manager with Escape key', async ({ page }) => {
		// Open tag manager
		await page.click('button[aria-label="Manage tags"]');

		// Verify it's open
		await expect(page.locator('h2:has-text("Manage Tags")')).toBeVisible();

		// Press Escape
		await page.press('body', 'Escape');

		// Verify it's closed
		await expect(page.locator('h2:has-text("Manage Tags")')).not.toBeVisible();
	});

	test('should toggle tag selection on task', async ({ page }) => {
		// Create a tag
		await page.click('button[aria-label="Manage tags"]');
		await page.fill('input[id="tag-name-input"]', 'Toggle Tag');
		await page.click('button:has-text("Create Tag")');
		await page.click('button:has-text("Done")');

		// Create a task
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task for Toggle');

		// Select the tag
		const tagButton = page.locator('button:has-text("Toggle Tag")').first();
		await tagButton.click();

		// Verify it's selected (aria-pressed=true)
		await expect(tagButton).toHaveAttribute('aria-pressed', 'true');

		// Click again to deselect
		await tagButton.click();

		// Verify it's deselected
		await expect(tagButton).toHaveAttribute('aria-pressed', 'false');

		// Re-select and submit
		await tagButton.click();
		await page.click('button:has-text("Create Task")');

		// Verify the task has the tag
		const taskItem = page.locator('div:has-text("Task for Toggle")').first();
		await expect(taskItem.locator('text=Toggle Tag')).toBeVisible();
	});

	test('should prevent creating duplicate tags', async ({ page }) => {
		// Create a tag
		await page.click('button[aria-label="Manage tags"]');
		await page.fill('input[id="tag-name-input"]', 'Duplicate');
		await page.click('button:has-text("Create Tag")');

		// Verify it appears
		await expect(page.locator('text=Duplicate').first()).toBeVisible();

		// Try to create the same tag again
		await page.fill('input[id="tag-name-input"]', 'Duplicate');
		await page.click('button:has-text("Create Tag")');

		// Verify error message appears
		await expect(page.locator('text=Tag already exists')).toBeVisible();

		// Close modal
		await page.click('button:has-text("Done")');
	});
});

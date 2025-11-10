import { test, expect } from '@playwright/test';

/**
 * E2E tests for search and filter functionality
 * Tests searching tasks by title, notes, and tags
 */

test.describe('Search and Filter', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('text=HABoard', { timeout: 10000 });

		// Create test tasks with different content
		// Task 1
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Buy groceries');
		await page.fill('textarea[id="notes"]', 'Milk, eggs, bread');
		await page.click('button:has-text("Create Task")');

		// Task 2
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Plan vacation');
		await page.fill('textarea[id="notes"]', 'Research destinations');
		await page.click('button:has-text("Create Task")');

		// Task 3
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Finish project report');
		await page.fill('textarea[id="notes"]', 'Include charts and graphs');
		await page.click('button:has-text("Create Task")');
	});

	test('should search tasks by title', async ({ page }) => {
		// Search for "groceries"
		await page.fill('input[id="search-tasks"]', 'groceries');

		// Verify only the matching task is visible
		await expect(page.locator('text=Buy groceries')).toBeVisible();
		await expect(page.locator('text=Plan vacation')).not.toBeVisible();
		await expect(page.locator('text=Finish project report')).not.toBeVisible();
	});

	test('should search tasks by notes content', async ({ page }) => {
		// Search for "charts"
		await page.fill('input[id="search-tasks"]', 'charts');

		// Verify only the task with matching notes is visible
		await expect(page.locator('text=Finish project report')).toBeVisible();
		await expect(page.locator('text=Buy groceries')).not.toBeVisible();
		await expect(page.locator('text=Plan vacation')).not.toBeVisible();
	});

	test('should search case-insensitively', async ({ page }) => {
		// Search with different case
		await page.fill('input[id="search-tasks"]', 'VACATION');

		// Verify the task is found regardless of case
		await expect(page.locator('text=Plan vacation')).toBeVisible();
		await expect(page.locator('text=Buy groceries')).not.toBeVisible();
	});

	test('should show all tasks when search is cleared', async ({ page }) => {
		// Search for something
		await page.fill('input[id="search-tasks"]', 'groceries');

		// Verify filtered results
		await expect(page.locator('text=Buy groceries')).toBeVisible();
		await expect(page.locator('text=Plan vacation')).not.toBeVisible();

		// Clear the search
		await page.fill('input[id="search-tasks"]', '');

		// Verify all tasks are visible again
		await expect(page.locator('text=Buy groceries')).toBeVisible();
		await expect(page.locator('text=Plan vacation')).toBeVisible();
		await expect(page.locator('text=Finish project report')).toBeVisible();
	});

	test('should show no results message for non-matching search', async ({ page }) => {
		// Search for something that doesn't exist
		await page.fill('input[id="search-tasks"]', 'nonexistent task xyz');

		// Verify no results message
		await expect(page.locator('text=No tasks found matching')).toBeVisible();
	});

	test('should search partial matches', async ({ page }) => {
		// Search for partial word
		await page.fill('input[id="search-tasks"]', 'proj');

		// Verify it finds "project"
		await expect(page.locator('text=Finish project report')).toBeVisible();
		await expect(page.locator('text=Buy groceries')).not.toBeVisible();
	});

	test('should combine search with filter', async ({ page }) => {
		// Complete one task
		const taskItem = page.locator('div:has-text("Buy groceries")').first();
		await taskItem.locator('button[aria-label*="Mark"]').first().click();

		// Switch to Done filter
		await page.click('button:has-text("Done")');

		// Search within completed tasks
		await page.fill('input[id="search-tasks"]', 'groceries');

		// Verify only completed matching task is shown
		await expect(page.locator('text=Buy groceries')).toBeVisible();

		// Switch to Active filter
		await page.click('button:has-text("Active")');

		// Same search should show no results in Active
		await expect(page.locator('text=No tasks found matching')).toBeVisible();
	});

	test('should focus search with Ctrl+K shortcut', async ({ page }) => {
		// Press Ctrl+K
		await page.keyboard.press('Control+k');

		// Verify search is focused
		const searchInput = page.locator('input[id="search-tasks"]');
		await expect(searchInput).toBeFocused();

		// Type a search query
		await page.keyboard.type('vacation');

		// Verify search works
		await expect(page.locator('text=Plan vacation')).toBeVisible();
		await expect(page.locator('text=Buy groceries')).not.toBeVisible();
	});

	test('should search with tags', async ({ page }) => {
		// Create a tag
		await page.click('button[aria-label="Manage tags"]');
		await page.fill('input[id="tag-name-input"]', 'Shopping');
		await page.click('button:has-text("Create Tag")');
		await page.click('button:has-text("Done")');

		// Edit the groceries task to add the tag
		const taskItem = page.locator('div:has-text("Buy groceries")').first();
		await taskItem.locator('button[aria-label="Edit task"]').click();
		await page.click('button:has-text("Shopping")');
		await page.click('button:has-text("Update Task")');

		// Search by tag name
		await page.fill('input[id="search-tasks"]', 'Shopping');

		// Verify task with tag is found
		await expect(page.locator('text=Buy groceries')).toBeVisible();
		await expect(page.locator('text=Plan vacation')).not.toBeVisible();
	});

	test('should update results as user types', async ({ page }) => {
		const searchInput = page.locator('input[id="search-tasks"]');

		// Type "pro"
		await searchInput.fill('pro');
		await expect(page.locator('text=Finish project report')).toBeVisible();
		await expect(page.locator('text=Buy groceries')).not.toBeVisible();

		// Add more characters
		await searchInput.fill('project');
		await expect(page.locator('text=Finish project report')).toBeVisible();

		// Change to different search
		await searchInput.fill('vacation');
		await expect(page.locator('text=Plan vacation')).toBeVisible();
		await expect(page.locator('text=Finish project report')).not.toBeVisible();
	});

	test('should preserve filter selection while searching', async ({ page }) => {
		// Switch to All filter
		await page.click('button:has-text("All")');

		// Complete a task
		const taskItem = page.locator('div:has-text("Buy groceries")').first();
		await taskItem.locator('button[aria-label*="Mark"]').first().click();

		// Search
		await page.fill('input[id="search-tasks"]', 'groceries');

		// Verify All filter is still selected
		const allButton = page.locator('button:has-text("All")');
		await expect(allButton).toHaveClass(/bg-blue-500/);

		// And task is found (even though completed)
		await expect(page.locator('text=Buy groceries')).toBeVisible();
	});
});

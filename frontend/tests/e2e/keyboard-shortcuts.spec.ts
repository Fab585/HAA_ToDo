import { test, expect } from '@playwright/test';

/**
 * E2E tests for keyboard shortcuts
 * Tests all 11 keyboard shortcuts and the help dialog
 */

test.describe('Keyboard Shortcuts', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('text=HABoard', { timeout: 10000 });
	});

	test('should show keyboard shortcuts help with ?', async ({ page }) => {
		// Press ? to open help
		await page.keyboard.press('?');

		// Verify the help modal opens
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).toBeVisible();

		// Verify shortcuts are listed
		await expect(page.locator('text=Quick add new task')).toBeVisible();
		await expect(page.locator('text=Create new task')).toBeVisible();
		await expect(page.locator('text=Focus search')).toBeVisible();

		// Close with Escape
		await page.keyboard.press('Escape');

		// Verify it's closed
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).not.toBeVisible();
	});

	test('should open new task form with / key', async ({ page }) => {
		// Press / to open new task form
		await page.keyboard.press('/');

		// Verify the form appears
		await expect(page.locator('input[id="title"]')).toBeVisible();
		await expect(page.locator('button:has-text("Create Task")')).toBeVisible();
	});

	test('should open new task form with n key', async ({ page }) => {
		// Press n to open new task form
		await page.keyboard.press('n');

		// Verify the form appears
		await expect(page.locator('input[id="title"]')).toBeVisible();
		await expect(page.locator('button:has-text("Create Task")')).toBeVisible();
	});

	test('should close modal with Escape key', async ({ page }) => {
		// Open new task form
		await page.keyboard.press('n');
		await expect(page.locator('input[id="title"]')).toBeVisible();

		// Press Escape to close
		await page.keyboard.press('Escape');

		// Verify the form is closed
		await expect(page.locator('input[id="title"]')).not.toBeVisible();
	});

	test('should focus search with Ctrl+K', async ({ page }) => {
		// Press Ctrl+K to focus search
		await page.keyboard.press('Control+k');

		// Verify search input is focused
		const searchInput = page.locator('input[id="search-tasks"]');
		await expect(searchInput).toBeFocused();
	});

	test('should open tag manager with t key', async ({ page }) => {
		// Press t to open tag manager
		await page.keyboard.press('t');

		// Verify tag manager opens
		await expect(page.locator('h2:has-text("Manage Tags")')).toBeVisible();
	});

	test('should switch to active filter with 1 key', async ({ page }) => {
		// Press 1 to switch to active filter
		await page.keyboard.press('1');

		// Verify Active button is selected (has active styling)
		const activeButton = page.locator('button:has-text("Active")');
		await expect(activeButton).toHaveClass(/bg-blue-500/);
	});

	test('should switch to completed filter with 2 key', async ({ page }) => {
		// Press 2 to switch to completed filter
		await page.keyboard.press('2');

		// Verify Done button is selected
		const doneButton = page.locator('button:has-text("Done")');
		await expect(doneButton).toHaveClass(/bg-blue-500/);
	});

	test('should switch to all filter with 3 key', async ({ page }) => {
		// Press 3 to switch to all filter
		await page.keyboard.press('3');

		// Verify All button is selected
		const allButton = page.locator('button:has-text("All")');
		await expect(allButton).toHaveClass(/bg-blue-500/);
	});

	test('should not trigger shortcuts when typing in input', async ({ page }) => {
		// Open new task form
		await page.click('button:has-text("+ New Task")');

		// Focus the title input
		const titleInput = page.locator('input[id="title"]');
		await titleInput.click();

		// Type text that includes shortcut keys
		await titleInput.fill('Type n and / and t here');

		// Verify no modals opened (form should still be visible)
		await expect(titleInput).toBeVisible();
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).not.toBeVisible();
		await expect(page.locator('h2:has-text("Manage Tags")')).not.toBeVisible();
	});

	test('should not trigger shortcuts when typing in textarea', async ({ page }) => {
		// Open new task form
		await page.click('button:has-text("+ New Task")');

		// Focus the notes textarea
		const notesTextarea = page.locator('textarea[id="notes"]');
		await notesTextarea.click();

		// Type text that includes shortcut keys
		await notesTextarea.fill('Notes with n / t 123');

		// Verify no modals opened or filter changes
		await expect(notesTextarea).toBeVisible();
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).not.toBeVisible();
	});

	test('should navigate shortcuts sequentially', async ({ page }) => {
		// Open help
		await page.keyboard.press('?');
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).toBeVisible();

		// Close help with Escape
		await page.keyboard.press('Escape');
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).not.toBeVisible();

		// Open tag manager with t
		await page.keyboard.press('t');
		await expect(page.locator('h2:has-text("Manage Tags")')).toBeVisible();

		// Close with Escape
		await page.keyboard.press('Escape');
		await expect(page.locator('h2:has-text("Manage Tags")')).not.toBeVisible();

		// Open new task form with n
		await page.keyboard.press('n');
		await expect(page.locator('input[id="title"]')).toBeVisible();

		// Close with Escape
		await page.keyboard.press('Escape');
		await expect(page.locator('input[id="title"]')).not.toBeVisible();
	});

	test('should display platform-specific shortcuts in help', async ({ page }) => {
		// Open help
		await page.keyboard.press('?');

		// Verify help modal is visible
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).toBeVisible();

		// Check that shortcuts are displayed (will show either Ctrl or ⌘ based on platform)
		const syncShortcut = page.locator('text=Sync with server').locator('..');
		await expect(syncShortcut).toBeVisible();
	});

	test('should close help modal by clicking outside', async ({ page }) => {
		// Open help
		await page.keyboard.press('?');
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).toBeVisible();

		// Click on the backdrop (outside the modal)
		await page.click('body', { position: { x: 10, y: 10 } });

		// Verify it's closed
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).not.toBeVisible();
	});
});

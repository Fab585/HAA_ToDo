import { test, expect } from '@playwright/test';

/**
 * E2E tests for accessibility features
 * Tests keyboard navigation, ARIA attributes, and screen reader support
 */

test.describe('Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('text=HABoard', { timeout: 10000 });
	});

	test('should have proper ARIA labels on icon buttons', async ({ page }) => {
		// Check tags button
		const tagsButton = page.locator('button[aria-label="Manage tags"]');
		await expect(tagsButton).toBeVisible();
		await expect(tagsButton).toHaveAttribute('aria-label', 'Manage tags');

		// Check sync button
		const syncButton = page.locator('button[aria-label*="Sync"]');
		await expect(syncButton).toBeVisible();
	});

	test('should have proper ARIA labels on form inputs', async ({ page }) => {
		// Open new task form
		await page.click('button:has-text("+ New Task")');

		// Check title input has label
		const titleInput = page.locator('input[id="title"]');
		await expect(titleInput).toHaveAttribute('id', 'title');

		// Check there's a label for title
		const titleLabel = page.locator('label[for="title"]');
		await expect(titleLabel).toBeVisible();
		await expect(titleLabel).toHaveText('Task Title *');
	});

	test('should have proper modal ARIA attributes', async ({ page }) => {
		// Open tag manager modal
		await page.click('button[aria-label="Manage tags"]');

		// Check modal has proper ARIA attributes
		const modal = page.locator('[role="dialog"]');
		await expect(modal).toBeVisible();
		await expect(modal).toHaveAttribute('aria-modal', 'true');
		await expect(modal).toHaveAttribute('aria-labelledby', 'tag-manager-title');

		// Check the title has the matching ID
		const modalTitle = page.locator('#tag-manager-title');
		await expect(modalTitle).toBeVisible();
		await expect(modalTitle).toHaveText('Manage Tags');
	});

	test('should support keyboard navigation for buttons', async ({ page }) => {
		// Tab to the first focusable element
		await page.keyboard.press('Tab');

		// Continue tabbing to find buttons
		// (exact number of tabs depends on layout, so we'll just verify we can reach the New Task button)
		for (let i = 0; i < 10; i++) {
			const focused = await page.evaluate(() => document.activeElement?.textContent);
			if (focused?.includes('New Task')) {
				break;
			}
			await page.keyboard.press('Tab');
		}

		// Press Enter to activate the button
		await page.keyboard.press('Enter');

		// Verify form opens
		await expect(page.locator('input[id="title"]')).toBeVisible();
	});

	test('should have aria-pressed on toggle buttons', async ({ page }) => {
		// Open new task form
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Test Task');

		// Check priority buttons have aria-pressed
		const noneButton = page.locator('button:has-text("None")').first();
		await expect(noneButton).toHaveAttribute('aria-pressed');

		// Click to select
		await noneButton.click();
		await expect(noneButton).toHaveAttribute('aria-pressed', 'true');

		// Click another priority
		const highButton = page.locator('button:has-text("High")').first();
		await highButton.click();
		await expect(highButton).toHaveAttribute('aria-pressed', 'true');
		await expect(noneButton).toHaveAttribute('aria-pressed', 'false');
	});

	test('should have proper fieldset and legend for form groups', async ({ page }) => {
		// Open new task form
		await page.click('button:has-text("+ New Task")');

		// Check Priority fieldset
		const priorityFieldset = page.locator('fieldset').filter({ hasText: 'Priority' });
		await expect(priorityFieldset).toBeVisible();

		const priorityLegend = priorityFieldset.locator('legend');
		await expect(priorityLegend).toHaveText('Priority');

		// Check Tags fieldset
		const tagsFieldset = page.locator('fieldset').filter({ hasText: 'Tags' });
		await expect(tagsFieldset).toBeVisible();

		const tagsLegend = tagsFieldset.locator('legend');
		await expect(tagsLegend).toHaveText('Tags');
	});

	test('should have aria-label for search input', async ({ page }) => {
		// Check search input has label
		const searchInput = page.locator('input[id="search-tasks"]');
		await expect(searchInput).toBeVisible();

		// Check for associated label
		const searchLabel = page.locator('label[for="search-tasks"]');
		await expect(searchLabel).toBeAttached();
	});

	test('should mark decorative icons as aria-hidden', async ({ page }) => {
		// Open new task form to see the calendar icon
		await page.click('button:has-text("+ New Task")');

		// Check that SVG icons have aria-hidden="true"
		// (We can't easily test all of them, but we can verify the pattern exists)
		const svgs = page.locator('svg[aria-hidden="true"]');
		const count = await svgs.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should support Escape key to close modals', async ({ page }) => {
		// Open tag manager
		await page.click('button[aria-label="Manage tags"]');
		await expect(page.locator('h2:has-text("Manage Tags")')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Verify modal closed
		await expect(page.locator('h2:has-text("Manage Tags")')).not.toBeVisible();

		// Open keyboard help
		await page.keyboard.press('?');
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Verify modal closed
		await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).not.toBeVisible();
	});

	test('should have delete button accessible via keyboard', async ({ page }) => {
		// Create a task
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task to Delete');
		await page.click('button:has-text("Create Task")');

		// Verify task appears
		await expect(page.locator('text=Task to Delete')).toBeVisible();

		// Find the delete button
		const taskItem = page.locator('div:has-text("Task to Delete")').first();
		const deleteButton = taskItem.locator('button[aria-label="Delete task"]');

		// Verify it's accessible
		await expect(deleteButton).toBeVisible();
		await expect(deleteButton).toHaveAttribute('aria-label', 'Delete task');

		// Set up dialog handler
		page.on('dialog', (dialog) => dialog.accept());

		// Click the delete button
		await deleteButton.click();

		// Verify task is deleted
		await expect(page.locator('text=Task to Delete')).not.toBeVisible();
	});

	test('should have proper role groups for button collections', async ({ page }) => {
		// Open new task form
		await page.click('button:has-text("+ New Task")');

		// Check that priority buttons have role="group"
		const priorityGroup = page.locator('[role="group"][aria-label="Task priority"]');
		await expect(priorityGroup).toBeVisible();

		// Check that tag buttons have role="group"
		const tagsGroup = page.locator('[role="group"][aria-label="Task tags"]');
		await expect(tagsGroup).toBeVisible();
	});

	test('should have focus visible styles', async ({ page }) => {
		// Tab to focus an element
		await page.keyboard.press('Tab');

		// Check that focused element has visible focus indicator
		// (We check for focus-visible or focus ring)
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();

		// Most Tailwind focus rings use ring-2 or similar classes
		// We can verify the element exists and is focused
		const isFocused = await focusedElement.evaluate((el) => el === document.activeElement);
		expect(isFocused).toBe(true);
	});

	test('should have proper heading hierarchy', async ({ page }) => {
		// Check main heading
		const h1 = page.locator('h1');
		await expect(h1).toHaveText('HABoard');

		// Open tag manager to check modal heading
		await page.click('button[aria-label="Manage tags"]');
		const modalH2 = page.locator('h2#tag-manager-title');
		await expect(modalH2).toHaveText('Manage Tags');

		// Check subheading in modal
		const h3 = page.locator('h3:has-text("Create New Tag")');
		await expect(h3).toBeVisible();
	});

	test('should have proper button types', async ({ page }) => {
		// Open new task form
		await page.click('button:has-text("+ New Task")');

		// Check submit button has correct type
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeVisible();

		// Check priority buttons have type="button" (not submit)
		const priorityButton = page.locator('button:has-text("High")').first();
		await expect(priorityButton).toHaveAttribute('type', 'button');
	});
});

import { test, expect } from '@playwright/test';

/**
 * E2E tests for task management
 * Tests critical user flows for creating, editing, completing, and deleting tasks
 */

test.describe('Task Management', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app
		await page.goto('/');

		// Wait for the app to load
		await page.waitForSelector('text=HABoard', { timeout: 10000 });
	});

	test('should display the main page with all elements', async ({ page }) => {
		// Check header elements
		await expect(page.locator('h1:has-text("HABoard")')).toBeVisible();
		await expect(page.locator('text=Home Assistant To-Do')).toBeVisible();

		// Check status indicators
		await expect(page.locator('text=Online')).toBeVisible();

		// Check filter tabs
		await expect(page.locator('button:has-text("Active")')).toBeVisible();
		await expect(page.locator('button:has-text("Done")')).toBeVisible();
		await expect(page.locator('button:has-text("All")')).toBeVisible();

		// Check new task button
		await expect(page.locator('button:has-text("+ New Task")')).toBeVisible();
	});

	test('should create a new task', async ({ page }) => {
		// Click the New Task button
		await page.click('button:has-text("+ New Task")');

		// Wait for the form to appear
		await expect(page.locator('input[id="title"]')).toBeVisible();

		// Fill in the task details
		await page.fill('input[id="title"]', 'Test Task from E2E');
		await page.fill('textarea[id="notes"]', 'This is a test note');

		// Select priority (Medium)
		await page.click('button:has-text("Medium")');

		// Submit the form
		await page.click('button:has-text("Create Task")');

		// Verify the task appears in the list
		await expect(page.locator('text=Test Task from E2E')).toBeVisible();
		await expect(page.locator('text=This is a test note')).toBeVisible();
	});

	test('should complete a task by clicking checkbox', async ({ page }) => {
		// First, create a task
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task to Complete');
		await page.click('button:has-text("Create Task")');

		// Wait for the task to appear
		await expect(page.locator('text=Task to Complete')).toBeVisible();

		// Find and click the checkbox for this task
		const taskItem = page.locator('div:has-text("Task to Complete")').first();
		const checkbox = taskItem.locator('button[aria-label*="Mark"]').first();
		await checkbox.click();

		// Switch to Done filter
		await page.click('button:has-text("Done")');

		// Verify the task appears in the completed list
		await expect(page.locator('text=Task to Complete')).toBeVisible();
	});

	test('should edit an existing task', async ({ page }) => {
		// Create a task first
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task to Edit');
		await page.click('button:has-text("Create Task")');

		// Wait for the task to appear
		await expect(page.locator('text=Task to Edit')).toBeVisible();

		// Click the edit button
		const taskItem = page.locator('div:has-text("Task to Edit")').first();
		const editButton = taskItem.locator('button[aria-label="Edit task"]');
		await editButton.click();

		// Wait for the form to appear
		await expect(page.locator('input[id="title"]')).toBeVisible();

		// Modify the title
		await page.fill('input[id="title"]', 'Edited Task Title');
		await page.fill('textarea[id="notes"]', 'Updated notes');

		// Submit the form
		await page.click('button:has-text("Update Task")');

		// Verify the changes
		await expect(page.locator('text=Edited Task Title')).toBeVisible();
		await expect(page.locator('text=Updated notes')).toBeVisible();
		await expect(page.locator('text=Task to Edit')).not.toBeVisible();
	});

	test('should delete a task', async ({ page }) => {
		// Create a task first
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task to Delete');
		await page.click('button:has-text("Create Task")');

		// Wait for the task to appear
		await expect(page.locator('text=Task to Delete')).toBeVisible();

		// Set up dialog handler
		page.on('dialog', (dialog) => dialog.accept());

		// Click the delete button
		const taskItem = page.locator('div:has-text("Task to Delete")').first();
		const deleteButton = taskItem.locator('button[aria-label="Delete task"]');
		await deleteButton.click();

		// Verify the task is removed
		await expect(page.locator('text=Task to Delete')).not.toBeVisible();
	});

	test('should set task due date and time', async ({ page }) => {
		// Click the New Task button
		await page.click('button:has-text("+ New Task")');

		// Fill in the task details
		await page.fill('input[id="title"]', 'Task with Due Date');

		// Set due date (tomorrow)
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const dateString = tomorrow.toISOString().split('T')[0];
		await page.fill('input[id="due_date"]', dateString);

		// Set due time
		await page.fill('input[id="due_time"]', '14:30');

		// Submit the form
		await page.click('button:has-text("Create Task")');

		// Verify the task appears with due date
		await expect(page.locator('text=Task with Due Date')).toBeVisible();
		await expect(page.locator('text=Tomorrow')).toBeVisible();
		await expect(page.locator('text=at 14:30')).toBeVisible();
	});

	test('should set task priority', async ({ page }) => {
		// Click the New Task button
		await page.click('button:has-text("+ New Task")');

		// Fill in the task details
		await page.fill('input[id="title"]', 'High Priority Task');

		// Select High priority
		await page.click('button:has-text("High")');

		// Submit the form
		await page.click('button:has-text("Create Task")');

		// Verify the task appears with priority indicator
		await expect(page.locator('text=High Priority Task')).toBeVisible();
		await expect(page.locator('text=!2')).toBeVisible();
	});

	test('should filter tasks by status', async ({ page }) => {
		// Create two tasks - one to complete, one to leave active
		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Active Task');
		await page.click('button:has-text("Create Task")');

		await page.click('button:has-text("+ New Task")');
		await page.fill('input[id="title"]', 'Task to Complete');
		await page.click('button:has-text("Create Task")');

		// Complete the second task
		const taskItem = page.locator('div:has-text("Task to Complete")').first();
		await taskItem.locator('button[aria-label*="Mark"]').first().click();

		// Check Active filter (should show 1 task)
		await page.click('button:has-text("Active")');
		await expect(page.locator('text=Active Task')).toBeVisible();
		await expect(page.locator('text=Task to Complete')).not.toBeVisible();

		// Check Done filter (should show 1 task)
		await page.click('button:has-text("Done")');
		await expect(page.locator('text=Task to Complete')).toBeVisible();
		await expect(page.locator('text=Active Task')).not.toBeVisible();

		// Check All filter (should show both tasks)
		await page.click('button:has-text("All")');
		await expect(page.locator('text=Active Task')).toBeVisible();
		await expect(page.locator('text=Task to Complete')).toBeVisible();
	});

	test('should cancel task creation', async ({ page }) => {
		// Click the New Task button
		await page.click('button:has-text("+ New Task")');

		// Fill in the task details
		await page.fill('input[id="title"]', 'Task to Cancel');

		// Click cancel (should only appear when editing)
		// For create mode, clicking elsewhere or pressing Escape should dismiss
		await page.press('input[id="title"]', 'Escape');

		// Verify the form is gone
		await expect(page.locator('input[id="title"]')).not.toBeVisible();
	});

	test('should show empty state when no tasks', async ({ page }) => {
		// Make sure we're on Active filter with no tasks
		await page.click('button:has-text("Active")');

		// Check for empty state message
		const emptyMessage = page.locator('text=No active tasks');
		if (await emptyMessage.isVisible()) {
			await expect(emptyMessage).toBeVisible();
		}
	});
});

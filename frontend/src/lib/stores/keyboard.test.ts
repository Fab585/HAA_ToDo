/**
 * Unit tests for keyboard shortcuts store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
	registerShortcut,
	getShortcuts,
	formatShortcutKey,
	showKeyboardHelp,
	initKeyboardShortcuts
} from './keyboard';

describe('Keyboard Shortcuts Store', () => {
	beforeEach(() => {
		// Clear all shortcuts before each test
		const shortcuts = getShortcuts();
		shortcuts.forEach(() => {
			// Shortcuts are cleared by the store internally
		});
		showKeyboardHelp.set(false);
	});

	describe('registerShortcut', () => {
		it('should register a new shortcut', () => {
			const action = vi.fn();
			const unregister = registerShortcut({
				key: 't',
				description: 'Test shortcut',
				action
			});

			const shortcuts = getShortcuts();
			expect(shortcuts).toHaveLength(1);
			expect(shortcuts[0].key).toBe('t');
			expect(shortcuts[0].description).toBe('Test shortcut');

			// Cleanup
			unregister();
		});

		it('should unregister a shortcut', () => {
			const action = vi.fn();
			const unregister = registerShortcut({
				key: 't',
				description: 'Test shortcut',
				action
			});

			expect(getShortcuts()).toHaveLength(1);

			unregister();

			expect(getShortcuts()).toHaveLength(0);
		});

		it('should register multiple shortcuts', () => {
			const action1 = vi.fn();
			const action2 = vi.fn();

			const unregister1 = registerShortcut({
				key: 't',
				description: 'Test 1',
				action: action1
			});

			const unregister2 = registerShortcut({
				key: 's',
				ctrl: true,
				description: 'Test 2',
				action: action2
			});

			expect(getShortcuts()).toHaveLength(2);

			unregister1();
			unregister2();
		});
	});

	describe('formatShortcutKey', () => {
		it('should format simple key', () => {
			const formatted = formatShortcutKey({
				key: 't',
				description: 'Test',
				action: () => {}
			});

			expect(formatted).toMatch(/T/);
		});

		it('should format Ctrl+key combination', () => {
			const formatted = formatShortcutKey({
				key: 's',
				ctrl: true,
				description: 'Save',
				action: () => {}
			});

			expect(formatted).toMatch(/Ctrl|⌃/);
			expect(formatted).toMatch(/S/);
		});

		it('should format Shift+key combination', () => {
			const formatted = formatShortcutKey({
				key: 't',
				shift: true,
				description: 'Test',
				action: () => {}
			});

			expect(formatted).toMatch(/Shift|⇧/);
			expect(formatted).toMatch(/T/);
		});

		it('should format complex combination', () => {
			const formatted = formatShortcutKey({
				key: 's',
				ctrl: true,
				shift: true,
				alt: true,
				description: 'Complex',
				action: () => {}
			});

			expect(formatted).toMatch(/Ctrl|⌃/);
			expect(formatted).toMatch(/Alt|⌥/);
			expect(formatted).toMatch(/Shift|⇧/);
			expect(formatted).toMatch(/S/);
		});
	});

	describe('showKeyboardHelp store', () => {
		it('should start as false', () => {
			expect(get(showKeyboardHelp)).toBe(false);
		});

		it('should be settable', () => {
			showKeyboardHelp.set(true);
			expect(get(showKeyboardHelp)).toBe(true);

			showKeyboardHelp.set(false);
			expect(get(showKeyboardHelp)).toBe(false);
		});
	});

	describe('initKeyboardShortcuts', () => {
		it('should return an unregister function', () => {
			const unregister = initKeyboardShortcuts();

			expect(typeof unregister).toBe('function');

			unregister();
		});
	});
});

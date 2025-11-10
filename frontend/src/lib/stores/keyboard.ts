/**
 * Keyboard shortcuts manager
 */
import { writable } from 'svelte/store';

export interface KeyboardShortcut {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	meta?: boolean;
	description: string;
	action: () => void;
}

/**
 * Keyboard shortcuts help visibility
 */
export const showKeyboardHelp = writable(false);

/**
 * Active shortcuts registry
 */
let shortcuts: KeyboardShortcut[] = [];

/**
 * Register a keyboard shortcut
 */
export function registerShortcut(shortcut: KeyboardShortcut): () => void {
	shortcuts.push(shortcut);

	// Return unregister function
	return () => {
		shortcuts = shortcuts.filter((s) => s !== shortcut);
	};
}

/**
 * Get all registered shortcuts
 */
export function getShortcuts(): KeyboardShortcut[] {
	return [...shortcuts];
}

/**
 * Check if key event matches shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
	if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
		return false;
	}

	if (shortcut.ctrl && !event.ctrlKey) return false;
	if (shortcut.shift && !event.shiftKey) return false;
	if (shortcut.alt && !event.altKey) return false;
	if (shortcut.meta && !event.metaKey) return false;

	// If shortcut doesn't specify modifier but event has it (except Shift for letters)
	if (!shortcut.ctrl && event.ctrlKey) return false;
	if (!shortcut.alt && event.altKey) return false;
	if (!shortcut.meta && event.metaKey) return false;

	return true;
}

/**
 * Handle keyboard event
 */
export function handleKeyboardEvent(event: KeyboardEvent): boolean {
	// Skip if user is typing in an input/textarea
	const target = event.target as HTMLElement;
	if (
		target.tagName === 'INPUT' ||
		target.tagName === 'TEXTAREA' ||
		target.isContentEditable
	) {
		// Only allow certain shortcuts in input fields (like Escape)
		if (event.key !== 'Escape' && !event.ctrlKey && !event.metaKey) {
			return false;
		}
	}

	// Find matching shortcut
	for (const shortcut of shortcuts) {
		if (matchesShortcut(event, shortcut)) {
			event.preventDefault();
			shortcut.action();
			return true;
		}
	}

	return false;
}

/**
 * Format shortcut key for display
 */
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
	const parts: string[] = [];

	const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

	if (shortcut.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
	if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
	if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
	if (shortcut.meta) parts.push(isMac ? '⌘' : 'Win');

	// Format key
	let key = shortcut.key;
	if (key === ' ') key = 'Space';
	else if (key.length === 1) key = key.toUpperCase();

	parts.push(key);

	return parts.join(isMac ? '' : '+');
}

/**
 * Initialize keyboard shortcuts listener
 */
export function initKeyboardShortcuts(): () => void {
	const handler = (event: KeyboardEvent) => {
		handleKeyboardEvent(event);
	};

	window.addEventListener('keydown', handler);

	return () => {
		window.removeEventListener('keydown', handler);
	};
}

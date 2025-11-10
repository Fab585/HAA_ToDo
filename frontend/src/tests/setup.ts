/**
 * Vitest setup file
 * Runs before all tests
 */
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock IndexedDB for tests
const indexedDB = {
	open: () => ({
		onsuccess: null,
		onerror: null,
		result: {
			transaction: () => ({
				objectStore: () => ({
					get: () => ({ onsuccess: null }),
					put: () => ({ onsuccess: null }),
					delete: () => ({ onsuccess: null }),
					getAll: () => ({ onsuccess: null })
				})
			})
		}
	})
};

global.indexedDB = indexedDB as any;

// Mock fetch for API tests
global.fetch = async () =>
	({
		ok: true,
		status: 200,
		json: async () => ({}),
		text: async () => ''
	}) as Response;

// Mock WebSocket
global.WebSocket = class WebSocket {
	url: string;
	onopen: ((event: Event) => void) | null = null;
	onclose: ((event: CloseEvent) => void) | null = null;
	onmessage: ((event: MessageEvent) => void) | null = null;
	onerror: ((event: Event) => void) | null = null;

	constructor(url: string) {
		this.url = url;
	}

	send() {}
	close() {}
} as any;

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
	value: {
		register: async () => ({
			sync: {
				register: async () => {}
			}
		})
	},
	configurable: true
});

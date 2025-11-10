/**
 * Sync manager for offline-first task synchronization
 */
import { writable, derived, get } from 'svelte/store';
import { apiClient } from '../api/client';
import { createWSClient, type HABoardWSClient } from '../api/websocket';
import type { Task, Tag } from '../types/task';
import * as db from './db';

/**
 * Sync state
 */
export const isOnline = writable(navigator.onLine);
export const isSyncing = writable(false);
export const lastSyncTime = writable<number>(0);
export const syncError = writable<string | null>(null);

/**
 * Task and tag stores
 */
export const tasks = writable<Task[]>([]);
export const tags = writable<Tag[]>([]);

/**
 * Filtered tasks
 */
export const incompleteTasks = derived(tasks, ($tasks) =>
	$tasks.filter((t) => !t.completed).sort((a, b) => {
		// Sort by priority (high to low), then by due date
		if (a.priority !== b.priority) {
			return b.priority - a.priority;
		}
		if (a.due_date && b.due_date) {
			return a.due_date.localeCompare(b.due_date);
		}
		return 0;
	})
);

export const completedTasks = derived(tasks, ($tasks) =>
	$tasks.filter((t) => t.completed).sort((a, b) => {
		// Sort by completion date (newest first)
		if (a.completed_at && b.completed_at) {
			return b.completed_at.localeCompare(a.completed_at);
		}
		return 0;
	})
);

/**
 * WebSocket client
 */
let wsClient: HABoardWSClient | null = null;

/**
 * Initialize sync system
 */
export async function initSync(accessToken?: string): Promise<void> {
	// Initialize IndexedDB
	await db.initDB();

	// Load last sync time
	const lastSync = await db.getLastSyncTime();
	lastSyncTime.set(lastSync);

	// Load cached data from IndexedDB
	const [cachedTasks, cachedTags] = await Promise.all([db.getAllTasks(), db.getAllTags()]);

	tasks.set(cachedTasks);
	tags.set(cachedTags);

	// Set up online/offline event listeners
	window.addEventListener('online', handleOnline);
	window.addEventListener('offline', handleOffline);

	// Initialize WebSocket if online
	if (navigator.onLine && accessToken) {
		initWebSocket(accessToken);
	}

	// Initial sync if online
	if (navigator.onLine) {
		await syncWithServer();
	}
}

/**
 * Initialize WebSocket connection
 */
function initWebSocket(accessToken: string): void {
	wsClient = createWSClient(accessToken);

	wsClient.setHandlers({
		onConnected: () => {
			console.log('WebSocket connected');
			wsClient?.subscribe();
		},
		onDisconnected: () => {
			console.log('WebSocket disconnected');
		},
		onTaskCreated: async (task) => {
			console.log('Task created remotely:', task);
			// Add to local store and IndexedDB
			tasks.update((t) => [...t, task]);
			await db.saveTask(task);
		},
		onTaskUpdated: async (task) => {
			console.log('Task updated remotely:', task);
			// Update in local store and IndexedDB
			tasks.update((t) => t.map((item) => (item.id === task.id ? task : item)));
			await db.saveTask(task);
		},
		onTaskDeleted: async (taskId) => {
			console.log('Task deleted remotely:', taskId);
			// Remove from local store and IndexedDB
			tasks.update((t) => t.filter((item) => item.id !== taskId));
			await db.deleteTask(taskId);
		},
		onError: (error) => {
			console.error('WebSocket error:', error);
		}
	});

	wsClient.connect();
}

/**
 * Handle going online
 */
async function handleOnline(): Promise<void> {
	console.log('Device is online');
	isOnline.set(true);
	syncError.set(null);

	// Sync with server
	await syncWithServer();
}

/**
 * Handle going offline
 */
function handleOffline(): void {
	console.log('Device is offline');
	isOnline.set(false);
}

/**
 * Sync with server
 */
export async function syncWithServer(): Promise<void> {
	if (!navigator.onLine) {
		console.log('Cannot sync: offline');
		return;
	}

	isSyncing.set(true);
	syncError.set(null);

	try {
		// 1. Process outbox (send pending changes)
		await processOutbox();

		// 2. Fetch latest data from server
		const [serverTasks, serverTags] = await Promise.all([
			apiClient.listTasks({ limit: 1000 }),
			apiClient.listTags()
		]);

		// 3. Merge with local data (server wins for conflicts in MVP)
		tasks.set(serverTasks);
		tags.set(serverTags);

		// 4. Save to IndexedDB
		await Promise.all([db.saveTasks(serverTasks), db.saveTags(serverTags)]);

		// 5. Update last sync time
		const now = Date.now();
		lastSyncTime.set(now);
		await db.setLastSyncTime(now);

		console.log('Sync completed successfully');
	} catch (error) {
		console.error('Sync failed:', error);
		syncError.set(error instanceof Error ? error.message : 'Sync failed');
	} finally {
		isSyncing.set(false);
	}
}

/**
 * Process outbox (send pending changes to server)
 */
async function processOutbox(): Promise<void> {
	const outboxItems = await db.getOutboxItems();

	for (const item of outboxItems) {
		try {
			switch (item.action) {
				case 'create':
					await apiClient.createTask(item.data);
					break;
				case 'update':
					await apiClient.updateTask(item.taskId, item.data);
					break;
				case 'delete':
					await apiClient.deleteTask(item.taskId);
					break;
			}

			// Remove from outbox on success
			await db.removeFromOutbox(item.id);
		} catch (error) {
			console.error('Failed to process outbox item:', item, error);
			// Keep in outbox for retry
		}
	}
}

/**
 * Create task (offline-first)
 */
export async function createTask(data: Partial<Task>): Promise<Task> {
	const task: Task = {
		id: crypto.randomUUID(),
		title: data.title || '',
		notes: data.notes || null,
		due_date: data.due_date || null,
		due_time: data.due_time || null,
		priority: data.priority || 0,
		completed: false,
		completed_at: null,
		created_at: new Date().toISOString(),
		modified_at: new Date().toISOString(),
		device_id: 'web_client',
		version: 1,
		tags: data.tags || []
	};

	// Save locally
	tasks.update((t) => [...t, task]);
	await db.saveTask(task);

	// Queue for sync
	if (navigator.onLine) {
		try {
			const created = await apiClient.createTask(task);
			// Update with server version
			tasks.update((t) => t.map((item) => (item.id === task.id ? created : item)));
			await db.saveTask(created);
			return created;
		} catch (error) {
			console.error('Failed to create task on server:', error);
			// Add to outbox for later sync
			await db.addToOutbox('create', task.id, task);
			await registerBackgroundSync();
		}
	} else {
		// Add to outbox for later sync
		await db.addToOutbox('create', task.id, task);
		await registerBackgroundSync();
	}

	return task;
}

/**
 * Update task (offline-first)
 */
export async function updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
	const currentTasks = get(tasks);
	const existing = currentTasks.find((t) => t.id === id);

	if (!existing) {
		return null;
	}

	const updated: Task = {
		...existing,
		...data,
		modified_at: new Date().toISOString(),
		version: existing.version + 1
	};

	// Save locally
	tasks.update((t) => t.map((item) => (item.id === id ? updated : item)));
	await db.saveTask(updated);

	// Queue for sync
	if (navigator.onLine) {
		try {
			const serverUpdated = await apiClient.updateTask(id, data);
			// Update with server version
			tasks.update((t) => t.map((item) => (item.id === id ? serverUpdated : item)));
			await db.saveTask(serverUpdated);
			return serverUpdated;
		} catch (error) {
			console.error('Failed to update task on server:', error);
			// Add to outbox for later sync
			await db.addToOutbox('update', id, data);
			await registerBackgroundSync();
		}
	} else {
		// Add to outbox for later sync
		await db.addToOutbox('update', id, data);
		await registerBackgroundSync();
	}

	return updated;
}

/**
 * Delete task (offline-first)
 */
export async function deleteTask(id: string): Promise<void> {
	// Delete locally
	tasks.update((t) => t.filter((item) => item.id !== id));
	await db.deleteTask(id);

	// Queue for sync
	if (navigator.onLine) {
		try {
			await apiClient.deleteTask(id);
		} catch (error) {
			console.error('Failed to delete task on server:', error);
			// Add to outbox for later sync
			await db.addToOutbox('delete', id);
			await registerBackgroundSync();
		}
	} else {
		// Add to outbox for later sync
		await db.addToOutbox('delete', id);
		await registerBackgroundSync();
	}
}

/**
 * Toggle task completion (offline-first)
 */
export async function toggleTaskComplete(id: string): Promise<void> {
	const currentTasks = get(tasks);
	const task = currentTasks.find((t) => t.id === id);

	if (!task) {
		return;
	}

	const completed = !task.completed;
	const completed_at = completed ? new Date().toISOString() : null;

	await updateTask(id, { completed, completed_at });
}

/**
 * Register background sync for outbox processing
 */
async function registerBackgroundSync(): Promise<void> {
	if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
		try {
			const registration = await navigator.serviceWorker.ready;
			await registration.sync.register('haboard-sync');
			console.log('Background sync registered for outbox processing');
		} catch (error) {
			console.warn('Background sync registration failed:', error);
		}
	}
}

/**
 * Cleanup
 */
export function cleanup(): void {
	window.removeEventListener('online', handleOnline);
	window.removeEventListener('offline', handleOffline);

	if (wsClient) {
		wsClient.disconnect();
		wsClient = null;
	}
}

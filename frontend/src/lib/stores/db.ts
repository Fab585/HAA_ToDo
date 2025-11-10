/**
 * IndexedDB wrapper for offline task storage
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Task, Tag } from '../types/task';

/**
 * Database schema
 */
interface HABoardDB extends DBSchema {
	tasks: {
		key: string;
		value: Task;
		indexes: {
			'by-modified': string;
			'by-completed': number;
		};
	};
	tags: {
		key: string;
		value: Tag;
	};
	outbox: {
		key: string;
		value: {
			id: string;
			action: 'create' | 'update' | 'delete';
			taskId: string;
			data?: any;
			timestamp: number;
			retries: number;
		};
	};
	sync_state: {
		key: string;
		value: {
			key: string;
			last_sync: number;
		};
	};
}

const DB_NAME = 'haboard';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<HABoardDB> | null = null;

/**
 * Initialize database
 */
export async function initDB(): Promise<IDBPDatabase<HABoardDB>> {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await openDB<HABoardDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Tasks store
			if (!db.objectStoreNames.contains('tasks')) {
				const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
				taskStore.createIndex('by-modified', 'modified_at');
				taskStore.createIndex('by-completed', 'completed');
			}

			// Tags store
			if (!db.objectStoreNames.contains('tags')) {
				db.createObjectStore('tags', { keyPath: 'id' });
			}

			// Outbox for pending sync operations
			if (!db.objectStoreNames.contains('outbox')) {
				db.createObjectStore('outbox', { keyPath: 'id' });
			}

			// Sync state
			if (!db.objectStoreNames.contains('sync_state')) {
				db.createObjectStore('sync_state', { keyPath: 'key' });
			}
		}
	});

	return dbInstance;
}

/**
 * Get database instance
 */
export async function getDB(): Promise<IDBPDatabase<HABoardDB>> {
	if (!dbInstance) {
		return initDB();
	}
	return dbInstance;
}

/**
 * Task operations
 */

export async function getAllTasks(): Promise<Task[]> {
	const db = await getDB();
	return db.getAll('tasks');
}

export async function getTask(id: string): Promise<Task | undefined> {
	const db = await getDB();
	return db.get('tasks', id);
}

export async function saveTask(task: Task): Promise<void> {
	const db = await getDB();
	await db.put('tasks', task);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('tasks', 'readwrite');
	await Promise.all(tasks.map((task) => tx.store.put(task)));
	await tx.done;
}

export async function deleteTask(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('tasks', id);
}

export async function getIncompleteTasks(): Promise<Task[]> {
	const db = await getDB();
	const allTasks = await db.getAllFromIndex('tasks', 'by-completed', 0);
	return allTasks;
}

export async function getCompletedTasks(): Promise<Task[]> {
	const db = await getDB();
	const allTasks = await db.getAllFromIndex('tasks', 'by-completed', 1);
	return allTasks;
}

/**
 * Tag operations
 */

export async function getAllTags(): Promise<Tag[]> {
	const db = await getDB();
	return db.getAll('tags');
}

export async function saveTag(tag: Tag): Promise<void> {
	const db = await getDB();
	await db.put('tags', tag);
}

export async function saveTags(tags: Tag[]): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('tags', 'readwrite');
	await Promise.all(tags.map((tag) => tx.store.put(tag)));
	await tx.done;
}

/**
 * Outbox operations (for offline sync)
 */

export async function addToOutbox(
	action: 'create' | 'update' | 'delete',
	taskId: string,
	data?: any
): Promise<void> {
	const db = await getDB();
	const id = `${Date.now()}-${taskId}`;
	await db.put('outbox', {
		id,
		action,
		taskId,
		data,
		timestamp: Date.now(),
		retries: 0
	});
}

export async function getOutboxItems() {
	const db = await getDB();
	return db.getAll('outbox');
}

export async function removeFromOutbox(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('outbox', id);
}

export async function clearOutbox(): Promise<void> {
	const db = await getDB();
	await db.clear('outbox');
}

/**
 * Sync state operations
 */

export async function getLastSyncTime(): Promise<number> {
	const db = await getDB();
	const state = await db.get('sync_state', 'last_sync');
	return state?.last_sync || 0;
}

export async function setLastSyncTime(timestamp: number): Promise<void> {
	const db = await getDB();
	await db.put('sync_state', {
		key: 'last_sync',
		last_sync: timestamp
	});
}

/**
 * Clear all data (for logout/reset)
 */
export async function clearAllData(): Promise<void> {
	const db = await getDB();
	await Promise.all([
		db.clear('tasks'),
		db.clear('tags'),
		db.clear('outbox'),
		db.clear('sync_state')
	]);
}

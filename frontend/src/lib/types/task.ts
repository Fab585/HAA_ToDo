/**
 * Task model matching backend API
 */
export interface Task {
	id: string;
	title: string;
	notes?: string | null;
	due_date?: string | null;
	due_time?: string | null;
	priority: number; // 0=none, 1=low, 2=medium, 3=high
	completed: boolean;
	completed_at?: string | null;
	created_at: string;
	modified_at: string;
	device_id: string;
	version: number;
	tags: string[];
}

/**
 * Tag model matching backend API
 */
export interface Tag {
	id: string;
	name: string;
	color?: string | null;
	created_at: string;
}

/**
 * API request/response types
 */
export interface CreateTaskRequest {
	title: string;
	notes?: string;
	due_date?: string;
	due_time?: string;
	priority?: number;
	tags?: string[];
}

export interface UpdateTaskRequest {
	title?: string;
	notes?: string;
	due_date?: string;
	due_time?: string;
	priority?: number;
	completed?: boolean;
	tags?: string[];
}

export interface SearchTasksRequest {
	query: string;
	limit?: number;
}

export interface CreateTagRequest {
	name: string;
	color?: string;
}

/**
 * Priority levels
 */
export enum TaskPriority {
	None = 0,
	Low = 1,
	Medium = 2,
	High = 3
}

/**
 * Priority display names
 */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
	[TaskPriority.None]: 'None',
	[TaskPriority.Low]: 'Low',
	[TaskPriority.Medium]: 'Medium',
	[TaskPriority.High]: 'High'
};

/**
 * Priority colors (Tailwind classes)
 */
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
	[TaskPriority.None]: 'text-gray-500',
	[TaskPriority.Low]: 'text-blue-500',
	[TaskPriority.Medium]: 'text-yellow-500',
	[TaskPriority.High]: 'text-red-500'
};

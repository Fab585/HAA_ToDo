/**
 * HABoard API client
 */
import type {
	Task,
	Tag,
	CreateTaskRequest,
	UpdateTaskRequest,
	SearchTasksRequest,
	CreateTagRequest
} from '../types/task';

/**
 * API client configuration
 */
interface ApiConfig {
	baseUrl: string;
	accessToken?: string;
}

/**
 * API client for HABoard
 */
export class HABoardAPIClient {
	private config: ApiConfig;

	constructor(config: ApiConfig) {
		this.config = config;
	}

	/**
	 * Set access token for authentication
	 */
	setAccessToken(token: string) {
		this.config.accessToken = token;
	}

	/**
	 * Make authenticated request
	 */
	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.config.baseUrl}${endpoint}`;

		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (this.config.accessToken) {
			headers['Authorization'] = `Bearer ${this.config.accessToken}`;
		}

		const response = await fetch(url, {
			...options,
			headers
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({
				message: response.statusText
			}));
			throw new Error(error.message || `HTTP ${response.status}`);
		}

		// Handle 204 No Content
		if (response.status === 204) {
			return {} as T;
		}

		return response.json();
	}

	/**
	 * Task operations
	 */

	async listTasks(params?: {
		completed?: boolean;
		tag?: string;
		limit?: number;
		offset?: number;
	}): Promise<Task[]> {
		const searchParams = new URLSearchParams();

		if (params?.completed !== undefined) {
			searchParams.set('completed', params.completed.toString());
		}
		if (params?.tag) {
			searchParams.set('tag', params.tag);
		}
		if (params?.limit) {
			searchParams.set('limit', params.limit.toString());
		}
		if (params?.offset) {
			searchParams.set('offset', params.offset.toString());
		}

		const query = searchParams.toString();
		return this.request<Task[]>(`/api/haboard/tasks${query ? `?${query}` : ''}`);
	}

	async createTask(data: CreateTaskRequest): Promise<Task> {
		return this.request<Task>('/api/haboard/tasks', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async getTask(id: string): Promise<Task> {
		return this.request<Task>(`/api/haboard/tasks/${id}`);
	}

	async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
		return this.request<Task>(`/api/haboard/tasks/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async deleteTask(id: string): Promise<void> {
		await this.request<void>(`/api/haboard/tasks/${id}`, {
			method: 'DELETE'
		});
	}

	async completeTask(id: string, completed: boolean = true): Promise<Task> {
		return this.request<Task>(`/api/haboard/tasks/${id}/complete`, {
			method: 'POST',
			body: JSON.stringify({ completed })
		});
	}

	async searchTasks(params: SearchTasksRequest): Promise<Task[]> {
		return this.request<Task[]>('/api/haboard/tasks/search', {
			method: 'POST',
			body: JSON.stringify(params)
		});
	}

	/**
	 * Tag operations
	 */

	async listTags(): Promise<Tag[]> {
		return this.request<Tag[]>('/api/haboard/tags');
	}

	async createTag(data: CreateTagRequest): Promise<Tag> {
		return this.request<Tag>('/api/haboard/tags', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}
}

/**
 * Default API client instance
 */
export const apiClient = new HABoardAPIClient({
	baseUrl: typeof window !== 'undefined' ? window.location.origin : ''
});

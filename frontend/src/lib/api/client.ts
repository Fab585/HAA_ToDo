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
 * API Error with additional context
 */
export class APIError extends Error {
	constructor(
		message: string,
		public status?: number,
		public retryable: boolean = false
	) {
		super(message);
		this.name = 'APIError';
	}
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API client for HABoard
 */
export class HABoardAPIClient {
	private config: ApiConfig;
	private maxRetries = 3;
	private retryDelay = 1000; // Initial delay in ms

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
	 * Check if error is retryable
	 */
	private isRetryable(status?: number): boolean {
		// Retry on network errors (no status) or specific HTTP status codes
		if (!status) return true; // Network error
		if (status >= 500 && status < 600) return true; // Server errors
		if (status === 429) return true; // Rate limit
		if (status === 408) return true; // Request timeout
		return false;
	}

	/**
	 * Make authenticated request with retry logic
	 */
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
		retryCount = 0
	): Promise<T> {
		const url = `${this.config.baseUrl}${endpoint}`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>)
		};

		if (this.config.accessToken) {
			headers['Authorization'] = `Bearer ${this.config.accessToken}`;
		}

		try {
			const response = await fetch(url, {
				...options,
				headers
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({
					message: response.statusText
				}));

				const apiError = new APIError(
					error.message || `HTTP ${response.status}`,
					response.status,
					this.isRetryable(response.status)
				);

				// Retry if retryable and we haven't exceeded max retries
				if (apiError.retryable && retryCount < this.maxRetries) {
					const delay = this.retryDelay * Math.pow(2, retryCount);
					console.log(`Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
					await sleep(delay);
					return this.request<T>(endpoint, options, retryCount + 1);
				}

				throw apiError;
			}

			// Handle 204 No Content
			if (response.status === 204) {
				return {} as T;
			}

			return response.json();
		} catch (error) {
			// Network error (fetch failed)
			if (error instanceof APIError) {
				throw error;
			}

			// Retry network errors
			if (retryCount < this.maxRetries) {
				const delay = this.retryDelay * Math.pow(2, retryCount);
				console.log(`Network error, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
				await sleep(delay);
				return this.request<T>(endpoint, options, retryCount + 1);
			}

			throw new APIError(
				error instanceof Error ? error.message : 'Network request failed',
				undefined,
				true
			);
		}
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

/**
 * WebSocket client for real-time task synchronization
 */
import type { Task } from '../types/task';

/**
 * WebSocket message types
 */
export type WSMessage =
	| { type: 'haboard/subscribe'; device_id?: string }
	| { type: 'haboard/unsubscribe' }
	| { type: 'haboard/ping' }
	| { type: 'haboard/task_created'; task: Task }
	| { type: 'haboard/task_updated'; task: Task }
	| { type: 'haboard/task_deleted'; task_id: string }
	| { type: 'haboard/pong' };

/**
 * WebSocket event handlers
 */
export interface WSHandlers {
	onTaskCreated?: (task: Task) => void;
	onTaskUpdated?: (task: Task) => void;
	onTaskDeleted?: (taskId: string) => void;
	onConnected?: () => void;
	onDisconnected?: () => void;
	onError?: (error: Error) => void;
}

/**
 * WebSocket client for HABoard
 */
export class HABoardWSClient {
	private ws: WebSocket | null = null;
	private url: string;
	private accessToken?: string;
	private handlers: WSHandlers = {};
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 10;
	private reconnectDelay = 1000; // Start with 1 second
	private pingInterval: ReturnType<typeof setInterval> | null = null;
	private messageId = 1;
	private authenticated = false;

	constructor(url: string, accessToken?: string) {
		this.url = url;
		this.accessToken = accessToken;
	}

	/**
	 * Set event handlers
	 */
	setHandlers(handlers: WSHandlers) {
		this.handlers = { ...this.handlers, ...handlers };
	}

	/**
	 * Connect to WebSocket
	 */
	connect() {
		if (this.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		try {
			this.ws = new WebSocket(this.url);

			this.ws.onopen = () => {
				console.log('WebSocket connected');
				this.reconnectAttempts = 0;
				this.reconnectDelay = 1000;

				// Authenticate with Home Assistant
				if (this.accessToken) {
					this.send({
						type: 'auth',
						access_token: this.accessToken
					} as any);
				}

				// Start ping interval (30 seconds)
				this.startPingInterval();
			};

			this.ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					this.handleMessage(message);
				} catch (err) {
					console.error('Failed to parse WebSocket message:', err);
				}
			};

			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
				this.handlers.onError?.(new Error('WebSocket error'));
			};

			this.ws.onclose = () => {
				console.log('WebSocket disconnected');
				this.authenticated = false;
				this.stopPingInterval();
				this.handlers.onDisconnected?.();
				this.scheduleReconnect();
			};
		} catch (err) {
			console.error('Failed to connect WebSocket:', err);
			this.scheduleReconnect();
		}
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		this.stopPingInterval();

		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	/**
	 * Subscribe to task updates
	 */
	subscribe(deviceId?: string) {
		if (!this.authenticated) {
			console.warn('Not authenticated, waiting...');
			return;
		}

		this.send({
			id: this.messageId++,
			type: 'haboard/subscribe',
			device_id: deviceId
		} as any);
	}

	/**
	 * Unsubscribe from task updates
	 */
	unsubscribe() {
		this.send({
			id: this.messageId++,
			type: 'haboard/unsubscribe'
		} as any);
	}

	/**
	 * Send message to server
	 */
	private send(message: any) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		}
	}

	/**
	 * Handle incoming message
	 */
	private handleMessage(message: any) {
		// Handle auth response
		if (message.type === 'auth_ok') {
			this.authenticated = true;
			this.handlers.onConnected?.();
			return;
		}

		// Handle events
		switch (message.type) {
			case 'haboard/task_created':
				this.handlers.onTaskCreated?.(message.task);
				break;

			case 'haboard/task_updated':
				this.handlers.onTaskUpdated?.(message.task);
				break;

			case 'haboard/task_deleted':
				this.handlers.onTaskDeleted?.(message.task_id);
				break;

			case 'haboard/pong':
				// Pong received, connection alive
				break;

			default:
				// Ignore unknown messages
				break;
		}
	}

	/**
	 * Schedule reconnection attempt
	 */
	private scheduleReconnect() {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('Max reconnect attempts reached');
			return;
		}

		this.reconnectAttempts++;
		const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

		console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, delay);
	}

	/**
	 * Start ping interval to keep connection alive
	 */
	private startPingInterval() {
		this.pingInterval = setInterval(() => {
			this.send({
				id: this.messageId++,
				type: 'haboard/ping'
			});
		}, 30000); // 30 seconds
	}

	/**
	 * Stop ping interval
	 */
	private stopPingInterval() {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}
}

/**
 * Create WebSocket client
 */
export function createWSClient(accessToken?: string): HABoardWSClient {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const url = `${protocol}//${window.location.host}/api/websocket`;

	return new HABoardWSClient(url, accessToken);
}

/**
 * Notification/Toast system for user feedback
 */
import { writable } from "svelte/store";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // Auto-dismiss after N milliseconds (0 = no auto-dismiss)
  timestamp: number;
}

/**
 * Notifications store
 */
export const notifications = writable<Notification[]>([]);

/**
 * Show a notification
 */
export function showNotification(
  type: NotificationType,
  message: string,
  duration: number = 5000
): string {
  const id = `${Date.now()}-${Math.random()}`;

  const notification: Notification = {
    id,
    type,
    message,
    duration,
    timestamp: Date.now(),
  };

  notifications.update((n) => [...n, notification]);

  // Auto-dismiss if duration > 0
  if (duration > 0) {
    setTimeout(() => {
      dismissNotification(id);
    }, duration);
  }

  return id;
}

/**
 * Dismiss a notification
 */
export function dismissNotification(id: string): void {
  notifications.update((n) => n.filter((notification) => notification.id !== id));
}

/**
 * Clear all notifications
 */
export function clearNotifications(): void {
  notifications.set([]);
}

/**
 * Convenience methods
 */
export function showSuccess(message: string, duration?: number): string {
  return showNotification("success", message, duration);
}

export function showError(message: string, duration?: number): string {
  return showNotification("error", message, duration || 8000); // Errors stay longer
}

export function showWarning(message: string, duration?: number): string {
  return showNotification("warning", message, duration);
}

export function showInfo(message: string, duration?: number): string {
  return showNotification("info", message, duration);
}

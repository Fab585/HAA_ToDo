/**
 * Unit tests for notifications store
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { get } from "svelte/store";
import {
  notifications,
  showNotification,
  dismissNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "./notifications";

describe("Notifications Store", () => {
  beforeEach(() => {
    // Clear all notifications before each test
    notifications.set([]);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("showNotification", () => {
    it("should add a notification", () => {
      showNotification("info", "Test message");

      const notifs = get(notifications);
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("info");
      expect(notifs[0].message).toBe("Test message");
    });

    it("should generate unique IDs for notifications", () => {
      showNotification("info", "Message 1");
      showNotification("info", "Message 2");

      const notifs = get(notifications);
      expect(notifs).toHaveLength(2);
      expect(notifs[0].id).not.toBe(notifs[1].id);
    });

    it("should include timestamp", () => {
      const beforeTime = Date.now();
      showNotification("info", "Test");
      const afterTime = Date.now();

      const notifs = get(notifications);
      expect(notifs[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(notifs[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should auto-dismiss after duration", () => {
      showNotification("info", "Test", 1000);

      expect(get(notifications)).toHaveLength(1);

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      expect(get(notifications)).toHaveLength(0);
    });

    it("should not auto-dismiss if duration is 0", () => {
      showNotification("info", "Test", 0);

      expect(get(notifications)).toHaveLength(1);

      // Fast-forward time
      vi.advanceTimersByTime(10000);

      // Should still be there
      expect(get(notifications)).toHaveLength(1);
    });

    it("should use default duration if not specified", () => {
      showNotification("info", "Test");

      expect(get(notifications)).toHaveLength(1);

      // Default is 5000ms
      vi.advanceTimersByTime(4999);
      expect(get(notifications)).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(get(notifications)).toHaveLength(0);
    });
  });

  describe("dismissNotification", () => {
    it("should dismiss a specific notification", () => {
      const id1 = showNotification("info", "Message 1", 0);
      const id2 = showNotification("info", "Message 2", 0);

      expect(get(notifications)).toHaveLength(2);

      dismissNotification(id1);

      const notifs = get(notifications);
      expect(notifs).toHaveLength(1);
      expect(notifs[0].id).toBe(id2);
    });

    it("should do nothing if ID not found", () => {
      showNotification("info", "Test", 0);

      expect(get(notifications)).toHaveLength(1);

      dismissNotification("non-existent-id");

      expect(get(notifications)).toHaveLength(1);
    });
  });

  describe("Convenience functions", () => {
    it("showSuccess should create success notification", () => {
      showSuccess("Success!");

      const notifs = get(notifications);
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("success");
      expect(notifs[0].message).toBe("Success!");
    });

    it("showError should create error notification", () => {
      showError("Error!");

      const notifs = get(notifications);
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("error");
      expect(notifs[0].message).toBe("Error!");
    });

    it("showWarning should create warning notification", () => {
      showWarning("Warning!");

      const notifs = get(notifications);
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("warning");
      expect(notifs[0].message).toBe("Warning!");
    });

    it("showInfo should create info notification", () => {
      showInfo("Info!");

      const notifs = get(notifications);
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("info");
      expect(notifs[0].message).toBe("Info!");
    });

    it("convenience functions should accept custom duration", () => {
      showSuccess("Test", 2000);

      expect(get(notifications)).toHaveLength(1);

      vi.advanceTimersByTime(1999);
      expect(get(notifications)).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(get(notifications)).toHaveLength(0);
    });
  });

  describe("Multiple notifications", () => {
    it("should handle multiple notifications", () => {
      showSuccess("Success 1");
      showError("Error 1");
      showWarning("Warning 1");
      showInfo("Info 1");

      const notifs = get(notifications);
      expect(notifs).toHaveLength(4);
      expect(notifs.map((n) => n.type)).toEqual(["success", "error", "warning", "info"]);
    });

    it("should dismiss multiple notifications independently", () => {
      const id1 = showNotification("info", "Test 1", 1000);
      const id2 = showNotification("info", "Test 2", 2000);
      const id3 = showNotification("info", "Test 3", 3000);

      expect(get(notifications)).toHaveLength(3);

      vi.advanceTimersByTime(1000);
      expect(get(notifications)).toHaveLength(2);

      vi.advanceTimersByTime(1000);
      expect(get(notifications)).toHaveLength(1);

      vi.advanceTimersByTime(1000);
      expect(get(notifications)).toHaveLength(0);
    });
  });
});

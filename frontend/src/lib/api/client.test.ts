/**
 * Unit tests for HABoard API client
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HABoardAPIClient, APIError } from "./client";
import type { Task, CreateTaskRequest } from "../types/task";

describe("HABoard API Client", () => {
  let client: HABoardAPIClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    client = new HABoardAPIClient({ baseUrl: "http://localhost:8123" });
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Constructor", () => {
    it("should create client with baseUrl", () => {
      const testClient = new HABoardAPIClient({ baseUrl: "http://test.com" });
      expect(testClient).toBeInstanceOf(HABoardAPIClient);
    });

    it("should create client with access token", () => {
      const testClient = new HABoardAPIClient({
        baseUrl: "http://test.com",
        accessToken: "test-token",
      });
      expect(testClient).toBeInstanceOf(HABoardAPIClient);
    });
  });

  describe("setAccessToken", () => {
    it("should set access token", async () => {
      client.setAccessToken("new-token");

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      });

      await client.listTasks();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer new-token",
          }),
        })
      );
    });
  });

  describe("Task operations", () => {
    describe("listTasks", () => {
      it("should fetch tasks without params", async () => {
        const mockTasks: Task[] = [
          {
            id: "1",
            title: "Test Task",
            completed: false,
            priority: 0,
            tags: [],
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            device_id: "test-device",
            version: 1,
          },
        ];

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockTasks,
        });

        const tasks = await client.listTasks();

        expect(tasks).toEqual(mockTasks);
        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost:8123/api/haboard/tasks",
          expect.any(Object)
        );
      });

      it("should fetch tasks with completed filter", async () => {
        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => [],
        });

        await client.listTasks({ completed: true });

        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost:8123/api/haboard/tasks?completed=true",
          expect.any(Object)
        );
      });

      it("should fetch tasks with multiple params", async () => {
        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => [],
        });

        await client.listTasks({
          completed: false,
          tag: "important",
          limit: 10,
          offset: 20,
        });

        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost:8123/api/haboard/tasks?completed=false&tag=important&limit=10&offset=20",
          expect.any(Object)
        );
      });
    });

    describe("createTask", () => {
      it("should create a task", async () => {
        const taskData: CreateTaskRequest = {
          title: "New Task",
          priority: 1,
          tags: ["test"],
        };

        const mockResponse: Task = {
          id: "1",
          title: taskData.title,
          notes: taskData.notes,
          due_date: taskData.due_date,
          due_time: taskData.due_time,
          priority: taskData.priority ?? 0,
          completed: false,
          tags: taskData.tags || [],
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          device_id: "test-device",
          version: 1,
        };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        const task = await client.createTask(taskData);

        expect(task).toEqual(mockResponse);
        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost:8123/api/haboard/tasks",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify(taskData),
          })
        );
      });
    });

    describe("updateTask", () => {
      it("should update a task", async () => {
        const updateData = { title: "Updated Task" };
        const mockResponse: Task = {
          id: "1",
          title: "Updated Task",
          completed: false,
          priority: 0,
          tags: [],
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          device_id: "test-device",
          version: 1,
        };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        const task = await client.updateTask("1", updateData);

        expect(task).toEqual(mockResponse);
        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost:8123/api/haboard/tasks/1",
          expect.objectContaining({
            method: "PUT",
            body: JSON.stringify(updateData),
          })
        );
      });
    });

    describe("deleteTask", () => {
      it("should delete a task", async () => {
        fetchMock.mockResolvedValue({
          ok: true,
          status: 204,
        });

        await client.deleteTask("1");

        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost:8123/api/haboard/tasks/1",
          expect.objectContaining({
            method: "DELETE",
          })
        );
      });
    });

    describe("completeTask", () => {
      it("should mark task as complete", async () => {
        const mockResponse: Task = {
          id: "1",
          title: "Task",
          completed: true,
          priority: 0,
          tags: [],
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          device_id: "test-device",
          version: 1,
        };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        const task = await client.completeTask("1");

        expect(task.completed).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost:8123/api/haboard/tasks/1/complete",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ completed: true }),
          })
        );
      });

      it("should mark task as incomplete", async () => {
        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({}),
        });

        await client.completeTask("1", false);

        expect(fetchMock).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ completed: false }),
          })
        );
      });
    });
  });

  describe("Error handling", () => {
    it("should throw APIError on HTTP error", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: "Invalid request" }),
      });

      await expect(client.listTasks()).rejects.toThrow(APIError);
      await expect(client.listTasks()).rejects.toThrow("Invalid request");
    });

    it("should handle network errors", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"));

      const promise = client.listTasks();

      // Advance timers for all retries
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(APIError);
    });

    it("should mark 5xx errors as retryable", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ message: "Server error" }),
      });

      const promise = client.listTasks();

      // Advance timers for all retries
      await vi.runAllTimersAsync();

      try {
        await promise;
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).retryable).toBe(true);
      }
    });

    it("should mark 4xx errors as non-retryable", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: "Bad request" }),
      });

      try {
        await client.listTasks();
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).retryable).toBe(false);
      }
    });

    it("should retry on retryable errors", async () => {
      let callCount = 0;

      fetchMock.mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return {
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: async () => ({ message: "Server error" }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => [],
        };
      });

      const promise = client.listTasks();

      // Advance timers for retries
      await vi.runAllTimersAsync();

      const tasks = await promise;

      expect(tasks).toEqual([]);
      // Initial call (1) + 2 retries = 3 total calls
      expect(callCount).toBe(3);
    });

    it("should give up after max retries", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ message: "Server error" }),
      });

      const promise = client.listTasks();

      // Advance timers for all retries
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(APIError);

      // Should be called 4 times (initial + 3 retries)
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });
  });

  describe("Tag operations", () => {
    it("should list tags", async () => {
      const mockTags = [
        { id: "1", name: "Tag 1", color: "#ff0000" },
        { id: "2", name: "Tag 2", color: "#00ff00" },
      ];

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTags,
      });

      const tags = await client.listTags();

      expect(tags).toEqual(mockTags);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8123/api/haboard/tags",
        expect.any(Object)
      );
    });

    it("should create a tag", async () => {
      const tagData = { name: "New Tag", color: "#0000ff" };
      const mockResponse = { id: "1", ...tagData };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const tag = await client.createTag(tagData);

      expect(tag).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8123/api/haboard/tags",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(tagData),
        })
      );
    });
  });
});

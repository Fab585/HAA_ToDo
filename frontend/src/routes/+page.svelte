<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import TaskForm from "$lib/components/TaskForm.svelte";
  import TaskItem from "$lib/components/TaskItem.svelte";
  import TagManager from "$lib/components/TagManager.svelte";
  import KeyboardHelp from "$lib/components/KeyboardHelp.svelte";
  import {
    tasks,
    incompleteTasks,
    completedTasks,
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    initSync,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    syncWithServer,
    cleanup,
  } from "$lib/stores/sync";
  import { registerShortcut, showKeyboardHelp, initKeyboardShortcuts } from "$lib/stores/keyboard";
  import type { Task } from "$lib/types/task";

  let showCreateForm = false;
  let editingTask: Task | null = null;
  let showTagManager = false;
  let filter: "all" | "active" | "completed" = "active";
  let searchQuery = "";
  let loading = true;
  let searchInput: HTMLInputElement;
  let unregisterKeyboardListener: (() => void) | undefined;
  let unregisterShortcuts: (() => void)[] = [];

  // Initialize on mount
  onMount(async () => {
    try {
      // TODO: Get access token from Home Assistant auth
      await initSync();
    } catch (err) {
      console.error("Failed to initialize:", err);
    } finally {
      loading = false;
    }

    // Initialize keyboard shortcuts
    unregisterKeyboardListener = initKeyboardShortcuts();

    // Register application shortcuts
    unregisterShortcuts = [
      registerShortcut({
        key: "/",
        description: "Quick add new task",
        action: () => {
          if (!showCreateForm && !editingTask) {
            showCreateForm = true;
          }
        },
      }),
      registerShortcut({
        key: "n",
        description: "Create new task",
        action: () => {
          if (!showCreateForm && !editingTask) {
            showCreateForm = true;
          }
        },
      }),
      registerShortcut({
        key: "Escape",
        description: "Close modal or form",
        action: () => {
          if (showCreateForm) {
            showCreateForm = false;
          } else if (editingTask) {
            editingTask = null;
          } else if (showTagManager) {
            showTagManager = false;
          } else if ($showKeyboardHelp) {
            showKeyboardHelp.set(false);
          }
        },
      }),
      registerShortcut({
        key: "?",
        description: "Show keyboard shortcuts",
        action: () => {
          showKeyboardHelp.set(true);
        },
      }),
      registerShortcut({
        key: "s",
        ctrl: true,
        description: "Sync with server",
        action: () => {
          if ($isOnline && !$isSyncing) {
            syncWithServer();
          }
        },
      }),
      registerShortcut({
        key: "s",
        meta: true,
        description: "Sync with server",
        action: () => {
          if ($isOnline && !$isSyncing) {
            syncWithServer();
          }
        },
      }),
      registerShortcut({
        key: "k",
        ctrl: true,
        description: "Focus search",
        action: () => {
          searchInput?.focus();
        },
      }),
      registerShortcut({
        key: "k",
        meta: true,
        description: "Focus search",
        action: () => {
          searchInput?.focus();
        },
      }),
      registerShortcut({
        key: "t",
        description: "Open tag manager",
        action: () => {
          if (!showTagManager) {
            showTagManager = true;
          }
        },
      }),
      registerShortcut({
        key: "1",
        description: "Show active tasks",
        action: () => {
          filter = "active";
        },
      }),
      registerShortcut({
        key: "2",
        description: "Show completed tasks",
        action: () => {
          filter = "completed";
        },
      }),
      registerShortcut({
        key: "3",
        description: "Show all tasks",
        action: () => {
          filter = "all";
        },
      }),
    ];
  });

  onDestroy(() => {
    // Cleanup keyboard shortcuts
    unregisterKeyboardListener?.();
    unregisterShortcuts.forEach((unregister) => unregister());
    // Cleanup sync
    cleanup();
  });

  // Filtered tasks based on current filter
  $: filteredTasks = (() => {
    let result: Task[];

    switch (filter) {
      case "active":
        result = $incompleteTasks;
        break;
      case "completed":
        result = $completedTasks;
        break;
      default:
        result = $tasks;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  })();

  async function handleCreateTask(event: CustomEvent) {
    try {
      await createTask(event.detail);
      showCreateForm = false;
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  }

  async function handleUpdateTask(event: CustomEvent) {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, event.detail);
      editingTask = null;
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  }

  async function handleToggleTask(event: CustomEvent<string>) {
    try {
      await toggleTaskComplete(event.detail);
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  }

  async function handleEditTask(event: CustomEvent<string>) {
    const task = $tasks.find((t) => t.id === event.detail);
    if (task) {
      editingTask = task;
      showCreateForm = false;
    }
  }

  async function handleDeleteTask(event: CustomEvent<string>) {
    try {
      await deleteTask(event.detail);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  function formatLastSync(timestamp: number): string {
    if (!timestamp) return "Never";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  // Auto-refresh last sync time display
  let lastSyncDisplay = "";
  $: lastSyncDisplay = formatLastSync($lastSyncTime);
</script>

<svelte:head>
  <title>HABoard - Tasks</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <!-- Header -->
    <header class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">HABoard</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Home Assistant To-Do</p>
        </div>

        <!-- Status indicators -->
        <div class="flex items-center gap-3">
          <!-- Online/Offline indicator -->
          <div
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {$isOnline
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
          >
            <span class="w-2 h-2 rounded-full {$isOnline ? 'bg-green-500' : 'bg-red-500'}"></span>
            {$isOnline ? "Online" : "Offline"}
          </div>

          <!-- Tags button -->
          <button
            on:click={() => (showTagManager = true)}
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Manage tags"
          >
            <svg
              class="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </button>

          <!-- Sync button -->
          <button
            on:click={() => syncWithServer()}
            disabled={$isSyncing || !$isOnline}
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync now"
          >
            <svg
              class="w-5 h-5 text-gray-600 dark:text-gray-400 {$isSyncing ? 'animate-spin' : ''}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Sync status -->
      {#if $syncError}
        <div
          class="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg"
        >
          <p class="text-sm text-red-800 dark:text-red-200">{$syncError}</p>
        </div>
      {:else if $lastSyncTime}
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Last synced: {lastSyncDisplay}
        </p>
      {/if}
    </header>

    <main class="space-y-4">
      <!-- Search and filter -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-3">
        <!-- Search -->
        <div class="relative">
          <input
            type="text"
            bind:this={searchInput}
            bind:value={searchQuery}
            placeholder="Search tasks..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- Filter tabs -->
        <div class="flex gap-2">
          <button
            on:click={() => (filter = "active")}
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors {filter === 'active'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
          >
            Active ({$incompleteTasks.length})
          </button>
          <button
            on:click={() => (filter = "completed")}
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors {filter === 'completed'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
          >
            Done ({$completedTasks.length})
          </button>
          <button
            on:click={() => (filter = "all")}
            class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors {filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
          >
            All ({$tasks.length})
          </button>
        </div>
      </div>

      <!-- Create task button -->
      {#if !showCreateForm && !editingTask}
        <button
          on:click={() => (showCreateForm = true)}
          class="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          + New Task
        </button>
      {/if}

      <!-- Create/Edit form -->
      {#if showCreateForm}
        <TaskForm on:submit={handleCreateTask} on:cancel={() => (showCreateForm = false)} />
      {:else if editingTask}
        <TaskForm
          task={editingTask}
          isEditing={true}
          on:submit={handleUpdateTask}
          on:cancel={() => (editingTask = null)}
        />
      {/if}

      <!-- Task list -->
      {#if loading}
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      {:else if filteredTasks.length === 0}
        <div class="text-center py-12">
          {#if searchQuery}
            <p class="text-gray-500 dark:text-gray-400 text-lg">
              No tasks found matching "{searchQuery}"
            </p>
          {:else if filter === "active"}
            <p class="text-gray-500 dark:text-gray-400 text-lg">
              No active tasks. You're all caught up! 🎉
            </p>
          {:else if filter === "completed"}
            <p class="text-gray-500 dark:text-gray-400 text-lg">No completed tasks yet.</p>
          {:else}
            <p class="text-gray-500 dark:text-gray-400 text-lg">
              No tasks yet. Create your first task!
            </p>
          {/if}
        </div>
      {:else}
        <div class="space-y-2">
          {#each filteredTasks as task (task.id)}
            <TaskItem
              {task}
              on:toggle={handleToggleTask}
              on:edit={handleEditTask}
              on:delete={handleDeleteTask}
            />
          {/each}
        </div>
      {/if}
    </main>
  </div>
</div>

<!-- Tag Manager Modal -->
{#if showTagManager}
  <TagManager on:close={() => (showTagManager = false)} on:tagCreated={() => {}} />
{/if}

<!-- Keyboard Shortcuts Help -->
<KeyboardHelp />

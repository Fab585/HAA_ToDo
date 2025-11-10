<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import type { Task } from '$lib/types/task';

	let tasks: Task[] = [];
	let loading = true;
	let error: string | null = null;

	// Load tasks on mount
	onMount(async () => {
		try {
			tasks = await apiClient.listTasks({ completed: false });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load tasks';
			console.error('Error loading tasks:', err);
		} finally {
			loading = false;
		}
	});

	async function toggleComplete(task: Task) {
		try {
			const updated = await apiClient.completeTask(task.id, !task.completed);
			// Update local state
			tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
		} catch (err) {
			console.error('Error toggling task:', err);
		}
	}
</script>

<svelte:head>
	<title>HABoard - Tasks</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<header class="mb-8">
		<h1 class="text-4xl font-bold text-gray-900 dark:text-white">HABoard</h1>
		<p class="text-gray-600 dark:text-gray-400 mt-2">Your Home Assistant To-Do App</p>
	</header>

	<main>
		{#if loading}
			<div class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		{:else if error}
			<div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
				<p class="text-red-800 dark:text-red-200">{error}</p>
			</div>
		{:else if tasks.length === 0}
			<div class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400 text-lg">No tasks yet. Create your first task!</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each tasks as task (task.id)}
					<div
						class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow"
					>
						<div class="flex items-start gap-3">
							<button
								on:click={() => toggleComplete(task)}
								class="mt-1 flex-shrink-0 w-5 h-5 border-2 rounded {task.completed
									? 'bg-blue-500 border-blue-500'
									: 'border-gray-300 dark:border-gray-600'}"
								aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
							>
								{#if task.completed}
									<svg class="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</button>

							<div class="flex-1 min-w-0">
								<h3
									class="text-lg font-medium {task.completed
										? 'line-through text-gray-500 dark:text-gray-500'
										: 'text-gray-900 dark:text-white'}"
								>
									{task.title}
								</h3>

								{#if task.notes}
									<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
										{task.notes}
									</p>
								{/if}

								<div class="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
									{#if task.due_date}
										<span class="flex items-center gap-1">
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											{task.due_date}
										</span>
									{/if}

									{#if task.tags.length > 0}
										<div class="flex gap-1">
											{#each task.tags as tag}
												<span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
													{tag}
												</span>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

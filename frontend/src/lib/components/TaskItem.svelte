<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Task } from '$lib/types/task';
	import { PRIORITY_COLORS } from '$lib/types/task';
	import { tags } from '$lib/stores/sync';

	export let task: Task;

	const dispatch = createEventDispatcher<{
		toggle: string;
		edit: string;
		delete: string;
	}>();

	let isSwipingLeft = false;
	let isSwipingRight = false;
	let touchStartX = 0;
	let touchCurrentX = 0;
	let swipeThreshold = 80;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchCurrentX = touchStartX;
	}

	function handleTouchMove(e: TouchEvent) {
		touchCurrentX = e.touches[0].clientX;
		const diff = touchCurrentX - touchStartX;

		// Swipe right to complete
		if (diff > 10) {
			isSwipingRight = true;
			isSwipingLeft = false;
		}
		// Swipe left to delete
		else if (diff < -10) {
			isSwipingLeft = true;
			isSwipingRight = false;
		}
	}

	function handleTouchEnd() {
		const diff = touchCurrentX - touchStartX;

		// Swipe right to complete (threshold: 80px)
		if (diff > swipeThreshold && isSwipingRight) {
			dispatch('toggle', task.id);
		}
		// Swipe left to delete (threshold: -80px)
		else if (diff < -swipeThreshold && isSwipingLeft) {
			if (confirm('Delete this task?')) {
				dispatch('delete', task.id);
			}
		}

		// Reset
		isSwipingLeft = false;
		isSwipingRight = false;
		touchStartX = 0;
		touchCurrentX = 0;
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (date.toDateString() === tomorrow.toDateString()) {
			return 'Tomorrow';
		} else {
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
	}

	function isOverdue(task: Task): boolean {
		if (!task.due_date || task.completed) return false;
		const dueDate = new Date(task.due_date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return dueDate < today;
	}

	$: overdue = isOverdue(task);
</script>

<div
	class="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all overflow-hidden {overdue
		? 'border-l-4 border-red-500'
		: ''}"
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
	transition:fly={{ y: 20, duration: 300, easing: quintOut }}
>
	<!-- Swipe backgrounds -->
	{#if isSwipingRight}
		<div class="absolute inset-0 bg-green-500 flex items-center justify-start px-4" transition:fade={{ duration: 150 }}>
			<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>
	{/if}
	{#if isSwipingLeft}
		<div class="absolute inset-0 bg-red-500 flex items-center justify-end px-4" transition:fade={{ duration: 150 }}>
			<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
				/>
			</svg>
		</div>
	{/if}

	<!-- Task content -->
	<div class="relative bg-white dark:bg-gray-800 p-4">
		<div class="flex items-start gap-3">
			<!-- Checkbox -->
			<button
				on:click={() => dispatch('toggle', task.id)}
				class="mt-1 flex-shrink-0 w-6 h-6 border-2 rounded-full {task.completed
					? 'bg-green-500 border-green-500'
					: 'border-gray-300 dark:border-gray-600 hover:border-green-400'} transition-colors"
				aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
			>
				{#if task.completed}
					<svg class="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>

			<!-- Content -->
			<div class="flex-1 min-w-0">
				<!-- Title and priority -->
				<div class="flex items-start gap-2">
					<h3
						class="flex-1 text-lg font-medium {task.completed
							? 'line-through text-gray-400 dark:text-gray-500'
							: 'text-gray-900 dark:text-white'}"
					>
						{task.title}
					</h3>
					{#if task.priority > 0}
						<span
							class="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded {PRIORITY_COLORS[
								task.priority
							]}"
						>
							!{task.priority}
						</span>
					{/if}
				</div>

				<!-- Notes -->
				{#if task.notes}
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
						{task.notes}
					</p>
				{/if}

				<!-- Metadata -->
				<div class="flex items-center gap-4 mt-2 text-sm">
					<!-- Due date -->
					{#if task.due_date}
						<span
							class="flex items-center gap-1 {overdue
								? 'text-red-600 dark:text-red-400 font-semibold'
								: 'text-gray-500 dark:text-gray-400'}"
						>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							{formatDate(task.due_date)}
							{#if task.due_time}
								at {task.due_time.substring(0, 5)}
							{/if}
						</span>
					{/if}

					<!-- Tags -->
					{#if task.tags.length > 0}
						<div class="flex gap-1 flex-wrap">
							{#each task.tags as tagName}
								{@const tagInfo = $tags.find((t) => t.name === tagName)}
								<span
									class="px-2 py-0.5 rounded-full text-xs text-white font-medium"
									style="background-color: {tagInfo?.color || '#3b82f6'}"
								>
									{tagName}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Actions menu -->
			<div class="flex-shrink-0">
				<button
					on:click={() => dispatch('edit', task.id)}
					class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
					aria-label="Edit task"
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Task } from '$lib/types/task';
	import { TaskPriority, PRIORITY_LABELS } from '$lib/types/task';
	import { tags } from '$lib/stores/sync';

	export let task: Task | null = null;
	export let isEditing = false;

	const dispatch = createEventDispatcher<{
		submit: Partial<Task>;
		cancel: void;
	}>();

	let title = task?.title || '';
	let notes = task?.notes || '';
	let due_date = task?.due_date || '';
	let due_time = task?.due_time || '';
	let priority = task?.priority || TaskPriority.None;
	let selectedTags: string[] = task?.tags || [];

	function handleSubmit() {
		if (!title.trim()) {
			return;
		}

		dispatch('submit', {
			title: title.trim(),
			notes: notes.trim() || null,
			due_date: due_date || null,
			due_time: due_time || null,
			priority,
			tags: selectedTags
		});

		// Reset form if creating new task
		if (!isEditing) {
			title = '';
			notes = '';
			due_date = '';
			due_time = '';
			priority = TaskPriority.None;
			selectedTags = [];
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-4">
	<!-- Title -->
	<div>
		<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			Task Title *
		</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			placeholder="What needs to be done?"
			required
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<!-- Notes -->
	<div>
		<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			Notes
		</label>
		<textarea
			id="notes"
			bind:value={notes}
			placeholder="Add details..."
			rows="3"
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
		/>
	</div>

	<!-- Due Date & Time -->
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="due_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Due Date
			</label>
			<input
				id="due_date"
				type="date"
				bind:value={due_date}
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<div>
			<label for="due_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Due Time
			</label>
			<input
				id="due_time"
				type="time"
				bind:value={due_time}
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>
	</div>

	<!-- Priority -->
	<div>
		<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
			Priority
		</label>
		<div class="flex gap-2">
			{#each Object.values(TaskPriority).filter((v) => typeof v === 'number') as p}
				<button
					type="button"
					on:click={() => (priority = p)}
					class="flex-1 px-3 py-2 rounded-lg border {priority === p
						? 'bg-blue-500 text-white border-blue-500'
						: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} hover:shadow transition-all"
				>
					{PRIORITY_LABELS[p]}
				</button>
			{/each}
		</div>
	</div>

	<!-- Tags -->
	{#if $tags.length > 0}
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Tags
			</label>
			<div class="flex flex-wrap gap-2">
				{#each $tags as tag}
					<button
						type="button"
						on:click={() => toggleTag(tag.name)}
						class="px-3 py-1 rounded-full text-sm {selectedTags.includes(tag.name)
							? 'bg-blue-500 text-white'
							: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:shadow transition-all"
					>
						{tag.name}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
		>
			{isEditing ? 'Update Task' : 'Create Task'}
		</button>
		{#if isEditing}
			<button
				type="button"
				on:click={handleCancel}
				class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
			>
				Cancel
			</button>
		{/if}
	</div>
</form>

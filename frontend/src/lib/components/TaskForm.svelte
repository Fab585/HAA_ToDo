<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Task } from '$lib/types/task';
	import { TaskPriority, PRIORITY_LABELS } from '$lib/types/task';
	import { tags } from '$lib/stores/sync';
	import { apiClient } from '$lib/api/client';
	import * as db from '$lib/stores/db';

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

	// Inline tag creation
	let showTagInput = false;
	let newTagName = '';
	let isCreatingTag = false;

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

	async function handleCreateTag() {
		const trimmedName = newTagName.trim();
		if (!trimmedName) return;

		// Check if tag already exists
		if ($tags.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
			selectedTags = [...selectedTags, trimmedName];
			newTagName = '';
			showTagInput = false;
			return;
		}

		isCreatingTag = true;
		try {
			const newTag = await apiClient.createTag({
				name: trimmedName,
				color: '#3b82f6'
			});

			tags.update((t) => [...t, newTag]);
			await db.saveTag(newTag);

			selectedTags = [...selectedTags, newTag.name];
			newTagName = '';
			showTagInput = false;
		} catch (err) {
			console.error('Failed to create tag:', err);
		} finally {
			isCreatingTag = false;
		}
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-4"
	transition:fly={{ y: -20, duration: 300, easing: quintOut }}
>
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
	<fieldset>
		<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
			Priority
		</legend>
		<div class="flex gap-2" role="group" aria-label="Task priority">
			{#each Object.values(TaskPriority).filter((v) => typeof v === 'number') as p}
				<button
					type="button"
					on:click={() => (priority = p)}
					class="flex-1 px-3 py-2 rounded-lg border {priority === p
						? 'bg-blue-500 text-white border-blue-500'
						: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} hover:shadow transition-all"
					aria-label="{PRIORITY_LABELS[p]} priority"
					aria-pressed={priority === p}
				>
					{PRIORITY_LABELS[p]}
				</button>
			{/each}
		</div>
	</fieldset>

	<!-- Tags -->
	<fieldset>
		<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
			Tags
		</legend>
		<div class="flex flex-wrap gap-2" role="group" aria-label="Task tags">
			{#each $tags as tag}
				<button
					type="button"
					on:click={() => toggleTag(tag.name)}
					class="px-3 py-1 rounded-full text-sm {selectedTags.includes(tag.name)
						? 'bg-blue-500 text-white'
						: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:shadow transition-all"
					aria-label="{tag.name} tag"
					aria-pressed={selectedTags.includes(tag.name)}
				>
					{tag.name}
				</button>
			{/each}

			<!-- Add new tag inline -->
			{#if showTagInput}
				<div class="flex items-center gap-1">
					<label for="new-tag-input" class="sr-only">New tag name</label>
					<input
						id="new-tag-input"
						type="text"
						bind:value={newTagName}
						placeholder="New tag"
						class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						on:keydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleCreateTag();
							} else if (e.key === 'Escape') {
								showTagInput = false;
								newTagName = '';
							}
						}}
						disabled={isCreatingTag}
					/>
					<button
						type="button"
						on:click={handleCreateTag}
						disabled={isCreatingTag || !newTagName.trim()}
						class="px-2 py-1 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50"
						aria-label="Create tag"
					>
						{isCreatingTag ? '...' : '✓'}
					</button>
					<button
						type="button"
						on:click={() => {
							showTagInput = false;
							newTagName = '';
						}}
						class="px-2 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600"
						aria-label="Cancel"
					>
						✕
					</button>
				</div>
			{:else}
				<button
					type="button"
					on:click={() => (showTagInput = true)}
					class="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-dashed border-gray-300 dark:border-gray-600"
					aria-label="Add new tag"
				>
					+ Add Tag
				</button>
			{/if}
		</div>
	</fieldset>

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

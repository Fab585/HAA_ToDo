<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { tags } from '$lib/stores/sync';
	import { apiClient } from '$lib/api/client';
	import * as db from '$lib/stores/db';

	const dispatch = createEventDispatcher<{
		close: void;
		tagCreated: string;
	}>();

	let newTagName = '';
	let newTagColor = '#3b82f6'; // Default blue
	let isCreating = false;
	let error = '';

	// Predefined color palette
	const colorPalette = [
		{ name: 'Blue', value: '#3b82f6' },
		{ name: 'Red', value: '#ef4444' },
		{ name: 'Green', value: '#10b981' },
		{ name: 'Yellow', value: '#f59e0b' },
		{ name: 'Purple', value: '#8b5cf6' },
		{ name: 'Pink', value: '#ec4899' },
		{ name: 'Indigo', value: '#6366f1' },
		{ name: 'Teal', value: '#14b8a6' },
		{ name: 'Orange', value: '#f97316' },
		{ name: 'Gray', value: '#6b7280' }
	];

	async function handleCreateTag() {
		const trimmedName = newTagName.trim();

		if (!trimmedName) {
			error = 'Tag name is required';
			return;
		}

		// Check if tag already exists
		if ($tags.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
			error = 'Tag already exists';
			return;
		}

		isCreating = true;
		error = '';

		try {
			// Create tag via API
			const newTag = await apiClient.createTag({
				name: trimmedName,
				color: newTagColor
			});

			// Update local store
			tags.update((t) => [...t, newTag]);

			// Save to IndexedDB
			await db.saveTag(newTag);

			// Dispatch event
			dispatch('tagCreated', newTag.name);

			// Reset form
			newTagName = '';
			newTagColor = '#3b82f6';
		} catch (err) {
			console.error('Failed to create tag:', err);
			error = err instanceof Error ? err.message : 'Failed to create tag';
		} finally {
			isCreating = false;
		}
	}

	async function handleDeleteTag(tagName: string) {
		if (!confirm(`Delete tag "${tagName}"? This will remove it from all tasks.`)) {
			return;
		}

		try {
			// TODO: Add API endpoint for deleting tags
			// For now, just remove from local store
			tags.update((t) => t.filter((tag) => tag.name !== tagName));
			await db.deleteTag(tagName);
		} catch (err) {
			console.error('Failed to delete tag:', err);
			error = err instanceof Error ? err.message : 'Failed to delete tag';
		}
	}

	function handleClose() {
		dispatch('close');
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white">Manage Tags</h2>
			<button
				on:click={handleClose}
				class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
				aria-label="Close"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4 space-y-6">
			<!-- Create New Tag -->
			<div class="space-y-3">
				<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Create New Tag</h3>

				<!-- Tag Name -->
				<input
					type="text"
					bind:value={newTagName}
					placeholder="Tag name"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					on:keydown={(e) => e.key === 'Enter' && handleCreateTag()}
				/>

				<!-- Color Picker -->
				<div>
					<label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Color</label>
					<div class="flex flex-wrap gap-2">
						{#each colorPalette as color}
							<button
								type="button"
								on:click={() => (newTagColor = color.value)}
								class="w-10 h-10 rounded-full border-2 transition-all {newTagColor === color.value
									? 'border-gray-900 dark:border-white scale-110'
									: 'border-gray-300 dark:border-gray-600 hover:scale-105'}"
								style="background-color: {color.value}"
								title={color.name}
								aria-label={color.name}
							/>
						{/each}
					</div>
				</div>

				<!-- Custom Color -->
				<div class="flex items-center gap-2">
					<input
						type="color"
						bind:value={newTagColor}
						class="w-12 h-10 rounded cursor-pointer"
						title="Custom color"
					/>
					<span class="text-xs text-gray-500 dark:text-gray-400">Custom color</span>
				</div>

				<!-- Error Message -->
				{#if error}
					<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
				{/if}

				<!-- Create Button -->
				<button
					on:click={handleCreateTag}
					disabled={isCreating || !newTagName.trim()}
					class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isCreating ? 'Creating...' : 'Create Tag'}
				</button>
			</div>

			<!-- Existing Tags -->
			{#if $tags.length > 0}
				<div class="space-y-2">
					<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Existing Tags</h3>
					<div class="space-y-2">
						{#each $tags as tag}
							<div
								class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
							>
								<div class="flex items-center gap-3">
									<div
										class="w-6 h-6 rounded-full"
										style="background-color: {tag.color || '#3b82f6'}"
									/>
									<span class="text-gray-900 dark:text-white font-medium">{tag.name}</span>
								</div>
								<button
									on:click={() => handleDeleteTag(tag.name)}
									class="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
									aria-label="Delete tag"
									title="Delete tag"
								>
									<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="text-center py-8">
					<p class="text-gray-500 dark:text-gray-400">No tags yet. Create your first tag!</p>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="p-4 border-t border-gray-200 dark:border-gray-700">
			<button
				on:click={handleClose}
				class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
			>
				Done
			</button>
		</div>
	</div>
</div>

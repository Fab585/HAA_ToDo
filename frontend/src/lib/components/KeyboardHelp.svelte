<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { showKeyboardHelp, getShortcuts, formatShortcutKey } from '$lib/stores/keyboard';

	$: shortcuts = getShortcuts();

	function close() {
		showKeyboardHelp.set(false);
	}

	// Group shortcuts by category
	$: groupedShortcuts = shortcuts.reduce(
		(acc, shortcut) => {
			const category = shortcut.description.includes('task')
				? 'Tasks'
				: shortcut.description.includes('search') || shortcut.description.includes('sync')
					? 'Navigation'
					: 'General';

			if (!acc[category]) acc[category] = [];
			acc[category].push(shortcut);
			return acc;
		},
		{} as Record<string, typeof shortcuts>
	);
</script>

{#if $showKeyboardHelp}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		on:click={close}
		transition:fade={{ duration: 200 }}
	>
		<!-- Modal -->
		<div
			class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
			on:click|stopPropagation
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
			>
				<div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Speed up your workflow with these shortcuts
					</p>
				</div>
				<button
					on:click={close}
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
					aria-label="Close"
				>
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
				{#if Object.keys(groupedShortcuts).length === 0}
					<p class="text-gray-500 dark:text-gray-400 text-center py-8">
						No keyboard shortcuts registered
					</p>
				{:else}
					<div class="space-y-6">
						{#each Object.entries(groupedShortcuts) as [category, categoryShortcuts]}
							<div>
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
									{category}
								</h3>
								<div class="space-y-2">
									{#each categoryShortcuts as shortcut}
										<div
											class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
										>
											<span class="text-gray-700 dark:text-gray-300">
												{shortcut.description}
											</span>
											<kbd
												class="px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
											>
												{formatShortcutKey(shortcut)}
											</kbd>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Tips -->
				<div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
					<div class="flex items-start gap-3">
						<svg
							class="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div class="text-sm text-blue-800 dark:text-blue-200">
							<p class="font-medium mb-1">Pro Tips:</p>
							<ul class="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
								<li>Press <kbd class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">?</kbd> anytime to view this help</li>
								<li>Press <kbd class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">Esc</kbd> to close modals</li>
								<li>Keyboard shortcuts work even when offline</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
				<button
					on:click={close}
					class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
				>
					Got it!
				</button>
			</div>
		</div>
	</div>
{/if}

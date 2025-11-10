<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';

	onMount(() => {
		// Register service worker for PWA
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js').catch((err) => {
				console.error('Service worker registration failed:', err);
			});
		}
	});
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<slot />
</div>

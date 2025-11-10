<script lang="ts">
	import { onMount } from 'svelte';
	import { syncWithServer } from '$lib/stores/sync';
	import '../app.css';

	onMount(() => {
		registerServiceWorker();
	});

	async function registerServiceWorker() {
		if (!('serviceWorker' in navigator)) {
			console.log('Service workers not supported');
			return;
		}

		try {
			// Register service worker
			const registration = await navigator.serviceWorker.register('/service-worker.js', {
				scope: '/'
			});

			console.log('Service worker registered:', registration.scope);

			// Check for updates periodically
			setInterval(() => {
				registration.update();
			}, 60000); // Check every minute

			// Handle updates
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							console.log('New service worker available, will activate on next page load');
							// TODO: Show update notification to user
						}
					});
				}
			});

			// Listen for messages from service worker
			navigator.serviceWorker.addEventListener('message', (event) => {
				console.log('Message from service worker:', event.data);

				if (event.data.type === 'BACKGROUND_SYNC' && event.data.action === 'start') {
					// Trigger sync when service worker requests it
					syncWithServer().catch((err) => {
						console.error('Background sync failed:', err);
					});
				}
			});

			// Register background sync if supported
			if ('sync' in registration) {
				try {
					await registration.sync.register('haboard-sync');
					console.log('Background sync registered');
				} catch (err) {
					console.warn('Background sync registration failed:', err);
				}
			}
		} catch (error) {
			console.error('Service worker registration failed:', error);
		}
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<slot />
</div>

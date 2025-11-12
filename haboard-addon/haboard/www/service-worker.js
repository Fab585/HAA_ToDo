/**
 * HABoard Service Worker
 * Provides offline-first PWA capabilities with background sync
 */

const CACHE_VERSION = "haboard-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Static assets to cache on install
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.png"];

/**
 * Install event - cache static assets
 */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached");
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old cache versions
              return name.startsWith("haboard-") && name !== STATIC_CACHE && name !== RUNTIME_CACHE;
            })
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache with network fallback
 * Strategy: Cache-first for static assets, network-first for API calls
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // API requests: Network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // WebSocket: Don't cache
  if (url.pathname.startsWith("/api/websocket")) {
    return;
  }

  // Static assets: Cache-first strategy
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Cache-first strategy
 * Serves from cache if available, falls back to network
 */
async function cacheFirstStrategy(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("[SW] Serving from cache:", request.url);
      return cachedResponse;
    }

    // Not in cache, fetch from network
    console.log("[SW] Fetching from network:", request.url);
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache-first strategy failed:", error);

    // Return offline page or basic error response
    return new Response("Offline - Content not available", {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({
        "Content-Type": "text/plain",
      }),
    });
  }
}

/**
 * Network-first strategy
 * Tries network first, falls back to cache if offline
 */
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);

    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("[SW] Serving stale content from cache");
      return cachedResponse;
    }

    // No cache available
    console.error("[SW] Network-first strategy failed:", error);
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
  }
}

/**
 * Background Sync event - sync outbox when connection restored
 */
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "haboard-sync") {
    event.waitUntil(syncOutbox());
  }
});

/**
 * Sync outbox with server
 */
async function syncOutbox() {
  try {
    console.log("[SW] Starting background sync...");

    // Notify all clients to trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC",
        action: "start",
      });
    });

    console.log("[SW] Background sync notification sent to clients");
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
    throw error; // Retry sync
  }
}

/**
 * Push notification event (placeholder for future implementation)
 */
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event.data?.text());

  // TODO: Display notification
  // const title = 'HABoard';
  // const options = {
  // 	body: event.data?.text() || 'New update',
  // 	icon: '/favicon.png',
  // 	badge: '/favicon.png'
  // };
  // event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Notification click event (placeholder for future implementation)
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  // TODO: Navigate to app
  // event.waitUntil(
  // 	clients.openWindow('/')
  // );
});

console.log("[SW] Service worker loaded");

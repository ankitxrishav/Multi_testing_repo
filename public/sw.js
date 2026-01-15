const CACHE_NAME = 'fenrir-study-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Network first, fall back to cache for document requests, cache first for static assets
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

// Timer Notification Logic
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TICK') {
        // We can trigger notifications here if needed, but 'TICK' usually comes from the client.
        // For persistent notifications, we might update an existing notification
        const { title, body, icon } = event.data.payload;
        self.registration.showNotification(title, {
            body,
            icon: icon || '/icon-192.png',
            tag: 'fenrir-timer', // Replaces existing notification with same tag
            silent: true, // Don't beep on every minute update
            renotify: false
        });
    } else if (event.data && event.data.type === 'COMPLETE') {
        self.registration.showNotification("Session Complete", {
            body: event.data.payload.body,
            icon: '/icon-192.png',
            tag: 'fenrir-timer',
            vibrate: [200, 100, 200],
            requireInteraction: true
        });
    }
});

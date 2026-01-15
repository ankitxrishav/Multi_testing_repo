const CACHE_NAME = 'fenrir-study-v2';
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
        const { title, body, icon } = event.data.payload;

        // Show/Update persistent notification
        self.registration.showNotification(title, {
            body,
            icon: icon || '/icon-192.png',
            tag: 'fenrir-timer', // Identifies this notification to replace it
            silent: true,      // Don't beep on every tick
            renotify: false,   // Don't vibrate on every tick
            badge: '/icon-192.png',
            vibrate: [],
            data: { url: '/' }
        });
    } else if (event.data && event.data.type === 'STOP_TIMER') {
        // Close the notification
        self.registration.getNotifications({ tag: 'fenrir-timer' }).then((notifications) => {
            notifications.forEach(notification => notification.close());
        });
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});

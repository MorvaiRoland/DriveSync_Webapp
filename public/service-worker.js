const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  STATIC: `static-${CACHE_VERSION}`,
  DYNAMIC: `dynamic-${CACHE_VERSION}`,
  API: `api-${CACHE_VERSION}`,
  IMAGES: `images-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/DynamicSense-logo.png',
  '/icon.png',
];

const API_ENDPOINTS = [
  'supabase',
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.warn('Some static assets failed to cache during install');
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHE_NAMES).includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: Network first for API calls
  if (API_ENDPOINTS.some((endpoint) => url.pathname.includes(endpoint))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const cache = caches.open(CACHE_NAMES.API);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline - Data not available', { status: 503 });
          });
        })
    );
    return;
  }

  // Strategy 2: Cache first for images
  if (request.destination === 'image') {
    event.respondWith(
      caches
        .match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200) {
                return response;
              }
              caches.open(CACHE_NAMES.IMAGES).then((cache) => {
                cache.put(request, response.clone());
              });
              return response;
            })
            .catch(() => {
              return caches.match('/DynamicSense-logo.png');
            });
        })
    );
    return;
  }

  // Strategy 3: Stale while revalidate for HTML/JS/CSS
  if (
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'style'
  ) {
    event.respondWith(
      caches
        .match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request).then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            const cache = caches.open(CACHE_NAMES.DYNAMIC);
            cache.then((c) => c.put(request, response.clone()));
            return response;
          });

          return cachedResponse || fetchPromise;
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match('/offline');
          }
          return null;
        })
    );
    return;
  }

  // Default: Network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        caches.open(CACHE_NAMES.DYNAMIC).then((cache) => {
          cache.put(request, response.clone());
        });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: 'DriveSync Notification',
        body: 'You have a new notification',
        icon: '/icon.png',
      };

  const options = {
    body: data.body,
    icon: data.icon || '/DynamicSense-logo.png',
    badge: '/icon.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'SYNC_DATA',
          });
        });
      })
    );
  }
});

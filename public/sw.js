// Service Worker for Jawala Business Directory
const CACHE_VERSION = '1.0.8'; // 👈 ONLY CHANGE THIS TO TRIGGER UPDATE
const CACHE_NAME = `jawala-business-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `jawala-runtime-v${CACHE_VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/jdlogo.png',
  // ❌ REMOVED CDN Tailwind - now it's bundled
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log(`🔧 Service Worker v${CACHE_VERSION} installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed, waiting for activation');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('❌ Cache failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log(`✅ Service Worker v${CACHE_VERSION} activated`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete any cache that doesn't match current version
            return name.startsWith('jawala-') && 
                   name !== CACHE_NAME && 
                   name !== RUNTIME_CACHE;
          })
          .map((name) => {
            console.log(`🗑️ Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log(`✨ Cache cleanup complete. Active caches: ${CACHE_NAME}, ${RUNTIME_CACHE}`);
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - Cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls (always need fresh data)
  if (url.origin.includes('supabase.co')) {
    return;
  }

  // Network-first for API and dynamic JS bundles
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('assets/') ||
      url.searchParams.has('import')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Clone and cache new resources
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle cache clear request
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('jawala-'))
            .map((name) => {
              console.log(`🗑️ Clearing cache: ${name}`);
              return caches.delete(name);
            })
        );
      }).then(() => {
        console.log('✅ All caches cleared');
        // Notify all clients that cache is cleared
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      })
    );
  }
  
  // Handle version check request
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Background sync for offline data submission (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-businesses') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(
      // Future: Implement offline data sync logic here
      Promise.resolve()
    );
  }
});

// Log current version on load
console.log(`📱 Service Worker version ${CACHE_VERSION} loaded`);

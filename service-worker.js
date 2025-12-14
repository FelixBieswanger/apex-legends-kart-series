const CACHE_NAME = 'apex-kart-v4';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './scripts.js',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-167.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png'
];

// External CDN resources to cache
const cdnResources = [
  'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Cache local resources first
        return cache.addAll(urlsToCache)
          .then(() => {
            // Try to cache CDN resources, but don't fail if they can't be fetched
            return Promise.allSettled(
              cdnResources.map(url => 
                fetch(url)
                  .then(response => {
                    if (response.ok) {
                      return cache.put(url, response);
                    }
                  })
                  .catch(() => console.log('Could not cache:', url))
              )
            );
          });
      })
      .catch((error) => {
        console.log('Cache addAll error:', error);
        // Don't fail installation if some resources fail to cache
        return Promise.resolve();
      })
  );
  self.skipWaiting();
});

// Fetch from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip Google Sheets API requests (always fetch fresh data)
  if (event.request.url.includes('docs.google.com/spreadsheets')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || !response.ok) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.log('Cache put error:', error);
            });
          
          return response;
        }).catch(() => {
          // Return offline page or fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Update service worker and clear old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

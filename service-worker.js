const CACHE_NAME = 'fuel-tracker-cache-v1';
// Add all local assets to the cache on install for robust offline support.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/BottomNav.tsx',
  '/components/FuelForm.tsx',
  '/components/HistoryList.tsx',
  '/components/Report.tsx',
  '/components/Settings.tsx',
  '/components/icons/HomeIcon.tsx',
  '/components/icons/ListIcon.tsx',
  '/components/icons/ChartIcon.tsx',
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/EditIcon.tsx',
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all core assets to the cache
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network and cache
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response.
            // We don't cache non-200 responses.
            // We also don't cache non-GET requests.
            if (!response || response.status !== 200 || event.request.method !== 'GET') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function() {
            // The fetch failed, probably because the user is offline.
            // Since the request is not in the cache, we can't do anything.
            // You could return a custom offline page here if you had one cached.
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Deleting old caches
          }
        })
      );
    })
  );
});

var CACHE_NAME = 'lipilab-v1.9.3';
var ASSETS = [
  './',
  './index.html',
  './app.js',
  './app.js?v=16',
  './styles.css',
  './styles.css?v=16',
  './partner.js',
  './partner.js?v=16',
  './favicon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(ASSETS.map(function (url) {
        return cache.add(url).catch(function () { return null; });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        return response;
      }).catch(function () {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return cached;
      });
    })
  );
});

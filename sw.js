var CACHE = 'lipilab-v76';
var PRECACHE = [
  './',
  'index.html',
  'styles.css?v=124',
  'app.js?v=61',
  'engine.js?v=1',
  'partner.js?v=14',
  'vendor/jszip.min.js',
  'manifest.json',
  'logo-full.svg?v=2',
  'favicon.svg?v=2',
  'favicon-32.png?v=2',
  'favicon-180.png?v=2',
  'favicon-512.png?v=2',
  'og-cover.png',
  'fonts/solaimanlipi-normal-v1.0.ttf',
  'fonts/solaimanlipi-bold-v1.0.ttf',
  'fonts/kalpurush.woff2',
  'fonts/noto-sans-bengali-1.woff2',
  'fonts/noto-sans-bengali-2.woff2',
  'fonts/noto-sans-bengali-3.woff2'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var isPage = req.mode === 'navigate' || url.pathname === '/' || /index\.html$/.test(url.pathname);
  if (isPage) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('index.html').then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      });
    })
  );
});

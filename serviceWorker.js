// Based off of https://github.com/ryandav/template-progressive-web-app

var dataCacheName = 'kord';
var cacheName = 'kord';
var filesToCache = [
  '/',
  './img',
  './img/icons',
  './img/icons/128.png',
  './img/icons/144.png',
  './img/icons/152.png',
  './img/icons/192.png',
  './img/icons/256.png',
  './img/gear.png',
  './img/sawWave.png',
  './img/sineWave.png',
  './img/squareWave.png',
  './img/triangleWave.png',
  './img/gear.png',
  './index.html',
  './manifest.json',
  './script.js',
  './serviceWorker.js',
  './styles.css',
  './submono.js',
  './subpoly.js',
];

var log = function(err) {
  console.log(err);
};

self.addEventListener('install', function(e) {
  // Install service worker
  e.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        // Cache app shell
        return cache.addAll(filesToCache);
      })
      .catch(log)
  );
});

self.addEventListener('activate', function(e) {
  // Activate service worker
  e.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== cacheName && key !== dataCacheName) {
            // Remove old cache
            return caches.delete(key);
          }
        }));
      })
      .catch(log)
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request)
      .then(function(response) {
        return response || fetch(e.request);
      })
      .catch(log)
  );
});

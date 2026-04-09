/* ================================================
   ANHQVdle — Service Worker
   ================================================ */

var CACHE_NAME = 'anhqvdle-v1';
var PRECACHE = [
  '/',
  '/index.html',
  '/clasico.html',
  '/frases.html',
  '/css/style.css',
  '/js/daily.js',
  '/js/utils.js',
  '/data/characters.js',
  '/data/quotes.js',
  '/img/edificio.png',
  '/img/favicon-32.png'
];

// Install: precache shell
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Activate: delete old caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  // Don't intercept Firebase/external requests
  if (e.request.url.indexOf('firebaseio.com') !== -1) return;
  if (e.request.url.indexOf('googleapis.com') !== -1) return;
  if (e.request.url.indexOf('gstatic.com') !== -1) return;

  e.respondWith(
    fetch(e.request).then(function (res) {
      var clone = res.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(e.request, clone);
      });
      return res;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});

// Push notifications
self.addEventListener('push', function (e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch(err) {}
  var title   = data.title   || 'ANHQVdle 🏠';
  var body    = data.body    || '¡El personaje de hoy ya está esperando! ¿Adivinas quién es?';
  var icon    = data.icon    || '/img/apple-touch-icon.png';
  var url     = data.url     || '/clasico.html';

  e.waitUntil(
    self.registration.showNotification(title, {
      body:  body,
      icon:  icon,
      badge: '/img/favicon-32.png',
      data:  { url: url },
      vibrate: [100, 50, 100]
    })
  );
});

// Notification click → open the game
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/clasico.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('anhqvdle.es') !== -1) {
          return list[i].focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

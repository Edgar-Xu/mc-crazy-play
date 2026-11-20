/* MC Crazy service worker: the app shell is cached at install so the phone, duel (vs AI), redstone labs and
   arcade work offline. Same-origin requests: cache first, refreshed in the background. Google Fonts:
   stale-while-revalidate. Old caches are removed when a new build activates. */
var CACHE = 'mccrazy-2.0.0-13ee7384e3';
var SHELL = ['./', 'index.html', 'duel.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('mccrazy-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url), font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !font) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(r, { ignoreSearch: !font }).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});

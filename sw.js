/* MC Crazy service worker. Pages (HTML) are network-first so a new release shows up on the next load;
   the cached copy is used only when offline. Other same-origin files: cache first, refreshed in the
   background. Google Fonts: stale-while-revalidate. Install bypasses the HTTP cache so a new build never
   pre-caches stale files; old caches are removed when a new build activates. */
var CACHE = 'mccrazy-2.1.1-87901db442';
var SHELL = ['./', 'index.html', 'duel.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(SHELL.map(function (u) { return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r.ok) return c.put(u, r); }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('mccrazy-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url), font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !font) return;
  var page = r.mode === 'navigate' || /\.html$|\/$/.test(u.pathname);
  e.respondWith(caches.open(CACHE).then(function (c) {
    if (page) return fetch(r, { cache: 'no-cache' }).then(function (res) { if (res && res.ok) c.put(r, res.clone()); return res; })
      .catch(function () { return c.match(r, { ignoreSearch: true }).then(function (hit) { return hit || c.match('index.html'); }); });
    return c.match(r, { ignoreSearch: !font }).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});

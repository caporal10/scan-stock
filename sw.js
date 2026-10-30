// Cache de l'appli pour fonctionner sans réseau. Version : 62232589
const CACHE = 'scanstock-62232589';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'vendor/xlsx.full.min.js', 'vendor/zxing.min.js', 'vendor/msal-browser.min.js', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (['microsoftonline', 'graph.microsoft', 'sharepoint', 'onedrive', 'live.com', '1drv'].some(h => url.host.includes(h))) return;
  if (req.mode === 'navigate') { // page : réseau d'abord pour avoir la dernière version, cache sinon
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && (url.origin === location.origin || url.host.endsWith('gstatic.com') || url.host.endsWith('googleapis.com'))) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});

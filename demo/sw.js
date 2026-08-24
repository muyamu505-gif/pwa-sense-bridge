const CACHE = 'pwa-sense-bridge-demo-v2';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './mingxia-bridge.js', '../src/sense-bridge.js', '../src/math.js'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))));

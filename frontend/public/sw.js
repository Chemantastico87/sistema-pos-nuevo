// VENDIX Service Worker - Cache-busting automático para garantizar código siempre actualizado
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Red directa a servidor para evitar caché obsoleto en navegación SPA
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

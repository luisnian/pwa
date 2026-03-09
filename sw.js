// Service Worker · COCINADECOR Calculadora Encimeras
const CACHE_NAME = 'cocinadecor-v1';

// Todos los archivos que necesita la app para funcionar offline
const ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png'
];

// Instalación: precarga todo en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando archivos...');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: elimina cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: sirve siempre desde caché (offline-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      // Si no está en caché, intenta red y guarda el resultado
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        // Sin red y sin caché: devuelve index.html como fallback
        return caches.match('./index.html');
      });
    })
  );
});

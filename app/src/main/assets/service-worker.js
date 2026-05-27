/* ==========================================================================
   FITNESS TRACKER - SERVICE WORKER (offline support)
   ========================================================================== */

const CACHE_NAME = "entrenamiento-tracker-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalar el Service Worker e intermediar el precacheo de recursos estáticos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("[Service Worker] Precachando archivos estáticos clave.");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar el Service Worker y purgar caches antiguos obsoletos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Purgando cache antigua obsoleta:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Red / Cache: Cache First con Network Fallback
self.addEventListener("fetch", event => {
  // Solo procesar peticiones locales GET
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Devolver desde caché local instantáneamente
          return cachedResponse;
        }

        // Si no está en cache, recuperamos de la red
        return fetch(event.request).then(networkResponse => {
          // Verificar respuesta válida antes de guardar en caché dinámica
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Fallback offline (por ejemplo si no hay red ni cache)
          return new Response("Contenido no disponible offline", {
            status: 503,
            statusText: "Service Unavailable"
          });
        });
      })
  );
});

// Service Worker para Tarjeta Digital PWA
// Version 1.0.0

const CACHE_NAME = 'tarjeta-digital-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Recursos críticos para cachear
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/pwa/icon_JE_192.png',
  '/assets/pwa/icon_JE_512.png',
  '/assets/pwa/apple-touch-icon-180x180.png',
  // Angular core files (se agregarán automáticamente durante el build)
];

// Recursos opcionales para cachear
const OPTIONAL_RESOURCES = [
  '/assets/imagen/og/tarjeta_digital.jpg',
  '/assets/pwa/icon_JE_512_maskable.png',
  '/assets/pwa/logo_JE_1024.png',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      try {
        // Cachear recursos críticos
        await cache.addAll(CRITICAL_RESOURCES);
        console.log('[SW] Critical resources cached successfully');
        
        // Cachear recursos opcionales (sin fallar si alguno no existe)
        await Promise.allSettled(
          OPTIONAL_RESOURCES.map(async (resource) => {
            try {
              await cache.add(resource);
              console.log(`[SW] Optional resource cached: ${resource}`);
            } catch (error) {
              console.warn(`[SW] Failed to cache optional resource: ${resource}`, error);
            }
          })
        );
        
        // Forzar la activación inmediata
        await self.skipWaiting();
        
      } catch (error) {
        console.error('[SW] Failed to cache critical resources:', error);
      }
    })()
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    (async () => {
      // Limpiar cachés antiguos
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
      
      // Tomar control de todas las pestañas abiertas
      await self.clients.claim();
      console.log('[SW] Service Worker activated and controlling all tabs');
    })()
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar extensiones del navegador y requests no HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Estrategia: Network First, luego Cache
        const networkResponse = await fetch(event.request, {
          timeout: 3000 // Timeout de 3 segundos
        });
        
        // Si la respuesta es exitosa, actualizarla en cache
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
        
      } catch (error) {
        console.log(`[SW] Network failed for ${event.request.url}, trying cache...`);
        
        // Si la red falla, buscar en cache
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si es una navegación y no hay cache, mostrar página offline
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        // Respuesta genérica de error para otros tipos de recursos
        return new Response(
          JSON.stringify({
            error: 'Recurso no disponible offline',
            url: event.request.url
          }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    })()
  );
});

// Manejar actualizaciones del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí puedes agregar lógica para sincronizar datos cuando vuelva la conexión
      console.log('[SW] Performing background sync...')
    );
  }
});

// Notificaciones Push (para futuras implementaciones)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización disponible',
    icon: '/assets/pwa/icon_JE_192.png',
    badge: '/assets/pwa/icon_JE_192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver tarjeta digital',
        icon: '/assets/pwa/icon_JE_192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/pwa/icon_JE_192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Tarjeta Digital', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Logging de errores
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker script loaded successfully');
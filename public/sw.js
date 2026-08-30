// Minimal service worker: cache-first for same-origin GET requests, so the
// app shell and its assets keep working after the first visit even with no
// connection. Falls back to the cached page for navigations so client-side
// routing (react-router) still works offline. Map tiles are cross-origin
// and intentionally not cached here — they still need a connection.
const CACHE = 'fixkarachi-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      if (cached) return cached
      try {
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      } catch {
        if (request.mode === 'navigate') return cache.match('/index.html')
        throw new Error('Offline and not cached: ' + request.url)
      }
    }),
  )
})

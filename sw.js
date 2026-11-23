/* Atlas Terrain — service worker
 * Garde une copie des fichiers dans le téléphone pour fonctionner en mode avion.
 * À CHAQUE ÉVOLUTION : augmenter le numéro de version ci-dessous (et APP_VERSION dans app.js),
 * sinon les téléphones continuent d'afficher l'ancienne version.
 */
const CACHE = 'atlas-terrain-v1.3';
const FICHIERS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((enCache) => {
      if (enCache) return enCache;
      return fetch(req).catch(() =>
        req.mode === 'navigate' ? caches.match('./index.html') : Response.error());
    }),
  );
});

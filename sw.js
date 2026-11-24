/* Park Builder offline shell. Versioned cache. No in-app purchases. */
const CACHE = 'park-builder-v5';
const SHELL = [
  './',
  './index.html',
  './gallery.html',
  './game.js',
  './tools.js',
  './liveops.js',
  './platform.js',
  './toolshop.js',
  './rewards.js',
  './shop.js',
  './money.js',
  './suno-player.js',
  './mother-order.js',
  './character.js',
  './net.js',
  './payments.config.js',
  './gallery.json',
  './manifest.webmanifest',
  './assets/logo.png',
  './assets/icon.png',
  './assets/icon-512.png',
  './assets/girl-1.png',
  './assets/girl-2.png',
  './assets/girl-3.png',
  './assets/girl-4.png',
  './assets/girl-5.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    } catch (err) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw err;
    }
  })());
});

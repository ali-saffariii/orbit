const VERSION = '3.1.0';
const CACHE_NAME = `orbit-finance-v${VERSION}`;
const CORE = [
  './',
  './index.html',
  `./styles.css?v=${VERSION}`,
  `./app.js?v=${VERSION}`,
  './manifest.webmanifest'
];
const OPTIONAL = [
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];
const NETWORK_TIMEOUT = 3500;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // فایل‌های اصلی باید کامل باشند؛ نبودنِ آیکون یا فونت نباید نصب را خراب کند.
    await cache.addAll(CORE);
    await Promise.allSettled(OPTIONAL.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('orbit-finance-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(request).then(response => { clearTimeout(timer); resolve(response); }, error => { clearTimeout(timer); reject(error); });
  });
}

async function store(request, response) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isShell = request.mode === 'navigate' || ['script', 'style', 'manifest'].includes(request.destination);

  if (isShell) {
    // ابتدا شبکه (برای دریافت نسخهٔ جدید)، اگر کند یا آفلاین بود از حافظهٔ پنهان.
    event.respondWith((async () => {
      try {
        const response = await fetchWithTimeout(request, NETWORK_TIMEOUT);
        if (response.ok && response.type === 'basic') {
          const copy = response.clone(); // پیش از بازگرداندن، کپی بگیر
          event.waitUntil(store(request, copy));
        }
        return response;
      } catch {
        const cached = await caches.match(request, { ignoreSearch: request.mode === 'navigate' });
        return cached || (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // تصویر و فونت: ابتدا حافظهٔ پنهان.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(store(request, copy));
    }
    return response;
  })());
});

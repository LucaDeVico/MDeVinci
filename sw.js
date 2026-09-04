/* Service worker: everything the app needs is cached on install,
   so it works with no network at all afterwards.
   The cache name carries the version from app-config.js — bump
   APP_CONFIG.VERSION there and every client picks up the new files. */
importScripts('app-config.js');

const CACHE = 'md-' + APP_CONFIG.NAME.toLowerCase() + '-v' + APP_CONFIG.VERSION;

const ASSETS = [
  "./",
  "index.html",
  "app-config.js",
  "manifest.json",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "vendor/marked.umd.js",
  "vendor/purify.min.js",
  "vendor/katex.min.js",
  "vendor/katex.min.css",
  "vendor/highlight.min.js",
  "vendor/hljs-github.min.css",
  "vendor/hljs-github-dark.min.css",
  "vendor/mermaid.min.js",
  "vendor/fonts/KaTeX_AMS-Regular.woff2",
  "vendor/fonts/KaTeX_Caligraphic-Bold.woff2",
  "vendor/fonts/KaTeX_Caligraphic-Regular.woff2",
  "vendor/fonts/KaTeX_Fraktur-Bold.woff2",
  "vendor/fonts/KaTeX_Fraktur-Regular.woff2",
  "vendor/fonts/KaTeX_Main-Bold.woff2",
  "vendor/fonts/KaTeX_Main-BoldItalic.woff2",
  "vendor/fonts/KaTeX_Main-Italic.woff2",
  "vendor/fonts/KaTeX_Main-Regular.woff2",
  "vendor/fonts/KaTeX_Math-BoldItalic.woff2",
  "vendor/fonts/KaTeX_Math-Italic.woff2",
  "vendor/fonts/KaTeX_SansSerif-Bold.woff2",
  "vendor/fonts/KaTeX_SansSerif-Italic.woff2",
  "vendor/fonts/KaTeX_SansSerif-Regular.woff2",
  "vendor/fonts/KaTeX_Script-Regular.woff2",
  "vendor/fonts/KaTeX_Size1-Regular.woff2",
  "vendor/fonts/KaTeX_Size2-Regular.woff2",
  "vendor/fonts/KaTeX_Size3-Regular.woff2",
  "vendor/fonts/KaTeX_Size4-Regular.woff2",
  "vendor/fonts/KaTeX_Typewriter-Regular.woff2"
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  ev.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        // keep anything else served from this origin, e.g. images you link to
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});

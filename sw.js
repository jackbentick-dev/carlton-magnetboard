// Offline copy of the app, so it opens and takes votes with no signal (a full ground after the
// game). The app's own files are fetched fresh when the network answers within a few seconds and
// come from this copy otherwise; libraries, fonts and photos come from the copy first. GitHub
// (vote sync) and Squiggle (results) are never cached: the app handles those being unreachable.
const CACHE = 'carlton-hub-v1';
const CORE = [
  './carlton-magnetboard.html',
  './data.js',
  './app.js',
  './apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
];
const NETWORK_ONLY = ['api.github.com', 'api.squiggle.com.au', 'api.allorigins.win'];
const FRESH_WAIT_MS = 3500;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const save = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
};

// The app's own files: the network if it answers quickly, else the saved copy
const freshFirst = (req) => new Promise((resolve) => {
  let done = false;
  const fromCache = () => caches.match(req, { ignoreSearch: true });
  const timer = setTimeout(() => {
    fromCache().then(hit => { if (hit && !done) { done = true; resolve(hit); } });
  }, FRESH_WAIT_MS);
  fetch(req).then(res => {
    save(req, res);
    if (!done) { done = true; clearTimeout(timer); resolve(res); }
  }).catch(() => {
    clearTimeout(timer);
    fromCache().then(hit => { if (!done) { done = true; resolve(hit || Response.error()); } });
  });
});

// Libraries, fonts, photos: the saved copy, else the network (and keep it)
const savedFirst = (req) => caches.match(req).then(hit => hit || fetch(req).then(res => save(req, res)));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (NETWORK_ONLY.some(h => url.hostname === h)) return;
  if (url.origin === self.location.origin) { e.respondWith(freshFirst(req)); return; }
  e.respondWith(savedFirst(req).catch(() => Response.error()));
});

// StarQuest service worker: makes the app work offline.
// The app's "Check for updates" button reads the VERSION line below, so keep it equal to the version in index.html.
const VERSION = '26.11.90';
const SHELL = 'sq-shell-' + VERSION;      // small app files, replaced on every version
const ASSETS = 'sq-assets-v1';            // pictures + stories: file names carry a hash, so they never go stale
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const NET_WAIT = 4000;                    // on a slow connection, use the saved copy after 4 seconds

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(k => k !== ASSETS && k !== SHELL && (k.indexOf('starquest-') === 0 || k.indexOf('sq-shell-') === 0))
    .map(k => caches.delete(k)))));
  self.clients.claim();
});

function timed(req){
  return new Promise((ok, no) => {
    const t = setTimeout(() => no(new Error('slow')), NET_WAIT);
    fetch(req).then(r => { clearTimeout(t); ok(r); }, err => { clearTimeout(t); no(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.search.indexOf('check=') !== -1) return;
  // Pictures and stories: saved copy first, download once.
  if (url.pathname.indexOf('/assets/') !== -1 && url.pathname.slice(-11) !== 'assets.json') {
    e.respondWith(caches.open(ASSETS).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && res.status === 200) c.put(req, res.clone());
      return res;
    }))));
    return;
  }
  // Everything else: network first (so updates arrive), saved copy if offline or slow.
  e.respondWith(timed(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});

// The page asks for this a few seconds after opening: quietly save every picture and story for offline use.
let warming = false;
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'warm' && !warming) e.waitUntil(warm());
});
async function warm(){
  warming = true;
  try {
    const list = await (await fetch('./assets/assets.json', {cache: 'no-store'})).json();
    const cache = await caches.open(ASSETS);
    const keep = new Set(list.files.map(p => new URL(p, self.registration.scope).href));
    for (const k of await cache.keys()) if (!keep.has(k.url)) await cache.delete(k);   // drop pictures nothing uses any more
    const todo = [];
    for (const p of list.files) if (!(await cache.match(p))) todo.push(p);
    let i = 0;
    const worker = async () => {
      while (i < todo.length) {
        const p = todo[i++];
        try { const r = await fetch(p); if (r.ok) await cache.put(p, r); } catch (_) { return; }   // offline: stop quietly, try again next time
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  } catch (_) {}
  warming = false;
}

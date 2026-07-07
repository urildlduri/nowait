/* OHdiga Service Worker v1.0 */
const CACHE = 'ohdiga-v1';
const STATIC = ['/', '/index.html', '/user.html', '/merchant.html', '/nw.css', '/nw-core.js', '/manifest.json'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // Firebase, 카카오 API는 캐시 안 함
  const url = e.request.url;
  if(url.includes('firebase') || url.includes('kakao') || url.includes('googleapis')) return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(res=>{
        if(res && res.status===200 && res.type==='basic'){
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>cached||new Response('오프라인 상태입니다.'));
    })
  );
});

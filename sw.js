/* OHdiga Service Worker v2.0 */
const CACHE = 'ohdiga-v3';
const STATIC = ['/manifest.json', '/nw.css', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const url = e.request.url;
  // Firebase, 카카오 API — 캐시 안 함
  if(url.includes('firebase')||url.includes('kakao')||url.includes('googleapis')) return;
  // HTML 파일 — 항상 네트워크 우선 (최신 코드 보장)
  if(url.endsWith('.html') || url.endsWith('/') || !url.includes('.')){
    e.respondWith(
      fetch(e.request).catch(()=>caches.match(e.request))
    );
    return;
  }
  // JS/CSS — 네트워크 우선, 실패 시 캐시
  if(url.endsWith('.js')||url.endsWith('.css')){
    e.respondWith(
      fetch(e.request).then(res=>{
        if(res&&res.status===200){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  // 이미지/폰트 — 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(res=>{
        if(res&&res.status===200){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      });
    })
  );
});

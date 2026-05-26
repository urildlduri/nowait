/* ============================================================
   NOWAIT 공통 코어  ·  nw-core.js
   ① Firebase 설정은 여기 한 곳에서만 관리합니다.
   ============================================================ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBTcQKjBTXIl6UuNIndOuTI-nsBH5Wz0J4",
  authDomain:        "nowait-84116.firebaseapp.com",
  projectId:         "nowait-84116",
  storageBucket:     "nowait-84116.firebasestorage.app",
  messagingSenderId: "121578768600",
  appId:             "1:121578768600:web:3c57e58e21945dca956fad"
};
/* ============================================================ */

const NW = {};
window.NW = NW;

/* ── 카카오맵 (JavaScript 키 · 무료) ── */
NW.KAKAO_KEY = "56d96a0427d001e4d5fd597bd5e458e0";
NW.loadKakao = ()=> new Promise((res,rej)=>{
  if(window.kakao && window.kakao.maps){res(window.kakao);return;}
  const s=document.createElement('script');
  s.src=`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${NW.KAKAO_KEY}&autoload=false`;
  s.onload=()=>window.kakao.maps.load(()=>res(window.kakao));
  s.onerror=()=>rej(new Error('kakao sdk load fail'));
  document.head.appendChild(s);
});
/* 카카오맵 길찾기 링크 (앱/웹에서 열림) */
NW.kakaoRoute = (name,lat,lng)=>`https://map.kakao.com/link/to/${encodeURIComponent(name||'매장')},${lat},${lng}`;

/* 업종별 데모 메뉴 샘플 */
NW.DEMO_MENU = {
  pub:[{name:'생맥주 500cc',price:5000},{name:'모둠 안주',price:23000},{name:'하이볼',price:7000}],
  karaoke:[{name:'1시간 (룸)',price:18000},{name:'음료 세트',price:6000},{name:'서비스 30분',price:0}],
  escape:[{name:'테마 입장 (2인)',price:44000},{name:'테마 입장 (4인)',price:80000}],
  golf:[{name:'1시간 이용',price:30000},{name:'프리미엄 룸',price:45000}],
  party:[{name:'2시간 대관',price:60000},{name:'파티 패키지',price:120000}]
};
NW.DEMO_HOURS = '매일 17:00 – 02:00';

/* ── 상수 ── */
NW.CATS = [
  {k:'pub',     e:'🍺', n:'술집'},
  {k:'karaoke', e:'🎤', n:'노래방'},
  {k:'escape',  e:'🔓', n:'방탈출'},
  {k:'golf',    e:'⛳', n:'스크린골프'},
  {k:'party',   e:'🎉', n:'파티룸'},
];
NW.catOf  = k => NW.CATS.find(c=>c.k===k) || {e:'📍',n:k};
NW.PARTY  = [2,3,4,5,6];
NW.RADII  = [500,1000,2000];
NW.CALL_TTL  = 60;        // 호출 응답 대기(초)
NW.MATCH_TTL = 15*60;     // 입장 마감(초) — 자리 점유 최소화
NW.PENALTY   = 30*60;     // 노쇼 패널티(초)
NW.FALLBACK  = {lat:37.4979, lng:127.0276, name:'강남역(기본값)'};

/* ── 유틸 ── */
NW.$ = id => document.getElementById(id);
NW.toast = m=>{const t=NW.$('toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200);};
NW.fmtT = s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
NW.haversine = (a,b)=>{const R=6371e3,r=x=>x*Math.PI/180;
  const dla=r(b.lat-a.lat),dlo=r(b.lng-a.lng);
  const x=Math.sin(dla/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dlo/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));};
NW.distLabel = m=>m>=1000?(m/1000).toFixed(1)+'km':m+'m';
NW.nowMs = ()=>Date.now();
NW.tsMs  = t=>t&&t.toMillis?t.toMillis():(t||0);

/* ── Firebase 동적 로드 (file://·오프라인이어도 페이지는 살아있음) ── */
NW.cfgOk = !FIREBASE_CONFIG.apiKey.startsWith("YOUR_");
NW.fbLoaded = false;
NW.uid = null;
NW.fb = {};   // firestore/auth 함수 모음
const FB_BASE = "https://www.gstatic.com/firebasejs/10.12.0/";

NW.fbReady = (async()=>{
  try{
    const A  = await import(FB_BASE+"firebase-app.js");
    const Au = await import(FB_BASE+"firebase-auth.js");
    const F  = await import(FB_BASE+"firebase-firestore.js");
    Object.assign(NW.fb, {
      getAuth:Au.getAuth, signInAnonymously:Au.signInAnonymously, onAuthStateChanged:Au.onAuthStateChanged,
      collection:F.collection, doc:F.doc, addDoc:F.addDoc, setDoc:F.setDoc, updateDoc:F.updateDoc,
      getDoc:F.getDoc, getDocs:F.getDocs, query:F.query, where:F.where, onSnapshot:F.onSnapshot,
      serverTimestamp:F.serverTimestamp, deleteDoc:F.deleteDoc, orderBy:F.orderBy, limit:F.limit, Timestamp:F.Timestamp
    });
    if(NW.cfgOk){
      NW.app  = A.initializeApp(FIREBASE_CONFIG);
      NW.auth = Au.getAuth(NW.app);
      NW.db   = F.getFirestore(NW.app);
    }
    NW.fbLoaded = true;
  }catch(e){
    console.error('[NOWAIT] Firebase 로드 실패:',e);
    const w=NW.$('cfgWarn');
    if(w){w.classList.remove('hide');
      w.textContent='⚠️ Firebase 로드 실패 — file://이 아닌 http(s)로 열어야 합니다. 콘솔(F12) 로그 참고.';}
  }
})();

if(!NW.cfgOk){const w=NW.$('cfgWarn');if(w)w.classList.remove('hide');}

/* ── 익명 인증 ── */
NW.ensureAuth = async function(){
  if(!NW.cfgOk) return null;
  await NW.fbReady;
  if(!NW.fbLoaded) return null;
  if(NW.uid) return NW.uid;
  return new Promise(res=>{
    NW.fb.onAuthStateChanged(NW.auth,u=>{
      if(u){NW.uid=u.uid;res(u.uid);}
      else NW.fb.signInAnonymously(NW.auth).catch(e=>{NW.toast('인증 실패: '+(e.code||e.message));res(null);});
    });
    NW.fb.signInAnonymously(NW.auth).catch(()=>{});
  });
};

const CACHE='mis-cuotas-v4';
const CORE=['./','./index.html','./config.js','./supabase.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const STATIC_HOSTS=['fonts.googleapis.com','fonts.gstatic.com','cdnjs.cloudflare.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // red primero: siempre la última versión; sin conexión, la copia guardada
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  }else if(STATIC_HOSTS.includes(url.hostname)){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;})));
  }
  // todo lo demás (la base de datos) va directo a internet, sin caché
});

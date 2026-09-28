const $ = (s) => document.querySelector(s);
let firebaseReady=false,fb=null;
async function initFirebase(){
  try{
    const c=window.FIREBASE_CONFIG||{};
    if(!c.apiKey||!c.projectId||!c.appId)return false;
    const [core,authMod,fsMod]=await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js")
    ]);
    const app=core.initializeApp(c);
    fb={...authMod,...fsMod,auth:authMod.getAuth(app),db:fsMod.getFirestore(app)};
    firebaseReady=true; return true;
  }catch(e){console.warn("Firebase 尚未啟用",e);return false;}
}
async function incrementCounter(kind,id){
  if(!firebaseReady)return;
  try{
    const ref=fb.doc(fb.db,"counters",kind+":"+id);
    await fb.setDoc(ref,{value:fb.increment(1),updatedAt:new Date().toISOString()},{merge:true});
  }catch(e){console.warn("計數器更新失敗",e);}
}
async function getCounter(kind,id){
  if(!firebaseReady)return null;
  try{
    const s=await fb.getDoc(fb.doc(fb.db,"counters",kind+":"+id));
    return s.exists()?Number(s.data().value||0):0;
  }catch(e){return null;}
}
async function showCounter(el,kind,id){
  const v=await getCounter(kind,id);
  if(el&&v!==null)el.textContent="👁 "+v.toLocaleString("zh-TW")+" 次瀏覽";
}
async function setupComments(container,p){
  if(!firebaseReady){
    container.innerHTML='<div class="comment-muted">留言功能尚未啟用。</div>';
    return;
  }
  const {GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,collection,query,where,orderBy,getDocs,addDoc,serverTimestamp}=fb;
  let user=null;
  async function loadComments(){
    const list=document.getElementById("commentList"); if(!list)return;
    try{
      const q=query(collection(fb.db,"comments"),where("postSlug","==",postSlug(p)),orderBy("createdAt","desc"));
      const snap=await getDocs(q);
      list.innerHTML=snap.empty?'<div class="comment-muted">目前還沒有留言，歡迎留下第一則。</div>':
        snap.docs.map(d=>{const x=d.data();return '<div class="comment-item"><b>'+esc(x.name||"Google 使用者")+'</b><div>'+esc(x.text||"").replace(/\n/g,"<br>")+'</div></div>';}).join("");
    }catch(e){list.innerHTML='<div class="comment-muted">留言暫時無法載入。</div>';}
  }
  async function draw(){
    container.innerHTML=user?
      '<div class="comment-user">👤 '+esc(user.displayName||"Google 使用者")+' <button class="comment-link" id="logoutComment">登出</button></div>'+
      '<form class="comment-form" id="commentForm"><textarea id="commentText" maxlength="1000" required placeholder="寫下你的留言…"></textarea><button type="submit">發表留言</button></form><div id="commentList"></div>':
      '<button class="google-login" id="googleLogin">使用 Google 登入留言</button><div id="commentList"></div>';
    if(!user){
      document.getElementById("googleLogin").onclick=async()=>{try{await signInWithPopup(fb.auth,new GoogleAuthProvider());}catch(e){alert("Google 登入未完成，請確認 Firebase 已啟用 Google 登入。");}};
    }else{
      document.getElementById("logoutComment").onclick=()=>signOut(fb.auth);
      document.getElementById("commentForm").onsubmit=async e=>{
        e.preventDefault(); const text=document.getElementById("commentText").value.trim(); if(!text)return;
        await addDoc(collection(fb.db,"comments"),{postSlug:postSlug(p),name:user.displayName||"Google 使用者",uid:user.uid,text,createdAt:serverTimestamp()});
        document.getElementById("commentText").value=""; loadComments();
      };
    }
    loadComments();
  }
  onAuthStateChanged(fb.auth,u=>{user=u;draw();});
}

let site = null;

function esc(v=""){
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function slugify(s=""){
  return s.toString().normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,"-").replace(/^-+|-+$/g,"") || "post";
}
function fmtDate(s){
  if(!s) return "";
  const d=new Date(s);
  if(Number.isNaN(d.getTime())) return esc(s);
  return d.toLocaleDateString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).replaceAll("/",".");
}
function sortedPosts(){ return [...(site.posts||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))); }
function postSlug(p){ return slugify(p.title); }
function nav(){
  return `<header class="site-header"><nav class="nav">
    <a class="brand" href="index.html">${esc(site.brand||"Yuyi's Journal")}</a>
    <div class="navlinks">
      <a href="index.html?category=Travel">${esc(site.nav_travel||"TRAVEL")}</a>
      <a href="index.html?category=Diary">${esc(site.nav_diary||"DIARY")}</a>
      <a href="index.html?category=Life">${esc(site.nav_life||"LIFE")}</a>
      <a href="about.html">${esc(site.nav_about||"ABOUT")}</a>
      <a href="admin.html">${esc(site.admin_label||"ADMIN")}</a>
    </div>
  </nav></header>`;
}
function footer(){
  return `<footer class="site-footer"><div>${esc(site.footer_left||site.brand||"Yuyi's Journal")}</div><div>${esc(site.footer_right||"TRAVEL · DIARY · LIFE · MADE WITH LOVE")}</div></footer>`;
}
function card(p){
  const img=p.image?`<img src="${esc(p.image)}" alt="${esc(p.image_alt||p.title)}">`:"";
  return `<a class="card" href="post.html?slug=${encodeURIComponent(postSlug(p))}">
    <div class="card-image">${img}</div>
    <div class="card-body"><div class="meta">${esc((p.category||"Diary").toUpperCase())} · ${fmtDate(p.date)}</div>
    <h3>${esc(p.title)}</h3>${p.excerpt?`<div class="excerpt">${esc(p.excerpt)}</div>`:""}</div>
  </a>`;
}
function markedSafe(md=""){
  if(window.marked && window.DOMPurify){
    return DOMPurify.sanitize(marked.parse(md,{breaks:false,gfm:true}));
  }
  return esc(md).replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>");
}
async function load(){
  const r=await fetch("content.json?cb="+Date.now(),{cache:"no-store"});
  if(!r.ok) throw new Error("content.json 無法讀取");
  site=await r.json();
}
function renderHome(){
  const params=new URLSearchParams(location.search);
  const cat=params.get("category");
  const posts=sortedPosts().filter(p=>!cat||p.category===cat);
  document.title=`${cat?cat+" · ":""}${site.brand}`;
  document.body.innerHTML=nav()+`
  <main>
    <section class="hero"><div>
      <div class="eyebrow">${esc(site.eyebrow)}</div>
      <h1>${esc(site.brand)}</h1>
      <p class="lead">${esc(site.intro)}</p>
    </div><div class="hero-photo">
      ${site.hero_image?`<img src="${esc(site.hero_image)}" alt="${esc(site.brand)}">`:`<div class="hero-placeholder">YUYI'S JOURNAL</div>`}
    </div></section>
    <section class="section"><div class="section-head">
      <div><h2>${cat?esc(cat):(site.latest_title||"Journeys & Days")}</h2><p class="section-sub">${cat?"分類文章":esc(site.latest_subtitle||"最近寫下的故事")}</p></div>
      <a class="viewall" href="archive.html">${esc(site.archive_label||"VIEW ARCHIVE →")}</a>
    </div>
    <div class="posts">${posts.length?posts.slice(0,6).map(card).join(""):`<div class="notice" style="grid-column:1/-1">目前沒有文章。</div>`}</div></section>
    <section class="section"><div class="about-box"><h3>${esc(site.about_heading||"A little corner\nof my life.").replace(/\n/g,"<br>")}</h3><p>${esc(site.about_short)}</p></div></section>
  </main>${footer()}`;
}
function renderArchive(){
  document.title=`Archive · ${site.brand}`;
  document.body.innerHTML=nav()+`<main><section class="page-title"><div class="eyebrow">ARCHIVE</div><h1>Stories & Notes</h1><p>所有旅行、生活與日記文章都會在這裡留下紀錄。</p></section>
  <section class="section"><div class="posts">${sortedPosts().map(card).join("")}</div></section></main>${footer()}`;
}
function renderAbout(){
  document.title=`About · ${site.brand}`;
  document.body.innerHTML=nav()+`<main><section class="page-title"><div class="eyebrow">ABOUT YUYI</div><h1>Hello, I'm Yuyi.</h1><p>${esc(site.about_short)}</p></section>
  <section class="section"><div class="about-box"><h3>WELCOME TO<br>MY JOURNAL</h3><p>${esc(site.about_short)}</p></div></section></main>${footer()}`;
}
function renderPost(){
  const slug=new URLSearchParams(location.search).get("slug");
  const p=sortedPosts().find(x=>postSlug(x)===slug)||sortedPosts()[0];
  if(!p){document.body.innerHTML=nav()+`<main><section class="section"><div class="notice">找不到這篇文章。</div></section></main>${footer()}`;return;}
  document.title=`${p.title} · ${site.brand}`;
  const cover=p.image?`<div class="article-cover"><img src="${esc(p.image)}" alt="${esc(p.image_alt||p.title)}"></div>`:"";
  const comments=p.comments!==false?`<section class="comments"><h3>Leave a note</h3><div id="commentsMount"><div class="comment-muted">留言載入中…</div></div></section>`:"";
  document.body.innerHTML=nav()+`<main class="article-wrap">
    <div class="article-kicker">${esc((p.category||"Diary").toUpperCase())}</div>
    <h1 class="article-title">${esc(p.title)}</h1><div class="article-meta">${fmtDate(p.date)} · Yuyi <span id="postViews"></span></div>
    ${cover}<article class="article-content">${markedSafe(p.body||"")}</article>${comments}
  </main>${footer()}`;
}
(async()=>{
  try{
    await load();
    await initFirebase();
    const page=location.pathname.split("/").pop().toLowerCase()||"index.html";
    if(page==="archive.html") renderArchive();
    else if(page==="about.html") renderAbout();
    else if(page==="post.html") renderPost();
    else renderHome();
  }catch(e){
    document.body.innerHTML=`<main class="section"><div class="notice">網站內容載入失敗：${esc(e.message)}<br>請確認 content.json 已上傳到 GitHub Pages 根目錄。</div></main>`;
  }
})();
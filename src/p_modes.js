
/* ================= Experimental settings: Sandbox, 3D test, Beta test ================= */
const RR_MODE_INFO={
  main:{name:'Main game',emoji:'🏠',col:'#ffd23f'},
  sandbox:{name:'Sandbox',emoji:'🧪',col:'#2de0b0',desc:'A separate copy of the game where you have everything and can set anything. It has its own save, so your real game isn’t touched. Online play is off.'},
  d3:{name:'3D test',emoji:'\ud83e\uddca',col:'#7ad7ff',desc:'Play matches in first-person 3D, seeing through your rumbler\u2019s eyes. Move with the left stick, drag on the right side to look around, and tap the right side to shoot. It uses your real save. It\u2019s a test, so some things may look a bit odd.'},
  beta:{name:'Beta test',emoji:'🧬',col:'#c79bff',desc:'The newest version we’re testing, before it comes out as a new app. It’s loaded from the game server, needs internet, and has its own save.'}};
const rrIcon=m=>{try{const el=document.querySelector('meta[name="rr-icon-'+m+'"]');return el&&el.content||null;}catch(e){return null;}};
function rrSwitchMode(m){try{persist();}catch(e){}
  if(RR_BETA){try{if(window.parent&&window.parent!==window){window.parent.postMessage({rr:'exitBeta'},'*');return;}}catch(e){}if(history.length>1)history.back();return;}
  try{localStorage.setItem('rr-mode',m);}catch(e){}location.reload();}
function rrConfirmMode(m){const info=RR_MODE_INFO[m];openSheet(card=>{card.classList.add('rid','modec');
  card.insertAdjacentHTML('beforeend','<p class="of-kick" style="color:'+info.col+'">Experimental</p><h2>Switch to '+info.name+'?</h2>');
  const ic=rrIcon(m);if(ic){const im=document.createElement('img');im.src=ic;im.alt='';im.className='mode-icon';card.append(im);}
  card.insertAdjacentHTML('beforeend','<p class="sub">'+info.desc+'</p><p class="sub"><b>Are you sure you want to switch to '+info.name+'?</b> You can come back any time from the ☰ menu.</p>');
  const y=document.createElement('button');y.className='btn gold';y.textContent='Yes, switch to '+info.name;y.addEventListener('click',()=>{sfx('click');rrSwitchMode(m);});
  const n=document.createElement('button');n.className='btn';n.textContent='No, stay here';n.addEventListener('click',closeSheet);card.append(y,n);});}
function renderExperimental(){const el=$('#expPanel');if(!el)return;el.innerHTML='<h2>Experimental settings</h2><p class="hint">Try test versions of the game. '+(RR_MODE==='main'?'Your main game is safe.':'You’re in <b>'+RR_MODE_INFO[RR_MODE].name+'</b> right now.')+'</p>';
  const g=document.createElement('div');g.className='exp-grid';
  if(RR_MODE!=='main'){const b=document.createElement('button');b.className='btn green exp-back';b.textContent='⬅ Return to main game';b.addEventListener('click',()=>rrSwitchMode('main'));el.append(b);}
  for(const m of['sandbox','d3','beta']){if(m===RR_MODE||(RR_BETA&&m!=='beta'))continue;if(RR_BETA)continue;const info=RR_MODE_INFO[m],b=document.createElement('button');b.className='exp-card';b.style.setProperty('--ec',info.col);
    const ic=rrIcon(m);b.innerHTML=(ic?'<img src="'+ic+'" alt="">':'<span class="exp-emoji">'+info.emoji+'</span>')+'<b>'+info.name+'</b><small>'+(m==='sandbox'?'Have everything, set anything':m==='d3'?'First-person 3D':'The newest test version')+'</small>';
    b.addEventListener('click',()=>{sfx('click');rrConfirmMode(m);});g.append(b);}
  if(g.children.length)el.append(g);}
{const _rs=renderSettings;renderSettings=function(){const r=_rs.apply(this,arguments);try{renderExperimental();}catch(e){}return r;};}
/* the green "Return to main game" button at the top of the menu */
{const _gm=openGameMenu;openGameMenu=function(){_gm();if(RR_MODE==='main')return;const ov=$('#gmenu'),pan=ov&&ov.querySelector('.gm-panel');if(!pan)return;
  const info=RR_MODE_INFO[RR_MODE],b=document.createElement('button');b.className='btn green gm-return';b.innerHTML='⬅ Return to main game<small>You’re playing '+info.name+'</small>';
  b.addEventListener('click',()=>{sfx('click');rrSwitchMode('main');});const head=pan.querySelector('.gm-head');if(head)head.after(b);else pan.prepend(b);};
  const hb=$('#hambBtn');if(hb&&hb.removeEventListener){hb.removeEventListener('click',_gm);hb.addEventListener('click',()=>openGameMenu());}}
if(!NETS){
  /* page icon + title follow the mode */
  try{const ic=rrIcon(RR_MODE);if(ic)for(const rel of['icon','apple-touch-icon']){let l=document.querySelector('link[rel="'+rel+'"]');if(!l){l=document.createElement('link');l.rel=rel;document.head.append(l);}l.href=ic;}
    document.title=RR_MODE==='main'?'Rooftop Rumble':'Rooftop Rumble · '+RR_MODE_INFO[RR_MODE].name;}catch(e){}
  /* a badge on the home screen so you always know which version you're in */
  if(RR_MODE==='d3'||RR_MODE==='beta'){const tag=document.createElement('span');tag.className='sbx-tag mode-tag';tag.style.background=RR_MODE_INFO[RR_MODE].col;tag.textContent=RR_MODE==='d3'?'3D TEST':'BETA';const me=document.querySelector('.me');if(me)me.append(tag);}
  /* beta build: tell the main app we're ready */
  if(RR_BETA){try{if(window.parent!==window)window.parent.postMessage({rr:'betaReady'},'*');}catch(e){}}
  /* main app in beta mode: show the beta from the server on top of everything */
  if(RR_MODE==='beta'&&!RR_BETA){let open=true;
    {const _mt=musicTick;musicTick=function(){if(open)return;return _mt.apply(this,arguments);};const _sf=sfx;sfx=function(){if(open)return;return _sf.apply(this,arguments);};}
    const w=document.createElement('div');w.id='betaWrap';const ic=rrIcon('beta');
    w.innerHTML='<div class="beta-load">'+(ic?'<img src="'+ic+'" alt="">':'')+'<h2>Loading the beta…</h2><p>The beta lives on the game server. If the server was asleep, it can take up to a minute to wake up.</p><p class="beta-off" hidden>You need internet for the beta.</p><button class="btn green">⬅ Return to main game</button></div>';
    const f=document.createElement('iframe');f.src=BETA_URL+'?t='+Date.now();f.title='Rooftop Rumble beta';f.setAttribute('allow','autoplay; fullscreen; clipboard-write');w.append(f);document.body.append(w);
    w.querySelector('.btn').addEventListener('click',()=>{open=false;rrSwitchMode('main');});
    if(navigator.onLine===false)w.querySelector('.beta-off').hidden=false;
    window.addEventListener('message',e=>{const d=e.data;if(!d||typeof d!=='object')return;if(d.rr==='betaReady')w.classList.add('ready');if(d.rr==='exitBeta'){open=false;rrSwitchMode('main');}});}
}

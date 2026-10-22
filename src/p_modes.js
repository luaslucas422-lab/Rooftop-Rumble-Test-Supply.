
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
function rrConfirmMode(m){if((m==='d3'||m==='beta')&&!rrIsTester()){openTesterApply();return;}const info=RR_MODE_INFO[m];openSheet(card=>{card.classList.add('rid','modec');
  card.insertAdjacentHTML('beforeend','<p class="of-kick" style="color:'+info.col+'">Experimental</p><h2>Switch to '+info.name+'?</h2>');
  const ic=rrIcon(m);if(ic){const im=document.createElement('img');im.src=ic;im.alt='';im.className='mode-icon';card.append(im);}
  card.insertAdjacentHTML('beforeend','<p class="sub">'+info.desc+'</p><p class="sub"><b>Are you sure you want to switch to '+info.name+'?</b> You can come back any time from the ☰ menu.</p>');
  const y=document.createElement('button');y.className='btn gold';y.textContent='Yes, switch to '+info.name;y.addEventListener('click',()=>{sfx('click');rrSwitchMode(m);});
  const n=document.createElement('button');n.className='btn';n.textContent='No, stay here';n.addEventListener('click',closeSheet);card.append(y,n);});}
function renderExperimental(){const el=$('#expPanel');if(!el)return;el.innerHTML='<h2>Experimental settings</h2><p class="hint">Try test versions of the game. '+(RR_MODE==='main'?'Your main game is safe.':'You’re in <b>'+RR_MODE_INFO[RR_MODE].name+'</b> right now.')+'</p>';
  const g=document.createElement('div');g.className='exp-grid';
  if(RR_MODE!=='main'){const b=document.createElement('button');b.className='btn green exp-back';b.textContent='⬅ Return to main game';b.addEventListener('click',()=>rrSwitchMode('main'));el.append(b);}
  const tester=rrIsTester();
  for(const m of['sandbox','d3','beta']){if(m===RR_MODE||RR_BETA)continue;const info=RR_MODE_INFO[m],locked=m!=='sandbox'&&!tester,b=document.createElement('button');b.className='exp-card'+(locked?' exp-locked':'');b.style.setProperty('--ec',info.col);
    const ic=rrIcon(m);b.innerHTML=(ic?'<img src="'+ic+'" alt="">':'<span class="exp-emoji">'+info.emoji+'</span>')+'<b>'+info.name+'</b><small>'+(locked?'Beta tester required':m==='sandbox'?'Have everything, set anything':m==='d3'?'First-person 3D':'The newest test version')+'</small>'+(locked?'<span class="exp-lock" aria-hidden="true">🔒</span>':'');
    b.addEventListener('click',()=>{sfx('click');if(locked){openTesterApply();return;}rrConfirmMode(m);});g.append(b);}
  if(g.children.length)el.append(g);
  if(!RR_BETA&&!tester){const ap=document.createElement('div');ap.className='exp-apply';ap.innerHTML='<b>🔒 Beta tester required</b><span>3D test and Beta test are only for beta testers. Answer a few quick questions to see if you’re a good fit.</span>';
    const bt=document.createElement('button');bt.className='btn gold';bt.textContent='Apply to be a beta tester';bt.addEventListener('click',()=>{sfx('click');openTesterApply();});ap.append(bt);el.append(ap);}
  else if(!RR_BETA){el.insertAdjacentHTML('beforeend','<p class="exp-tester">🧪 You’re a <b>Beta Tester</b>. Thanks for helping test the game!</p>');}}
/* ---------- beta tester application ---------- */
function testerGrant(){S.betaTester=true;try{localStorage.setItem(TESTER_KEY,'1');}catch(e){}grantSkin('ember','tester');if(!S.pins.includes('tester'))S.pins.push('tester');persist();}
const TESTER_KEY='rr-beta-tester',TESTER_WAIT_KEY='rr-beta-wait',TESTER_WAIT=10*60*1000;
const rrIsTester=()=>{if(S&&S.betaTester)return true;try{return localStorage.getItem(TESTER_KEY)==='1';}catch(e){return false;}};
if(!NETS&&rrIsTester()&&S.owned&&S.owned.ember&&!S.owned.ember.skins.includes('tester'))testerGrant();
const TESTER_QS=[
  {q:'You find a bug in the beta. What do you do?',a:['Tell the game’s creator what happened and how to make it happen again','Use it to win as many matches as I can','Keep it a secret','Tell everyone how to cheat with it'],ok:0},
  {q:'The beta might have bugs or things that look odd. Is that okay?',a:['No, it should be perfect','Yes, that’s what testing is for, and I’ll report them','Only if I win','I’ll just stop playing'],ok:1},
  {q:'Does your progress in the beta count in the main game?',a:['Yes, everything carries over','No, the beta has its own save','Only trophies count','Only gems count'],ok:1},
  {q:'Someone asks you to share new beta features before they’re released. What do you do?',a:['Post them everywhere','Keep them secret until they come out','Sell screenshots','Make up fake ones'],ok:1},
  {q:'Which rumbler does every player start with?',a:['Bolt','Ember','Dark','Orion'],ok:1},
  {q:'How many players are on each team in a 3v3 match?',a:['2','3','4','6'],ok:1},
  {q:'What’s the best way to describe a bug?',a:['“It’s broken”','What you did, what happened, and what you expected to happen','A long angry message','Nothing, they’ll find it'],ok:1}];
const TESTER_PASS=6;
function openTesterApply(){let wait=0;try{wait=+localStorage.getItem(TESTER_WAIT_KEY)||0;}catch(e){}
  if(rrIsTester()){toast('You’re already a beta tester!');return;}
  if(wait>Date.now()){const m=Math.ceil((wait-Date.now())/60000);openSheet(card=>{card.classList.add('rid','tester');card.insertAdjacentHTML('beforeend','<p class="of-kick tester-kick">Beta tester application</p><h2>Try again soon</h2><p class="sub">You can take the questions again in <b>'+m+' minute'+(m>1?'s':'')+'</b>. Read each question carefully next time!</p>');const x=document.createElement('button');x.className='btn';x.textContent='OK';x.addEventListener('click',closeSheet);card.append(x);});return;}
  const order=shuffle(TESTER_QS.map((_,i)=>i)),ans=[];let at=0;
  const step=()=>openSheet(card=>{card.classList.add('rid','tester');const qi=order[at],Q=TESTER_QS[qi];
    card.insertAdjacentHTML('beforeend','<p class="of-kick tester-kick">Beta tester application · '+(at+1)+' of '+order.length+'</p><div class="tester-prog"><i style="width:'+Math.round(at/order.length*100)+'%"></i></div><h2>'+esc(Q.q)+'</h2>');
    const opts=shuffle(Q.a.map((t,i)=>[t,i]));for(const[t,i]of opts){const b=document.createElement('button');b.className='tester-opt';b.textContent=t;b.addEventListener('click',()=>{sfx('tap');ans[qi]=i;at++;if(at<order.length)step();else finish();});card.append(b);}
    const x=document.createElement('button');x.className='btn';x.textContent='Stop';x.addEventListener('click',closeSheet);card.append(x);});
  const finish=()=>{const score=TESTER_QS.reduce((n,Q,i)=>n+(ans[i]===Q.ok?1:0),0),pass=score>=TESTER_PASS;
    if(pass){testerGrant();sfx('unlock');}else{try{localStorage.setItem(TESTER_WAIT_KEY,String(Date.now()+TESTER_WAIT));}catch(e){}sfx('tap');}
    openSheet(card=>{card.classList.add('rid','tester');
      card.insertAdjacentHTML('beforeend','<p class="of-kick tester-kick">Beta tester application</p><div class="tester-badge'+(pass?' ok':'')+'">'+(pass?'🧪':'🔒')+'</div><h2 style="text-align:center">'+(pass?'You’re a Beta Tester!':'Not this time')+'</h2>'+
        '<p class="sub" style="text-align:center">You got <b>'+score+' of '+TESTER_QS.length+'</b> right.'+(pass?' You now have access to <b>3D test</b> and <b>Beta test</b> in Experimental settings. Remember to report bugs and keep new stuff secret!':' You need '+TESTER_PASS+' to pass. You can try again in 10 minutes.')+'</p>');
      if(pass){const rw=document.createElement('div');rw.className='sol-rlist';const e=BY_ID.ember;for(const[vis,lab]of[[thumb(e,getSkin(e,'tester'),40),'Beta Tester Ember skin'],[pinCanvas('b:tester',40),'Beta Tester pin'],[iconCanvas('x:tester',40),'Beta Tester profile icon']]){const d=document.createElement('div');d.append(vis);d.insertAdjacentHTML('beforeend','<span>'+lab+'</span>');rw.append(d);}card.append(rw);
        const wr=document.createElement('button');wr.className='btn primary';wr.textContent='Wear the Beta Tester skin';wr.addEventListener('click',()=>{if(S.owned.ember){S.owned.ember.skin='tester';S.selected='ember';persist();renderHome();toast('Beta Tester Ember equipped');}closeSheet();});card.append(wr);}
      const x=document.createElement('button');x.className='btn gold';x.textContent=pass?'Awesome!':'OK';x.addEventListener('click',()=>{closeSheet();try{renderSettings();}catch(e){}});card.append(x);});};
  openSheet(card=>{card.classList.add('rid','tester');card.insertAdjacentHTML('beforeend','<p class="of-kick tester-kick">Beta tester application</p><h2>Want to be a beta tester?</h2><p class="sub">Beta testers get to try <b>3D test</b> and the <b>Beta test</b> before anyone else, plus a <b>Beta Tester Ember skin</b>, pin and profile icon. First, answer '+TESTER_QS.length+' quick questions to see if you’re a good fit. You need '+TESTER_PASS+' right to pass.</p>');
    const y=document.createElement('button');y.className='btn gold';y.textContent='Start the questions';y.addEventListener('click',step);const n=document.createElement('button');n.className='btn';n.textContent='Not now';n.addEventListener('click',closeSheet);card.append(y,n);});}

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

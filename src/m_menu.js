/* =====================================================================
   Lobby menu (the ☰ in the top-right corner):
   Stats · Run a simulation · Replays · Watch a random match
   plus the "watching" mode shared by simulations, replays and live spectating
   ===================================================================== */
const isWatching=()=>!!(M&&(M.watch||(NETC&&NETC.watch)));

/* ---------- watching (simulation, replay, live) ---------- */
function watchUi(){const g=$('#game'),on=isWatching();g.classList.toggle('watching',on);let bar=$('#watchBar');
  if(!bar){bar=document.createElement('div');bar.id='watchBar';bar.className='watchbar';
    bar.innerHTML='<button class="btn sm" id="watchExit">✕ Exit</button><span id="watchInfo" class="wi"></span><button class="btn sm" id="watchSpeed" hidden>1×</button>';g.append(bar);
    $('#watchExit').addEventListener('click',e=>{e.stopPropagation();sfx('click');exitWatch();});
    $('#watchSpeed').addEventListener('click',e=>{e.stopPropagation();if(NETC&&NETC.rep){NETC.rep.speed=NETC.rep.speed>=4?1:NETC.rep.speed*2;$('#watchSpeed').textContent=NETC.rep.speed+'×';sfx('tap');}});}
  bar.hidden=!on;if(on){$('#watchSpeed').hidden=!(NETC&&NETC.watch==='replay');$('#watchSpeed').textContent=(NETC&&NETC.rep?NETC.rep.speed:1)+'×';watchInfo();}}
function watchKind(){return M&&M.sim?'Simulation':NETC&&NETC.watch==='replay'?'Replay':'Live match';}
function watchInfo(){const el=$('#watchInfo');if(!el||!M)return;const f=M.sim?M.followU:P;
  el.innerHTML='<b>'+watchKind()+'</b><small>'+(f?'Following '+esc(f.name||(f.b&&f.b.name)||'')+' · tap to switch':'Tap the screen to follow someone')+'</small>';}
function watchNext(){if(!M)return;const list=M.units.filter(u=>!u.dead&&!u.shadow);if(!list.length)return;const cur=M.sim?M.followU:P,nx=list[(list.indexOf(cur)+1)%list.length];
  if(M.sim){M.followU=nx;P=nx;}else if(NETC){NETC.follow=nx.id;P=nx;}sfx('tap');watchInfo();}
function exitWatch(){if(NETC&&NETC.watch==='live')netSend({t:'unwatch'});NETC=null;M=null;P=null;MYT=0;paused=false;$('#endOv').hidden=true;$('#pauseOv').hidden=true;$('#game').classList.remove('watching');go('home');}
function endPanel(title,sub,btns){const sh=$('#endSheet');sh.innerHTML='<h2 class="we-title">'+title+'</h2>'+(sub?'<p class="sub" style="text-align:center">'+sub+'</p>':'');
  for(const[t,cls,fn]of btns){const b=document.createElement('button');b.className='btn '+cls;b.textContent=t;b.addEventListener('click',()=>{sfx('click');fn();});sh.append(b);}$('#endOv').hidden=false;}
const scoreLine=()=>M&&M.score&&M.score.length===2&&!M.mode.sd&&!M.mode.ffa?'<b style="color:#46b4ff">'+(M.score[0]|0)+'</b> – <b style="color:#ff5d57">'+(M.score[1]|0)+'</b>':'';
function showWatchEnd(){if(!M)return;const live=NETC&&NETC.watch==='live',rep=NETC&&NETC.rep;
  if(rep){const m=rep.meta,res=m.result===0?'You won':m.result===1?'You lost':m.result===-1?'Draw':'Match over';
    endPanel('Replay finished',res+(scoreLine()?' · '+scoreLine():''),[['Watch again','gold',()=>{const r=NETC.rep;exitWatch();playReplay(r.meta,r.frames);}],['Replays','',()=>{exitWatch();openReplays();}],['Back to lobby','',exitWatch]]);}
  else endPanel('Match over',scoreLine(),live?[['Watch another','gold',()=>{exitWatch();watchRandom();}],['Back to lobby','',exitWatch]]:[['Back to lobby','',exitWatch]]);}
function showSimEnd(){const w=M.result,best=M.units.filter(u=>!u.shadow).sort((a,b)=>(b.kills||0)-(a.kills||0))[0];
  const t=M.mode.sd||M.mode.ffa?'Simulation over':w===0?'Blue team wins!':w===1?'Red team wins!':'It’s a draw!';
  endPanel(t,(scoreLine()?scoreLine()+'<br>':'')+(best&&best.kills?'Top rumbler: <b>'+esc(best.name)+'</b> with '+best.kills+' takedown'+(best.kills>1?'s':''):''),
    [['Run it again','gold',()=>{const p=S.simPick;$('#endOv').hidden=true;startSim(p);}],['Change teams','',()=>{M=null;P=null;$('#endOv').hidden=true;go('home');openSimSetup();}],['Back to lobby','',()=>{M=null;P=null;$('#endOv').hidden=true;$('#game').classList.remove('watching');go('home');}]]);}

/* ---------- the menu ---------- */
function openGameMenu(){sfx('click');let ov=$('#gmenu');if(ov)ov.remove();ov=document.createElement('div');ov.id='gmenu';ov.className='gmenu';
  const items=[['stats','📊','Stats','Everything you’ve ever done'],['sim','🤖','Run a simulation','Pick 3 vs 3 bots and watch them fight'],['replays','🎬','Replays','Watch your last matches again'],['watch','📺','Watch a random match','Spectate a live online match'],['excl','💎','Exclusive skins','Skins you can only earn, never buy'],['solars','☀️','Solar','Level up with chromos for icons and skins'],['rid','🪪','Rumble ID','Sign in, save online, get a free Epic'],['pc','🔒','Parent controls','Limits set by a parent or guardian']];
  ov.innerHTML='<div class="gm-panel"><div class="gm-head"><span class="gm-me"></span><b>'+esc(S.name)+'</b><button class="gm-x" aria-label="Close menu">✕</button></div>'+items.map(([id,ic,t,s])=>'<button class="gm-item" data-act="'+id+'"><span class="gm-ic">'+ic+'</span><span class="gm-t"><b>'+t+'</b><small>'+s+'</small></span><span class="gm-go">›</span></button>').join('')+'</div>';
  document.body.append(ov);ov.querySelector('.gm-me').append(iconCanvas(S.icon||'r:'+S.selected,34));
  const close=()=>{ov.classList.add('out');setTimeout(()=>ov.remove(),200);};
  ov.addEventListener('click',e=>{if(e.target===ov)close();});ov.querySelector('.gm-x').addEventListener('click',close);
  ov.querySelectorAll('.gm-item').forEach(b=>b.addEventListener('click',()=>{sfx('click');close();const a=b.dataset.act;if(a==='stats')openStats();else if(a==='sim')openSimSetup();else if(a==='replays')openReplays();else if(a==='excl')openExclusives();else if(a==='rid')openRumbleId();else if(a==='solars')openSolars();else if(a==='pc')openParentControls();else watchRandom();}));}
$('#hambBtn').addEventListener('click',openGameMenu);
function menuBack(card){const x=document.createElement('button');x.className='btn';x.textContent='← Back to menu';x.addEventListener('click',()=>{closeSheet();openGameMenu();});card.append(x);}

/* ---------- Stats ---------- */
function fmtTime(sec){sec=sec|0;const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);return h?h+'h '+m+'m':m+'m';}
function openStats(){const st=S.st,owned=Object.keys(S.owned),sk=owned.reduce((n,id)=>n+S.owned[id].skins.filter(x=>x!=='classic').length,0),wr=S.matches?Math.round(S.wins/S.matches*100):0;
  const dropTot=Object.entries(st.drops).filter(([k])=>!BOXES.includes(k)).reduce((n,[,v])=>n+v,0),pres=owned.reduce((n,id)=>n+(S.owned[id].prestige|0),0);
  const ri=rankInfo(S.rp),peak=S.rankPeak|0,pk=peak>=RANK_STEPS-1?'Master':rankInfo(peak*100).name,secrets=SECRET_PINS.filter(p=>S.pins.includes(p[0])).length,kd=st.deaths?(st.kills/st.deaths).toFixed(2):st.kills?st.kills+'.00':'0';
  const hw=S.hw||{},yes=v=>v?'✅ Yes':'❌ Not yet';
  const sec=(title,col,cards)=>'<h3 class="sx-h" style="--sc:'+col+'">'+title+'</h3><div class="sx-grid">'+cards.map(([ic,v,l])=>'<div class="sx-c"><span class="sx-i">'+ic+'</span><b>'+v+'</b><small>'+l+'</small></div>').join('')+'</div>';
  openSheet(card=>{card.classList.add('statsheet');
    card.insertAdjacentHTML('beforeend','<div class="sx-top"><span class="sx-ico"></span><span><b class="sx-name">'+esc(S.name)+'</b><small>'+fmtFull(S.trophies)+' trophies · best '+fmtFull(S.best)+'</small></span></div>');card.querySelector('.sx-ico').append(iconCanvas(S.icon||'r:'+S.selected,60));
    let h=sec('General','#ffd23f',[['🏆',fmtFull(S.trophies),'trophies'],['⭐',fmtFull(S.best),'best trophies'],['🎮',fmtFull(S.matches|0),'matches played'],['✅',fmtFull(S.wins|0),'wins'],['📈',wr+'%','win rate'],['🔥',st.bestStreak|0,'best win streak'],['⏱️',fmtTime(st.time),'time in matches'],['🧑',owned.length+' / '+RUMBLERS.length,'rumblers'],['👕',fmtFull(sk),'skins'],['📌',fmtFull(S.pins.length),'pins'],['🖼️',ownedIcons().length,'profile icons'],['🕵️',secrets+' / '+SECRET_PINS.length,'secrets found']]);
    h+=sec('Battle','#ff5d57',[['💥',fmtFull(st.kills),'takedowns'],['💀',fmtFull(st.deaths),'times defeated'],['⚔️',kd,'takedowns per defeat'],['💢',fmtFull(Math.round(st.dmg)),'damage dealt'],['⚡',fmtFull(st.supers),'supers used'],['🛠️',fmtFull(st.gadgets),'gadgets used'],['💬',fmtFull(st.pins),'pins sent']]);
    h+=sec('Drops & rewards','#9d7bff',[['🎁',fmtFull(dropTot),'drops opened'],['📦',fmtFull(st.drops.rbox|0),'Rumbler Boxes opened'],['👗',fmtFull(st.drops.sbox|0),'Skin Boxes opened'],['🛣️',(S.road|0)+' / '+ROAD_MAX,'trophy road'],['🎟️',passTier(S.pass.xp),'Rumble Pass tier'],['🌟',fmtFull(pres),'total prestige']]);
    {const keys=['rare','epic','mythic','legendary','ultra','season','pumpkin','skeleton','zombie'].filter(k=>st.drops[k]);if(keys.length)h+='<div class="sx-chips">'+keys.map(k=>'<span style="--rc:'+RARITY[k].col+'"><b>'+st.drops[k]+'</b> '+RARITY[k].name+'</span>').join('')+'</div>';}
    h+=sec('Ranked','#c79bff',[['🎖️',ri.name,'rank now'],['🏔️',pk,'highest this climb'],['🔁',S.rankCycle|0,'times claimed'],['💯',fmtFull(S.rp|0),'rank points']]);
    h+=sec('Halloween','#ff8a1f',[['🎃',fmtFull(hw.wins|0),'event wins'],['🪙',Math.floor((hw.wins|0)/KNOCK_EVERY),'tokens earned'],['🚪',fmtFull(hw.knocked|0),'doors knocked'],['👻',fmtFull(hw.opened|0),'Halloween Drops opened'],['🎭',(st.tricksW|0)+' won · '+(st.tricksL|0)+' lost','tricks'],['🚧',(hw.dead|0)+' / '+DEAD_PITY,'Dead Inside knocks'],['🌈',Math.min(HAPPY_KNOCKS,hw.knocked|0)+' / '+HAPPY_KNOCKS,'Happy House'],['🖤',yes(S.owned.dark),'Dark unlocked'],['💀',yes(hasSkin('dark','hw_grim')),'Grim Dark'],['🌈',yes(hasSkin('dark','hw_surged')),'Surged Dark']]);
    h+='<h3 class="sx-h" style="--sc:#46b4ff">Game modes</h3><div class="sx-modes">'+MODES.map(m=>{const v=st.modes[m.id]||[0,0];return'<div><span class="mico" style="--mc:'+m.col+'">'+MODE_ICON[m.id]+'</span><b>'+esc(m.name)+'</b><small>'+v[0]+' played · '+v[1]+' won'+(v[0]?' · '+Math.round(v[1]/v[0]*100)+'%':'')+'</small></div>';}).join('')+'</div>';
    h+=sec('Extras','#6be39a',[['🤖',st.sims|0,'simulations run'],['🎬',st.replays|0,'replays watched'],['📺',st.watched|0,'matches spectated'],['🥇',st.sdWins|0,'Showdown 1st places'],['💎',exCount()+' / '+EXCLUSIVE_SKINS.length,'exclusive skins']]);
    card.insertAdjacentHTML('beforeend',h+'<p class="hint" style="margin:0">Battle stats count from this update on. Online matches add to matches, wins and takedowns.</p>');menuBack(card);});}

/* ---------- Run a simulation ---------- */
const SIM_MODES=()=>MODES.filter(m=>!m.sd&&!m.ffa&&m.id!=='boss'&&m.id!=='duel');
function simPick(){if(!S.simPick)S.simPick={blue:[null,null,null],red:[null,null,null],mode:'rush'};if(!SIM_MODES().some(m=>m.id===S.simPick.mode))S.simPick.mode=SIM_MODES()[0].id;return S.simPick;}
function openSimSetup(){const sp=simPick();openSheet(card=>{card.classList.add('simsheet');
  card.insertAdjacentHTML('beforeend','<h2>Run a simulation</h2><p class="sub">Pick 3 rumblers for each team. Everyone plays as a max-level bot and you watch. Tap the screen during the match to switch who you follow.</p>');
  for(const side of['blue','red']){const row=document.createElement('div');row.className='sim-team '+side;row.insertAdjacentHTML('beforeend','<span class="sim-lbl">'+(side==='blue'?'Blue team':'Red team')+'</span>');
    const sl=document.createElement('div');sl.className='sim-slots';sp[side].forEach((id,i)=>{const b=document.createElement('button');b.className='sim-slot'+(id?' full':'');if(id&&BY_ID[id]){b.append(thumb(BY_ID[id],getSkin(BY_ID[id],'classic'),62));b.insertAdjacentHTML('beforeend','<small>'+esc(BY_ID[id].name)+'</small>');}else b.innerHTML='<span>+</span>';
      b.addEventListener('click',()=>{sfx('tap');pickSimRumbler(side,i);});sl.append(b);});row.append(sl);card.append(row);if(side==='blue')card.insertAdjacentHTML('beforeend','<div class="sim-vs">VS</div>');}
  card.insertAdjacentHTML('beforeend','<span class="lbl" style="font-weight:800">Game mode</span>');const mr=document.createElement('div');mr.className='trackrow';
  for(const m of SIM_MODES()){const b=document.createElement('button');b.className='tpill'+(sp.mode===m.id?' on':'');b.textContent=m.name;b.addEventListener('click',()=>{sp.mode=m.id;persist();openSimSetup();});mr.append(b);}card.append(mr);
  const rnd=document.createElement('button');rnd.className='btn';rnd.textContent='🎲 Random teams';rnd.addEventListener('click',()=>{const pool=shuffle(RUMBLERS.map(b=>b.id));sp.blue=pool.slice(0,3);sp.red=pool.slice(3,6);persist();sfx('pop');openSimSetup();});
  const ready=sp.blue.every(Boolean)&&sp.red.every(Boolean),go2=document.createElement('button');go2.className='btn gold';go2.textContent=ready?'▶ Start simulation':'Pick all 6 rumblers to start';go2.disabled=!ready;go2.addEventListener('click',()=>{closeSheet();startSim(sp);});
  card.append(rnd,go2);menuBack(card);});}
function pickSimRumbler(side,i){const sp=simPick();openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Pick a rumbler</h2><p class="sub">'+(side==='blue'?'Blue':'Red')+' team, slot '+(i+1)+'. Any rumbler works, even ones you don’t own.</p>');
  const g=document.createElement('div');g.className='sim-pick';for(const r of['common','rare','epic','mythic','legendary','ultra'])for(const b of RUMBLERS.filter(x=>x.rarity===r)){const c=document.createElement('button');c.className='sim-pc'+(sp[side][i]===b.id?' on':'');c.style.setProperty('--rc',RARITY[b.rarity].col);c.append(thumb(b,getSkin(b,'classic'),56));c.insertAdjacentHTML('beforeend','<small>'+esc(b.name)+'</small>');
    c.addEventListener('click',()=>{sp[side][i]=b.id;persist();sfx('click');openSimSetup();});g.append(c);}card.append(g);
  const x=document.createElement('button');x.className='btn';x.textContent='← Back';x.addEventListener('click',openSimSetup);card.append(x);});}
function startSim(sp){if(!sp||!sp.blue.every(id=>BY_ID[id])||!sp.red.every(id=>BY_ID[id]))return openSimSetup();audio();clearMM&&clearMM();closeSheet();lastTrial=null;lastRanked=false;
  try{newMatch({mode:sp.mode,ranked:false,sim:{blue:sp.blue.slice(),red:sp.red.slice()}});}catch(err){M=null;P=null;toast('Could not start the simulation: '+esc(err.message||err));return;}
  S.st.sims++;persist();enterGame();}

/* ---------- Replays: every real match is recorded (about 10 frames a second, only the changes) ---------- */
let REC=null;
function recStart(){REC=null;if(!M||isWatching()||M.trial||M.sim)return;try{const me=NETC?NETC.me:(P&&P.id);
  REC={meta:{id:Date.now().toString(36)+Math.floor(Math.random()*1e5).toString(36),date:Date.now(),mode:M.mode.id,me,team:MYT|0,rumbler:P&&P.b?P.b.id:S.selected,skin:P&&P.sk?P.sk.id:'classic',online:!!NETC,ranked:!!M.ranked},frames:[],cache:null,acc:0,last:performance.now()};}catch(e){REC=null;}}
function recTick(dt){if(!REC||!M)return;REC.acc+=dt;if(REC.acc>=.1){const d=REC.acc;REC.acc=0;try{recPush(netSnap(false),d);}catch(e){REC=null;}}}
function recPush(s,d){if(!REC||!s||!s.units)return;if(d==null){const n=performance.now();d=(n-REC.last)/1000;REC.last=n;}if(REC.frames.length>=3600)return;REC.frames.push([Math.round(d*1000)/1000,repDiff(REC,s)]);}
function repDiff(R,s){const c=R.cache||(R.cache={top:{},u:{},s:[],ids:''}),d={};
  for(const k in s){if(k==='units'||k==='structs')continue;if(k==='fx'||k==='texts'||k==='decals'||k==='ev'){if(s[k]&&s[k].length)d[k]=s[k];continue;}const j=JSON.stringify(s[k]);if(c.top[k]!==j){c.top[k]=j;(d.t||(d.t={}))[k]=s[k];}}
  for(const k in c.top)if(!(k in s)&&c.top[k]!=='null'){c.top[k]='null';(d.t||(d.t={}))[k]=null;}
  const ids=s.units.map(u=>u.id).join(',');if(c.ids!==ids){c.ids=ids;d.o=s.units.map(u=>u.id);}
  const one=(prev,cur)=>{let ch=null;for(const k in cur){const j=JSON.stringify(cur[k]);if(prev[k]!==j){prev[k]=j;(ch||(ch={}))[k]=cur[k];}}for(const k in prev)if(!(k in cur)&&prev[k]!=='null'){prev[k]='null';(ch||(ch={}))[k]=null;}return ch;};
  for(const u of s.units){const ch=one(c.u[u.id]||(c.u[u.id]={}),u);if(ch)(d.u||(d.u={}))[u.id]=ch;}
  if(c.sn!==s.structs.length){c.sn=s.structs.length;d.sn=c.sn;}
  s.structs.forEach((x,i)=>{const ch=one(c.s[i]||(c.s[i]={}),x);if(ch)(d.s||(d.s={}))[i]=ch;});return d;}
function repBuilder(){const st={top:{},u:{},o:[],s:[],sn:0};return x=>{if(x.t)Object.assign(st.top,x.t);if(x.o)st.o=x.o;if(x.u)for(const id in x.u)Object.assign(st.u[id]||(st.u[id]={}),x.u[id]);if(x.sn!=null)st.sn=x.sn;if(x.s)for(const i in x.s)Object.assign(st.s[i]||(st.s[i]={}),x.s[i]);
  const o=Object.assign({},st.top);o.units=st.o.map(id=>st.u[id]).filter(Boolean);o.structs=[];for(let i=0;i<st.sn;i++)o.structs.push(st.s[i]||{});o.fx=x.fx||[];o.texts=x.texts||[];o.decals=x.decals||[];o.ev=x.ev||[];return o;};}
function recFinish(left){if(!REC)return;const R=REC;REC=null;if(R.frames.length<40||!M)return;const m=R.meta;m.result=left?1:M.result;m.left=!!left;m.kills=P?P.kills|0:0;m.dur=Math.round(R.frames.reduce((n,f)=>n+f[0],0));m.n=R.frames.length;
  replaySave(m,R.frames).catch(()=>{});}
const REP_MEM=[];
const RDB={p:null,open(){if(this.p)return this.p;this.p=new Promise((res,rej)=>{try{const r=indexedDB.open(RR_MODE==='sandbox'?'rr-sandbox-replays':'rr-replays',1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'id'});if(!db.objectStoreNames.contains('frames'))db.createObjectStore('frames',{keyPath:'id'});};
    r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e);}});this.p.catch(()=>{this.p=null;});return this.p;}};
const idbReq=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
async function replayList(){try{const db=await RDB.open();const all=await idbReq(db.transaction('meta').objectStore('meta').getAll());return(all||[]).sort((a,b)=>b.date-a.date);}catch(e){return REP_MEM.map(x=>x.meta).sort((a,b)=>b.date-a.date);}}
async function replayGet(id){try{const db=await RDB.open();const r=await idbReq(db.transaction('frames').objectStore('frames').get(id));return r?r.frames:null;}catch(e){const x=REP_MEM.find(q=>q.meta.id===id);return x?x.frames:null;}}
async function replayDel(id){try{const db=await RDB.open();const t=db.transaction(['meta','frames'],'readwrite');t.objectStore('meta').delete(id);t.objectStore('frames').delete(id);await new Promise(r=>{t.oncomplete=r;t.onerror=r;});}catch(e){const i=REP_MEM.findIndex(q=>q.meta.id===id);if(i>=0)REP_MEM.splice(i,1);}}
async function replaySave(meta,frames){try{const db=await RDB.open();const t=db.transaction(['meta','frames'],'readwrite');t.objectStore('meta').put(meta);t.objectStore('frames').put({id:meta.id,frames});await new Promise((r,j)=>{t.oncomplete=r;t.onerror=()=>j(t.error);});
    const all=await replayList();for(const old of all.slice(10))await replayDel(old.id);}
  catch(e){REP_MEM.push({meta,frames});while(REP_MEM.length>10)REP_MEM.shift();}}
function playReplay(meta,frames){if(!frames||!frames.length||!MODE_BY[meta.mode]){toast('That replay can’t be played');return;}const build=repBuilder(),s0=build(frames[0][1]);audio();closeSheet();lastTrial=null;lastRanked=false;
  MYT=meta.team|0;netStartClient({id:'replay',mode:meta.mode,team:meta.team|0,unit:meta.me,s:s0,watch:'replay',rep:{frames,i:1,acc:0,speed:1,build,meta}});S.st.replays++;persist();}
function replayAdvance(dt){const C=NETC,R=C&&C.rep;if(!R)return;R.acc+=dt;while(R.i<R.frames.length&&R.acc>=R.frames[R.i][0]){R.acc-=R.frames[R.i][0];try{netApplySnap(R.build(R.frames[R.i][1]));}catch(e){}R.i++;}
  if(R.i>=R.frames.length&&!C.endShown){C.endT2=(C.endT2||0)+dt;if(C.endT2>1.2){C.endShown=true;showWatchEnd();}}}
function openReplays(){openSheet(card=>{card.classList.add('repsheet');card.insertAdjacentHTML('beforeend','<h2>Replays</h2><p class="sub">Your last 10 matches are saved on this device. Training and simulations aren’t saved.</p>');
  const list=document.createElement('div');list.className='rp-list';list.innerHTML='<p class="gm-empty">Loading…</p>';card.append(list);menuBack(card);
  replayList().then(ms=>{list.innerHTML='';if(!ms.length){list.innerHTML='<p class="gm-empty">No replays yet. Play a match and it’ll show up here.</p>';return;}
    for(const m of ms){const b=BY_ID[m.rumbler]||BY_ID[STARTER],md=MODE_BY[m.mode],row=document.createElement('div');row.className='rp-row';row.append(thumb(b,getSkin(b,m.skin||'classic'),52));
      const res=m.left?['Left','#9a98a8']:m.result===0?['Win','#6be39a']:m.result===1?['Loss','#ff5d57']:m.result===-1?['Draw','#ffd23f']:['Done','#9a98a8'];
      const when=new Date(m.date).toLocaleString([],{weekday:'short',hour:'2-digit',minute:'2-digit'});
      row.insertAdjacentHTML('beforeend','<span class="rp-info"><b>'+esc(md?md.name:m.mode)+(m.online?' <i class="rp-on">online</i>':'')+'</b><small>'+esc(b.name)+' · '+when+' · '+Math.floor(m.dur/60)+':'+String(m.dur%60).padStart(2,'0')+' · '+(m.kills|0)+' KO</small></span><span class="rp-res" style="color:'+res[1]+'">'+res[0]+'</span>');
      const pl=document.createElement('button');pl.className='btn sm gold';pl.textContent='▶';pl.setAttribute('aria-label','Watch replay');pl.addEventListener('click',()=>{pl.disabled=true;replayGet(m.id).then(fr=>{if(!fr){toast('That replay is missing');pl.disabled=false;return;}playReplay(m,fr);});});
      const del=document.createElement('button');del.className='btn sm';del.textContent='🗑';del.setAttribute('aria-label','Delete replay');del.addEventListener('click',()=>{replayDel(m.id).then(()=>{row.remove();if(!list.children.length)list.innerHTML='<p class="gm-empty">No replays yet. Play a match and it’ll show up here.</p>';});});
      row.append(pl,del);list.append(row);}});});}

/* ---------- Watch a random live match ---------- */
function watchRandom(){openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Watch a random match</h2>');const st=document.createElement('p');st.className='gm-empty big';card.append(st);menuBack(card);
  if(!NETW.ok){st.textContent='No matches found';return;}st.textContent='Looking for a match…';NETW.wantWatch=true;
  NETW.watchCb=ok=>{if(!ok){st.textContent='No matches found';return;}closeSheet();S.st.watched++;persist();};
  netSend({t:'watch'});setTimeout(()=>{if(NETW.watchCb){NETW.watchCb=null;NETW.wantWatch=false;st.textContent='No matches found';}},7000);});}

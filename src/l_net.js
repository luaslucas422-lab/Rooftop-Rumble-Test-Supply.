
/* =====================================================================
   Online multiplayer.
   The game server runs the real match (same code as here, headless) and
   streams snapshots; phones send their joystick and button presses.
   ===================================================================== */
const NET_VER=1;
const NET_SKIP=new Set(['ai','pending','ents','net','_s','seen','onLand','hit','netKey','spawn0']);
let skinIdx=null;
function skinKey(sk){if(!skinIdx){skinIdx=new Map();for(const b of RUMBLERS)for(const s of skinsOf(b))skinIdx.set(s,b.id+'|'+s.id);}return skinIdx.get(sk);}
function netPack(v,cx,depth){
  if(v===null||v===undefined)return v;const ty=typeof v;
  if(ty==='function')return undefined;
  if(ty==='number')return Number.isInteger(v)?v:(isFinite(v)?Math.round(v*100)/100:(v>0?1e9:-1e9));
  if(ty!=='object')return v;
  if(depth>7)return undefined;
  if(Array.isArray(v)){const o=new Array(v.length);for(let i=0;i<v.length;i++)o[i]=netPack(v[i],cx,depth+1);return o;}
  if(v instanceof Set||v instanceof Map)return undefined;
  if(depth>0&&cx.units.has(v))return{$u:v.id};
  if(depth>0&&cx.structs.has(v))return{$t:cx.structs.get(v)};
  if(v.id&&BY_ID[v.id]===v)return{$b:v.id};
  if(v.id&&MODE_BY[v.id]===v)return{$m:v.id};
  if(v.body&&v.tier!==undefined){const k=skinKey(v);if(k)return{$s:k};}
  const o={};for(const k in v){if(NET_SKIP.has(k))continue;const p=netPack(v[k],cx,depth+1);if(p!==undefined)o[k]=p;}return o;}
function netUnpack(v,rs){
  if(v===null||typeof v!=='object')return v;
  if(Array.isArray(v))return v.map(x=>netUnpack(x,rs));
  if(v.$u!=null)return rs.u(v.$u);if(v.$t!=null)return rs.t(v.$t);
  if(v.$b)return BY_ID[v.$b];if(v.$m)return MODE_BY[v.$m];
  if(v.$s){const i=v.$s.indexOf('|');const b=BY_ID[v.$s.slice(0,i)];return b?getSkin(b,v.$s.slice(i+1)):null;}
  const o={};for(const k in v)o[k]=netUnpack(v[k],rs);return o;}
/* which unit each human takes over, per team */
function netCandidates(){const id=M.mode.id,c=[];for(let k=0;k<M.nTeams;k++)c.push([]);
  for(const u of M.units){if(u.team>=c.length)continue;c[u.team].push(u);}
  if(c[0].includes(P)){c[0]=[P].concat(c[0].filter(u=>u!==P));}
  if(id==='duel'){c[0]=c[0].slice(0,1);c[1]=c[1].slice(0,1);}
  if(id==='boss'){c[1]=[];}
  return c;}
function netConvert(humans){const cands=netCandidates();M.netCaps=cands.map(l=>l.length);M.netMap={};
  const human=new Set();
  for(const h of humans){const list=cands[h.team];if(!list||!list.length)continue;const old=list.shift(),b=BY_ID[h.rumbler]||old.b;
    const gear=GEAR[b.id],g=gear&&gear.g.some(x=>x.id===h.gadget)&&h.lvl>=GADGET_LVL?h.gadget:null,s=gear&&gear.s.some(x=>x.id===h.star)&&h.lvl>=STAR_LVL?h.star:null;
    const nu=makeUnit(b,skinsOf(b).some(k=>k.id===h.skin)?h.skin:'classic',old.team,{player:true,name:String(h.name||'Player').slice(0,14),lvl:clamp(h.lvl|0,1,MAX_LVL),spawn:old.spawn,gadget:g,star:s});
    nu.x=old.x;nu.y=old.y;nu.net={mx:0,my:0,aiming:false};nu.netKey=h.key;M.netMap[h.key]=nu.id;human.add(nu);
    const i=M.units.indexOf(old);M.units[i]=nu;if(old===P)P=nu;}
  /* a "player" slot nobody took becomes a normal bot */
  for(let i=0;i<M.units.length;i++){const u=M.units[i];if(u.isPlayer&&!human.has(u)){const lv=randi(1,MAX_LVL),lo=botLoadout(u.b,lv);const nb=makeUnit(u.b,u.sk.id,u.team,{name:botName().slice(0,14),skill:'normal',lvl:lv,spawn:u.spawn,gadget:lo.gadget,star:lo.star});nb.x=u.x;nb.y=u.y;M.units[i]=nb;if(u===P)P=nb;}}
  if(human.size)P=[...human][0];
  M.ents=M.units.slice();M.netEv=[];M.netPlace={};}
function netToBot(u){if(!u||!u.net)return;const t=makeUnit(u.b,u.sk.id,u.team,{name:u.name,skill:'normal',lvl:u.lvl,spawn:u.spawn});u.ai=t.ai;u.isPlayer=false;u.net=null;}

function netSnap(full){const cx={units:new Set(M.units),structs:new Map(M.structs.map((s,i)=>[s,i]))},o={};
      for(const k in M){if(k==='units'||k==='structs'||k==='fx'||k==='texts'||k==='decals'||k==='embers'||k==='ents'||k==='reward'||k==='draft'||k==='netEv'||k==='netMap'||k==='netCaps'||k==='netPlace')continue;const p=netPack(M[k],cx,1);if(p!==undefined)o[k]=p;}
      o.units=M.units.map(u=>netPack(u,cx,0));o.structs=M.structs.map(s=>netPack(s,cx,0));
      for(const k of['fx','texts','decals']){const l=[];for(const f of M[k])if(!f._s||full){f._s=1;if(l.length<120)l.push(netPack(f,cx,1));}o[k]=l;}
      o.ev=M.netEv;M.netEv=[];return o;}
/* ---------- headless side (inside the server) ---------- */
if(NETS){
  window.__rrNet={
    ver(){return NET_VER;},
    start(spec){S.trophies=clamp(spec.trophies|0,0,TROPHY_MAX);newMatch({mode:spec.mode,netHumans:spec.humans||[]});M.netId=spec.id;if(spec.time)M.time=spec.time;return{caps:M.netCaps,map:M.netMap,nTeams:M.nTeams};},
    caps(mode){newMatch({mode,netHumans:[]});const c=M.netCaps;M=null;P=null;return c;},
    input(key,inp){if(!M)return;const u=M.units.find(x=>x.id===M.netMap[key]);if(!u||!u.net)return;
      if(inp.mx!=null){let mx=+inp.mx||0,my=+inp.my||0;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}u.net.mx=mx;u.net.my=my;}
      if(inp.aim!=null&&isFinite(inp.aim))u.aim=+inp.aim;u.net.aiming=!!inp.aiming;
      if(inp.k&&!u.dead&&M.state==='play'){const a=isFinite(inp.a)?+inp.a:u.aim,d=isFinite(inp.d)?+inp.d:300;
        if(inp.k==='atk')tryAttack(u,a,d);else if(inp.k==='sup')trySuper(u,a,d);else if(inp.k==='gad')useGadget(u,isFinite(inp.a)?+inp.a:undefined);}
      if(inp.k==='qc'&&!u.dead){const i=parseInt(inp.id,10);if(QUICK_CHAT[i]&&(u.qcCd||0)<=M.now){u.say={txt:QUICK_CHAT[i],at:M.now};u.qcCd=M.now+2.5;}}
      if(inp.k==='pin'&&typeof inp.id==='string'&&/^[a-z]:[a-z_0-9:]+$/.test(inp.id))sendPin(u,inp.id);},
    leave(key){if(!M)return;const u=M.units.find(x=>x.id===M.netMap[key]);netToBot(u);},
    step(dt){if(!M)return;update(dt);
      if(M.mode.sd)for(let k=0;k<M.nTeams;k++)if(M.elim[k]&&!M.netPlace[k]){let left=0;for(let j=0;j<M.nTeams;j++)if(!M.elim[j])left++;M.netPlace[k]=left+1;}},
    state(){return M?M.state:null;},timeLeft(){return M?Math.round(M.time):0;},endT(){return M?M.endT:0;},
    snap(full){return netSnap(full);},
    results(){const out=[];const sc=M.score,nT=M.nTeams;
      for(const u of M.units){if(!u.netKey&&!u.isPlayer)continue;const key=Object.keys(M.netMap).find(k=>M.netMap[k]===u.id);if(!key)continue;const t=u.team;let w,place=0;
        if(M.mode.sd){place=M.netPlace[t]||1;if(!M.netPlace[t]){const alive=[];for(let k=0;k<nT;k++)if(!M.netPlace[k])alive.push(k);if(alive.length>1){const tc=k=>M.units.filter(x=>x.team===k&&!x.shadow).reduce((n,x)=>n+(x.cubes||0),0);place=1+alive.filter(k=>k!==t&&tc(k)>tc(t)).length;}}
          w=place<=SD_WIN_PLACES?0:place<=Math.ceil(nT/2)?-1:1;}
        else if(M.mode.ffa){place=1+sc.filter((v,k)=>k!==t&&v>sc[t]).length;w=place===1?0:place<=3?-1:1;}
        else{const w0=M.result;w=t===0?w0:w0===0?1:w0===1?0:-1;}
        out.push({key,w,place,kills:u.kills||0,cubes:u.cubes||0,star:M.star===u});}
      return out;}
  };
}

/* ---------- client side ---------- */
const NETW={ws:null,url:'',ok:false,pid:null,retry:0,searchCb:null,queue:null,party:[],partyLeader:null,chat:[]};
let NETC=null;
const NET_CLIENT_SKIP=new Set(['units','structs','fx','texts','decals','ev','result','place','shown','endT','reward','left','star','shake','net','netId','trial','ranked','sim','watch','followU','followDeadT','pMoved']);
const DEFAULT_SERVER=RR_MODE==='sandbox'?'':'wss://rooftop-rumble-server.onrender.com';
const BETA_URL='https://rooftop-rumble-server.onrender.com/beta';
function netUrl(){let u=DEFAULT_SERVER.trim().replace(/\/+$/,'');if(!u)return'';if(/^https?:\/\//i.test(u))u=u.replace(/^http/i,'ws');else if(!/^wss?:\/\//i.test(u))u='wss://'+u;return u;}
function netSend(o){if(NETW.ws&&NETW.ws.readyState===1)NETW.ws.send(JSON.stringify(o));}
function myPid(){if(!S.pid){S.pid='p'+(S.seed>>>0).toString(36)+Math.random().toString(36).slice(2,8);persist();}return S.pid;}
function netHello(){if(!NETW.ok)return;const b=BY_ID[S.selected],me=S.owned[b.id];netSend({t:'hello',v:NET_VER,ageBand:S.ageBand||'kid',profile:myProfile(),code:playerCode(),findByName:!!S.findByName,icon:S.icon,pid:myPid(),name:safeName(S.name),rumbler:b.id,skin:me.skin,trophies:S.trophies|0,invites:S.invitesOn!==false,load:{rumbler:b.id,skin:me.skin,lvl:me.lvl,gadget:me.gadget,star:me.star,name:safeName(S.name),trophies:S.trophies|0}});}
function netConnect(){const url=netUrl();if(NETW.ws){try{NETW.ws.onclose=null;NETW.ws.close();}catch(e){}NETW.ws=null;}NETW.ok=false;netBadge();if(!url||typeof WebSocket==='undefined')return;NETW.url=url;
  let ws;try{ws=new WebSocket(url);}catch(e){return;}NETW.ws=ws;
  ws.onopen=()=>{NETW.ok=true;NETW.retry=0;netHello();netBadge();};
  ws.onclose=()=>{const was=NETW.ok;NETW.ok=false;NETW.ws=null;NETW.party=[];NETW.partyLeader=null;if((S.party||[]).length){S.party=[];persist();try{renderParty();}catch(e){}}netBadge();if(NETC&&M&&M.state!=='ended'&&!NETC.watch){toast('Lost connection to the server');netEndLocal();}else if(NETC&&NETC.watch==='live'&&!NETC.endShown){NETC.endShown=true;toast('Lost connection to the server');showWatchEnd();}if(NETW.queue)netQueueUi(null);
    if(netUrl()){NETW.retry=Math.min(30,NETW.retry+3);setTimeout(()=>{if(!NETW.ws)netConnect();},NETW.retry*1000);}};
  ws.onerror=()=>{};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}netOnMsg(m);};}
function netBadge(){const b=$('#onlineBtn');if(!b)return;const on=S.playOnline!==false;
  b.classList.toggle('on',on&&NETW.ok);b.innerHTML='<i></i>'+(!netUrl()?(RR_MODE==='sandbox'?'Sandbox · offline':'Offline · no server set'):!NETW.ok?(on?'Connecting…':'Offline'):on?'Online':'Offline (tap for online)');}
function netOnMsg(m){
  if(m.t==='search'&&NETW.searchCb)NETW.searchCb(m.list||[]);
  else if(m.t==='invite')netShowInvite(m);
  else if(m.t==='presence'){if(NETW.presenceCb)NETW.presenceCb(m.list||[]);}
  else if(m.t==='joinreq'){if(S.invitesOn===false)return;const b=BY_ID[m.rumbler]||BY_ID[STARTER];openSheet(card=>{card.append(thumb(b,getSkin(b,m.skin||'classic'),90));card.insertAdjacentHTML('beforeend','<h2>'+esc(safeName(m.name))+' wants to join you!</h2><p class="sub">Let them into your party? You’ll play online matches together.</p>');
    const y=document.createElement('button');y.className='btn green';y.textContent='Let them in';y.addEventListener('click',()=>{netSend({t:'letin',who:m.from});closeSheet();});const n=document.createElement('button');n.className='btn';n.textContent='No thanks';n.addEventListener('click',closeSheet);card.append(y,n);});}
  else if(m.t==='party'){NETW.party=(m.members||[]).filter(x=>x.pid!==S.pid);NETW.partyLeader=m.leader;{S.friends=S.friends||[];for(const x of NETW.party){S.friends=S.friends.filter(f=>f.id!==x.pid);S.friends.unshift({id:x.pid,name:safeName(x.name)});}S.friends=S.friends.slice(0,20);}S.party=NETW.party.slice(0,2).map(x=>({id:x.pid,name:safeName(x.name),rumbler:BY_ID[x.rumbler]?x.rumbler:STARTER,skin:x.skin||'classic',profile:x.profile||null}));persist();if(typeof renderParty==='function')renderParty();}
  else if(m.t==='toast')toast(esc(String(m.msg||'')));
  else if(m.t==='pchat'){const t=typeof m.txt==='string'?(S.ageBand==='teen'?chatFilter(m.txt):''):QUICK_CHAT[m.i|0];if(t)chatGot(safeName(m.name),t,m.pid,false);}
  else if(m.t==='queue')netQueueUi(m.cancel?null:m);
  else if(m.t==='start'){if(m.watch&&!NETW.wantWatch)return;NETW.wantWatch=false;if(m.watch&&NETW.watchCb){NETW.watchCb(true);NETW.watchCb=null;}netStartClient(m);}
  else if(m.t==='watch'){if(m.none&&NETW.watchCb){NETW.watchCb(false);NETW.watchCb=null;NETW.wantWatch=false;}}
  else if(m.t==='watchEnd'){if(NETC&&NETC.watch==='live'&&!NETC.endShown){NETC.endShown=true;showWatchEnd();}}
  else if(m.t==='snap')netApplySnap(m.s);
  else if(m.t==='end')netEndClient(m);}
/* matchmaking */
function netCanPlay(){const sb=BY_ID[S.selected];if(sb&&sb.beta)return false;return S.playOnline!==false&&NETW.ok;}
function netTeamCap(m){m=MODE_BY[m];if(!m)return 3;if(m.id==='duel'||m.ffa)return 1;if(m.sd)return m.size||1;return 3;}
function netQueue(modeId){if((NETW.party||[]).length+1>netTeamCap(modeId)){toast('<b style="color:#ff5d57">TOO MANY PEOPLE IN PARTY!</b>');sfx('thud');return;}const b=BY_ID[S.selected],me=S.owned[b.id];audio();sfx('click');
  netSend({t:'queue',mode:modeId,load:{rumbler:b.id,skin:me.skin,lvl:me.lvl,gadget:me.gadget,star:me.star,name:safeName(S.name),trophies:S.trophies|0}});
  netQueueUi({n:1,need:0,mode:modeId,wait:0});}
function netQueueUi(m){const mm=$('#mm');NETW.queue=m;if(!m){mm.hidden=true;return;}mm.hidden=false;
  $('#mmKicker').textContent='Online · '+(MODE_BY[m.mode]?MODE_BY[m.mode].name:'');$('#mmTitle').textContent=m.found?'Match found!':'Finding players';
  $('#mmMode').textContent=m.need?m.n+' / '+m.need+' players'+(m.left!=null?' · bots fill in after '+Math.max(0,Math.ceil(m.left))+'s':''):'Connecting to the queue…';$('#mmOpp').hidden=true;
  const slots=$('#mmSlots');slots.innerHTML='';const pl=m.players&&m.players.length?m.players:[{name:S.name,rumbler:S.selected,skin:(S.owned[S.selected]||{}).skin,icon:S.icon}];
  for(let i=0;i<Math.max(m.need||1,pl.length);i++){const d=document.createElement('div'),q=pl[i];d.className='mm-slot '+(q?'in blue':'wait');
    if(q){const b=BY_ID[q.rumbler]||BY_ID[STARTER];d.append(thumb(b,getSkin(b,q.skin||'classic'),60));if(q.icon){const ic=iconCanvas(q.icon,22);ic.classList.add('mm-ic');d.append(ic);}d.insertAdjacentHTML('beforeend','<small class="mm-nm">'+esc(safeName(q.name||'Player'))+'</small>');}slots.append(d);}}
/* the match on this phone */
function netStartClient(m){NETW.queue=null;$('#mm').hidden=true;clearMM&&clearMM();lastRanked=false;lastTrial=null;
  const mode=MODE_BY[m.mode];loadMap(m.s&&m.s.mapId&&MAPS[m.s.mapId]?m.s.mapId:mode.map);MYT=m.team|0;
  M={mode,ranked:false,units:[],structs:[],ents:[],shots:[],fields:[],items:[],cubes:[],boxes:[],elim:{},fx:[],decals:[],texts:[],score:[],time:mode.time,now:0,state:'countdown',cd:3.6,tick:0,zone:'empty',endT:0,result:null,place:0,reward:null,shown:false,nTeams:2,crown:null,storm:null,shake:0,battT:2,embers:[],net:true};
  for(let i=0;i<40;i++)M.embers.push({x:rand(0,MW),y:rand(0,MH),s:rand(1,2.6),v:rand(8,26),ph:rand(0,TAU)});
  NETC={id:m.id,me:m.unit,umap:new Map(),smap:[],lastIn:0,sent:{},ended:false,watch:m.watch||null,follow:m.watch==='replay'?m.unit:null,rep:m.rep||null};P=null;
  if(m.s)netApplySnap(m.s);enterGame();}
function netApplySnap(s){if(!NETC||!M||!s)return;const C=NETC,first=!C.got;C.got=true;if(C.watch&&C.follow==null&&s.units&&s.units.length){const h=s.units.find(x=>x.isPlayer)||s.units[0];C.follow=h.id;}if(!C.watch)recPush(s);
  const keep=new Map();for(const pu of s.units){let u=C.umap.get(pu.id);if(!u){u={ghosts:[],pending:[],mods:{},stolen:[]};C.umap.set(pu.id,u);}keep.set(pu.id,u);}
  for(const id of[...C.umap.keys()])if(!keep.has(id))C.umap.delete(id);
  const structs=s.structs.map((ps,i)=>C.smap[i]||(C.smap[i]={}));C.smap.length=s.structs.length;
  const rs={u:id=>C.umap.get(id)||null,t:i=>structs[i]||null};
  for(const pu of s.units){const u=C.umap.get(pu.id),wasDead=u.dead,ox=u.x,oy=u.y;const d=netUnpack(pu,rs);
    for(const k in d){if(k==='ghosts'&&u.ghosts&&u!==P)continue;u[k]=d[k];}u.ghosts=u.ghosts||[];
    u.isPlayer=C.watch==='live'?false:u.id===C.me;u.tx=d.x;u.ty=d.y;
    if(!first&&ox!=null&&!u.dead&&!wasDead){const far=Math.hypot(d.x-ox,d.y-oy)>(u.isPlayer?90:160);if(!far){u.x=ox;u.y=oy;}}
    if(C.watch?u.id===C.follow:u.isPlayer)P=u;}
  M.units=s.units.map(pu=>C.umap.get(pu.id));
  s.structs.forEach((ps,i)=>{const d=netUnpack(ps,rs);Object.assign(structs[i],d);});M.structs=structs;
  for(const k in s){if(NET_CLIENT_SKIP.has(k)||k==='state'&&M.state==='ended')continue;M[k]=netUnpack(s[k],rs);}
  for(const k of['fx','texts','decals'])if(s[k])for(const f of s[k]){const o=netUnpack(f,rs);if(M[k].length<900)M[k].push(o);}
  if(s.ev)for(const e of s.ev){if(e[0]==='s'){const prev=SFXU;SFXU=C.umap.get(e[2])||null;try{sfx(e[1]);}catch(x){}SFXU=prev;}else if(e[0]==='k'){const a=C.umap.get(e[1])||null,b=C.umap.get(e[2]);if(b)try{onKillFeed(a,b);}catch(x){}}}
  M.ents=M.units.concat(M.structs.filter(x=>!x.dead));}
function netClientUpdate(dt){const C=NETC;if(!C||!M)return;if(C.watch==='replay'){dt*=C.rep.speed;replayAdvance(dt);}
  if(C.watch&&M.state==='ended'&&!C.endShown){C.endT=(C.endT||0)+dt;if(C.endT>1.6){C.endShown=true;showWatchEnd();}}
  if(M.state==='countdown')M.cd=Math.max(0,M.cd-dt);M.now+=dt;if(M.state==='play')M.time=Math.max(0,M.time-dt);
  for(const u of M.units){if(u.tx==null)continue;if(u===P&&!C.watch&&!u.dead&&!u.dash&&!u.thrown&&!u.leap&&!u.kb&&u.stunT<=0&&M.state==='play'){
      const[mx0,my0]=playerMove();if(mx0||my0)M.pMoved=true;let mx=mx0,my=my0;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}
      const sp=u.b.speed*(1+(u.mods.speed||0))*(u.boostT>0?1.4:1)*(u.slowT>0?.55:1)*(u.hasCrown?.9:1)*(u.zoneT>0?1.1:1);const ox=u.x,oy=u.y;
      if(l>.01)moveBy(u,mx*sp*dt,my*sp*dt);u.moving=l>.01;if(u.moving&&!aimingNow()&&M.now-(u.lastAttack||0)>.4)u.aim=Math.atan2(my,mx);
      const k=Math.min(1,dt*(u.moving?1.2:5));u.x+=(u.tx-u.x)*k;u.y+=(u.ty-u.y)*k;}
    else{const k=Math.min(1,dt*14);u.x+=(u.tx-u.x)*k;u.y+=(u.ty-u.y)*k;}
    u.pinT=(u.pinT||0)-dt;if(u.pinT<=0&&u.pin)u.pin=null;u.flash=Math.max(0,(u.flash||0)-dt*5);
    if(u.ghosts)for(let i=u.ghosts.length-1;i>=0;i--){u.ghosts[i].t+=dt;if(u.ghosts[i].t>.3)u.ghosts.splice(i,1);}}
  for(const s of M.shots){if(s.lob){s.t=Math.min(s.T||1,(s.t||0)+dt);}else if(s.vx!=null&&s.vy!=null){s.x+=s.vx*dt;s.y+=s.vy*dt;}}
  try{updateFx(dt);}catch(e){}
  C.lastIn-=dt;if(C.lastIn<=0&&P&&!C.watch){C.lastIn=.05;const[mx,my]=playerMove();const o={t:'in',mx:+mx.toFixed(2),my:+my.toFixed(2),aim:+(P.aim||0).toFixed(3),aiming:!!aimingNow()};
    const key=o.mx+','+o.my+','+o.aim+','+o.aiming;if(key!==C.sentKey||C.idle>.5){C.sentKey=key;C.idle=0;netSend(o);}else C.idle=(C.idle||0)+.05;}}
function netAct(k,a,d,id){if(!NETC)return;const o={t:'in',k};if(a!=null)o.a=+(+a).toFixed(3);if(d!=null)o.d=Math.round(d);if(id)o.id=id;netSend(o);}
function netEndClient(m){if(!NETC||!M||NETC.watch)return;const r=m.r||{};if(S.st){const k=M.mode.id;S.st.modes[k]=S.st.modes[k]||[0,0];S.st.modes[k][0]++;if(r.w===0)S.st.modes[k][1]++;if(M.mode.sd&&(r.place|0)===1)S.st.sdWins++;S.st.kills+=r.kills|0;S.st.time+=Math.round(M.now);}NETC.ended=true;M.state='ended';M.endT=0;M.result=r.w;M.place=r.place||0;if(P){P.kills=r.kills|0;P.cubes=r.cubes|0;}if(r.star)M.star=P;
  M.reward=applyRewards();sfx(r.w===0?'win':r.w===1?'lose':'draw');setTimeout(()=>{if(M&&NETC&&!M.shown){M.shown=true;showEnd();}},1500);}
function netEndLocal(){if(!M)return;M.state='ended';M.result=1;M.place=0;M.left=true;M.reward=applyRewards();setTimeout(()=>{if(M&&!M.shown){M.shown=true;showEnd();}},600);}
function netLeave(){if(NETC){netSend({t:'leave'});NETC=null;}MYT=0;}

/* ---------- party, search and invites over the server ---------- */
function renderParty(){if(!Array.isArray(S.party))S.party=[];{const lc=$('#lobbyChat');if(lc)lc.hidden=!(S.party.length&&NETW.ok);}for(let i=0;i<2;i++){const el=$('#party'+i);if(!el)continue;const f=S.party[i],b=f&&BY_ID[f.rumbler];el.innerHTML='';el.classList.toggle('full',!!b);
  if(b){el.style.setProperty('--r',RARITY[b.rarity].col);el.append(thumb(b,getSkin(b,f.skin||'classic'),104));el.insertAdjacentHTML('beforeend','<small>'+esc(f.name)+'</small>');}else el.textContent='+';}}
function openParty(i){const f=(S.party||[])[i];
  if(f){openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(f.name)+'</h2><p class="sub">In your party with '+esc(BY_ID[f.rumbler].name)+'. When the party leader presses Play, you all join the same online match on the same team.</p>');
    if(f.profile){const pb=document.createElement('button');pb.className='btn gold';pb.textContent='See '+f.name+'\u2019s profile';pb.addEventListener('click',()=>openProfile(f.profile,false));card.append(pb);}
    const k=document.createElement('button');k.className='btn';k.textContent='Leave party';k.addEventListener('click',()=>{netSend({t:'leaveParty'});S.party=[];NETW.party=[];persist();closeSheet();renderParty();});card.append(k);});return;}
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Invite a friend</h2><p class="sub">Type their player code (it’s on their profile), or their name if they allow it, then tap Invite. Your code: <b>'+playerCode()+'</b>. Friends who join play in your online matches with you.</p>');
    const inp=document.createElement('input');inp.className='psearch';inp.placeholder='Player code or name…';inp.type='search';inp.autocomplete='off';card.append(inp);
    const list=document.createElement('ul');list.className='plist';card.append(list);
    const x=document.createElement('button');x.className='btn';x.textContent='Close';x.style.marginTop='10px';x.addEventListener('click',()=>{NETW.searchCb=null;closeSheet();});card.append(x);
    if(!NETW.ok){list.innerHTML='<li><span>'+(netUrl()?'Can’t reach the game server right now.':'No game server set yet. Add your server link in Settings to play online.')+'</span></li>';inp.disabled=true;return;}
    let tm=0;NETW.searchCb=res=>{list.innerHTML='';if(!res.length){list.innerHTML='<li><span>No players found. They need to be online right now.</span></li>';return;}
      for(const p of res){const b=BY_ID[p.rumbler]||BY_ID[STARTER],li=document.createElement('li');li.append(iconCanvas(p.icon||('r:'+b.id),36));
        li.insertAdjacentHTML('beforeend','<span>'+esc(safeName(p.name))+'<br><small>'+esc(b.name)+' · '+(p.trophies|0)+' trophies</small></span>');
        const bt=document.createElement('button');bt.className='btn sm '+(p.invites===false?'':'green');bt.textContent=p.invites===false?'Invites off':'Invite';bt.disabled=p.invites===false;
        bt.addEventListener('click',()=>{netSend({t:'invite',to:p.pid});bt.disabled=true;bt.textContent='Invited!';});li.append(bt);
        if(p.invites!==false){const jb=document.createElement('button');jb.className='btn sm gold';jb.textContent='Join';jb.addEventListener('click',()=>{netSend({t:'joinreq',to:p.pid});jb.disabled=true;jb.textContent='Asked!';});li.append(jb);}list.append(li);}};
    if((S.friends||[]).length){const fh=document.createElement('div');fh.className='friends';fh.innerHTML='<h3 class="pf-h">Friends</h3><ul class="plist"><li><span>Checking who’s online…</span></li></ul>';list.before(fh);const fl=fh.querySelector('ul');
      NETW.presenceCb=res=>{fl.innerHTML='';for(const f of S.friends){const on=res.find(r=>r.pid===f.id),li=document.createElement('li');li.append(iconCanvas(on&&on.icon||'r:'+STARTER,36));
        li.insertAdjacentHTML('beforeend','<span>'+esc(f.name)+'<br><small style="color:'+(on?(on.inMatch?'#ffd23f':'#6be39a'):'#9a98a8')+'">● '+(on?(on.inMatch?'In a match':'Online in the lobby'):'Offline')+'</small></span>');
        if(on&&!on.inMatch&&on.invites!==false){const jb=document.createElement('button');jb.className='btn sm gold';jb.textContent='Join';jb.addEventListener('click',()=>{netSend({t:'joinreq',to:f.id});jb.disabled=true;jb.textContent='Asked!';});const ib=document.createElement('button');ib.className='btn sm green';ib.textContent='Invite';ib.addEventListener('click',()=>{netSend({t:'invite',to:f.id});ib.disabled=true;ib.textContent='Invited!';});li.append(ib,jb);}fl.append(li);}};
      netSend({t:'presence',pids:S.friends.map(f=>f.id)});}
    const go=()=>{const q=inp.value.trim();if(q.length<2){list.innerHTML='<li><span>Type at least 2 letters.</span></li>';return;}list.innerHTML='<li><span>Searching…</span></li>';netSend({t:'search',q});};
    inp.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(go,250);});setTimeout(()=>inp.focus(),50);});}
function netShowInvite(v){if(S.invitesOn===false)return;const b=BY_ID[v.rumbler]||BY_ID[STARTER];
  openSheet(card=>{card.append(thumb(b,getSkin(b,v.skin||'classic'),90));card.insertAdjacentHTML('beforeend','<h2>'+esc(safeName(v.name))+' invited you!</h2><p class="sub">Join their party? You’ll play online matches together on the same team.</p>');
    const y=document.createElement('button');y.className='btn green';y.textContent='Join';y.addEventListener('click',()=>{netSend({t:'accept',from:v.from});closeSheet();});
    const n=document.createElement('button');n.className='btn';n.textContent='No thanks';n.addEventListener('click',closeSheet);card.append(y,n);});}
for(let i=0;i<2;i++){const el=$('#party'+i);if(el)el.addEventListener('click',()=>{sfx('tap');openParty(i);});}
$('#invSwitch').addEventListener('click',()=>{S.invitesOn=S.invitesOn===false;persist();renderSettings();netHello();toast(S.invitesOn?'Invites are on':'Invites are off');});

{const ob=$('#onlineBtn');if(ob)ob.addEventListener('click',()=>{S.playOnline=S.playOnline===false;persist();netBadge();});}
setInterval(()=>{if(NETW.ok&&!NETC)netHello();},30000);
setTimeout(netConnect,600);

/* party lobby quick chat: the little chat button under your rumbler */
{const cb=$('#lobbyChat');if(cb)cb.addEventListener('click',()=>{sfx('click');openPartyChat();});}

/* ---------- Party chat (lobby only) ---------- */
function chatGot(name,txt,pid,me){NETW.chat.push({name,txt,me});if(NETW.chat.length>30)NETW.chat.shift();
  const i=(S.party||[]).findIndex(f=>f.id===pid),slot=me?$('#lobbyStageMe'):i>=0?$('#party'+i):null;
  if(slot){const old=slot.querySelector('.pbubble');if(old)old.remove();const bb=document.createElement('span');bb.className='pbubble';bb.textContent=txt;slot.append(bb);slot.classList.add('talking');setTimeout(()=>{bb.remove();if(!slot.querySelector('.pbubble'))slot.classList.remove('talking');},4500);}
  const log=$('#chatLog');if(log)renderChatLog(log);else if(!me)toast('<b>'+esc(name)+':</b> '+esc(txt));if(!me)sfx('pin');}
function renderChatLog(el){el.innerHTML=NETW.chat.length?NETW.chat.slice(-12).map(c=>'<p class="'+(c.me?'me':'')+'"><b>'+esc(c.me?'You':c.name)+'</b> '+esc(c.txt)+'</p>').join(''):'<p class="empty">No messages yet. Say hi!</p>';el.scrollTop=el.scrollHeight;}
function openPartyChat(){if(!canQuickChat()){toast('Party chat unlocks from age 7. You can still send pins in matches.');return;}if(!NETW.ok||!(S.party||[]).length){toast('Invite friends to your party to chat with them');return;}
  const teen=S.ageBand==='teen';
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Party chat</h2><p class="sub">Only people in your party see this. '+(teen?'Links, phone numbers and rude words get blocked. Friends under 15 only see quick chat.':'Typing your own messages unlocks at age 15. For now, tap a message below.')+'</p>');
    const log=document.createElement('div');log.className='chatlog';log.id='chatLog';card.append(log);renderChatLog(log);
    if(teen){const row=document.createElement('form');row.className='chatrow';row.innerHTML='<input class="chatin" maxlength="80" placeholder="Type a message…" autocomplete="off" aria-label="Message"><button class="btn primary sm" type="submit">Send</button>';
      row.addEventListener('submit',e=>{e.preventDefault();const inp=row.querySelector('input'),t=chatFilter(inp.value);if(!t.replace(/[\s*]/g,''))return;const now=Date.now();if(now-(NETW.lastChat||0)<1200){toast('Slow down a little');return;}NETW.lastChat=now;netSend({t:'pchat',txt:t});chatGot('You',t,null,true);inp.value='';});card.append(row);}
    const g=document.createElement('div');g.className='qc-grid';QUICK_CHAT.forEach((t,i)=>{const b=document.createElement('button');b.className='qcopt';b.textContent=t;b.addEventListener('click',()=>{const now=Date.now();if(now-(NETW.lastChat||0)<1200)return;NETW.lastChat=now;netSend({t:'pchat',i});chatGot('You',t,null,true);});g.append(b);});card.append(g);
    const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}

/* closing or leaving the app fully disconnects you (and takes you out of your party); coming back reconnects */
let netAwayT=0;
window.addEventListener('pagehide',()=>{try{if(NETW.ws){netSend({t:'leaveParty'});NETW.ws.close();}}catch(e){}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(netAwayT);netAwayT=setTimeout(()=>{if(document.hidden&&NETW.ws&&!(NETC&&M&&M.state!=='ended')){try{netSend({t:'leaveParty'});NETW.ws.close();}catch(e){}}},30000);}
  else{clearTimeout(netAwayT);if(!NETW.ws)netConnect();}});

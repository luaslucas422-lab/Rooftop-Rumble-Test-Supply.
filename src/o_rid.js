
/* ================= Rumble ID (accounts) + Parent controls ================= */
const RID_TOKEN_KEY='rr-rid-token',RID_SAVE_KEY='rr-rid-saved';
let ridTok=(()=>{try{return localStorage.getItem(RID_TOKEN_KEY)||'';}catch(e){return'';}})();
function ridSetTok(t){ridTok=t||'';try{if(t)localStorage.setItem(RID_TOKEN_KEY,t);else localStorage.removeItem(RID_TOKEN_KEY);}catch(e){}}
let ridRq=0,ridAcct=null,ridLastHash=0,ridLastUp=(()=>{try{return+localStorage.getItem(RID_SAVE_KEY)||0;}catch(e){return 0;}})();
const ridWait=new Map();
/* tidy the saved Rumble ID + parent control data */
{const r=S.rid;S.rid=r&&typeof r==='object'&&typeof r.id==='string'?{id:r.id.slice(0,20),email:String(r.email||'').slice(0,80),giftDone:!!r.giftDone}:null;if(!ridTok)S.rid=null;
  const p=S.pc&&typeof S.pc==='object'?S.pc:{};const n=(v,d)=>Number.isFinite(+v)?Math.max(0,+v):d;
  S.pc={pin:typeof p.pin==='string'?p.pin.slice(0,20):'',maxMatches:n(p.maxMatches,0),playMins:n(p.playMins,0),allowBuy:p.allowBuy!==false,allowOnline:p.allowOnline!==false,allowChat:p.allowChat!==false,
    day:typeof p.day==='string'?p.day:'',played:n(p.played,0),secs:n(p.secs,0),bonus:n(p.bonus,0),free:typeof p.free==='string'?p.free:''};
  if(S.ageNum!=null)S.ageNum=clamp(S.ageNum|0,4,18);}
const ridOn=()=>!!(ridTok&&S.rid&&S.rid.id);
function ridCall(op,data){return new Promise(res=>{if(!NETW.ok){res({op:'err',msg:'You need to be online for Rumble ID. Check your internet and try again.'});return;}
  const rq=++ridRq;ridWait.set(rq,res);netSend({t:'rid',rq,op,token:ridTok||undefined,...(data||{})});
  setTimeout(()=>{if(ridWait.has(rq)){ridWait.delete(rq);res({op:'err',msg:'The server didn’t answer. Try again.'});}},25000);});}
{const _on=netOnMsg;netOnMsg=function(m){if(m&&m.t==='rid'){const f=ridWait.get(m.rq|0);if(f){ridWait.delete(m.rq|0);f(m);}return;}return _on(m);};}
{const _nh=netHello;netHello=function(){_nh();if(ridTok)ridResume();};}
async function ridResume(){const r=await ridCall('resume');if(r.op==='signedout'){ridSetTok('');S.rid=null;ridAcct=null;persist();toast('You were signed out of your Rumble ID');return;}
  if(r.op==='ok'){ridAcct=r;S.rid=S.rid||{id:r.id,email:r.email,giftDone:false};S.rid.id=r.id;S.rid.email=r.email;if(!S.pc.pin&&r.pc&&r.pc.pin){Object.assign(S.pc,r.pc);}persist();}}
/* cloud save: uploads your game when it changes (not mid-match) */
async function ridUpload(force){if(!ridOn()||!NETW.ok||(view==='game'&&!force))return false;const js=JSON.stringify(S),h=hashStr(js);if(!force&&h===ridLastHash)return false;
  const r=await ridCall('save',{save:js});if(r.op==='saved'){ridLastHash=h;ridLastUp=r.saveT;try{localStorage.setItem(RID_SAVE_KEY,String(r.saveT));}catch(e){}return true;}return false;}
setInterval(()=>{ridUpload(false).catch(()=>{});},45000);
function agoText(t){if(!t)return'never';const s=Math.max(0,(Date.now()-t)/1000);return s<60?'just now':s<3600?Math.floor(s/60)+' min ago':s<86400?Math.floor(s/3600)+' h ago':Math.floor(s/86400)+' days ago';}
async function ridLoadCloud(){const r=await ridCall('load');if(r.op!=='load'||!r.save){toast(r.msg||'No online save yet');return false;}
  let o=null;try{o=JSON.parse(r.save);}catch(e){}if(!o){toast('That online save looks broken');return false;}
  const keep=S.rid,pc=S.pc;S=loadSave(o);S.rid=keep;if(!S.pc||!S.pc.pin)S.pc=pc;ridLastHash=hashStr(JSON.stringify(S));persist();renderHome();applyTheme();toast('Online save loaded');return true;}
const ridKid=()=>S.ageNum!=null?S.ageNum<13:S.ageBand!=='teen';
function ridField(type,ph,ac){const i=document.createElement('input');i.type=type;i.placeholder=ph;i.className='rid-in';if(ac)i.autocomplete=ac;i.spellcheck=false;i.autocapitalize='off';return i;}
function ridCard(){const d=document.createElement('div');d.className='rid-card';const id=ridOn()?S.rid.id:'RID-????-????';
  d.innerHTML='<div class="rid-chip"></div><div class="rid-logo">RUMBLE ID</div><div class="rid-num">'+esc(id)+'</div><div class="rid-name">'+esc(safeName(S.name))+'</div>';d.prepend(iconCanvas(S.icon||'r:ember',54));return d;}
function openRumbleId(){if(ridOn())return openRidAccount();openSheet(card=>{card.classList.add('rid');
  card.insertAdjacentHTML('beforeend','<p class="of-kick rid-kick">Rumble ID</p><h2>Get your Rumble ID</h2>');card.append(ridCard());
  card.insertAdjacentHTML('beforeend','<ul class="rid-perks"><li><b>🎁</b>Pick a <b>free Epic rumbler</b></li><li><b>💎</b>The exclusive <b>Rumble ID Ember</b> skin</li><li><b>☁️</b>Your progress saved online, so you can play on any device</li><li><b>🔐</b>Two-step verification: a code is sent to your email when you sign in</li></ul>');
  const g=document.createElement('button');g.className='btn rid-google';g.disabled=true;g.innerHTML='<span class="g-logo">G</span> Sign in with Google <small>coming soon</small>';card.append(g);
  const or=document.createElement('p');or.className='rid-or';or.textContent='or use your email';card.append(or);
  let mode='signup';const tabs=document.createElement('div');tabs.className='trackrow rid-tabs';const t1=document.createElement('button'),t2=document.createElement('button');t1.textContent='Create Rumble ID';t2.textContent='Sign in';tabs.append(t1,t2);card.append(tabs);
  const em=ridField('email','Email address','email'),pw=ridField('password','Password (8+ characters)','new-password'),pw2=ridField('password','Type the password again','new-password');
  const kid=ridKid(),par=document.createElement('label');par.className='rid-parent';par.innerHTML='<input type="checkbox"> <span>I’m a parent or guardian, and this is my email</span>';
  const note=document.createElement('p');note.className='sub rid-note';note.textContent=kid?'Under 13? Ask a parent or guardian to make the Rumble ID with their email.':'';
  const err=document.createElement('p');err.className='rid-err';const go=document.createElement('button');go.className='btn gold';
  card.append(em,pw,pw2,note,par,err,go);
  const setMode=m=>{mode=m;t1.className='tpill'+(m==='signup'?' on':'');t2.className='tpill'+(m==='login'?' on':'');pw2.hidden=m!=='signup';par.hidden=!(kid&&m==='signup');note.hidden=!(kid&&m==='signup');pw.autocomplete=m==='signup'?'new-password':'current-password';go.textContent=m==='signup'?'Create my Rumble ID':'Sign in';err.textContent='';};
  t1.addEventListener('click',()=>{sfx('tap');setMode('signup');});t2.addEventListener('click',()=>{sfx('tap');setMode('login');});setMode('signup');
  go.addEventListener('click',async()=>{err.textContent='';const email=em.value.trim(),pass=pw.value;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){err.textContent='Type a real email address.';return;}
    if(mode==='signup'){if(pass.length<8){err.textContent='Your password needs at least 8 characters.';return;}if(pass!==pw2.value){err.textContent='The two passwords don’t match.';return;}
      if(kid&&!par.querySelector('input').checked){err.textContent='A parent or guardian needs to tick the box and use their email.';return;}
      if(kid&&S.pc.pin){const ok=await pcAskPin('A parent needs to enter the Parent controls PIN to make a Rumble ID.');if(!ok)return openRumbleId();}}
    go.disabled=true;go.textContent='Please wait…';const r=await ridCall(mode,{email,pass,parent:mode==='signup'&&kid});go.disabled=false;go.textContent=mode==='signup'?'Create my Rumble ID':'Sign in';
    if(r.op==='code')return openRidCode(r.email||email,r.kind||mode);if(r.op==='ok')return ridDone(r);err.textContent=r.msg||'Something went wrong. Try again.';});
  card.insertAdjacentHTML('beforeend','<p class="sub rid-small">Save codes in Settings still work too.</p>');
  const x=document.createElement('button');x.className='btn';x.textContent='Not now';x.addEventListener('click',closeSheet);card.append(x);});}
function openRidCode(email,kind,pinCb){openSheet(card=>{card.classList.add('rid');
  card.insertAdjacentHTML('beforeend','<p class="of-kick rid-kick">Two-step verification</p><h2>Check your email</h2><p class="sub">We sent a 6-digit code to <b>'+esc(email)+'</b>. It works for 10 minutes. Check spam if you can’t see it.</p>');
  const c=ridField('text','123456','one-time-code');c.inputMode='numeric';c.maxLength=6;c.classList.add('rid-code');card.append(c);
  const err=document.createElement('p');err.className='rid-err';card.append(err);
  const v=document.createElement('button');v.className='btn gold';v.textContent='Verify';card.append(v);
  v.addEventListener('click',async()=>{const code=c.value.replace(/\D/g,'');if(code.length!==6){err.textContent='The code has 6 numbers.';return;}v.disabled=true;
    const r=kind==='pin'?await ridCall('pinVerify',{code}):await ridCall('verify',{email,kind,code});v.disabled=false;
    if(kind==='pin'&&r.op==='pinOk'){pinCb&&pinCb();return;}if(r.op==='ok')return ridDone(r);err.textContent=r.msg||'That didn’t work.';});
  if(kind!=='pin'){const rs=document.createElement('button');rs.className='btn sm';rs.textContent='Send a new code';rs.addEventListener('click',async()=>{const r=await ridCall('resend',{email,kind});err.textContent=r.op==='sent'?'New code sent!':(r.msg||'');});card.append(rs);}
  const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>kind==='pin'?openParentControls():openRumbleId());card.append(x);setTimeout(()=>{try{c.focus();}catch(e){}},200);});}
async function ridDone(r){ridSetTok(r.token);ridAcct=r;const same=S.rid&&S.rid.id===r.id;S.rid={id:r.id,email:r.email,giftDone:same?!!S.rid.giftDone:false};persist();sfx('unlock');
  if(r.saveT&&r.saveT>0){openSheet(card=>{card.classList.add('rid');card.insertAdjacentHTML('beforeend','<p class="of-kick rid-kick">Signed in!</p><h2>Online save found</h2><p class="sub">This Rumble ID has a game saved '+agoText(r.saveT)+'. Which one do you want to play on this device?</p>');
    const a=document.createElement('button');a.className='btn gold';a.textContent='Use my online save';a.addEventListener('click',async()=>{a.disabled=true;await ridLoadCloud();ridAfter(r);});
    const b=document.createElement('button');b.className='btn';b.textContent='Keep this device’s game';b.addEventListener('click',async()=>{await ridUpload(true);ridAfter(r);});
    card.append(a,b);card.insertAdjacentHTML('beforeend','<p class="sub rid-small">Keeping this device’s game replaces the online save.</p>');});return;}
  await ridUpload(true);ridAfter(r);}
function ridAfter(r){if(!r.gift&&!S.rid.giftDone)return openRidGift();toast('Signed in as '+S.rid.id);openRidAccount();}
function openRidGift(){const epics=RUMBLERS.filter(b=>b.rarity==='epic'),left=epics.filter(b=>!S.owned[b.id]);openSheet(card=>{card.classList.add('rid');
  card.insertAdjacentHTML('beforeend','<p class="of-kick rid-kick">Welcome gift</p><h2>Pick a free Epic rumbler</h2><p class="sub">'+(left.length?'Choose any Epic rumbler you don’t have yet. It’s yours to keep!':'You already have every Epic rumbler, so you get 2 Rumbler Boxes instead.')+'</p>');
  const claim=async(fn)=>{const r=await ridCall('gift');if(r.op!=='gift'){toast(r.msg||'Couldn’t reach the server');return;}S.rid.giftDone=true;if(r.ok)fn();else toast('This Rumble ID already got its free rumbler');persist();renderHome();};
  if(!left.length){const b=document.createElement('button');b.className='btn gold';b.textContent='Get 2 Rumbler Boxes';b.addEventListener('click',()=>claim(()=>{for(let k=0;k<2;k++)S.drops.push({r:'rbox',min:null});toast('+2 Rumbler Boxes','drop');openRidAccount();}));card.append(b);return;}
  const g=document.createElement('div');g.className='rid-pick';
  for(const b of epics){const own=!!S.owned[b.id],c=document.createElement('button');c.className='cz-cell'+(own?' locked':'');c.append(thumb(b,getSkin(b,'classic'),64));c.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b><small>'+(own?'Owned':esc(b.role))+'</small>');
    if(!own)c.addEventListener('click',()=>{sfx('tap');openSheet(c2=>{c2.classList.add('rid');c2.insertAdjacentHTML('beforeend','<h2 style="text-align:center">'+esc(b.name)+'?</h2>');const pv=document.createElement('div');pv.className='d-set';pv.append(thumb(b,getSkin(b,'classic'),130));c2.append(pv);
      c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">'+esc(b.role)+'. You can only pick one.</p>');
      const y=document.createElement('button');y.className='btn gold';y.textContent='Pick '+b.name;y.addEventListener('click',()=>{y.disabled=true;claim(()=>{grantRumbler(b.id);sfx('unlock');openSheet(c3=>{c3.classList.add('rid');c3.insertAdjacentHTML('beforeend','<p class="of-kick rid-kick">It’s yours!</p><h2 style="text-align:center">'+esc(b.name)+' unlocked</h2>');const w=document.createElement('div');w.className='ex-burst';w.append(thumb(b,getSkin(b,'classic'),150));c3.append(w);
        const u=document.createElement('button');u.className='btn gold';u.textContent='Use '+b.name;u.addEventListener('click',()=>{S.selected=b.id;persist();closeSheet();renderHome();});const k=document.createElement('button');k.className='btn';k.textContent='Done';k.addEventListener('click',()=>{closeSheet();renderHome();});c3.append(u,k);});});});
      const n=document.createElement('button');n.className='btn';n.textContent='Back';n.addEventListener('click',openRidGift);c2.append(y,n);});});g.append(c);}
  card.append(g);});}
function openRidAccount(){openSheet(card=>{card.classList.add('rid');card.insertAdjacentHTML('beforeend','<p class="of-kick rid-kick">Rumble ID</p><h2>Your Rumble ID</h2>');card.append(ridCard());
  const two=ridAcct?ridAcct.twoStep:true;
  card.insertAdjacentHTML('beforeend','<div class="rid-rows"><div><span>Email</span><b>'+esc(S.rid.email||'')+'</b></div><div><span>Two-step verification</span><b class="'+(two?'on':'')+'">'+(two?'On · code by email':'Waiting for email to be set up')+'</b></div><div><span>Online save</span><b id="ridSaved">'+agoText(ridLastUp)+'</b></div></div>');
  if(!S.rid.giftDone&&!(ridAcct&&ridAcct.gift)){const gb=document.createElement('button');gb.className='btn gold';gb.textContent='🎁 Pick your free Epic rumbler';gb.addEventListener('click',openRidGift);card.append(gb);}
  const sv=document.createElement('button');sv.className='btn primary';sv.textContent='Save online now';sv.addEventListener('click',async()=>{sv.disabled=true;const ok=await ridUpload(true);sv.disabled=false;const el=card.querySelector('#ridSaved');if(el)el.textContent=agoText(ridLastUp);toast(ok?'Saved online':'Couldn’t save right now');});
  const ld=document.createElement('button');ld.className='btn';ld.textContent='Load my online save';ld.addEventListener('click',()=>{openSheet(c2=>{c2.insertAdjacentHTML('beforeend','<h2>Load online save?</h2><p class="sub">This replaces the game on this device with the one saved on your Rumble ID.</p>');const y=document.createElement('button');y.className='btn gold';y.textContent='Load it';y.addEventListener('click',async()=>{await ridLoadCloud();openRidAccount();});const n=document.createElement('button');n.className='btn';n.textContent='Cancel';n.addEventListener('click',openRidAccount);c2.append(y,n);});});
  const so=document.createElement('button');so.className='btn';so.textContent='Sign out';so.addEventListener('click',async()=>{await ridUpload(true).catch(()=>{});await ridCall('logout');ridSetTok('');S.rid=null;ridAcct=null;persist();toast('Signed out. Your game stays on this device.');closeSheet();});
  card.append(sv,ld,so);card.insertAdjacentHTML('beforeend','<p class="sub rid-small">Save codes in Settings still work too.</p>');
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}

/* ---------- Parent controls ---------- */
const pcHash=p=>'p'+hashStr('rr-pin|'+p).toString(36);
const pcOn=()=>!!S.pc.pin;
function pcToday(){const d=new Date().toDateString();if(S.pc.day!==d){S.pc.day=d;S.pc.played=0;S.pc.secs=0;S.pc.bonus=0;}}
function pcBlockReason(){if(!pcOn())return'';pcToday();if(S.pc.free===S.pc.day)return'';
  if(S.pc.maxMatches&&S.pc.played>=S.pc.maxMatches+S.pc.bonus)return'You’ve played your '+S.pc.maxMatches+' matches for today.';
  if(S.pc.playMins&&S.pc.secs>=S.pc.playMins*60+S.pc.bonus*300)return'You’ve used your '+pcMinsText(S.pc.playMins)+' of play time today.';return'';}
const pcMinsText=m=>m>=60?(m/60)+' hour'+(m>60?'s':''):m+' minutes';
function pcPinPad(title,sub,cb){openSheet(card=>{card.classList.add('rid','pc');card.insertAdjacentHTML('beforeend','<p class="of-kick pc-kick">🔒 Parent controls</p><h2>'+title+'</h2>'+(sub?'<p class="sub">'+sub+'</p>':''));
  let v='';const dots=document.createElement('div');dots.className='pc-dots';const draw=()=>{dots.innerHTML=[0,1,2,3].map(i=>'<i class="'+(i<v.length?'on':'')+'"></i>').join('');};draw();card.append(dots);
  const err=document.createElement('p');err.className='rid-err';card.append(err);
  const pad=document.createElement('div');pad.className='pc-pad';for(const k of['1','2','3','4','5','6','7','8','9','','0','⌫']){const b=document.createElement('button');b.textContent=k;if(!k){b.disabled=true;b.className='blank';}
    b.addEventListener('click',()=>{sfx('tap');if(k==='⌫')v=v.slice(0,-1);else if(v.length<4)v+=k;draw();if(v.length===4){const got=v;setTimeout(()=>{const msg=cb(got);if(msg){err.textContent=msg;v='';draw();}},120);}});pad.append(b);}
  card.append(pad);const x=document.createElement('button');x.className='btn';x.textContent='Cancel';x.addEventListener('click',()=>cb(null));card.append(x);});}
function pcAskPin(why){return new Promise(res=>{pcPinPad('Parent PIN',why,p=>{if(p===null){closeSheet();res(false);return'';}if(pcHash(p)===S.pc.pin){closeSheet();res(true);return'';}return'Wrong PIN. Try again.';});});}
function pcGrownUpCheck(next){const a=randi(12,19),b=randi(6,9);openSheet(card=>{card.classList.add('rid','pc');card.insertAdjacentHTML('beforeend','<p class="of-kick pc-kick">🔒 Parent controls</p><h2>Grown-ups only</h2><p class="sub">Parent controls let a parent or guardian set limits. To carry on, answer this:</p><p class="pc-q">'+a+' × '+b+' = ?</p>');
  const i=ridField('text','Answer');i.inputMode='numeric';card.append(i);const err=document.createElement('p');err.className='rid-err';card.append(err);
  const y=document.createElement('button');y.className='btn gold';y.textContent='Continue';y.addEventListener('click',()=>{if(+i.value===a*b)next();else err.textContent='That’s not right.';});
  const n=document.createElement('button');n.className='btn';n.textContent='Cancel';n.addEventListener('click',closeSheet);card.append(y,n);});}
function pcNewPin(after){let first='';pcPinPad('Choose a 4-digit PIN','Only the parent should know this PIN. You need it to change these settings.',p=>{if(p===null){closeSheet();return'';}
  if(!first){first=p;setTimeout(()=>pcPinPad('Type the PIN again','',p2=>{if(p2===null){closeSheet();return'';}if(p2!==first)return'The PINs don’t match. Try again.';S.pc.pin=pcHash(p2);persist();pcSync();toast('PIN saved');after();return'';}),50);return'';}return'';});}
function pcSync(){if(ridOn())ridCall('pc',{pc:{...S.pc}}).catch(()=>{});}
function openParentControls(){if(!pcOn())return openSheet(card=>{card.classList.add('rid','pc');
  card.insertAdjacentHTML('beforeend','<p class="of-kick pc-kick">🔒 Parent controls</p><h2>Parent controls</h2><p class="sub">A parent or guardian can choose:</p><ul class="rid-perks"><li><b>🎮</b>How many matches can be played each day</li><li><b>⏱️</b>How much play time each day</li><li><b>🛒</b>Whether anything can be bought in the shop</li><li><b>🌐</b>Whether to play online with other people</li><li><b>💬</b>Whether party chat is allowed</li></ul><p class="sub">Settings are locked with a 4-digit PIN.</p>');
  const s=document.createElement('button');s.className='btn gold';s.textContent='Set up Parent controls';s.addEventListener('click',()=>pcGrownUpCheck(()=>pcNewPin(openPcSettings)));
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(s,x);});
  pcPinPad('Parent PIN','Enter the PIN to change Parent controls.',p=>{if(p===null){closeSheet();return'';}if(pcHash(p)===S.pc.pin){openPcSettings();return'';}return'Wrong PIN. Try again.';});
  setTimeout(()=>{const card=sheetCard;if(!card)return;const f=document.createElement('button');f.className='btn sm';f.textContent='Forgot the PIN?';f.addEventListener('click',pcForgot);card.append(f);},20);}
async function pcForgot(){if(!ridOn()){openSheet(card=>{card.classList.add('rid','pc');card.insertAdjacentHTML('beforeend','<h2>Forgot the PIN?</h2><p class="sub">Sign in to a Rumble ID on this device first. Then we can send a code to that email to reset the PIN.</p>');const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',openParentControls);card.append(x);});return;}
  const r=await ridCall('pinCode');if(r.op!=='code'){toast(r.msg||'Couldn’t send a code');return;}openRidCode(r.email,'pin',()=>{toast('Code accepted. Choose a new PIN.');pcNewPin(openPcSettings);});}
function openPcSettings(){pcToday();openSheet(card=>{card.classList.add('rid','pc','sbx');card.insertAdjacentHTML('beforeend','<p class="of-kick pc-kick">🔒 Parent controls</p><h2>Limits</h2><p class="sub">Today: <b>'+S.pc.played+'</b> match'+(S.pc.played===1?'':'es')+' and <b>'+Math.round(S.pc.secs/60)+' min</b> played.</p>');
  const save=()=>{persist();pcSync();};
  const pills=(label,opts,key)=>{const r=document.createElement('div');r.className='sbx-row sbx-pills';r.innerHTML='<label><b>'+label+'</b></label>';const w=document.createElement('div');w.className='trackrow';
    for(const[v,nm]of opts){const b=document.createElement('button');b.className='tpill'+(S.pc[key]===v?' on':'');b.textContent=nm;b.addEventListener('click',()=>{sfx('tap');S.pc[key]=v;save();w.querySelectorAll('.tpill').forEach(x=>x.classList.remove('on'));b.classList.add('on');});w.append(b);}r.append(w);return r;};
  const sw=(label,note,key)=>{const r=document.createElement('button');r.className='sbx-sw'+(S.pc[key]?' on':'');r.innerHTML='<span><b>'+label+'</b><small>'+note+'</small></span><i></i>';r.addEventListener('click',()=>{S.pc[key]=!S.pc[key];if(key==='allowOnline'&&!S.pc[key]){S.playOnline=false;S.invitesOn=false;try{netBadge();}catch(e){}}save();sfx('tap');r.classList.toggle('on',S.pc[key]);});return r;};
  const sec=document.createElement('div');sec.className='sbx-sec';card.append(sec);
  sec.append(pills('Matches per day',[[0,'No limit'],[3,'3'],[5,'5'],[10,'10'],[20,'20']],'maxMatches'),pills('Play time per day',[[0,'No limit'],[30,'30 min'],[60,'1 hour'],[120,'2 hours']],'playMins'),
    sw('Allow buying','Spending coins, gems or chromos in the shop and on upgrades','allowBuy'),sw('Allow online play','Playing with other real people, friends and invites','allowOnline'),sw('Allow party chat','Quick chat with friends in the lobby','allowChat'));
  const q=document.createElement('div');q.className='sbx-quick';
  const t=document.createElement('button');t.className='btn sm';t.textContent='No limits for today';t.addEventListener('click',()=>{S.pc.free=S.pc.day;save();toast('No limits for the rest of today');});
  const c=document.createElement('button');c.className='btn sm';c.textContent='Change PIN';c.addEventListener('click',()=>pcNewPin(openPcSettings));
  const o=document.createElement('button');o.className='btn sm';o.textContent='Turn off Parent controls';o.addEventListener('click',()=>{S.pc={...S.pc,pin:'',maxMatches:0,playMins:0,allowBuy:true,allowOnline:true,allowChat:true};save();toast('Parent controls turned off');closeSheet();});
  q.append(t,c,o);card.append(q);
  const x=document.createElement('button');x.className='btn gold';x.textContent='Done';x.addEventListener('click',()=>{closeSheet();renderHome();});card.append(x);});}
function pcShowBlocked(msg){openSheet(card=>{card.classList.add('rid','pc');card.insertAdjacentHTML('beforeend','<div class="pc-break">😴</div><h2 style="text-align:center">Time for a break!</h2><p class="sub" style="text-align:center">'+esc(msg)+' A parent set this limit. Come back tomorrow!</p>');
  const p=document.createElement('button');p.className='btn';p.textContent='Parent: unlock with PIN';p.addEventListener('click',async()=>{const ok=await pcAskPin('Enter the PIN to give more time today.');if(!ok)return;openSheet(c2=>{c2.classList.add('rid','pc');c2.insertAdjacentHTML('beforeend','<h2>Give more time</h2>');
    const a=document.createElement('button');a.className='btn primary';a.textContent='One more match (+5 min)';a.addEventListener('click',()=>{S.pc.bonus++;persist();closeSheet();toast('One more match allowed');});
    const b=document.createElement('button');b.className='btn primary';b.textContent='No limits for today';b.addEventListener('click',()=>{S.pc.free=S.pc.day;persist();closeSheet();toast('No limits for the rest of today');});
    const n=document.createElement('button');n.className='btn';n.textContent='Cancel';n.addEventListener('click',closeSheet);c2.append(a,b,n);});});
  const x=document.createElement('button');x.className='btn gold';x.textContent='OK';x.addEventListener('click',closeSheet);card.append(x,p);});}
/* enforce the limits */
{const _sm=startMatchmaking;startMatchmaking=function(){const why=pcBlockReason();if(why){sfx('tap');pcShowBlocked(why);return;}return _sm.apply(this,arguments);};}
{const _se=showEnd;showEnd=function(){try{if(pcOn()&&M&&!M.trial&&!M.sim&&!M.watch){pcToday();S.pc.played++;persist();}}catch(e){}return _se.apply(this,arguments);};}
setInterval(()=>{try{if(pcOn()&&view==='game'&&M&&!M.watch){pcToday();S.pc.secs+=5;}}catch(e){}},5000);
{const _sp=spend;spend=function(cur,n){if(pcOn()&&!S.pc.allowBuy){toast('A parent turned off buying');return false;}return _sp(cur,n);};}
{const _cp=netCanPlay;netCanPlay=function(){if(pcOn()&&!S.pc.allowOnline)return false;return _cp.apply(this,arguments);};}
{const _op=openParty;openParty=function(){if(pcOn()&&!S.pc.allowOnline){toast('A parent turned off online play');return;}return _op.apply(this,arguments);};}
{const _si=netShowInvite;netShowInvite=function(){if(pcOn()&&!S.pc.allowOnline)return;return _si.apply(this,arguments);};}
{const _pc=openPartyChat;openPartyChat=function(){if(pcOn()&&(!S.pc.allowChat||!S.pc.allowOnline)){toast('A parent turned off party chat');return;}return _pc.apply(this,arguments);};}
{const ob=$('#onlineBtn');if(ob)ob.addEventListener('click',()=>{if(pcOn()&&!S.pc.allowOnline&&S.playOnline!==false){S.playOnline=false;persist();netBadge();toast('A parent turned off online play');}});}
/* under 10: suggest Parent controls once */
setTimeout(()=>{try{if(S.onboarded&&S.ageNum!=null&&S.ageNum<10&&!pcOn()&&!S.pcAsked&&view==='home'&&sheetEl.hidden){S.pcAsked=true;persist();
  openSheet(card=>{card.classList.add('rid','pc');card.insertAdjacentHTML('beforeend','<p class="of-kick pc-kick">🔒 For grown-ups</p><h2>Parent controls</h2><p class="sub">Ask a parent or guardian if they want to set limits, like how many matches you can play each day. They can do it any time from the ☰ menu.</p>');
    const s=document.createElement('button');s.className='btn gold';s.textContent='A parent will set it up now';s.addEventListener('click',()=>pcGrownUpCheck(()=>pcNewPin(openPcSettings)));const x=document.createElement('button');x.className='btn';x.textContent='Maybe later';x.addEventListener('click',closeSheet);card.append(s,x);});}}catch(e){}},2500);

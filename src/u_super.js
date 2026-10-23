
/* ================= Rumble Pass emblem + Rumble Pass SUPER =================
   The emblem is a season banner on a gold rod with a big gold R. SUPER owners get the crimson banner with a crown.
   SUPER = the whole Rumble Pass + a free Mythic of your choice (11,000 chromos if you have every Mythic),
   the Super Rumbler title, the Super Pass banner and the SUPER profile icon. 300 gems, or 150 if you have the Rumble Pass. */
const RPASS_R='M23 20H35C39 20 41.5 22.8 41.5 26.6C41.5 29.6 39.8 31.8 37.3 32.7L42.5 42H35.4L31 33.4H29.6V42H23ZM29.6 25.2V28.6H34C35.2 28.6 35.9 27.9 35.9 26.9C35.9 25.9 35.2 25.2 34 25.2Z',RPASS_CLOTH='M13 11H51V56.5L32 47.5L13 56.5Z',RPASS_CROWN='M22.5 9.5L24.4 1.6L28.6 5.6L32 .4L35.4 5.6L39.6 1.6L41.5 9.5Z';
let _rpeN=0;
function hasSuper(){try{return!!(S.pass&&S.pass.super);}catch(e){return false;}}
function passEmblem(size,o){o=o||{};const sup=o.super!=null?!!o.super:hasSuper(),u='rpe'+(++_rpeN),t=o.tier,big=size>=60;
  const cl=sup?['#ff7aa0','#d1124f','#5c0626']:['#7a5cff','#4a33c8','#2b1f86'];
  let s='<svg class="rpe'+(sup?' rpe-super':'')+'" viewBox="0 0 64 64" width="'+size+'" height="'+size+'" aria-hidden="true"><defs>'+
  '<linearGradient id="'+u+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".5" stop-color="#ffc93c"/><stop offset="1" stop-color="#e08a10"/></linearGradient>'+
  '<linearGradient id="'+u+'p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+cl[0]+'"/><stop offset=".6" stop-color="'+cl[1]+'"/><stop offset="1" stop-color="'+cl[2]+'"/></linearGradient>'+
  '<linearGradient id="'+u+'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa3c0"/><stop offset="1" stop-color="#e23a6a"/></linearGradient>'+
  '<clipPath id="'+u+'c"><path d="'+RPASS_CLOTH+'"/></clipPath></defs>'+
  '<path d="'+RPASS_CLOTH+'" fill="url(#'+u+'p)" stroke="#120f26" stroke-width="3" stroke-linejoin="round"/>'+
  '<g clip-path="url(#'+u+'c)"><path d="M13 11H51V20H13Z" fill="url(#'+u+(sup?'g':'k')+')"/><path d="M13 20H51" stroke="#120f26" stroke-width="2"/>'+
  '<path d="M17.5 23V50L32 43.2L46.5 50V23" fill="none" stroke="'+(sup?'#ffe48a':'#ffc93c')+'" stroke-width="'+(sup?2.2:1.8)+'" opacity="'+(sup?.95:.75)+'"/>'+
  '<path d="M15 21.5L22 11M24 21.5L31 11" stroke="#fff" stroke-width="2.4" opacity=".14"/></g>'+
  ['21','32','43'].map(x=>'<circle cx="'+x+'" cy="15.6" r="1.5" fill="'+(sup?'#7a0a30':'#fff')+'"/>').join('')+
  '<rect x="6" y="6.5" width="52" height="6.5" rx="3.25" fill="url(#'+u+'g)" stroke="#120f26" stroke-width="2.6"/>'+
  '<circle cx="6.5" cy="9.75" r="4.2" fill="'+(sup?'#ffd23f':'#ff5e87')+'" stroke="#120f26" stroke-width="2.4"/><circle cx="57.5" cy="9.75" r="4.2" fill="'+(sup?'#ffd23f':'#ff5e87')+'" stroke="#120f26" stroke-width="2.4"/>'+
  (sup?'<path d="'+RPASS_CROWN+'" fill="url(#'+u+'g)" stroke="#120f26" stroke-width="2.2" stroke-linejoin="round"/><circle cx="32" cy="6.6" r="1.3" fill="#ff3d6e"/>':'')+
  '<g transform="translate(-0.3 4.5)"><path d="'+RPASS_R+'" fill="#120f26" stroke="#120f26" stroke-width="6" stroke-linejoin="round" fill-rule="evenodd" transform="translate(0 1.6)"/>'+
  '<path d="'+RPASS_R+'" fill="url(#'+u+'g)" stroke="#120f26" stroke-width="2.6" stroke-linejoin="round" fill-rule="evenodd" paint-order="stroke"/>'+
  '<path d="M24.6 21.6H34.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></g>'+
  '<path d="M53 17Q53.6 21.4 58 22Q53.6 22.6 53 27Q52.4 22.6 48 22Q52.4 21.4 53 17Z" fill="#fff" stroke="#120f26" stroke-width=".8"/>'+
  (sup?'<path d="M10 28Q10.5 31.5 14 32Q10.5 32.5 10 36Q9.5 32.5 6 32Q9.5 31.5 10 28Z" fill="#ffe48a" stroke="#120f26" stroke-width=".7"/>':'')+
  (sup&&big?'<path d="M8.5 47.5H55.5L52.5 51.6L55.5 55.7H8.5L11.5 51.6Z" fill="url(#'+u+'g)" stroke="#120f26" stroke-width="2" stroke-linejoin="round"/><text x="32" y="54.1" text-anchor="middle" font-family="Bungee, \'Arial Black\', Impact, sans-serif" font-weight="900" font-size="6.4" letter-spacing=".6" fill="#5c0626">SUPER</text>':'');
  if(t!=null)s+='<circle cx="51" cy="51" r="10.5" fill="'+(sup?'#3a0618':'#1d1b52')+'" stroke="#120f26" stroke-width="2.6"/><circle cx="51" cy="51" r="7.6" fill="none" stroke="#ffc93c" stroke-width="1.4" opacity=".6"/><text x="51" y="55.4" text-anchor="middle" font-family="Bungee, \'Arial Black\', Impact, sans-serif" font-weight="900" font-size="'+(t>9?10:12.5)+'" fill="#ffd36b">'+t+'</text>';
  return s+'</svg>';}
function passEmblemEl(size,o){const sp=document.createElement('span');sp.className='rpe-wrap'+(o&&o.cls?' '+o.cls:'');sp.innerHTML=passEmblem(size,o);return sp;}
try{Object.defineProperty(ICON,'rpass',{get:()=>passEmblem(22),enumerable:false});}catch(e){}
const PASS_SUPER_GEMS=300,PASS_SUPER_UP=150,SUPER_CHROMOS=11000;
/* +35% instant progress the first time you get the Rumble Pass or SUPER (once per season, they don't stack) */
const PASS_BOOST_PCT=35,PASS_BOOST=Math.round(PASS_TIERS*PASS_STEP*PASS_BOOST_PCT/100),PASS_BOOST_TIERS=Math.floor(PASS_BOOST/PASS_STEP);
function passBoost(){if(S.pass.boost)return 0;S.pass.xp+=PASS_BOOST;S.pass.boost=true;return PASS_BOOST;}
function passBoostToast(n){if(n)setTimeout(()=>toast('+'+PASS_BOOST_PCT+'% instant progress! +'+fmtFull(n)+' pass tokens','pass'),700);}
function superPrice(){return S.pass.premium?PASS_SUPER_UP:PASS_SUPER_GEMS;}
function superMythics(){return RUMBLERS.filter(b=>b.rarity==='mythic'&&!b.eventOnly&&!b.beta);}
function superPickPending(){return hasSuper()&&(S.pass.cs||[]).includes(SUPER_MYTHIC_TIER)&&!S.pass.superPick;}
/* claim one SUPER reward (they sit underneath the Rumble Pass rewards) */
function claimSuper(i,quiet){S.pass.cs=S.pass.cs||[];if(!PASS_SUPER[i]||!hasSuper()||i>=passTier(S.pass.xp)||S.pass.cs.includes(i))return false;
  const rw=PASS_SUPER[i];S.pass.cs.push(i);giveReward(rw);
  if(!quiet){persist();sfx('unlock');
    if(rw.mythic){if(superGrantChromosIfDone()){toast('+'+fmtFull(SUPER_CHROMOS)+' chromos · you have every Mythic','chromos');}else if(superPickPending()){renderPass();updateShopDot();openSuperPick();return true;}else toast('You already picked your Mythic','pass');}
    else toast(rewardLabel(rw)+(rwKey(rw)==='drop'?' · open from the home screen':''),'rpass');
    renderPass();updateShopDot();}
  return true;}
function superMythicVisual(size){const w=document.createElement('span');w.className='sup-myst';w.style.width=w.style.height=size+'px';w.style.fontSize=Math.round(size*.5)+'px';
  const pick=S.pass.superPick&&BY_ID[S.pass.superPick],b=pick||superMythics().find(x=>!S.owned[x.id])||BY_ID.vex,t=thumb(b,getSkin(b,'classic'),size);if(!pick)t.classList.add('myst');w.append(t);if(!pick)w.insertAdjacentHTML('beforeend','<i>?</i>');return w;}
function superClaimable(i,tier){return!!PASS_SUPER[i]&&hasSuper()&&i<tier&&!(S.pass.cs||[]).includes(i);}
function superNudge(){toast('Get Rumble Pass SUPER to claim the SUPER reward','rpass');const c=document.querySelector('.sup-card');if(c&&c.scrollIntoView)c.scrollIntoView({behavior:'smooth',block:'start'});}
/* the SUPER reward lives in the same slot as the Rumble Pass reward: it slowly slides up over it, then back down */
function superFace(b,i,tier){if(!PASS_SUPER[i])return;const rw=PASS_SUPER[i],got=(S.pass.cs||[]).includes(i),own=hasSuper(),ok=superClaimable(i,tier),my=!!rw.mythic;
  b.classList.add('has-sup');if(my)b.classList.add('smyth-cell');
  const f=document.createElement('span');f.className='sface'+(my?' smyth':'')+(got?' sgot':'')+(own?'':' snot');f.setAttribute('aria-hidden','true');
  f.insertAdjacentHTML('beforeend','<span class="stag">'+passEmblem(14,{super:true})+'SUPER</span>');f.append(rewardVisual(rw,my?50:44));
  f.insertAdjacentHTML('beforeend','<span class="pl">'+esc(rewardLabel(rw))+'</span>'+(got?'<span class="chk">✓</span>':ok?'<span class="ctag">Claim</span>':!own?'<span class="slk">'+passEmblem(18,{super:true})+'</span>':''));
  b.append(f);b.setAttribute('aria-label',(b.getAttribute?b.getAttribute('aria-label')||'':'')+'. SUPER reward: '+rewardLabel(rw)+(got?', claimed':ok?', ready to claim':', locked'));}
/* one tap claims both the Rumble Pass reward and the SUPER reward of a tier */
function superClaimTier(i,passOk){const parts=[];
  if(passOk&&claimPass(i,true,true))parts.push(rewardLabel(PASS_PREM[i]));
  const rw=PASS_SUPER[i]||{};if(claimSuper(i,true)&&!rw.mythic)parts.push('SUPER: '+rewardLabel(rw));
  persist();sfx('unlock');
  if(rw.mythic&&superGrantChromosIfDone())parts.push('SUPER: +'+fmtFull(SUPER_CHROMOS)+' chromos (you have every Mythic)');
  if(parts.length)toast(parts.join(' + '),'rpass');
  renderPass();updateShopDot();if(superPickPending())openSuperPick();}
/* if you already have every Mythic, SUPER gives 11,000 chromos instead */
function superGrantChromosIfDone(){if(!superPickPending())return false;if(superMythics().some(b=>!S.owned[b.id]))return false;S.chromos+=SUPER_CHROMOS;S.pass.superPick='chromos';persist();return true;}
function superTab(){try{const t=document.querySelector('.tab[data-tab="pass"]');if(t&&t.classList)t.classList.toggle('super',hasSuper());}catch(e){}}
function superRefresh(){try{renderHome();}catch(e){}try{renderPass();}catch(e){}try{renderShop();}catch(e){}try{updateShopDot();}catch(e){}}
function buySuper(){const up=!!S.pass.premium,price=superPrice();
  confirmBuy(up?'Upgrade to Rumble Pass SUPER':'Rumble Pass SUPER',passEmblemEl(110,{cls:'rpe-buy',super:true}),[['gems',price]],()=>{
    const bn=passBoost();S.pass.premium=true;S.pass.super=true;S.superEver=true;if(!S.pins.includes('passclub'))S.pins.push('passclub');persist();sfx('unlock');try{if(typeof netHello==='function')netHello();}catch(e){}superRefresh();superReveal(bn);});}
function superBannerSwatch(cls){const d=document.createElement('span');d.className=cls||'sup-ban';const bn=PF_BANNERS.find(x=>x.id==='b_super');if(bn)d.style.background=bn.css;return d;}
function superTitleChip(){const t=document.createElement('span');t.className='sup-title';t.textContent='Pass Club';return t;}
function superMythicStack(n){const w=document.createElement('span');w.className='sup-mys';const left=superMythics().filter(b=>!S.owned[b.id]),list=(left.length?left:superMythics()).slice(0,n||3);for(const b of list)w.append(thumb(b,getSkin(b,'classic'),40));return w;}
/* the offer card under the pass hero */
function superCard(){const c=document.createElement('div');c.className='sup-card';const up=!!S.pass.premium,left=superMythics().filter(b=>!S.owned[b.id]).length;
  const hd=document.createElement('div');hd.className='sup-head';hd.append(passEmblemEl(72,{super:true}));
  hd.insertAdjacentHTML('beforeend','<div style="min-width:0"><p class="of-kick sup-kick">Version 2 of the Rumble Pass</p><h2>Rumble Pass SUPER</h2><p class="hint">Everything in the Rumble Pass, plus:</p></div>');c.append(hd);
  const ul=document.createElement('ul');ul.className='sup-perks';
  const li=(vis,b,sm)=>{const l=document.createElement('li');const pv=document.createElement('span');pv.className='pv';pv.append(vis);l.append(pv);l.insertAdjacentHTML('beforeend','<span style="min-width:0"><b>'+b+'</b>'+(sm?'<small>'+sm+'</small>':'')+'</span>');ul.append(l);};
  {const v=document.createElement('span');v.className='sup-mys';for(const d of['rbox','ultra','legendary'])v.append(dropCanvas(d,38));li(v,SUPER_COUNT+' big SUPER rewards','On every other tier: 10 Rumbler Boxes, 2 Skin Boxes, 5 Amazing Drops, 10 Legendary Drops and 10,000 chromos');}
  {const v=document.createElement('span');v.className='sup-mys';for(const x of SUPER_SKINS.slice(0,3))v.append(thumb(BY_ID[x.rid],getSkin(BY_ID[x.rid],x.skin.id),40));li(v,SUPER_SKINS.length+' SUPER skins','Crowned Season 1 skins: '+SUPER_SKINS.map(x=>x.skin.name.replace('SUPER ','')+' '+BY_ID[x.rid].name).join(', '));}
  li(superMythicVisual(44),'A Mythic of your choice','In the middle of the pass at tier '+(SUPER_MYTHIC_TIER+1)+(left?'. Pick any Mythic you don’t have yet':'. You have every Mythic, so you get '+fmtFull(SUPER_CHROMOS)+' chromos instead'));
  if(!S.pass.boost){const v=document.createElement('span');v.className='boost-badge';v.textContent='+'+PASS_BOOST_PCT+'%';li(v,'+'+PASS_BOOST_PCT+'% instant progress','Jump about '+PASS_BOOST_TIERS+' tiers ahead the moment you get it');}
  {const ex=EXCLUSIVE_SKINS.find(e=>e.stat==='super'),bb=BY_ID[ex.rid];li(thumb(bb,getSkin(bb,ex.skin.id),46),'Pass Club exclusive'+(S.superEver?' (you have it)':''),'Get SUPER once and keep the Pass Club '+bb.name+' skin, pin, profile icon, title and banner forever. They show up in Exclusives');}
  if(!up)li(passEmblemEl(40,{super:false}),'The whole Rumble Pass','All '+PASS_TIERS+' premium rewards, Starfall skins and Orion');
  c.append(ul);
  const b=document.createElement('button');b.className='btn super-btn';b.innerHTML='<span class="rpe-btn">'+passEmblem(26,{super:true})+'</span>'+(up?'Upgrade to SUPER · ':'Get Rumble Pass SUPER · ')+cost('gems',superPrice());b.addEventListener('click',()=>{sfx('click');buySuper();});c.append(b);
  c.insertAdjacentHTML('beforeend','<p class="hint sup-note">'+(up?'Half price because you already have the Rumble Pass (normally '+PASS_SUPER_GEMS+' gems).':'Already have the Rumble Pass? Then SUPER is only '+PASS_SUPER_UP+' gems.')+'</p>');
  return c;}
/* "SUPER unlocked!" */
function superReveal(bnShown){const auto=superGrantChromosIfDone();if(auto)superRefresh();
  openSheet(card=>{card.classList.add('rid','sup-sheet');
    card.insertAdjacentHTML('beforeend','<p class="of-kick sup-kick" style="text-align:center">Rumble Pass SUPER</p><h2 style="text-align:center">SUPER unlocked!</h2>');
    const w=document.createElement('div');w.className='ex-burst';w.append(passEmblemEl(140,{super:true,cls:'rpe-buy'}));card.append(w);
    const rw=document.createElement('div');rw.className='sol-rlist';
    const add=(vis,lab)=>{const d=document.createElement('div');d.append(vis);d.insertAdjacentHTML('beforeend','<span>'+lab+'</span>');rw.append(d);};
    {const v=document.createElement('span');v.className='sup-mys';for(const x of SUPER_SKINS.slice(0,2))v.append(thumb(BY_ID[x.rid],getSkin(BY_ID[x.rid],x.skin.id),36));add(v,SUPER_COUNT+' SUPER rewards on every other tier: '+SUPER_SKINS.length+' SUPER skins, boxes, drops and a Mythic at tier '+(SUPER_MYTHIC_TIER+1));}
    {const ex=EXCLUSIVE_SKINS.find(e=>e.stat==='super'),bb=BY_ID[ex.rid];add(thumb(bb,getSkin(bb,ex.skin.id),40),'Pass Club exclusive: '+bb.name+' skin, pin, icon, title and banner (in Exclusives)');}
    add(passEmblemEl(40,{super:false}),'Every Rumble Pass reward');if(bnShown){const v=document.createElement('span');v.className='boost-badge';v.textContent='+'+PASS_BOOST_PCT+'%';add(v,'+'+PASS_BOOST_PCT+'% instant pass progress');}
    if(auto){const sp=document.createElement('span');sp.className='sup-cico';sp.innerHTML=ICON.chromos;add(sp,'+'+fmtFull(SUPER_CHROMOS)+' chromos (you have every Mythic)');}
    card.append(rw);
    if(superPickPending()){const p=document.createElement('button');p.className='btn gold sup-pick-btn';p.textContent='Choose your free Mythic';p.addEventListener('click',openSuperPick);card.append(p);}
    const wr=document.createElement('button');wr.className='btn super-btn';wr.textContent='Wear the Pass Club title and banner';wr.addEventListener('click',()=>{S.pf=S.pf||{};S.pf.title='t_super';S.pf.banner='b_super';persist();sfx('click');toast('Pass Club title and banner on');try{if(typeof netHello==='function')netHello();}catch(e){}renderHome();wr.disabled=true;wr.textContent='Wearing them!';});card.append(wr);
    const x=document.createElement('button');x.className='btn';x.textContent=superPickPending()?'Later':'Awesome!';x.addEventListener('click',()=>{closeSheet();superRefresh();});card.append(x);});}
/* pick the free Mythic */
function openSuperPick(){if(!superPickPending())return;
  if(superGrantChromosIfDone()){sfx('unlock');toast('+'+fmtFull(SUPER_CHROMOS)+' chromos','chromos');superRefresh();return;}
  const all=superMythics();
  openSheet(card=>{card.classList.add('rid','sup-sheet');
    card.insertAdjacentHTML('beforeend','<p class="of-kick sup-kick">Rumble Pass SUPER</p><h2>Pick a free Mythic</h2><p class="sub">Choose any Mythic rumbler you don’t have yet. You can only pick one, so choose carefully!</p>');
    const g=document.createElement('div');g.className='rid-pick';
    for(const b of all){const own=!!S.owned[b.id],c=document.createElement('button');c.className='cz-cell'+(own?' locked':'');c.append(thumb(b,getSkin(b,'classic'),64));c.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b><small>'+(own?'Owned':esc(b.role))+'</small>');
      if(!own)c.addEventListener('click',()=>{sfx('tap');openSheet(c2=>{c2.classList.add('rid','sup-sheet');c2.insertAdjacentHTML('beforeend','<h2 style="text-align:center">'+esc(b.name)+'?</h2>');const pv=document.createElement('div');pv.className='d-set';pv.append(thumb(b,getSkin(b,'classic'),130));c2.append(pv);
        c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">'+esc(b.role)+'. You can only pick one.</p>');
        const y=document.createElement('button');y.className='btn gold';y.textContent='Pick '+b.name;y.addEventListener('click',()=>{if(!superPickPending()){closeSheet();return;}y.disabled=true;
          S.pass.superPick=b.id;grantRumbler(b.id);persist();sfx('unlock');superRefresh();
          openSheet(c3=>{c3.classList.add('rid','sup-sheet');c3.insertAdjacentHTML('beforeend','<p class="of-kick sup-kick" style="text-align:center">It’s yours!</p><h2 style="text-align:center">'+esc(b.name)+' unlocked</h2>');const w=document.createElement('div');w.className='ex-burst';w.append(thumb(b,getSkin(b,'classic'),150));c3.append(w);
            const u=document.createElement('button');u.className='btn gold';u.textContent='Use '+b.name;u.addEventListener('click',()=>{S.selected=b.id;persist();closeSheet();renderHome();go('home');});const k=document.createElement('button');k.className='btn';k.textContent='Done';k.addEventListener('click',()=>{closeSheet();superRefresh();});c3.append(u,k);});});
        const n=document.createElement('button');n.className='btn';n.textContent='Back';n.addEventListener('click',openSuperPick);c2.append(y,n);});});g.append(c);}
    card.append(g);const l=document.createElement('button');l.className='btn';l.textContent='Later';l.addEventListener('click',closeSheet);card.append(l);});}
/* the SUPER profile icon, drawn on a canvas from the same shapes as the emblem */
function drawSuperIcon(c,s){drawSuperMark(c,s/2,s/2+s*.03,s*.84);}
function drawSuperMark(c,cx,cy,size){if(typeof Path2D!=='function')return;const k=size/64;c.save();c.translate(cx-32*k,cy-32*k);c.scale(k,k);c.lineJoin='round';c.strokeStyle='#120f26';
  const gold=c.createLinearGradient(0,0,0,64);gold.addColorStop(0,'#fff2b8');gold.addColorStop(.5,'#ffc93c');gold.addColorStop(1,'#e08a10');
  const cloth=c.createLinearGradient(0,11,0,57);cloth.addColorStop(0,'#ff7aa0');cloth.addColorStop(.6,'#d1124f');cloth.addColorStop(1,'#5c0626');
  const cp=new Path2D(RPASS_CLOTH);c.fillStyle=cloth;c.fill(cp);c.save();c.clip(cp);c.fillStyle=gold;c.fillRect(13,11,38,9);c.restore();
  c.lineWidth=2;c.beginPath();c.moveTo(13,20);c.lineTo(51,20);c.stroke();
  c.strokeStyle='#ffe48a';c.lineWidth=2.2;c.beginPath();c.moveTo(17.5,23);c.lineTo(17.5,50);c.lineTo(32,43.2);c.lineTo(46.5,50);c.lineTo(46.5,23);c.stroke();
  c.strokeStyle='#120f26';c.lineWidth=3;c.stroke(cp);
  c.fillStyle='#7a0a30';for(const x of[21,32,43]){c.beginPath();c.arc(x,15.6,1.5,0,TAU);c.fill();}
  const rod=new Path2D('M9.25 6.5H54.75A3.25 3.25 0 0 1 54.75 13H9.25A3.25 3.25 0 0 1 9.25 6.5Z');c.fillStyle=gold;c.fill(rod);c.lineWidth=2.6;c.stroke(rod);
  for(const x of[6.5,57.5]){c.beginPath();c.arc(x,9.75,4.2,0,TAU);c.fillStyle='#ffd23f';c.fill();c.lineWidth=2.4;c.stroke();}
  const cr=new Path2D(RPASS_CROWN);c.fillStyle=gold;c.fill(cr);c.lineWidth=2.2;c.stroke(cr);c.fillStyle='#ff3d6e';c.beginPath();c.arc(32,6.6,1.3,0,TAU);c.fill();
  const r=new Path2D(RPASS_R);c.save();c.translate(-.3,6.1);c.fillStyle='#120f26';c.lineWidth=6;c.stroke(r);c.fill(r,'evenodd');c.restore();
  c.save();c.translate(-.3,4.5);c.lineWidth=2.6;c.stroke(r);c.fillStyle=gold;c.fill(r,'evenodd');c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.4;c.lineCap='round';c.beginPath();c.moveTo(24.6,21.6);c.lineTo(34.6,21.6);c.stroke();c.restore();
  const sp=(x,y,a,col)=>{c.beginPath();c.moveTo(x,y-a);c.quadraticCurveTo(x+a*.12,y-a*.12,x+a,y);c.quadraticCurveTo(x+a*.12,y+a*.12,x,y+a);c.quadraticCurveTo(x-a*.12,y+a*.12,x-a,y);c.quadraticCurveTo(x-a*.12,y-a*.12,x,y-a);c.fillStyle=col;c.fill();c.lineWidth=.8;c.strokeStyle='#120f26';c.stroke();};
  sp(53,22,5,'#fff');sp(10,32,4,'#ffe48a');c.restore();}
if(!NETS){const _rh=renderHome;renderHome=function(){const r=_rh.apply(this,arguments);superTab();return r;};}

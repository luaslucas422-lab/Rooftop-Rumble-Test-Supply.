
/* ---------- Shop ---------- */
const GIFTS=[{coins:100},{gems:10},{pp:60}];
const PACKS=[{id:'pp1',name:'Power pack',get:{pp:100},pay:['coins',200]},{id:'pp2',name:'Big power pack',get:{pp:350},pay:['coins',600]},{id:'c1',name:'Coin pouch',get:{coins:500},pay:['gems',40]},{id:'c2',name:'Coin chest',get:{coins:1600},pay:['gems',110]}];
let shopTab=null;
let secretTaps=0;
/* Pay gems to roll a fresh set of daily skins (including the discounted one) or daily pins (the free pin stays) */
const REROLL_GEMS={skins:25,pins:15};
function rerollBtn(kind){const b=document.createElement('button');b.className='btn sm reroll';b.innerHTML='\u21bb New '+kind+' for '+cost('gems',REROLL_GEMS[kind]);
  b.addEventListener('click',()=>{if(!spend('gems',REROLL_GEMS[kind]))return;const seed=(Math.random()*4e9)>>>0;
    if(kind==='skins')S.daily.dealSkins=dailySkinPicks(seed);else{const free=S.daily.pinShop&&S.daily.pinShop.free;const np=dailyPinPicks(seed);np.free=free;np.pins=np.pins.filter(x=>x!==free);S.daily.pinShop=np;}
    persist();sfx('buy');toast('Fresh daily '+kind+'!','gems');renderShop();});return b;}
function sectionTitle(h,s){const d=document.createElement('div');d.className='sec-title';d.innerHTML='<h2>'+h+'</h2><span>'+(s||'')+'</span>';return d;}
function renderShop(){
  ensureDaily();$('#shopWallet').innerHTML=pills(['coins','gems','pp']);
  const body=$('#shopBody');body.innerHTML='';
  if(S.daily.offer===undefined){S.daily.offer=pickOffer(S.daily.date||todayKey());persist();}
  /* new player gift */
  if(!S.welcomeGift){const sg=document.createElement('div');sg.className='panel sorry welcome';sg.append(dropCanvas('legendary',70));sg.append(dropCanvas('rbox',70));
    sg.insertAdjacentHTML('beforeend','<div style="flex:1 1 160px;min-width:0"><span class="of-kick">New player gift</span><h2>3 Legendary Drops + 1 Rumbler Box</h2><p class="hint" style="margin:0">Welcome to Rooftop Rumble! This one is on us.</p></div>');
    const b3=document.createElement('button');b3.className='btn gold';b3.textContent='Claim';sg.append(b3);
    b3.addEventListener('click',()=>{S.welcomeGift=1;for(let k=0;k<3;k++)S.drops.push({r:'legendary',min:null});S.drops.push({r:'rbox',min:null});persist();sfx('unlock');toast('Gift added! Open your drops from the Play screen','chromos');renderShop();});
    body.append(sg);}
  const of=S.daily.offer,ob=of&&BY_ID[of.id];
  if(ob){const r=RARITY[ob.rarity],pr=offerPrices(ob),owned=!!S.owned[ob.id],card=document.createElement('div');card.className='offer';card.style.setProperty('--r',r.col);
    {const th=thumb(ob,getSkin(ob,'classic'),120);th.style.cursor='pointer';th.addEventListener('click',()=>{secretTaps++;sfx('tap');th.animate&&th.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:160});
      if(secretTaps>=10&&!S.pins.includes('secretking')){S.pins.push('secretking');persist();sfx('unlock');openSheet(c2=>{c2.insertAdjacentHTML('beforeend','<h2 style="text-align:center">You found a secret!</h2>');const w=document.createElement('div');w.style.cssText='display:flex;justify-content:center;margin:8px 0';w.append(pinCanvas('b:secretking',140));c2.append(w);c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">The <b>Secret King</b> pin is yours. Add it to a rumbler\u2019s pin slots.</p>');const x=document.createElement('button');x.className='btn gold';x.textContent='Nice!';x.addEventListener('click',closeSheet);c2.append(x);});}});card.append(th);}
    const info=document.createElement('div');info.className='of-info';
    info.innerHTML='<span class="of-kick">Daily rumbler offer</span><span class="of-tags"><span class="rpill'+rpc(ob.rarity)+'" style="--r:'+r.col+'">'+r.name+'</span>'+(of.bought||owned?'':'<span class="of-off">50% OFF</span>')+'</span><h2>'+esc(ob.name)+'</h2><span class="of-time">'+esc(ob.role)+'<br>New rumbler in <span class="of-cd">'+untilMidnight()+'</span></span>';
    card.append(info);
    if(of.bought||owned){card.insertAdjacentHTML('beforeend','<p class="of-done">'+(of.bought?'Bought! ':'You already own '+esc(ob.name)+'. ')+'A new rumbler arrives tomorrow.</p>');}
    else{card.insertAdjacentHTML('beforeend','<div class="of-prices">'+pr.map(([c,n])=>'<span class="of-price">'+ICON[c]+'<span>'+fmtFull(n)+(c==='chromos'?' <s>'+fmtFull(r.chromos)+'</s>':'')+'</span></span>').join('')+'</div>');
      const bt=document.createElement('div');bt.className='of-btns';
      const buy=document.createElement('button');buy.className='btn gold';buy.textContent='Get '+ob.name;
      buy.addEventListener('click',()=>confirmBuy(ob.name+' · daily offer',thumb(ob,getSkin(ob,'classic'),110),pr,()=>{grantRumbler(ob.id);S.daily.offer.bought=true;persist();sfx('unlock');toast(ob.name+' unlocked!','chromos');renderShop();}));
      const tr=document.createElement('button');tr.className='btn';tr.textContent='Try first';tr.addEventListener('click',()=>startTrial(ob.id));
      bt.append(buy,tr);card.append(bt);}
    body.append(card);}
  const gift=GIFTS[S.daily.gift||0],gk=Object.keys(gift)[0];
  const gp=document.createElement('div');gp.className='panel';gp.style.flexDirection='row';gp.style.alignItems='center';gp.style.flexWrap='wrap';
  gp.innerHTML='<div style="flex:1 1 180px;min-width:0"><h2>Daily gift</h2><p class="hint" style="margin:0">'+(S.daily.claimed?'Come back tomorrow for another one.':'Free, once a day: '+gift[gk]+' '+CUR_NAME[gk]+'.')+'</p></div>';
  const gb=document.createElement('button');gb.className='btn green';gb.innerHTML=S.daily.claimed?'Claimed':'Claim '+cost(gk,gift[gk]);gb.disabled=S.daily.claimed;
  gb.addEventListener('click',()=>{if(S.daily.claimed)return;S.daily.claimed=true;S[gk]+=gift[gk];persist();sfx('unlock');toast('+'+gift[gk]+' '+CUR_NAME[gk],gk);renderShop();updateShopDot();});gp.append(gb);body.append(gp);
  if(!S.pass.premium){const pp=document.createElement('button');pp.className='tile wide';pp.style.setProperty('--tc','#ffd36b');pp.innerHTML='<span class="tico rpe-t">'+passEmblem(50)+'</span><span style="min-width:0"><span class="tk">Season 1 · Starfall</span><b>Rumble Pass</b><span class="tt">30 extra rewards, 5 Starfall skins and the exclusive rumbler Orion · '+PASS_GEMS+' gems</span></span>';pp.addEventListener('click',()=>go('pass'));body.append(pp);}
  if(!hasSuper()){const sp=document.createElement('button');sp.className='tile wide sup-shop';sp.style.setProperty('--tc','#ff3d6e');sp.innerHTML='<span class="tico rpe-t">'+passEmblem(50,{super:true})+'</span><span style="min-width:0"><span class="tk">Version 2 of the Rumble Pass</span><b>Rumble Pass SUPER</b><span class="tt">Everything in the Rumble Pass + '+PASS_TIERS+' bigger SUPER rewards with a Mythic of your choice, plus an exclusive title, banner and icon · '+superPrice()+' gems'+(S.pass.premium?' (half price, you have the Rumble Pass)':'')+'</span></span>';sp.addEventListener('click',()=>go('pass'));body.append(sp);}
  {const all=S.daily.dealSkins||[],feat=all[0],rest=all.slice(1).filter(([rid,sid])=>BY_ID[rid]&&!hasSkin(rid,sid));
   body.append(sectionTitle('Daily skins','New skins every day · new in '+untilMidnight()));body.append(rerollBtn('skins'));
   if(feat&&BY_ID[feat[0]]){const[rid,sid]=feat,b=BY_ID[rid],sk=getSkin(b,sid),pr=skinPrice(sk),own=hasSkin(rid,sid),d=document.createElement('button');d.className='pindeal skindeal';d.append(thumb(b,sk,96));
     d.insertAdjacentHTML('beforeend','<span class="pd-info"><span class="of-kick">Skin of the day · 50% off</span><b>'+esc(sk.name+' '+b.name)+'</b><span class="sm">Comes with a matching pin'+(S.owned[rid]?'':' · saved until you unlock '+esc(b.name))+'</span>'+(own?'<span class="tag own">Owned</span>':'<span class="tag">'+ICON.gems+Math.ceil(pr.gems*.5)+' <s style="opacity:.6">'+pr.gems+'</s></span>')+'</span>');
     if(!own)d.addEventListener('click',()=>buySkin(rid,sid,.5,renderShop));body.append(d);}
   if(rest.length){const g=document.createElement('div');g.className='grid three';
     for(const[rid,sid]of rest){const b=BY_ID[rid],sk=getSkin(b,sid),pr=skinPrice(sk),el=document.createElement('button');el.className='card';el.style.setProperty('--r',sk.tier==='sig'?'#ffc93c':sk.tier===3?'#ffd23f':sk.tier===2?'#b56cff':'#46b4ff');
       el.append(thumb(b,sk,90));el.insertAdjacentHTML('beforeend',(sk.set?'<span class="ribbon" style="background:#2fb48c">+ pin</span>':'')+'<span class="nm" style="font-size:13px">'+esc(sk.name)+'</span><span class="sm">'+b.name+(S.owned[rid]?'':' · saved until unlocked')+'</span><span class="tag">'+ICON.gems+pr.gems+'</span><span class="sm">or '+fmt(pr.coins)+' coins</span>');
       el.addEventListener('click',()=>buySkin(rid,sid,1,renderShop));g.append(el);}body.append(g);}
   const cb=document.createElement('button');cb.className='btn';cb.textContent='Open the skin catalog';cb.addEventListener('click',()=>openCatalog());body.append(cb);}
  {const mine=RUMBLERS.filter(b=>S.owned[b.id]);
   for(const[tierId,title,sub,col,cur]of[['gold','Golden skins','Coins only \u00b7 always for sale \u00b7 3-pin set','#ffd23f','coins'],['power','Power skins','The best rarity \u00b7 power points only \u00b7 3-pin set','#9d7bff','pp']]){
     const list=mine.filter(b=>!hasSkin(b.id,tierId));body.append(sectionTitle(title,sub));if(!list.length){body.insertAdjacentHTML('beforeend','<p class="hint" style="margin:0">You own every '+title.toLowerCase()+' for your rumblers.</p>');continue;}
     const g=document.createElement('div');g.className='hscroll';for(const b of list){const sk=getSkin(b,tierId),pr=skinPrice(sk),el=document.createElement('button');el.className='card';el.style.setProperty('--r',col);el.append(thumb(b,sk,84));
       el.insertAdjacentHTML('beforeend','<span class="nm" style="font-size:13px">'+esc(sk.name)+'</span><span class="sm">'+esc(b.name)+'</span><span class="tag">'+ICON[cur]+fmtFull(pr[cur])+'</span>');el.addEventListener('click',()=>buySkin(b.id,tierId,1,renderShop));g.append(el);}body.append(g);}}
  {const ps=S.daily.pinShop||{free:null,pins:[]},buyPin=(pid,pr)=>confirmBuy(pinName(pid)+' pin',pinCanvas('b:'+pid,96),pr,()=>{if(!S.pins.includes(pid))S.pins.push(pid);persist();toast(pinName(pid)+' pin is yours! Add it to a rumbler’s pin slots.','gems');renderShop();});
   body.append(sectionTitle('Daily pins','New pins every day · new in '+untilMidnight()));body.append(rerollBtn('pins'));
   if(ps.free){const own=S.pins.includes(ps.free),d=document.createElement('button');d.className='pindeal';d.append(pinCanvas('b:'+ps.free,84));
     d.insertAdjacentHTML('beforeend','<span class="pd-info"><span class="of-kick">Free pin of the day</span><b>'+esc(pinName(ps.free))+'</b>'+(own?'<span class="tag own">Claimed</span><span class="sm">A new free pin arrives tomorrow</span>':'<span class="tag" style="background:#6be39a;color:#062b16">FREE · tap to claim</span>')+'</span>');
     if(!own)d.addEventListener('click',()=>{S.pins.push(ps.free);persist();sfx('unlock');toast(pinName(ps.free)+' pin claimed! Add it to a rumbler’s pin slots.','gems');renderShop();});body.append(d);}
   const pg=document.createElement('div');pg.className='grid three';
   for(const pid of ps.pins){const own=S.pins.includes(pid),el=document.createElement('button');el.className='card';el.style.setProperty('--r',TOXIC_PINS.some(x=>x[0]===pid)?'#7ed957':DAILY_ONLY_PINS.some(x=>x[0]===pid)?'#5ec8ff':'#ff9f43');
     el.append(pinCanvas('b:'+pid,64));el.insertAdjacentHTML('beforeend','<span class="nm" style="font-size:13px">'+esc(pinName(pid))+'</span>'+(own?'<span class="tag own">Owned</span>':'<span class="tag">'+ICON.gems+PIN_PRICE.gems+'</span><span class="sm">or '+PIN_PRICE.coins+' coins</span>'));
     if(!own)el.addEventListener('click',()=>buyPin(pid,[['gems',PIN_PRICE.gems],['coins',PIN_PRICE.coins]]));pg.append(el);}
   body.append(pg);body.insertAdjacentHTML('beforeend','<p class="hint" style="margin:0">Every rumbler already has 3 free pins of its own. Tap a rumbler, then Pins, to choose its 2 custom pins.</p>');const pcb=document.createElement('button');pcb.className='btn';pcb.textContent='Open the pin catalog';pcb.addEventListener('click',()=>openPinCatalog());body.append(pcb);}
  body.append(sectionTitle('Boxes','Gems only \u00b7 open them from the Play screen'));
  {const bg=document.createElement('div');bg.className='grid';
   for(const[k,desc]of[['rbox','A guaranteed new rumbler (usually Rare to Mythic, sometimes Legendary) + 7 or more rewards'],['sbox','8 rewards: 3 guaranteed skins for your rumblers + 5 more']]){const el=document.createElement('button');el.className='card boxcard';el.style.setProperty('--r',RARITY[k].col);
     el.append(dropCanvas(k,80));el.insertAdjacentHTML('beforeend','<span class="nm">'+RARITY[k].name+'</span><span class="sm">'+desc+'</span><span class="tag">'+ICON.gems+BOX_PRICE[k]+'</span>');
     el.addEventListener('click',()=>confirmBuy(RARITY[k].name,dropCanvas(k,110),[['gems',BOX_PRICE[k]]],()=>{S.drops.push({r:k,min:null});persist();sfx('unlock');toast(RARITY[k].name+' added! Opening it now','gems');renderShop();openDrops();}));bg.append(el);}
   body.append(bg);}
  body.append(sectionTitle('Resources'));const rg=document.createElement('div');rg.className='grid';
  for(const p of PACKS){const k=Object.keys(p.get)[0],el=document.createElement('button');el.className='card';el.style.setProperty('--r',k==='pp'?'#c792ff':'#ffc93c');
    el.innerHTML='<span style="width:64px;height:64px;display:grid;place-items:center">'+ICON[k].replace('<svg','<svg width="60" height="60"')+'</span><span class="nm">'+p.name+'</span><span class="sm">+'+fmtFull(p.get[k])+' '+CUR_NAME[k]+'</span><span class="tag">'+ICON[p.pay[0]]+fmtFull(p.pay[1])+'</span>';
    el.addEventListener('click',()=>confirmBuy(p.name,null,[p.pay],()=>{S[k]+=p.get[k];persist();toast('+'+fmtFull(p.get[k])+' '+CUR_NAME[k],k);renderShop();}));rg.append(el);}
  body.append(rg);
}

/* ---------- Ranked ---------- */
let embN=0;
function starPath(cx,cy,r1,r2,n){let d='';for(let k=0;k<n*2;k++){const a=k*Math.PI/n-Math.PI/2,r=k%2?r2:r1;d+=(k?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1);}return d+'Z';}
const EMB_PAL=[['#ffd2a8','#c77a43'],['#ffffff','#a9b3c9'],['#fff1a0','#e9a521'],['#e6fdff','#45c4ef'],['#f0dcff','#9a5cf5'],['#ffd1dc','#ff4f7e'],['#e6fdff','#7df9ff'],['#fff7c2','#d46bff']];
function emblem(i,size,noPips){
  const master=i>=RANK_STEPS-1,t=master?7:Math.floor(i/3),dv=master?-1:i%3,id='em'+(embN++),[c1,c2]=EMB_PAL[t];
  const O='stroke="#120f26" stroke-width="5" stroke-linejoin="round"';
  const SH='M60 12 100 26v28c0 27-17 45-40 56C37 99 20 81 20 54V26z',HI='M60 22 90 33v21c0 20-12 33-30 42-18-9-30-22-30-42V33z';
  let back='',body='',front='';
  const mirror=s=>s+'<g transform="translate(120 0) scale(-1 1)">'+s+'</g>';
  if(t===0){body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';}
  if(t===1){back=mirror('<path d="M26 40 4 30l6 13-8 4 10 8-6 6 20 2z" fill="#e9edf6" '+O+'/>');body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';}
  if(t===2){let l='';for(let k=0;k<6;k++){const a=(118+k*24)*Math.PI/180,x=60+Math.cos(a)*50,y=62+Math.sin(a)*50,r=(a*180/Math.PI)+90;l+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="8" ry="4" transform="rotate('+r.toFixed(0)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="#7fd36b" stroke="#120f26" stroke-width="2.5"/>';}
    back=mirror(l);body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';front='<path d="M40 20 43 4l9 8 8-10 8 10 9-8 3 16z" fill="#ffd23f" '+O.replace('5','4')+'/><circle cx="60" cy="13" r="3" fill="#ff4d6d"/>';}
  if(t===3){body='<path d="M60 6 104 42 60 114 16 42z" fill="url(#'+id+')" '+O+'/><path d="M16 42h88M38 42 60 6 82 42M38 42 60 114 82 42" fill="none" stroke="rgba(18,15,38,.45)" stroke-width="2.5"/><path d="M60 14 78 40H42z" fill="rgba(255,255,255,.4)"/>';}
  if(t===4){back=mirror('<path d="M32 32C14 24 8 10 12 2c6 10 16 16 28 18z" fill="#3a2266" '+O.replace('5','4')+'/>');body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';}
  if(t===5){back=mirror('<path d="M28 34C12 30 2 18 2 6c8 8 16 10 26 12-10 2-16 0-22-2 6 8 14 12 24 12-8 4-14 4-20 2 6 6 12 8 20 8z" fill="#ffb347" '+O.replace('5','3.5')+'/>');
    body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';front='<path d="M42 22 45 6l8 8 7-11 7 11 8-8 3 16z" fill="#ffd23f" '+O.replace('5','4')+'/>';}
  if(t===6){/* Ultra: a glowing prism crystal with a spinning halo and orbiting shards */
    let sh='';for(let k=0;k<3;k++){const a2=k*120;sh+='<path d="M60 0l5 9-5 9-5-9z" fill="#fff" transform="rotate('+a2+' 60 60)"/>';}
    back='<circle cx="60" cy="60" r="58" fill="url(#'+id+'h)"><animate attributeName="r" values="52;58;52" dur="2s" repeatCount="indefinite"/></circle><g><circle cx="60" cy="60" r="54" fill="none" stroke="#7df9ff" stroke-width="3" stroke-dasharray="14 9" opacity=".8"/><animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="8s" repeatCount="indefinite"/></g>';
    body='<path d="M60 6 102 30v60L60 114 18 90V30z" fill="url(#'+id+')" '+O+'/><path d="M60 6v108M18 30l84 60M102 30 18 90" stroke="rgba(18,15,38,.25)" stroke-width="2"/><path d="M60 18 90 36v26L60 46 30 62V36z" fill="rgba(255,255,255,.28)"/><path d="M28 44 40 56 30 70M92 44 80 56 90 70" fill="none" stroke="#e6fdff" stroke-width="3" stroke-linecap="round"><animate attributeName="opacity" values="1;.2;1" dur=".9s" repeatCount="indefinite"/></path>';
    front='<g>'+sh+'<animateTransform attributeName="transform" type="rotate" from="0 60 60" to="-360 60 60" dur="5s" repeatCount="indefinite"/></g><path d="M44 18 48 4l7 7 5-9 5 9 7-7 4 14z" fill="#e6fdff" '+O.replace('5','3.5')+'/>';}
  if(t===7){/* Master: the star badge, now in a spinning rainbow, with rainbow rays, a jewelled crown and orbiting gems */
    const RB=['#ff4d6d','#ff9a1a','#ffd23f','#6be39a','#5ec8ff','#7b6cff','#d46bff'];
    let rays='';for(let k=0;k<14;k++){const a2=k*360/14;rays+='<path d="M60 60 L'+(60+Math.cos((a2-5)*Math.PI/180)*62).toFixed(1)+' '+(60+Math.sin((a2-5)*Math.PI/180)*62).toFixed(1)+' L'+(60+Math.cos((a2+5)*Math.PI/180)*62).toFixed(1)+' '+(60+Math.sin((a2+5)*Math.PI/180)*62).toFixed(1)+'z" fill="'+RB[k%7]+'" opacity=".5"/>';}
    let sp='';for(let k=0;k<4;k++){const a2=k*Math.PI/2+Math.PI/4;sp+='<path d="'+starPath(60+Math.cos(a2)*54,60+Math.sin(a2)*54,5.5,2,4)+'" fill="#fff"/>';}
    back='<circle cx="60" cy="60" r="58" fill="url(#'+id+'g)"/><g>'+rays+'<animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="14s" repeatCount="indefinite"/></g>';
    body='<path d="'+starPath(60,60,52,38,12)+'" fill="url(#'+id+')" stroke="#120f26" stroke-width="5" stroke-linejoin="round"/><path d="'+starPath(60,60,45,33,12)+'" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/>'+
      '<circle cx="60" cy="60" r="32" fill="url(#'+id+'c)" stroke="#120f26" stroke-width="4"/><circle cx="60" cy="60" r="28" fill="none" stroke="#ffd23f" stroke-width="3"/><circle cx="60" cy="60" r="23" fill="none" stroke="url(#'+id+')" stroke-width="2.5" opacity=".9"/>';
    front='<path d="M37 25 40 5l10 9 10-13 10 13 10-9 3 20z" fill="url(#'+id+'k)" stroke="#120f26" stroke-width="4" stroke-linejoin="round"/><path d="M38 21h44" stroke="#120f26" stroke-width="2" opacity=".35"/>'+
      '<circle cx="40" cy="5" r="2.8" fill="#fff6c2" stroke="#120f26" stroke-width="1.4"/><circle cx="60" cy="3.5" r="3" fill="#fff6c2" stroke="#120f26" stroke-width="1.4"/><circle cx="80" cy="5" r="2.8" fill="#fff6c2" stroke="#120f26" stroke-width="1.4"/>'+
      '<circle cx="48" cy="17" r="2.8" fill="#5ef2ff" stroke="#120f26" stroke-width="1.4"/><path d="M60 10l4.5 5.5-4.5 5.5-4.5-5.5z" fill="#ff4d6d" stroke="#120f26" stroke-width="1.4"/><circle cx="72" cy="17" r="2.8" fill="#6be39a" stroke="#120f26" stroke-width="1.4"/>'+
      '<g>'+sp+'<animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="6s" repeatCount="indefinite"/></g>'+
      '<g>'+RB.map((col,k)=>'<circle cx="'+(60+Math.cos(k*TAU/7)*44).toFixed(1)+'" cy="'+(60+Math.sin(k*TAU/7)*44).toFixed(1)+'" r="3.2" fill="'+col+'" stroke="#120f26" stroke-width="1.5"/>').join('')+'<animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="9s" repeatCount="indefinite"/></g>'+
      '<circle cx="60" cy="60" r="40" fill="none" stroke="url(#'+id+')" stroke-width="2.5" opacity=".7"><animate attributeName="r" values="36;57;36" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="2.2s" repeatCount="indefinite"/></circle>';}
  let mid;
  if(t===4)mid='<ellipse cx="60" cy="56" rx="17" ry="11" fill="#fff" stroke="#120f26" stroke-width="3.5"/><circle cx="60" cy="56" r="7" fill="#7b2fe0"/><circle cx="58" cy="54" r="2.4" fill="#fff"/>';
  else if(t===5)mid='<path d="M60 36c10 10 14 18 10 28-2 6-6 9-10 10-4-1-8-4-10-10-3-8 0-14 6-20 0 6 2 9 4 10 1-6 0-12 0-18z" fill="#fff1a6" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"/>';
  else if(t===6)mid='<path d="M60 40l14 18-14 22-14-22z" fill="#fff" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"><animate attributeName="fill" values="#fff;#ffe9fb;#e6fdff;#fff" dur="2s" repeatCount="indefinite"/></path>';
  else if(t===7)mid='<path d="'+starPath(60,60,21,9,5)+'" fill="#fff" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"/><path d="'+starPath(60,60,21,9,5)+'" fill="url(#'+id+')" opacity=".25"/>';
  else mid='<path d="'+starPath(60,t===3?44:56,15,6.8,5)+'" fill="#fff" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"/>';
  const hi=t===3||t>=6?'':'<path d="'+HI+'" fill="rgba(255,255,255,.2)"/><path d="'+HI+'" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>'+(t>=2&&t!==3&&t<6?'<path d="M60 92l6 6-6 6-6-6z" fill="'+c1+'" stroke="#120f26" stroke-width="2.5"/>':'');
  let pips='';if(dv>=0&&!noPips)for(let k=0;k<3;k++){const x=46+k*14;pips+='<path d="M'+x+' 80l5 5-5 5-5-5z" fill="'+(k<=dv?'#fff':'rgba(18,15,38,.35)')+'" stroke="#120f26" stroke-width="2"/>';}
  const grad=t===6?'<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7df9ff"><animate attributeName="stop-color" values="#7df9ff;#ff7ad9;#ffe98a;#7df9ff" dur="3s" repeatCount="indefinite"/></stop><stop offset=".5" stop-color="#2f6bff"><animate attributeName="stop-color" values="#2f6bff;#8a3bff;#2fd0ff;#2f6bff" dur="3s" repeatCount="indefinite"/></stop><stop offset="1" stop-color="#7a1fd8"><animate attributeName="stop-color" values="#7a1fd8;#1f9bd8;#d81f9b;#7a1fd8" dur="3s" repeatCount="indefinite"/></stop></linearGradient><radialGradient id="'+id+'h"><stop offset=".4" stop-color="#7df9ff" stop-opacity=".6"/><stop offset="1" stop-color="#7df9ff" stop-opacity="0"/></radialGradient>':t===7?'<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1">'+['#ff4d6d','#ff9a1a','#ffd23f','#6be39a','#5ec8ff','#7b6cff','#d46bff','#ff4d6d'].map((col,k)=>'<stop offset="'+(k/7).toFixed(3)+'" stop-color="'+col+'"/>').join('')+'<animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="5s" repeatCount="indefinite"/></linearGradient><radialGradient id="'+id+'g"><stop offset=".3" stop-color="#ffffff" stop-opacity=".45"/><stop offset=".7" stop-color="#d46bff" stop-opacity=".25"/><stop offset="1" stop-color="#5ec8ff" stop-opacity="0"/></radialGradient><radialGradient id="'+id+'c" cx=".4" cy=".35"><stop offset="0" stop-color="#5a3ad8"/><stop offset="1" stop-color="#140f3a"/></radialGradient><linearGradient id="'+id+'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a6"/><stop offset=".55" stop-color="#ffc21a"/><stop offset="1" stop-color="#e08a1a"/></linearGradient>'
    :'<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c1+'"/><stop offset="1" stop-color="'+c2+'"/></linearGradient>';
  /* extra flair: glowing aura, a shine that sweeps across, and twinkling sparkles on higher ranks */
  const shape=t===3?'M60 6 104 42 60 114 16 42z':t===7?starPath(60,60,52,38,12):t===6?'M60 6 102 30v60L60 114 18 90V30z':SH,big=size>=40;
  const aura=t>=1?'<circle cx="60" cy="60" r="56" fill="url(#'+id+'a)"><animate attributeName="opacity" values=".5;1;.5" dur="'+(3-t*.3).toFixed(1)+'s" repeatCount="indefinite"/></circle>':'';
  const auraG='<radialGradient id="'+id+'a"><stop offset=".45" stop-color="'+c2+'" stop-opacity=".7"/><stop offset="1" stop-color="'+c2+'" stop-opacity="0"/></radialGradient><clipPath id="'+id+'k"><path d="'+shape+'"/></clipPath>';
  const sheen=big?'<g clip-path="url(#'+id+'k)"><rect x="-80" y="-10" width="26" height="150" fill="#fff" opacity=".45" transform="skewX(-22)"><animate attributeName="x" values="-80;170;170" dur="'+(4-t*.3).toFixed(1)+'s" repeatCount="indefinite"/></rect></g>':'';
  let tw='';if(big&&t>=2){const P=[[18,22],[102,30],[98,96],[22,90],[60,4]];for(let k=0;k<Math.min(5,t);k++){const[x,y]=P[k];tw+='<path d="'+starPath(x,y,6,2,4)+'" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="'+(k*.4).toFixed(1)+'s" repeatCount="indefinite"/></path>';}}
  const rim=t>=3&&t<=6?'<path d="'+shape+'" fill="none" stroke="'+c1+'" stroke-width="2" stroke-dasharray="8 10" opacity=".9"><animate attributeName="stroke-dashoffset" values="0;-36" dur="1.6s" repeatCount="indefinite"/></path>':'';
  return '<svg viewBox="0 0 120 120" width="'+size+'" height="'+size+'" aria-hidden="true"><defs>'+grad+auraG+'</defs>'+aura+back+body+hi+sheen+rim+mid+pips+front+tw+'</svg>';
}
function renderRanked(){
  const body=$('#rankedBody'),ri=rankInfo(S.rp),locked=ownedCount()<3;
  let h='<header class="head"><h1>Ranked</h1><span class="pill">'+emblem(ri.i,24)+'<span>'+fmtFull(S.rp)+' RP</span></span></header>';
  h+='<div class="panel emblem">'+emblem(ri.i,120)+'<h2 style="color:'+ri.col+';text-shadow:0 3px 0 #0d0a22">'+ri.name+'</h2>';
  h+=ri.need?'<div class="rp-bar"><i style="width:'+Math.round(ri.into/ri.need*100)+'%"></i></div><p class="hint">'+ri.into+' / '+ri.need+' RP to the next division · win streak '+S.streak+'</p>':'<p class="hint">Top of the ladder.</p>';
  h+=locked?'<p class="hint" style="color:#ffd1dc">Unlock 3 rumblers to play ranked ('+ownedCount()+' / 3). Earn chromos from takedowns to unlock more.</p>':'<p class="hint">Each match picks a random mode. Wins give 25 RP plus a streak bonus, 100 coins, 50 power points and 3 gems; losses cost 15 RP. Ranked matches also earn 1.5× pass tokens. Opponents now: <b>'+RANK_FOE_NAMES[ri.i>=RANK_STEPS-1?6:Math.floor(ri.i/3)]+'</b>. In Master every win pays extra, more the higher your RP.</p>';
  h+='<button class="play ranked" id="rankedPlay"'+(locked?' disabled style="filter:grayscale(.7) brightness(.7)"':'')+'>Play ranked<small>Random mode · 3 vs 3</small></button></div>';
  {const got=!!S.masterAll;h+='<div class="panel master-panel"><div class="mp-head">'+emblem(RANK_STEPS-1,64)+'<div><span class="of-kick">Reach Master</span><h2>Master bundle</h2><p class="hint" style="margin:0">'+(got?'Claimed. You\u2019re a Master!':'Everything below, all at once, the moment you reach Master.')+'</p></div></div><ul class="mp-list">'+
    '<li>'+ICON.chromos+'<span>15,000 chromos</span></li><li>'+ICON.gems+'<span>500 gems</span></li><li>'+ICON.coins+'<span>10,000 coins</span></li><li>'+ICON.pp+'<span>5,000 power points</span></li>'+
    '<li>'+DI('ultra')+'<span>3 Amazing Drops</span></li><li>'+DI('legendary')+'<span>5 Legendary Drops</span></li><li>'+ICON.rp+'<span>Grandmaster skin on <b>every</b> rumbler</span></li><li>'+ICON.rp+'<span>Master pin with an “I reached Masters” sign</span></li></ul><div class="mp-art"></div></div>';}
  h+='<div class="sec-title"><h2>Rank sets</h2><span>A skin and pin for every rank, for a rumbler picked just for you</span></div><div class="rsets">'+RANK_SETS.map((rs,k)=>{const got=hasSkin(rankSetRumbler(k,rankSeed(S)),rs.skin.id)&&S.pins.includes(rs.pin);
    return '<button class="rset'+(got?' got':'')+'" data-k="'+k+'" style="--rc:'+rs.pal[1]+'"><span class="rs-art"></span><b>'+(rs.key==='master'?'Master':rs.name)+'</b><small>'+(got?'Owned':rs.idx===0?'Play ranked':'Reach '+(rs.key==='master'?'Master':rs.name+' I'))+'</small></button>';}).join('')+'</div>';
  h+='<div class="sec-title"><h2>Ladder</h2><span>Tap a division to see its rewards</span></div><ol class="ladder">';
  for(let i=RANK_STEPS-1;i>=1;i--){const r=i===RANK_STEPS-1?{name:'Master',col:'#ff5e87'}:rankInfo(i*100),rw=rankReward(i),cls=i===ri.i?'cur':i<=S.rankClaimed?'done':i<=(S.rankPeak|0)?'ready':'';
    h+='<li class="'+cls+'" data-i="'+i+'" tabindex="0" role="button">'+emblem(i,42)+'<span>'+r.name+'</span><small>'+(i<=S.rankClaimed?'Claimed':rw.master?ICON.rp+'Master bundle':(RANK_SETS.some(rs=>rs.idx===i)?'<span class="setchip">+ set</span> ':'')+ICON.chromos+fmt(rw.chromos)+' '+ICON.gems+rw.gems+' '+DI(rw.drops[0].r,18)+'×'+rw.drops[0].n)+'</small></li>';}
  h+='</ol>';
  {const n=Math.max(0,(S.rankPeak|0)-(S.rankClaimed|0)),gold=(S.rankPeak|0)>=CLAIM_MIN_STEP;h+='<div class="panel claim-panel"><h2>Claim rank rewards</h2><p class="hint" style="margin:0">'+(n&&!gold?'You have <b>'+n+'</b> rank reward'+(n>1?'s':'')+' waiting. Reach <b style="color:#ffd23f">Gold I</b> to unlock claiming. Keep climbing!':n?'You have <b>'+n+'</b> rank reward'+(n>1?'s':'')+' waiting, up to <b>'+(S.rankPeak>=RANK_STEPS-1?'Master':rankInfo(S.rankPeak*100).name)+'</b>. Claiming pays them all out and sends you back to Bronze I to climb again. Rank sets get new random rumblers each climb (Master stays Ember).':'Climb the ladder, then come back here to claim every reward you reached at once.')+'</p><button class="btn gold claim-btn" id="rankClaim"'+(n&&gold?'':' disabled')+'>'+(n&&!gold?'\ud83d\udd12 Reach Gold to claim':'Claim'+(n?' '+n+' reward'+(n>1?'s':''):''))+'</button></div>';}
  body.innerHTML=h;
  {const cb=$('#rankClaim');if(cb)cb.addEventListener('click',()=>{const ask=(msg,yes)=>openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Are you sure?</h2><p class="sub">'+msg+'</p>');const y=document.createElement('button');y.className='btn gold';y.textContent='Yes';y.addEventListener('click',yes);const n=document.createElement('button');n.className='btn';n.textContent='No';n.addEventListener('click',closeSheet);card.append(y,n);});
    ask('By claiming this reward, this resets you to Bronze I. Are you sure?',()=>ask('Really sure? You go back to Bronze I and climb again. This can\u2019t be undone.',()=>{const r=claimRanked();closeSheet();if(!r)return;sfx('unlock');
      openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Rewards claimed!</h2><ul class="mp-list"><li>'+ICON.chromos+'<span>+'+fmtFull(r.chromos)+' chromos</span></li><li>'+ICON.gems+'<span>+'+r.gems+' gems</span></li><li>'+ICON.coins+'<span>+'+fmtFull(r.coins)+' coins</span></li><li>'+ICON.pp+'<span>+'+fmtFull(r.pp)+' power points</span></li><li>'+ICON.drop+'<span>'+r.rankBundle.drops+' drops (open them from Play)</span></li>'+(r.rankSets.length?'<li>'+ICON.rp+'<span>'+r.rankSets.length+' rank set'+(r.rankSets.length>1?'s':'')+'</span></li>':'')+(r.master?'<li>'+ICON.rp+'<span>Grandmaster skin on every rumbler!</span></li>':'')+'</ul><p class="sub">You\u2019re back at Bronze I. Good luck on the next climb!</p>');const x=document.createElement('button');x.className='btn gold';x.textContent='Nice!';x.addEventListener('click',()=>{closeSheet();renderRanked();});card.append(x);});renderRanked();}));});}
  {const art=body.querySelector('.mp-art');if(art){const sb=BY_ID[rankSetRumbler(RANK_SETS.length-1,rankSeed(S))];art.append(thumb(sb,getSkin(sb,'master'),110));art.insertAdjacentHTML('beforeend','<small>Grandmaster '+esc(sb.name)+'</small>');const pc=pinCanvas('b:master',84);pc.classList.add('mp-pin');art.append(pc);art.insertAdjacentHTML('beforeend','<small>Master pin</small>');}}
  const rsb=rs=>BY_ID[rankSetRumbler(RANK_SETS.indexOf(rs),rankSeed(S))];
  const setPreview=rs=>{const eb=rsb(rs);const d=document.createElement('div');d.className='d-set';d.append(thumb(eb,getSkin(eb,rs.skin.id),110));const pc=pinCanvas('b:'+rs.pin,96);pc.className='mp-pin';d.append(pc);return d;};
  body.querySelectorAll('.rset').forEach(bt=>{const rs=RANK_SETS[+bt.dataset.k],eb=rsb(rs),art=bt.querySelector('.rs-art');art.append(thumb(eb,getSkin(eb,rs.skin.id),64));const pc=pinCanvas('b:'+rs.pin,34);pc.className='rs-pin';art.append(pc);
    bt.addEventListener('click',()=>openSheet(card=>{const got=S.pins.includes(rs.pin),nm=rs.key==='master'?'Master':rs.name;
      card.insertAdjacentHTML('beforeend','<h2>'+nm+' set</h2><p class="sub">'+(got?'You own this set. Equip the skin on '+esc(rsb(rs).name)+' and send the pin in matches.':rs.idx===0?'Play your first ranked match to get it.':'Reach '+(rs.key==='master'?'Master':nm+' I')+' in ranked to get it.')+'</p>');
      card.append(setPreview(rs));card.insertAdjacentHTML('beforeend','<ul class="mp-list"><li>'+ICON.rp+'<span>'+esc(rs.skin.name)+' '+esc(rsb(rs).name)+' skin</span></li><li>'+ICON.rp+'<span>“I reached '+rs.name+'” pin</span></li></ul>');
      const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);}));});
  body.querySelectorAll('.ladder li').forEach(li=>{const open=()=>{const i=+li.dataset.i;if(i>=RANK_STEPS-1){$('#ranked').scrollTop=0;return;}const rw=rankReward(i),nm=rankInfo(i*100).name,setAt=RANK_SETS.find(rs=>rs.idx===i);
    openSheet(card=>{card.insertAdjacentHTML('beforeend','<div class="d-top">'+emblem(i,96)+'<div class="d-info"><h2>'+nm+'</h2><p class="sub">'+(i<=S.rankClaimed?'You already claimed these.':'You get all of this the first time you reach '+nm+'.')+'</p></div></div><ul class="mp-list">'+
      '<li>'+ICON.chromos+'<span>'+fmtFull(rw.chromos)+' chromos</span></li><li>'+ICON.gems+'<span>'+rw.gems+' gems</span></li><li>'+ICON.coins+'<span>'+fmtFull(rw.coins)+' coins</span></li><li>'+ICON.pp+'<span>'+fmtFull(rw.pp)+' power points</span></li><li>'+ICON.drop+'<span>'+rw.drops[0].n+' '+dropName(rw.drops[0].r)+(rw.drops[0].n>1?'s':'')+'</span></li>'+(setAt?'<li>'+ICON.rp+'<span>'+esc(setAt.skin.name)+' Ember skin</span></li><li>'+ICON.rp+'<span>\u201cI reached '+setAt.name+'\u201d pin</span></li>':'')+'</ul>');
      if(setAt)card.append(setPreview(setAt));
      const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});};
    li.addEventListener('click',open);li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});});
  const b=$('#rankedPlay');if(b&&!locked)b.addEventListener('click',()=>startMatchmaking(true));
}

/* Trick's Pick a Rarity gadget: choose where his next attack comes from */
let rarPickT=null;
function openRarPick(list){const el=$('#rarPick');el.innerHTML='<p>Pick a rarity for your next attack</p>';const row=document.createElement('div');row.className='rp-row';
  const done=r=>{clearTimeout(rarPickT);el.hidden=true;if(P&&!P.dead)forceTrickAtk(P,r);};
  for(const r of list){const b=document.createElement('button');b.className='rpill'+rpc(r);b.style.setProperty('--r',RARITY[r].col);b.textContent=RARITY[r].name;b.addEventListener('click',e=>{e.stopPropagation();done(r);});row.append(b);}
  el.append(row);el.hidden=false;clearTimeout(rarPickT);rarPickT=setTimeout(()=>{if(!el.hidden)done(pick(list));},6000);}
/* ---------- Matchmaking ---------- */
let mmTimers=[],lastRanked=false,lastTrial=null;
function clearMM(){mmTimers.forEach(clearTimeout);mmTimers=[];}
/* Ranked pick screen: picks happen in turns (red, blue, you, red, red, blue). Bots take a moment to decide, and nobody can take a picked rumbler */
let draftTimers=[];
function clearDraft(){draftTimers.forEach(clearTimeout);draftTimers.forEach(clearInterval);draftTimers=[];}
function openRankedDraft(){audio();sfx('click');clearMM();closeSheet();clearDraft();
  const mode=pick(MODES.filter(m=>m.ranked)),pool=RUMBLERS.filter(b=>!b.random),smx=seasonMaxed(),RANK_MIN_LVL=4;
  const party=[...new Set((S.party||[]).map(f=>f.rumbler).filter(id=>BY_ID[id]))].slice(0,2);
  const picks={m0:null,m1:null,me:null,f0:null,f1:null,f2:null},bans=[],taken=()=>new Set(Object.values(picks).filter(Boolean).concat(bans)),banOn=rankInfo(S.rp).tier>=2;
  const choices=smx.map(id=>({id,maxed:true})).concat(Object.keys(S.owned).filter(id=>BY_ID[id]&&!smx.includes(id)).map(id=>({id,maxed:false})));
  const okLvl=c=>c.maxed||(S.owned[c.id]&&S.owned[c.id].lvl>=RANK_MIN_LVL);
  const fn=shuffle(BOT_NAMES.slice()),names={me:S.name,m0:(S.party||[])[0]?safeName(S.party[0].name):fn[0],m1:(S.party||[])[1]?safeName(S.party[1].name):fn[1],f0:fn[2],f1:fn[3],f2:fn[4]};
  const ORDER=['f0','m0','me','f1','f2','m1'];
  const el=$('#draft');el.hidden=false;const card=el.querySelector('.draft-card');card.classList.add('rk-draft');
  const slot=k=>'<div class="dslot '+(k[0]==='f'?'red':'blue')+(k==='me'?' you':'')+'" data-k="'+k+'"><span class="ds-pic"></span><span class="ds-txt"><b>'+esc(names[k])+'</b><small>Waiting…</small></span></div>';
  card.innerHTML='<div class="dr-top"><p class="mm-k">Ranked · '+rankInfo(S.rp).name+'</p><h2>'+esc(mode.name)+'</h2><p class="small">'+'Random map every ranked game'+'</p></div>'+
    '<div class="dr-turn" id="drTurn">Getting ready…</div>'+(banOn?'<div class="dr-bans" id="drBans"><small>Bans</small></div>':'')+
    '<div class="dr-board"><div class="dr-col">'+['m0','me','m1'].map(slot).join('')+'</div><div class="dr-vs">VS</div><div class="dr-col">'+['f0','f1','f2'].map(slot).join('')+'</div></div>'+
    '<p class="small">Your rumbler must be level '+RANK_MIN_LVL+'+. Season Max rumblers are free for everyone this month at max level with a gadget and star power.</p><div class="dr-grid"></div><button class="btn" id="draftCancel">Leave</button>';
  const grid=card.querySelector('.dr-grid'),turnEl=card.querySelector('#drTurn');let myTurn=false;
  const setSlot=(k,id,state)=>{const sEl=card.querySelector('.dslot[data-k="'+k+'"]'),pic=sEl.querySelector('.ds-pic'),sm=sEl.querySelector('small');pic.innerHTML='';
    if(id){const b=BY_ID[id];pic.append(thumb(b,getSkin(b,k==='me'&&S.owned[id]?S.owned[id].skin:'classic'),54));}
    sEl.classList.toggle('thinking',state==='think');sEl.classList.toggle('locked',state==='lock');sEl.classList.toggle('turn',state==='think'||state==='turn');
    sm.textContent=state==='lock'?BY_ID[id].name+(k==='me'&&mineMax?' · Season Max':''):state==='think'?'Choosing…':state==='turn'?'Your turn!':'Waiting…';};
  let mineMax=false;
  const drawGrid=()=>{grid.innerHTML='';const t=taken();for(const c of choices){const b=BY_ID[c.id],own=S.owned[c.id],tk=t.has(c.id),low=!okLvl(c),d=document.createElement('button');
    d.className='dr-pick'+(c.maxed?' max':'')+(tk||low?' lock':'');d.disabled=tk||low||!myTurn;d.style.setProperty('--r',RARITY[b.rarity].col);
    d.append(thumb(b,getSkin(b,own?own.skin:'classic'),62));d.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b><small>'+(tk?'Taken':low?'Lv '+own.lvl+' · needs '+RANK_MIN_LVL:c.maxed?'SEASON MAX':'Level '+own.lvl)+'</small>');
    if(!tk&&!low)d.addEventListener('click',()=>{if(myTurn)lockMe(c);});grid.append(d);}};
  const finish=()=>{turnEl.textContent='Get ready to rumble!';draftTimers.push(setTimeout(()=>{el.hidden=true;card.classList.remove('rk-draft');startMatchmaking(true,{mode,draft:{id:picks.me,maxed:mineMax,mates:[picks.m0,picks.m1],foes:[picks.f0,picks.f1,picks.f2]}});},1400));};
  let step=0;
  const next=()=>{if(step>=ORDER.length){finish();return;}const k=ORDER[step++];
    if(k==='me'){const free=choices.filter(c=>!taken().has(c.id)&&okLvl(c));
      if(!free.length){const r=pick(pool.filter(b=>!taken().has(b.id)));toast('No free rumbler at level '+RANK_MIN_LVL+'+, so you get a random one: '+esc(r.name));picks.me=r.id;setSlot('me',r.id,'lock');drawGrid();draftTimers.push(setTimeout(next,700));return;}
      myTurn=true;let left=20;setSlot('me',null,'turn');turnEl.innerHTML='<b>Your turn to pick!</b> <span class="dr-clock">'+left+'</span>';drawGrid();sfx('pin');
      const iv=setInterval(()=>{left--;const ck=turnEl.querySelector('.dr-clock');if(ck)ck.textContent=left;if(left<=0){clearInterval(iv);lockMe(pick(choices.filter(c=>!taken().has(c.id)&&okLvl(c))));}},1000);draftTimers.push(iv);lockMe.iv=iv;return;}
    const fixed=k==='m0'?party[0]:k==='m1'?party[1]:null,cand=pool.filter(b=>!taken().has(b.id)&&b.id!==fixed),final=fixed&&!taken().has(fixed)?fixed:pick(cand).id;
    turnEl.textContent=(k[0]==='f'?'Opponent ':'Teammate ')+names[k]+' is choosing…';let n=0;
    const iv=setInterval(()=>{const h=pick(cand);setSlot(k,h.id,'think');n++;},260);draftTimers.push(iv);
    draftTimers.push(setTimeout(()=>{clearInterval(iv);picks[k]=final;setSlot(k,final,'lock');sfx('pin');drawGrid();draftTimers.push(setTimeout(next,450));},rand(1600,3400)));};
  function lockMe(c){if(!myTurn||!c)return;myTurn=false;if(lockMe.iv)clearInterval(lockMe.iv);picks.me=c.id;mineMax=!!c.maxed;setSlot('me',c.id,'lock');sfx('unlock');drawGrid();turnEl.textContent='Locked in '+BY_ID[c.id].name+'!';draftTimers.push(setTimeout(next,600));}
  drawGrid();card.querySelector('#draftCancel').addEventListener('click',()=>{clearDraft();el.hidden=true;card.classList.remove('rk-draft');});
  /* Gold and up: each team bans one rumbler first. Your bot teammates always agree with your ban. */
  const showBan=(id,mine)=>{const bx=card.querySelector('#drBans');const s=document.createElement('span');s.className='dr-ban '+(mine?'blue':'red');s.append(thumb(BY_ID[id],getSkin(BY_ID[id],'classic'),40));s.insertAdjacentHTML('beforeend','<i>\u2715</i><small>'+esc(BY_ID[id].name)+'</small>');bx.append(s);};
  const banPhase=()=>{let done=false,left=15;turnEl.innerHTML='<b>Ban a rumbler!</b> Nobody can play it this game <span class="dr-clock">'+left+'</span>';grid.innerHTML='';
    const doBan=id=>{if(done)return;done=true;clearInterval(iv);bans.push(id);showBan(id,true);sfx('thud');turnEl.textContent='Your team agreed: '+BY_ID[id].name+' is banned!';
      draftTimers.push(setTimeout(()=>{const strong=pool.filter(b=>!bans.includes(b.id)).sort(()=>Math.random()-.5).sort((a,b)=>DROP_RAR.indexOf(b.rarity)-DROP_RAR.indexOf(a.rarity));const eb=(Math.random()<.6?strong[0]:pick(strong)).id;bans.push(eb);showBan(eb,false);turnEl.textContent='Opponents banned '+BY_ID[eb].name+'!';sfx('thud');drawGrid();draftTimers.push(setTimeout(next,1200));},1400));};
    for(const b of pool){const d=document.createElement('button');d.className='dr-pick banpick';d.style.setProperty('--r',RARITY[b.rarity].col);d.append(thumb(b,getSkin(b,'classic'),50));d.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b>');d.addEventListener('click',()=>doBan(b.id));grid.append(d);}
    const iv=setInterval(()=>{left--;const ck=turnEl.querySelector('.dr-clock');if(ck)ck.textContent=left;if(left<=0)doBan(pick(pool).id);},1000);draftTimers.push(iv);};
  draftTimers.push(setTimeout(banOn?banPhase:next,700));}
function startMatchmaking(ranked,pre){
  if(!ranked&&!pre&&netCanPlay()){if(NETC)netLeave();netQueue(S.mode);return;}
  if(ranked&&!pre){openRankedDraft();return;}
  audio();sfx('click');clearMM();closeSheet();lastRanked=ranked;lastTrial=null;
  const mode=pre?pre.mode:ranked?pick(MODES.filter(m=>m.ranked)):MODE_BY[S.mode];
  try{newMatch({mode:mode.id,ranked,draft:pre&&pre.draft});}catch(err){M=null;P=null;toast('Could not start the match: '+esc(err.message||err));return;}
  const mm=$('#mm'),slots=$('#mmSlots');mm.hidden=false;
  $('#mmKicker').textContent=ranked?'Ranked · '+rankInfo(S.rp).name:'Matchmaking';$('#mmTitle').textContent='Finding players';
  $('#mmMode').textContent=mode.name+' · '+MAPS[M.mapId||mode.map].name;
  const opp=$('#mmOpp');if(M.opp!=null){const o=OPP_TIERS[M.opp];opp.hidden=false;opp.style.setProperty('--oc',o.col);opp.innerHTML='<b>'+o.name+' opponents</b><span>'+o.note+'</span>';}else opp.hidden=true;
  slots.innerHTML='';const order=M.units.slice().sort((a,b)=>a.team-b.team);
  const els=order.map((u,i)=>{const d=document.createElement('div');d.className='mm-slot wait '+(u.team===0?'blue':'red');slots.append(d);return d;});
  let t=150;order.forEach((u,i)=>{t+=i===0?0:order.length>8?rand(90,200):rand(180,420);mmTimers.push(setTimeout(()=>{const d=els[i];d.className='mm-slot in '+(u.team===0?'blue':'red');d.innerHTML='';d.append(thumb(u.b,u.sk,64));if(u.isPlayer&&S.icon){const ic=iconCanvas(S.icon,22);ic.classList.add('mm-ic');d.append(ic);}d.insertAdjacentHTML('beforeend','<small class="mm-nm">'+esc(u.isPlayer?S.name:u.name||'')+'</small>');sfx('pin');},t));});
  mmTimers.push(setTimeout(()=>{$('#mmTitle').textContent='Match found!';sfx('go');},t+200));
  mmTimers.push(setTimeout(()=>{mm.hidden=true;enterGame();},t+900));
}
$('#mmCancel').addEventListener('click',()=>{if(NETW.queue){netSend({t:'cancel'});netQueueUi(null);return;}clearMM();$('#mm').hidden=true;M=null;P=null;});
$('#playBtn').addEventListener('click',()=>startMatchmaking(false));
let lastTrialSkin=null;
function startTrial(id,skin){
  audio();sfx('click');clearMM();closeSheet();lastTrial=id;lastTrialSkin=skin||null;lastRanked=false;
  try{newMatch({mode:'try',trial:id,trialSkin:skin||null});}catch(err){M=null;P=null;toast('Could not start training: '+esc(err.message||err));return;}
  enterGame();
}
function enterGame(){
  for(const k in last)delete last[k];
  ctl.move=ctl.atk=ctl.sup=null;keys.clear();H$.feed.innerHTML='';$('#pinPick').hidden=true;
  $('#pauseOv').hidden=true;$('#endOv').hidden=true;paused=false;
  try{go('game');resize();camera(0,true);syncHud();watchUi();if(!isWatching()&&!(M&&M.trial))recStart();}catch(err){toast('Could not start the match: '+esc(err.message||err));leaveMatch(true);}
}

/* ---------- Match HUD ---------- */
const H$={mates:$('#mates'),sbBlue:$('#sbBlue'),sbRed:$('#sbRed'),snBlue:$('#snBlue'),snRed:$('#snRed'),timer:$('#timer'),zone:$('#zoneMsg'),center:$('#centerMsg'),desk:$('#deskHint'),feed:$('#feed')};
const last={};
function setTxt(k,el,v){if(last[k]!==v){last[k]=v;el.textContent=v;}}
function setHtml(k,el,v){if(last[k]!==v){last[k]=v;el.innerHTML=v;}}
function onKillFeed(src,t){
  if(NETS){if(M&&M.netEv)M.netEv.push(['k',src&&src.id||0,t.id]);return;}
  if(!H$||!H$.feed)return;const el=document.createElement('div');el.className='kf';
  const a=document.createElement('span');a.className=src&&src.team===MYT?'tb':'tr';a.textContent=src?src.name:'Storm';
  const x=document.createElement('span');x.className='x';x.textContent='KO';
  const b=document.createElement('span');b.className=t.team===MYT?'tb':'tr';b.textContent=t.name;
  el.append(a,x,b);H$.feed.prepend(el);while(H$.feed.children.length>4)H$.feed.lastChild.remove();setTimeout(()=>el.remove(),3200);
}
function syncHud(){
  const h=modeHud();
  setTxt('nb',H$.snBlue,h.lt);setTxt('nr',H$.snRed,h.rt);
  const wb=Math.round(clamp(h.l,0,1)*100)+'%',wr=Math.round(clamp(h.r,0,1)*100)+'%';if(last.wb!==wb){last.wb=wb;H$.sbBlue.style.width=wb;}if(last.wr!==wr){last.wr=wr;H$.sbRed.style.width=wr;}
  const tl=Math.max(0,Math.ceil(M.time));setTxt('tm',H$.timer,Math.floor(tl/60)+':'+String(tl%60).padStart(2,'0'));
  setTxt('zn',H$.zone,h.msg||'');
  {let mh='';if(M.mode.sd&&M.mode.size>1&&M.state!=='ended')for(const u of M.units){if(u.team!==MYT||u===P||u.shadow||!u.dead||u.respawn===Infinity)continue;mh+='<span class="mate"><i style="background:'+u.sk.body+'"></i>'+esc(u.name)+' back in <b>'+Math.max(1,Math.ceil(u.respawn))+'s</b></span>';}setHtml('mt',H$.mates,mh);}
  let msg='',cls='center-msg';
  if(M.state==='countdown'){if(M.cd>2.6){msg=esc(M.mode.name)+'<small>'+(M.ranked?'Ranked · ':'')+esc(MAPS[M.mapId||M.mode.map].name)+'</small>';cls+=' mid';}else{msg=M.cd>.7?String(Math.ceil(M.cd-.6)):'Rumble!';cls+=' big';}}
  else if(M.state==='ended'&&!M.shown){msg=M.mode.ffa?(ORD[M.place-1]+' place'):M.result===0?'Victory':M.result===1?'Defeat':'Draw';cls+=' big';}
  else if(P&&P.dead){msg=P.respawn===Infinity?'Knocked out<small>Watch your team finish it</small>':'Back in '+Math.max(1,Math.ceil(P.respawn));cls+=' mid';}
  setHtml('cm',H$.center,msg);if(last.cc!==cls+msg.length){last.cc=cls+msg.length;H$.center.className=cls;}
  const showDesk=!touchUI||mouseMode;if(H$.desk.hidden===showDesk)H$.desk.hidden=!showDesk;
}
function setPaused(v){if(!M||M.state==='ended')v=false;if(v)secretTap('sec_pause',6,12000);paused=v;$('#pauseOv').hidden=!v;$('#pinPick').hidden=true;$('#leaveNote').textContent=M&&M.trial?'Training has no rewards, so leave any time.':M&&M.state==='play'?(M.ranked?'Leaving counts as a loss and costs RP.':'Leaving counts as a loss.'):'You can leave freely before the match starts.';if(v){ctl.move=ctl.atk=ctl.sup=null;keys.clear();}}
function leaveMatch(silent){if(isWatching()){exitWatch();return;}if(M&&!M.trial)recFinish(true);
  if(NETC){if(M&&M.state!=='ended'&&!silent){M.left=true;M.result=1;M.place=6;M.state='ended';M.reward=applyRewards();}netLeave();M=null;P=null;paused=false;$('#endOv').hidden=true;$('#pauseOv').hidden=true;go('home');return;}
  if(M&&M.state==='play'&&!silent&&!M.trial){M.left=true;M.result=1;M.place=6;M.state='ended';M.reward=applyRewards();}
  M=null;P=null;paused=false;$('#endOv').hidden=true;$('#pauseOv').hidden=true;go('home');
}
$('#pauseBtn').addEventListener('click',()=>setPaused(true));
$('#resumeBtn').addEventListener('click',()=>setPaused(false));
$('#leaveBtn').addEventListener('click',()=>leaveMatch(false));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&view==='game'&&M&&M.state!=='ended')setPaused(true);});
function showEnd(){if(M.sim){showSimEnd();return;}if(!M.trial)recFinish();if(!M.trial&&!M.pMoved&&M.now>40)setTimeout(()=>findSecret('sec_afk'),1800);
  $('#rarPick').hidden=true;clearTimeout(rarPickT);
  if(M.trial){const tb=P.b,owned=!!S.owned[tb.id];
    $('#endSheet').innerHTML='<p class="small">Training</p><p class="end-k win">Trial over</p><p class="end-score">'+P.kills+' takedown'+(P.kills===1?'':'s')+'</p><p class="small">'+(owned?'Level '+esc(tb.name)+' up to '+MAX_LVL+' to make them this strong in real matches.':(RARITY[tb.rarity].passOnly?'Like '+esc(tb.name)+'? Get them at tier 30 of the Rumble Pass.':'Like '+esc(tb.name)+'? Unlock them for '+fmtFull(RARITY[tb.rarity].chromos)+' chromos. You have '+fmtFull(S.chromos)+'.'))+'</p><div class="row"><button class="btn primary" id="againBtn">Try again</button><button class="btn" id="homeBtn2">Back</button></div>';
    $('#endOv').hidden=false;
    $('#againBtn').addEventListener('click',()=>{$('#endOv').hidden=true;M=null;P=null;startTrial(lastTrial,lastTrialSkin);});
    $('#homeBtn2').addEventListener('click',()=>{leaveMatch(true);go('rumblers');});return;}
  const r=M.reward,w=M.result,b=P&&P.b?P.b:BY_ID[S.selected],me=S.owned[b.id]||{prestige:0};
  const title=M.mode.ffa||M.mode.sd?(ORD[M.place-1]+' place'):w===0?'Victory':w===1?'Defeat':'Draw',cls=w===0?'win':w===1?'lose':'';
  if(w===0){const[cx,cy]=[cam.x,cam.y];const cols=['#ffc93c','#ff5e87','#46b4ff','#6be39a','#c792ff'];for(let i=0;i<70;i++)addFx({k:'spark',x:cx+rand(-200,200),y:cy-rand(100,300),vx:rand(-120,120),vy:rand(40,260),t:0,T:rand(1,1.8),s:rand(3,5),col:pick(cols)});}
  const li=(icon,txt,val)=>'<li>'+ICON[icon]+'<span>'+txt+'</span><b>'+val+'</b></li>';
  let rows='';
  if(r.masterBonus)rows+='<li class="set-row" style="border-color:#ff7aa8"><span class="star-ico" style="background:#ff7aa8">M</span><span><b style="color:#ff7aa8">Master bonus \u00d7'+r.masterBonus+'</b> \u00b7 the higher your RP, the bigger it gets</span><b></b></li>';
  if(M.ranked){const ri=rankInfo(S.rp);rows+=li('rp',(r.rp>=0?'+':'')+r.rp+' RP'+(S.streak>1&&w===0?' · '+S.streak+' win streak':''),ri.name);}
  else rows+=li('trophies',(r.trophies>0?'+':'')+r.trophies+' trophies',fmtFull(S.trophies));
  if(r.star)rows+='<li class="star-row"><span class="star-ico" aria-hidden="true">★</span><span>Star Player · most takedowns</span><b>+'+STAR_PLAYER_TROPHIES+' trophies</b></li>';
  rows+=li('coins','+'+r.coins+' coins',fmt(S.coins));rows+=li('pp','+'+r.pp+' power points',fmt(S.pp));
  if(r.gems)rows+=li('gems','+'+r.gems+' gems',fmt(S.gems));
  rows+=li('chromos','+'+r.chromos+' chromos · '+P.kills+' takedown'+(P.kills===1?'':'s'),fmt(S.chromos));
  if(r.passXp)rows+=li('pass','+'+r.passXp+' pass tokens'+(r.passUp?' · tier '+r.passUp+' reached!':''),'Tier '+passTier(S.pass.xp));
  if(r.passWinTier)rows+=li('pass',PASS_WIN_EVERY+' wins! +1 free Rumble Pass tier','Tier '+passTier(S.pass.xp));else if(w===0&&r.passXp)rows+=li('pass','Free tier progress · '+(S.pass.wins%PASS_WIN_EVERY)+' / '+PASS_WIN_EVERY+' wins','');
  if(r.drop&&r.drop!=='any')rows+='<li class="lucky-row" style="--r:'+RARITY[r.drop].col+'"><span class="drop-ico" data-r="'+r.drop+'"></span><span><b>Lucky drop!</b> Guaranteed '+dropName(r.drop)+' · '+S.dropDay.n+' of '+WIN_DROPS_PER_DAY+' today</span><b>'+S.drops.length+' ready</b></li>';
  else if(r.drop)rows+='<li><span class="drop-ico" data-r="rare"></span><span>Rare Rumble Drop (taps can upgrade it) · '+S.dropDay.n+' of '+WIN_DROPS_PER_DAY+' from wins today</span><b>'+S.drops.length+' ready</b></li>';
  if(r.dropCap)rows+=li('drop','No drop: you\u2019ve had all '+WIN_DROPS_PER_DAY+' win drops today','');
  if(r.prestige)rows+='<li><span class="badge" style="background:#ffc93c;border-radius:6px;padding:0 4px;color:#2b1a00;font-weight:900">★</span><span>'+b.name+' prestige +1</span><b>'+me.prestige+'</b></li>';
  for(const rw of r.road)rows+='<li>'+ICON.trophies+'<span>Trophy road: '+roadLabel(rw)+'</span><b></b></li>';
  if(r.rank!=null){const bb=r.rankBundle;rows+='<li>'+emblem(r.rank,24)+'<span>Reached '+rankInfo(r.rank*100).name+'!</span><b></b></li>';
    if(bb)rows+='<li>'+ICON.rp+'<span>Rank rewards: +'+fmtFull(bb.chromos)+' chromos, +'+bb.gems+' gems, +'+fmtFull(bb.coins)+' coins, +'+fmtFull(bb.pp)+' power points, '+bb.drops+' Rumble Drop'+(bb.drops===1?'':'s')+'</span><b></b></li>';
    if(r.master)rows+='<li>'+ICON.rp+'<span><b style="color:#ffd23f">MASTER!</b> the Grandmaster skin and the Master pin are yours</span><b></b></li>';
    if(r.rankWaiting)rows+='<li>'+ICON.rp+'<span>New rank rewards are waiting. <b>Claim them at the bottom of Ranked</b></span><b></b></li>';}
  if(r.prestigeReward){const pr=r.prestigeReward,tn=prestigeTier(pr.m);rows+='<li class="set-row" style="border-color:'+tn.col+'"'+(pr.pin?' data-pin="pr:'+pr.id+':'+pr.pin+'"':'')+'>'+(pr.pin?'<span class="set-pin"></span>':DI(pr.drops[0].r,30))+'<span><b style="color:'+tn.col+'">Prestige '+pr.m+'!</b> '+(pr.skin?esc(getSkin(b,pr.skin).name+' '+b.name)+' skin + pin, ':'')+'+'+fmtFull(pr.coins)+' coins, +'+fmtFull(pr.pp)+' PP, '+pr.drops.map(d=>d.n+' '+dropName(d.r)+(d.n>1?'s':'')).join(', ')+'</span><b></b></li>';}
  if(r.rankSets)for(const k of r.rankSets){const rs=RANK_SETS[k];rows+='<li class="set-row" data-pin="'+rs.pin+'"><span class="set-pin"></span><span>New rank set! '+esc(rs.skin.name)+' '+esc(BY_ID[rankSetRumbler(k,rankSeed(S))].name)+' skin + \u201cI reached '+rs.name+'\u201d pin</span><b></b></li>';}
  const sheet=$('#endSheet');
  const score=M.mode.sd?'<p class="end-score">'+P.kills+' knockout'+(P.kills===1?'':'s')+' · '+P.cubes+' cube'+(P.cubes===1?'':'s')+'</p>'+(w===0&&M.place>1?'<p class="end-top3">Top '+SD_WIN_PLACES+' finish · counts as a win</p>':''):M.mode.ffa?'<p class="end-score">You scored '+M.score[0]+'</p>':M.mode.id==='core'?'':'<p class="end-score"><span class="t-blue">'+M.score[0]+'</span> – <span class="t-red">'+M.score[1]+'</span></p>';
  const starLine=M.star?(M.star===P?'<p class="end-star me">★ You’re the Star Player!</p>':'<p class="end-star">★ Star Player: '+esc(M.star.name)+' · '+M.star.kills+' takedown'+(M.star.kills===1?'':'s')+'</p>'):'';
  sheet.innerHTML='<p class="small">'+esc(M.mode.name)+(M.ranked?' · Ranked':'')+'</p><p class="end-k '+cls+'">'+title+'</p>'+score+starLine+'<ul class="rewards">'+rows+'</ul><div class="row"><button class="btn primary" id="againBtn">Play again</button><button class="btn" id="homeBtn2">Home</button></div>';
  sheet.querySelectorAll('.drop-ico').forEach(el=>el.append(dropCanvas(el.dataset.r,30)));
  sheet.querySelectorAll('.set-row').forEach(li=>li.querySelector('.set-pin').append(pinCanvas('b:'+li.dataset.pin,30)));
  $('#endOv').hidden=false;
  $('#againBtn').addEventListener('click',()=>{$('#endOv').hidden=true;M=null;P=null;go('home');startMatchmaking(lastRanked);});
  $('#homeBtn2').addEventListener('click',()=>leaveMatch(true));
}

function untilMidnight(){const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const ms=m-n;return Math.floor(ms/3600000)+'h '+Math.floor(ms%3600000/60000)+'m';}
/* ---------- Rumble Pass ---------- */
function passClaimable(){let n=0;const t=passTier(S.pass.xp);for(let i=0;i<t;i++){if(!S.pass.cf.includes(i))n++;if(S.pass.premium&&!S.pass.cp.includes(i))n++;if(hasSuper()&&!S.pass.cs.includes(i))n++;}return n+Math.max(0,bonusAvail(S.pass.xp)-S.pass.bonus);}
function passBadge(n,size){return '<svg viewBox="0 0 48 48" width="'+size+'" height="'+size+'" aria-hidden="true"><path d="'+starPath(24,24,23,18,10)+'" fill="#ffc93c" stroke="#120f26" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="24" r="13.5" fill="#1d1b52" stroke="#120f26" stroke-width="2.5"/><text x="24" y="29.5" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="'+(n>9?13:15)+'" fill="#ffd36b">'+n+'</text></svg>';}

const rwKey=rw=>Object.keys(rw)[0];
function rewardLabel(rw){const k=rwKey(rw),v=rw[k];if(k==='mythic')return S.pass.superPick&&BY_ID[S.pass.superPick]?BY_ID[S.pass.superPick].name+' · your Mythic':'Mythic of your choice';
  if(k==='drop')return (rw.n>1?rw.n+' ':'')+dropName(v)+(rw.n>1?'s':'');if(k==='rumbler')return BY_ID[v].name+' · new rumbler';if(k==='skin')return 'Starfall '+BY_ID[v].name;if(k==='pin')return pinName(v)+' pin';return '+'+fmtFull(v)+' '+CUR_NAME[k];}
function rewardVisual(rw,size){const k=rwKey(rw),v=rw[k];if(k==='mythic')return superMythicVisual(size);
  if(k==='drop')return dropCanvas(v,size);if(k==='rumbler'){const b=BY_ID[v];return thumb(b,getSkin(b,'classic'),size);}if(k==='skin'){const b=BY_ID[v];return thumb(b,getSkin(b,'starfall'),size);}if(k==='pin')return pinCanvas('b:'+v,size);
  const sp=document.createElement('span');sp.className='rv-ico';sp.innerHTML=ICON[k];return sp;}
function giveReward(rw){const k=rwKey(rw),v=rw[k];if(k==='rumbler'){if(!grantRumbler(v))S.chromos+=5000;}else if(k==='drop'){for(let n=0;n<(rw.n||1);n++)S.drops.push({r:v,min:null});}else if(k==='skin')grantSkin(v,'starfall');else if(k==='pin'){if(!S.pins.includes(v))S.pins.push(v);}else if(k==='mythic'){}else S[k]+=v;}
function claimPass(i,prem,quiet){
  const list=prem?S.pass.cp:S.pass.cf;if(i>=passTier(S.pass.xp)||list.includes(i)||(prem&&!S.pass.premium))return false;
  const rw=(prem?PASS_PREM:PASS_FREE)[i];giveReward(rw);list.push(i);
  if(!quiet){persist();sfx('unlock');toast(rewardLabel(rw)+(rwKey(rw)==='drop'?' · open from the home screen':rwKey(rw)==='skin'?' · equip it from the rumbler sheet':rwKey(rw)==='rumbler'?' · find them on the Rumblers tab':''),'pass');renderPass();updateShopDot();}
  return true;}
function claimAll(){let n=0;for(let i=0;i<PASS_TIERS;i++){if(claimPass(i,false,true))n++;if(claimPass(i,true,true))n++;if(claimSuper(i,true))n++;}
  const b=Math.max(0,bonusAvail(S.pass.xp)-S.pass.bonus);for(let k=0;k<b;k++)S.drops.push({r:null,min:null});S.pass.bonus+=b;n+=b;
  persist();if(n){sfx('unlock');toast(n+' reward'+(n>1?'s':'')+' claimed','pass');}renderPass();updateShopDot();if(superGrantChromosIfDone()){toast('+'+fmtFull(SUPER_CHROMOS)+' chromos · you have every Mythic','chromos');renderPass();}else if(superPickPending())openSuperPick();}
function renderPass(scroll){
  const xp=S.pass.xp,tier=passTier(xp),done=tier>=PASS_TIERS,need=done?PASS_BONUS_STEP:PASS_STEP,into=done?(xp-PASS_TIERS*PASS_STEP)%PASS_BONUS_STEP:xp%PASS_STEP,ready=passClaimable(),zb=BY_ID.zenith;
  $('#passTokens').innerHTML=ICON.pass+'<span>'+fmtFull(xp)+' tokens</span>';
  {const h=$('#passH1');if(h)h.innerHTML='<span class="rpe-hw">'+passEmblem(40)+(hasSuper()?'<em class="sup-chip">SUPER</em>':'')+'</span><span>Rumble Pass</span>';}superTab();
  const body=$('#passBody');body.innerHTML='';
  const hero=document.createElement('div');hero.className='pass-hero';
  hero.innerHTML='<div class="ph-top"><span class="ph-season">Season 1</span><h2>Starfall</h2><p class="hint">Every match earns pass tokens: 40 for a win, 25 for a draw, 15 for a loss, plus 5 per takedown.</p></div><div class="ph-art"></div>'+
    '<div class="ph-prog"><span class="ph-badge"><small>TIER</small><b>'+tier+'</b></span><span class="ph-barwrap"><span class="ph-bar"><i style="width:'+Math.round(into/need*100)+'%"></i></span><span class="ph-sub">'+(done?'Pass complete! '+into+' / '+need+' tokens to the next bonus drop':into+' / '+need+' tokens to tier '+(tier+1))+'</span></span></div><div class="ph-wins"><span>Every '+PASS_WIN_EVERY+' wins = 1 free tier</span><span class="pips" aria-label="'+(S.pass.wins%PASS_WIN_EVERY)+' of '+PASS_WIN_EVERY+' wins">'+Array.from({length:PASS_WIN_EVERY},(_,k)=>'<i'+(k<S.pass.wins%PASS_WIN_EVERY?' class="on"':'')+'></i>').join('')+'</span></div><div class="ph-btns"></div>';
  const art=hero.querySelector('.ph-art');const ob=BY_ID.orion;art.append(thumb(ob,getSkin(ob,'classic'),96));art.insertAdjacentHTML('beforeend','<small>Tier '+PASS_TIERS+' · Orion</small>');
  const btns=hero.querySelector('.ph-btns');
  if(!S.pass.premium){const b=document.createElement('button');b.className='btn gold';b.innerHTML='<span class="rpe-btn">'+passEmblem(26)+'</span>Unlock Rumble Pass · '+cost('gems',PASS_GEMS);
    b.addEventListener('click',()=>confirmBuy('Rumble Pass · Season 1',passEmblemEl(110,{cls:'rpe-buy'}),[['gems',PASS_GEMS]],()=>{S.pass.premium=true;persist();sfx('unlock');toast('Rumble Pass unlocked! Claim your rewards.','rpass');renderPass();updateShopDot();}));btns.append(b);}
  else if(hasSuper()){btns.insertAdjacentHTML('beforeend','<span class="tag on rpe-tag sup-tag" style="align-self:center;padding:6px 10px">'+passEmblem(22)+'Rumble Pass SUPER</span>');
    if(superPickPending()){const b=document.createElement('button');b.className='btn gold sup-pick-btn';b.textContent='Choose your free Mythic';b.addEventListener('click',openSuperPick);btns.append(b);}}
  else btns.insertAdjacentHTML('beforeend','<span class="tag on rpe-tag" style="align-self:center;padding:6px 10px">'+passEmblem(22)+'Rumble Pass unlocked</span>');
  if(ready){const b=document.createElement('button');b.className='btn green';b.textContent='Claim all ('+ready+')';b.addEventListener('click',claimAll);btns.append(b);}
  body.append(hero);
  if(!hasSuper())body.append(superCard());
  body.insertAdjacentHTML('beforeend','<div class="track-head"><span>Free</span><span></span><span class="rpe-th">'+passEmblem(20)+'Rumble Pass<small class="th-sup">+ SUPER below</small></span></div>');
  const tr=document.createElement('div');tr.className='ptrack';
  for(let i=0;i<PASS_TIERS;i++){
    const row=document.createElement('div');row.className='prow'+(i<tier?' reached':'')+(i===tier?' cur':'');row.dataset.t=i;
    const cell=prem=>{const rw=(prem?PASS_PREM:PASS_FREE)[i],got=(prem?S.pass.cp:S.pass.cf).includes(i),plock=prem&&!S.pass.premium,lock=i>=tier,ok=!got&&!lock&&!plock;
      const b=document.createElement('button');b.className='pcell'+(prem?' prem':'')+(i===PASS_TIERS-1?' final':'')+(got?' got':ok?' ready':' lock');
      {const k=rwKey(rw),v=rw[k],rc=k==='drop'?RARITY[v].col:k==='rumbler'?RARITY[BY_ID[v].rarity].col:k==='skin'?'#ffd36b':k==='pin'?'#5ec8ff':{coins:'#ffc93c',gems:'#6be39a',pp:'#c79bff',chromos:'#46b4ff'}[k]||'#9d7bff';b.style.setProperty('--rc',rc);if(k==='drop'&&v==='ultra')b.classList.add('rc-rainbow');if(k==='drop'&&v==='season')b.classList.add('rc-galaxy');}
      b.append(rewardVisual(rw,48));b.insertAdjacentHTML('beforeend','<span class="pl">'+esc(rewardLabel(rw))+'</span>'+(got?'<span class="chk">✓</span>':ok?'<span class="ctag">Claim</span>':plock?LOCK_SVG.replace('class="lock"','class="plk"'):''));
      b.setAttribute('aria-label','Tier '+(i+1)+(prem?' Rumble Pass':' free')+' reward: '+rewardLabel(rw)+(got?', claimed':ok?', ready to claim':', locked'));
      b.addEventListener('click',()=>{if(ok)claimPass(i,prem);else if(got)return;else if(lock)toast('Reach tier '+(i+1)+' to claim this','pass');else toast('Unlock the Rumble Pass to claim this','pass');});
      return b;};
    row.append(cell(false));row.insertAdjacentHTML('beforeend','<span class="tnum">'+(i+1)+'</span>');{const st=document.createElement('div');st.className='pstack';st.append(cell(true),superCell(i,tier));row.append(st);}tr.append(row);}
  body.append(tr);
  const bonus=document.createElement('div');bonus.className='panel';bonus.style.cssText='flex-direction:row;align-items:center;gap:12px';
  bonus.append(dropCanvas('rare',52));bonus.insertAdjacentHTML('beforeend','<div style="min-width:0"><h2>Bonus drops</h2><p class="hint" style="margin:0">After tier '+PASS_TIERS+', every '+PASS_BONUS_STEP+' tokens earns another Rumble Drop. Claimed so far: '+S.pass.bonus+'.</p></div>');
  body.append(bonus);
  if(scroll)requestAnimationFrame(()=>{const sc=$('#pass'),r=tr.querySelector('[data-t="'+Math.max(0,Math.min(PASS_TIERS-1,tier-1))+'"]');if(sc&&r&&r.getBoundingClientRect)sc.scrollTop+=r.getBoundingClientRect().top-sc.getBoundingClientRect().top-sc.clientHeight*.35;});
}

/* ---------- Rumble Drops ---------- */
const dropOv=$('#dropOv'),dropCv=$('#dropCv'),dctx=dropCv.getContext('2d');
let DA=null,DW=1,DH=1,Dd=1;
function sizeDrop(){const r=dropOv.getBoundingClientRect();DW=Math.max(1,r.width);DH=Math.max(1,r.height);Dd=Math.min(2,window.devicePixelRatio||1);dropCv.width=Math.round(DW*Dd);dropCv.height=Math.round(DH*Dd);}
function openDrops(){if(!S.drops.length){toast('No Rumble Drops yet. Win matches to earn them.','drop');return;}audio();closeSheet();dropOv.hidden=false;sizeDrop();nextDrop();}
function closeDrops(){dropOv.hidden=true;DA=null;if(view==='home')renderHome();else if(view==='pass')renderPass();else if(view==='rumblers')renderRumblers();updateShopDot();}
function setDropUi(kicker,title,col){$('#dropKicker').textContent=kicker;const t=$('#dropTitle');t.textContent=title;t.style.color=col||'';t.classList.toggle('rainbow-text',col===RARITY.ultra.col);t.classList.toggle('galaxy-text',col===RARITY.season.col);}
function remainingDrops(){return S.drops.length+(DA&&DA.res&&DA.phase!=='shown'?1:0);}
function dropBtns(){const p=DA&&DA.phase,nx=$('#dropNext');nx.disabled=!(p==='idle'||p==='shown')||(p==='idle'&&DA.lock>0);nx.textContent=p==='shown'?(DA.res&&DA.res.kind==='box'&&DA.res.idx<DA.res.items.length-1?'Next reward':S.drops.length?'Next drop':'Done'):'Tap';$('#dropAll').hidden=!(remainingDrops()>1&&(p==='idle'||p==='shown'));}
function nextDrop(){
  if(DA&&DA.phase==='shown'&&DA.res&&DA.res.kind==='box'&&DA.res.idx<DA.res.items.length-1){DA.res.idx++;burstParts(DA.col,30,360,DW/2,DA.py);sfx('pin');revealDrop();dropBtns();return;}
  if(!S.drops.length){closeDrops();return;}
  const d=S.drops[0],st=d.r||d.min||'rare',ci=Math.max(0,DROP_RAR.indexOf(st));
  DA={phase:'fall',t:0,py:DH*.4,col:RARITY[st].col,cur:ci,res:null,parts:[],open:0,shake:0,rays:0,lock:0,ups:0,season:isSpecialDrop(st),r:st};
  const el=$('#dropReward');el.hidden=true;el.innerHTML='';
  {let q=$('#dropQueue');if(!q){q=document.createElement('div');q.id='dropQueue';q.className='dropqueue';$('.drop-head').append(q);}q.innerHTML='';S.drops.slice(0,10).forEach((x,k)=>{const r2=isSpecialDrop(x.r)?x.r:(x.r||x.min||'rare');const cv=dropCanvas(r2,k?28:38);if(!k)cv.classList.add('cur');q.append(cv);});if(S.drops.length>10)q.insertAdjacentHTML('beforeend','<small>+'+(S.drops.length-10)+'</small>');}
  setDropUi(d.g?'Lucky win drop · guaranteed '+RARITY[st].name+'!':S.drops.length+' to open',dropName(st),RARITY[st].col);dropBtns();
}
function burstParts(col,n,sp,x,y){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(sp*.3,sp);DA.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,T:rand(.5,1.1),s:rand(3,7),col});}if(DA.parts.length>400)DA.parts.splice(0,DA.parts.length-400);}
/* Each tap either upgrades the drop one rarity step or, when it can't, opens it */
function dropTap(){
  if(!DA)return;
  if(DA.phase==='shown'){nextDrop();return;}
  if(DA.phase!=='idle'||DA.lock>0)return;
  if(!DA.res)DA.res=openDrop(S.drops.shift());
  const tgt=DROP_RAR.indexOf(DA.res.rar);
  if(DA.cur<tgt){DA.cur++;DA.ups++;const r=DROP_RAR[DA.cur],col=RARITY[r].col;DA.col=col;DA.shake=1.3;DA.lock=.4;
    burstParts(col,26,340,DW/2,DA.py);burstParts('#ffffff',10,240,DW/2,DA.py);tone('triangle',440+DA.cur*160,720+DA.cur*210,.2,.08);tone('sine',880+DA.cur*200,880+DA.cur*200,.12,.04,.08);
    setDropUi('Upgraded! Tap again',dropName(r),col);}
  else{DA.phase='burst';DA.t=0;burstParts(DA.col,46,440,DW/2,DA.py);burstParts('#ffffff',18,320,DW/2,DA.py);sfx('boom');}
  dropBtns();
}
function revealDrop(){
  if(DA.res&&DA.res.kind==='box'){const bx=DA.res,it=bx.items[bx.idx],el=$('#dropReward');el.innerHTML='';renderDropItem(el,it);
    const tot={coins:0,pp:0,gems:0,chromos:0};let rum=0,sk=0;for(let i=0;i<=bx.idx;i++){const x=bx.items[i];if(x.kind==='rumbler')rum++;else if(x.kind==='skin')sk++;else if(tot[x.kind]!=null)tot[x.kind]+=x.n;}
    let h='<div class="box-count"><small>Reward '+(bx.idx+1)+' of '+bx.items.length+'</small><div>';for(const k in tot)h+='<span class="bc'+(tot[k]?' on':'')+'">'+ICON[k]+fmtFull(tot[k])+'</span>';
    if(bx.rar==='rbox')h+='<span class="bc'+(rum?' on':'')+'">'+ICON.chromos+rum+' rumbler</span>';else h+='<span class="bc'+(sk?' on':'')+'">'+ICON.gems+sk+' / 3 skins</span>';
    el.insertAdjacentHTML('beforeend',h+'</div></div>');el.hidden=false;
    setDropUi(dropName(bx.rar)+(bx.idx<bx.items.length-1?' \u00b7 tap for more':' \u00b7 all done'),it.kind==='rumbler'?'New rumbler!':it.kind==='skin'?'New skin!':'Nice!',RARITY[bx.rar].col);return;}
  const res=DA.res,el=$('#dropReward');el.innerHTML='';renderDropItem(el,res);
  el.hidden=false;setDropUi(dropName(res.rar),res.kind==='rumbler'?'Jackpot!':res.kind==='skin'?'Fresh look!':res.kind==='pin'?'New pin!':'Nice!',RARITY[res.rar].col);}
function renderDropItem(el,res){
  if(res.kind==='icon'){el.insertAdjacentHTML('beforeend','<p class="drop-new">New profile icon!</p>');el.append(iconCanvas('x:'+res.icon,120));el.insertAdjacentHTML('beforeend','<p>Pick it from your profile (tap your icon next to your name).</p>');sfx('unlock');return;}
  if(res.kind==='rumbler'){const b=BY_ID[res.id],r=RARITY[b.rarity];el.insertAdjacentHTML('beforeend','<p class="drop-new">New rumbler!</p>');el.append(thumb(b,getSkin(b,'classic'),140));
    el.insertAdjacentHTML('beforeend','<span class="rpill'+rpc(b.rarity)+'" style="--r:'+r.col+'">'+r.name+'</span><span class="big">'+esc(b.name)+'</span><p>'+esc(b.role)+'. Find them on the Rumblers tab.</p>');}
  else if(res.kind==='skin'){const b=BY_ID[res.id],sk=getSkin(b,res.skid);el.insertAdjacentHTML('beforeend','<p class="drop-new">New skin!</p>');el.append(thumb(b,sk,130));
    el.insertAdjacentHTML('beforeend','<span class="big" style="font-size:28px">'+esc(sk.name)+'</span><p>For '+esc(b.name)+'. Equip it from the rumbler sheet.</p>');}
  else if(res.kind==='pin'){el.insertAdjacentHTML('beforeend','<p class="drop-new">New pin!</p>');el.append(pinCanvas('b:'+res.pin,120));el.insertAdjacentHTML('beforeend','<span class="big" style="font-size:28px">'+esc(pinName(res.pin))+'</span><p>Add it to a rumbler\u2019s pin slots.</p>');}
  else if(res.kind==='pass')el.insertAdjacentHTML('beforeend','<span class="rv-ico">'+ICON.pass+'</span><span class="big">+'+fmtFull(res.n)+'</span><p>Rumble Pass tokens</p>');
  else el.insertAdjacentHTML('beforeend','<span class="rv-ico">'+ICON[res.kind]+'</span><span class="big">+'+fmtFull(res.n)+'</span><p>'+CUR_NAME[res.kind]+(res.note?'. '+esc(res.note)+'.':'')+'</p>');
  sfx(res.kind==='rumbler'||res.kind==='skin'||res.kind==='pin'?'unlock':'buy');
}
function openAll(){
  if(!DA||!(DA.phase==='idle'||DA.phase==='shown'))return;
  const tot={coins:0,pp:0,chromos:0,gems:0,pass:0},items=[];let best=0,n=0,sea=false;
  while(S.drops.length){const res=openDrop(S.drops.shift());n++;if(isSpecialDrop(res.rar))sea=res.rar;else best=Math.max(best,DROP_RAR.indexOf(res.rar));for(const it of res.kind==='box'?res.items:[res]){if(it.kind==='rumbler'||it.kind==='skin'||it.kind==='pin')items.push(it);else tot[it.kind]=(tot[it.kind]||0)+it.n;}}
  DA.phase='shown';DA.t=0;DA.open=1;DA.col=sea?RARITY[sea].col:RARITY[DROP_RAR[best]].col;burstParts(DA.col,50,420,DW/2,DA.py);burstParts('#ffffff',20,300,DW/2,DA.py);
  let h='<ul class="drop-sum">';for(const k of['coins','pp','chromos','gems','pass'])if(tot[k])h+='<li>'+ICON[k]+'<span>+'+fmtFull(tot[k])+' '+(k==='pass'?'pass tokens':CUR_NAME[k])+'</span></li>';
  for(const it of items){if(it.kind==='pin'){h+='<li>'+ICON.gems+'<span>New pin: '+esc(pinName(it.pin))+'</span></li>';continue;}const b=BY_ID[it.id];h+='<li>'+(it.kind==='rumbler'?ICON.chromos:ICON.gems)+'<span>'+(it.kind==='rumbler'?'New rumbler: <b>'+esc(b.name)+'</b>':'New skin: '+esc(getSkin(b,it.skid).name)+' '+esc(b.name))+'</span></li>';}
  h+='</ul>';const el=$('#dropReward');el.innerHTML=h;el.hidden=false;
  setDropUi(n+' drops opened',items.some(i=>i.kind==='rumbler')?'Jackpot!':'What a haul!',DA.col);sfx(items.length?'unlock':'buy');dropBtns();
}
function showOdds(){openSheet(card=>{
  const lootName=e=>e[0]==='rumbler'?'A new '+e[2].map(x=>RARITY[x].name).join(' or ')+' rumbler':e[0]==='skin'?'A skin for a rumbler you own':fmtFull(e[2][0])+'–'+fmtFull(e[2][1])+' '+CUR_NAME[e[0]];
  let h='<h2>Rumble Drop odds</h2><p class="sub">Most drops from wins start at Rare, but some are lucky drops with a guaranteed rarity. Pass drops start at their guaranteed rarity. Every tap has a chance to upgrade the drop one step, all the way to Amazing. You can earn '+WIN_DROPS_PER_DAY+' drops from wins each day.</p><div class="sec-title"><h2>Upgrade chance per tap</h2></div><table class="odds">';
  for(let i=0;i<DROP_UP.length;i++)h+='<tr><td>'+RARITY[DROP_RAR[i]].name+' → '+RARITY[DROP_RAR[i+1]].name+'</td><td>'+(Math.round(DROP_UP[i]*1000)/10)+'%</td></tr>';
  h+='</table><div class="sec-title"><h2>Lucky win drops</h2></div><table class="odds">';for(const[r,pc]of WIN_DROP_LUCKY)h+='<tr><td>Guaranteed <span class="rpill'+rpc(r)+'" style="--r:'+RARITY[r].col+'">'+RARITY[r].name+'</span></td><td>'+pc+'%</td></tr>';
  h+='<tr><td>Normal drop (starts at Rare)</td><td>'+(Math.round((100-WIN_DROP_LUCKY.reduce((n,e)=>n+e[1],0))*10)/10)+'%</td></tr>';
  h+='</table><div class="sec-title"><h2>Final rarity of a drop that starts at Rare</h2></div><table class="odds">';
  DROP_RAR.forEach((r,i)=>{h+='<tr><td><span class="rpill'+rpc(r)+'" style="--r:'+RARITY[r].col+'">'+RARITY[r].name+'</span></td><td>'+DROP_ODDS[i]+'%</td></tr>';});h+='</table>';
  for(const r of DROP_RAR){const L=DROP_LOOT[r],tot=L.reduce((n,e)=>n+e[1],0);h+='<div class="sec-title"><h2>'+RARITY[r].name+' Drop</h2></div><table class="odds">';for(const e of L)h+='<tr><td>'+lootName(e)+'</td><td>'+(Math.round(e[1]/tot*1000)/10)+'%</td></tr>';h+='</table>';}
  {const tot=SEASON_LOOT.reduce((n,e)=>n+e[1],0),nm={skin:'A Starfall skin',pin:'A Starfall pin',pass:'Rumble Pass tokens'};h+='<div class="sec-title"><h2 class="galaxy-text">Starfall Drop</h2><span>Seasonal · better than Amazing · no rumblers</span></div><table class="odds">';
   for(const e of SEASON_LOOT)h+='<tr><td>'+(nm[e[0]]||CUR_NAME[e[0]])+(e[2]?' ('+fmtFull(e[2][0])+'\u2013'+fmtFull(e[2][1])+')':'')+'</td><td>'+(Math.round(e[1]/tot*1000)/10)+'%</td></tr>';h+='</table>';}
  h+='<p class="hint">If you already own every rumbler a drop could give, you get chromos instead.</p>';
  card.insertAdjacentHTML('beforeend',h);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}
function drawDropScene(dt){
  if(!DA||dropOv.hidden)return;
  const c=dctx;DA.t+=dt;c.setTransform(Dd,0,0,Dd,0,0);
  const cx=DW/2,R=Math.min(DW*.17,DH*.11),T=DA.t,now=performance.now()/1000;
  const target=DH*(DA.phase==='shown'?.27:.4);if(DA.phase!=='fall')DA.py+=(target-DA.py)*Math.min(1,dt*6);
  const bg=c.createRadialGradient(cx,DA.py,10,cx,DA.py,Math.max(DW,DH)*.8);bg.addColorStop(0,'#2c2672');bg.addColorStop(1,'#0b0820');c.fillStyle=bg;c.fillRect(0,0,DW,DH);
  c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<40;i++){const x=(i*97.3)%DW,y=(i*61.7)%DH,k=.5+.5*Math.sin(now*2+i);c.globalAlpha=.25+.5*k;c.fillRect(x,y,1.6,1.6);}c.globalAlpha=1;
  if(DA.ups>0||DA.phase==='burst'||DA.phase==='shown')DA.rays=Math.min(1,DA.rays+dt*2);
  if(DA.lock>0){DA.lock=Math.max(0,DA.lock-dt);if(DA.lock===0)dropBtns();}
  if(DA.rays>0){const L=Math.max(DW,DH);c.save();c.translate(cx,DA.py);c.rotate(now*.25);c.globalCompositeOperation='lighter';c.globalAlpha=.14*DA.rays;c.fillStyle=DA.col;for(let i=0;i<12;i++){c.rotate(TAU/12);c.beginPath();c.moveTo(0,0);c.lineTo(-L*.08,-L);c.lineTo(L*.08,-L);c.closePath();c.fill();}c.restore();}
  if(DA.phase==='fall'){const k=Math.min(1,T/.55);DA.py=-R*2+(DH*.4+R*2)*k*k;if(k>=1){DA.phase='idle';DA.t=0;DA.shake=1;burstParts('#ffffff',16,300,cx,DA.py+R);sfx('thud');
      if(DA.season)setDropUi(RARITY[DA.r]&&RARITY[DA.r].box?'Tap to open the box':SPOOKY.includes(DA.r)?'Halloween drop \u00b7 tap to open':'Seasonal drop \u00b7 tap to open',dropName(DA.r),DA.col);else setDropUi('Tap! It might upgrade',dropName(DROP_RAR[DA.cur]),DA.col);dropBtns();}}
  else if(DA.phase==='burst'){DA.open=Math.min(1,T/.35);if(T>=.5){DA.phase='shown';DA.t=0;revealDrop();dropBtns();}}
  DA.shake=Math.max(0,DA.shake-dt*4);
  const bob=DA.phase==='idle'?Math.sin(T*3)*6:0,shx=DA.shake?rand(-7,7)*DA.shake:0;
  c.save();if(DA.phase==='shown')c.globalAlpha=Math.max(.35,1-T*1.2);drawDropPod(c,cx+shx,DA.py+bob,R*(1+DA.cur*.07),DA.col,now,DA.open);c.restore();
  if(DA.phase==='burst'){c.save();c.globalCompositeOperation='lighter';glow(c,cx,DA.py,R*7*Math.min(1,T*3),'#ffffff',Math.max(0,1-T*2));c.restore();}
  if(DA.phase==='shown'&&Math.random()<dt*24)DA.parts.push({x:rand(0,DW),y:-10,vx:rand(-20,20),vy:rand(80,200),t:0,T:2.4,s:rand(2,4),col:DA.col});
  c.save();c.globalCompositeOperation='lighter';
  for(let i=DA.parts.length-1;i>=0;i--){const p=DA.parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=140*dt;p.vx*=1-dt*1.5;if(p.t>=p.T){DA.parts.splice(i,1);continue;}glow(c,p.x,p.y,p.s*3,p.col,1-p.t/p.T);}
  c.restore();
}
const dropAdvance=dropTap;
dropCv.addEventListener('click',dropAdvance);
$('#dropNext').addEventListener('click',dropAdvance);
$('#dropAll').addEventListener('click',openAll);
$('#dropClose').addEventListener('click',closeDrops);
$('#dropOdds').addEventListener('click',showOdds);

/* ---------- Welcome & tutorial ---------- */
const SVG_MOVE='<svg viewBox="0 0 220 120" width="220" height="120" aria-hidden="true"><rect x="4" y="4" width="212" height="112" rx="18" fill="#1d1846" stroke="#120f26" stroke-width="4"/><circle cx="56" cy="76" r="27" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.6)" stroke-width="3"/><circle cx="66" cy="68" r="12" fill="#fff"/><path d="M56 76l12-10" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-dasharray="3 4"/><circle cx="164" cy="76" r="27" fill="rgba(255,201,60,.2)" stroke="#ffc93c" stroke-width="3"/><circle cx="164" cy="76" r="13" fill="#ffc93c" stroke="#120f26" stroke-width="3"/><text x="56" y="32" text-anchor="middle" fill="#d6d0ff" font-family="Rubik,sans-serif" font-size="12" font-weight="800" letter-spacing="1">MOVE</text><text x="164" y="32" text-anchor="middle" fill="#ffd36b" font-family="Rubik,sans-serif" font-size="12" font-weight="800" letter-spacing="1">ATTACK</text></svg>';
const SVG_SUPER='<svg viewBox="0 0 140 140" width="130" height="130" aria-hidden="true"><circle cx="70" cy="70" r="62" fill="rgba(255,201,60,.16)"/><circle cx="70" cy="70" r="54" fill="none" stroke="#ffc93c" stroke-width="6" stroke-dasharray="10 8"/><circle cx="70" cy="70" r="44" fill="#ffc93c" stroke="#120f26" stroke-width="5"/><path d="M70 42l8 17 18 2-13 13 4 18-17-9-17 9 4-18-13-13 18-2z" fill="#120f26"/></svg>';
const ONB=[
  {t:'Hello, welcome to Rooftop Rumble!',d:'A 3v3 brawler fought across the city rooftops. Here’s a quick tour before your first match.',art:()=>{const w=document.createElement('div');w.append(thumb(BY_ID.ember,getSkin(BY_ID.ember,'classic'),150));return w;}},
  {t:'Move and attack',d:'Drag on the left side of the screen to move. Tap the yellow stick to auto-aim at the closest enemy, or drag it to aim yourself. On a computer, use WASD and click.',art:()=>{const w=document.createElement('div');w.innerHTML=SVG_MOVE;return w;}},
  {t:'Charge your super',d:'Hitting enemies fills your super. When the star button glows, tap it or drag it to aim. Gadgets get their own green button once you unlock them.',art:()=>{const w=document.createElement('div');w.innerHTML=SVG_SUPER;return w;}},
  {t:'Pick a mode',d:'Choose a mode on the home screen, like Showdown, Ring Rumble or Battery Run. Showdown comes in solo, duo and trio. Ranked unlocks once you own 3 rumblers.',art:()=>{const w=document.createElement('div');w.className='onb-art';for(const id of['ring','battery','showdown'])w.insertAdjacentHTML('beforeend','<span class="mico" style="--mc:'+MODE_BY[id].col+'">'+MODE_ICON[id]+'</span>');return w;}},
  {t:'Collect rumblers',d:'You start with Ember. Every takedown earns chromos to unlock more rumblers, and coins with power points level them up.',art:()=>{const w=document.createElement('div');w.className='onb-art';for(const id of['ember','lilt','zenith'])w.append(thumb(BY_ID[id],getSkin(BY_ID[id],'classic'),88));return w;}},
  {t:'Drops and the Rumble Pass',d:'Win matches to earn up to 5 Rumble Drops a day. Tap to open them, and every tap might upgrade the drop! Every match also fills your Rumble Pass.',art:()=>{const w=document.createElement('div');w.className='onb-art';w.append(dropCanvas('rare',70));w.insertAdjacentHTML('beforeend','<span class="onb-arrow">›</span>');w.append(dropCanvas('epic',84));w.insertAdjacentHTML('beforeend','<span class="onb-arrow">›</span>');w.append(dropCanvas('legendary',100));return w;}},
];
let onbStep=0,onbReplay=false;
/* Age step: decides chat. Under 7 = pins only. 7 and up = pins + quick chat phrases. Nobody can type free messages to other players. */
function ageStep(card,done){card.innerHTML='';let age=10;
  card.insertAdjacentHTML('beforeend','<h2 id="onbTitle">How old are you?</h2><p>This sets up chat so it\u2019s right for you. It stays on this device.</p><div class="age-box"><b id="ageVal">10</b><input type="range" id="ageRange" min="4" max="18" value="10" aria-label="Your age"><div class="age-ends"><span>4</span><span>18+</span></div></div><p class="hint" id="ageInfo"></p>');
  const info=card.querySelector('#ageInfo'),upd=()=>{card.querySelector('#ageVal').textContent=age>=18?'18+':age;info.textContent=age<7?'You can send pins in matches.':'You can send pins and quick-chat phrases like \u201cNice shot!\u201d. Nobody can type messages to other players.';};upd();
  card.querySelector('#ageRange').addEventListener('input',e=>{age=+e.target.value;upd();});
  const b=document.createElement('button');b.className='btn primary';b.textContent='Let\u2019s rumble!';b.addEventListener('click',()=>{S.ageBand=age<7?'u7':age<15?'kid':'teen';S.ageNum=age;persist();done();});card.append(b);}
function askAgeIfNeeded(){if(!S.onboarded||S.ageBand)return;$('#onb').hidden=false;ageStep($('#onbCard'),()=>{$('#onb').hidden=true;toast('All set!');});}
function openOnboarding(replay){onbReplay=!!replay;onbStep=0;closeSheet();$('#onb').hidden=false;renderOnb();}
function renderOnb(){
  const card=$('#onbCard');card.innerHTML='';const total=ONB.length+(onbReplay?0:1);
  const dots='<div class="onb-dots" aria-hidden="true">'+Array.from({length:total},(_,k)=>'<i'+(k===onbStep?' class="on"':'')+'></i>').join('')+'</div>';
  if(onbStep<ONB.length){const st=ONB[onbStep],art=st.art();art.classList.add('onb-art');card.append(art);
    card.insertAdjacentHTML('beforeend','<h2 id="onbTitle">'+esc(st.t)+'</h2><p>'+esc(st.d)+'</p>'+dots);
    const row=document.createElement('div');row.className='onb-btns';
    if(onbStep>0){const b=document.createElement('button');b.className='btn';b.textContent='Back';b.addEventListener('click',()=>{onbStep--;sfx('click');renderOnb();});row.append(b);}
    const n=document.createElement('button');n.className='btn primary';const last=onbStep===ONB.length-1;n.textContent=last?(onbReplay?'Done':'Pick my name'):onbStep===0?'Show me':'Next';
    n.addEventListener('click',()=>{audio();sfx('click');if(last&&onbReplay){$('#onb').hidden=true;return;}onbStep++;renderOnb();});row.append(n);card.append(row);
    if(onbStep===0&&!onbReplay){const lc=document.createElement('button');lc.className='linkish';lc.textContent='Have a save code? Load your progress';lc.addEventListener('click',()=>{const c2=$('#onbCard');c2.innerHTML='<h2 id="onbTitle">Load your save code</h2><p>Paste the code you copied from Settings in an older version.</p>';
      const ta=document.createElement('textarea');ta.className='codebox';ta.rows=4;ta.placeholder='Paste your save code here';const msg=document.createElement('p');msg.className='hint';const go2=document.createElement('button');go2.className='btn primary';go2.textContent='Load my progress';
      go2.addEventListener('click',()=>{if(applySaveCode(ta.value,msg,null))$('#onb').hidden=true;});const back=document.createElement('button');back.className='linkish';back.textContent='Back';back.addEventListener('click',()=>{onbStep=0;renderOnb();});c2.append(ta,msg,go2,back);});card.append(lc);}
    if(!last){const sk=document.createElement('button');sk.className='linkish';sk.textContent=onbReplay?'Close':'Skip the tour';sk.addEventListener('click',()=>{if(onbReplay){$('#onb').hidden=true;return;}onbStep=ONB.length;renderOnb();});card.append(sk);}
    return;}
  card.insertAdjacentHTML('beforeend','<h2 id="onbTitle">Pick your name</h2><p>This is the name other players see above your rumbler. Type it twice to make sure it’s right. Changing it later costs gems.</p>'+dots);
  nameForm(card,'Next','primary',nm=>{S.name=nm;persist();sfx('click');ageStep(card,()=>{S.onboarded=true;persist();$('#onb').hidden=true;sfx('unlock');toast('Welcome to the rooftops, '+esc(nm)+'!');if(view==='home')renderHome();else if(view==='settings')renderSettings();});});
}

/* ---------- Loop ---------- */
let lastTs=0,loopErr=false,dayCheckT=0;
function fillDropMinis(){document.querySelectorAll('.dropmini:empty').forEach(el=>el.append(dropCanvas(el.dataset.r,+el.dataset.s||22)));}
if(typeof MutationObserver!=='undefined'){let mq=false;new MutationObserver(()=>{if(mq)return;mq=true;Promise.resolve().then(()=>{mq=false;fillDropMinis();});}).observe(document.body,{childList:true,subtree:true});}
/* Keeps daily things daily even if the app stays open past midnight */
function dayCheck(){
  if(S.daily.date!==todayKey()){ensureDaily();updateShopDot();if(view==='shop')renderShop();else if(view==='home')renderHome();}
  else if(view==='shop'){const cd=document.querySelector('.of-cd');if(cd)cd.textContent=untilMidnight();}
}
function frame(ts){
  requestAnimationFrame(frame);
  try{musicTick();}catch(e){}
  if(view!=='game'&&ts-(frame.pinT||0)>45){frame.pinT=ts;try{animPins();}catch(e){}}
  if(ts-dayCheckT>5000){dayCheckT=ts;try{if(view!=='game')dayCheck();}catch(e){}}
  const dt=Math.min(.05,lastTs?(ts-lastTs)/1000:.016);lastTs=ts;
  try{
    if(view==='game'&&M){
      if(!paused){
        if(P&&!P.dead&&!isWatching()){
          if(ctl.sup&&ctl.sup.drag)P.aim=Math.atan2(ctl.sup.y-ctl.sup.sy,ctl.sup.x-ctl.sup.sx)-WA;
          else if(ctl.atk&&ctl.atk.drag)P.aim=Math.atan2(ctl.atk.y-ctl.atk.sy,ctl.atk.x-ctl.atk.sx)-WA;
          else if(mouseMode&&mouse.has){const[wx,wy]=toWorld(mouse.x,mouse.y);P.aim=Math.atan2(wy-P.y,wx-P.x);}
        }
        if(NETC)netClientUpdate(dt);else{update(dt);recTick(dt);}camera(dt);syncHud();
      }else if(NETC){netClientUpdate(dt);camera(dt);syncHud();}
      render();
    }else if(view==='home')drawPreview(ts/1000);
    if(DA)drawDropScene(dt);
  }catch(err){if(!loopErr){loopErr=true;console.error(err);toast('Something went wrong: '+esc(err.message||err));setTimeout(()=>{loopErr=false;},4000);}}
}
window.addEventListener('resize',()=>{if(view==='game')resize();if(!dropOv.hidden)sizeDrop();});
go('home');
if(!S.onboarded)openOnboarding();else askAgeIfNeeded();
$('#rankedBody').addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.panel.emblem svg')){sfx('tap');secretTap('sec_fan',10,6000);}});
requestAnimationFrame(frame);
})();
</script>

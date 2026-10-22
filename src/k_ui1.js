
/* ---------- UI helpers ---------- */
const ICON={
 trophies:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M7 6h10v3a5 5 0 0 1-10 0z" fill="#ffc93c" stroke="#120f26" stroke-width="1.4"/><path d="M10 14h4l.6 3H9.4z" fill="#ffc93c" stroke="#120f26" stroke-width="1.2"/><rect x="8" y="17" width="8" height="2" rx="1" fill="#ffc93c" stroke="#120f26" stroke-width="1.2"/></svg>',
 gems:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M12 5l6 6-6 8-6-8z" fill="#5ce1a0" stroke="#120f26" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 5l2 6-2 8" fill="none" stroke="#c9ffe6" stroke-width="1"/></svg>',
 coins:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><circle cx="12" cy="12" r="6.5" fill="#ffc93c" stroke="#120f26" stroke-width="1.4"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="#e09a12" stroke-width="1.4"/></svg>',
 pp:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M13 4l-6 9h4l-1 7 6-9h-4z" fill="#c792ff" stroke="#120f26" stroke-width="1.3" stroke-linejoin="round"/></svg>',
 chromos:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M12 4.5l6.5 3.75v7.5L12 19.5l-6.5-3.75v-7.5z" fill="#46b4ff" stroke="#120f26" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 8.5l3 1.75v3.5L12 15.5l-3-1.75v-3.5z" fill="#c8ecff"/></svg>',
 rp:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M12 5l5.5 2v4.5c0 3.4-2.3 6-5.5 7.5-3.2-1.5-5.5-4.1-5.5-7.5V7z" fill="#ff5e87" stroke="#120f26" stroke-width="1.3"/></svg>',
};
ICON.pass='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M5 8h14v2.5a1.5 1.5 0 0 0 0 3V16H5v-2.5a1.5 1.5 0 0 0 0-3z" fill="#ffd36b" stroke="#120f26" stroke-width="1.3" stroke-linejoin="round"/><path d="m12 9.3.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" fill="#120f26"/></svg>';
/* Little drop icon in its real rarity color (filled in automatically wherever it appears) */
const DI=(r,s)=>'<span class="dropmini" data-r="'+(r||'rare')+'" data-s="'+(s||22)+'"></span>';
ICON.drop='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><ellipse cx="12" cy="12" rx="5.6" ry="7.4" fill="#b56cff" stroke="#120f26" stroke-width="1.4"/><rect x="5.6" y="10.6" width="12.8" height="2.8" rx="1.4" fill="#2a2560" stroke="#120f26" stroke-width="1.1"/><circle cx="12" cy="12" r="1.3" fill="#fff"/></svg>';
const rpc=r=>r==='ultra'?' ultra':r==='celestial'?' celestial':'';
const CUR_NAME={coins:'coins',gems:'gems',pp:'power points',chromos:'chromos',trophies:'trophies'};
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const cost=(cur,n)=>'<span class="cost">'+ICON[cur]+fmtFull(n)+'</span>';
function pills(keys){return keys.map(k=>'<span class="pill" aria-label="'+CUR_NAME[k]+': '+fmtFull(S[k])+'">'+ICON[k]+'<span>'+fmt(S[k])+'</span></span>').join('');}
function toast(html,icon){const t=document.createElement('div');t.className='toast';t.innerHTML=(icon?ICON[icon]:'')+'<span>'+html+'</span>';$('#toasts').append(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320);},2400);}
function spend(cur,n){if(S[cur]<n){toast('Not enough '+CUR_NAME[cur]+' yet',cur);return false;}S[cur]-=n;persist();sfx('buy');return true;}
const ownedCount=()=>Object.keys(S.owned).length;

/* ---------- Navigation ---------- */
let view='home';
const SCREENS=['home','modes','rumblers','pass','shop','ranked','settings','game'];
function go(name){
  SCREENS.forEach(s=>{$('#'+s).hidden=s!==name;});view=name;try{applyOrient();}catch(e){}
  $('#tabbar').hidden=name==='game';
  document.querySelectorAll('.tab').forEach(t=>{if(t.dataset.tab===name||(name==='modes'&&t.dataset.tab==='home'))t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');});
  ensureDaily();
  if(name==='home')renderHome();else if(name==='modes')renderModes();else if(name==='rumblers')renderRumblers();else if(name==='pass')renderPass(true);else if(name==='shop')renderShop();else if(name==='ranked')renderRanked();else if(name==='settings')renderSettings();
  const el=$('#'+name);if(el&&name!=='game')el.scrollTop=0;
  updateShopDot();
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{sfx('click');go(t.dataset.tab);}));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
function upgradeReady(){for(const id in S.owned){const me=S.owned[id];if(me.lvl<MAX_LVL&&S.pp>=UP_PP[me.lvl-1]&&S.coins>=UP_COIN[me.lvl-1])return true;}return false;}
function updateShopDot(){$('#shopDot').hidden=S.daily.claimed&&!!S.welcomeGift;$('#passDot').hidden=!passClaimable();{const d=$('#rumDot');if(d)d.hidden=!upgradeReady();}}

/* ---------- Sheet ---------- */
const sheetEl=$('#sheet'),sheetCard=$('#sheetCard');
function openSheet(build){sheetCard.innerHTML='<div class="grab"></div>';build(sheetCard);sheetEl.hidden=false;sheetCard.scrollTop=0;}
function closeSheet(){sheetEl.hidden=true;sheetCard.innerHTML='';}
$('#sheetBg').addEventListener('click',closeSheet);
function confirmBuy(title,canvasEl,options,onDone){
  openSheet(card=>{
    const top=document.createElement('div');top.className='d-top';if(canvasEl)top.append(canvasEl);
    const info=document.createElement('div');info.className='d-info';info.innerHTML='<h2>'+esc(title)+'</h2><p class="sub">Pick how you want to pay.</p>';top.append(info);card.append(top);
    const row=document.createElement('div');row.className='row';
    for(const[cur,n]of options){const b=document.createElement('button');b.className='btn '+(cur==='gems'?'green':cur==='pp'?'pink':'primary');b.innerHTML=cost(cur,n);b.style.flex='1';if(S[cur]<n)b.disabled=true;
      b.addEventListener('click',()=>{if(spend(cur,n)){closeSheet();onDone();}});row.append(b);}
    card.append(row);
    const have=document.createElement('p');have.className='hint';have.textContent='You have '+options.map(([c])=>fmtFull(S[c])+' '+CUR_NAME[c]).join(', ')+'.';card.append(have);
    const x=document.createElement('button');x.className='btn';x.textContent='Cancel';x.addEventListener('click',closeSheet);card.append(x);
  });
}

/* ---------- Home ---------- */
const prev=$('#preview'),pctx=prev.getContext('2d');
function renderHome(){
  $('#meName').textContent=S.name;{const mi=$('#meIcon');if(mi){const ok=ownedIcons();if(!ok.includes(S.icon))S.icon='r:'+(S.owned.ember?'ember':Object.keys(S.owned)[0]);mi.innerHTML='';const fr=pfItem('frame',pfMine().frame);mi.classList.toggle('framed',!!fr.css);mi.style.background=fr.css||'';mi.style.boxShadow=fr.css&&fr.glow?'0 0 10px '+fr.glow:'';mi.append(iconCanvas(S.icon,40));}}{const nc=pfItem('ncol',pfMine().ncol);$('#meName').style.cssText=nc.css;}if(S.exNew&&S.exNew.length)setTimeout(exRevealNext,700);$('#meTrophies').innerHTML=ICON.trophies+'<span>'+fmtFull(S.trophies)+'</span>';
  $('#wallet').innerHTML=pills(['coins','gems','pp','chromos']);
  const next=(S.road+1)*100,prevM=S.road*100;$('#roadFill').style.width=Math.round(clamp((S.best-prevM)/(next-prevM),0,1)*100)+'%';
  const rw=roadReward(Math.min(ROAD_MAX,S.road+1));$('#roadIco').innerHTML=ICON.trophies;$('#roadTxt').textContent=S.road>=ROAD_MAX?'Trophy road complete!':fmtFull(S.best)+' / '+next+' · '+roadLabel(rw);
  const b=BY_ID[S.selected],me=S.owned[b.id],sk=getSkin(b,me.skin),r=RARITY[b.rarity];
  $('#stage').style.setProperty('--r',r.col);
  $('#hRarity').textContent=r.name;$('#hRarity').className='rpill'+rpc(b.rarity);$('#hRarity').style.setProperty('--r',r.col);
  $('#hName').textContent=b.name;$('#hSub').textContent=sk.name+' · '+b.role;
  $('#hLvl').innerHTML='<small>LEVEL</small><b>'+me.lvl+'</b>';if(typeof renderParty==='function')renderParty();if(typeof netBadge==='function')netBadge();if(typeof netHello==='function'&&!NETC)netHello();
  const rk=$('#hRank'),ptn=prestigeTier(me.prestige);rk.textContent='★ '+ptn.name+' prestige '+me.prestige;rk.style.background=ptn.col;rk.style.color='#1b1430';
  const m=MODE_BY[S.mode];$('#modeIco').innerHTML=MODE_ICON[m.id];$('#modeIco').style.setProperty('--mc',m.col);$('#modeName').textContent=m.name;$('#modeMap').textContent=MAPS[dailyMap(m.id)].name+' · '+(modeTag(m));
  $('#playSub').textContent=modeTag(m);
  {const rot=S.matches>0&&S.mapRot!==todayKey(),mb=$('#modeBtn');mb.classList.toggle('rotated',rot);let tg=mb.querySelector('.rot-tag');if(rot&&!tg){tg=document.createElement('span');tg.className='rot-tag';tg.innerHTML='Map has rotated! <b>+40</b> pass tokens';mb.append(tg);}else if(!rot&&tg)tg.remove();}
  {const used=S.dropDay&&S.dropDay.date===todayKey()?S.dropDay.n:0,left=Math.max(0,WIN_DROPS_PER_DAY-used);
   {const plan=winDropPlan(),el=$('#dropsLeft');el.innerHTML=ICON.drop+'<span>'+(left?'<b>'+left+' of '+WIN_DROPS_PER_DAY+'</b> win drops left today':'No win drops left today · more tomorrow')+'</span><span class="wdplan"></span>';
    const wp=el.querySelector('.wdplan');plan.forEach((r,k)=>{const used=k<WIN_DROPS_PER_DAY-left,w=document.createElement('span');w.className='wd'+(used?' used':'')+(k===WIN_DROPS_PER_DAY-left?' next':'');w.title=dropName(r);w.append(dropCanvas(r,24));wp.append(w);});
    el.onclick=()=>openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Today\u2019s win drops</h2><p class="sub">Your next '+left+' win'+(left===1?'':'s')+' today give these drops, in order. Most are Rare, but some days you get lucky.</p>');const g=document.createElement('div');g.className='wdlist';
      plan.forEach((r,k)=>{const used=k<WIN_DROPS_PER_DAY-left,d=document.createElement('div');d.className='wdcell'+(used?' used':'');d.append(dropCanvas(r,56));d.insertAdjacentHTML('beforeend','<b class="'+(r==='ultra'?'rainbow-text':r==='season'?'galaxy-text':'')+'" style="color:'+RARITY[r].col+'">'+RARITY[r].name+'</b><small>Win '+(k+1)+(used?' \u00b7 earned':'')+'</small>');g.append(d);});
      card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}}
  renderTiles();
}
const GIFT_SVG='<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="18" width="34" height="24" rx="4" fill="#ff5e87" stroke="#120f26" stroke-width="3"/><rect x="4" y="12" width="40" height="9" rx="3" fill="#ff8fb1" stroke="#120f26" stroke-width="3"/><rect x="21" y="12" width="6" height="30" fill="#ffd23f" stroke="#120f26" stroke-width="2"/><path d="M24 12c-4-8-13-8-11-2 1 3 7 2 11 2zm0 0c4-8 13-8 11-2-1 3-7 2-11 2z" fill="#ffd23f" stroke="#120f26" stroke-width="2.5"/></svg>';
const LOCK_SVG='<svg class="lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="3" fill="#ffc93c" stroke="#120f26" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#120f26" stroke-width="2.5"/></svg>';
function renderTiles(){
  const t=$('#tiles');t.innerHTML='';
  const mk=(cls,tc,on)=>{const b=document.createElement('button');b.className='tile '+cls;b.style.setProperty('--tc',tc);b.addEventListener('click',()=>{sfx('click');on();});t.append(b);return b;};
  if(S.drops.length){const b=mk('wide drops',S.drops.some(d=>isSpecialDrop(d.r))?'#9d7bff':RARITY[DROP_RAR[S.drops.reduce((m,d)=>Math.max(m,DROP_RAR.indexOf(d.r||d.min||'rare')),0)]].col,openDrops);
    const rk=d=>d.r==='rbox'?11:d.r==='sbox'?10:d.r==='season'?9:SPOOKY.includes(d.r)?8:DROP_RAR.indexOf(d.r||d.min||'rare'),srt=S.drops.slice().sort((a,b2)=>rk(b2)-rk(a)),bestD=srt[0],br=isSpecialDrop(bestD.r)?bestD.r:DROP_RAR[Math.max(0,rk(bestD))];
    if(RARITY[br]&&RARITY[br].box)b.style.setProperty('--tc',RARITY[br].col);b.append(dropCanvas(br,52));const cnt={};for(const d of S.drops){const k=isSpecialDrop(d.r)?d.r:(d.r||d.min||'rare');cnt[k]=(cnt[k]||0)+1;}
    const order=['rbox','sbox','season','pumpkin','skeleton','zombie','ultra','legendary','mythic','epic','rare'].filter(k=>cnt[k]),nb=(cnt.rbox||0)+(cnt.sbox||0),nd=S.drops.length-nb;
    b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">'+(nb&&nd?'Rumble Drops & Boxes':nb?'Boxes':'Rumble Drops')+'</span><b>'+(nb&&nd?nd+' drop'+(nd>1?'s':'')+' + '+nb+' box'+(nb>1?'es':'')+' ready':S.drops.length+(nb?' box'+(nb>1?'es':''):'')+' ready to open')+'</b><span class="tt dropq"></span></span>');
    const q=b.querySelector('.dropq');for(const k of order){const w=document.createElement('span');w.className='dq';w.append(dropCanvas(k,22));w.insertAdjacentHTML('beforeend','<i>'+cnt[k]+' '+RARITY[k].name+'</i>');q.append(w);}}
  if(!S.welcomeGift){const b=mk('wide gift welcometile','#ff5ad1',()=>{S.welcomeGift=1;for(let k=0;k<3;k++)S.drops.push({r:'legendary',min:null});S.drops.push({r:'rbox',min:null});persist();sfx('unlock');toast('Gift added! Opening it now','chromos');renderHome();openDrops();});
    b.append(dropCanvas('legendary',52));b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">New player gift</span><b>3 Legendary Drops + 1 Rumbler Box</b><span class="tt">Tap to claim it now!</span></span>');}
  if(halloweenOn()){const tk=tokensLeft(),kl=knocksLeft(),b=mk('wide hwtile','#ff8a1f',openHalloween);const into=(S.hw.wins|0)%KNOCK_EVERY;
    b.append(dropCanvas('pumpkin',52));b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">Halloween \u00b7 Trick or Treat</span><b>'+(tk>0?tk+' Halloween token'+(tk>1?'s':'')+' ready!':kl>0?kl+' door knock'+(kl>1?'s':'')+' ready!':(KNOCK_EVERY-into)+' more win'+(KNOCK_EVERY-into>1?'s':'')+' for a token')+'</b><span class="tbar"><i style="width:'+(tk>0?100:into/KNOCK_EVERY*100)+'%"></i></span></span>');}
  if(!S.daily.claimed){const g=GIFTS[S.daily.gift||0],k=Object.keys(g)[0],b=mk('wide gift','#6be39a',()=>go('shop'));
    b.innerHTML='<span class="tico">'+GIFT_SVG+'</span><span style="min-width:0"><span class="tk">Free daily gift</span><b>'+g[k]+' '+CUR_NAME[k]+' waiting</b><span class="tt">Tap to claim it in the shop</span></span>';}
  {const tier=passTier(S.pass.xp),done=tier>=PASS_TIERS,into=done?(S.pass.xp-PASS_TIERS*PASS_STEP)%PASS_BONUS_STEP:S.pass.xp%PASS_STEP,ready=passClaimable(),b=mk('wide'+(ready?' passr':''),'#ffd36b',()=>go('pass'));
    b.innerHTML='<span class="tico">'+passBadge(tier,46)+'</span><span style="min-width:0"><span class="tk">Rumble Pass · Starfall</span><b>'+(ready?ready+' reward'+(ready>1?'s':'')+' to claim':done?'Pass complete':'Tier '+tier+' of '+PASS_TIERS)+'</b><span class="tbar"><i style="width:'+Math.round(into/PASS_STEP*100)+'%;background:#ffd36b"></i></span></span>';}
  /* Banks: above Next unlock and Ranked */
  {const parts=bankSummary(),b=mk('wide banktile','#46b4ff',()=>openBanks());const ic=document.createElement('span');ic.className='tico bank-ico';ic.textContent='\ud83c\udfe6';b.append(ic);
    const tx=document.createElement('span');tx.style.minWidth='0';tx.innerHTML='<span class="tk">Banks</span><b>'+(parts.length?esc(parts.slice(0,2).join(' \u00b7 '))+(parts.length>2?' +'+(parts.length-2)+' more':''):'Save your chromos, coins & more')+'</b>';
    const ks=document.createElement('span');ks.className='bank-keepers';for(const bk of BANKS){const t=thumb(BY_ID[bk.rid],bankKeeperSkin(bk),26);ks.append(t);}tx.append(ks);b.append(tx);}
  const locked=RUMBLERS.filter(x=>!S.owned[x.id]&&!RARITY[x.rarity].passOnly&&!eventLocked(x)).sort((a,b)=>RARITY[a.rarity].chromos-RARITY[b.rarity].chromos);
  if(locked.length){const nb=locked[0],need=RARITY[nb.rarity].chromos,f=clamp(S.chromos/need,0,1),b=mk('',RARITY[nb.rarity].col,()=>openRumbler(nb.id));
    const cv=thumb(nb,getSkin(nb,'classic'),48);cv.classList.add('lockd');b.append(cv);
    b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">Next unlock</span><b>'+nb.name+'</b><span class="tbar"><i style="width:'+Math.round(f*100)+'%"></i></span><span class="tt">'+fmt(S.chromos)+' / '+fmt(need)+' chromos</span></span>');}
  else{const b=mk('','#ffc93c',()=>go('rumblers'));b.innerHTML='<span class="tico">'+ICON.chromos+'</span><span><span class="tk">Collection</span><b>All unlocked!</b></span>';}
  const ri=rankInfo(S.rp),lk=ownedCount()<3,b=mk('',lk?'#8f88c4':ri.col,()=>go('ranked'));
  b.innerHTML='<span class="tico">'+emblem(ri.i,46)+'</span><span style="min-width:0"><span class="tk">Ranked</span><b>'+(lk?'Locked':ri.name)+'</b>'+(lk?'<span class="tt">Own 3 rumblers ('+ownedCount()+' / 3)</span>':'<span class="tbar"><i style="width:'+(ri.need?Math.round(ri.into/ri.need*100):100)+'%;background:#ff5e87"></i></span><span class="tt">'+fmtFull(S.rp)+' RP</span>')+'</span>';
  /* Solar: under Ranked and Next unlock */
  {const n=S.sol|0,all=RUMBLERS.length,own=RUMBLERS.filter(x=>S.owned[x.id]).length,open=own>=all,sd=n>SOLAR_STEPS,max=sd,cost=max?0:solStepCost(n),f=!open?own/all:max?1:clamp(S.chromos/cost,0,1),L=sd?11:Math.max(1,Math.ceil(Math.max(1,n)/3)),
    b=mk('wide soltile'+(open&&!max&&S.chromos>=cost?' passr':'')+(open?'':' sol-locked')+(sd||n===SOLAR_STEPS?' soldar':''),max?'#ff6a00':'#ffb000',()=>openSolars());b.append(n?solarCanvas(L,50,true):solarCanvas(1,50));
    b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">Solar'+(n?' \u00b7 '+esc(solStepName(n)):'')+'</span><b>'+(!open?'\ud83d\udd12 Unlock every rumbler first':sd?'SOLDAR \ud83d\udc51':'Next: '+esc(solStepName(n+1)))+'</b><span class="tbar"><i style="width:'+Math.round(f*100)+'%;background:linear-gradient(90deg,#ffd23f,#ff8a1f)"></i></span><span class="tt">'+(!open?own+' / '+all+' rumblers':sd?'The final level. You did it!':fmt(S.chromos)+' / '+fmt(cost)+' chromos'+(S.chromos>=cost?' \u00b7 ready!':''))+'</span></span>');}
}
$('#catalogBtn').addEventListener('click',()=>openCatalog(S.selected));
$('#hRank').addEventListener('click',()=>openPrestigeTrack(S.selected));
$('#road').addEventListener('click',()=>openTrophyRoad());
$('#meTrophies').addEventListener('click',()=>openTrophyRoad());
$('#modeBtn').addEventListener('click',()=>{sfx('click');if(S.matches>0&&S.mapRot!==todayKey()){S.mapRot=todayKey();S.pass.xp+=40;persist();sfx('unlock');toast('Maps have rotated! +40 pass tokens','pass');renderHome();return;}go('modes');});
function drawPreview(t){
  const d=Math.min(2,window.devicePixelRatio||1),sz=230;
  if(prev.width!==Math.round(sz*d)){prev.width=Math.round(sz*d);prev.height=Math.round(sz*d);}
  pctx.setTransform(d,0,0,d,0,0);pctx.clearRect(0,0,sz,sz);
  const b=BY_ID[S.selected],sk=getSkin(b,S.owned[b.id].skin);
  pctx.save();pctx.globalCompositeOperation='lighter';glow(pctx,115,200,90,RARITY[b.rarity].col,.35);pctx.restore();
  pctx.save();pctx.strokeStyle='rgba(255,201,60,.6)';pctx.lineWidth=3;pctx.setLineDash([10,8]);pctx.lineDashOffset=-t*12;ell(pctx,115,200,84,20);pctx.stroke();pctx.restore();
  drawFighter(pctx,115,132,60,b,sk,REDUCED?.55:.55+Math.sin(t*.7)*.45,t,{still:REDUCED});
  pctx.save();pctx.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const a=i/7*TAU+t*.3,rr=88+Math.sin(t*1.3+i)*8,k=.5+.5*Math.sin(t*3+i*1.7);glow(pctx,115+Math.cos(a)*rr,120+Math.sin(a)*rr*.6,5+k*5,RARITY[b.rarity].col,k*.9);}pctx.restore();
}

/* ---------- Modes ---------- */
function renderModes(){
  const g=$('#modeGrid');g.innerHTML='';
  const sdm=MODES.filter(m=>m.group==='sd'),cur=sdm.find(m=>m.id===S.mode),gb=document.createElement('button');
  gb.className='mode-card'+(cur?' sel':'');gb.style.setProperty('--mc','#46d0ff');
  gb.innerHTML='<span class="mico" style="--mc:#46d0ff">'+MODE_ICON.showdown+'</span><span><b>Showdown</b><span>Break boxes for energy cubes and be the last one standing. Play solo, as a duo or as a trio.</span><em>'+(cur?cur.name+' selected · tap to switch':'Solo · Duo · Trio')+'</em></span>';
  gb.addEventListener('click',()=>{sfx('click');openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Showdown</h2><p class="sub">Pick how you want to play. All three use Storm Grove and the green storm.</p>');
    for(const m of sdm){const b=document.createElement('button');b.className='mode-card'+(S.mode===m.id?' sel':'');b.style.setProperty('--mc',m.col);
      b.innerHTML='<span class="mico" style="--mc:'+m.col+'">'+MODE_ICON[m.id]+'</span><span><b>'+m.name+'</b><span>'+m.desc+'</span><em>'+modeTag(m)+'</em></span>';
      b.addEventListener('click',()=>{S.mode=m.id;persist();sfx('click');closeSheet();go('home');});card.append(b);}
    const x=document.createElement('button');x.className='btn';x.textContent='Cancel';x.addEventListener('click',closeSheet);card.append(x);});});
  g.append(gb);
  for(const m of MODES){if(m.hidden||m.group)continue;const b=document.createElement('button');b.className='mode-card'+(S.mode===m.id?' sel':'');b.style.setProperty('--mc',m.col);b.setAttribute('aria-pressed',S.mode===m.id?'true':'false');
    b.innerHTML='<span class="mico" style="--mc:'+m.col+'">'+MODE_ICON[m.id]+'</span><span><b>'+m.name+'</b><span>'+m.desc+'</span><em>'+MAPS[dailyMap(m.id)].name+' · '+(modeTag(m))+(m.ranked?' · In ranked':'')+'</em></span>';
    b.addEventListener('click',()=>{S.mode=m.id;persist();sfx('click');go('home');});g.append(b);}
}

/* ---------- Rumblers ---------- */
const modeTag=m=>m.tag?m.tag:m.size>1?(m.size===2?'Duos':'Trios')+' · '+m.players+' players':m.players?'Solo · '+m.players+' players':m.ffa?'Free for all':'3 vs 3';
const RORDER=['common','rare','epic','mythic','legendary','ultra','celestial'];
function renderRumblers(){
  $('#ownCount').textContent=ownedCount()+' / '+RUMBLERS.length+' · '+fmtFull(S.chromos)+' chromos';
  const g=$('#rGrid');g.innerHTML='';g.className='';g.style.cssText='display:flex;flex-direction:column;gap:10px';
  for(const rar of RORDER){const list=RUMBLERS.filter(b=>b.rarity===rar);if(!list.length)continue;const r=RARITY[rar];
    const head=document.createElement('div');head.className='rar-head';head.innerHTML='<span class="rpill'+rpc(rar)+'" style="--r:'+r.col+'">'+r.name+'</span><span>'+list.filter(b=>S.owned[b.id]).length+' / '+list.length+' unlocked'+(r.passOnly?' · Tier 30 of the Rumble Pass':r.chromos?' · '+fmtFull(r.chromos)+' chromos each':'')+'</span>';g.append(head);
    const grid=document.createElement('div');grid.className='grid rum';
    for(const b of list){const me=S.owned[b.id],el=document.createElement('button');
      el.className='card'+(me?'':' locked')+(S.selected===b.id?' sel':'');el.style.setProperty('--r',r.col);
      el.append(thumb(b,getSkin(b,me?me.skin:'classic'),84));
      let foot;if(me)foot='<span class="tag">★ '+me.prestige+'</span>';else if(eventLocked(b))foot='<span class="tag on">\ud83c\udf83 Event</span>';else if(r.passOnly)foot='<span class="tag on">'+ICON.pass+'Tier '+PASS_TIERS+'</span>';else{const f=clamp(S.chromos/r.chromos,0,1);foot='<span class="tag'+(f>=1?' on':'')+'">'+ICON.chromos+fmt(r.chromos)+'</span><span class="cbar"><i style="width:'+Math.round(f*100)+'%"></i></span>';}
      el.insertAdjacentHTML('beforeend',(me?'<span class="lvtag">'+me.lvl+'</span>':LOCK_SVG)+'<span class="nm">'+b.name+'</span>'+foot);
      el.addEventListener('click',()=>{sfx('click');openRumbler(b.id);});grid.append(el);}
    g.append(grid);}
}
function statRows(b,lvl,mods){
  const a=b.atk,per=a.kind==='orbs'?a.dmg*2:a.kind==='spread'?a.n*a.dmg:a.kind==='burst'?a.n*a.dmg:a.double?a.dmg*2:a.dmg;const m=mulFor(lvl),nx=lvl<MAX_LVL?mulFor(lvl+1):m;
  const rows=[['Health',b.hp*m,b.hp*nx,10500],['Damage',per*m,per*nx,2100]];
  let h=rows.map(([n,v,v2,mx])=>'<div class="stat"><span>'+n+'</span><div class="track" style="position:relative"><i class="nx" style="position:absolute;inset:0 auto 0 0;width:'+Math.round(clamp(v2/mx,.06,1)*100)+'%"></i><i style="position:relative;width:'+Math.round(clamp(v/mx,.06,1)*100)+'%"></i></div><b>'+fmtFull(v)+(lvl<MAX_LVL?' <span style="color:#6be39a">+'+fmtFull(v2-v)+'</span>':'')+'</b></div>').join('');
  h+='<div class="stat"><span>Range</span><div class="track"><i style="width:'+Math.round(clamp((a.range||120)/450,.06,1)*100)+'%"></i></div><b>'+((a.range||120)/TILE).toFixed(1)+' tiles</b></div>';
  h+='<div class="stat"><span>Speed</span><div class="track"><i style="width:'+Math.round(clamp(b.speed/180,.06,1)*100)+'%"></i></div><b>'+(b.speed>=165?'Very fast':b.speed>=145?'Fast':'Normal')+'</b></div>';
  return h;
}
/* Skin catalog: every skin of every rumbler, owned or not, with a way to try each one */
let catId=null;
function skinHow(b,sk){const me=S.owned[b.id];if(me&&me.skins.includes(sk.id))return['Owned','#6be39a'];if(sk.tier===0)return['Starter look','#9aa3c7'];
  if(sk.tier==='golden')return['20,000 coins, any time','#ffd23f'];if(sk.tier==='power')return['10,000 power points, any time','#c79bff'];
  if(sk.tier==='solar'){const x=SOL_BY_SKIN[sk.id];return[x?(x.lv>SOLAR_MAX?'Soldar (after Solar Fame)':'Solar: '+SOLAR_LEVELS[x.lv-1].name+' III'):'Solar',sk.soldar?'#ff6a00':SOL_COL];}
  if(sk.tier==='exclusive'){const e=EX_BY_SKIN[sk.id];return[e?'Exclusive \u00b7 '+e.how+' ('+fmtFull(Math.min(exProgress(e),e.goal))+'/'+fmtFull(e.goal)+')':'Exclusive',EX_COL];}
  const dm=dailySkinMult(b.id,sk.id);if(dm)return[dm<1?'In the shop today · 50% off':'In the shop today','#ffd23f'];
  if(sk.tier==='pass')return['Rumble Pass','#ffd36b'];if(sk.tier==='master')return['Reach Master','#ff7aa8'];if(sk.tier==='rank'||sk.tier==='master'){const k=RANK_SETS.findIndex(x=>x.skin.id===sk.id),rs=RANK_SETS[k],mine=rankSetRumbler(k,rankSeed(S))===b.id,when=rs.key==='master'?'Reach Master':rs.idx===0?'First ranked match':'Reach '+rs.name+' I';return[mine?when+' (yours!)':'Ranked reward for other players','#c79bff'];}
  if(sk.id==='hw_surged')return['Halloween only · Happy House after '+HAPPY_KNOCKS+' knocks','#ff5ad1'];if(sk.id==='hw_grim')return['Halloween only · knock on the Dead Inside house','#3dff8a'];if(sk.id==='hw_reaper')return['Unlock Dark in the Halloween event','#ff8a1f'];if(sk.tier==='prestige')return['Prestige '+sk.prestige,'#e7a36b'];return['Daily skins (rotates)','#8fd3ff'];}
function openCatalog(id){catId=id||catId||S.selected;const locked=(S.pendingSkins||[]).map(x=>x.split(':')).filter(([r,k])=>BY_ID[r]&&!S.owned[r]);if(catId==='__locked'&&!locked.length)catId=S.selected;
  if(catId==='__locked')return openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Locked skins</h2><p class="sub">Skins you already own for rumblers you haven\u2019t unlocked yet. Unlock the rumbler and the skin is ready to wear. You can try them now.</p>');
    const back=document.createElement('button');back.className='btn sm';back.textContent='\u2190 All skins';back.addEventListener('click',()=>openCatalog(S.selected));card.append(back);const g=document.createElement('div');g.className='catgrid';
    for(const[rid,skid]of locked){const b=BY_ID[rid],sk=getSkin(b,skid),r=RARITY[b.rarity],need=eventLocked(b)?'Open '+DARK_DROPS+' Halloween Drops':r.passOnly?'Rumble Pass tier '+PASS_TIERS:'Unlock '+esc(b.name)+' \u00b7 '+fmtFull(r.chromos)+' chromos',d=document.createElement('div');d.className='catcell';d.append(thumb(b,sk,80));
      d.insertAdjacentHTML('beforeend','<b>'+esc(sk.name)+'</b><small>'+esc(b.name)+'</small><small style="color:#ffd23f">\ud83d\udd12 '+need+'</small>');const t=document.createElement('button');t.className='btn sm';t.textContent='Try';t.addEventListener('click',()=>startTrial(b.id,sk.id));d.append(t);g.append(d);}
    card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});
  openSheet(card=>{const b=BY_ID[catId];
  card.insertAdjacentHTML('beforeend','<h2>Skin catalog</h2><p class="sub">Every skin in the game. Try any of them in training, even for rumblers you haven\u2019t unlocked.</p>');
  const chips=document.createElement('div');chips.className='catchips';for(const x of RUMBLERS){const ch=document.createElement('button');ch.className='catchip'+(x.id===catId?' on':'');ch.append(thumb(x,getSkin(x,'classic'),34));ch.insertAdjacentHTML('beforeend','<span>'+esc(x.name)+'</span>');ch.addEventListener('click',()=>openCatalog(x.id));chips.append(ch);}
  if(locked.length){const lc=document.createElement('button');lc.className='catchip lockchip';lc.innerHTML='<span>\ud83d\udd12 Locked skins ('+locked.length+')</span>';lc.addEventListener('click',()=>openCatalog('__locked'));chips.prepend(lc);}
  card.append(chips);const g=document.createElement('div');g.className='catgrid';
  for(const sk of skinsOf(b)){const[how,col]=skinHow(b,sk),d=document.createElement('div');d.className='catcell';d.append(thumb(b,sk,80));d.insertAdjacentHTML('beforeend','<b>'+esc(sk.name)+'</b><small style="color:'+col+'">'+how+'</small>');
    const t=document.createElement('button');t.className='btn sm';t.textContent='Try';t.addEventListener('click',()=>startTrial(b.id,sk.id));d.append(t);g.append(d);}
  card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);
  setTimeout(()=>{const on=chips.querySelector('.on');if(on)chips.scrollLeft=on.offsetLeft-chips.offsetLeft-20;},0);});}
/* Trophy road: every 100 trophies up to 5,000 */
function openTrophyRoad(){openSheet(card=>{const nx=Math.min(ROAD_MAX,S.road+1),nxT=nx*100,prevT=S.road*100,pct=S.road>=ROAD_MAX?100:Math.round(clamp((S.best-prevT)/(nxT-prevT),0,1)*100),amz=Math.min(TROPHY_MAX,(Math.floor(S.best/1000)+1)*1000),ot=OPP_TIERS[oppTier(S.trophies)];
  card.classList.add('troad');
  card.insertAdjacentHTML('beforeend','<div class="tr-hero"><div class="tr-cup">'+ICON.trophies+'</div><div class="tr-main"><span class="of-kick">Trophy road</span><b class="tr-num">'+fmtFull(S.trophies)+'</b><small>Best '+fmtFull(S.best)+' \u00b7 road goes to '+fmtFull(TROPHY_MAX)+'</small></div></div>'+
    '<div class="tr-next"><span>'+(S.road>=ROAD_MAX?'Road complete!':'Next reward at <b>'+fmtFull(nxT)+'</b>')+'</span><span class="tr-bar"><i style="width:'+pct+'%"></i></span></div>'+
    '<div class="tr-chips"><span class="tr-chip amz">'+(S.best>=TROPHY_MAX?'Every Amazing Drop claimed':'Amazing Drop at <b>'+fmtFull(amz)+'</b>')+'</span><span class="tr-chip" style="--oc:'+ot.col+'">Opponents: <b>'+ot.name+'</b></span>'+(S.trophies>=HELL_AT?'<span class="tr-chip hell">Hell mode</span>':'<span class="tr-chip">Hell mode from '+fmtFull(HELL_AT)+'</span>')+'</div>');
  const tr=document.createElement('div');tr.className='prtrack';
  for(let n=1;n<=ROAD_MAX;n++){const rw=roadReward(n),got=S.road>=n,next=n===S.road+1,row=document.createElement('div');row.className='pt-row'+(got?' got':next?' next':'')+(n%10===0?' big':'');row.style.setProperty('--pc',rw.drop?RARITY[rw.drop].col:'#ffd23f');
    row.insertAdjacentHTML('beforeend','<div class="pt-num"><b>'+fmtFull(n*100)+'</b><small>'+(got?'Claimed':next?(n*100-S.best)+' to go':'')+'</small></div>');const mid=document.createElement('div');mid.className='pt-items';
    if(rw.drop)mid.append(dropCanvas(rw.drop,54));let h='<ul class="pt-list">';if(rw.drop)h+='<li>'+(rw.n>1?rw.n+'\u00d7 ':'')+RARITY[rw.drop].name+' Drop</li>';for(const k of['coins','chromos','gems','pp'])if(rw[k])h+='<li>'+ICON[k]+fmtFull(rw[k])+'</li>';mid.insertAdjacentHTML('beforeend',h+'</ul>');row.append(mid);tr.append(row);}
  card.append(tr);card.insertAdjacentHTML('beforeend','<p class="pr-hint">Swipe sideways to see every reward \u2192</p>');const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);
  {const cup=card.querySelector('.tr-cup');if(cup){cup.style.cursor='pointer';cup.addEventListener('click',()=>{sfx('tap');secretTap('sec_polish',6,5000);cup.animate&&cup.animate([{transform:'rotate(0)'},{transform:'rotate(14deg)'},{transform:'rotate(-14deg)'},{transform:'rotate(0)'}],{duration:260});});}}
  const nxEl=tr.querySelector('.pt-row.next')||tr.lastChild;setTimeout(()=>{tr.scrollLeft=Math.max(0,nxEl.offsetLeft-tr.offsetLeft-20);},0);});}
/* Pin catalog: tap a category tab to see its pins */
let pinCatTab='new';
function openPinCatalog(back){openSheet(card=>{const ids=l=>l.map(p=>p[0]);
  const CATS=[['secret','Secret','Hidden all over the game. Each one also gives a profile icon.',ids(SECRET_PINS)],['solar','Solar','From Solar levels. Step II pins are animated.',ids(SOLAR_PINS)],['halloween','Halloween','Knock on doors and open Halloween drops',ids(HALLOWEEN_PINS)],['new','New','150 brand new pins from the daily shop',ids(GEN_PINS)],['free','Free','Everyone has these',ids(BASIC_PINS)],['random','Random','Random pins from the daily shop',ids(PREMIUM_PINS.concat(DAILY_ONLY_PINS))],['friendly','Friendly','Nice things to say, from the daily shop',ids(FRIENDLY_PINS)],['toxic','Toxic & troll','Daily pins shop',ids(TOXIC_PINS.concat(TROLL_PINS))],
    ['starfall','Starfall','Rumble Pass and Starfall Drops',ids(PASS_PINS.concat(SEASON_PINS))],['ranked','Ranked','Reach each rank',ids(RANK_PINS)],['sets','Skin sets','Come with special skins',ids(SET_PINS)],['yours','Skin & prestige','Yours, from skins and prestige',S.pins.filter(x=>/^(sk|pr):/.test(x))]];
  if(!CATS.some(c=>c[0]===pinCatTab))pinCatTab='random';
  card.insertAdjacentHTML('beforeend','<h2>Pin catalog</h2><p class="sub">Tap a category to see its pins. Owned pins have a green tick.</p>');
  const tabs=document.createElement('div');tabs.className='catchips';
  for(const[id,nm,,list]of CATS){const own=list.filter(x=>S.pins.includes(x)||BASIC_PINS.some(p=>p[0]===x)).length,t=document.createElement('button');t.className='catchip pctab'+(id===pinCatTab?' on':'');t.innerHTML='<span>'+nm+'</span><small>'+own+' / '+list.length+'</small>';
    t.addEventListener('click',()=>{pinCatTab=id;openPinCatalog(back);});tabs.append(t);}
  card.append(tabs);const cat=CATS.find(c=>c[0]===pinCatTab);
  card.insertAdjacentHTML('beforeend','<div class="sec-title"><h2>'+cat[1]+'</h2><span>'+cat[2]+'</span></div>');
  const g=document.createElement('div');g.className='pingrid'+(pinCatTab==='secret'?' secretgrid':'');
  if(!cat[3].length)card.insertAdjacentHTML('beforeend','<p class="hint">Nothing here yet. Buy skins or prestige rumblers to get these.</p>');
  for(const id of cat[3]){const own=S.pins.includes(id)||BASIC_PINS.some(p=>p[0]===id),c=document.createElement('div');c.className='pcell'+(own?' own':'');
    if(pinCatTab==='secret'){if(own){c.append(pinCanvas('b:'+id,52));c.insertAdjacentHTML('beforeend','<span class="sg-txt"><b>'+esc(pinName(id))+'</b><small>Found!</small></span><i class="tick">\u2713</i>');}else c.innerHTML='<span class="qmark">?</span><span class="sg-txt"><b>???</b><small>'+esc(SECRET_HINT[id]||'Keep exploring\u2026')+'</small></span>';g.append(c);continue;}c.append(pinCanvas('b:'+id,52));c.insertAdjacentHTML('beforeend','<small>'+esc(pinName(id))+'</small>'+(own?'<i class="tick">✓</i>':''));g.append(c);}
  card.append(g);if(pinCatTab==='free')card.insertAdjacentHTML('beforeend','<p class="hint">Every rumbler also has 3 free pins of its own (Happy, Angry, Sad).</p>');
  const x=document.createElement('button');x.className='btn';x.textContent=back?'Back':'Close';x.addEventListener('click',back||closeSheet);card.append(x);
  setTimeout(()=>{const on=tabs.querySelector('.on');if(on)tabs.scrollLeft=on.offsetLeft-tabs.offsetLeft-20;},0);});}
/* Pin loadout per rumbler: 3 free rumbler pins + 2 custom slots */
const CHAT_SVG='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="currentColor"/><circle cx="8.5" cy="11" r="1.5" fill="#16133a"/><circle cx="15.5" cy="11" r="1.5" fill="#16133a"/></svg>';
function openPinLoadout(id){const b=BY_ID[id],me=S.owned[id];if(!me)return;if(!Array.isArray(me.facePins))me.facePins=[null,null,null];if(!Array.isArray(S.customPins))S.customPins=[null,null];
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(b.name)+'’s pins</h2><p class="sub">These 5 pins show up when you tap the chat button in a match. The first 3 are '+esc(b.name)+'’s own pins: tap one to swap in a skin or prestige pin you own for '+esc(b.name)+'. The 2 custom pins are shared by all your rumblers.</p>');
    card.insertAdjacentHTML('beforeend','<p class="lbl" style="margin:0">'+esc(b.name)+'’s pins</p>');const row=document.createElement('div');row.className='pinslots';
    PIN_FACES.forEach((f,k)=>{const cur=me.facePins[k]&&S.pins.includes(me.facePins[k])?me.facePins[k]:null,d=document.createElement('button');d.className='pslot fixed'+(cur?' swapped':'');d.append(pinCanvas(cur?'b:'+cur:'r:'+id+':'+f[0],58));d.insertAdjacentHTML('beforeend','<small>'+(cur?esc(pinName(cur)):f[1])+'</small>');d.addEventListener('click',()=>pickFacePin(id,k));row.append(d);});
    card.append(row);card.insertAdjacentHTML('beforeend','<p class="lbl" style="margin:0">Custom pins · shared by every rumbler</p>');const row2=document.createElement('div');row2.className='pinslots custom';
    S.customPins.forEach((s,k)=>{if(s&&pinPersonal(s))s=S.customPins[k]=null;const d=document.createElement('button');d.className='pslot custom';if(s)d.append(pinCanvas('b:'+s,58));else d.insertAdjacentHTML('beforeend','<span class="pplus">+</span>');d.insertAdjacentHTML('beforeend','<small>'+(s?esc(pinName(s)):'Custom '+(k+1))+'</small>');
      d.addEventListener('click',()=>pickPinFor(id,k));row2.append(d);});
    card.append(row2);const pc=document.createElement('button');pc.className='btn';pc.textContent='Pin catalog';pc.addEventListener('click',()=>openPinCatalog(()=>openPinLoadout(id)));const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openRumbler(id));card.append(pc,x);});}
/* one of the rumbler's own slots: its normal face pin, or a skin / prestige / set pin that belongs to this rumbler */
function pickFacePin(id,k){const me=S.owned[id],b=BY_ID[id],f=PIN_FACES[k],mine=S.pins.filter(p=>pinPersonal(p)&&pinAllowedFor(p,id));
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(b.name)+'’s pin '+(k+1)+'</h2><p class="sub">'+(mine.length?'Swap in a skin, prestige or set pin you own for '+esc(b.name)+'.':'You don’t have any skin pins for '+esc(b.name)+' yet. Skins come with their own pins.')+'</p>');const g=document.createElement('div');g.className='pingrid';
    const def=document.createElement('button');def.className='pcell'+(!me.facePins[k]?' on':'');def.append(pinCanvas('r:'+id+':'+f[0],52));def.insertAdjacentHTML('beforeend','<small>'+f[1]+' (normal)</small>');def.addEventListener('click',()=>{me.facePins[k]=null;persist();openPinLoadout(id);});g.append(def);
    for(const p of mine){const c=document.createElement('button');c.className='pcell'+(me.facePins[k]===p?' on':'');c.append(pinCanvas('b:'+p,52));c.insertAdjacentHTML('beforeend','<small>'+esc(pinName(p))+'</small>');c.addEventListener('click',()=>{const o=me.facePins.indexOf(p);if(o>=0&&o!==k)me.facePins[o]=null;me.facePins[k]=p;persist();sfx('click');openPinLoadout(id);});g.append(c);}
    card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openPinLoadout(id));card.append(x);});}
function pickPinFor(id,k){const mine=BASIC_PINS.map(p=>p[0]).concat(S.pins).filter(p=>!pinPersonal(p));if(!Array.isArray(S.customPins))S.customPins=[null,null];
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Pick custom pin '+(k+1)+'</h2><p class="sub">Custom pins are shared by all your rumblers. Skin and prestige pins go in a rumbler’s own slots instead. Get more pins from the Daily pins in the shop.</p>');const g=document.createElement('div');g.className='pingrid';
    const clear=document.createElement('button');clear.className='pcell';clear.innerHTML='<span class="pplus">×</span><small>Empty</small>';clear.addEventListener('click',()=>{S.customPins[k]=null;persist();openPinLoadout(id);});g.append(clear);
    for(const p of[...new Set(mine)]){const c=document.createElement('button');c.className='pcell'+(S.customPins[k]===p?' on':'');c.append(pinCanvas('b:'+p,52));c.insertAdjacentHTML('beforeend','<small>'+esc(pinName(p))+'</small>');c.addEventListener('click',()=>{S.customPins[k]=p;persist();sfx('click');openPinLoadout(id);});g.append(c);}
    card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openPinLoadout(id));card.append(x);});}
/* Prestige track: every reward from 0 to 250, with skins you can try */
function openPrestigeTrack(id){const b=BY_ID[id],me=S.owned[id],n=me?me.prestige:0,tn=prestigeTier(n);
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(b.name)+' prestige track</h2><p class="sub">You\u2019re at <b style="color:'+tn.col+'">'+n+' / '+PRESTIGE_MAX+'</b> ('+tn.name+'). Every win with '+esc(b.name)+' is +1 prestige. Bronze is under 150, Silver from 150, Gold at 250.</p>');
    const tr=document.createElement('div');tr.className='prtrack';
    for(const m of[50,100,150,200,250]){const rw=PRESTIGE_REWARDS[m],got=n>=m,t2=prestigeTier(m),row=document.createElement('div');row.className='pt-row'+(got?' got':n>=m-50?' next':'');row.style.setProperty('--pc',t2.col);
      const left=document.createElement('div');left.className='pt-num';left.innerHTML='<b>'+m+'</b><small>'+(got?'Claimed':n>=m-50?(m-n)+' to go':'')+'</small>';row.append(left);
      const mid=document.createElement('div');mid.className='pt-items';
      if(rw.skin){const sk=getSkin(b,rw.skin);const w=document.createElement('div');w.className='pt-skin';w.append(thumb(b,sk,64));w.insertAdjacentHTML('beforeend','<small>'+esc(sk.name)+' skin</small>');
        const tb=document.createElement('button');tb.className='btn sm';tb.textContent='Try';tb.addEventListener('click',()=>startTrial(id,rw.skin));w.append(tb);mid.append(w);}
      if(rw.pin){const w=document.createElement('div');w.className='pt-skin';w.append(pinCanvas('b:pr:'+id+':'+rw.pin,52));w.insertAdjacentHTML('beforeend','<small>'+t2.name+' pin</small>');mid.append(w);}
      mid.insertAdjacentHTML('beforeend','<ul class="pt-list"><li>'+ICON.coins+fmtFull(rw.coins)+'</li><li>'+ICON.pp+fmtFull(rw.pp)+'</li>'+rw.drops.map(d=>'<li>'+DI(d.r,18)+d.n+' '+RARITY[d.r].name+'</li>').join('')+'</ul>');
      row.append(mid);tr.append(row);}
    card.append(tr);card.insertAdjacentHTML('beforeend','<p class="pr-hint">Swipe sideways to see every reward \u2192</p>');const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);
    const nx=tr.querySelector('.pt-row.next')||tr.querySelector('.pt-row:not(.got)');if(nx)setTimeout(()=>{tr.scrollLeft=Math.max(0,nx.offsetLeft-tr.offsetLeft-20);},0);});}
function openRumbler(id){
  const b=BY_ID[id],me=S.owned[id],r=RARITY[b.rarity];
  openSheet(card=>{
    const top=document.createElement('div');top.className='d-top';top.append(thumb(b,getSkin(b,me?me.skin:'classic'),132));
    const info=document.createElement('div');info.className='d-info';
    info.innerHTML='<span class="rpill'+rpc(b.rarity)+'" style="--r:'+r.col+';align-self:flex-start">'+r.name+'</span><h2>'+b.name+'</h2><p class="sub">'+b.role+(me?' · Level '+me.lvl+' · ★ Prestige '+me.prestige:'')+'</p>';
    if(me){const pb=document.createElement('button');pb.className='btn sm chatpins';pb.innerHTML=CHAT_SVG+'<span>Pins</span>';pb.setAttribute('aria-label',b.name+' pins');pb.addEventListener('click',()=>openPinLoadout(id));info.append(pb);}
    top.append(info);card.append(top);
    if(me){const pt=prestigeTier(me.prestige),pr=document.createElement('div');pr.className='proad';
      pr.innerHTML='<div class="pr-head"><b style="color:'+pt.col+'">'+pt.name+' prestige · '+me.prestige+' / '+PRESTIGE_MAX+'</b><span>+1 every win</span></div><div class="pr-bar"><i style="width:'+(me.prestige/PRESTIGE_MAX*100)+'%"></i></div><div class="pr-steps"></div>';
      const steps=pr.querySelector('.pr-steps');for(const m of[50,100,150,200,250]){const rw=PRESTIGE_REWARDS[m],got=me.prestige>=m,d=document.createElement('div');d.className='pr-step'+(got?' got':'');
        if(rw.skin)d.append(thumb(b,getSkin(b,rw.skin),46));else d.insertAdjacentHTML('beforeend','<span class="pr-ico">'+DI(rw.drops[rw.drops.length-1].r,40)+'</span>');
        d.insertAdjacentHTML('beforeend','<b>'+m+'</b><small>'+(rw.skin?esc(getSkin(b,rw.skin).name):'Drops')+'</small>');steps.append(d);}
      pr.setAttribute('role','button');pr.tabIndex=0;pr.insertAdjacentHTML('beforeend','<small class="pr-tap">Tap to see the full prestige track</small>');pr.addEventListener('click',()=>openPrestigeTrack(id));card.append(pr);}
    const st=document.createElement('div');st.className='moves';st.innerHTML=statRows(b,me?me.lvl:1)+'<div><strong>'+b.atkName+':</strong> '+b.atkDesc+'</div><div><strong>Super · '+b.supName+':</strong> '+b.supDesc+'</div>';card.append(st);
    const tryB=document.createElement('button');tryB.className='btn';tryB.innerHTML='Try '+b.name+' <span style="font-family:var(--body);font-weight:800;font-size:12px;opacity:.8">· level '+MAX_LVL+' training</span>';
    tryB.addEventListener('click',()=>{closeSheet();startTrial(id);});
    if(!me&&r.passOnly){
      card.append(tryB);const pb=document.createElement('button');pb.className='btn gold';pb.textContent='Get at Rumble Pass tier '+PASS_TIERS;pb.addEventListener('click',()=>{closeSheet();go('pass');});card.append(pb);
      const p=document.createElement('p');p.className='hint';p.textContent='Rumble Pass Exclusive rumblers can only be earned from the Rumble Pass. '+b.name+' is the reward at the very end of the Rumble Pass track. You\u2019re on tier '+passTier(S.pass.xp)+(S.pass.premium?'.':' and still need to unlock the pass.');card.append(p);return;
    }
    if(!me&&eventLocked(b)){card.append(tryB);const hb=document.createElement('button');hb.className='btn gold';hb.textContent='Unlock in the Halloween event';hb.addEventListener('click',()=>{closeSheet();openHalloween();});card.append(hb);
      card.insertAdjacentHTML('beforeend','<p class="hint">Open '+DARK_DROPS+' Halloween Drops to get '+esc(b.name)+' for free ('+Math.min(DARK_DROPS,S.hw.opened|0)+' / '+DARK_DROPS+' so far). After the event ends you can unlock him with chromos.</p>');return;}
    if(!me){
      card.append(tryB);
      const can=S.chromos>=r.chromos,btn=document.createElement('button');btn.className='btn primary';btn.disabled=!can;btn.innerHTML='Unlock · '+cost('chromos',r.chromos);
      btn.addEventListener('click',()=>{if(!spend('chromos',r.chromos))return;grantRumbler(id);persist();sfx('unlock');toast(b.name+' unlocked!','chromos');closeSheet();renderRumblers();});
      card.append(btn);const p=document.createElement('p');p.className='hint';p.textContent=can?'You have enough chromos.':'You have '+fmtFull(S.chromos)+' of '+fmtFull(r.chromos)+' chromos. Every takedown you score earns '+CHROMOS_PER_KO+'.';card.append(p);return;
    }
    const row=document.createElement('div');row.className='row';
    const sel=document.createElement('button');sel.className='btn green';sel.style.flex='1';sel.textContent=S.selected===id?'Selected':'Use '+b.name;sel.disabled=S.selected===id;
    sel.addEventListener('click',()=>{S.selected=id;persist();sfx('click');closeSheet();go('home');});row.append(sel);
    if(me.lvl<MAX_LVL){const cpp=UP_PP[me.lvl-1],cc=UP_COIN[me.lvl-1],up=document.createElement('button');up.className='btn primary';up.style.flex='1';
      up.innerHTML='Level '+(me.lvl+1)+' · '+cost('pp',cpp)+' '+cost('coins',cc);up.disabled=S.pp<cpp||S.coins<cc;
      up.addEventListener('click',()=>{if(S.pp<cpp||S.coins<cc)return;S.pp-=cpp;S.coins-=cc;me.lvl++;persist();sfx('unlock');toast(b.name+' is now level '+me.lvl,'pp');openRumbler(id);});row.append(up);}
    card.append(row);card.append(tryB);
    if(me.lvl<MAX_LVL){const p=document.createElement('p');p.className='hint';p.textContent='You have '+fmtFull(S.pp)+' power points and '+fmtFull(S.coins)+' coins.';card.append(p);}
    const gr=GEAR[id];
    for(const[kind,list,lv,price,label]of[['g',gr.g,GADGET_LVL,GADGET_COST,'Gadgets'],['s',gr.s,STAR_LVL,STAR_COST,'Star powers']]){
      const sec=document.createElement('div');sec.className='sec-title';sec.innerHTML='<h2>'+label+'</h2><span>'+(me.lvl>=lv?(kind==='g'?'Pick one · 3 uses a match':'Pick one · always on'):'Unlocks at level '+lv)+'</span>';card.append(sec);
      for(const x of list){const owned=(kind==='g'?me.gadgets:me.stars).includes(x.id),eq=(kind==='g'?me.gadget:me.star)===x.id;
        const it=document.createElement('div');it.className='panel';it.style.padding='10px 12px';it.style.gap='6px';
        it.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-family:var(--display);font-weight:400">'+esc(x.name)+'</b>'+(eq?'<span class="tag on">Equipped</span>':owned?'<span class="tag own">Owned</span>':'')+'</div><p class="hint" style="margin:0;color:#ddd8ff">'+esc(x.desc)+'</p>';
        const bt=document.createElement('button');bt.className='btn sm '+(owned?'':'primary');
        if(owned){bt.textContent=eq?'Equipped':'Equip';bt.disabled=eq;bt.addEventListener('click',()=>{if(kind==='g')me.gadget=x.id;else me.star=x.id;persist();sfx('click');openRumbler(id);});}
        else{bt.innerHTML=me.lvl>=lv?'Buy · '+cost('coins',price):'Reach level '+lv;bt.disabled=me.lvl<lv||S.coins<price;bt.addEventListener('click',()=>{if(!spend('coins',price))return;(kind==='g'?me.gadgets:me.stars).push(x.id);if(kind==='g'&&!me.gadget)me.gadget=x.id;if(kind==='s'&&!me.star)me.star=x.id;persist();toast(x.name+' bought','coins');openRumbler(id);});}
        it.append(bt);card.append(it);}
    }
    const ss=document.createElement('div');ss.className='sec-title';ss.innerHTML='<h2>Skins</h2><span>'+me.skins.length+' / '+skinsOf(b).length+' owned</span>';card.append(ss);
    const sr=document.createElement('div');sr.className='skinrow';
    for(const sk of skinsOf(b)){const owned=me.skins.includes(sk.id);if(!owned&&(sk.tier==='rank'||sk.tier==='master')){const k=RANK_SETS.findIndex(x=>x.skin.id===sk.id);if(rankSetRumbler(k,rankSeed(S))!==id)continue;}const el=document.createElement('button');el.className='card'+(me.skin===sk.id?' sel':'')+(owned?'':' ');el.style.setProperty('--r',owned?'#3a3380':'#2a2560');
      el.append(thumb(b,sk,72));const dm=owned?null:ALWAYS_SKIN(sk)?1:dailySkinMult(id,sk.id),pr=dm?skinPrice(sk):null;
      el.insertAdjacentHTML('beforeend','<span class="nm">'+esc(sk.name)+'</span>'+(me.skin===sk.id?'<span class="tag on">On</span>':owned?'<span class="tag own">Owned</span>':(pr?'<span class="tag">'+(pr.gems!=null?ICON.gems+Math.ceil(pr.gems*dm):pr.coins!=null?ICON.coins+fmt(pr.coins):ICON.pp+fmt(pr.pp))+'</span>':!earnOnly(sk)&&sk.tier!==0?'<span class="tag" style="opacity:.75">Not in shop</span>':'<span class="tag on">'+(sk.tier==='master'?'Master':sk.tier==='rank'?'Ranked':sk.tier==='prestige'?'★'+sk.prestige:sk.tier==='solar'?'Solar':sk.tier==='exclusive'?'Exclusive':sk.tier==='halloween'?'Halloween':'Pass')+'</span>')));
      el.addEventListener('click',()=>{if(owned){me.skin=sk.id;persist();sfx('click');openRumbler(id);}else if(pr)buySkin(id,sk.id,dm,()=>openRumbler(id));
      else if(!earnOnly(sk)){openSheet(c2=>{c2.insertAdjacentHTML('beforeend','<h2>'+esc(sk.name+' '+b.name)+'</h2><p class="sub">This skin isn\u2019t in the shop today. Skins can only be bought when they show up in Daily skins, which change every day.</p>');const pv=document.createElement('div');pv.className='d-set';pv.append(thumb(b,sk,130));c2.append(pv);const t=document.createElement('button');t.className='btn primary';t.textContent='Try this skin in training';t.addEventListener('click',()=>startTrial(id,sk.id));const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openRumbler(id));c2.append(t,x);});}else if(sk.tier==='solar')openSolars();else if(sk.tier==='exclusive'&&EX_BY_SKIN[sk.id])openExclusive(EX_BY_SKIN[sk.id],()=>openRumbler(id));else if(sk.tier==='prestige'){openPrestigeTrack(id);}
      else{const rk=sk.tier==='master'||sk.tier==='rank',rs=rk?RANK_SETS.find(x=>x.skin.id===sk.id):null,how=rk?(rs.idx===0?'Play a ranked match to get it.':'Reach '+(rs.key==='master'?'Master':rs.name+' I')+' in ranked to unlock it.'):sk.tier==='halloween'?skinHow(b,sk)[0]+'.':'It comes from the Rumble Pass.',hw=sk.tier==='halloween';
        openSheet(c2=>{c2.insertAdjacentHTML('beforeend','<h2>'+esc(sk.name+' '+b.name)+'</h2><p class="sub">'+how+'</p>');const pv=document.createElement('div');pv.className='d-set';pv.append(thumb(b,sk,130));c2.append(pv);
          const t=document.createElement('button');t.className='btn primary';t.textContent='Try this skin in training';t.addEventListener('click',()=>startTrial(id,sk.id));
          const g=document.createElement('button');g.className='btn';g.textContent=rk?'Go to Ranked':hw?'Go to Halloween':'Go to Rumble Pass';g.addEventListener('click',()=>{if(hw){openHalloween();return;}closeSheet();go(rk?'ranked':'pass');});if(hw&&!halloweenOn())g.hidden=true;
          const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openRumbler(id));c2.append(t,g,x);});}});sr.append(el);}
    card.append(sr);
    const close=document.createElement('button');close.className='btn';close.textContent='Close';close.addEventListener('click',closeSheet);card.append(close);
  });
}
function addTryBtn(id,skId){const card=$('#sheetCard');if(!card||$('#sheet').hidden)return;const t=document.createElement('button');t.className='btn';t.textContent='Try this skin in training';t.addEventListener('click',()=>startTrial(id,skId));card.append(t);}
function buySkin(id,skId,mult,after){
  const b=BY_ID[id],sk=getSkin(b,skId),pr=skinPrice(sk),m=mult||1;
  setTimeout(()=>addTryBtn(id,skId),0);confirmBuy(sk.name+' '+b.name,thumb(b,sk,110),['gems','coins','pp'].filter(k=>pr[k]!=null).map(k=>[k,Math.ceil(pr[k]*m)]),()=>{
    const me=S.owned[id];grantSkinPin(id,skId);if(me){if(!me.skins.includes(skId))me.skins.push(skId);me.skin=skId;}else grantSkin(id,skId);if(sk.set&&!S.pins.includes(sk.set)){S.pins.push(sk.set);toast('Set bonus: the '+sk.name+' pin is yours too','gems');}if(m<1)S.daily.bought.push(id+':'+skId);persist();sfx('unlock');toast(sk.name+' '+b.name+' is yours','gems');if(after)after();});
}

/* ---------- Settings ---------- */
function applyTheme(){const hw=S.theme==='halloween'||(!S.theme&&halloweenOn());if(document.body&&document.body.classList)document.body.classList.toggle('hw-theme',hw);else return;
  let d=document.getElementById('hwDeco');if(hw&&!d){d=document.createElement('div');d.id='hwDeco';d.setAttribute('aria-hidden','true');
    let bats='';for(let i=0;i<5;i++)bats+='<svg class="hwbat" style="--d:'+(14+i*5)+'s;--y:'+(8+i*9)+'%;--dl:-'+(i*4)+'s;--s:'+(.6+((i*37)%5)*.12)+'" viewBox="0 0 60 30"><path d="M30 12c-3-6-8-8-14-6 3 2 4 5 3 8-3-2-8-2-11 0 3 1 5 4 5 7 4-3 10-3 14 0 1-3 2-4 3-4s2 1 3 4c4-3 10-3 14 0 0-3 2-6 5-7-3-2-8-2-11 0-1-3 0-6 3-8-6-2-11 0-14 6z" fill="#120a20"/></svg>';
    let houses='<svg class="hwcity" viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 120V70h30V50l15-15 15 15v20h25V40h10V30h20v10h10v80h15V60l20-20 20 20v60h20V55h35v-15l10-12 10 12v15h20v65h25V75l18-18 18 18v45h25V45h30v75z" fill="#0f0820"/>';
    for(const[x,y]of[[40,60],[95,55],[110,75],[160,80],[225,70],[262,62],[300,90],[340,70],[370,60],[385,85]])houses+='<rect x="'+x+'" y="'+y+'" width="6" height="8" fill="#ff8a1f" opacity=".85"><animate attributeName="opacity" values=".85;.4;.85" dur="'+(2+(x%5))+'s" repeatCount="indefinite"/></rect>';
    houses+='</svg>';d.innerHTML='<div class="hwmoon"></div>'+bats+houses+'<div class="hwfog"></div>';$('#app').prepend(d);}
  if(d)d.hidden=!hw;}
function renderSettings(){renderName();{const orr=$('#orientRow');if(orr){orr.innerHTML='';for(const[id,nm]of[['auto','Auto'],['portrait','Portrait'],['landscape','Landscape']]){const b=document.createElement('button');b.className='tpill'+((S.orient||'auto')===id?' on':'');b.textContent=nm;b.addEventListener('click',()=>{S.orient=id;persist();applyOrient();renderSettings();toast(id==='auto'?'Matches follow how you hold your phone':'Matches will play in '+nm.toLowerCase());});orr.append(b);}}}{const fs=$('#findSwitch');if(fs)fs.setAttribute('aria-checked',S.findByName?'true':'false');}applyTheme();{const tr=$('#themeRow');if(tr){tr.innerHTML='';for(const[id,nm]of[['halloween','Halloween'],['default','Default']]){const b=document.createElement('button');b.className='tpill'+((S.theme||(halloweenOn()?'halloween':'default'))===id?' on':'');b.textContent=nm;b.addEventListener('click',()=>{S.theme=id;persist();renderSettings();});tr.append(b);}}}$('#invSwitch').setAttribute('aria-checked',S.invitesOn!==false?'true':'false');$('#voiceSwitch').setAttribute('aria-checked',S.voice?'true':'false');{const tr=$('#trackRow');tr.innerHTML='';for(const[id,nm]of SONGS.map(x=>[x.id,x.name]).concat([['shuffle','Shuffle']])){const b=document.createElement('button');b.className='tpill'+((S.musicTrack||(halloweenOn()?'spooky':'bounce'))===id?' on':'');b.textContent=nm;b.addEventListener('click',()=>{secretTap('sec_dj',8,8000);S.musicTrack=id;persist();pickSong(false);MUS.next=0;if(!S.music){S.music=true;}ensureAC();renderSettings();});tr.append(b);}}$('#musSwitch').setAttribute('aria-checked',S.music?'true':'false');$('#sndSwitch').setAttribute('aria-checked',S.sound?'true':'false');$('#shakeSwitch').setAttribute('aria-checked',S.shake?'true':'false');}
$('#voiceSwitch').addEventListener('click',()=>{S.voice=!S.voice;persist();renderSettings();if(S.voice)speakLine('Let\u2019s rumble!',BY_ID[S.selected]);});
$('#musSwitch').addEventListener('click',()=>{S.music=!S.music;persist();renderSettings();if(S.music)ensureAC();});
$('#sndSwitch').addEventListener('click',()=>{S.sound=!S.sound;persist();renderSettings();if(S.sound)sfx('click');});
$('#shakeSwitch').addEventListener('click',()=>{S.shake=!S.shake;persist();renderSettings();});
let resetArmed=0;
$('#codeCopy').addEventListener('click',()=>{const code=saveCode(),out=$('#codeOut');out.value=code;out.focus();out.select();let ok=false;
  try{ok=document.execCommand('copy');}catch(e){}if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(()=>toast('Save code copied! Keep it somewhere safe.'),()=>{if(!ok)toast('Select the code in the box and copy it.');});else toast(ok?'Save code copied! Keep it somewhere safe.':'Select the code in the box and copy it.');});
let codeArmed=0;
function applySaveCode(raw,msgEl,btn){const r=readCode(raw);if(r.err){msgEl.textContent=r.err;msgEl.style.color='#ff8a80';return false;}
  if(btn&&!codeArmed){codeArmed=setTimeout(()=>{codeArmed=0;btn.textContent='Load save code';},4000);btn.textContent='Tap again to replace your progress';msgEl.textContent='Code looks good: '+esc(r.save.name)+', '+fmtFull(r.save.trophies)+' trophies, '+Object.keys(r.save.owned).length+' rumblers.';msgEl.style.color='';return false;}
  clearTimeout(codeArmed);codeArmed=0;S=r.save;S.onboarded=true;persist();ensureDaily();sfx('unlock');toast('Welcome back, '+esc(S.name)+'! Your progress is loaded.');if(btn)btn.textContent='Load save code';msgEl.textContent='';go('home');return true;}
$('#codeLoad').addEventListener('click',e=>applySaveCode($('#codeIn').value,$('#codeMsg'),e.currentTarget));
$('#resetBtn').addEventListener('click',e=>{const btn=e.currentTarget;
  if(!resetArmed){resetArmed=setTimeout(()=>{resetArmed=0;btn.textContent='Reset progress';},3000);btn.textContent='Tap again to reset';return;}
  clearTimeout(resetArmed);resetArmed=0;S=defaultSave();persist();btn.textContent='Reset progress';toast('Progress reset. Ember is waiting for you.');openOnboarding();renderSettings();});

/* ---------- Player name ---------- */
const nameCost=()=>60*Math.pow(2,S.nameChanges||0);
function fmtLeft(ms){const h=Math.ceil(ms/3600000);return h>=24?Math.floor(h/24)+'d '+(h%24)+'h':h+'h';}
const cleanName=x=>String(x).normalize('NFC').replace(/\s+/g,' ').trim();
/* Name filter: blocks rude words, even with l33t spelling, spaces or dots in between */
const BAD_WORDS=['sex','fuck','fuk','fck','shit','bitch','btch','cunt','dick','cock','pussy','asshole','dumbass','bastard','slut','whore','nigg','niga','fag','retard','rape','rapist','penis','vagina','porn','sexy','nude','boob','tits','nazi','hitler','twat','wank','piss','kys','killyourself','suicide','jizz','cum','dildo','anal','pedo','molest','kkk'];
const BAD_OK=['essex','sussex','wessex','middlesex','sextant','sexton','sextet','scum','cumber','cucumber','document','circum','peacock','hancock','hitchcock','dickens','analys','canal','banal','grape','drape','scrape','therapist','skyscraper','cockpit','shitake','shiitake','pisstol','spiss','cumul','accum'];
function badName(x){let t=String(x).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
  const raw=t.replace(/[^a-z]/g,'');for(const ok of BAD_OK)t=t.split(ok).join('_');
  t=t.replace(/[0@4]/g,m=>m==='0'?'o':'a').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/[5$]/g,'s').replace(/7/g,'t').replace(/8/g,'b').replace(/[^a-z_]/g,'').replace(/(.)\1{2,}/g,'$1$1');
  const t2=t.replace(/_/g,'');const tc=t.replace(/(.)\1+/g,'$1');return BAD_WORDS.some(w=>t.includes(w)||(!/(.)\1/.test(w)&&tc.includes(w))||(w.length>=4&&t2.includes(w)&&!BAD_OK.some(o=>raw.includes(o))));}
const safeName=x=>badName(x)?'Player':String(x).slice(0,20);
/* Party chat filter: blocks links, emails, phone numbers and rude words (also spelled with spaces like "b a d") */
function chatFilter(s){s=String(s||'').replace(/[\u0000-\u001f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,80);
  s=s.replace(/(https?:\/\/|www\.)\S*/gi,'***').replace(/\S+\.(com|net|org|gg|io|co|uk|ie|me|tv|app|xyz|ly|be|link)\b\S*/gi,'***').replace(/\S+@\S+/g,'***').replace(/\d[\d ().+-]{5,}\d/g,'***');
  const w=s.split(' ');for(let i=0;i<w.length;){if(w[i].length===1){let j=i,acc='';while(j<w.length&&w[j].length===1){acc+=w[j];j++;}if(acc.length>=3&&badName(acc))for(let k=i;k<j;k++)w[k]='*';i=j;}else i++;}
  return w.map(x=>x!=='*'&&x!=='***'&&badName(x)?'*'.repeat(Math.min(6,x.length)):x).join(' ');}
function checkName(a,b){a=cleanName(a);b=cleanName(b);if(a.length<3)return 'Names need at least 3 characters.';if(badName(a))return 'That name isn\u2019t allowed. Please pick a friendly one.';if(a.length>14)return 'Names can be up to 14 characters.';
  if(!/^[\p{L}\p{N} _.\-]+$/u.test(a))return 'Use letters, numbers, spaces, dots, dashes or underscores.';if(a!==b)return 'The two names don’t match. Type it exactly the same both times.';return '';}
function renderName(){const left=(S.nameLockUntil||0)-Date.now();$('#nameVal').textContent=S.name;$('#nameBtn').disabled=left>0;
  $('#nameHint').textContent=left>0?'You can change it again in '+fmtLeft(left)+'. The next change costs '+nameCost()+' gems.':'Changing your name costs '+nameCost()+' gems. After a change, you have to wait 2 days and the price doubles.';}
function nameForm(card,btnHtml,btnCls,onOk){
  /* A plain button, not a <form>: some app views block form submission, so the submit event never fires */
  const f=document.createElement('div');f.className='onb-form';
  const inp=(id,label,ph)=>'<div class="field"><label class="lbl" for="'+id+'">'+label+'</label><input class="inp" id="'+id+'" type="text" maxlength="14" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="'+(id==='nmNew'?'next':'done')+'"'+(ph?' placeholder="'+ph+'"':'')+'></div>';
  f.innerHTML=inp('nmNew','Name','3 to 14 characters')+inp('nmConf','Type it again to confirm','')+'<p class="onb-err" id="nmErr" role="alert"></p><button class="btn '+btnCls+'" type="button" id="nmGo">'+btnHtml+'</button>';
  const n1=f.querySelector('#nmNew'),n2=f.querySelector('#nmConf'),err=f.querySelector('#nmErr');
  const go=()=>{const e=checkName(n1.value,n2.value);err.textContent=e;if(!e)onOk(cleanName(n1.value));};
  f.querySelector('#nmGo').addEventListener('click',go);
  n1.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();n2.focus();}});
  n2.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
  [n1,n2].forEach(x=>x.addEventListener('input',()=>{err.textContent='';}));
  card.append(f);setTimeout(()=>{try{n1.focus();}catch(e){}},50);return f;}
$('#nameBtn').addEventListener('click',()=>{
  if((S.nameLockUntil||0)>Date.now())return;const c=nameCost();
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Change name</h2><p class="sub">Right now you’re <b>'+esc(S.name)+'</b>. This change costs '+c+' gems (you have '+fmtFull(S.gems)+'). Afterwards you can’t change it again for 2 days, and the next change costs '+(c*2)+' gems.</p>');
    nameForm(card,'Change for '+cost('gems',c),'green',nm=>{if(nm===S.name){$('#nmErr').textContent='That’s already your name.';return;}if(!spend('gems',c))return;
      S.name=nm;S.nameChanges=(S.nameChanges||0)+1;S.nameLockUntil=Date.now()+2*864e5;persist();closeSheet();toast('You’re now '+esc(nm),'gems');renderSettings();});
    const x=document.createElement('button');x.className='btn';x.textContent='Cancel';x.addEventListener('click',closeSheet);card.append(x);});
});
$('#tutBtn').addEventListener('click',()=>openOnboarding(true));

/* ---------- Halloween: tokens, the haunted estate, tricks, and Dark ---------- */
const KNOCK_TXT={skin:'gave you a skin!',drop:'gave you a Rumble Drop!',gdrop:'gave you a guaranteed drop!',hskin:'gave you a Halloween skin!',hpin:'gave you a Halloween pin!',spooky:'gave you a Halloween Drop!',coins:'gave you coins!',pp:'gave you power points!'};
function tokenSvg(s){return '<svg viewBox="0 0 40 40" width="'+s+'" height="'+s+'"><circle cx="20" cy="20" r="18" fill="#ff8a1f" stroke="#1a0b10" stroke-width="3"/><circle cx="20" cy="20" r="13" fill="none" stroke="#ffd23f" stroke-width="2" stroke-dasharray="3 3"/><path d="M13 17l4 0-2-4zM27 17l-4 0 2-4zM12 23h16l-3 5h-10z" fill="#1a0b10"/></svg>';}
function darkSilhouette(size){const cv=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);cv.width=cv.height=Math.round(size*d);cv.style.width=cv.style.height=size+'px';const c=cv.getContext('2d');c.scale(d,d);
  const R=size*.3,x=size/2,y=size*.46;c.fillStyle='#07040c';c.strokeStyle='#3a2a55';c.lineWidth=Math.max(1.5,R*.09);c.beginPath();c.ellipse(x,y,R*.86,R*.95,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(x-R*.86,y);c.lineTo(x+R*.86,y);c.stroke();return cv;}
function darkBoxCanvas(size){const cv=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1),W2=size,H2=size*1.08;cv.width=Math.round(W2*d);cv.height=Math.round(H2*d);cv.style.width=W2+'px';cv.style.height=H2+'px';const c=cv.getContext('2d');c.scale(d,d);
  const b=BY_ID.dark,own=!!S.owned.dark,cx=W2/2;let seen=false,born=Date.now();
  /* a mech "transformer" crate: two armour halves slide apart, a purple reactor core glows, pistons pump, Dark waits inside */
  function half(s){c.beginPath();c.moveTo(cx,H2*.15);c.lineTo(cx+s*W2*.26,H2*.15);c.lineTo(cx+s*W2*.4,H2*.27);c.lineTo(cx+s*W2*.4,H2*.76);c.lineTo(cx+s*W2*.3,H2*.88);c.lineTo(cx,H2*.88);c.lineTo(cx,H2*.7);c.lineTo(cx+s*W2*.15,H2*.61);c.lineTo(cx+s*W2*.15,H2*.36);c.lineTo(cx,H2*.28);c.closePath();}
  function draw(){const t=performance.now()/1000,op=(Math.sin(t*1.3)+1)/2,gap=W2*(.015+op*.06);c.clearRect(0,0,W2,H2);c.lineJoin='round';c.lineCap='round';
    const ag=c.createRadialGradient(cx,H2*.5,W2*.05,cx,H2*.5,W2*.55);ag.addColorStop(0,'rgba(157,92,255,'+(.3+op*.3)+')');ag.addColorStop(1,'rgba(157,92,255,0)');c.fillStyle=ag;c.fillRect(0,0,W2,H2);
    const cg=c.createRadialGradient(cx,H2*.49,2,cx,H2*.49,W2*.25);cg.addColorStop(0,'#f1e6ff');cg.addColorStop(.35,'#a066ff');cg.addColorStop(1,'#14082a');c.fillStyle=cg;c.fillRect(cx-W2*.3,H2*.25,W2*.6,H2*.5);
    if(b){c.save();c.beginPath();c.rect(cx-W2*.3,H2*.25,W2*.6,H2*.5);c.clip();drawFighter(c,cx,H2*.5,W2*.13,b,getSkin(b,own?(S.owned.dark.skin||'classic'):'classic'),Math.PI/2,t,{noShadow:true,tint:own?null:'rgba(8,4,18,.85)'});c.restore();}
    for(const s of[-1,1]){const px=cx+s*(W2*.44+gap);c.fillStyle='#d6dbea';c.fillRect(px-W2*.014,H2*.22-op*H2*.05,W2*.028,H2*.12);c.lineWidth=2;c.strokeStyle=OUT;c.strokeRect(px-W2*.014,H2*.22-op*H2*.05,W2*.028,H2*.12);
      c.fillStyle='#7a8098';rrect(c,px-W2*.045,H2*.32,W2*.09,H2*.38,5);c.fill();c.lineWidth=3;c.stroke();c.fillStyle='#ffd23f';c.fillRect(px-W2*.03,H2*.62,W2*.06,H2*.04);}
    for(const s of[-1,1]){c.save();c.translate(s*gap,0);half(s);const pg=c.createLinearGradient(0,H2*.15,0,H2*.88);pg.addColorStop(0,'#69718c');pg.addColorStop(.45,'#3a4058');pg.addColorStop(1,'#1c1f2e');c.fillStyle=pg;c.fill();
      c.save();half(s);c.clip();c.fillStyle='rgba(255,255,255,.12)';c.fillRect(cx-W2*.5,H2*.15,W2,H2*.05);
      for(let k=-6;k<14;k++){c.fillStyle=k%2?'#ffd23f':'#1a1420';c.beginPath();const x=cx-W2*.5+k*W2*.06;c.moveTo(x,H2*.88);c.lineTo(x+W2*.06,H2*.88);c.lineTo(x+W2*.11,H2*.8);c.lineTo(x+W2*.05,H2*.8);c.closePath();c.fill();}
      c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=2;c.beginPath();c.moveTo(cx+s*W2*.2,H2*.2);c.lineTo(cx+s*W2*.35,H2*.32);c.lineTo(cx+s*W2*.35,H2*.72);c.moveTo(cx+s*W2*.2,H2*.36);c.lineTo(cx+s*W2*.2,H2*.74);c.stroke();
      c.fillStyle='rgba(180,140,255,'+(.45+.55*op)+')';rrect(c,cx+s*W2*.25-W2*.03,H2*.42,W2*.06,H2*.2,3);c.fill();c.restore();
      c.lineWidth=4;c.strokeStyle=OUT;half(s);c.stroke();
      c.fillStyle='#c9cfe0';for(const[bx,by]of[[.22,.2],[.36,.3],[.36,.7],[.24,.82]]){c.beginPath();c.arc(cx+s*W2*bx,H2*by,W2*.018,0,TAU);c.fill();c.lineWidth=1.5;c.stroke();}c.restore();}
    c.save();c.translate(cx,H2*.1);c.beginPath();c.moveTo(-W2*.14,H2*.05);c.lineTo(0,-H2*.06);c.lineTo(W2*.14,H2*.05);c.closePath();c.fillStyle='#4a5068';c.fill();c.lineWidth=3;c.strokeStyle=OUT;c.stroke();
      c.fillStyle='rgba(200,160,255,'+(.6+.4*op)+')';c.beginPath();c.moveTo(-W2*.07,H2*.02);c.lineTo(0,-H2*.02);c.lineTo(W2*.07,H2*.02);c.lineTo(0,H2*.01);c.closePath();c.fill();c.restore();
    rrect(c,W2*.14,H2*.9,W2*.72,H2*.09,6);c.fillStyle='#ffd23f';c.fill();c.lineWidth=3;c.strokeStyle=OUT;c.stroke();c.fillStyle='#2b1400';c.font='900 '+(W2*.07)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(own?'UNLOCKED':'NEW RUMBLER',cx,H2*.945);
    if(cv.isConnected)seen=true;if(seen&&!cv.isConnected)return;if(!seen&&Date.now()-born>5000)return;requestAnimationFrame(draw);}
  draw();return cv;}
function openHalloween(){openSheet(card=>{const tk=tokensLeft(),kl=knocksLeft(),into=(S.hw.wins|0)%KNOCK_EVERY,doors=hwDoors();
  card.classList.add('hwcard');
  card.insertAdjacentHTML('beforeend','<h2 class="hw-title">Trick or Treat!</h2><div class="hw-top"><div class="hw-stat"><small>Wins</small><b>'+(S.hw.wins|0)+'</b></div><button class="hw-token'+(tk>0?' ready':'')+'" id="hwToken">'+tokenSvg(52)+'<b>'+tk+'</b><small>Halloween token'+(tk===1?'':'s')+'</small></button><div class="hw-stat"><small>Knocks</small><b>'+kl+'</b></div></div>'+
    '<div class="hw-knocks"><span class="tbar"><i style="width:'+(into/KNOCK_EVERY*100)+'%"></i></span><small>'+into+' / '+KNOCK_EVERY+' wins to the next token · tap a token to spend it on a Halloween Drop or a door knock</small></div>');
  card.querySelector('#hwToken').addEventListener('click',()=>{if(tokensLeft()<=0){toast('Win '+(KNOCK_EVERY-into)+' more to earn a token');return;}openTokenChoice();});
  const est=document.createElement('div');est.className='estate';est.innerHTML='<div class="est-moon"></div><div class="est-fog"></div>';const g=document.createElement('div');g.className='hw-doors';est.append(g);card.append(est);
  doors.forEach((id,i)=>{const b=BY_ID[id],d=document.createElement('button');d.className='house h'+(i%3)+(kl>0?' ready':'');d.disabled=kl<=0;
    d.innerHTML='<span class="roof"></span><span class="win w1"></span><span class="win w2"></span><span class="hw-door"><span class="hw-peek"></span><span class="hw-panel"><i class="hw-knob"></i></span></span><small>'+esc(b.name)+'’s house</small>';d.querySelector('.hw-peek').append(thumb(b,getSkin(b,'classic'),52));
    d.addEventListener('click',()=>{const res=knockDoor(i);if(!res)return;sfx('thud');d.classList.add('open');g.querySelectorAll('.house').forEach(x=>x.disabled=true);
      setTimeout(()=>{if(res.kind==='trick'){openTrick(b);return;}sfx('unlock');let what=KNOCK_TXT[res.kind];if(res.kind==='skin')what='gave you '+esc(getSkin(BY_ID[res.id],res.skid).name)+' '+esc(BY_ID[res.id].name)+'!';else if(res.kind==='pin')what='gave you the '+esc(pinName(res.pin))+' pin!';else if(res.kind==='gdrop')what='gave you a guaranteed '+dropName(res.r)+'!';else if(res.kind==='spooky')what='gave you a '+dropName(res.r)+'!';else if(res.kind==='coins'||res.kind==='pp')what='gave you '+fmtFull(res.n)+' '+CUR_NAME[res.kind]+'!';
        openSheet(c2=>{c2.classList.add('hwcard');c2.insertAdjacentHTML('beforeend','<h2 class="hw-title">Treat!</h2>');const w=document.createElement('div');w.className='hw-reveal';w.append(thumb(b,getSkin(b,'classic'),90));
          if(res.kind==='skin'){const rb=BY_ID[res.id];w.append(thumb(rb,getSkin(rb,res.skid),110));}else if(res.kind==='pin')w.append(pinCanvas('b:'+res.pin,100));else if(res.kind==='coins'||res.kind==='pp')w.insertAdjacentHTML('beforeend','<span class="hw-cur">'+ICON[res.kind].replace('<svg','<svg width="80" height="80"')+'</span>');else w.append(dropCanvas(res.r||'rare',100));c2.append(w);
          c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center"><b>'+esc(b.name)+'</b> '+what+'</p>');hwBackBtns(c2);});},650);});
    g.append(d);});
  /* two special houses side by side: the taped-off Dead Inside house (Grim Dark) and the Happy House (Surged Dark) */
  const sr=document.createElement('div');sr.className='special-row';g.append(sr);
  const darkReveal=(sid,title,cls,txt)=>{sfx('unlock');const b=BY_ID.dark;openSheet(c2=>{c2.classList.add('hwcard');c2.insertAdjacentHTML('beforeend','<h2 class="hw-title '+cls+'">'+title+'</h2>');
    const w=document.createElement('div');w.className='hw-reveal';w.append(thumb(b,getSkin(b,sid),150));c2.append(w);c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">'+txt+'</p>');hwBackBtns(c2);});};
  {const got=hasSkin('dark','hw_grim'),dn=S.hw.dead|0,d=document.createElement('button');d.className='house dead'+(kl>0?' ready':'');d.disabled=kl<=0;
    d.innerHTML='<span class="roof"></span><span class="dsign">DEAD INSIDE</span><span class="win w1 boarded"></span><span class="win w2 red"></span><span class="hw-door"><span class="hw-peek"></span><span class="hw-panel"><i class="hw-knob"></i></span></span><span class="tape t1"></span><span class="tape t2"></span><span class="tape t3"></span><small>'+(got?'Grim Dark found!':'5% · '+dn+'/'+DEAD_PITY)+'</small>';
    d.querySelector('.hw-peek').append(darkSilhouette(52));
    d.addEventListener('click',()=>{const res=knockDoor(-1);if(!res)return;sfx('thud');d.classList.add('open');g.querySelectorAll('.house').forEach(x=>x.disabled=true);
      setTimeout(()=>{if(res.kind==='grim'){darkReveal('hw_grim','GRIM DARK','grim-t','Something in the Dead Inside house was waiting for you… Grim Dark: a ghost-green spectral scythe, haunted trails, a rising-from-the-grave spawn, a soul-stealing takedown, a full pin set and a profile icon. Halloween only, never in the shop.');return;}
        if(res.kind==='trick'){openTrick({name:'Something inside'});return;}sfx('unlock');let what=KNOCK_TXT[res.kind];if(res.kind==='skin')what='gave you '+esc(getSkin(BY_ID[res.id],res.skid).name)+' '+esc(BY_ID[res.id].name)+'!';else if(res.kind==='pin')what='gave you the '+esc(pinName(res.pin))+' pin!';else if(res.kind==='gdrop')what='gave you a guaranteed '+dropName(res.r)+'!';else if(res.kind==='spooky')what='gave you a '+dropName(res.r)+'!';else if(res.kind==='coins'||res.kind==='pp')what='gave you '+fmtFull(res.n)+' '+CUR_NAME[res.kind]+'!';
        openSheet(c2=>{c2.classList.add('hwcard');c2.insertAdjacentHTML('beforeend','<h2 class="hw-title">Treat…?</h2>');const w=document.createElement('div');w.className='hw-reveal';w.append(darkSilhouette(90));
          if(res.kind==='skin'){const rb=BY_ID[res.id];w.append(thumb(rb,getSkin(rb,res.skid),110));}else if(res.kind==='pin')w.append(pinCanvas('b:'+res.pin,100));else if(res.kind==='coins'||res.kind==='pp')w.insertAdjacentHTML('beforeend','<span class="hw-cur">'+ICON[res.kind].replace('<svg','<svg width="80" height="80"')+'</span>');else w.append(dropCanvas(res.r||'rare',100));c2.append(w);
          c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">Something inside '+what+(hasSkin('dark','hw_grim')?'':' <br><small>No Grim Dark this time ('+(S.hw.dead|0)+' / '+DEAD_PITY+')</small>')+'</p>');hwBackBtns(c2);});},650);});
    sr.append(d);}
  {const got=hasSkin('dark','hw_surged'),kn=Math.min(HAPPY_KNOCKS,S.hw.knocked|0),ready=happyReady(),d=document.createElement('button');d.className='house happy'+(ready?' ready':'')+(got?' done':'');d.disabled=!ready;
    d.innerHTML='<span class="roof"></span><span class="hsign">HAPPY HOUSE</span><span class="win w1 sun"></span><span class="win w2 heart"></span><span class="hw-door"><span class="hw-peek"></span><span class="hw-panel"><i class="hw-knob"></i></span></span><span class="balloon b1"></span><span class="balloon b2"></span>'+(ready||got?'':'<span class="hlock">🔒</span>')+'<small>'+(got?'Surged Dark found!':ready?'Knock now! (free)':kn+'/'+HAPPY_KNOCKS+' knocks')+'</small>';
    {const b=BY_ID.dark;d.querySelector('.hw-peek').append(thumb(b,getSkin(b,'hw_surged'),52));}
    d.addEventListener('click',()=>{const res=knockHappy();if(!res)return;sfx('thud');d.classList.add('open');g.querySelectorAll('.house').forEach(x=>x.disabled=true);
      setTimeout(()=>darkReveal('hw_surged','SURGED DARK!','surged-t','You knocked on '+HAPPY_KNOCKS+' doors, so the Happy House opened up! Surged Dark: rainbow body, a rainbow lightsaber, rainbow trails, a custom spawn and takedown effect, a full pin set and a profile icon. Halloween only, never in the shop.'),650);});
    if(!ready&&!got)d.addEventListener('pointerdown',()=>toast('The Happy House opens after '+HAPPY_KNOCKS+' knocks on any doors ('+kn+' so far)'));
    sr.append(d);}
  /* Dark: open 15 Halloween drops to unlock him for free */
  const op=Math.min(DARK_DROPS,S.hw.opened|0),own=!!S.owned.dark,db=document.createElement('div');db.className='darkbox';
  db.insertAdjacentHTML('beforeend','<span class="of-kick">New Halloween rumbler</span><h2>Dark</h2>');const bw=document.createElement('div');bw.className='db-art';bw.append(darkBoxCanvas(150));db.append(bw);
  db.insertAdjacentHTML('beforeend','<p class="db-need">'+(own?'Dark is yours!':op>=DARK_DROPS?'You opened '+DARK_DROPS+' Halloween Drops. Claim Dark!':'Open <b>'+(DARK_DROPS-op)+'</b> more Halloween Drop'+(DARK_DROPS-op===1?'':'s')+' to unlock Dark for free')+'</p><p class="db-count">'+op+' / '+DARK_DROPS+' opened</p>');
  const sl=document.createElement('div');sl.className='db-slots';for(let i=0;i<DARK_DROPS;i++){const s=document.createElement('span');s.append(i<op?dropCanvas(SPOOKY[i%3],40):darkSilhouette(40));sl.append(s);}db.append(sl);
  if(!own&&op>=DARK_DROPS){const cb=document.createElement('button');cb.className='btn gold';cb.textContent='Claim Dark';cb.addEventListener('click',()=>{if(claimDark()){sfx('unlock');toast('Dark joined your rumblers, wearing the exclusive Pumpkin Reaper skin!','chromos');openHalloween();}});db.append(cb);}
  const tb=document.createElement('button');tb.className='btn';tb.textContent='See Dark’s abilities';tb.addEventListener('click',()=>openRumbler('dark'));db.append(tb);
  db.insertAdjacentHTML('beforeend','<p class="hint" style="margin:0">Dark can’t be bought with chromos until the Halloween event ends.</p>');card.append(db);
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',()=>{closeSheet();renderTiles();});card.append(x);});}
function hwBackBtns(c2){const again=document.createElement('button');again.className='btn gold';again.textContent=knocksLeft()>0?'Knock again':tokensLeft()>0?'Spend a token':'Back to the street';again.addEventListener('click',openHalloween);
  const done=document.createElement('button');done.className='btn';done.textContent='Done';done.addEventListener('click',()=>{closeSheet();renderTiles();});c2.append(again,done);}
function openTokenChoice(){openSheet(card=>{card.classList.add('hwcard');card.insertAdjacentHTML('beforeend','<h2 class="hw-title">Spend a token</h2><p class="sub" style="text-align:center">You have '+tokensLeft()+' Halloween token'+(tokensLeft()===1?'':'s')+'. Pick one reward:</p>');
  const row=document.createElement('div');row.className='hw-choice';
  const a=document.createElement('button');a.className='hw-opt';a.append(dropCanvas(pick(SPOOKY),90));a.insertAdjacentHTML('beforeend','<b>Halloween Drop</b><small>Pumpkin, Skeleton or Zombie. Counts toward Dark.</small>');
  const b=document.createElement('button');b.className='hw-opt';b.insertAdjacentHTML('beforeend','<span class="hw-mini-door"><i></i></span><b>1 Door knock</b><small>Knock on a house. Treat… or trick?</small>');
  a.addEventListener('click',()=>{const r=spendToken('drop');if(r){sfx('unlock');toast(dropName(r.r)+' added! Open it from Play','drop');openHalloween();}});
  b.addEventListener('click',()=>{const r=spendToken('knock');if(r){sfx('unlock');toast('+1 knock! Pick a house','gems');openHalloween();}});
  row.append(a,b);card.append(row);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',openHalloween);card.append(x);});}
/* Trick! Catch 6 ghosts in 8 seconds to earn another knock */
function openTrick(who){openSheet(card=>{card.classList.add('hwcard');sfx('thud');
  card.insertAdjacentHTML('beforeend','<h2 class="hw-title">TRICK!</h2><p class="sub" style="text-align:center">'+esc(who.name)+' played a trick on you! Tap <b>6 ghosts</b> in 8 seconds to win another knock.</p><div class="trick-hud"><b id="trkN">0 / 6</b><span id="trkT">8.0s</span></div>');
  const area=document.createElement('div');area.className='trick-area';card.append(area);let got=0,left=8,over=false;
  const spawn=()=>{if(over)return;const gh=document.createElement('button');gh.className='trick-ghost';gh.textContent='👻';gh.style.left=(8+Math.random()*78)+'%';gh.style.top=(8+Math.random()*70)+'%';
    gh.addEventListener('pointerdown',e=>{e.preventDefault();if(over)return;got++;sfx('pop');gh.remove();$('#trkN').textContent=got+' / 6';if(got>=6)end(true);else spawn();});area.append(gh);setTimeout(()=>{if(gh.isConnected&&!over){gh.remove();spawn();}},1100);};
  spawn();setTimeout(spawn,400);
  const iv=setInterval(()=>{left=Math.max(0,left-.1);const t=$('#trkT');if(t)t.textContent=left.toFixed(1)+'s';if(left<=0)end(false);},100);
  function end(win){if(over)return;over=true;clearInterval(iv);if(S.st){if(win)S.st.tricksW++;else S.st.tricksL++;}if(win){S.hw.knocks++;persist();sfx('unlock');if(left>=4)setTimeout(()=>findSecret('sec_buster'),1400);}
    setTimeout(()=>openSheet(c2=>{c2.classList.add('hwcard');c2.insertAdjacentHTML('beforeend','<h2 class="hw-title">'+(win?'You beat the trick!':'Spooked!')+'</h2><p class="sub" style="text-align:center">'+(win?'You caught all 6 ghosts. +1 door knock!':'The ghosts got away this time.')+'</p>');hwBackBtns(c2);}),300);}});}

applyTheme();

/* ---------- Credits ---------- */
$('#creditsBtn').addEventListener('click',()=>{sfx('click');openSheet(card=>{card.classList.add('credits');
  const bk=document.createElement('button');bk.className='btn sm cr-back';bk.innerHTML='← Back';bk.addEventListener('click',closeSheet);card.append(bk);
  card.insertAdjacentHTML('beforeend','<div class="cr-crown"><svg viewBox="0 0 120 90" width="150" height="112"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="1.8s" repeatCount="indefinite"/>'+
    '<path d="M14 78 8 22l28 24 24-38 24 38 28-24-6 56z" fill="#ffd23f" stroke="#120f26" stroke-width="5" stroke-linejoin="round"/><rect x="12" y="74" width="96" height="12" rx="4" fill="#ffb000" stroke="#120f26" stroke-width="5"/>'+
    '<circle cx="60" cy="52" r="9" fill="#ff3b30" stroke="#120f26" stroke-width="3"><animate attributeName="fill" values="#ff3b30;#ff7a7a;#ff3b30" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="32" cy="60" r="5" fill="#5ec8ff" stroke="#120f26" stroke-width="2.5"/><circle cx="88" cy="60" r="5" fill="#6be39a" stroke="#120f26" stroke-width="2.5"/></g>'+
    '<path d="M100 8l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff"><animate attributeName="opacity" values="1;.1;1" dur="1.1s" repeatCount="indefinite"/></path><path d="M16 4l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"><animate attributeName="opacity" values=".1;1;.1" dur="1.4s" repeatCount="indefinite"/></path></svg></div>'+
    '<p class="cr-role">In-game name</p><h2 class="cr-name">Geo</h2><p class="cr-ign">Name: <b>Lucas</b></p><p class="cr-role">Game creator · designer of every rumbler, mode and event</p>'+
    '<div class="cr-co"><div class="cr-crown2"><svg viewBox="0 0 120 90" width="92" height="69"><path d="M14 78 8 22l28 24 24-38 24 38 28-24-6 56z" fill="#ffd23f" stroke="#120f26" stroke-width="5" stroke-linejoin="round"/><rect x="12" y="74" width="96" height="12" rx="4" fill="#ffb000" stroke="#120f26" stroke-width="5"/></svg></div><p class="cr-role">In-game name</p><h2 class="cr-name">cookie ballz</h2><p class="cr-ign">Name: <b>BLANK</b></p><p class="cr-role">Co-owner</p></div>'+
    '<div class="cr-list"><p><b>Rooftop Rumble</b></p><p>Thank you for playing!</p></div>');{const cc=card.querySelector('.cr-crown');if(cc){cc.style.cursor='pointer';cc.addEventListener('click',()=>{sfx('tap');secretTap('sec_royal',5,5000);});}}});});

/* ---------- Profiles ---------- */
function myProfile(){const pres=Object.entries(S.owned).map(([id,v])=>[id,v.prestige|0]).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return{name:S.name,icon:S.icon,code:playerCode(),trophies:S.trophies|0,best:S.best|0,coins:S.coins|0,pp:S.pp|0,wins:S.wins|0,rank:rankInfo(S.rp).name,rumblers:Object.keys(S.owned).length,pres,sol:S.sol|0,pf:pfMine(),exs:EXCLUSIVE_SKINS.filter(exOwned).map(e=>e.skin.id)};}
/* frame wrapper around a profile icon */
function pfFramed(icon,fid,size){const fr=pfItem('frame',fid),w=document.createElement('span');w.className='pf-frame'+(fr.css?' on':'');if(fr.css){w.style.background=fr.css;if(fr.glow)w.style.boxShadow='0 0 14px '+fr.glow;}w.append(iconCanvas(icon||'r:ember',size));return w;}
/* the banner header: icon in its frame, coloured name, title, code and showcase rumbler */
function pfHeader(pr,mine){const pf=pr.pf||{},bn=pfItem('banner',pf.banner),tt=pfItem('title',pf.title),nc=pfItem('ncol',pf.ncol);
  const top=document.createElement('div');top.className='pf-top';top.style.background=bn.css;
  const ic=document.createElement(mine?'button':'div');ic.className='pf-icon';ic.append(pfFramed(pr.icon,pf.frame,84));if(mine){ic.setAttribute('aria-label','Change profile icon');ic.addEventListener('click',openIconPicker);}top.append(ic);
  const mn=document.createElement('div');mn.className='pf-main';mn.innerHTML='<b class="pf-name"'+(mine?' role="button" tabindex="0"':'')+' style="'+nc.css+'">'+esc(safeName(pr.name||'Player'))+'</b><span class="pf-title">'+esc(tt.name)+'</span>'+((pr.sol|0)>0?'<span class="pf-sol'+((pr.sol|0)>SOLAR_STEPS?' soldar':'')+'">'+((pr.sol|0)>SOLAR_STEPS?'\ud83d\udc51 ':'\u2600\ufe0f ')+esc(solStepName(Math.min(SOLDAR_STEP,pr.sol|0)))+'</span>':'')+'<span class="pf-code">Code <b>'+esc(pr.code||'------')+'</b></span>';top.append(mn);
  const sh=pf.show,sb=sh&&BY_ID[sh[0]];if(sb){const d=document.createElement('div');d.className='pf-show';d.append(thumb(sb,getSkin(sb,sh[1]),74));top.append(d);}
  if(mine)top.addEventListener('click',e=>{if(e.target.closest('.pf-name')){sfx('tap');secretTap('sec_name',5,5000);}});return top;}
function openProfile(pr,mine){pr=pr||myProfile();openSheet(card=>{card.classList.add('profile');
  card.append(pfHeader(pr,mine));
  if(mine){const cz=document.createElement('button');cz.className='btn sm primary pf-cz';cz.innerHTML='🎨 Customize profile';cz.addEventListener('click',()=>{sfx('click');openCustomize('banner');});card.append(cz);}
  card.insertAdjacentHTML('beforeend','<div class="pf-troph">'+ICON.trophies+'<b>'+fmtFull(pr.trophies|0)+'</b><small>trophies · best '+fmtFull(pr.best|0)+'</small></div>'+
    '<div class="pf-grid"><span>'+ICON.coins+'<b>'+fmtFull(pr.coins|0)+'</b><small>coins</small></span><span>'+ICON.pp+'<b>'+fmtFull(pr.pp|0)+'</b><small>power points</small></span><span>'+ICON.rp+'<b>'+esc(pr.rank||'Bronze I')+'</b><small>rank</small></span><span>🏆<b>'+fmtFull(pr.wins|0)+'</b><small>wins</small></span></div>');
  {const exs=(pr.exs||[]).filter(x=>EX_BY_SKIN[x]);const h=document.createElement(mine?'button':'h3');h.className='pf-h pf-exh';h.innerHTML='<span>Exclusive skins</span><small>'+exs.length+' / '+EXCLUSIVE_SKINS.length+(mine?' ›':'')+'</small>';if(mine)h.addEventListener('click',()=>{sfx('click');openExclusives(()=>openProfile(null,true));});card.append(h);
    const ex=document.createElement('div');ex.className='pf-pres pf-ex';if(!exs.length)ex.innerHTML='<p class="sub" style="grid-column:1/-1;margin:0">'+(mine?'None yet — tap above to see how to earn them.':'None yet.')+'</p>';
    for(const sid of exs){const e=EX_BY_SKIN[sid],b=BY_ID[e.rid],d=document.createElement('div');d.append(thumb(b,getSkin(b,sid),48));d.insertAdjacentHTML('beforeend','<b>'+esc(e.skin.name)+'</b>');ex.append(d);}card.append(ex);}
  card.insertAdjacentHTML('beforeend','<h3 class="pf-h">Prestige</h3>');
  const pl=document.createElement('div');pl.className='pf-pres';for(const[id,n]of(pr.pres||[])){const b=BY_ID[id];if(!b)continue;const d=document.createElement('div');d.append(thumb(b,getSkin(b,'classic'),48));d.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b><small style="color:'+prestigeTier(n).col+'">★ '+n+'</small>');pl.append(d);}if(!pl.children.length)pl.innerHTML='<p class="sub" style="grid-column:1/-1;margin:0">No prestige yet.</p>';card.append(pl);
  if(mine){const cp=document.createElement('button');cp.className='btn sm';cp.textContent='Copy my player code';cp.addEventListener('click',()=>{try{navigator.clipboard.writeText(playerCode());toast('Code copied: '+playerCode());}catch(e){toast('Your code: '+playerCode());}});card.append(cp);}
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}
/* ---------- customize: banner, frame, title, name colour, showcase ---------- */
const CZ_TABS=[['banner','Banner'],['frame','Frame'],['title','Title'],['ncol','Name color'],['show','Showcase']];
function pfSet(k,v){S.pf=S.pf||{};S.pf[k]=v;persist();renderHome();if(typeof netHello==='function')netHello();}
function openCustomize(tab){tab=tab||'banner';openSheet(card=>{card.classList.add('profile');card.insertAdjacentHTML('beforeend','<h2>Customize profile</h2>');
  const pv=pfHeader(myProfile(),false);pv.classList.add('pf-prev');card.append(pv);
  const tabs=document.createElement('div');tabs.className='trackrow cz-tabs';for(const[k,nm]of CZ_TABS){const b=document.createElement('button');b.className='tpill'+(k===tab?' on':'');b.textContent=nm;b.addEventListener('click',()=>{sfx('tap');openCustomize(k);});tabs.append(b);}card.append(tabs);
  const g=document.createElement('div');g.className='cz-grid cz-'+tab;const cur=pfMine();
  if(tab==='show'){const none=document.createElement('button');none.className='cz-cell'+(!cur.show?' on':'');none.innerHTML='<span class="cz-none">—</span><b>None</b>';none.addEventListener('click',()=>{pfSet('show',null);sfx('click');openCustomize(tab);});g.append(none);
    for(const id of Object.keys(S.owned)){const b=BY_ID[id],me=S.owned[id],c=document.createElement('button');c.className='cz-cell'+(cur.show&&cur.show[0]===id&&cur.show[1]===me.skin?' on':'');c.append(thumb(b,getSkin(b,me.skin),56));c.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b>');
      c.addEventListener('click',()=>{pfSet('show',[id,me.skin]);sfx('click');openCustomize(tab);});g.append(c);}
    card.insertAdjacentHTML('beforeend','<p class="sub">Show off one rumbler on your profile, wearing the skin it has on right now. Change its skin first to show a different one.</p>');}
  else{const list=PF_KINDS[tab];let got=0;
    for(const it of list){const has=pfHas(tab,it.id);if(has)got++;const c=document.createElement('button');c.className='cz-cell'+(cur[tab]===it.id?' on':'')+(has?'':' locked');
      if(tab==='banner'){const sw=document.createElement('span');sw.className='cz-sw';sw.style.background=it.css;c.append(sw);}
      else if(tab==='frame')c.append(pfFramed(S.icon,it.id,48));
      else if(tab==='title')c.insertAdjacentHTML('beforeend','<span class="pf-title">'+esc(it.name)+'</span>');
      else c.insertAdjacentHTML('beforeend','<span class="cz-nm" style="'+it.css+'">'+esc(safeName(S.name))+'</span>');
      c.insertAdjacentHTML('beforeend',(tab==='title'?'':'<b>'+esc(it.name)+'</b>')+(has?'':'<small>🔒 '+esc(it.how||'')+'</small>'));
      c.addEventListener('click',()=>{if(!has){sfx('tap');toast(it.how||'Locked');return;}pfSet(tab,it.id);sfx('click');openCustomize(tab);});g.append(c);}
    card.insertAdjacentHTML('beforeend','<p class="sub">'+got+' of '+list.length+' unlocked. Locked ones show how to get them.</p>');}
  card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Back to profile';x.addEventListener('click',()=>openProfile(null,true));card.append(x);});}
/* ---------- exclusive skins ---------- */
function exBar(e){const v=Math.min(exProgress(e),e.goal);return'<div class="ex-bar"><i style="width:'+Math.round(v/e.goal*100)+'%"></i><span>'+fmtFull(v)+' / '+fmtFull(e.goal)+'</span></div>';}
function openExclusives(back){openSheet(card=>{card.classList.add('exsheet');card.insertAdjacentHTML('beforeend','<h2>Exclusive skins</h2><p class="sub">You can’t buy these or find them in boxes. Each one is earned by doing something special. '+exCount()+' of '+EXCLUSIVE_SKINS.length+' earned.</p>');
  const g=document.createElement('div');g.className='ex-list';
  for(const e of EXCLUSIVE_SKINS){const b=BY_ID[e.rid],sk=getSkin(b,e.skin.id),own=exOwned(e),d=document.createElement('button');d.className='ex-row'+(own?' own':'');d.append(thumb(b,sk,64));
    d.insertAdjacentHTML('beforeend','<div><b>'+esc(sk.name+' '+b.name)+'</b><small>'+esc(e.how)+'</small>'+(own?'<span class="ex-got">✔ Earned'+(S.owned[e.rid]?'':' · unlock '+esc(b.name)+' to wear it')+'</span>':exBar(e))+'</div>');
    d.addEventListener('click',()=>{sfx('click');openExclusive(e,()=>openExclusives(back));});g.append(d);}
  card.append(g);const x=document.createElement('button');x.className='btn';x.textContent=back?'Back':'Close';x.addEventListener('click',()=>back?back():closeSheet());card.append(x);});}
function openExclusive(e,back){const b=BY_ID[e.rid],sk=getSkin(b,e.skin.id),own=exOwned(e);openSheet(card=>{card.classList.add('exsheet');
  card.insertAdjacentHTML('beforeend','<p class="of-kick ex-kick">Exclusive skin</p><h2 style="text-align:center">'+esc(sk.name+' '+b.name)+'</h2>');const pv=document.createElement('div');pv.className='d-set ex-pv';pv.append(thumb(b,sk,140));card.append(pv);
  card.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">'+esc(e.how)+'. Never in the shop.</p>'+(own?'<p class="ex-got" style="text-align:center">✔ You earned this one!</p>':exBar(e)));
  if(own&&S.owned[e.rid]){const q=document.createElement('button');q.className='btn gold';q.textContent=S.owned[e.rid].skin===sk.id?'Wearing it':'Wear it';q.disabled=S.owned[e.rid].skin===sk.id;q.addEventListener('click',()=>{S.owned[e.rid].skin=sk.id;persist();sfx('click');toast(sk.name+' '+b.name+' equipped');openExclusive(e,back);});card.append(q);}
  const t=document.createElement('button');t.className='btn primary';t.textContent='Try it in training';t.addEventListener('click',()=>startTrial(e.rid,sk.id));card.append(t);
  const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>back?back():closeSheet());card.append(x);});}
let exShowing=false;
function exRevealNext(){if(exShowing||!S.exNew||!S.exNew.length||view!=='home'||!sheetEl.hidden||M)return;const sid=S.exNew.shift();persist();const e=EX_BY_SKIN[sid];if(!e)return exRevealNext();const b=BY_ID[e.rid],sk=getSkin(b,sid);exShowing=true;sfx('unlock');
  openSheet(card=>{card.classList.add('exsheet','exreveal');card.insertAdjacentHTML('beforeend','<p class="of-kick ex-kick">Exclusive skin unlocked!</p><h2 style="text-align:center">'+esc(sk.name+' '+b.name)+'</h2>');const w=document.createElement('div');w.className='ex-burst';w.append(thumb(b,sk,150));card.append(w);
    card.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">You did it: '+esc((e.how.charAt(0).toLowerCase()+e.how.slice(1)).replace(/ \(.*\)$/,''))+'! Only players who did that have this skin.'+(S.owned[e.rid]?'':' Unlock '+esc(b.name)+' to wear it.')+'</p>');
    const done=()=>{exShowing=false;closeSheet();setTimeout(exRevealNext,350);};
    if(S.owned[e.rid]){const q=document.createElement('button');q.className='btn gold';q.textContent='Wear it now';q.addEventListener('click',()=>{S.owned[e.rid].skin=sid;persist();renderHome();done();});card.append(q);}
    const x=document.createElement('button');x.className='btn';x.textContent='Awesome!';x.addEventListener('click',done);card.append(x);});}
function openIconPicker(){openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Profile icon</h2><p class="sub">Unlock more with rumblers, trophies (250, 500, then every 500 up to 5,000), ranked (one for each rank you reach), special skins and Rumbler Boxes.</p>');const g=document.createElement('div');g.className='icon-grid';
  const own=ownedIcons(),all=Object.keys(S.owned).map(id=>'r:'+id).concat(TROPHY_ICONS.map(n=>'t:'+n),[0,1,2,3,4,5,6,7].map(t=>'k:'+t),SPECIAL_ICONS.map(x=>'x:'+x[0]),SECRET_PINS.map(p=>'z:'+p[0]),SOLAR_LEVELS.flatMap((_,i)=>['o:'+(i+1),'o:'+(i+1)+'a']).concat(['o:11','o:11a']));
  for(const id of [...new Set(own.concat(all))]){const has=own.includes(id),b=document.createElement('button');b.className='icon-cell'+(S.icon===id?' on':'')+(has?'':' locked');b.append(iconCanvas(id,60));if(!has)b.insertAdjacentHTML('beforeend','<i>\ud83d\udd12</i><small>'+(id[0]==='t'?fmtFull(+id.split(':')[1])+' trophies':id[0]==='k'?'Reach '+(+id[2]>=7?'Master':TIERS[+id[2]][0]):id[0]==='z'?'Secret':id[0]==='o'?(parseInt(id.slice(2))>SOLAR_MAX?'Soldar':esc(SOLAR_LEVELS[(parseInt(id.slice(2))||1)-1].name)+(/a$/.test(id)?' II':' I')):'Rumbler Box')+'</small>');
    if(!has)b.addEventListener('click',()=>{sfx('tap');secretTap('sec_lock',8,6000);b.animate&&b.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:180});});
    if(has)b.addEventListener('click',()=>{S.icon=id;persist();sfx('click');renderHome();openProfile(null,true);if(typeof netHello==='function')netHello();});g.append(b);}
  card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openProfile(null,true));card.append(x);});}
$('#meIcon').addEventListener('click',()=>{sfx('click');openProfile(null,true);});
$('#meName').addEventListener('click',()=>{sfx('click');openProfile(null,true);});
$('#findSwitch').addEventListener('click',()=>{S.findByName=!S.findByName;persist();renderSettings();if(typeof netHello==='function')netHello();toast(S.findByName?'Friends can find you by name or code':'Friends can only find you by your player code');});

/* secret hooks: poke your rumbler, shake the phone, count coins, wish at 11:11 */
prev.addEventListener('click',()=>{if(view!=='home')return;secretTap('sec_dizzy',15,7000);prev.animate&&prev.animate([{transform:'rotate(0)'},{transform:'rotate(-6deg)'},{transform:'rotate(6deg)'},{transform:'rotate(0)'}],{duration:220});});
{let sh=[];window.addEventListener('devicemotion',e=>{if(view!=='home'||!S||S.pins.includes('sec_quake'))return;const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const m=Math.hypot(a.x||0,a.y||0,a.z||0);if(m>24){const now=Date.now();sh=sh.filter(t=>now-t<1600);if(!sh.length||now-sh[sh.length-1]>120)sh.push(now);if(sh.length>=4){sh=[];findSecret('sec_quake');}}});}
document.addEventListener('click',e=>{const pl=e.target.closest&&e.target.closest('.pill');if(pl&&/^coins/i.test(pl.getAttribute('aria-label')||''))secretTap('sec_wallet',10,6000);});
setInterval(()=>{try{const d=new Date();if(d.getHours()%12===11&&d.getMinutes()===11&&view!=='game')findSecret('sec_clock');}catch(e){}},15000);

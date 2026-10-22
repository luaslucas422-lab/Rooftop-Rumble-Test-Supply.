
/* ================= Solar: 10 levels x 3 steps, bought with chromos once you own every rumbler ================= */
if(S.solV!==2){S.sol=Math.min(SOLAR_STEPS,(S.sol|0)*3);S.solV=2;}
S.sol=clamp(S.sol|0,0,SOLAR_STEPS);
const SOL_PF=[[1,'title','t_spark'],[3,'title','t_sun'],[5,'banner','b_solar'],[6,'ncol','n_solar'],[7,'frame','f_solar'],[9,'title','t_eclipse'],[10,'title','t_fame'],[10,'ncol','n_fame']];
const SOL_KIND={banner:'banner',frame:'icon frame',title:'title',ncol:'name color'};
const solOpen=()=>RUMBLERS.every(b=>S.owned[b.id]);
const solCash=L=>({gems:25+L*15,coins:1000*L,pp:400*L});
/* what step i (0-based) gives you */
function solRewards(i){const L=Math.floor(i/3)+1,k=i%3,name=SOLAR_LEVELS[L-1].name,out=[];
  if(k===0){out.push({label:name+' Sun pin',vis:s=>pinCanvas('b:sol'+L,s)},{label:name+' profile icon',vis:s=>iconCanvas('o:'+L,s)});}
  else if(k===1){const m=solCash(L);out.push({label:'+'+m.gems+' gems',vis:s=>{const d=document.createElement('span');d.className='sol-cur';d.style.width=d.style.height=s+'px';d.innerHTML=ICON.gems;return d;}},
    {label:'+'+fmtFull(m.coins)+' coins & +'+fmtFull(m.pp)+' power points',vis:s=>{const d=document.createElement('span');d.className='sol-cur';d.style.width=d.style.height=s+'px';d.innerHTML=ICON.coins;return d;}},
    {label:'Animated '+name+' Sun pin',vis:s=>pinCanvas('b:sol'+L+'a',s)},{label:'Animated '+name+' icon',vis:s=>iconCanvas('o:'+L+'a',s)});}
  else{for(const x of SOLAR_SKINS)if(x.lv===L){const b=BY_ID[x.rid];out.push({label:x.skin.name+' '+b.name+' skin',vis:s=>thumb(b,getSkin(b,x.skin.id),s)});}
    for(const[l,kd,id]of SOL_PF)if(l===L){const it=pfItem(kd,id);out.push({label:'“'+it.name+'” '+SOL_KIND[kd],vis:s=>{const d=document.createElement('span');d.className='sol-pf sol-pf-'+kd;d.style.width=d.style.height=s+'px';
      if(kd==='banner')d.style.background=it.css;else if(kd==='frame'){d.style.background=it.css;d.append(iconCanvas(S.icon||'r:ember',s-10));}else if(kd==='ncol')d.innerHTML='<b style="'+it.css+'">Aa</b>';else d.textContent='🏷️';return d;}});}}
  return out;}
function solGrant(i,cash){const L=Math.floor(i/3)+1,k=i%3;
  if(k===0){if(!S.pins.includes('sol'+L))S.pins.push('sol'+L);}
  else if(k===1){if(!S.pins.includes('sol'+L+'a'))S.pins.push('sol'+L+'a');if(cash){const m=solCash(L);S.gems+=m.gems;S.coins+=m.coins;S.pp+=m.pp;}}
  else for(const x of SOLAR_SKINS)if(x.lv===L)grantSkin(x.rid,x.skin.id);}
function solSetStep(v){v=clamp(v|0,0,SOLAR_STEPS);for(let i=S.sol|0;i<v;i++)solGrant(i,false);S.sol=v;persist();try{renderHome();}catch(e){}}
const solSetLevel=v=>solSetStep(v*3);
function solLevelUp(){const n=S.sol|0;if(n>=SOLAR_STEPS)return;if(!solOpen()){toast('Unlock every rumbler to start Solar');return;}const cost=solCost(n);
  if(S.chromos<cost){sfx('tap');toast('You need '+fmtFull(cost-S.chromos)+' more chromos','chromos');return;}
  if(!spend('chromos',cost))return;solGrant(n,true);S.sol=n+1;persist();try{renderHome();}catch(e){}solReveal(n);}
function solReveal(i){const L=Math.floor(i/3)+1,k=i%3,fame=L>=SOLAR_MAX&&k===2;sfx('unlock');openSheet(card=>{card.classList.add('sol','sol-reveal'+(fame?' fame':''));
  card.insertAdjacentHTML('beforeend','<p class="of-kick sol-kick">'+(fame?'You made it!':'Solar step '+(i+1)+' of '+SOLAR_STEPS)+'</p><h2 style="text-align:center">'+esc(solStepName(i+1))+(fame?'!':'')+'</h2>');
  const w=document.createElement('div');w.className='ex-burst sol-burst';w.append(solarCanvas(L,150,true));card.append(w);
  const rl=document.createElement('div');rl.className='sol-rlist';for(const r of solRewards(i)){const d=document.createElement('div');d.append(r.vis(40));d.insertAdjacentHTML('beforeend','<span>'+esc(r.label)+'</span>');rl.append(d);}card.append(rl);
  if(fame)card.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">You reached the very top of Solar. Only the most dedicated players ever get here.</p>');
  const x=document.createElement('button');x.className='btn gold';x.textContent='Awesome!';x.addEventListener('click',openSolars);card.append(x);});}
function openSolars(){const n=S.sol|0,open=solOpen(),L=Math.max(1,Math.ceil(n/3));openSheet(card=>{card.classList.add('sol');
  const head=document.createElement('div');head.className='sol-head';head.append(n?solarCanvas(L,104,true):solarCanvas(0,104));
  head.insertAdjacentHTML('beforeend','<div><p class="of-kick sol-kick">☀️ Solar</p><h2>'+esc(solStepName(n))+'</h2><small>'+(n>=SOLAR_STEPS?'Max level reached':'Step '+n+' of '+SOLAR_STEPS)+'</small><span class="sol-bal">'+ICON.chromos+fmtFull(S.chromos)+' chromos</span></div>');card.append(head);
  card.insertAdjacentHTML('beforeend','<p class="sub">Solar is for players who have <b>every rumbler</b>. Spend chromos to climb 10 levels, each with 3 steps: <b>I</b> gives a pin and an icon, <b>II</b> gives gems, coins and power points plus an <b>animated</b> pin and icon, and <b>III</b> gives an exclusive skin. The last level is <b>Solar Fame</b>.</p>');
  if(!open){const all=RUMBLERS.length,own=RUMBLERS.filter(b=>S.owned[b.id]).length,c=document.createElement('div');c.className='sol-next sol-lock';
    c.innerHTML='<div class="sol-nt"><b>🔒 Locked</b><small>'+own+' / '+all+' rumblers</small></div><div class="tbar sol-bar"><i style="width:'+Math.round(own/all*100)+'%"></i></div><p class="sol-need">Unlock every rumbler in the game to start Solar.</p>';
    const miss=document.createElement('div');miss.className='sol-miss';for(const b of RUMBLERS.filter(b=>!S.owned[b.id]).slice(0,12)){const t=thumb(b,getSkin(b,'classic'),40);t.classList.add('lockd');t.title=b.name;miss.append(t);}c.append(miss);card.append(c);}
  else if(n<SOLAR_STEPS){const c=document.createElement('div'),cost=solCost(n);c.className='sol-next'+(n+1>=SOLAR_STEPS-2?' fame':'');
    c.innerHTML='<div class="sol-nt"><b>Next: '+esc(solStepName(n+1))+'</b><small>Step '+(n+1)+'</small></div>';const rr=document.createElement('div');rr.className='sol-rw';for(const r of solRewards(n)){const d=document.createElement('div');d.title=r.label;d.append(r.vis(48));d.insertAdjacentHTML('beforeend','<small>'+esc(r.label)+'</small>');rr.append(d);}c.append(rr);
    const b=document.createElement('button');b.className='btn gold';b.innerHTML='Level up · '+ICON.chromos+fmtFull(cost);if(S.chromos<cost)b.classList.add('short');b.addEventListener('click',solLevelUp);c.append(b);
    if(S.chromos<cost)c.insertAdjacentHTML('beforeend','<p class="sol-need">'+fmtFull(cost-S.chromos)+' more chromos needed</p>');card.append(c);}
  else card.insertAdjacentHTML('beforeend','<div class="sol-next fame"><div class="sol-nt"><b>👑 Solar Fame III</b><small>You reached the top!</small></div></div>');
  const tr=document.createElement('div');tr.className='sol-track';
  SOLAR_LEVELS.forEach((Lv,li)=>{const l=li+1,row=document.createElement('div');row.className='sol-row'+(n>=l*3?' got':'')+(n>=l*3-3&&n<l*3?' next':'')+(l===SOLAR_MAX?' fame':'');row.append(solarCanvas(l,46,n>=l*3-1));
    const body=document.createElement('div');body.className='sol-rt';body.innerHTML='<b>'+esc(Lv.name)+'</b>';const steps=document.createElement('div');steps.className='sol-steps';
    for(let k=0;k<3;k++){const i=(l-1)*3+k,got=n>i,st=document.createElement('div');st.className='sol-step'+(got?' got':'')+(i===n&&open?' now':'');st.innerHTML='<i>'+SOL_ROMAN[k]+'</i>';const mini=document.createElement('span');mini.className='sol-mini';
      for(const r of solRewards(i).slice(0,k===1?1:2))mini.append(r.vis(22));st.append(mini);st.insertAdjacentHTML('beforeend','<small>'+(got?'✔':ICON.chromos+fmt(solCost(i)))+'</small>');steps.append(st);}
    body.append(steps);row.append(body);tr.append(row);});
  card.append(tr);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}

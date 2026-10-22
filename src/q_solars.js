
/* ================= Solar: 10 levels you climb with chromos ================= */
S.sol=clamp(S.sol|0,0,SOLAR_MAX);
const SOL_PF=[[1,'title','t_spark'],[3,'title','t_sun'],[5,'banner','b_solar'],[6,'ncol','n_solar'],[7,'frame','f_solar'],[9,'title','t_eclipse'],[10,'title','t_fame'],[10,'ncol','n_fame']];
const SOL_KIND={banner:'banner',frame:'icon frame',title:'title',ncol:'name color'};
function solRewards(lv){const out=[{label:(lv>=SOLAR_MAX?'Solar Fame':'Solar '+lv)+' profile icon',vis:s=>iconCanvas('o:'+lv,s)}];
  for(const x of SOLAR_SKINS)if(x.lv===lv){const b=BY_ID[x.rid];out.push({label:x.skin.name+' '+b.name+' skin',vis:s=>thumb(b,getSkin(b,x.skin.id),s),skin:true});}
  for(const[l,k,id]of SOL_PF)if(l===lv){const it=pfItem(k,id);out.push({label:'“'+it.name+'” '+SOL_KIND[k],vis:s=>{const d=document.createElement('span');d.className='sol-pf sol-pf-'+k;d.style.width=d.style.height=s+'px';
    if(k==='banner')d.style.background=it.css;else if(k==='frame'){d.style.background=it.css;d.append(iconCanvas(S.icon||'r:ember',s-10));}else if(k==='ncol'){d.innerHTML='<b style="'+it.css+'">Aa</b>';}else d.textContent='🏷️';return d;}});}
  return out;}
function solSetLevel(v){v=clamp(v|0,0,SOLAR_MAX);for(let l=(S.sol|0)+1;l<=v;l++)for(const x of SOLAR_SKINS)if(x.lv===l)grantSkin(x.rid,x.skin.id);S.sol=v;persist();try{renderHome();}catch(e){}}
function solLevelUp(){if((S.sol|0)>=SOLAR_MAX)return;const lv=(S.sol|0)+1,cost=SOLAR_LEVELS[lv-1].cost;
  if(S.chromos<cost){sfx('tap');toast('You need '+fmtFull(cost-S.chromos)+' more chromos','chromos');return;}
  if(!spend('chromos',cost))return;solSetLevel(lv);solReveal(lv);}
function solReveal(lv){const L=SOLAR_LEVELS[lv-1],fame=lv>=SOLAR_MAX;sfx('unlock');openSheet(card=>{card.classList.add('sol','sol-reveal'+(fame?' fame':''));
  card.insertAdjacentHTML('beforeend','<p class="of-kick sol-kick">'+(fame?'You made it!':'Solar level '+lv)+'</p><h2 style="text-align:center">'+esc(L.name)+(fame?'!':'')+'</h2>');
  const w=document.createElement('div');w.className='ex-burst sol-burst';w.append(solarCanvas(lv,150));card.append(w);
  const rl=document.createElement('div');rl.className='sol-rlist';for(const r of solRewards(lv)){const d=document.createElement('div');d.append(r.vis(40));d.insertAdjacentHTML('beforeend','<span>'+esc(r.label)+'</span>');rl.append(d);}card.append(rl);
  if(fame)card.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">You reached the very top of Solar. Only the most dedicated players ever get here.</p>');
  const x=document.createElement('button');x.className='btn gold';x.textContent='Awesome!';x.addEventListener('click',openSolars);card.append(x);});}
function openSolars(){const lv=S.sol|0;openSheet(card=>{card.classList.add('sol');
  const head=document.createElement('div');head.className='sol-head';head.append(solarCanvas(lv,104));
  head.insertAdjacentHTML('beforeend','<div><p class="of-kick sol-kick">☀️ Solar</p><h2>'+(lv?esc(SOLAR_LEVELS[lv-1].name):'Not started')+'</h2><small>'+(lv>=SOLAR_MAX?'Max level reached':'Level '+lv+' of '+SOLAR_MAX)+'</small><span class="sol-bal">'+ICON.chromos+fmtFull(S.chromos)+' chromos</span></div>');card.append(head);
  card.insertAdjacentHTML('beforeend','<p class="sub">Spend the chromos you collect to climb 10 Solar levels. Every level gives a profile icon, and some give exclusive skins, banners, frames, titles and name colors. The last level, <b>Solar Fame</b>, costs 200,000 chromos.</p>');
  if(lv<SOLAR_MAX){const nx=SOLAR_LEVELS[lv],c=document.createElement('div');c.className='sol-next'+(lv+1>=SOLAR_MAX?' fame':'');
    c.innerHTML='<div class="sol-nt"><b>Next: '+esc(nx.name)+'</b><small>Level '+(lv+1)+'</small></div>';const rr=document.createElement('div');rr.className='sol-rw';for(const r of solRewards(lv+1)){const d=document.createElement('div');d.title=r.label;d.append(r.vis(48));d.insertAdjacentHTML('beforeend','<small>'+esc(r.label)+'</small>');rr.append(d);}c.append(rr);
    const b=document.createElement('button');b.className='btn gold';b.innerHTML='Level up · '+ICON.chromos+fmtFull(nx.cost);if(S.chromos<nx.cost)b.classList.add('short');b.addEventListener('click',solLevelUp);c.append(b);
    if(S.chromos<nx.cost)c.insertAdjacentHTML('beforeend','<p class="sol-need">'+fmtFull(nx.cost-S.chromos)+' more chromos needed</p>');card.append(c);}
  else card.insertAdjacentHTML('beforeend','<div class="sol-next fame"><div class="sol-nt"><b>👑 Solar Fame</b><small>You reached the top!</small></div></div>');
  const tr=document.createElement('div');tr.className='sol-track';
  SOLAR_LEVELS.forEach((L,i)=>{const l=i+1,row=document.createElement('div');row.className='sol-row'+(l<=lv?' got':'')+(l===lv+1?' next':'')+(l===SOLAR_MAX?' fame':'');row.append(solarCanvas(l,42));
    row.insertAdjacentHTML('beforeend','<div class="sol-rt"><b>'+esc(L.name)+'</b><small>'+(l<=lv?'✔ Reached':ICON.chromos+fmtFull(L.cost))+'</small></div>');const mini=document.createElement('div');mini.className='sol-mini';for(const r of solRewards(l))mini.append(r.vis(30));row.append(mini);tr.append(row);});
  card.append(tr);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}

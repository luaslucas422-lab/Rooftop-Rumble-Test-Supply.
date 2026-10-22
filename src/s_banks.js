
/* ================= Banks: save your stuff, take it out when you need it =================
   One bank each for chromos, coins, power points, gems and drops. Every bank holds up to 100,000 and has its own keeper. */
const BANK_MAX=100000;
const BANKS=[
  {k:'chromos',name:'Chromo Vault',keeper:'Vaulty',rid:'clank',col:'#46b4ff',col2:'#123a6e',hat:'fedora',body:'#7fc4ff',belly:'#e3f4ff',accent:'#ffd23f',lines:['Your chromos are safe with me!','Beep boop. Vault locked tight.','Saving up for something big?','I count every chromo. Twice.']},
  {k:'coins',name:'Coin Bank',keeper:'Penny',rid:'coco',col:'#ffd23f',col2:'#7a4a00',hat:'crown',body:'#ffcf5a',belly:'#fff6d0',accent:'#ff8a1f',lines:['Shiny coins, all in a row!','A coin saved is a coin earned.','Clink clink! Love that sound.','Your piggy bank is my piggy bank.']},
  {k:'pp',name:'Power Bank',keeper:'Sparky',rid:'volta',col:'#b56cff',col2:'#2a1458',hat:'headphones',body:'#c79bff',belly:'#f1e6ff',accent:'#ffe66b',lines:['Fully charged and ready!','Power points stored at 100%.','Zap! Safely saved.','Need a boost? I’ve got you.']},
  {k:'gems',name:'Gem Bank',keeper:'Jewel',rid:'luna',col:'#3fe0a0',col2:'#0f4b3c',hat:'icecrown',body:'#7ff0c2',belly:'#e9fff6',accent:'#ff7ad9',lines:['Every gem polished and safe.','Ooh, sparkly! I’ll guard these.','Gems love a cozy vault.','Not even a speck of dust in here.']},
  {k:'drops',name:'Drop Locker',keeper:'Locksmith',rid:'boulder',col:'#ff8a5c',col2:'#5a1f0a',hat:'hardhat',body:'#c8875a',belly:'#f3d9c2',accent:'#ffd23f',lines:['I’ll keep your drops sealed!','Nobody opens these but you.','Heavy lifting? That’s my job.','Locked, stacked and ready.']}];
const BANK_BY={};for(const b of BANKS)BANK_BY[b.k]=b;
{const o=S.bank&&typeof S.bank==='object'?S.bank:{};S.bank={drops:Array.isArray(o.drops)?o.drops.filter(d=>d&&typeof d==='object'&&(RARITY[d.r]||RARITY[d.min])).slice(0,BANK_MAX):[]};
  for(const b of BANKS)if(b.k!=='drops')S.bank[b.k]=clamp(Math.floor(+o[b.k]||0),0,BANK_MAX);}
const bankHas=k=>k==='drops'?S.bank.drops.length:S.bank[k]|0;
const walletHas=k=>k==='drops'?S.drops.length:S[k]|0;
const dropKey=d=>isSpecialDrop(d.r)?d.r:(d.r||d.min||'rare');
function bankKeeperSkin(bk){const b=BY_ID[bk.rid];return{...getSkin(b,'classic'),body:bk.body,belly:bk.belly,accent:bk.accent,proj:bk.accent,hat:bk.hat,id:'bank_'+bk.k};}
/* the animated bank scene: vault door, the stash inside and the keeper */
function bankScene(bk,w,h,st){const cv=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';cv.className='bank-scene';cv.setAttribute('aria-hidden','true');
  const c=cv.getContext('2d');c.scale(d,d);const b=BY_ID[bk.rid],sk=bankKeeperSkin(bk);st=st||{fx:[]};let seen=false;const born=Date.now();
  const icon=(x,y,s,tm)=>{c.save();c.translate(x,y);c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=Math.max(1.2,s*.16);
    if(bk.k==='coins'){c.beginPath();c.ellipse(0,0,s,s*(.75+.25*Math.abs(Math.cos(tm*3))),0,0,TAU);c.fillStyle='#ffd23f';c.fill();c.stroke();c.fillStyle='#ffb000';c.beginPath();c.ellipse(0,0,s*.55,s*.4,0,0,TAU);c.fill();}
    else if(bk.k==='chromos'){c.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;c.lineTo(Math.cos(a)*s,Math.sin(a)*s);}c.closePath();c.fillStyle='#46b4ff';c.fill();c.stroke();c.fillStyle='#d8f1ff';c.beginPath();c.arc(0,0,s*.38,0,TAU);c.fill();}
    else if(bk.k==='pp'){c.beginPath();c.moveTo(s*.2,-s);c.lineTo(-s*.55,s*.12);c.lineTo(-s*.05,s*.12);c.lineTo(-s*.25,s);c.lineTo(s*.55,-s*.15);c.lineTo(s*.05,-s*.15);c.closePath();c.fillStyle='#c79bff';c.fill();c.stroke();}
    else if(bk.k==='gems'){c.beginPath();c.moveTo(0,-s);c.lineTo(s*.8,-s*.25);c.lineTo(0,s);c.lineTo(-s*.8,-s*.25);c.closePath();c.fillStyle='#3fe0a0';c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.moveTo(0,-s*.75);c.lineTo(s*.35,-s*.25);c.lineTo(0,-s*.1);c.closePath();c.fill();}
    else drawDropPod(c,0,0,s*.95,'#ff8a5c',tm,0);
    c.restore();};
  const draw=tm=>{c.clearRect(0,0,w,h);
    const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,bk.col2);g.addColorStop(1,'#120f26');rrect(c,0,0,w,h,16);c.fillStyle=g;c.fill();
    c.save();rrect(c,0,0,w,h,16);c.clip();
    c.fillStyle='rgba(255,255,255,.05)';for(let x=-h;x<w;x+=26){c.beginPath();c.moveTo(x,h);c.lineTo(x+h,0);c.lineTo(x+h+10,0);c.lineTo(x+10,h);c.closePath();c.fill();}
    /* vault */const vx=w*.68,vy=h*.52,vr=Math.min(h*.38,w*.2),fill=clamp(bankHas(bk.k)/BANK_MAX,0,1);
    c.fillStyle='#2a2560';c.strokeStyle=OUT;c.lineWidth=4;rrect(c,vx-vr*1.25,vy-vr*1.2,vr*2.5,vr*2.4,14);c.fill();c.stroke();
    c.save();c.beginPath();c.arc(vx,vy,vr,0,TAU);c.clip();c.fillStyle='#120f26';c.fillRect(vx-vr,vy-vr,vr*2,vr*2);
    const sh=vr*2*fill;c.fillStyle=bk.col;c.globalAlpha=.85;c.fillRect(vx-vr,vy+vr-sh,vr*2,sh);c.globalAlpha=1;
    for(let i=0;i<Math.round(fill*14);i++){const ix=vx-vr*.7+((i*37)%10)/10*vr*1.4,iy=vy+vr-6-((i*53)%10)/10*Math.max(4,sh-8);icon(ix,iy,vr*.13,tm+i);}c.restore();
    c.beginPath();c.arc(vx,vy,vr,0,TAU);c.lineWidth=6;c.strokeStyle='#8f88c4';c.stroke();c.lineWidth=3;c.strokeStyle=OUT;c.stroke();
    c.save();c.translate(vx+vr*1.02,vy);c.rotate(tm*.8);c.fillStyle='#c9c3ff';c.strokeStyle=OUT;c.lineWidth=2.5;c.beginPath();c.arc(0,0,vr*.2,0,TAU);c.fill();c.stroke();for(let i=0;i<3;i++){c.rotate(TAU/3);c.beginPath();c.moveTo(0,0);c.lineTo(vr*.34,0);c.lineWidth=4;c.stroke();}c.restore();
    c.font='900 '+Math.max(10,vr*.26)+'px system-ui,sans-serif';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle=OUT;c.lineWidth=3;const pct=Math.round(fill*100)+'%';c.strokeText(pct,vx,vy-vr-6);c.fillText(pct,vx,vy-vr-6);
    /* floating sparkles of the bank's stuff */for(let i=0;i<4;i++){const ph=(tm*.25+i*.25)%1;c.save();c.globalAlpha=Math.sin(ph*Math.PI)*.8;icon(w*.08+i*w*.09,h*(.85-ph*.7),6+i%2*2,tm+i);c.restore();}
    /* the keeper */const kx=w*.27,ky=h*.62+Math.sin(tm*3)*3,R=Math.min(h*.24,w*.13);c.fillStyle='rgba(8,6,22,.35)';ell(c,kx,h*.62+R*1.05,R*1.05,R*.28);c.fill();
    try{drawFighter(c,kx,ky,R,b,sk,Math.PI/2+Math.sin(tm*1.3)*.5,tm,{still:false,happy:true});}catch(e){}
    /* money flying in or out after you deposit or withdraw */
    for(let i=st.fx.length-1;i>=0;i--){const f=st.fx[i],q=(tm-f.t0)/.9;if(q>=1){st.fx.splice(i,1);continue;}const x0=f.dir>0?kx:vx,y0=f.dir>0?ky:vy,x1=f.dir>0?vx:kx,y1=f.dir>0?vy:ky,e=q*q*(3-2*q);
      icon(x0+(x1-x0)*e+f.ox,y0+(y1-y0)*e-Math.sin(q*Math.PI)*h*.3,7,tm);}
    c.restore();c.lineWidth=3;c.strokeStyle=OUT;rrect(c,1.5,1.5,w-3,h-3,16);c.stroke();};
  const tick=()=>{if(cv.isConnected)seen=true;else if(seen||Date.now()-born>6000)return;draw(performance.now()/1000);requestAnimationFrame(tick);};tick();cv._st=st;return cv;}
function bankSummary(){const parts=[];for(const b of BANKS){const v=bankHas(b.k);if(v)parts.push(fmt(v)+' '+(b.k==='drops'?'drop'+(v>1?'s':''):CUR_NAME[b.k]));}return parts;}
function openBanks(){openSheet(card=>{card.classList.add('banks');
  card.insertAdjacentHTML('beforeend','<p class="of-kick bank-kick">🏦 Banks</p><h2>Banks</h2><p class="sub">Put things away to keep them safe, and take them out whenever you need them. Each bank holds up to <b>100,000</b>.</p>');
  for(const bk of BANKS){const row=document.createElement('button');row.className='bank-row';row.style.setProperty('--bc',bk.col);row.append(bankScene(bk,132,92));
    const v=bankHas(bk.k);row.insertAdjacentHTML('beforeend','<div><b>'+esc(bk.name)+'</b><small>Keeper: '+esc(bk.keeper)+'</small><span class="bank-bar"><i style="width:'+Math.round(v/BANK_MAX*100)+'%"></i></span><span class="bank-num">'+(bk.k==='drops'?'':ICON[bk.k])+fmtFull(v)+' / '+fmt(BANK_MAX)+'</span></div>');
    row.addEventListener('click',()=>{sfx('click');openBank(bk.k);});card.append(row);}
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}
function openBank(k){const bk=BANK_BY[k],st={fx:[]};openSheet(card=>{card.classList.add('banks','bank-one');card.style.setProperty('--bc',bk.col);
  const back=document.createElement('button');back.className='btn sm';back.textContent='← All banks';back.addEventListener('click',openBanks);card.append(back);
  card.insertAdjacentHTML('beforeend','<h2>'+esc(bk.name)+'</h2>');
  const scene=document.createElement('div');scene.className='bank-stage';const w=Math.min(360,(sheetCard.clientWidth||360)-36);scene.append(bankScene(bk,w,Math.round(w*.56),st));
  const bub=document.createElement('div');bub.className='bank-bubble';bub.innerHTML='<b>'+esc(bk.keeper)+':</b> '+esc(pick(bk.lines));scene.append(bub);card.append(scene);
  const say=t=>{bub.innerHTML='<b>'+esc(bk.keeper)+':</b> '+esc(t);bub.animate&&bub.animate([{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:180});};
  const nums=document.createElement('div');nums.className='bank-nums';card.append(nums);
  const drawNums=()=>{const ic=k==='drops'?'🎁':ICON[k];nums.innerHTML='<div><small>In the bank</small><b>'+ic+fmtFull(bankHas(k))+'</b><span class="bank-bar"><i style="width:'+Math.round(bankHas(k)/BANK_MAX*100)+'%"></i></span><small>max '+fmtFull(BANK_MAX)+'</small></div><div><small>With you</small><b>'+ic+fmtFull(walletHas(k))+'</b></div>';};drawNums();
  const fly=dir=>{const t0=performance.now()/1000;for(let i=0;i<6;i++)st.fx.push({t0:t0+i*.06,dir,ox:(i-3)*4});};
  const done=(dir,n)=>{fly(dir);sfx(dir>0?'buy':'coin');persist();drawNums();renderHome();if(typeof ridUpload==='function')ridUpload(false).catch(()=>{});say(dir>0?'Saved '+fmtFull(n)+(k==='drops'?' drop'+(n>1?'s':''):' '+CUR_NAME[k])+'. Locked away!':'Here you go: '+fmtFull(n)+(k==='drops'?' drop'+(n>1?'s':''):' '+CUR_NAME[k])+'.');};
  if(k==='drops'){const box=document.createElement('div');box.className='bank-drops';card.append(box);
    const drawDrops=()=>{box.innerHTML='';const keys=[...new Set(S.drops.map(dropKey).concat(S.bank.drops.map(dropKey)))];if(!keys.length){box.innerHTML='<p class="sub">You have no drops yet. Win matches to earn some!</p>';return;}
      for(const key of keys){const inB=S.bank.drops.filter(d=>dropKey(d)===key).length,inW=S.drops.filter(d=>dropKey(d)===key).length,r=document.createElement('div');r.className='bank-drop';r.append(dropCanvas(key,40));
        r.insertAdjacentHTML('beforeend','<div><b>'+esc(dropName(key))+'</b><small>'+inW+' with you · '+inB+' in the bank</small></div>');
        const dep=document.createElement('button');dep.className='tpill';dep.textContent='Save all';dep.disabled=!inW||bankHas('drops')>=BANK_MAX;dep.addEventListener('click',()=>{const room=BANK_MAX-bankHas('drops');let n=0;for(let i=S.drops.length-1;i>=0&&n<room;i--)if(dropKey(S.drops[i])===key){S.bank.drops.push(S.drops.splice(i,1)[0]);n++;}if(n)done(1,n);drawDrops();});
        const wd=document.createElement('button');wd.className='tpill';wd.textContent='Take all';wd.disabled=!inB;wd.addEventListener('click',()=>{let n=0;for(let i=S.bank.drops.length-1;i>=0;i--)if(dropKey(S.bank.drops[i])===key){S.drops.push(S.bank.drops.splice(i,1)[0]);n++;}if(n)done(-1,n);drawDrops();});
        r.append(dep,wd);box.append(r);}};drawDrops();}
  else{let amt=Math.min(1000,Math.max(1,walletHas(k)||bankHas(k)||100));const inp=document.createElement('input');inp.type='number';inp.min='1';inp.max=String(BANK_MAX);inp.inputMode='numeric';inp.className='rid-in bank-in';inp.value=String(amt);
    inp.addEventListener('change',()=>{amt=clamp(Math.floor(+inp.value||1),1,BANK_MAX);inp.value=String(amt);});card.append(inp);
    const q=document.createElement('div');q.className='trackrow bank-q';for(const[v,nm]of[[100,'100'],[1000,'1K'],[10000,'10K'],[50000,'50K']]){const b=document.createElement('button');b.className='tpill';b.textContent=nm;b.addEventListener('click',()=>{sfx('tap');amt=v;inp.value=String(v);});q.append(b);}card.append(q);
    const row=document.createElement('div');row.className='bank-acts';
    const dep=document.createElement('button');dep.className='btn gold';dep.textContent='Save in the bank';
    dep.addEventListener('click',()=>{const room=BANK_MAX-bankHas(k),n=Math.min(amt,walletHas(k),room);if(room<=0){sfx('tap');say('The bank is full! It holds '+fmtFull(BANK_MAX)+'.');return;}if(n<=0){sfx('tap');say('You don’t have any '+CUR_NAME[k]+' to save.');return;}S[k]-=n;S.bank[k]+=n;done(1,n);});
    const wd=document.createElement('button');wd.className='btn primary';wd.textContent='Take out';
    wd.addEventListener('click',()=>{const n=Math.min(amt,bankHas(k));if(n<=0){sfx('tap');say('The bank is empty right now.');return;}S.bank[k]-=n;S[k]+=n;done(-1,n);});
    const all1=document.createElement('button');all1.className='btn sm';all1.textContent='Save everything';all1.addEventListener('click',()=>{const n=Math.min(walletHas(k),BANK_MAX-bankHas(k));if(n>0){S[k]-=n;S.bank[k]+=n;done(1,n);}else{sfx('tap');say(bankHas(k)>=BANK_MAX?'The bank is full!':'Nothing to save.');}});
    const all2=document.createElement('button');all2.className='btn sm';all2.textContent='Take everything';all2.addEventListener('click',()=>{const n=bankHas(k);if(n>0){S.bank[k]=0;S[k]+=n;done(-1,n);}else{sfx('tap');say('The bank is empty right now.');}});
    row.append(dep,wd,all1,all2);card.append(row);}
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',()=>{closeSheet();renderHome();});card.append(x);});}

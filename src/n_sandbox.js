
/* ================= SANDBOX MODE (Settings > Experimental) =================
   Its own save, no online play, everything unlocked, and a panel to set anything. Only active when RR_MODE is 'sandbox'. */
var SBX;
SBX=(()=>{let o={};try{o=JSON.parse(localStorage.getItem('rr-sandbox-cfg')||'{}')||{};}catch(e){}
  return Object.assign({god:false,onehit:false,dmg:1,superFull:false,ammo:false,freeze:false,noTimer:false,speed:1,run:1,bots:'auto',hw:null,setup:false},o);})();
function sbxSave(){try{localStorage.setItem('rr-sandbox-cfg',JSON.stringify(SBX));}catch(e){}}
function sbxAllPins(){return[BASIC_PINS,PREMIUM_PINS,PASS_PINS,HALLOWEEN_PINS,TOXIC_PINS,FRIENDLY_PINS,DAILY_ONLY_PINS,GEN_PINS,SECRET_PINS,SEASON_PINS,TROLL_PINS,SET_PINS,RANK_PINS].flat().map(p=>p[0]);}
function sbxMaxRumbler(b){const me=S.owned[b.id]||(S.owned[b.id]=newRumbler());me.lvl=MAX_LVL;const g=GEAR[b.id];
  if(g){me.gadgets=(g.g||[]).map(x=>x.id);me.stars=(g.s||[]).map(x=>x.id);if(!me.gadgets.includes(me.gadget))me.gadget=me.gadgets[0]||null;if(!me.stars.includes(me.star))me.star=me.stars[0]||null;}
  me.skins=skinsOf(b).map(k=>k.id);for(const k of skinsOf(b))grantSkinPin(b.id,k.id);return me;}
function sbxUnlockAll(){for(const b of RUMBLERS)sbxMaxRumbler(b);S.pendingSkins=[];
  for(const id of sbxAllPins())if(!S.pins.includes(id))S.pins.push(id);S.icons=SPECIAL_ICONS.map(x=>x[0]);
  S.masterAll=true;S.hw=S.hw||{};S.hw.darkClaimed=1;S.exNew=[];sbxMaxRes();}
function sbxMaxRes(){S.coins=1000000;S.gems=100000;S.pp=1000000;S.chromos=1000000;}
function sbxFresh(){S=defaultSave();S.onboarded=true;S.name='Sandbox';S.welcomeGift=1;}
/* first time: you have everything */
if(RR_MODE==='sandbox'&&!SBX.setup){try{try{const m=JSON.parse(localStorage.getItem('rooftop-rumble-v2')||'null');if(m&&m.ageBand&&!S.ageBand){S.ageBand=m.ageBand;if(m.ageNum!=null)S.ageNum=m.ageNum;}}catch(e){}S.onboarded=true;if(!S.name||S.name==='You')S.name='Sandbox';S.welcomeGift=1;sbxUnlockAll();S.best=Math.max(S.best|0,5000);S.trophies=Math.max(S.trophies|0,1000);S.road=Math.min(ROAD_MAX,Math.floor(S.best/100));
  S.rp=(RANK_STEPS-1)*100;S.rankPeak=RANK_STEPS-1;S.rankTop=TIERS.length;S.pass=S.pass||{};S.pass.premium=true;S.pass.xp=PASS_TIERS*PASS_STEP;
  for(const r of['ultra','legendary','rbox','sbox'])for(let k=0;k<3;k++)S.drops.push({r,min:null});persist();}catch(e){console.error(e);}SBX.setup=true;sbxSave();}

/* ---------- match cheats: wrap the game's own functions ---------- */
if(RR_MODE==='sandbox'){
const sbxMine=src=>!!(P&&src&&(src===P||src.shadowOf===P||src.owner===P||src.src===P));
{const _hurt=hurt;hurt=function(t,dmg,src,raw){
  if(P&&t===P&&SBX.god)return 0;
  if(P&&t&&t.team!==P.team&&sbxMine(src)){if(SBX.onehit)dmg=Math.max(dmg,(t.hp||0)*4+50);else dmg*=SBX.dmg;}
  return _hurt(t,dmg,src,raw);};}
{const _ai=aiUpdate;aiUpdate=function(u,dt){if(SBX.freeze&&P&&u.team!==P.team)return[0,0];return _ai(u,dt);};}
{const _nm=newMatch;newMatch=function(){const r=_nm.apply(this,arguments);try{if(M&&P&&SBX.bots!=='auto'){const sk=SBX.bots==='hell'?SKILL_HELL:SKILL[SBX.bots];if(sk)for(const u of M.units)if(u.ai&&u.team!==P.team)u.ai.skill=sk;}}catch(e){}return r;};}
{const _up=update;const cheat=()=>{if(!M||!P||P.dead||M.state==='ended'||M.watch)return;
    if(SBX.superFull)P.super=Math.max(P.super,1);if(SBX.ammo){P.ammo=P.maxAmmo;P.gUses=Math.max(P.gUses,3);P.gCd=Math.min(P.gCd,0);}if(SBX.god)P.hp=P.maxHp;
    if(P._sbxSp===undefined){P.mods={...P.mods};P._sbxSp=P.mods.speed||0;}P.mods.speed=(1+P._sbxSp)*SBX.run-1;};
  const step=dt=>{if(!M)return;const t0=M.time;cheat();_up(dt);if(M&&SBX.noTimer&&M.state==='play'&&!M.watch)M.time=t0;};
  update=function(dt){if(SBX.speed>1){step(dt);if(M)step(dt*(SBX.speed-1));}else step(dt*SBX.speed);};}
}

/* ---------- the panel ---------- */
function sbxNum(label,get,set,max,note){const r=document.createElement('div');r.className='sbx-row';r.innerHTML='<label><b>'+label+'</b>'+(note?'<small>'+note+'</small>':'')+'</label>';
  const inp=document.createElement('input');inp.type='number';inp.min='0';inp.max=String(max);inp.inputMode='numeric';inp.value=String(get());
  const apply=v=>{v=clamp(Math.round(+v||0),0,max);set(v);inp.value=String(get());persist();renderHome();};
  inp.addEventListener('change',()=>apply(inp.value));
  const z=document.createElement('button');z.className='tpill';z.textContent='0';z.addEventListener('click',()=>{sfx('tap');apply(0);});
  const m=document.createElement('button');m.className='tpill';m.textContent='Max';m.addEventListener('click',()=>{sfx('tap');apply(max);});
  r.append(inp,z,m);return r;}
function sbxPills(label,opts,get,set){const r=document.createElement('div');r.className='sbx-row sbx-pills';r.innerHTML='<label><b>'+label+'</b></label>';const w=document.createElement('div');w.className='trackrow';
  for(const[v,nm]of opts){const b=document.createElement('button');b.className='tpill'+(get()===v?' on':'');b.textContent=nm;b.addEventListener('click',()=>{sfx('tap');set(v);sbxSave();w.querySelectorAll('.tpill').forEach(x=>x.classList.remove('on'));b.classList.add('on');});w.append(b);}
  r.append(w);return r;}
function sbxSwitch(label,note,key){const r=document.createElement('button');r.className='sbx-sw'+(SBX[key]?' on':'');r.innerHTML='<span><b>'+label+'</b><small>'+note+'</small></span><i></i>';
  r.addEventListener('click',()=>{SBX[key]=!SBX[key];sbxSave();sfx('tap');r.classList.toggle('on',SBX[key]);});return r;}
function sbxBtn(txt,cls,fn){const b=document.createElement('button');b.className='btn sm '+(cls||'');b.innerHTML=txt;b.addEventListener('click',fn);return b;}
function sbxSec(card,title,col){const h=document.createElement('h3');h.className='sbx-h';h.style.setProperty('--sc',col||'#6be39a');h.textContent=title;card.append(h);const d=document.createElement('div');d.className='sbx-sec';card.append(d);return d;}
function sbxCheats(sec){
  sec.append(sbxSwitch('God mode','You can’t be hurt','god'),sbxSwitch('One-hit takedowns','Every hit you land knocks them out','onehit'),sbxSwitch('Always super','Your super is always ready','superFull'),
    sbxSwitch('Infinite ammo & gadgets','Never reload, gadgets never run out','ammo'),sbxSwitch('Frozen enemies','Enemy bots stand still and don’t fight','freeze'),sbxSwitch('Stop the clock','The match timer and storm stop','noTimer'));
  sec.append(sbxPills('Your damage',[[1,'1×'],[2,'2×'],[5,'5×'],[10,'10×']],()=>SBX.dmg,v=>SBX.dmg=v),
    sbxPills('Your run speed',[[1,'1×'],[1.5,'1.5×'],[2,'2×'],[3,'3×']],()=>SBX.run,v=>SBX.run=v),
    sbxPills('Game speed',[[.5,'Slow-mo'],[1,'Normal'],[1.5,'1.5×'],[2,'2×']],()=>SBX.speed,v=>SBX.speed=v),
    sbxPills('Enemy bots',[['auto','Normal'],['easy','Easy'],['hard','Hard'],['insane','Insane'],['hell','Hell']],()=>SBX.bots,v=>SBX.bots=v));}
function openSandbox(){openSheet(card=>{card.classList.add('sbx');
  card.insertAdjacentHTML('beforeend','<p class="of-kick sbx-kick">🧪 Sandbox mode</p><h2>Set anything</h2><p class="sub">This is a separate copy of the game with its own save. Nothing here touches your real game, and online play is off.</p>');
  {const rb=document.createElement('button');rb.className='btn green-back';rb.textContent='\u2b05 Return to main game';rb.addEventListener('click',()=>rrSwitchMode('main'));card.append(rb);}
  {const q=document.createElement('div');q.className='sbx-quick';
    q.append(sbxBtn('✨ Unlock everything','gold',()=>{sbxUnlockAll();persist();renderHome();sfx('unlock');toast('Everything unlocked');openSandbox();}),
      sbxBtn('💰 Max money','primary',()=>{sbxMaxRes();persist();renderHome();sfx('coin');openSandbox();}),
      sbxBtn('👶 Fresh player','',()=>{sbxFresh();persist();renderHome();toast('Back to a brand new save (sandbox only)');openSandbox();}));card.append(q);}
  {const s=sbxSec(card,'Money','#ffd23f');s.append(sbxNum(ICON.coins+' Coins',()=>S.coins,v=>S.coins=v,9999999),sbxNum(ICON.gems+' Gems',()=>S.gems,v=>S.gems=v,999999),sbxNum(ICON.pp+' Power points',()=>S.pp,v=>S.pp=v,9999999),sbxNum(ICON.chromos+' Chromos',()=>S.chromos,v=>S.chromos=v,9999999));}
  {const s=sbxSec(card,'Progress','#ff8a5c');
    s.append(sbxNum('Trophies',()=>S.trophies,v=>{S.trophies=v;S.best=Math.max(S.best,v);},TROPHY_MAX,'Bots get tougher with more trophies'),sbxNum('Best trophies',()=>S.best,v=>{S.best=Math.max(v,S.trophies);S.road=Math.min(ROAD_MAX,Math.floor(S.best/100));},TROPHY_MAX,'Unlocks trophy icons, banners and more'),
      sbxNum('Rumble Pass tier',()=>passTier(S.pass.xp|0),v=>{S.pass.xp=v*PASS_STEP;},PASS_TIERS),sbxNum('Wins',()=>S.wins|0,v=>S.wins=v,99999),sbxNum('\u2600\ufe0f Solar steps',()=>S.sol|0,v=>solSetStep(v),SOLDAR_STEP,'30 is Solar Fame III, 31 is Soldar'));
    const rk=document.createElement('div');rk.className='sbx-row';rk.innerHTML='<label><b>Rank</b><small>Ranked mode rank</small></label>';const sel=document.createElement('select');
    for(let i=0;i<RANK_STEPS;i++){const o=document.createElement('option');o.value=String(i);o.textContent=rankInfo(i*100).name;if(rankInfo(S.rp|0).i===i)o.selected=true;sel.append(o);}
    sel.addEventListener('change',()=>{const i=+sel.value;S.rp=i*100;S.rankPeak=Math.max(S.rankPeak|0,i);S.rankTop=Math.max(S.rankTop|0,rankInfo(i*100).tier);persist();renderHome();sfx('tap');});rk.append(sel);s.append(rk);
    s.append(sbxPills('Rumble Pass',[[true,'Premium'],[false,'Free only']],()=>!!S.pass.premium,v=>{S.pass.premium=v;persist();}));
    s.append(sbxBtn('Reset pass claims','',()=>{S.pass.cf=[];S.pass.cp=[];persist();sfx('tap');toast('Pass rewards can be claimed again');}));}
  {const s=sbxSec(card,'Give drops & boxes','#9d7bff');let n=1;s.append(sbxPills('How many',[[1,'×1'],[5,'×5'],[10,'×10'],[25,'×25']],()=>n,v=>n=v));
    const g=document.createElement('div');g.className='sbx-drops';
    for(const r of DROP_RAR.concat(['season'],SPOOKY,BOXES)){if(!RARITY[r])continue;const b=document.createElement('button');b.className='sbx-drop';b.append(dropCanvas(r,46));b.insertAdjacentHTML('beforeend','<small>'+esc(dropName(r))+'</small>');
      b.addEventListener('click',()=>{for(let k=0;k<n;k++)S.drops.push({r,min:null});persist();renderHome();sfx('coin');toast('+'+n+' '+dropName(r)+(n>1?'s':''),'drop');});g.append(b);}
    s.append(g);s.append(sbxBtn('Open my drops now','primary',()=>{closeSheet();openDrops();}),sbxBtn('Clear all drops','',()=>{S.drops=[];persist();renderHome();toast('Drops cleared');}));}
  {const s=sbxSec(card,'Rumblers','#46b4ff');const sel=document.createElement('select');sel.className='sbx-sel';for(const b of RUMBLERS){const o=document.createElement('option');o.value=b.id;o.textContent=b.name+(S.owned[b.id]?'':' (locked)');if(b.id===(SBX.rum||S.selected))o.selected=true;sel.append(o);}
    const body=document.createElement('div');s.append(sel,body);
    const draw=()=>{const id=sel.value,b=BY_ID[id],me=S.owned[id];SBX.rum=id;body.innerHTML='';const top=document.createElement('div');top.className='sbx-rum';top.append(thumb(b,getSkin(b,me?me.skin:'classic'),64));top.insertAdjacentHTML('beforeend','<div><b>'+esc(b.name)+'</b><small>'+esc(RARITY[b.rarity].name)+' · '+(me?'level '+me.lvl:'locked')+'</small></div>');body.append(top);
      if(me){body.append(sbxNum('Level',()=>me.lvl,v=>{me.lvl=clamp(v,1,MAX_LVL);},MAX_LVL),sbxNum('Prestige',()=>me.prestige|0,v=>{me.prestige=v;},PRESTIGE_MAX));
        const w=document.createElement('div');w.className='sbx-quick';w.append(sbxBtn('Max it out','gold',()=>{sbxMaxRumbler(b);persist();renderHome();sfx('unlock');draw();}),sbxBtn('Use it','primary',()=>{S.selected=id;persist();renderHome();sfx('click');toast(b.name+' selected');}));
        if(id!==STARTER)w.append(sbxBtn('Lock it','',()=>{delete S.owned[id];if(S.selected===id)S.selected=STARTER;persist();renderHome();sel.selectedOptions[0].textContent=b.name+' (locked)';draw();}));body.append(w);}
      else body.append(sbxBtn('Unlock '+esc(b.name),'gold',()=>{grantRumbler(id);persist();renderHome();sfx('unlock');sel.selectedOptions[0].textContent=b.name;draw();}));};
    sel.addEventListener('change',()=>{sfx('tap');draw();});draw();}
  {const s=sbxSec(card,'Match cheats','#ff5d57');s.insertAdjacentHTML('beforeend','<p class="sub" style="margin:0 0 4px">These also work mid-match: tap 🧪 next to the pause button.</p>');sbxCheats(s);}
  {const s=sbxSec(card,'Halloween event','#ff8a1f');s.append(sbxPills('Event',[[null,'Real date'],[true,'Always on'],[false,'Off']],()=>SBX.hw,v=>{SBX.hw=v;applyTheme();renderHome();}));
    s.append(sbxNum('Doors knocked',()=>S.hw.knocked|0,v=>{S.hw.knocked=v;},500,'100 opens the Happy House'),sbxNum('Halloween wins',()=>S.hw.wins|0,v=>{S.hw.wins=v;},999,'Every '+KNOCK_EVERY+' wins gives a knock'));
    s.append(sbxBtn('Reset Halloween','',()=>{S.hw={wins:0,used:0,spent:0,knocks:0,opened:0,doors:null};for(const id of['hw_reaper','hw_surged','hw_grim']){const me=S.owned.dark;if(me)me.skins=me.skins.filter(x=>x!==id);}if(S.owned.dark&&!S.owned.dark.skins.includes(S.owned.dark.skin))S.owned.dark.skin='classic';persist();renderHome();toast('Halloween progress reset');}));}
  {const s=sbxSec(card,'Stats & exclusive skins','#2de0b0');const st=S.st;
    for(const[k,nm,mx]of[['sims','Simulations run',999],['replays','Replays watched',999],['pins','Pins sent',9999],['kills','Takedowns',99999],['sdWins','Showdown 1st places',999]])s.append(sbxNum(nm,()=>st[k]|0,v=>{st[k]=v;},mx));
    s.append(sbxBtn('Lock exclusive skins again','',()=>{for(const e of EXCLUSIVE_SKINS){const me=S.owned[e.rid];if(me){me.skins=me.skins.filter(x=>x!==e.skin.id);if(me.skin===e.skin.id)me.skin='classic';}S.pendingSkins=S.pendingSkins.filter(x=>x!==e.rid+':'+e.skin.id);}
      for(const k of['sims','replays','pins','kills','sdWins'])st[k]=0;st.modes={};st.drops={};persist();renderHome();toast('Exclusive skins locked. Earn them again!');openSandbox();}));
    s.append(sbxBtn('Lock all secrets','',()=>{S.pins=S.pins.filter(p=>!SECRET_PINS.some(x=>x[0]===p));persist();toast('Secrets hidden again');}),sbxBtn('Find all secrets','',()=>{for(const p of SECRET_PINS)if(!S.pins.includes(p[0]))S.pins.push(p[0]);persist();toast('All secrets found');}));}
  const x=document.createElement('button');x.className='btn';x.textContent='Done';x.addEventListener('click',()=>{closeSheet();renderHome();});card.append(x);});}

/* in-match cheat menu */
function openSandboxGame(){if(!M)return;const was=paused;paused=true;openSheet(card=>{card.classList.add('sbx');card.insertAdjacentHTML('beforeend','<p class="of-kick sbx-kick">🧪 Sandbox</p><h2>Match cheats</h2>');
  const q=document.createElement('div');q.className='sbx-quick';
  q.append(sbxBtn('💥 Knock out all enemies','gold',()=>{for(const u of M.units)if(P&&u.team!==P.team&&!u.dead&&!u.shadow){u.shield=0;hurt(u,u.hp*10+99,P,true);}finish();}),
    sbxBtn('❤️ Full heal','primary',()=>{if(P&&!P.dead)P.hp=P.maxHp;finish();}),sbxBtn('⚡ Fill super','primary',()=>{if(P&&!P.dead)P.super=1;finish();}));
  card.append(q);const s=document.createElement('div');s.className='sbx-sec';card.append(s);sbxCheats(s);
  const finish=()=>{closeSheet();paused=was;sfx('click');};
  const x=document.createElement('button');x.className='btn';x.textContent='Back to the match';x.addEventListener('click',finish);card.append(x);});}
if(RR_MODE==='sandbox'){const hb=document.createElement('button');hb.className='sbx-home';hb.id='sbxBtn';hb.setAttribute('aria-label','Sandbox settings');hb.textContent='🧪';hb.addEventListener('click',()=>{sfx('click');openSandbox();});
  const h=$('#hambBtn');if(h&&h.parentNode)h.parentNode.insertBefore(hb,h);
  const gb=document.createElement('button');gb.className='btn sbx-game';gb.setAttribute('aria-label','Sandbox cheats');gb.textContent='🧪';gb.addEventListener('click',e=>{e.stopPropagation();sfx('click');openSandboxGame();});
  const pb=$('#pauseBtn');if(pb&&pb.parentNode)pb.parentNode.insertBefore(gb,pb.nextSibling);
  const tag=document.createElement('span');tag.className='sbx-tag';tag.textContent='SANDBOX';const me=document.querySelector('.me');if(me)me.append(tag);}
{const st=document.createElement('style');st.textContent=
'.sbx-home{position:absolute;top:calc(max(4px,env(safe-area-inset-top,0px)) - 10px);right:calc(max(12px,env(safe-area-inset-right,0px)) + 52px);z-index:4;width:42px;height:42px;border-radius:14px;border:3px solid var(--edge);background:linear-gradient(180deg,#2de0b0,#0f7a64);box-shadow:0 4px 0 var(--edge);font-size:20px;line-height:1;padding:0;cursor:pointer;display:grid;place-items:center}'+
'.sbx-home:active{transform:translateY(3px);box-shadow:0 1px 0 var(--edge)}'+
'.sbx-game{position:absolute;top:66px;left:calc(max(12px,env(safe-area-inset-left,0px)) + 100px);width:42px;height:42px;padding:0;display:grid;place-items:center;font-size:18px;background:linear-gradient(180deg,#2de0b0,#0f7a64)}'+
'.me{position:relative}.sbx-tag{position:absolute;left:-3px;top:34px;z-index:2;font-size:8px;font-weight:900;letter-spacing:.1em;padding:2px 4px;border-radius:5px;background:#2de0b0;color:#06231d;border:2px solid var(--edge);pointer-events:none}'+
'.sbx-kick{color:#2de0b0!important}.sbx h2{margin-top:0}.sbx-h{margin:14px 0 6px;font-family:var(--display);font-weight:400;font-size:20px;color:var(--sc);text-shadow:0 2px 0 var(--edge)}'+
'.sbx-sec{display:grid;gap:8px;padding:10px;border-radius:16px;background:rgba(0,0,0,.22);border:2px solid rgba(255,255,255,.08)}.sbx-sec>.btn{width:100%;margin:0}'+
'.sbx-quick{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;margin:6px 0}.sbx-quick .btn{margin:0;width:100%}'+
'.sbx-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.sbx-row label{flex:1 1 96px;display:grid;min-width:0}.sbx-row label b{display:flex;align-items:center;gap:5px;font-size:14px}.sbx-row label svg{width:18px;height:18px}.sbx-row label small{font-size:11px;color:var(--muted);font-weight:700}'+
'.sbx-row input,.sbx-row select,.sbx-sel{font:inherit;font-weight:800;font-size:15px;color:#fff;background:#16133a;border:2px solid var(--edge);border-radius:10px;padding:6px 7px;width:106px;min-width:0;font-size:14px}.sbx-row select{width:150px}.sbx-sel{width:100%}'+
'.sbx-pills{align-items:flex-start}.sbx-pills label{flex-basis:100%}.sbx-pills .trackrow{gap:5px}'+
'.sbx-sw{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border-radius:14px;border:2px solid var(--edge);background:#221d4f;color:#fff;font:inherit;text-align:left;cursor:pointer}.sbx-sw span{flex:1;display:grid}.sbx-sw small{font-size:11px;color:var(--muted);font-weight:700}'+
'.sbx-sw i{flex:none;width:46px;height:26px;border-radius:999px;background:#3a3466;position:relative;transition:background .15s}.sbx-sw i::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .15s}'+
'.sbx-sw.on{border-color:#2de0b0}.sbx-sw.on i{background:#2de0b0}.sbx-sw.on i::after{transform:translateX(20px)}'+
'.sbx-drops{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px}.sbx-drop{display:grid;justify-items:center;gap:2px;padding:6px 4px;border-radius:12px;border:2px solid var(--edge);background:#221d4f;color:#fff;font:inherit;cursor:pointer}.sbx-drop small{font-size:10px;font-weight:800;text-align:center;line-height:1.1}.sbx-drop:active{transform:scale(.95)}'+
'.sbx-rum{display:flex;align-items:center;gap:10px}.sbx-rum div{display:grid}.sbx-rum small{color:var(--muted);font-weight:700}';
if(document.head)document.head.append(st);}

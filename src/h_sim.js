
/* ---------- Simulation ---------- */
const ctl={move:null,atk:null,sup:null};
const keys=new Set();
let touchUI=('ontouchstart' in window)||(navigator.maxTouchPoints>0);
let mouseMode=false;const mouse={x:0,y:0,has:false};
/* a drag pulled back to the middle of the stick cancels the shot */
const AIM_CANCEL_R=22,aimCentered=o=>!!o&&o.drag&&Math.hypot(o.x-o.sx,o.y-o.sy)<AIM_CANCEL_R;
const aimingNow=()=>(ctl.atk&&ctl.atk.drag&&!aimCentered(ctl.atk))||(ctl.sup&&ctl.sup.drag&&!aimCentered(ctl.sup))||(mouseMode&&mouse.has);
function playerMove(){
  if(ctl.move){const dx=ctl.move.x-ctl.move.ox,dy=ctl.move.y-ctl.move.oy,l=Math.hypot(dx,dy);return l>8?s2w(dx/l,dy/l):[0,0];}
  let x=0,y=0;
  if(keys.has('a')||keys.has('arrowleft'))x--;if(keys.has('d')||keys.has('arrowright'))x++;
  if(keys.has('w')||keys.has('arrowup'))y--;if(keys.has('s')||keys.has('arrowdown'))y++;
  return[x,y];
}
function hitsBox(x,y,r,ox,oy){if(!M||!M.boxes.length)return false;for(const b of M.boxes){if(b.dead)continue;const rr=(b.rad+r)**2,nd=(b.x-x)**2+(b.y-y)**2;if(nd<rr&&nd<(b.x-ox)**2+(b.y-oy)**2)return true;}return false;}
function moveBy(u,dx,dy){
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8)),sx=dx/steps,sy=dy/steps;let blocked=false;
  for(let i=0;i<steps;i++){if(!hitsWall(u.x+sx,u.y,u.rad)&&!hitsBox(u.x+sx,u.y,u.rad,u.x,u.y))u.x+=sx;else blocked=true;if(!hitsWall(u.x,u.y+sy,u.rad)&&!hitsBox(u.x,u.y+sy,u.rad,u.x,u.y))u.y+=sy;else blocked=true;}
  return blocked;
}
function respawnUnit(u){
  let sp=u.spawn;
  if(M.mode.sd){const mate=M.units.find(o=>o!==u&&o.team===u.team&&!o.dead&&!o.shadow);if(mate)sp=openPoint(mate.x,mate.y,30,80);}
  else if(M.mode.ffa){let best=sp,bd=-1;for(const p of MAP.ffa){let md=1e9;for(const e of M.units)if(e!==u&&!e.dead)md=Math.min(md,dist(p[0],p[1],e.x,e.y));if(md>bd){bd=md;best=p;}}sp=best;}
  u.dead=false;u.hp=u.maxHp;u.x=sp[0];u.y=sp[1];u.shield=2;u.ammo=u.b.atk.kind==='cloudzap'?0:u.maxAmmo;u.thrown=null;u.leap=null;u.strongFist=false;if(u.b.random)trickReroll(u);u.flash=0;u.vx=u.vy=0;u.lastHurt=-9;u.slowT=u.stunT=u.poisonT=u.markT=u.vulnT=0;u.ghosts.length=0;u.soakT=0;u.soak=null;
  if(u.sk.supercharged)superSpawnFx(u);else skinSpawnFx(u);
  addFx({k:'beam',x:u.x,y:u.y,t:0,T:.6,col:u.team===0?BLUE:RED});if(M.mode.sd&&u.team===0)textFx(u.x,u.y-u.rad-40,u===P?'You\u2019re back!':'Back!','#8fd3ff',16);ringFx(u.x,u.y,8,70,.5,'#ffffff',5);sparks(u.x,u.y,'#ffffff',10,200,2.5);
  if(u.ai){u.ai.target=null;u.ai.mode='objective';u.ai.lx=u.x;u.ai.ly=u.y;u.ai.zp=null;}
}
function updateUnit(u,dt){
  u.pinT-=dt;u.pinCd-=dt;if(u.pinT<=0)u.pin=null;
  for(let i=u.ghosts.length-1;i>=0;i--){u.ghosts[i].t+=dt;if(u.ghosts[i].t>.3)u.ghosts.splice(i,1);}
  if(u.shadow&&!u.dead){u.lifeT-=dt;if(u.lifeT<=0){kill(u,null);return;}}
  if(u.dead){if(u.respawn!==Infinity){u.respawn-=dt;if(u.respawn<=0&&M.state!=='ended')respawnUnit(u);}return;}
  u.shield=Math.max(0,u.shield-dt);u.flash=Math.max(0,u.flash-dt*5);u.atkCd-=dt;u.gCd-=dt;u.squash=Math.max(0,u.squash-dt*4);
  u.slowT=Math.max(0,u.slowT-dt);u.stunT=Math.max(0,u.stunT-dt);u.markT=Math.max(0,u.markT-dt);u.vulnT=Math.max(0,u.vulnT-dt);u.zoneT=Math.max(0,u.zoneT-dt);u.guardT=Math.max(0,u.guardT-dt);u.boostT=Math.max(0,u.boostT-dt);u.damT=Math.max(0,u.damT-dt);
  if(u.soakT>0){u.soakT-=dt;if(u.soakT<=0&&u.soak){u.poisonT=u.soak.T;u.poisonDmg=u.soak.dmg;u.poisonSrc=u.soak.src;u.poisonTick=1;u.soak=null;}}
  if(u.poisonT>0){u.poisonT-=dt;u.poisonTick-=dt;if(u.poisonTick<=0){u.poisonTick=1;hurt(u,u.poisonDmg,u.poisonSrc,true);for(let i=0;i<3;i++)addFx({k:'bubble',x:u.x+rand(-14,14),y:u.y-rand(0,16),t:0,T:.7,col:'#9be35a'});}if(u.dead)return;}
  u.fastT=Math.max(0,(u.fastT||0)-dt);if(u.cloakT>0)u.cloakT-=dt;if(u.burnT>0){u.burnT-=dt;if(Math.random()<dt*10)addFx({k:'spark',x:u.x+rand(-10,10),y:u.y-rand(0,14),vx:0,vy:-60,t:0,T:.35,s:3,col:'#ff7a1a'});}
  if(u.darkT>0){u.darkT-=dt;u.trailT=(u.trailT||0)-dt;if(u.trailT<=0){u.trailT=.12;addTrail(u.darkSrc,u,u.x,u.y);}}
  if(u.darkX>0)u.darkX-=dt;
  if(u.hot){u.hot.t-=dt;u.hot.tick-=dt;if(u.hot.tick<=0){u.hot.tick=1;heal(u,u.hot.amt);}if(u.hot.t<=0)u.hot=null;}
  if(u.dive){u.dive.t-=dt;u.dive.tr-=dt;if(u.dive.tr<=0){u.dive.tr=.1;addTrail(u,null,u.x,u.y);}if(Math.random()<dt*14)addFx({k:'smoke',x:u.x+rand(-12,12),y:u.y+rand(-8,8),vx:0,vy:-10,t:0,T:.5,s:8,col:'#140a24'});if(u.dive.t<=0){u.dive=null;smoke(u.x,u.y,4,20,'#140a24');}}
  if(u.b.random){if(u.rerollA>0){u.rerollA-=dt;if(u.rerollA<=0)trickAtk(u);}if(u.rerollS>0){u.rerollS-=dt;if(u.rerollS<=0)trickSup(u);}}
  if(u.ammo<u.maxAmmo&&!(u.b.atk.kind==='cloudzap'&&!u.zoneOn))u.ammo=Math.min(u.maxAmmo,u.ammo+(u.fastT>0?2:1)*dt*(u.zoneT>0&&u.zoneBoss?2:1)/(u.b.reload/(1+u.mods.reloadspd)));
  const rd=3-u.mods.regen;if(M.now-u.lastHurt>rd&&M.now-u.lastAttack>rd&&u.hp<u.maxHp){u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.13*dt);if(Math.random()<dt*3)addFx({k:'plus',x:u.x+rand(-12,12),y:u.y-rand(0,10),t:0,T:.8});}
  for(let i=u.pending.length-1;i>=0;i--){const p=u.pending[i];p.t-=dt;if(p.t<=0){u.pending.splice(i,1);if(u.stunT<=0)p.fn();}}
  const ox=u.x,oy=u.y,live=M.state==='play'||M.state==='ended';
  {const z=closeZone(u.b);u.zoneOn=false;if(z&&!u.dead&&M.state==='play'){for(const e of M.units)if(e.team!==u.team&&!e.dead&&dist(u.x,u.y,e.x,e.y)<z+e.rad){u.zoneOn=true;break;}
    if(u.zoneOn&&u.super<1)u.super=Math.min(1,u.super+dt*ZONE_CHARGE*(1+u.mods.charge));}}
  if(u.leap){const L=u.leap;L.t+=dt;const k=Math.min(1,L.t/L.T);u.x=L.x0+(L.tx-L.x0)*k;u.y=L.y0+(L.ty-L.y0)*k;L.h=Math.sin(k*Math.PI)*90;
    if(k>=1){u.leap=null;ringFx(u.x,u.y,u.rad,L.radius,.35,'#9fe8ff',9);ringFx(u.x,u.y,u.rad,L.radius*.7,.25,'#ffffff',5);flashFx(u.x,u.y,L.radius,'#9fe8ff',.2);sparks(u.x,u.y,'#ffe14d',16,320,3);shakeAt(u.x,u.y,8);sfx('bass');
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<L.radius+e.rad){hurt(e,L.dmg,u);hitFx(e.x,e.y,'#9fe8ff');knock(e,Math.atan2(e.y-u.y,e.x-u.x),220);}}
      if(L.heal){ringFx(u.x,u.y,u.rad,L.radius,.4,'#6be39a',7);for(const e of M.units)if(e.team===u.team&&!e.dead&&dist(u.x,u.y,e.x,e.y)<L.radius+e.rad)heal(e,L.heal);}}}
  else if(u.thrown){const th=u.thrown;th.t+=dt;
    if(th.phase==='grab'){const sr=th.src,gx=sr.x+Math.cos(th.ang)*(sr.rad+u.rad+4),gy=sr.y+Math.sin(th.ang)*(sr.rad+u.rad+4),k=Math.min(1,dt*16);
      if(!hitsWall(gx,gy,u.rad)){u.x+=(gx-u.x)*k;u.y+=(gy-u.y)*k;}th.h=Math.min(26,th.t*160);if(th.t>=.18||sr.dead){th.phase='fly';th.t=0;}}
    else{const bx=u.x,by=u.y,step=th.spd*dt;moveBy(u,th.vx*dt,th.vy*dt);const mv=Math.hypot(u.x-bx,u.y-by);th.trav+=mv;
      th.h=26+Math.sin(clamp(th.trav/th.max,0,1)*Math.PI)*60*(1-clamp(th.trav/th.max,0,1)*.4);if(Math.random()<dt*40)addFx({k:'smoke',x:u.x,y:u.y+u.rad*.6,vx:0,vy:-6,t:0,T:.35,s:5,col:'#c9b9a0'});
      if(th.trav>=th.max||mv<step*.35)landThrow(u);}}
  else if(u.dash){const d=u.dash,dx=d.vx*dt,dy=d.vy*dt;moveBy(u,dx,dy);if(Math.hypot(u.x-ox,u.y-oy)<Math.hypot(dx,dy)*.4)d.t=0;
    if(d.dmg)for(const e of M.ents){if(e.team===u.team||e.dead||d.hit.has(e.id))continue;if(dist(u.x,u.y,e.x,e.y)<u.rad+e.rad+8){d.hit.add(e.id);hurt(e,d.dmg,u);hitFx(e.x,e.y,u.sk.proj);knock(e,Math.atan2(e.y-u.y,e.x-u.x),d.kb);shakeAt(e.x,e.y,4);}}
    u.afterT-=dt;if(u.afterT<=0){u.afterT=.035;u.ghosts.push({x:u.x,y:u.y,t:0});}
    if(d.fire){d.fire.last-=dt;if(d.fire.last<=0){d.fire.last=.09;createField(u,u.x,u.y,{radius:40,dur:2.5,dps:d.fire.dps,kind:'fire'});}}
    d.t-=dt;if(d.t<=0){u.dash=null;smoke(u.x,u.y,2,14);}}
  else if(u.kb){moveBy(u,u.kb.vx*dt,u.kb.vy*dt);u.kb.t-=dt;if(u.kb.t<=0)u.kb=null;}
  else if(live&&u.stunT<=0){
    let mx,my;[mx,my]=u.net?[u.net.mx,u.net.my]:u.isPlayer?(NETS?[0,0]:playerMove()):aiUpdate(u,dt);if(u.isPlayer&&(mx||my))M.pMoved=true;
    const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}
    const sp=u.b.speed*(1+u.mods.speed)*(u.boostT>0?1.4:1)*(u.slowT>0?.55:1)*(u.damT>0?1+u.damSpeed:1)*(u.hasCrown?.9:1)*(u.zoneT>0?1.1:1);
    if(l>.01)moveBy(u,mx*sp*dt,my*sp*dt);
  }
  u.vx=dt>0?(u.x-ox)/dt:0;u.vy=dt>0?(u.y-oy)/dt:0;u.moving=Math.hypot(u.vx,u.vy)>20;
  if(u.isPlayer&&!(u.net?u.net.aiming:aimingNow())&&u.moving&&M.now-u.lastAttack>.4)u.aim=Math.atan2(u.vy,u.vx);
  if(u.moving){u.stepT-=dt;if(u.stepT<=0){u.stepT=.24;if(inBush(u.x,u.y)){addFx({k:'leaf',x:u.x+rand(-12,12),y:u.y+rand(-6,10),vx:rand(-40,40),vy:rand(-50,-10),t:0,T:.7,rot:rand(0,TAU)});}else addFx({k:'smoke',x:u.x+rand(-6,6),y:u.y+u.rad*.8,vx:-u.vx*.1,vy:-8,t:0,T:.45,s:6,col:'#5f6d86'});}}
  if(u.stunT>0&&Math.random()<dt*5)addFx({k:'star',x:u.x,y:u.y-u.rad-14,t:0,T:.6,a:rand(0,TAU)});
  if(u.slowT>0&&Math.random()<dt*6)addFx({k:'snow',x:u.x+rand(-16,16),y:u.y-rand(0,20),t:0,T:.8});
  if(u.boostT>0&&u.moving&&Math.random()<dt*20)addFx({k:'spark',x:u.x,y:u.y+u.rad*.5,vx:-u.vx*.3,vy:-u.vy*.3,t:0,T:.3,s:2.5,col:'#9ff5bf'});
}
function updateShots(dt){
  const L=M.shots;
  for(let i=L.length-1;i>=0;i--){
    const s=L[i];let dead=false;s.age+=dt;
    if(s.lob){s.t+=dt;const k=Math.min(1,s.t/s.T);s.x=s.sx+(s.tx-s.sx)*k;s.y=s.sy+(s.ty-s.sy)*k;s.h=Math.sin(k*Math.PI)*(s.big?130:95);if(s.style==='meteor'){s.x=s.tx-170*(1-k);s.y=s.ty;s.h=700*(1-k)*(1-k);if(Math.random()<.9)smoke(s.x,s.y-s.h,1,16,'#4a2a22');}
      if(Math.random()<dt*25)addFx({k:'spark',x:s.x,y:s.y-s.h,vx:rand(-30,30),vy:rand(-30,30),t:0,T:.25,s:2,col:'#ffd38a'});
      if(k>=1){explode(s);dead=true;}}
    else{
      s.trail.push(s.x,s.y);if(s.trail.length>16)s.trail.splice(0,2);
      s.spin+=dt*18;
      if(s.home){const h=s.home;h.t+=dt;
        if(h.phase==='out'&&(!h.tgt||h.tgt.dead)){h.tgt=nearestFoeUnit(s.team,s.x,s.y,700);if(!h.tgt){h.free-=dt;if(h.free<=0){h.phase='back';}}}
        const goal=h.phase==='out'?h.tgt:s.owner;
        if(goal){const a=Math.atan2(goal.y-s.y,goal.x-s.x),cur=Math.atan2(s.vy,s.vx),turn=clamp(angDiff(cur,a),-dt*(5+h.t*8),dt*(5+h.t*8)),na=cur+turn;s.vx=Math.cos(na)*s.spd;s.vy=Math.sin(na)*s.spd;}
        s.x+=s.vx*dt;s.y+=s.vy*dt;
        for(const e of M.units){if(e.team===s.team||e.dead||s.hit.has(e.id))continue;if(h.phase==='out'&&e!==h.tgt)continue;const rr=e.rad+s.r;
          if((e.x-s.x)**2+(e.y-s.y)**2<rr*rr){s.hit.add(e.id);batHit(s,e,h.phase==='out'?s.dmg:s.dmgBack);if(h.phase==='out'){h.phase='back';s.spd*=1.15;}}}
        if(h.phase==='back'&&(s.owner.dead||dist(s.x,s.y,s.owner.x,s.owner.y)<s.owner.rad+14)){dead=true;if(!s.owner.dead)sparks(s.owner.x,s.owner.y,'#c98f55',6,160,2);}
        if(h.t>7)dead=true;
      }else if(s.rang){
        if(!s.rang.back){s.x+=s.vx*dt;s.y+=s.vy*dt;s.left-=s.spd*dt;if(s.left<=0||isWall(s.x,s.y)){s.rang.back=true;s.hit.clear();}}
        else{const o=s.owner,a=Math.atan2(o.y-s.y,o.x-s.x);s.vx=Math.cos(a)*s.spd*1.1;s.vy=Math.sin(a)*s.spd*1.1;s.x+=s.vx*dt;s.y+=s.vy*dt;if(o.dead||dist(s.x,s.y,o.x,o.y)<o.rad+10||s.age>3)dead=true;}
      }else{
        if(s.seek){if(s.seek.dead)s.seek=null;else{const a=Math.atan2(s.seek.y-s.y,s.seek.x-s.x);s.vx=Math.cos(a)*s.spd;s.vy=Math.sin(a)*s.spd;}}
        if(s.curve){const a=Math.atan2(s.vy,s.vx)+s.curve*dt;s.vx=Math.cos(a)*s.spd;s.vy=Math.sin(a)*s.spd;}
        s.x+=s.vx*dt;s.y+=s.vy*dt;s.left-=s.spd*dt;
        if(s.bounce>0&&isWall(s.x,s.y)){s.bounce--;const bx=isWall(s.x-s.vx*dt,s.y),by=isWall(s.x,s.y-s.vy*dt);if(!bx)s.vx=-s.vx;if(!by)s.vy=-s.vy;if(bx&&by){s.vx=-s.vx;s.vy=-s.vy;}s.x+=s.vx*dt*2;s.y+=s.vy*dt*2;s.hit.clear();sparks(s.x,s.y,s.color,4,140,2);}
        if((s.left<=0||(!s.ghost&&isWall(s.x,s.y)))&&s.owner&&(s.sawDps||s.splat)){const bx=isWall(s.x,s.y)?s.x-s.vx*dt*2:s.x,by=isWall(s.x,s.y)?s.y-s.vy*dt*2:s.y;if(s.sawDps)createField(s.owner,bx,by,{radius:38,dur:1.6,dps:s.sawDps,kind:'saw'});else{createField(s.owner,bx,by,{radius:36,dur:2.2,dps:s.splat,slow:true,kind:'paint'});M.fields[M.fields.length-1].col=s.color;}s.sawDps=0;s.splat=0;}
        if(s.left<=0){dead=true;if(s.style==='log'||s.style==='wave')smoke(s.x,s.y,2,12,s.style==='wave'?'#bfefff':'#7a5a40');}
        else if(!s.ghost&&isWall(s.x,s.y)){dead=true;sparks(s.x,s.y,s.color,5,160,2.2);flashFx(s.x,s.y,12,s.color,.08);if(s.style==='wave')smoke(s.x,s.y,3,14,'#bfefff');if(s.style==='log')debris(s.x,s.y,'#a0673f',4);}
      }
      if(!dead&&!s.home)for(const e of M.ents){
        if(e.team===s.team||e.dead||s.hit.has(e.id))continue;const rr=e.rad+s.r;
        if((e.x-s.x)**2+(e.y-s.y)**2<rr*rr){s.hit.add(e.id);if(s.boom&&!e.isStruct){const bd=s.boom,ow=s.owner,tm=s.team,tg=e;tg.pending.push({t:.7,fn:()=>{if(!M||tg.dead)return;boom(tg.x,tg.y,55,'#ffb347',false);for(const o of M.ents){if(o.team===tm||o.dead)continue;if(dist(tg.x,tg.y,o.x,o.y)<55+o.rad)hurt(o,bd,ow);}}});}if(s.splat&&s.owner){createField(s.owner,s.x,s.y,{radius:36,dur:2.2,dps:s.splat,slow:true,kind:'paint'});M.fields[M.fields.length-1].col=s.color;s.splat=0;}hurt(e,s.fist?s.dmg*(1+s.fist.far*clamp(1-s.left/s.range,0,1)):s.dmg,s.owner);hitFx(s.x,s.y,s.color);
          if(s.fist){const o=s.owner;if(s.fist.strong){ringFx(e.x,e.y,e.rad,e.rad*3,.3,'#ffd23f',7);shakeAt(e.x,e.y,5);}else if(!e.isStruct&&o&&!o.dead){o.strongFist=true;o.ammo=Math.min(o.maxAmmo,o.ammo+.85);if(o===P)textFx(o.x,o.y-o.rad-36,'Power punch ready!','#ffd23f',13);}}
          if(s.slow)slowE(e,s.slow,s.owner);if(s.stun)stun(e,s.stun);if(s.kb)knock(e,Math.atan2(s.vy,s.vx),s.kb);
          if(s.chain)doChain(s,e);if(s.split)splitLog(s,e);if(s.spread)spreadStar(s,e);
          if(!s.pierce){dead=true;break;}}
      }
    }
    if(dead)L.splice(i,1);
  }
}
function updateStructs(dt){
  for(const s of M.structs){
    if(s.dead)continue;s.flash=Math.max(0,s.flash-dt*5);
    if(s.lifeT!=null){s.lifeT-=dt;if(s.lifeT<=0){s.dead=true;smoke(s.x,s.y,3,16);debris(s.x,s.y,'#a0673f',4);continue;}}
    if(s.kind==='turret'){
      s.t-=dt;if(s.t<=0||!s.owner||s.owner.dead&&M.mode.id==='stand'){s.dead=true;smoke(s.x,s.y,4,18);debris(s.x,s.y,'#c7cedb',5);continue;}
      s.cd-=dt;let best=null,bd=s.reach;
      for(const e of M.units){if(e.team===s.team||e.dead||e.hidden)continue;const d=dist(s.x,s.y,e.x,e.y);if(d<bd&&los(s.x,s.y,e.x,e.y)){bd=d;best=e;}}
      if(best){s.aim=Math.atan2(best.y-s.y,best.x-s.x);if(s.cd<=0){s.cd=s.rate;const cx=Math.cos(s.aim),sy=Math.sin(s.aim);spawnShot(s,s.aim,{x:s.x+cx*20,y:s.y+sy*20,spd:900,range:s.reach,dmg:s.dmg,r:5,style:'rivet',color:s.owner.sk.proj});flashFx(s.x+cx*22,s.y+sy*22,12,s.owner.sk.proj,.07);}}
    }else if(s.kind==='core'&&s.hp<s.maxHp*.5&&Math.random()<dt*(s.hp<s.maxHp*.25?10:4))addFx({k:'spark',x:s.x+rand(-20,20),y:s.y+rand(-24,10),vx:rand(-60,60),vy:rand(-160,-40),t:0,T:.4,s:2.5,col:'#ffb347'});
  }
  if(M.structs.length>4)M.structs=M.structs.filter(s=>!s.dead||s.kind==='core');
}
function updateFields(dt){
  for(let i=M.fields.length-1;i>=0;i--){
    const f=M.fields[i];f.t+=dt;if(f.t>=f.dur){M.fields.splice(i,1);continue;}
    if(f.kind==='hole')for(const e of M.units){if(e.team===f.team||e.dead)continue;const d=dist(e.x,e.y,f.x,f.y);if(d<f.r*1.3&&d>8){const a=Math.atan2(f.y-e.y,f.x-e.x);moveBy(e,Math.cos(a)*f.pull*dt,Math.sin(a)*f.pull*dt);}}
    if(f.kind==='thunder'){f.zt-=dt;if(f.zt<=0){f.zt=f.rate;const foes=M.ents.filter(e=>e.team!==f.team&&!e.dead&&dist(e.x,e.y,f.x,f.y)<f.r+e.rad);
        for(const e of shuffle(foes.slice()).slice(0,2)){const ci=Math.floor(Math.random()*f.clouds),a=M.now*.8+ci*TAU/f.clouds,cx=f.x+Math.cos(a)*f.r*.55,cy=f.y+Math.sin(a)*f.r*.55-50;
          boltFx(cx,cy,e.x,e.y,'#fff3a0');hurt(e,f.dps,f.owner);hitFx(e.x,e.y,'#fff3a0');}if(foes.length)sfx('zap');}continue;}
    f.tick-=dt;if(f.tick>0)continue;const step=f.kind==='dam'?.5:.25;f.tick=step;
    for(const e of M.units){
      if(e.dead||dist(e.x,e.y,f.x,f.y)>f.r+e.rad*.5)continue;
      if(f.kind==='dam'){
        if(e.team===f.team){heal(e,e.maxHp*f.heal*step,true);e.damT=.6;e.damSpeed=f.speed;if(Math.random()<.5)addFx({k:'plus',x:e.x+rand(-12,12),y:e.y-rand(0,10),t:0,T:.8});}
        else{if(f.dps)hurt(e,f.dps*step,f.owner);e.soakT=.6;e.soak={dmg:f.poison,T:f.poisonT,src:f.owner};}
      }else if(f.kind==='spore'||f.kind==='mush'){if(e.team===f.team){if(f.heal)heal(e,(f.kind==='spore'?e.maxHp*f.heal:f.heal)*step,true);}else if(f.dps)hurt(e,f.dps*step,f.owner);
      }else if(f.kind==='healzone'){if(e.team===f.team)heal(e,f.heal*step,true);
      }else if(f.kind==='reloadzone'){if(e.team===f.team)e.fastT=.4;
      }else if(f.kind==='starzone'){
        if(e.team===f.team){e.zoneT=.4;e.zoneBoss=e===f.owner;}
        else{hurt(e,f.dps*step,f.owner);if(e.dead)continue;slowE(e,.6,f.owner);e.poisonDmg=f.poison;e.poisonSrc=f.owner;if(e.poisonT<=0)e.poisonTick=1;e.poisonT=Math.max(e.poisonT,f.poisonT);addFx({k:'fallstar',x:e.x+rand(-14,14),y:e.y-rand(0,10),t:0,T:.3,col:'#ffd36b'});}
      }else if(e.team!==f.team){if(f.dps)hurt(e,f.dps*step,f.owner);if(f.slow)slowE(e,.6,f.owner);}
    }
  }
}
function updateFx(dt){
  for(let i=M.fx.length-1;i>=0;i--){const f=M.fx[i];f.t+=dt;
    if(f.k==='spark'||f.k==='smoke'||f.k==='leaf'){f.x+=f.vx*dt;f.y+=f.vy*dt;const k=1-Math.min(1,dt*(f.k==='smoke'?2:4));f.vx*=k;f.vy*=k;if(f.k==='leaf')f.vy+=60*dt;}
    else if(f.k==='debris'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vz-=650*dt;f.z+=f.vz*dt;f.rot+=f.vr*dt;if(f.z<0){f.z=0;f.vz*=-.35;f.vx*=.55;f.vy*=.55;f.vr*=.5;}}
    if(f.t>=f.T)M.fx.splice(i,1);}
  for(let i=M.texts.length-1;i>=0;i--){const t=M.texts[i];t.t+=dt;t.y-=34*dt;if(t.t>=t.T)M.texts.splice(i,1);}
  for(let i=M.decals.length-1;i>=0;i--){const d=M.decals[i];d.t+=dt;if(d.t>=d.T)M.decals.splice(i,1);}
  for(const e of M.embers){e.y-=e.v*dt;e.x+=Math.sin(M.now*.8+e.ph)*8*dt;if(e.y<-10){e.y=MH+10;e.x=rand(0,MW);}}
  M.shake=Math.max(0,M.shake-dt*28);
}
function update(dt){
  if(M.state==='countdown'){M.cd-=dt;if(M.cd<=0){M.state='play';sfx('go');}}
  let sdt=dt;
  if(M.state==='ended'){M.endT+=dt;sdt=dt*.3;if(M.endT>1.8&&!M.shown){M.shown=true;showEnd();}}
  M.now+=sdt;if(M.state==='play')M.time-=sdt;
  M.ents=M.units.concat(M.structs.filter(s=>!s.dead));
  for(const u of M.units)updateUnit(u,sdt);
  if(M.units.some(u=>u.gone))M.units=M.units.filter(u=>!u.gone);
  for(const u of M.units){
    if(u.dead){u.hidden=false;continue;}
    u.hidden=u.cloakT>0||(u.markT<=0&&inBush(u.x,u.y)&&M.now-u.lastAttack>1.2&&M.now-u.lastHurt>1.2&&!M.units.some(e=>e.team!==u.team&&!e.dead&&(e.x-u.x)**2+(e.y-u.y)**2<120*120));
  }
  if(M.trails)for(let i=M.trails.length-1;i>=0;i--){const p=M.trails[i];p.t+=sdt;if(p.t>=p.T)M.trails.splice(i,1);}
  updateShots(sdt);updateStructs(sdt);updateFields(sdt);updateFx(sdt);
  if(M.state==='play')modeTick(sdt);
}
function endMatch(w){
  if(M.state==='ended')return;
  M.state='ended';M.endT=0;
  /* Showdown: finishing in the top 3 counts as a win */
  if(M.mode.sd){M.place=M.place||1;w=M.place<=SD_WIN_PLACES?0:M.place<=Math.ceil(M.nTeams/2)?-1:1;}
  else if(M.mode.ffa){const mine=M.score[0];M.place=1+M.score.slice(1).filter(v=>v>mine).length;w=M.place===1?0:M.place<=3?-1:1;}
  M.result=w;M.reward=applyRewards();if(!M.trial&&!M.sim&&!NETS&&S.st){const st=S.st,k=M.mode.id;st.modes[k]=st.modes[k]||[0,0];st.modes[k][0]++;if(w===0)st.modes[k][1]++;if(M.mode.sd&&M.place===1)st.sdWins++;st.time+=Math.round(M.now);st.bestStreak=Math.max(st.bestStreak,S.streak|0);persist();}if(w===0&&P)say(P,'w',true);
  sfx(w===0?'win':w===1?'lose':'draw');
  if(!M.trial)for(const u of M.units)if(u.ai&&!u.dead&&Math.random()<.6)sendPin(u,(u.team===0)===(w===0)?pick(['b:gg','b:happy','b:laugh']):pick(['b:sad','b:gg','b:angry']));
}
const ROAD_MAX=100,TROPHY_MAX=10000,HELL_AT=5000;
/* Trophy road: 100 steps up to 10,000. Every 1,000 trophies = an Amazing Drop. */
function roadReward(n){if(n%10===0)return{drop:'ultra',n:n===100?3:n>=50?2:1,gems:30+n*2,chromos:1000+n*40};if(n%5===0)return{drop:n>=50?'legendary':'mythic',coins:600+n*40,pp:300+n*15};
  if(n%5===3)return{drop:n>=60?'mythic':'epic',coins:300+n*20};const c=[{coins:400+n*30},{chromos:600+n*45},{gems:20+n},{pp:300+n*20}];return c[(n-1)%4];}
function roadLabel(rw){const out=[];for(const k of['coins','chromos','gems','pp'])if(rw[k])out.push('+'+fmtFull(rw[k])+' '+CUR_NAME[k]);if(rw.drop)out.unshift((rw.n>1?rw.n+' ':'')+RARITY[rw.drop].name+' Drop'+(rw.n>1?'s':''));return out.join(', ');}
function applyRewards(){
  if(M.trial||M.sim)return{trial:true,sim:!!M.sim,trophies:0,coins:0,pp:0,gems:0,chromos:0,rp:0,prestige:0,road:[],rank:null};
  const w=M.result,me=S.owned[P.b.id],r={trophies:0,coins:0,pp:0,gems:0,chromos:P.kills*CHROMOS_PER_KO,rp:0,prestige:0,road:[],rank:null};
  if(M.ranked){
    if(w===0){S.streak++;r.rp=25+Math.min(15,(S.streak-1)*5);r.coins=100;r.pp=50;r.gems=3;}else if(w===1){S.streak=0;r.rp=-15;r.coins=30;r.pp=15;}else{r.coins=50;r.pp=25;}
    S.rp=Math.max(0,S.rp+r.rp);S.rpBest=Math.max(S.rpBest,S.rp);const after=rankInfo(S.rp).i;
    if(after>=RANK_STEPS-1&&w===0){const k=1+Math.floor(Math.max(0,S.rp-(RANK_STEPS-1)*100)/100);r.coins+=60*k;r.pp+=30*k;r.gems+=Math.min(25,2*k);r.chromos+=100*k;r.masterBonus=k;}
    if(after>(S.rankPeak|0)){S.rankPeak=after;r.rank=after;r.rankWaiting=true;}
  }else if(M.mode.sd){const n=M.nTeams,i=clamp(M.place,1,n)-1,TT={8:[10,5,2,0,-1,-2,-3,-4],5:[10,5,2,-1,-3],4:[10,5,2,-3]}[n]||[10,5,2,0,-1,-2,-3,-4],CC={8:[50,40,32,25,18,14,12,10],5:[50,38,26,16,10],4:[50,34,20,12]}[n]||[50,40,32,25,18,14,12,10],PT={8:[30,25,20,15,12,10,8,6],5:[30,22,15,10,6],4:[30,20,12,8]}[n]||[30,25,20,15,12,10,8,6],t=TT[i];r.trophies=S.trophies<50?Math.max(0,t):t;r.coins=CC[i];r.pp=PT[i];if(i===0)r.gems=2;
  }else if(M.mode.ffa){const i=M.place-1;const t=[10,7,3,0,-2,-4][i];r.trophies=S.trophies<50?Math.max(0,t):t;r.coins=[45,35,25,15,12,10][i];r.pp=[25,20,15,10,8,6][i];if(i===0)r.gems=2;}
  else{const tr=S.trophies;if(w===0){r.trophies=tr<500?8:tr<1000?7:tr<2000?6:tr<3000?5:4;r.coins=40;r.pp=25;r.gems=Math.random()<.5?2:1;}else if(w===1){r.trophies=tr<50?0:tr<500?-2:tr<1000?-3:tr<2000?-4:-5;r.coins=15;r.pp=10;}else{r.coins=25;r.pp=15;}}
  /* Star Player: nobody in the match got more takedowns than you. Worth extra trophies, win or lose. */
  {let st=null;for(const u of M.units)if(!u.shadow&&(u.kills||0)>0&&(!st||u.kills>st.kills||u===P&&u.kills===st.kills))st=u;
   M.star=st;if(st===P&&!M.ranked){r.star=true;r.trophies+=STAR_PLAYER_TROPHIES;}}
  if(w===0){S.wins++;if(halloweenOn()){S.hw.wins++;r.knock=S.hw.wins%KNOCK_EVERY===0;}if(me&&me.prestige<PRESTIGE_MAX){me.prestige++;r.prestige=1;if(PRESTIGE_REWARDS[me.prestige]&&(me.prClaim||0)<me.prestige)grantPrestige(P.b.id,me.prestige,r);}}
  S.matches++;
  if(!M.left){const old=S.pass.xp;r.passXp=Math.round(((w===0?40:w===1?15:25)+Math.min(30,P.kills*5))*(M.ranked?1.5:1));S.pass.xp+=r.passXp;
    if(w===0){S.pass.wins++;if(S.pass.wins%PASS_WIN_EVERY===0){S.pass.xp+=PASS_STEP;r.passWinTier=true;}}
    const t1=passTier(S.pass.xp);if(t1>passTier(old))r.passUp=t1;
    if(w===0){const plan=winDropPlan();if(S.dropDay.n<WIN_DROPS_PER_DAY){const pr=plan[S.dropDay.n],lucky=pr==='rare'?null:pr;r.drop=lucky||'any';S.drops.push(lucky?{r:lucky,min:null,g:1}:{r:null,min:null});S.dropDay.n++;}else r.dropCap=true;}}
  S.trophies=clamp(S.trophies+r.trophies,0,TROPHY_MAX);S.best=Math.max(S.best,S.trophies);
  while(Math.floor(S.best/100)>S.road&&S.road<ROAD_MAX){S.road++;const rw=roadReward(S.road);r.road.push(rw);S.coins+=rw.coins||0;S.gems+=rw.gems||0;S.pp+=rw.pp||0;S.chromos+=rw.chromos||0;if(rw.drop)for(let k=0;k<(rw.n||1);k++)S.drops.push({r:rw.drop,min:null});}
  S.coins+=r.coins;S.pp+=r.pp;S.gems+=r.gems;S.chromos+=r.chromos;
  persist();return r;
}
function giveRankReward(i,r){const rw=rankReward(i),b=r.rankBundle;
  r.chromos+=rw.chromos;r.gems+=rw.gems;r.coins+=rw.coins;r.pp+=rw.pp;b.chromos+=rw.chromos;b.gems+=rw.gems;b.coins+=rw.coins;b.pp+=rw.pp;
  for(const d of rw.drops)for(let k=0;k<d.n;k++){S.drops.push({r:d.r,min:null});b.drops++;}
  if(rw.master){S.masterAll=true;for(const id in S.owned)grantSkin(id,'master');if(!S.pins.includes('master'))S.pins.push('master');r.master=true;}}
/* Claim: collect every rank reward reached this climb, then go back to Bronze I. Rank sets get new random rumblers next climb (Master stays Ember). */
/* you must reach Gold I (step 6) before you can claim and reset */
const CLAIM_MIN_STEP=6;
function claimRanked(){const r={chromos:0,gems:0,coins:0,pp:0,rankBundle:{chromos:0,gems:0,coins:0,pp:0,drops:0},rankSets:[]};const peak=S.rankPeak|0;if(peak<=(S.rankClaimed|0)||peak<CLAIM_MIN_STEP)return null;
  for(let i=(S.rankClaimed|0)+1;i<=peak;i++)giveRankReward(i,r);
  RANK_SETS.forEach((rs,k)=>{if(rs.idx<=peak){const rid=rankSetRumbler(k,rankSeed(S));if(!hasSkin(rid,rs.skin.id)||!S.pins.includes(rs.pin)){grantRankSet(k);r.rankSets.push(k);}}});
  S.coins+=r.coins;S.pp+=r.pp;S.gems+=r.gems;S.chromos+=r.chromos;
  S.rp=0;S.rankPeak=0;S.rankClaimed=0;S.streak=0;S.rankCycle=(S.rankCycle|0)+1;persist();return r;}

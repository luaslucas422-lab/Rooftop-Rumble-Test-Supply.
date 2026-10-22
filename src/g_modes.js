
/* ---------- Modes ---------- */
const ZR=115,PAD_R=62;
const inZone=u=>dist(u.x,u.y,ZX,ZY)<ZR;
function modeSetup(){
  const id=M.mode.id;
  if(id==='core'){M.cores=[0,1].map(t=>makeStruct('core',t,(MAP.cores||[[500,1460],[500,140]])[t][0],(MAP.cores||[[500,1460],[500,140]])[t][1],{rad:36,hp:45000,name:'Core'}));
    for(const t of[0,1]){const bots=M.units.filter(u=>u.team===t&&u.ai);if(bots[0])bots[0].ai.role='def';}}
  if(id==='crown')M.crown={x:ZX,y:ZY,carrier:null,cd:0,live:false};
  if(id==='stand'||id==='knockout')M.storm={r:1000};
  if(id==='knockout'){M.round=1;M.roundT=0;}
  if(id==='hunt')for(const u of M.units)u.bounty=2;
  if(id==='boss'||id==='duel'){const foes=M.units.filter(u=>u.team===1),mates=M.units.filter(u=>u.team===0&&u!==P);const keep=foes[0];
    const drop=id==='boss'?foes.slice(1):foes.slice(1).concat(mates);M.units=M.units.filter(u=>!drop.includes(u));M.ents=M.ents.filter(u=>!drop.includes(u));
    if(id==='boss'&&keep){keep.boss=true;keep.maxHp=Math.round(keep.maxHp*10);keep.hp=keep.maxHp;keep.baseHp=keep.maxHp;keep.rad=Math.round(keep.rad*1.7);keep.dmgMul*=1.4;keep.baseDmg=keep.dmgMul;keep.name='Giant '+keep.b.name;keep.lvl=MAX_LVL;if(keep.ai)keep.ai.skill=SKILL.insane;}}
  if(id==='chaos')for(const u of M.units)u.super=1;
  if(id==='bounty')for(const u of M.units)u.streak=0;
  if(M.mode.sd){M.storm={r:960,fill:'rgba(40,150,70,.42)',edge:'rgba(150,255,170,.85)',fog:'#2f9a4f'};M.boxes=MAP.boxes.map(b=>makeStruct('box',99,b[0],b[1],{rad:22,hp:1000,name:'Box'}));}
}
function own(team,arr){return arr[team===0?0:1];}
function modeOnKill(t,c){const id=M.mode.id;if(M.state!=='play')return;
  if(id==='ring')M.score[c.team]=Math.min(M.mode.goal,M.score[c.team]+5);
  else if(id==='rush'||id==='frenzy'||id==='try'||id==='chaos'||id==='duel')M.score[c.team]++;
  else if(id==='hunt'){const v=t.bounty||2;M.score[c.team]=Math.min(M.mode.goal,M.score[c.team]+v);if(!c.shadow&&!c.isStruct)c.bounty=Math.min(7,(c.bounty||2)+1);t.bounty=2;textFx(t.x,t.y-t.rad-40,'+'+v+'\u2605',c.team===MYT?'#8fd3ff':'#ffa6a2',16);}
  else if(id==='bounty'){const v=1;M.score[c.team]=Math.min(M.mode.goal,M.score[c.team]+v);c.streak=(c.streak||0)+1;t.streak=0;if(c===P||t===P)textFx(t.x,t.y-t.rad-40,'+'+v+'\u2605',c.team===0?'#8fd3ff':'#ffa6a2',16);}
}
function modeOnDeath(t){
  if(M.mode.sd&&!t.shadow){const n=Math.max(1,Math.ceil(t.cubes/2));for(let i=0;i<n;i++)dropCube(t.x,t.y,150);t.cubes=0;t.maxHp=Math.round(t.baseHp*(1+.1*t.cubes));t.dmgMul=t.baseDmg*(1+.1*t.cubes);}
  if(t.carry>0){for(let i=0;i<t.carry;i++){const a=rand(0,TAU),v=rand(60,160);M.items.push({x:t.x,y:t.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,cd:.5,t:0,ph:rand(0,6)});}t.carry=0;}
  if(M.crown&&M.crown.carrier===t){M.crown.carrier=null;M.crown.x=t.x;M.crown.y=t.y;M.crown.cd=.6;ringFx(t.x,t.y,10,60,.4,'#ffd23f',5);}
}
/* Knockout: everyone comes back at their spawn for the next round */
function nextRound(w){M.round=(M.round||1)+1;M.roundT=0;M.storm.r=1000;M.units=M.units.filter(u=>!u.shadow);M.shots.length=0;M.fields.length=0;if(M.trails)M.trails.length=0;
  for(const u of M.units){respawnUnit(u);u.shield=2.5;u.super=Math.min(1,u.super);}
  textFx(ZX,ZY-60,w==null?'Draw! Round '+M.round:(w===MYT?'Round won!':'Round lost')+' \u00b7 Round '+M.round,'#ffd23f',26);sfx('go');}
function alive(team){return M.units.filter(u=>u.team===team&&!u.dead&&!u.shadow).length;}
function endIf(){
  const m=M.mode,id=m.id,s=M.score,out=M.time<=0;
  if(id==='try'){if(out)return endMatch(-1);return;}
  if(M.mode.sd){
    if(M.elim[0]&&!NETS)return endMatch(null);
    const left=[];for(let k=0;k<M.nTeams;k++)if(!M.elim[k])left.push(k);
    if(left.length<=1){M.place=1;return endMatch(null);}
    if(out){const tc=k=>M.units.filter(u=>u.team===k&&!u.shadow).reduce((n,u)=>n+u.cubes,0),mine=tc(0);M.place=1+left.filter(k=>k!==0&&tc(k)>mine).length;return endMatch(null);}return;}
  if(m.ffa){const top=Math.max(...s);if(top>=m.goal||out)return endMatch(null);return;}
  if(id==='core'){const d0=M.cores[0].dead,d1=M.cores[1].dead;if(d0||d1)return endMatch(d0&&d1?-1:d1?0:1);
    if(out){const a=M.cores[0].hp/M.cores[0].maxHp,b=M.cores[1].hp/M.cores[1].maxHp;return endMatch(Math.abs(a-b)<.01?-1:a>b?0:1);}return;}
  if(id==='boss'){const g=M.units.find(u=>u.boss);if(!g||g.dead)return endMatch(0);if(out)return endMatch(1);return;}
  if(id==='knockout'){const a=alive(0),b=alive(1);
    if(!a||!b){if(a)s[0]++;else if(b)s[1]++;if(s[0]>=m.goal||s[1]>=m.goal)return endMatch(s[0]>s[1]?0:1);if(out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:-1);return nextRound(!a&&!b?null:a?0:1);}
    if(out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:a>b?0:b>a?1:-1);return;}
  if(id==='hunt'){if(s[0]>=m.goal||s[1]>=m.goal||out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:-1);return;}
  if(id==='stand'){const a=alive(0),b=alive(1);if(!a||!b)return endMatch(!a&&!b?-1:a?0:1);
    if(out){if(a!==b)return endMatch(a>b?0:1);const h=t=>M.units.filter(u=>u.team===t&&!u.dead).reduce((n,u)=>n+u.hp/u.maxHp,0);const ha=h(0),hb=h(1);return endMatch(Math.abs(ha-hb)<.05?-1:ha>hb?0:1);}return;}
  if(s[0]>=m.goal||s[1]>=m.goal||out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:-1);
}
function modeTick(dt){
  const id=M.mode.id;
  if(id==='ring'){M.tick+=dt;while(M.tick>=.5){M.tick-=.5;const c=[0,0];for(const u of M.units)if(!u.dead&&!u.shadow&&inZone(u))c[u.team]++;
    if(c[0]&&c[1])M.zone='contested';else if(c[0]){M.zone='blue';M.score[0]=Math.min(M.mode.goal,M.score[0]+1);}else if(c[1]){M.zone='red';M.score[1]=Math.min(M.mode.goal,M.score[1]+1);}else M.zone='empty';}}
  else if(id==='battery'){
    M.battT-=dt;if(M.battT<=0&&M.items.length<8){const[x,y]=openPoint(ZX,ZY,0,70);M.items.push({x,y,vx:0,vy:0,cd:.3,t:0,ph:rand(0,6)});ringFx(x,y,4,30,.35,'#5ce1a0',4);M.battT=3;}
    for(let i=M.items.length-1;i>=0;i--){const it=M.items[i];it.t+=dt;it.cd-=dt;if(it.vx||it.vy){const nx=it.x+it.vx*dt,ny=it.y+it.vy*dt;if(!hitsWall(nx,ny,8)){it.x=nx;it.y=ny;}it.vx*=1-Math.min(1,dt*4);it.vy*=1-Math.min(1,dt*4);}
      if(it.cd>0)continue;for(const u of M.units){if(u.dead||u.shadow)continue;if(dist(u.x,u.y,it.x,it.y)<u.rad+16){u.carry++;M.items.splice(i,1);sparks(it.x,it.y,'#5ce1a0',8,180,2.5);if(u===P)sfx('pickup');break;}}}
    for(const u of M.units){if(u.dead||!u.carry)continue;const pd=own(u.team,(MAP.pads||[[500,1505],[500,95]]));if(dist(u.x,u.y,pd[0],pd[1])<PAD_R){M.score[u.team]=Math.min(M.mode.goal,M.score[u.team]+u.carry);textFx(pd[0],pd[1]-40,'+'+u.carry,u.team===0?'#8fd3ff':'#ffa6a2',20);ringFx(pd[0],pd[1],10,PAD_R*1.4,.5,'#5ce1a0',6);sparks(pd[0],pd[1],'#5ce1a0',18,260,3);u.carry=0;sfx('score');}}
  }
  else if(id==='crown'){const cr=M.crown;if(!cr.live){cr.live=true;ringFx(ZX,ZY,10,90,.6,'#ffd23f',8);}
    cr.cd-=dt;if(cr.carrier){cr.x=cr.carrier.x;cr.y=cr.carrier.y;}
    else if(cr.cd<=0){let best=null,bd=28;for(const u of M.units){if(u.dead||u.shadow)continue;const d=dist(u.x,u.y,cr.x,cr.y);if(d<u.rad+bd){bd=d;best=u;}}if(best){cr.carrier=best;best.hasCrown=true;ringFx(best.x,best.y,10,70,.45,'#ffd23f',6);sfx('pickup');}}
    M.units.forEach(u=>{u.hasCrown=cr.carrier===u;});
    M.tick+=dt;while(M.tick>=.5){M.tick-=.5;if(cr.carrier)M.score[cr.carrier.team]=Math.min(M.mode.goal,M.score[cr.carrier.team]+1);}}
  else if(M.mode.sd){const el=M.mode.time-M.time;M.storm.r=el<5?960:Math.max(0,960*(1-(el-5)/130));
    M.tick+=dt;while(M.tick>=.5){M.tick-=.5;for(const u of M.units){if(u.dead)continue;if(dist(u.x,u.y,ZX,ZY)>M.storm.r){hurt(u,500,null,true);addFx({k:'smoke',x:u.x+rand(-10,10),y:u.y,vx:0,vy:-30,t:0,T:.6,s:14,col:'#3fbf6a'});}}}
    for(let i=M.cubes.length-1;i>=0;i--){const c=M.cubes[i];c.t+=dt;c.cd-=dt;if(c.vx||c.vy){const nx=c.x+c.vx*dt,ny=c.y+c.vy*dt;if(!hitsWall(nx,ny,8)){c.x=nx;c.y=ny;}c.vx*=1-Math.min(1,dt*4);c.vy*=1-Math.min(1,dt*4);}
      if(c.cd>0)continue;for(const u of M.units){if(u.dead||u.shadow)continue;if(dist(u.x,u.y,c.x,c.y)<u.rad+16){teamCube(u);M.cubes.splice(i,1);break;}}}}
  else if(id==='stand'||id==='knockout'){if(id==='knockout')M.roundT=(M.roundT||0)+dt;const el=id==='knockout'?M.roundT:M.mode.time-M.time;M.storm.r=el<(id==='knockout'?30:40)?1000:Math.max(150,1000-(el-(id==='knockout'?30:40))/(id==='knockout'?45:70)*850);
    M.tick+=dt;while(M.tick>=.5){M.tick-=.5;for(const u of M.units){if(u.dead)continue;if(dist(u.x,u.y,ZX,ZY)>M.storm.r){hurt(u,u.maxHp*.07,null);addFx({k:'smoke',x:u.x+rand(-10,10),y:u.y,vx:0,vy:-30,t:0,T:.6,s:14,col:'#7a3fbf'});}}}}
  endIf();
}
function modeObjective(u){
  const id=M.mode.id,ai=u.ai;
  if(id==='ring'){if(!ai.zp||Math.random()<.002)ai.zp=openPoint(ZX,ZY,0,78);return ai.zp;}
  if(id==='boss'){const g=M.units.find(x=>x.boss&&!x.dead);if(u.boss){let best=null,bd=900;for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}return best?[best.x,best.y]:[ZX,ZY];}if(g)return[g.x,g.y];}
  if(id==='duel'||id==='chaos'||id==='bounty'||id==='hunt'||id==='rush'){let best=null,bd=900;for(const e of M.units){if(e.team===u.team||e.dead||e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}if(best&&id==='duel')return[best.x,best.y];if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,260);return ai.zp;}
  if(id==='rush'||id==='try'){if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,260);return ai.zp;}
  if(id==='frenzy'){let best=null,bd=750;for(const e of M.units){if(e===u||e.dead||e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}if(best)return[best.x,best.y];if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,300);return ai.zp;}
  if(M.mode.sd){
    let best=null,bd=420;for(const c of M.cubes){if(dist(c.x,c.y,ZX,ZY)>M.storm.r-30)continue;const d=dist(u.x,u.y,c.x,c.y);if(d<bd){bd=d;best=c;}}if(best)return[best.x,best.y];
    const calmP=M.now<SD_CALM,mine=b=>!calmP||!M.units.some(e=>e!==u&&!e.dead&&e.team!==u.team&&dist(e.x,e.y,b.x,b.y)<dist(u.x,u.y,b.x,b.y));
    let bx=null,bb=750;for(const b of M.boxes){if(b.dead||dist(b.x,b.y,ZX,ZY)>M.storm.r-40||!mine(b))continue;const d=dist(u.x,u.y,b.x,b.y);if(d<bb){bb=d;bx=b;}}
    if(bx){const a=Math.atan2(u.y-bx.y,u.x-bx.x),R=Math.max(55,Math.min(rangeOf(u)*.7,220));return[bx.x+Math.cos(a)*R,bx.y+Math.sin(a)*R];}
    if(calmP&&u.spawn){if(!ai.cp)ai.cp=openPoint(u.spawn[0]+(ZX-u.spawn[0])*.3,u.spawn[1]+(ZY-u.spawn[1])*.3,0,90);return ai.cp;}
    const lim=Math.max(90,M.storm.r*.55);if(!ai.zp||dist(ai.zp[0],ai.zp[1],ZX,ZY)>lim||Math.random()<.003)ai.zp=openPoint(ZX,ZY,0,lim);return ai.zp;}
  if(id==='stand'||id==='knockout'){const lim=Math.min(260,M.storm.r*.55);if(!ai.zp||dist(ai.zp[0],ai.zp[1],ZX,ZY)>lim||Math.random()<.003)ai.zp=openPoint(ZX,ZY,0,lim);return ai.zp;}
  if(id==='battery'){const pd=own(u.team,(MAP.pads||[[500,1505],[500,95]]));
    if(u.carry>=3||(u.carry>0&&(M.score[u.team]+u.carry>=M.mode.goal||u.hp/u.maxHp<.45)))return pd;
    let best=null,bd=1e9;for(const it of M.items){const d=dist(u.x,u.y,it.x,it.y);if(d<bd){bd=d;best=it;}}
    if(best)return[best.x,best.y];if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,110);return ai.zp;}
  if(id==='crown'){const cr=M.crown;if(cr.carrier===u)return u.spawn;if(cr.carrier&&cr.carrier.team===u.team)return[cr.carrier.x+Math.cos(u.phase)*70,cr.carrier.y+Math.sin(u.phase)*70];return[cr.x,cr.y];}
  if(id==='core'){const mine=own(u.team,M.cores),theirs=own(1-u.team,M.cores);
    const threat=M.units.some(e=>e.team!==u.team&&!e.dead&&dist(e.x,e.y,mine.x,mine.y)<380);
    if(ai.role==='def'||threat&&dist(u.x,u.y,mine.x,mine.y)<500){if(!ai.dp||Math.random()<.004)ai.dp=openPoint(mine.x,mine.y+(u.team===0?-110:110),0,70);return ai.dp;}
    const R=rangeOf(u)*.8,a=Math.atan2(u.y-theirs.y,u.x-theirs.x);return[theirs.x+Math.cos(a)*R,theirs.y+Math.sin(a)*R];}
  return[ZX,ZY];
}
function modeHud(){
  const m=M.mode,id=m.id,s0=M.score,s=MYT===1&&!m.ffa&&!m.sd?[s0[1],s0[0]]:s0;
  if(M.mode.sd){const alive=M.units.filter(u=>!u.dead&&!u.shadow).length,el=m.time-M.time,cb=P?P.cubes:0,tl=sdTeamsLeft(),team=m.size>1;
    return{l:team?tl/m.teams:alive/(m.players||8),r:Math.min(1,cb/10),lt:team?tl+' teams left':alive+' left',rt:'Cubes '+cb,msg:el<5?'Storm in '+Math.ceil(5-el)+'s · break boxes for energy cubes':M.storm.r>0?'The green storm is closing in':'The storm covers everything!'};}
  if(m.ffa){const mine=s[MYT],others=s.filter((_,i)=>i!==MYT),top=Math.max(...others),place=1+others.filter(v=>v>mine).length;
    return{l:mine/m.goal,r:top/m.goal,lt:'You '+mine,rt:'Leader '+top,msg:'You are '+ORD[place-1]+' of 6'};}
  if(id==='try')return{l:Math.min(1,s[0]/10),r:0,lt:'Takedowns '+s[0],rt:'Training',msg:'Trying '+P.b.name+' at level '+MAX_LVL+' · no rewards'};
  if(id==='core'){const a=M.cores[MYT],b=M.cores[1-MYT],pa=Math.max(0,a.hp/a.maxHp),pb=Math.max(0,b.hp/b.maxHp);return{l:pa,r:pb,lt:'Core '+Math.ceil(pa*100)+'%',rt:Math.ceil(pb*100)+'% Core',msg:'Smash the red core'};}
  if(id==='boss'){const g=M.units.find(u=>u.boss),pg=g?Math.max(0,g.hp/g.maxHp):0;return{l:alive(MYT)/3,r:pg,lt:alive(MYT)+' standing',rt:'Giant '+Math.ceil(pg*100)+'%',msg:'Take down the '+(g?g.name:'giant')+'!'};}
  if(id==='duel')return{l:s[0]/m.goal,r:s[1]/m.goal,lt:'You '+s[0],rt:s[1]+' Them',msg:'First to '+m.goal+' takedowns'};
  if(id==='knockout'){const a=alive(MYT),b=alive(1-MYT);return{l:s[0]/m.goal,r:s[1]/m.goal,lt:'Rounds '+s[0],rt:s[1]+' Rounds',msg:'Round '+(M.round||1)+' \u00b7 '+a+' vs '+b+' left'+((M.roundT||0)>25?' \u00b7 storm!':'')};}
  if(id==='hunt')return{l:s[0]/m.goal,r:s[1]/m.goal,lt:s[0]+' / '+m.goal+' \u2605',rt:s[1]+' / '+m.goal+' \u2605',msg:'First to '+m.goal+' stars \u00b7 bigger bounties are worth more'};
  if(id==='stand'){const a=alive(MYT),b=alive(1-MYT),el=m.time-M.time;return{l:a/3,r:b/3,lt:a+' left',rt:b+' left',msg:el<40?'Storm in '+Math.ceil(40-el)+'s':'The storm is closing in'};}
  const g=m.goal,base={l:s[0]/g,r:s[1]/g,lt:String(s[0]),rt:String(s[1])};
  if(id==='ring')base.msg={blue:'Your team holds the ring',red:'Enemies hold the ring',contested:'Ring contested',empty:'Grab the ring'}[MYT&&M.zone==='blue'?'red':MYT&&M.zone==='red'?'blue':M.zone];
  else if(id==='bounty')base.msg='Stars '+s[0]+' / '+g+' \u00b7 every takedown is a star';
  else if(id==='chaos')base.msg='Supers charge 4\u00d7 faster!';
  else if(id==='battery'){base.lt=s[0]+' / '+g;base.rt=s[1]+' / '+g;base.msg=P&&P.carry?'You carry '+P.carry+' — bring them to your charger':'Grab batteries from the middle';}
  else if(id==='crown'){const c=M.crown.carrier;base.msg=!c?'The crown is free':c===P?'You have the crown!':c.team===MYT?c.name+' has the crown':'Enemy '+c.name+' has the crown';}
  else if(id==='rush')base.msg='First to '+g+' takedowns';
  return base;
}

/* ---------- Bot AI ---------- */
function rangeOf(u){const a=u.b.atk;return(a.kind==='melee'||a.kind==='pulse'||a.kind==='starslash'?a.range+20:a.range)*(1+u.mods.range);}
function aimAt(u,t,spec,sk){
  let px=t.x,py=t.y;const d=dist(u.x,u.y,t.x,t.y);
  if(spec.spd){const tt=d/spec.spd;px+=t.vx*tt*sk.lead;py+=t.vy*tt*sk.lead;}else if(spec.flight){px+=t.vx*spec.flight*sk.lead;py+=t.vy*spec.flight*sk.lead;}
  return[Math.atan2(py-u.y,px-u.x)+(Math.random()*2-1)*sk.aimErr,dist(u.x,u.y,px,py)];
}
function autoAim(u,kind){
  if(kind==='sup'&&u.b.sup.kind==='leap'){const e=leapTarget(u);return[e?Math.atan2(e.y-u.y,e.x-u.x):u.aim,0];}
  if(kind==='sup'&&u.b.sup.kind==='grabthrow')return[bestThrowAngle(u),0];
  const spec=kind==='atk'?u.b.atk:u.b.sup,range=(spec.range||spec.radius||300)*(1+u.mods.range);
  const noLos=['lob','orbs','meteor','bigbomb','nova','heal','field','root','pulse','dam'].includes(spec.kind);
  let best=null,bd=1e9;
  for(const e of foesOf(u.team)){if(e.hidden||e.kind==='core'&&M.units.some(x=>x.team!==u.team&&!x.dead&&dist(u.x,u.y,x.x,x.y)<range))continue;const d=dist(u.x,u.y,e.x,e.y),sc=d+(e.isStruct&&e.kind!=='core'?150:0);if(d<range*1.25&&sc<bd&&(noLos||los(u.x,u.y,e.x,e.y))){bd=sc;best=e;}}
  if(!best)return[u.aim,spec.kind==='dam'?140:range*.8];
  return aimAt(u,best,spec,{lead:.75,aimErr:0});
}
function setMode(u,m){u.ai.mode=m;}
/* Showdown starts with a calm looting phase so nobody is knocked out in the first few seconds */
const SD_CALM=35;
function think(u){
  const ai=u.ai,sk=ai.skill,lob=u.b.atk.kind==='lob'||u.b.atk.kind==='orbs',id=M.mode.id;
  let best=null,bs=1e9;
  const nearUnit=M.units.some(e=>e.team!==u.team&&!e.dead&&!e.hidden&&dist(u.x,u.y,e.x,e.y)<260),calm=M.mode.sd&&M.now<SD_CALM&&M.now-(u.lastHurt==null?-99:u.lastHurt)>3;
  for(const e of foesOf(u.team)){
    if(e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>(sk.sight||680))continue;if(calm&&!e.isStruct)continue;
    let s=d;
    if(e.isStruct){if(e.kind==='core'){if(nearUnit||d>rangeOf(u)+160)continue;s+=120;}else s+=110;}
    else{s-=(1-e.hp/e.maxHp)*160*(sk.focus??1);if(M.units.some(m=>m!==u&&m.ai&&m.team===u.team&&m.ai.target===e))s-=90*(sk.focus??1);if(e.super>=1&&d<400)s-=40;if(e.hasCrown)s-=220;s-=e.carry*45;if(id==='ring'&&inZone(e))s-=60;}
    if(!(lob||los(u.x,u.y,e.x,e.y)))s+=220;
    if(s<bs){bs=s;best=e;}
  }
  ai.target=best;
  const hpR=u.hp/u.maxHp,near=M.units.some(e=>e.team!==u.team&&!e.dead&&!e.hidden&&dist(u.x,u.y,e.x,e.y)<460);
  if(ai.mode==='retreat'){if(hpR>.85||(!near&&hpR>.6))setMode(u,'objective');return;}
  if(hpR<sk.retreat&&near&&u.super<1&&id!=='stand'&&!M.mode.sd){setMode(u,'retreat');return;}
  if(id==='battery'&&u.carry>=3&&!(best&&!best.isStruct&&dist(u.x,u.y,best.x,best.y)<190)){setMode(u,'objective');return;}
  if(id==='crown'&&M.crown.carrier===u&&!(best&&dist(u.x,u.y,best.x,best.y)<rangeOf(u))){setMode(u,'objective');return;}
  if(best){const d=dist(u.x,u.y,best.x,best.y),reach=rangeOf(u)+(ai.mode==='fight'?260:180);setMode(u,d<reach?'fight':'objective');}else setMode(u,'objective');
}
function scanDodge(u){
  const ai=u.ai;if(ai.dodgeT>0)return;
  for(const s of M.shots){
    if(s.team===u.team||(s.seen&&s.seen.has(u.id)))continue;
    if(s.lob){if(dist(s.tx,s.ty,u.x,u.y)<s.splash+u.rad+10&&s.T-s.t<.6){(s.seen||(s.seen=new Set())).add(u.id);if(Math.random()<ai.skill.dodge){const a=Math.atan2(u.y-s.ty,u.x-s.tx);ai.dvx=Math.cos(a)*1.4;ai.dvy=Math.sin(a)*1.4;ai.dodgeT=.45;return;}}continue;}
    const dx=u.x-s.x,dy=u.y-s.y;if(dx*dx+dy*dy>240*240)continue;
    const sp=Math.hypot(s.vx,s.vy)||1;if((dx*s.vx+dy*s.vy)/sp<=0)continue;
    const cross=dx*s.vy-dy*s.vx;if(Math.abs(cross)/sp>u.rad+s.r+12)continue;
    (s.seen||(s.seen=new Set())).add(u.id);
    if(Math.random()<ai.skill.dodge){const side=Math.sign(cross)||(Math.random()<.5?1:-1);ai.dvx=s.vy/sp*side*1.5;ai.dvy=-s.vx/sp*side*1.5;ai.dodgeT=.35;return;}
  }
}
function aiSuper(u,tgt,sk){
  const s=u.b.sup,foes=foesOf(u.team).filter(e=>!e.hidden),d=tgt?dist(u.x,u.y,tgt.x,tgt.y):1e9,see=tgt&&los(u.x,u.y,tgt.x,tgt.y);
  switch(s.kind){
    case 'nova':case 'root':if(foes.some(e=>dist(u.x,u.y,e.x,e.y)<s.radius*.8))trySuper(u,u.aim,0);break;
    case 'heal':{const mates=M.units.filter(a=>a.team===u.team&&!a.dead&&dist(u.x,u.y,a.x,a.y)<s.radius),low=mates.filter(a=>a.hp/a.maxHp<.55);if(low.length&&(low.length>=2||u.hp/u.maxHp<.45||mates.some(a=>a!==u&&a.hp/a.maxHp<.4)))trySuper(u,u.aim,0);break;}
    case 'dam':if(tgt&&d<320||u.hp/u.maxHp<.5&&tgt){const[a]=tgt?aimAt(u,tgt,{},sk):[u.aim];trySuper(u,a,Math.min(d*.6,s.range));}break;
    case 'starzone':if(tgt&&!tgt.isStruct&&d<s.range*.92){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'leap':{const e=leapTarget(u);if(e)trySuper(u,Math.atan2(e.y-u.y,e.x-u.x),0);break;}
    case 'thunder':if(foes.filter(e=>!e.isStruct&&dist(u.x,u.y,e.x,e.y)<s.radius*.75).length)trySuper(u,u.aim,0);break;
    case 'grabthrow':if(grabTarget(u))trySuper(u,bestThrowAngle(u),0);break;
    case 'homebat':if(M.units.some(e=>e.team!==u.team&&!e.dead&&!e.hidden&&dist(u.x,u.y,e.x,e.y)<s.seek*.85))trySuper(u,u.aim,0);break;
    case 'meteor':if(tgt&&!tgt.isStruct&&d<s.range*.9){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'turret':if(tgt&&d<s.reach)trySuper(u,u.aim,0);break;
    case 'shockcone':if(tgt&&d<s.range*.85&&see){const[a]=aimAt(u,tgt,{},sk);trySuper(u,a,d);}break;
    case 'beam':case 'bigbomb':case 'field':case 'boomerang3':case 'bigwave':case 'chainbig':if(tgt&&d<(s.range||300)*.92&&(see||s.kind==='bigbomb'||s.kind==='field')){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'magnet':case 'sawring':case 'mushring':if(foes.filter(e=>!e.isStruct&&dist(u.x,u.y,e.x,e.y)<(s.radius||s.range*.7)).length)trySuper(u,u.aim,0);break;
    case 'tongue':case 'shadowstep':if(tgt&&!tgt.isStruct&&d<s.range*.9&&(see||s.kind==='shadowstep')){const[a]=aimAt(u,tgt,{},sk);trySuper(u,a,d);}break;
    case 'rainbow':case 'starfall':if(tgt&&d<s.range*.9){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'scaffold':if(tgt&&d<420&&u.hp/u.maxHp<.7)trySuper(u,Math.atan2(tgt.y-u.y,tgt.x-u.x),0);break;
    case 'darkdive':if(tgt&&d<520&&onTrail(u))trySuper(u,u.aim,0);break;
    case 'phoenix':case 'dash':if(tgt&&d<s.range*.8&&d>60&&losWide(u.x,u.y,tgt.x,tgt.y,u.rad*.8)){const[a]=aimAt(u,tgt,s,sk);trySuper(u,a,d);}break;
  }
}
function aiGadget(u,tgt,dt){
  if(!u.gadget||u.gUses<=0||u.gCd>0||Math.random()>dt*(u.ai.skill.gad??2.5))return;
  const g=u.gadget.type,hpR=u.hp/u.maxHp,d=tgt?dist(u.x,u.y,tgt.x,tgt.y):1e9;let use=false,dir=null;
  switch(g){
    case 'heal':use=hpR<.4;break;
    case 'pickrarity':use=tgt&&d<500;break;
    case 'healzone':use=M.units.some(a=>a.team===u.team&&!a.dead&&a.hp/a.maxHp<.6&&dist(u.x,u.y,a.x,a.y)<130);break;
    case 'reloadzone':use=tgt&&d<rangeOf(u)+120;break;case 'shield':use=hpR<.65&&M.now-u.lastHurt<.4;break;
    case 'speed':use=u.ai.mode==='retreat'||(tgt&&d<320&&u.b.pref<.3);break;case 'reload':use=u.ammo<1&&tgt&&d<rangeOf(u);break;
    case 'dash':if(u.ai.mode==='retreat'&&hpR<.3&&tgt){use=true;dir=Math.atan2(u.y-tgt.y,u.x-tgt.x);}else if(tgt&&u.b.pref<.3&&d<320&&d>110){use=true;dir=Math.atan2(tgt.y-u.y,tgt.x-u.x);}break;
    case 'blast':case 'pull':case 'slowfield':use=tgt&&!tgt.isStruct&&d<130;break;
    case 'reveal':use=M.units.some(e=>e.team!==u.team&&!e.dead&&e.hidden)||(tgt&&Math.random()<.2);break;
    case 'shotgun':use=tgt&&!tgt.isStruct&&d<300&&los(u.x,u.y,tgt.x,tgt.y);break;
  }
  if(use)useGadget(u,dir);
}
function aiUpdate(u,dt){
  const ai=u.ai,sk=ai.skill;
  ai.t-=dt;ai.strafeT-=dt;ai.fireCd-=dt;ai.dodgeT-=dt;ai.pinCd-=dt;
  /* bots send random emotes now and then */
  if(ai.emoteT==null)ai.emoteT=rand(6,22);ai.emoteT-=dt;if(ai.emoteT<=0&&!M.trial){ai.emoteT=rand(10,30);if(Math.random()<.55){const all=BASIC_PINS.concat(PREMIUM_PINS,DAILY_ONLY_PINS,TROLL_PINS,GEN_PINS,halloweenOn()?HALLOWEEN_PINS:[]).map(p=>p[0]);sendPin(u,'b:'+pick(all));}}
  if(ai.strafeT<=0){ai.strafeDir*=-1;ai.strafeT=rand(.6,1.5);}
  if(ai.t<=0){ai.t=sk.react*rand(.7,1.3);think(u);}
  let tgt=ai.target;if(tgt&&(tgt.dead||tgt.hidden))tgt=ai.target=null;
  let mx=0,my=0;
  if(ai.mode==='retreat'){let th=null,td=1e9;for(const e of M.units){if(e.team===u.team||e.dead||e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<td){td=d;th=e;}}
    const mate=M.units.filter(m=>m!==u&&m.team===u.team&&!m.dead&&!m.shadow).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];
    if(mate&&dist(u.x,u.y,mate.x,mate.y)>90&&(!th||dist(mate.x,mate.y,th.x,th.y)>td))[mx,my]=steer(u,mate.x,mate.y);
    else if(th&&td<500&&!M.mode.sd){const ax2=u.x+(u.x-th.x)/td*260,ay2=u.y+(u.y-th.y)/td*260;[mx,my]=steer(u,clamp(ax2,60,MW-60),clamp(ay2,60,MH-60));}
    else [mx,my]=steer(u,u.spawn[0],u.spawn[1]);}
  else if(ai.mode==='fight'&&tgt){
    const d=dist(u.x,u.y,tgt.x,tgt.y),ang=Math.atan2(tgt.y-u.y,tgt.x-u.x),R=rangeOf(u),pref=tgt.isStruct?R*.75:R*u.b.pref;
    const clear=u.b.atk.kind==='lob'||los(u.x,u.y,tgt.x,tgt.y);
    if(!clear||d>R*.9){[mx,my]=steer(u,tgt.x,tgt.y);}
    else if(d<pref*.75){const sw=.6*(sk.strafe??1);mx=-Math.cos(ang)-Math.sin(ang)*ai.strafeDir*sw;my=-Math.sin(ang)+Math.cos(ang)*ai.strafeDir*sw;}
    else{const sw=tgt.isStruct?.4:(sk.strafe??1);mx=-Math.sin(ang)*ai.strafeDir*sw;my=Math.cos(ang)*ai.strafeDir*sw;
      if(pref<1){mx+=Math.cos(ang)*1.2;my+=Math.sin(ang)*1.2;}
      else{const o=modeObjective(u),od=dist(u.x,u.y,o[0],o[1]);if(od>140){mx+=(o[0]-u.x)/od*.35;my+=(o[1]-u.y)/od*.35;}}}
  } else {const o=modeObjective(u);if(dist(u.x,u.y,o[0],o[1])>14)[mx,my]=steer(u,o[0],o[1]);else if(ai.zp&&Math.random()<dt*.9)ai.zp=null;}
  if(M.storm&&dist(u.x,u.y,ZX,ZY)>M.storm.r-60){const d=dist(u.x,u.y,ZX,ZY)||1;mx+=(ZX-u.x)/d*1.5;my+=(ZY-u.y)/d*1.5;}
  /* step out of enemy damage zones */
  for(const f of M.fields){if(f.team===u.team||!f.radius)continue;const d=dist(u.x,u.y,f.x,f.y);if(d<f.radius+u.rad+6&&d>.01){mx+=(u.x-f.x)/d*1.4;my+=(u.y-f.y)/d*1.4;}}
  scanDodge(u);
  if(ai.dodgeT>0){mx=mx*.35+ai.dvx;my=my*.35+ai.dvy;}
  for(const o of M.units){if(o===u||o.dead||o.team!==u.team)continue;const dx=u.x-o.x,dy=u.y-o.y,dd=dx*dx+dy*dy;if(dd<55*55&&dd>.01){const d=Math.sqrt(dd);mx+=dx/d*.5*(1-d/55);my+=dy/d*.5*(1-d/55);}}
  const want=Math.hypot(mx,my)>.3;
  ai.stuckT=(want&&Math.hypot(u.x-ai.lx,u.y-ai.ly)<.4)?ai.stuckT+dt:0;ai.lx=u.x;ai.ly=u.y;
  if(ai.stuckT>.45){ai.unstickT=.4;const s=Math.random()<.5?1:-1;ai.ux=-my*s;ai.uy=mx*s;ai.stuckT=0;}
  if(ai.unstickT>0){ai.unstickT-=dt;mx=ai.ux;my=ai.uy;}
  if(tgt&&ai.mode==='fight')u.aim=Math.atan2(tgt.y-u.y,tgt.x-u.x);else if(Math.hypot(mx,my)>.1)u.aim=Math.atan2(my,mx);
  if(tgt&&M.state==='play'){
    const d=dist(u.x,u.y,tgt.x,tgt.y),a=u.b.atk,R=rangeOf(u),inR=(a.kind==='melee'||a.kind==='pulse'||a.kind==='starslash')?d<=R-20+tgt.rad-2:d<=R*.95;
    if(inR&&ai.fireCd<=0&&u.ammo>=1&&(a.kind==='lob'||a.kind==='spore'||a.kind==='phase'||a.kind==='orbs'||a.kind==='pulse'||los(u.x,u.y,tgt.x,tgt.y))){const[ang,dd]=aimAt(u,tgt,a,sk);if(tryAttack(u,ang,dd))ai.fireCd=rand(sk.fire[0],sk.fire[1]);}
  }
  if(M.state==='play'){if(u.super>=1&&Math.random()<dt*(sk.sup??20))aiSuper(u,tgt,sk);aiGadget(u,tgt,dt);}
  return[mx,my];
}

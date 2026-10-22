
/* ---------- Match state ---------- */
let M=null,P=null,paused=false,uid=0;
const BOT_BASE=['Kestrel','Mopsy','Zap','Dottie','Grit','Bix','Tumble','Rue','Ozzy','Pell','Juno','Hazel','Fen','Wobble','Pix','Tilly','Brook','Milo','Ziggy','Pepper','Nacho','Biscuit','Waffle','Pickle','Noodle','Mango','Toast','Bean','Sunny','Rocket','Blip','Dash','Echo','Fizzy','Gizmo','Hopper','Jinx','Kiwi','Lumen','Maple','Nugget','Orbit','Pogo','Quinn','Rascal','Scout','Taco','Ufo','Vortex','Wren','Yoyo','Zest','Ash','Bolt','Cleo','Duke','Ember','Frost','Gus','Indie'];
const BOT_ADJ=['Sneaky','Mega','Tiny','Turbo','Lucky','Spicy','Shadow','Cosmic','Super','Silent','Hyper','Crazy','Royal','Pixel','Icy','Blazing','Golden','Wild','Epic','Fluffy','Rapid','Dark','Neon','Toxic','Sly'];
const BOT_NOUN=['Ninja','Gamer','Panda','Wolf','Tiger','Fox','Dragon','Shark','Knight','Wizard','Pirate','Robot','Viking','Ghost','Falcon','Bandit','Raccoon','Penguin','Llama','Goblin','Comet','Storm','Racer','Hero','King','Queen','Boss','Pro','Beast','Cat'];
function botName(){const r=Math.random(),n=pick(BOT_BASE),a=pick(BOT_ADJ),o=pick(BOT_NOUN),d=randi(1,99),y=randi(10,99),x=pick(['x','_','']);
  if(r<.18)return n;if(r<.34)return a+o;if(r<.46)return n+d;if(r<.56)return a+'_'+n;if(r<.66)return x+o+y+x;if(r<.74)return 'The'+a+o;if(r<.82)return n.toLowerCase()+'.'+o.toLowerCase();if(r<.9)return o+'Lord'+d;return a+o+y;}
const BOT_NAMES={slice(){const s=new Set();while(s.size<12)s.add(botName().slice(0,14));return[...s];}};
function unitMods(star){const m={hp:0,dmg:0,speed:0,reloadspd:0,charge:0,regen:0,lifesteal:0,range:0,tossplus:0,selfish:0,kind:0,splash:0,slowplus:0,chainplus:0,turretplus:0,split6:0,lodge:0,maxsteal:0,shadows:0,shadowlife:0,zoneplus:0,darkvenom:0,darkheal:0};const g=star&&gearById(star);if(g&&g.type in m)m[g.type]=g.val;return m;}
/* Trick: everything random, never the same pick twice in a row */
const pickNew=(list,prev)=>{const l=list.length>1?list.filter(x=>x!==prev):list;return l[Math.floor(Math.random()*l.length)];};
/* What Trick can roll depends on his level: 1-4 common to epic, 5-10 adds mythic and legendary, 11 is everything (Amazing and Pass rumblers too) */
function trickRarities(lvl){return lvl>=11?null:lvl>=5?['common','rare','epic','mythic','legendary']:['common','rare','epic'];}
const trickOk=(u,b)=>{const r=trickRarities(u.lvl);return!b.random&&(!r||r.includes(b.rarity));};
const TRICK_SRC=u=>RUMBLERS.filter(x=>trickOk(u,x));
function trickRarList(u){const l=[];for(const b of TRICK_SRC(u))if(!l.includes(b.rarity))l.push(b.rarity);return ORDER_RAR.filter(r=>l.includes(r));}
const ORDER_RAR=['common','rare','epic','mythic','legendary','ultra','celestial'];
function forceTrickAtk(u,r){const pool=TRICK_SRC(u).filter(b=>b.rarity===r);if(!pool.length)return;const b=pickNew(pool,u.trickAtk);u.trickAtk=b;u.b.atk=b.atk;u.rerollA=0;
  textFx(u.x,u.y-u.rad-40,RARITY[r].name+': '+b.atkName,RARITY[r].col,13);ringFx(u.x,u.y,u.rad,u.rad*3,.4,RARITY[r].col,6);}
function trickAtk(u){const b=pickNew(TRICK_SRC(u),u.trickAtk);u.trickAtk=b;u.b.atk=b.atk;}
function trickSup(u){const b=pickNew(TRICK_SRC(u),u.trickSup);u.trickSup=b;u.b.sup=b.sup;}
function trickGadget(u){const all=[];for(const k in GEAR)if(BY_ID[k]&&trickOk(u,BY_ID[k]))all.push(...GEAR[k].g);u.gadget=pickNew(all,u.gadget);}
function trickStar(u){const all=[];for(const k in GEAR)if(BY_ID[k]&&trickOk(u,BY_ID[k]))all.push(...GEAR[k].s);u.star=pickNew(all,u.star);u.mods=unitMods(u.star.id);u.baseDmg=u.mul*(1+u.mods.dmg);u.dmgMul=u.baseDmg*(1+(u.cubes||0)*.1);}
function trickReroll(u){trickAtk(u);trickSup(u);if(!u.trickPick)trickGadget(u);trickStar(u);u.gUses=3;if(u===P&&M)textFx(u.x,u.y-u.rad-40,u.trickAtk.atkName+' · '+u.trickSup.supName,'#ff9bf0',12);}
/* Bots mostly wear normal skins; earned skins (ranked, charged, supercharged, master) are rare sightings */
function botSkinWeight(sk){if(sk.supercharged)return .12;if(sk.charged)return .35;if(sk.tier==='master')return .15;if(sk.tier==='rank')return .5;if(sk.tier==='prestige')return 1;if(sk.tier==='pass')return 1.5;if(sk.tier==='troll')return 2;if(sk.tier==='power')return .25;if(sk.tier==='golden')return .6;
  return sk.tier===0?30:sk.tier===1?10:sk.tier===2?6:sk.tier===3?3:sk.tier==='sig'?5:4;}
function botSkin(b){const l=skinsOf(b).map(sk=>[sk.id,botSkinWeight(sk)]);return pickWeighted(l)[0];}
function makeUnit(b,skinId,team,o){
  const mods=unitMods(o.star),lvl=o.lvl||1,mul=mulFor(lvl);
  const u={id:++uid,b,sk:getSkin(b,skinId),team,name:o.name,isPlayer:!!o.player,lvl,mul,dmgMul:mul*(1+mods.dmg),mods,rad:b.rad,
    maxHp:Math.round(b.hp*mul*(1+mods.hp)),hp:0,x:o.spawn[0],y:o.spawn[1],vx:0,vy:0,aim:o.spawn[1]>MH/2?-Math.PI/2:Math.PI/2,
    ammo:3,atkCd:0,super:0,dead:false,respawn:0,shield:1.5,flash:0,lastHurt:-9,lastAttack:-9,dash:null,kb:null,pending:[],hidden:false,moving:false,
    kills:0,deaths:0,dmgDone:0,spawn:o.spawn,phase:Math.random()*6,slowT:0,stunT:0,markT:0,guardT:0,boostT:0,poisonT:0,poisonTick:0,poisonDmg:0,poisonSrc:null,
    damT:0,damSpeed:0,carry:0,hasCrown:false,gadget:o.gadget?gearById(o.gadget):null,gUses:3,gCd:0,pin:null,pinT:0,pinCd:0,stepT:0,afterT:0,ghosts:[],squash:0,stolen:[],shadow:false,shadowOf:null,lifeT:0,vulnT:0,zoneT:0,zoneBoss:false,ai:null};
  if(b.random){u.b=Object.create(b);u.trickAtk=null;u.trickSup=null;u.star=null;trickAtk(u);trickSup(u);if(o.gadget==='trick-g2'){u.trickPick=true;u.gadget=gearById('trick-g2');}else trickGadget(u);trickStar(u);}
  u.maxAmmo=b.ammo||3;u.ammo=b.atk.kind==='cloudzap'?0:u.maxAmmo;u.thrown=null;u.hp=u.maxHp;u.cubes=0;u.baseHp=u.maxHp;u.baseDmg=u.dmgMul;
  if(!u.isPlayer)u.ai={skill:o.skill&&typeof o.skill==='object'?o.skill:(SKILL[o.skill]||SKILL.normal),mode:'objective',target:null,t:Math.random()*.3,strafeT:1,strafeDir:Math.random()<.5?1:-1,fireCd:.6,dodgeT:0,dvx:0,dvy:0,zp:null,stuckT:0,unstickT:0,ux:0,uy:0,lx:u.x,ly:u.y,pinCd:rand(4,10)};
  return u;
}
function makeStruct(kind,team,x,y,o){const s={id:++uid,isStruct:true,kind,team,x,y,vx:0,vy:0,rad:o.rad,hp:o.hp,maxHp:o.hp,dead:false,hidden:false,flash:0,name:o.name,owner:o.owner||null,t:o.t||0,cd:0,aim:0,dmg:o.dmg||0,reach:o.reach||0,rate:o.rate||1,lastHurt:-9};M.structs.push(s);M.ents.push(s);return s;}

function botLoadout(b,lvl){const gr=GEAR[b.id];return{gadget:lvl>=GADGET_LVL?pick(gr.g).id:null,star:lvl>=STAR_LVL?pick(gr.s).id:null};}
/* Low trophies = mostly beginner rumblers; rare ones only show up as you climb */
function botRarW(r,t){const f=Math.pow(clamp(t/1200,0,1),1.3),L={common:6,rare:5,epic:.6,mythic:.08,legendary:.01,celestial:0,ultra:0}[r];return L==null?1:L+(1-L)*f;}
function botPick(excl,t,n){let pool=RUMBLERS.filter(b=>!excl.includes(b));const out=[];n=n||pool.length;
  while(out.length<n&&pool.length){const b=pickWeighted(pool.map(x=>[x,botRarW(x.rarity,t)+1e-6]))[0];out.push(b);pool=pool.filter(x=>x!==b);}return out;}
/* fair teams: one enemy always has the same rarity as your rumbler, the rest are picked the same way as your teammates */
function mirrorFoes(pb,t){const same=shuffle(RUMBLERS.filter(b=>b!==pb&&b.rarity===pb.rarity&&!b.random&&!eventLocked(b)));const first=same[0]||botPick([pb],t,1)[0];return shuffle([first].concat(botPick([pb,first],t,2)));}
function newMatch(opts){
  const mode=MODE_BY[opts.mode],mapId=opts.map&&MAPS[opts.map]?opts.map:opts.ranked?pick(mapPool(mode)):dailyMap(mode.id);loadMap(mapId);uid=0;
  M={mode,ranked:!!opts.ranked,units:[],structs:[],ents:[],shots:[],fields:[],items:[],cubes:[],boxes:[],elim:{},fx:[],decals:[],texts:[],score:[],time:mode.time,now:0,state:'countdown',cd:3.6,
     tick:0,zone:'empty',endT:0,result:null,place:0,reward:null,shown:false,nTeams:mode.teams||(mode.ffa?(mode.players||6):2),crown:null,storm:null,shake:0,battT:2,embers:[]};
  M.score=new Array(M.nTeams).fill(0);M.trails=[];M.mapId=mapId;
  const dr=opts.draft&&BY_ID[opts.draft.id]?opts.draft:null;
  const trial=opts.trial?BY_ID[opts.trial]:null,pb=trial||(dr?BY_ID[dr.id]:BY_ID[S.selected]),own0=S.owned[pb.id];M.draft=dr;
  const me=dr&&(dr.maxed||!own0)?(dr.maxed?{lvl:MAX_LVL,skin:own0?own0.skin:'classic',gadget:GEAR[pb.id].g[0].id,star:GEAR[pb.id].s[0].id}:(()=>{const l=S.owned[S.selected].lvl;return{lvl:l,skin:'classic',gadget:l>=GADGET_LVL?GEAR[pb.id].g[0].id:null,star:l>=STAR_LVL?GEAR[pb.id].s[0].id:null};})()):dr?own0:trial?{lvl:MAX_LVL,skin:opts.trialSkin||(own0?own0.skin:'classic'),gadget:GEAR[pb.id].g[0].id,star:GEAR[pb.id].s[0].id}:S.owned[S.selected];
  if(dr)M.maxed=!!dr.maxed;
  const plvl=me.lvl,names=shuffle(BOT_NAMES.slice());M.trial=!!trial;
  let eskill,elvl,mskill='hard';M.opp=null;
  if(M.ranked){const ri=rankInfo(S.rp).i,rt=ri>=RANK_STEPS-1?TIERS.length:Math.floor(ri/3);M.rankTier=rt;eskill=RANK_FOES()[rt];if(rt>=3)mskill=OPP_TIERS[3].sk;M.hell=rt===TIERS.length;
    elvl=()=>clamp(plvl+randi(-1,1),1,MAX_LVL);}
  else{const t=Math.max(0,S.trophies|0);eskill=oppSkill(t);M.opp=oppTier(t);if(t>=OPP_TIERS[3].at)mskill=oppSkill(t);if(t>=HELL_AT&&!opts.netHumans&&!trial){eskill=SKILL_HELL;mskill=OPP_TIERS[3].sk;M.hell=true;}
    elvl=()=>clamp(plvl+randi(-1,1),1,MAX_LVL);if(!(t>=HELL_AT&&!opts.netHumans&&!trial))mskill=oppSkill(t+Math.max(0,350-t*.7));}
  const bot=(b,team,spawn,skill,lvl)=>{const lo=botLoadout(b,lvl);return makeUnit(b,botSkin(b),team,{name:names.pop()||'Bot',skill:typeof skill==='object'?varySkill(skill):skill,lvl,spawn,gadget:lo.gadget,star:lo.star});};
  if(opts.sim){M.sim=true;M.watch=true;const sp=MAP.spawns,mk=(id,team,s)=>{const b=BY_ID[id],lo=botLoadout(b,MAX_LVL);return makeUnit(b,botSkin(b),team,{name:(team?'Red ':'Blue ')+b.name,skill:'hard',lvl:MAX_LVL,spawn:s,gadget:lo.gadget,star:lo.star});};
    opts.sim.blue.forEach((id,i)=>M.units.push(mk(id,0,sp[0][[1,0,2][i]])));opts.sim.red.forEach((id,i)=>M.units.push(mk(id,1,sp[1][i])));P=M.units[0];M.followU=P;}
  else if(M.trial){
    const sp=MAP.spawns;P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:sp[0][1],gadget:me.gadget,star:me.star});M.units.push(P);P.super=1;
    shuffle(RUMBLERS.filter(b=>b!==pb)).slice(0,3).forEach((b,i)=>M.units.push(bot(b,1,sp[1][i],'easy',7)));
  }else if(mode.sd&&mode.size>1){
    const anc=shuffle(SD_ANCHORS[mode.teams].map(i=>MAP.ffa[i])),pool=M.ranked?shuffle(RUMBLERS.filter(b=>b!==pb)):botPick([pb],S.trophies|0);let pi=0;
    for(let k=0;k<mode.teams;k++){const a=anc[k];for(let j=0;j<mode.size;j++){const sp=j?openPoint(a[0],a[1],40,80):a;
      if(!k&&!j){P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:sp,gadget:me.gadget,star:me.star});M.units.push(P);}
      else M.units.push(bot(pool[pi++],k,sp,k?eskill:mskill,elvl()));}}
  }else if(mode.ffa){
    const pts=shuffle(MAP.ffa.slice());
    P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:pts[0],gadget:me.gadget,star:me.star});M.units.push(P);
    const pool=botPick([pb],S.trophies|0);
    for(let i=1;i<(mode.players||6);i++)M.units.push(bot(pool[i-1],i,pts[i],eskill,elvl()));
  }else{
    const sp=MAP.spawns;
    P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:sp[0][1],gadget:me.gadget,star:me.star});M.units.push(P);
    const party=(S.party||[]).filter(f=>f&&BY_ID[f.rumbler]).slice(0,2),mates=dr?dr.mates.map(id=>BY_ID[id]):party.map(f=>BY_ID[f.rumbler]).concat(botPick([pb],S.trophies|0,4)).slice(0,2),foes=dr?dr.foes.map(id=>BY_ID[id]):mirrorFoes(pb,S.trophies|0);
    mates.forEach((b,i)=>{const f=party[i],ml=elvl();if(f&&!M.trial){const lo=botLoadout(b,ml);M.units.push(makeUnit(b,f.skin||'classic',0,{name:f.name,skill:typeof mskill==='object'?varySkill(mskill):mskill,lvl:ml,spawn:sp[0][i?2:0],gadget:lo.gadget,star:lo.star}));}else M.units.push(bot(b,0,sp[0][i?2:0],mskill,ml));});
    foes.forEach((b,i)=>M.units.push(bot(b,1,sp[1][i],eskill,elvl())));
  }
  if(M.hell&&!M.sim)for(const u of M.units)if(u.team!==0){u.maxHp=Math.round(u.maxHp*1.35);u.hp=u.maxHp;u.baseHp=u.maxHp;u.dmgMul*=1.2;u.baseDmg=u.dmgMul;}
  M.ents=M.units.slice();
  for(const u of M.units)if(u.sk.supercharged)superSpawnFx(u);else skinSpawnFx(u);
  if(opts.netHumans)netConvert(opts.netHumans);
  if(P&&!M.trial&&!M.sim&&!NETS)setTimeout(()=>{if(M&&P)say(P,'s',true);},1200);
  modeSetup();
  for(let i=0;i<40;i++)M.embers.push({x:rand(0,MW),y:rand(0,MH),s:rand(1,2.6),v:rand(8,26),ph:rand(0,TAU)});
}

/* ---------- Effects ---------- */
function addFx(o){if(M.fx.length<900)M.fx.push(o);}
function sparks(x,y,col,n,sp,s){sp=sp||200;s=s||3;for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(sp*.3,sp);addFx({k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,T:rand(.2,.45),s:rand(s*.6,s*1.3),col});}}
function smoke(x,y,n,s,col){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(10,60);addFx({k:'smoke',x:x+rand(-8,8),y:y+rand(-8,8),vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,t:0,T:rand(.6,1.1),s:rand(s*.6,s),col:col||'#3a3354'});}}
function debris(x,y,col,n){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(60,230);addFx({k:'debris',x,y,z:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:rand(120,320),t:0,T:rand(.6,1),s:rand(3,6),col,rot:rand(0,TAU),vr:rand(-12,12)});}}
function ringFx(x,y,r0,r1,T,col,w){addFx({k:'ring',x,y,r0,r1,t:0,T,col,w:w||5});}
function flashFx(x,y,r,col,T){addFx({k:'flash',x,y,r,t:0,T:T||.18,col});}
function decal(x,y,r,col,T){M.decals.push({x,y,r,col,t:0,T:T||6,rot:rand(0,TAU)});if(M.decals.length>70)M.decals.shift();}
function boltFx(x1,y1,x2,y2,col){const pts=[[x1,y1]];for(let i=1;i<6;i++){const t=i/6;pts.push([x1+(x2-x1)*t+rand(-14,14),y1+(y2-y1)*t+rand(-14,14)]);}pts.push([x2,y2]);addFx({k:'bolt',pts,t:0,T:.24,col});}
function textFx(x,y,txt,col,size){M.texts.push({x:x+rand(-8,8),y,txt:String(txt),col,t:0,T:.85,size:size||13});if(M.texts.length>60)M.texts.shift();}
function shakeAt(x,y,amt){if(!P||!S.shake||REDUCED)return;const d=dist(P.x,P.y,x,y);if(d<520)M.shake=Math.min(16,M.shake+amt*(1-d/520));}
function hitFx(x,y,col){sparks(x,y,col,7,220,2.6);flashFx(x,y,18,col,.1);}
function muzzle(u,ang,col,big){const mx=u.x+Math.cos(ang)*u.rad*1.3,my=u.y+Math.sin(ang)*u.rad*1.3;flashFx(mx,my,big?30:16,col,big?.14:.08);sparks(mx,my,col,big?10:3,big?300:160,2);}
function boom(x,y,r,col,big){flashFx(x,y,r*1.4,'#fff4c2',.16);flashFx(x,y,r*1.1,col,.3);ringFx(x,y,10,r,.35,'#ffffff',big?9:6);ringFx(x,y,10,r*1.25,.5,col,big?6:4);smoke(x,y,big?9:5,big?34:22);debris(x,y,'#3a3049',big?10:5);sparks(x,y,'#ffb347',big?22:12,big?380:260,3.5);decal(x,y,r*.75,'rgba(15,10,25,.45)');shakeAt(x,y,big?10:5);sfx(big?'bigboom':'boom');}
function swipeFx(u,ang,a,second){const rb=!!(u.sk&&u.sk.surged),gm=!!(u.sk&&u.sk.grim);if(rb||gm)u.swingT=M.now;addFx({k:'swipe',x:u.x,y:u.y,ang:ang+(second?.25:-.1),arc:a.arc,r:a.range+8,t:0,T:a.dark||rb||gm?.34:.2,col:u.sk.proj,dark:!!a.dark,rb,gm});if(gm)for(let k=0;k<5;k++)addFx({k:'smoke',x:u.x+Math.cos(ang+(k-2)*.3)*a.range*.7,y:u.y+Math.sin(ang+(k-2)*.3)*a.range*.7,t:0,T:.7,s:9,col:'rgba(61,255,138,.5)'});const ex=u.x+Math.cos(ang)*a.range*.8,ey=u.y+Math.sin(ang)*a.range*.8;if(rb){for(let k=0;k<6;k++)sparks(ex,ey,'hsl('+k*60+',95%,62%)',2,220,2.4);}else sparks(ex,ey,u.sk.proj,4,160,2);}
function superFx(u){addFx({k:'lines',x:u.x,y:u.y,t:0,T:.45,col:u.sk.proj,seed:Math.random()*10});flashFx(u.x,u.y,80,u.sk.proj,.3);ringFx(u.x,u.y,u.rad,u.rad*3.2,.4,'#ffffff',5);if(u===P)shakeAt(u.x,u.y,4);sfx('super');}
function deathFx(t){flashFx(t.x,t.y,64,'#ffffff',.18);ringFx(t.x,t.y,10,84,.45,t.sk.body,8);debris(t.x,t.y,t.sk.body,12);debris(t.x,t.y,t.sk.belly,6);sparks(t.x,t.y,t.sk.accent,16,320,3);smoke(t.x,t.y,5,24);addFx({k:'ghost',x:t.x,y:t.y,b:t.b,sk:t.sk,t:0,T:1.3});decal(t.x,t.y,26,'rgba(15,10,25,.35)');}

/* ---------- Combat ---------- */
const credit=src=>!src?src:src.isStruct?src.owner:src.shadow?src.shadowOf:src;
function hurt(t,dmg,src,raw){
  if(!t||t.dead)return 0;
  if(!t.isStruct&&t.shield>0){if(Math.random()<.3)textFx(t.x,t.y-t.rad-10,'Shield','#bff3ff',12);return 0;}
  if(t.guardT>0)dmg*=.5;if(!raw){if(t.markT>0)dmg*=1.15;if(t.vulnT>0)dmg*=1.25;if(src&&!src.isStruct&&src.zoneT>0)dmg*=1.15;}
  dmg=Math.max(1,Math.round(dmg));t.hp-=dmg;t.flash=1;t.lastHurt=M.now;if(!t.isStruct)t.squash=.6;
  const c=credit(src),mine=c===P,onMe=t===P;if(mine&&statOn())S.st.dmg+=dmg;
  textFx(t.x,t.y-t.rad-12,dmg,onMe?'#ff8a80':mine?'#fff1a6':'#ffffff',mine?(dmg>=1500?20:16):13);
  if(c&&c!==t&&!c.dead&&!c.isStruct){
    if(c.super<1){const b4=c.super;c.super=Math.min(1,c.super+(M.mode.id==='chaos'?4:1)*dmg/(c.b.superNeed*c.mul)*(1+c.mods.charge)*(t.isStruct?.5:1));if(b4<1&&c.super>=1&&c===P){ringFx(c.x,c.y,c.rad,c.rad*3,.5,SUNC,6);sfx('ready');}}
    if(c.mods.lifesteal&&!t.isStruct)heal(c,dmg*c.mods.lifesteal,true);
    c.dmgDone+=dmg;
  }
  if(onMe)shakeAt(t.x,t.y,3);
  if(t.hp<=0){if(t.isStruct)breakStruct(t,c);else kill(t,c);}
  return dmg;
}
function heal(a,amt,quiet){if(a.dead)return;const h=Math.round(Math.min(a.maxHp-a.hp,amt));if(h<=0)return;a.hp+=h;if(!quiet||h>=250)textFx(a.x,a.y-a.rad-12,'+'+h,'#6be39a',13);if(Math.random()<.5)addFx({k:'plus',x:a.x+rand(-14,14),y:a.y-rand(0,10),t:0,T:.8});}
/* Supercharged skins: golden takedown burst and a lightning entrance */
const SC_COLS=['#ffd23f','#ff7aa8','#5ef2ff','#fff3b0'];
function superKillFx(x,y){for(let k=0;k<4;k++)ringFx(x,y,10+k*6,90+k*35,.45+k*.12,SC_COLS[k],8-k);flashFx(x,y,130,'#ffd23f',.3);for(const c of SC_COLS)sparks(x,y,c,12,420,4);
  for(let k=0;k<8;k++)addFx({k:'star',x:x+Math.cos(k*TAU/8)*40,y:y+Math.sin(k*TAU/8)*40,t:0,T:.9,a:k});textFx(x,y-58,'SUPERCHARGED!','#ffd23f',16);shakeAt(x,y,7);sfx('super');}
function superSpawnFx(u){addFx({k:'beam',x:u.x,y:u.y,t:0,T:.9,col:'#ffd23f'});addFx({k:'beam',x:u.x,y:u.y,t:0,T:.7,col:'#5ef2ff'});
  for(let k=0;k<3;k++)ringFx(u.x,u.y,6,60+k*40,.5+k*.15,SC_COLS[k],6);flashFx(u.x,u.y,100,'#fff3b0',.25);for(const c of SC_COLS)sparks(u.x,u.y,c,10,300,3.5);shakeAt(u.x,u.y,4);sfx('ready');}
function voiceLine(id,ev){const v=VOICE[id]||{},l=(v[ev]&&v[ev].length?v[ev]:VOICE_GENERIC[ev])||[];return l.length?pick(l):null;}
function speakLine(txt,b){if(!S.sound||!S.voice)return;const pitch=clamp(1.55-(b.rad-17)*.12,.6,1.9);
  try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance){const u=new SpeechSynthesisUtterance(txt);u.pitch=pitch;u.rate=1.15;u.volume=.9;speechSynthesis.cancel();speechSynthesis.speak(u);return;}}catch(e){}
  const a=audio();if(!a)return;const n=Math.min(8,txt.replace(/[^a-z]/gi,'').length/2|0)||2;for(let i=0;i<n;i++)tone('square',220*pitch*(1+Math.random()*.4),200*pitch,.06,.035,i*.07);}
function say(u,ev,force){if(!M||!u||u.isStruct||u.shadow||!S.voice)return;const id=u.b.id;if(VOICE_SILENT.includes(id))return;if((u.sayCd||0)>M.now&&!force)return;
  if(u!==P&&Math.random()>.35)return;const txt=voiceLine(id,ev);if(!txt)return;u.say={txt,at:M.now};u.sayCd=M.now+4;if(u===P)speakLine(txt,u.b);}
const RB_COLS=['#ff3b5c','#ff9a1a','#ffd23f','#6be39a','#5ec8ff','#7b6cff','#d46bff'];
function surgedKillFx(x,y){RB_COLS.forEach((col,k)=>{ringFx(x,y,6+k*4,70+k*22,.4+k*.07,col,7-k*.6);sparks(x,y,col,7,380,3.4);});flashFx(x,y,140,'#ffffff',.35);addFx({k:'lines',x,y,t:0,T:.5,col:'#ffffff',seed:Math.random()*6});
  for(let k=0;k<7;k++)addFx({k:'fallstar',x:x+Math.cos(k*.9)*60,y:y+Math.sin(k*.9)*40,t:-k*.05,T:.7,col:RB_COLS[k]});}
function surgedSpawnFx(u){RB_COLS.forEach((col,k)=>{addFx({k:'beam',x:u.x,y:u.y,t:-k*.05,T:.8,col});ringFx(u.x,u.y,4,60+k*14,.5+k*.05,col,5);});sparks(u.x,u.y,'#ffffff',14,300,3);}
function grimKillFx(t){const x=t.x,y=t.y;addFx({k:'ghost',x,y,t:0,T:1.6,b:t.b,sk:{...t.sk,body:'#bfffd6',belly:'#eafff2'}});for(let k=0;k<3;k++)ringFx(x,y,6+k*6,60+k*30,.45+k*.12,k%2?'#0f3a22':'#3dff8a',7-k*2);
  sparks(x,y,'#3dff8a',22,300,3.2);for(let k=0;k<8;k++)addFx({k:'smoke',x:x+rand(-30,30),y:y+rand(-20,20),t:-k*.04,T:1.1,s:14,col:'rgba(10,20,14,.7)'});flashFx(x,y,120,'#3dff8a',.3);}
function grimSpawnFx(u){addFx({k:'beam',x:u.x,y:u.y,t:0,T:.9,col:'#3dff8a'});addFx({k:'beam',x:u.x,y:u.y,t:-.1,T:.7,col:'#0f3a22'});ringFx(u.x,u.y,4,80,.6,'#3dff8a',6);for(let k=0;k<10;k++)addFx({k:'smoke',x:u.x+rand(-34,34),y:u.y+rand(-10,20),t:-k*.03,T:1,s:13,col:'rgba(10,20,14,.75)'});sparks(u.x,u.y,'#3dff8a',16,240,3);}
function skinKillFx(x,y,sk){if(sk.surged){surgedKillFx(x,y);return;}const L=skinFx(sk),col=sk.proj||'#ffffff';if(!L)return;sparks(x,y,col,8+L*6,240+L*80,2.5+L*.6);ringFx(x,y,8,40+L*25,.35,col,4+L);
  if(L>=2){flashFx(x,y,50+L*20,col,.2);ringFx(x,y,6,30+L*20,.3,'#ffffff',3);}if(L>=4){for(let k=0;k<3;k++)ringFx(x,y,10,80+k*30,.45+k*.1,['#9d7bff','#d9b8ff','#ffffff'][k],6);for(let k=0;k<5;k++){const a=k*TAU/5;boltFx(x,y,x+Math.cos(a)*90,y+Math.sin(a)*90,'#d9b8ff');}}
  if(L>=3){for(let k=0;k<6;k++)addFx({k:'star',x:x+Math.cos(k*TAU/6)*30,y:y+Math.sin(k*TAU/6)*30,t:0,T:.7,a:k});textFx(x,y-48,sk.name+'!',col,13);shakeAt(x,y,4);}}
function skinSpawnFx(u){if(u.sk&&u.sk.surged){surgedSpawnFx(u);return;}if(u.sk&&u.sk.grim){grimSpawnFx(u);return;}const L=skinFx(u.sk),col=u.sk.proj||'#ffffff';if(L<2)return;addFx({k:'beam',x:u.x,y:u.y,t:0,T:.6,col});ringFx(u.x,u.y,6,50+L*15,.45,col,5);if(L>=3)sparks(u.x,u.y,col,16,260,3);}
function botEmote(u,good){if(!u||!u.ai||u.dead||M.trial||Math.random()>.45)return;const g=['happy','laugh','cool','gg','flex','hundred','smug','clap','fire','king','money'],b=['sad','cry','angry','rage','facepalm','sweat','heartbreak','scream','grimace','pout'];
  const pool=(good?g:b).filter(id=>BASIC_PINS.concat(PREMIUM_PINS,DAILY_ONLY_PINS,TROLL_PINS).some(p=>p[0]===id));if(pool.length)sendPin(u,'b:'+pick(pool));}
const statOn=()=>!NETS&&!NETC&&M&&!M.trial&&!M.sim&&S&&S.st;
function kill(t,c){if(statOn()&&!t.shadow&&!t.isStruct){if(c===P)S.st.kills++;if(t===P)S.st.deaths++;}setTimeout(()=>{if(M){botEmote(c,true);botEmote(t,false);}},300);
  if(c&&!t.shadow&&c.sk&&c.sk.grim&&!t.isStruct)grimKillFx(t);else if(c&&!t.shadow&&c.sk&&!c.sk.supercharged)skinKillFx(t.x,t.y,c.sk);
  if(c&&!c.isStruct&&!c.shadow&&c!==t)say(c,'k');if(!t.isStruct&&!t.shadow)say(t,'d');
  if(c&&!t.shadow&&c.sk&&c.sk.supercharged)superKillFx(t.x,t.y);
  if(t.shadow){t.dead=true;t.gone=true;t.respawn=Infinity;smoke(t.x,t.y,5,22,'#3a2266');sparks(t.x,t.y,'#b48cff',12,240,2.5);ringFx(t.x,t.y,8,50,.35,'#b48cff',5);return;}
  if(t.stolen.length){const n=t.stolen.length;t.stolen.length=0;textFx(t.x,t.y-t.rad-34,'Lost '+n+' absorbed attack'+(n>1?'s':''),'#d9c2ff',14);sparks(t.x,t.y,'#b48cff',22,300,3);ringFx(t.x,t.y,t.rad*3,t.rad,.45,'#b48cff',6);}
  if(c&&c!==t&&c.b.atk.kind==='orbs'&&t.b.id!==c.b.id){const cap=c.mods.maxsteal||15;
    if(!c.stolen.includes(t.b.id)&&c.stolen.length<cap){c.stolen.push(t.b.id);(c.stolenSk||(c.stolenSk={}))[t.b.id]=t.sk.id;textFx(c.x,c.y-c.rad-44,'+'+t.b.name+"'s attack",'#d9c2ff',15);ringFx(c.x,c.y,c.rad,c.rad*3.2,.5,'#b48cff',7);addFx({k:'lines',x:c.x,y:c.y,t:0,T:.45,col:'#b48cff',seed:Math.random()*10});if(c===P)sfx('unlock');}}
  t.dead=true;t.hp=0;t.respawn=M.mode.id==='stand'||M.mode.id==='knockout'||t.boss?Infinity:M.mode.id==='chaos'?1.5:M.mode.id==='duel'?2:M.mode.sd?sdRespawn(t):(M.mode.ffa?2.5:3.5);
  t.dash=null;t.kb=null;t.thrown=null;t.leap=null;t.strongFist=false;t.pending.length=0;t.deaths++;t.slowT=t.stunT=t.poisonT=t.markT=t.vulnT=0;
  modeOnDeath(t);deathFx(t);
  if(c&&c!==t){c.kills++;modeOnKill(t,c);if(c.ai&&Math.random()<.35)sendPin(c,pick(['b:laugh','b:gg','b:happy','b:thumb','b:ez','b:clown','b:L']));}
  if(t.ai&&Math.random()<.3)sendPin(t,pick(['b:sad','b:angry']));
  onKillFeed(c,t);
  if(t===P){shakeAt(t.x,t.y,12);sfx('ko');}else sfx('pop');
}
function breakStruct(s){s.dead=true;s.hp=0;
  if(s.kind==='box'){debris(s.x,s.y,'#2f5f9e',10);debris(s.x,s.y,'#c98f55',6);smoke(s.x,s.y,3,18);flashFx(s.x,s.y,40,'#7fd3ff',.15);ringFx(s.x,s.y,6,44,.35,'#7fd3ff',5);dropCube(s.x,s.y,0);sfx('crack');return;}
  const core=s.kind==='core';boom(s.x,s.y,core?170:70,core?(s.team===0?BLUE:RED):'#ffb347',core);if(core)debris(s.x,s.y,'#8c8fb0',20);}
function punchFx(u,ang,a){const ex=u.x+Math.cos(ang)*a.range*.75,ey=u.y+Math.sin(ang)*a.range*.75;ringFx(ex,ey,8,46,.22,u.sk.proj,7);flashFx(ex,ey,40,'#ffffff',.12);sparks(ex,ey,u.sk.proj,10,260,3);shakeAt(u.x,u.y,3);sfx('bass');}
/* Juggler's Big Toss: grab the nearest enemy, then throw them; damage grows with how far they fly */
function grabTarget(u){const s=u.b.sup;let best=null,bd=s.grab;for(const e of M.units){if(e.team===u.team||e.dead||e.thrown||(e.hidden&&e.markT<=0))continue;const d=dist(u.x,u.y,e.x,e.y)-e.rad;if(d<bd&&los(u.x,u.y,e.x,e.y)){bd=d;best=e;}}return best;}
function leapTarget(u,ang){const s=u.b.sup;let best=null,bd=s.zone;const foe=e=>e.team!==u.team;
  const cands=M.units.filter(e=>e!==u&&!e.dead&&(foe(e)?!(e.hidden&&e.markT<=0):s.allies)&&dist(u.x,u.y,e.x,e.y)<s.zone);if(!cands.length)return null;
  if(!s.allies){for(const e of cands){const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}return best;}
  if(ang!=null){let sc=1e9;for(const e of cands){const v=Math.abs(angDiff(ang,Math.atan2(e.y-u.y,e.x-u.x)))*300+dist(u.x,u.y,e.x,e.y)*.3;if(v<sc){sc=v;best=e;}}return best;}
  const hurtAlly=cands.filter(e=>!foe(e)&&e.hp/e.maxHp<.6).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(hurtAlly)return hurtAlly;
  const foes=cands.filter(foe);return(foes.length?foes:cands).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];}
function zapTarget(u,ang){const a=u.b.atk,z=a.zone*(1+u.mods.range);let best=null,sc=1e9;for(const e of M.ents){if(e.team===u.team||e.dead||(e.hidden&&e.markT<=0&&dist(u.x,u.y,e.x,e.y)>80))continue;const d=dist(u.x,u.y,e.x,e.y);if(d>z+e.rad)continue;const v=d+(ang==null?0:Math.abs(angDiff(ang,Math.atan2(e.y-u.y,e.x-u.x)))*160)+(e.isStruct?200:0);if(v<sc){sc=v;best=e;}}return best;}
function tossDist(u){return u.b.sup.dist*(1+u.mods.tossplus);}
function bestThrowAngle(u){const e=grabTarget(u),max=tossDist(u),base=e?Math.atan2(e.y-u.y,e.x-u.x):u.aim;let best=base,bl=-1;
  for(let k=0;k<16;k++){const a=base+k*TAU/16,l=rayLen(u.x,u.y,a,max+u.rad*2)-Math.abs(angDiff(a,base))*20;if(l>bl){bl=l;best=a;}}return best;}
function landThrow(e){const th=e.thrown;e.thrown=null;if(e.dead)return;const f=clamp(th.trav/th.max,0,1),dmg=th.dmg*(th.min+(1-th.min)*f);
  hurt(e,dmg,th.src);ringFx(e.x,e.y,e.rad,e.rad*3.4,.4,'#ffd23f',8);smoke(e.x,e.y,8,22);shakeAt(e.x,e.y,8+f*6);stun(e,.45);sfx('bass');
  if(th.src===P||e===P)textFx(e.x,e.y-e.rad-40,Math.round(f*100)+'% toss',f>.8?'#ffd23f':'#ffffff',14);}
function knock(e,a,f){if(!e.dead&&!e.isStruct&&f)e.kb={vx:Math.cos(a)*f,vy:Math.sin(a)*f,t:.16};}
function stun(e,t){if(!e.isStruct&&!e.dead){e.stunT=Math.max(e.stunT,t);e.dash=null;}}
function slowE(e,t,src){if(!e.isStruct&&!e.dead)e.slowT=Math.max(e.slowT,t*(src&&src.mods&&src.mods.slowplus?2:1));}
const foesOf=team=>M.ents.filter(e=>e.team!==team&&!e.dead);
/* Dark: poisoned enemies leave black trails that Dark can dive into */
function darkPoison(src,e,dps,dur){if(!e||e.dead||e.isStruct)return;e.poisonT=dur;e.poisonDmg=dps;e.poisonSrc=src;e.poisonTick=1;e.darkT=Math.max(e.darkT||0,dur);e.darkSrc=src;ringFx(e.x,e.y,6,36,.3,'#5a2a8a',4);}
function addTrail(owner,victim,x,y){if(!M.trails)M.trails=[];if(M.trails.length>700)M.trails.shift();M.trails.push({x,y,t:0,T:7,owner,victim,rb:!!(owner&&owner.sk&&owner.sk.surged),gm:!!(owner&&owner.sk&&owner.sk.grim)});}
const onTrail=u=>!!M.trails&&M.trails.some(p=>p.owner===u&&(p.x-u.x)**2+(p.y-u.y)**2<55*55);
function meleeHit(u,ang,a,R){
  const range=a.range*R,dmg=a.dmg*u.dmgMul*(a.dark&&u.mods.darkvenom?.8:1);
  for(const e of M.ents){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>range+e.rad)continue;const an=Math.atan2(e.y-u.y,e.x-u.x);if(Math.abs(angDiff(ang,an))>a.arc/2&&d>e.rad+u.rad)continue;if(!los(u.x,u.y,e.x,e.y))continue;
    hurt(e,dmg,u);hitFx(e.x,e.y,u.sk.proj);if(a.bat&&!e.isStruct){batEffects(u,e,a.bat.poison*u.dmgMul,a.bat.dur);sfx('crack');}if(a.burn&&!e.isStruct){e.poisonT=a.burn.dur;e.poisonDmg=a.burn.dps*u.dmgMul;e.poisonSrc=u;e.poisonTick=1;e.burnT=a.burn.dur;}if(a.dark&&!e.isStruct){darkPoison(u,e,a.dark.dps*u.dmgMul*(u.mods.darkvenom?.7:1),a.dark.dur);if(a.dark.steal&&!u.dead){const hl=Math.min(u.maxHp-u.hp,dmg*a.dark.steal);if(hl>0){u.hp+=hl;if(Math.random()<.5)addFx({k:'plus',x:u.x+rand(-10,10),y:u.y-u.rad,t:0,T:.6});}}}if(a.kb)knock(e,an,a.kb);if(a.pull)knock(e,an+Math.PI,a.pull);}
  if(a.dark&&u.mods.darkheal)for(const e of M.units){if(e===u||e.team!==u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>range+e.rad)continue;const an=Math.atan2(e.y-u.y,e.x-u.x);if(Math.abs(angDiff(ang,an))>a.arc/2&&d>e.rad+u.rad)continue;e.hot={t:2,amt:u.mods.darkheal*u.mul,tick:0};ringFx(e.x,e.y,6,36,.3,'#6be39a',4);}
  if(a.healAlly){const amt=a.healAlly*u.mul*(u.mods.kind?1.5:1);
    for(const e of M.units){if(e===u||e.team!==u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>range+e.rad)continue;const an=Math.atan2(e.y-u.y,e.x-u.x);if(Math.abs(angDiff(ang,an))>a.arc/2&&d>e.rad+u.rad)continue;
      if(u.mods.selfish){const dm=Math.min(amt,e.hp-1);if(dm>0){e.hp-=dm;e.flash=1;textFx(e.x,e.y-e.rad-12,'-'+Math.round(dm),'#ff8a80',12);heal(u,dm);}}
      else{heal(e,amt);if(u.mods.kind){const c=Math.min(amt*.3,u.hp-1);if(c>0){u.hp-=c;textFx(u.x,u.y-u.rad-12,'-'+Math.round(c),'#ff8a80',11);}}}}}
}
function pulseHit(u,range,dmg){ringFx(u.x,u.y,u.rad,range,.3,u.sk.proj,8);ringFx(u.x,u.y,u.rad,range*.7,.22,'#ffffff',4);flashFx(u.x,u.y,range*.6,u.sk.proj,.15);
  for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<range+e.rad&&los(u.x,u.y,e.x,e.y)){hurt(e,dmg,u);hitFx(e.x,e.y,u.sk.proj);}}sfx('bass');}
function spawnShot(u,ang,o){
  const cx=Math.cos(ang),sy=Math.sin(ang),x=o.x!=null?o.x:u.x+cx*u.rad*.8,y=o.y!=null?o.y:u.y+sy*u.rad*.8;
  const s={team:u.team,owner:u,x,y,vx:cx*o.spd,vy:sy*o.spd,spd:o.spd,left:o.range,range:o.range,dmg:o.dmg,r:o.r,pierce:!!o.pierce,style:o.style||'orb',hit:new Set(o.hit||[]),
    color:o.color||u.sk.proj,slow:o.slow||0,chain:o.chain||null,kb:o.kb||0,stun:o.stun||0,rang:o.rang?{back:false,life:0}:null,split:o.split||0,splitDmg:o.splitDmg||0,splitRange:o.splitRange||0,trail:[],seen:null,big:!!o.big,age:0,spin:0,spread:o.spread||null,seek:o.seek||null,ghost:!!o.ghost,curve:o.curve||0,bounce:o.bounce||0,sawDps:o.sawDps||0,splat:o.splat||0,boom:o.boom||0};
  M.shots.push(s);return s;
}
function spawnLob(u,tx,ty,o){M.shots.push({lob:true,team:u.team,owner:u,sx:u.x,sy:u.y,x:u.x,y:u.y,h:0,tx,ty,t:0,T:o.flight,dmg:o.dmg,splash:o.splash||0,big:!!o.big,r:o.big?13:9,color:o.color||u.sk.proj,onLand:o.onLand||null,after:o.after||null,seen:null,style:o.style||u.b.id});}
function explode(s){
  if(s.onLand&&s.onLand.kind==='meteor'){meteorImpact(s);return;}
  if(s.onLand){createField(s.owner,s.tx,s.ty,s.onLand);return;}
  boom(s.tx,s.ty,s.splash,s.color==='#3a2f4f'?'#ffb347':s.color,s.big);
  for(const e of M.ents){if(e.team===s.team||e.dead)continue;if(dist(s.tx,s.ty,e.x,e.y)<s.splash+e.rad)hurt(e,s.dmg,s.owner);}
  if(s.after&&s.owner)createField(s.owner,s.tx,s.ty,s.after);
}
function createField(u,x,y,f){
  const fl={team:u.team,owner:u,x,y,r:f.radius,t:0,dur:f.dur,dps:f.dps||0,slow:!!f.slow,pull:f.pull||0,kind:f.kind,tick:0,heal:f.heal||0,speed:f.speed||0,poison:f.poison||0,poisonT:f.poisonT||0};
  M.fields.push(fl);
  if(f.kind==='dam'){ringFx(x,y,20,f.radius,.5,'#7fd3ff',8);debris(x,y,'#8a5a3b',14);smoke(x,y,4,26,'#6aa9c9');sfx('build');}
  else if(f.kind==='starzone'){flashFx(x,y,f.radius*1.2,'#9d7bff',.35);ringFx(x,y,10,f.radius,.5,'#ffd36b',8);sparks(x,y,'#ffe48a',22,f.radius*2.2,3);shakeAt(x,y,5);sfx('zap');}
  else if(f.kind==='hole'){flashFx(x,y,f.radius,'#9d7bff',.4);ringFx(x,y,f.radius*1.3,10,.5,'#c9b5ff',6);sfx('zap');}
  else{ringFx(x,y,10,f.radius,.4,'#c9f0ff',6);sparks(x,y,'#e6f8ff',18,260,3);sfx('freeze');}
}
function splitLog(s,t){
  const n=s.split,base=Math.atan2(s.vy,s.vx);
  for(let i=0;i<n;i++){const a=base+(-.95+1.9*i/(n-1));spawnShot(s.owner,a,{x:t.x,y:t.y,spd:540,range:s.splitRange,dmg:s.dmg*s.splitDmg,r:7,style:'splinter',hit:[t.id],color:'#c48a5a'});}
  debris(t.x,t.y,'#a0673f',8);sparks(t.x,t.y,'#ffd9a8',8,240,2.5);sfx('crack');
}
function doChain(s,first){
  let from=first,dmg=s.dmg;const hit=new Set([first.id]);
  for(let j=0;j<s.chain.jumps;j++){
    let best=null,bd=s.chain.jumpR;
    for(const e of M.ents){if(e.team===s.team||e.dead||hit.has(e.id)||e.kind==='core')continue;const d=dist(from.x,from.y,e.x,e.y);if(d<bd&&los(from.x,from.y,e.x,e.y)){bd=d;best=e;}}
    if(!best)break;dmg*=s.chain.falloff;boltFx(from.x,from.y,best.x,best.y,s.color);hurt(best,dmg,s.owner);if(s.chain.stun)stun(best,s.chain.stun);hitFx(best.x,best.y,s.color);hit.add(best.id);from=best;
  }
}

function volleyDmg(a){return a.kind==='spread'||a.kind==='burst'||a.kind==='paint'||a.kind==='nails'?a.n*a.dmg:a.kind==='crescent'?a.dmg*2:a.kind==='starslash'?a.dmg+a.shards*a.shardDmg:a.kind==='orbs'?a.dmg*2:a.double?a.dmg*2:a.kind==='boomerang'?a.dmg*2:a.dmg;}
function doAttackSpec(u,a,id,ang,dh,m,R,col){
  switch(a.kind){
    case 'spread':for(let i=0;i<a.n;i++){const off=a.n===1?0:-a.arc/2+a.arc*i/(a.n-1);spawnShot(u,ang+off+rand(-.03,.03),{spd:a.spd,range:a.range*R*rand(.94,1),dmg:a.dmg*m,r:a.r,pierce:a.pierce,color:col,style:id==='ember'?'flame':id==='quill'?'needle':id==='fang'?'claw':'orb'});}muzzle(u,ang,col||u.sk.proj);sfx(id==='ember'?'flame':'shoot');break;
    case 'cloudzap':{const e=zapTarget(u,ang);if(!e)break;const cx=u.x,cy=u.y-u.rad*2.4;boltFx(cx,cy,e.x,e.y,'#fff3a0');boltFx(cx,cy,e.x,e.y,'#8fd3ff');hurt(e,a.dmg*m,u);hitFx(e.x,e.y,'#fff3a0');flashFx(e.x,e.y,30,'#bfe6ff',.12);sfx('zap');
      {const hit=new Set([e.id]);let from=e;for(let j=0;j<(a.jumps||0);j++){let nx=null,nd=a.jumpR||150;for(const o of M.ents){if(o.team===u.team||o.dead||hit.has(o.id))continue;const d=dist(from.x,from.y,o.x,o.y);if(d<nd){nd=d;nx=o;}}if(!nx)break;hit.add(nx.id);boltFx(from.x,from.y,nx.x,nx.y,'#fff3a0');hurt(nx,a.dmg*m,u);hitFx(nx.x,nx.y,'#fff3a0');from=nx;}}break;}
    case 'fist':{const st=!!u.strongFist;u.strongFist=false;const col=st?'#ffd23f':u.sk.proj;const sh=spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:(st?a.strongDmg:a.dmg)*m,r:st?a.r*1.35:a.r,kb:st?a.strongKb:a.kb,style:'fist',color:col,big:st});sh.fist={strong:st,far:st?a.strongFar:a.far};muzzle(u,ang,col);sfx(st?'bass':'swish');break;}
    case 'crescent':for(const sd of[-1,1]){spawnShot(u,ang-sd*.45,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,curve:sd*a.curve,color:col,style:'moon'});}sfx('swish');break;
    case 'saw':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,sawDps:a.sawDps*m,color:col||'#c9c2b6',style:'rang'});sfx('swish');break;
    case 'bounce':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,bounce:1,color:col,style:'orb'});muzzle(u,ang,col||u.sk.proj);sfx('pew');break;
    case 'paint':for(let i=0;i<a.n;i++){const off=-a.arc/2+a.arc*i/(a.n-1);spawnShot(u,ang+off,{spd:a.spd,range:a.range*R*rand(.9,1),dmg:a.dmg*m,r:a.r,splat:a.splat*m,color:col||['#ff5e87','#ffd23f','#5ec8ff'][i%3],style:'orb'});}sfx('pew');break;
    case 'spore':{const d=clamp(dh==null?a.range:dh,40,a.range*R);spawnLob(u,u.x+Math.cos(ang)*d,u.y+Math.sin(ang)*d,{flight:a.flight,dmg:a.dmg*m,splash:a.splash,color:col||'#b9f27c',style:'mossy',after:{radius:70,dur:2,dps:a.dps*m,heal:a.heal,kind:'spore'}});sfx('lob');break;}
    case 'nails':for(let i=0;i<a.n;i++){const fire=()=>{if(u.dead)return;spawnShot(u,ang+rand(-.05,.05),{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,boom:a.boom*m,color:col,style:'rivet'});muzzle(u,ang,col||u.sk.proj);sfx('tick');};if(i===0)fire();else u.pending.push({t:a.gap*i,fn:fire});}break;
    case 'starslash':{meleeHit(u,ang,{...a,kind:'melee',dmg:a.dmg*m/u.dmgMul},R);swipeFx(u,ang,a);for(let i=0;i<a.shards;i++)spawnShot(u,ang-.3+.3*i,{spd:700,range:220*R,dmg:a.shardDmg*m,r:6,color:col||'#ffd36b',style:'orb'});sfx('swish');break;}
    case 'phase':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,ghost:true,color:col||'#b56cff',style:'laser'});muzzle(u,ang,col||'#b56cff');sfx('laser');break;
    case 'single':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:a.pierce,slow:a.slow,color:col,style:a.style||(a.slow?'shard':a.pierce?'laser':'bolt')});muzzle(u,ang,col||u.sk.proj);if(a.style==='ball'){swipeFx(u,ang,{arc:1.5,range:34});sfx('crack');}else sfx(a.pierce?'laser':'shoot');break;
    case 'burst':for(let i=0;i<a.n;i++){const fire=()=>{if(u.dead)return;spawnShot(u,ang+rand(-.04,.04),{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,color:col,style:id==='pebble'?'stone':'rivet'});muzzle(u,ang,col||u.sk.proj);sfx('tick');};if(i===0)fire();else u.pending.push({t:a.gap*i,fn:fire});}break;
    case 'melee':{const sp={...a,dmg:a.dmg*m/u.dmgMul};meleeHit(u,ang,sp,R);if(a.punch)punchFx(u,ang,a);else swipeFx(u,ang,a);if(a.double)u.pending.push({t:.14,fn:()=>{meleeHit(u,ang,sp,R);swipeFx(u,ang,a,true);}});sfx('swish');break;}
    case 'lob':{const d=clamp(dh==null?a.range:dh,40,a.range*R);spawnLob(u,u.x+Math.cos(ang)*d,u.y+Math.sin(ang)*d,{flight:a.flight,dmg:a.dmg*m,splash:a.splash*(1+u.mods.splash),color:col,style:id});sfx('lob');break;}
    case 'orbs':{const d=clamp(dh==null?a.range:dh,40,a.range*R),tx=u.x+Math.cos(ang)*d,ty=u.y+Math.sin(ang)*d,px=-Math.sin(ang)*26,py=Math.cos(ang)*26,sp=a.splash*(1+u.mods.splash);
      spawnLob(u,tx+px,ty+py,{flight:a.flight,dmg:a.dmg*m,splash:sp,color:'#ffd36b',style:'sun'});spawnLob(u,tx-px,ty-py,{flight:a.flight*1.08,dmg:a.dmg*m,splash:sp,color:'#cfe3ff',style:'moon2'});sfx('lob');break;}
    case 'boomerang':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,rang:true,color:col,style:id==='luna'?'moon':'rang'});sfx('swish');break;
    case 'wave':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,color:col,style:'wave'});sfx('splash');break;
    case 'chain':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,color:col,style:'spark',chain:{jumps:a.jumps+u.mods.chainplus,jumpR:a.jumpR,falloff:a.falloff,stun:0}});muzzle(u,ang,col||u.sk.proj);sfx('zap');break;
    case 'pulse':pulseHit(u,a.range*R,a.dmg*m);break;
    case 'star':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,slow:a.slow,color:col,style:'star',spread:{n:a.spread+u.mods.chainplus,r:a.spreadR}});muzzle(u,ang,col||u.sk.proj);sfx('laser');break;
    case 'log':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,color:col,style:'log',split:u.mods.split6?6:a.split,splitDmg:a.splitDmg,splitRange:a.splitRange});sfx('lob');break;
  }
}
function tryAttack(u,ang,dh){
  if(NETC&&u===P){netAct('atk',ang,dh);return true;}
  if(!M||u.dead||u.dash||u.stunT>0||u.ammo<1||u.atkCd>0||M.state!=='play')return false;
  if(u.b.atk.kind==='cloudzap'&&!zapTarget(u,ang))return false;
  SFXU=u;u.ammo-=1;u.atkCd=.28;u.lastAttack=M.now;u.shield=0;u.aim=ang;u.squash=.35;
  const a=u.b.atk,m=u.dmgMul,R=1+u.mods.range;
  if(u.stolen.length){
    /* Meteorite: base sun & moon plus every absorbed attack, capped at 100,000 total damage per volley */
    let total=volleyDmg(a)*m;for(const id of u.stolen)total+=volleyDmg(BY_ID[id].atk)*m;
    const k=Math.min(1,100000/total);
    doAttackSpec(u,a,u.b.id,ang,dh,m*k,R,null);
    for(const id of u.stolen){const sa=BY_ID[id].atk;doAttackSpec(u,sa,id,ang,dh,m*k,1,'#b48cff');}
    addFx({k:'ring',x:u.x,y:u.y,r0:u.rad,r1:u.rad*2.2,t:0,T:.25,col:'#b48cff',w:4});
  }else doAttackSpec(u,a,u.trickAtk?u.trickAtk.id:u.b.id,ang,dh,m,R,null);
  if(u.b.random)u.rerollA=.25;
  return true;
}
function spawnShadow(owner,bid,x,y){
  const b=BY_ID[bid];if(!b)return;const p=openPoint(x,y,10,60);
  const sk=(owner.stolenSk&&owner.stolenSk[bid])||'classic',u=makeUnit(b,skinsOf(b).some(k=>k.id===sk)?sk:'classic',owner.team,{name:'Shadow '+b.name,skill:'hard',lvl:owner.lvl,spawn:p});
  u.shadow=true;u.shadowOf=owner;u.lifeT=8+(owner.mods.shadowlife||0);u.maxHp=Math.round(u.maxHp*.5);u.hp=u.maxHp;u.dmgMul*=.5;u.shield=0;u.super=0;
  M.units.push(u);smoke(p[0],p[1],4,20,'#3a2266');ringFx(p[0],p[1],8,46,.4,'#b48cff',5);sparks(p[0],p[1],'#b48cff',10,200,2.5);
}
function meteorImpact(s){
  const c=s.owner,r=s.onLand.radius;
  boom(s.tx,s.ty,r*1.3,'#ff7a1a',true);flashFx(s.tx,s.ty,r*2.2,'#fff1a6',.3);ringFx(s.tx,s.ty,10,r*1.8,.7,'#ffb347',12);debris(s.tx,s.ty,'#5a3a2a',16);decal(s.tx,s.ty,r*.9,'rgba(20,8,10,.6)',10);shakeAt(s.tx,s.ty,16);
  for(const e of M.ents){if(e.team===s.team||e.dead)continue;if(dist(s.tx,s.ty,e.x,e.y)>r+e.rad)continue;
    if(e.kind==='core')hurt(e,e.maxHp*.25,c);else{e.guardT=0;hurt(e,e.hp+1,c);}}
  {const ids=c.stolen.slice(-3);ids.forEach(id=>spawnShadow(c,id,s.tx,s.ty));}
}
function trySuper(u,ang,dh){
  if(NETC&&u===P){netAct('sup',ang,dh);return true;}
  if(!M||u.super<1||u.dead||u.dash||u.stunT>0||M.state!=='play')return false;
  if(u.b.sup.kind==='leap'&&!leapTarget(u)){if(u===P)textFx(u.x,u.y-u.rad-36,'Nobody in your hop zone','#ffd1dc',12);return false;}
  if(u.b.sup.kind==='darkdive'&&!onTrail(u)){if(u===P)textFx(u.x,u.y-u.rad-36,'Stand in one of your black trails first','#d9c2ff',12);return false;}
  if(u.b.sup.kind==='grabthrow'&&!grabTarget(u)){if(u===P)textFx(u.x,u.y-u.rad-36,'No one close enough to grab','#ffd1dc',12);return false;}
  if(u===P&&statOn())S.st.supers++;SFXU=u;u.super=0;u.lastAttack=M.now;u.shield=0;u.aim=ang;superFx(u);say(u,'u',true);if(u.b.random)u.rerollS=3;
  const s=u.b.sup,m=u.dmgMul,ca=Math.cos(ang),sa=Math.sin(ang);
  switch(s.kind){
    case 'nova':ringFx(u.x,u.y,u.rad,s.radius,.45,u.sk.proj,12);ringFx(u.x,u.y,u.rad,s.radius*1.12,.6,'#ffffff',4);sparks(u.x,u.y,u.sk.proj,30,s.radius*2.4,3.5);decal(u.x,u.y,s.radius*.6,'rgba(15,10,25,.3)');shakeAt(u.x,u.y,7);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<s.radius+e.rad&&los(u.x,u.y,e.x,e.y)){hurt(e,s.dmg*m,u);knock(e,Math.atan2(e.y-u.y,e.x-u.x),s.kb);}}break;
    case 'magnet':{ringFx(u.x,u.y,s.radius,u.rad,.45,'#ff9a3d',10);sparks(u.x,u.y,'#ffcf8a',24,s.radius*2,3);shakeAt(u.x,u.y,6);
      for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<s.radius+e.rad){const a2=Math.atan2(u.y-e.y,u.x-e.x);e.kb={vx:Math.cos(a2)*Math.min(900,d*3.2),vy:Math.sin(a2)*Math.min(900,d*3.2),t:.25};hurt(e,s.dmg*m,u);e.stunT=Math.max(e.stunT,s.stun);boltFx(u.x,u.y,e.x,e.y,'#ffcf8a');}}break;}
    case 'sawring':for(let i=0;i<s.n;i++)spawnShot(u,ang+i*TAU/s.n,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,pierce:true,color:'#e8e8f0',style:'rang',big:true});sfx('swish');break;
    case 'tongue':{let best=null,bd=s.range;for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y),an=Math.atan2(e.y-u.y,e.x-u.x);if(d<bd&&Math.abs(angDiff(ang,an))<.35&&los(u.x,u.y,e.x,e.y)){bd=d;best=e;}}
      const ex=best?best.x:u.x+ca*s.range,ey=best?best.y:u.y+sa*s.range;addFx({k:'beam',x:u.x,y:u.y,tx:ex,ty:ey,t:0,T:.25,col:'#ff7aa8'});boltFx(u.x,u.y,ex,ey,'#ff7aa8');
      if(best){const a2=Math.atan2(u.y-best.y,u.x-best.x),d=dist(u.x,u.y,best.x,best.y)-u.rad-best.rad-6;best.kb={vx:Math.cos(a2)*d/.2,vy:Math.sin(a2)*d/.2,t:.2};hurt(best,s.dmg*m,u);best.stunT=Math.max(best.stunT,s.stun);hitFx(best.x,best.y,'#ff7aa8');}sfx('swish');break;}
    case 'rainbow':{const cols=['#ff5e87','#ffd23f','#6be39a','#5ec8ff','#b48cff'];for(let i=0;i<s.n;i++){const d=60+i*(s.range-60)/(s.n-1),x=u.x+ca*d,y=u.y+sa*d;if(isWall(x,y))break;createField(u,x,y,{radius:48,dur:5,dps:s.dps*m,slow:true,kind:'paint'});M.fields[M.fields.length-1].col=cols[i%5];}sfx('lob');break;}
    case 'phoenix':u.dash={vx:ca*s.spd,vy:sa*s.spd,t:s.range/s.spd,dmg:s.dmg*m,kb:180,hit:new Set(),fire:{dps:s.dps*m,last:0}};addFx({k:'flash',x:u.x,y:u.y,r:60,t:0,T:.2,col:'#ff7a1a'});break;
    case 'mushring':createField(u,u.x,u.y,{radius:s.radius,dur:s.dur,dps:s.dps*m,heal:s.heal*u.mul,kind:'mush'});ringFx(u.x,u.y,u.rad,s.radius,.5,'#9dff6b',9);break;
    case 'scaffold':{const px=-sa,py=ca;for(let i=-1;i<=1;i++){const x=u.x+ca*95+px*i*48,y=u.y+sa*95+py*i*48;if(isWall(x,y))continue;const b=makeStruct('box',u.team,x,y,{rad:22,hp:s.hp,name:'Crate',owner:u});b.lifeT=s.life;b.crate=true;M.boxes.push(b);smoke(x,y,3,16);}sfx('thud');break;}
    case 'starfall':{const d=clamp(dh==null?s.range:dh,60,s.range),tx=u.x+ca*d,ty=u.y+sa*d;for(let i=0;i<s.n;i++){const fire=()=>{if(!M)return;const a2=rand(0,TAU),r2=rand(0,90);spawnLob(u,tx+Math.cos(a2)*r2,ty+Math.sin(a2)*r2,{flight:.5,dmg:s.dmg*m,splash:s.splash,color:'#ffd36b',style:'star'});};if(i===0)fire();else u.pending.push({t:i*.15,fn:fire});}break;}
    case 'shadowstep':{let best=null,bd=s.range;for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}
      smoke(u.x,u.y,6,22,'#2a2238');if(best){const a2=Math.atan2(best.y-u.y,best.x-u.x),nx=best.x+Math.cos(a2)*(best.rad+u.rad+10),ny=best.y+Math.sin(a2)*(best.rad+u.rad+10);if(!hitsWall(nx,ny,u.rad)){u.x=nx;u.y=ny;}u.aim=a2+Math.PI;}
      u.cloakT=s.cloak;smoke(u.x,u.y,6,22,'#2a2238');break;}
    case 'darkdive':{u.dive={t:s.dur,tr:0};u.shield=s.dur;ringFx(u.x,u.y,u.rad,120,.5,'#5a2a8a',10);smoke(u.x,u.y,6,24,'#140a24');
      const vs=new Set();for(const p of M.trails)if(p.owner===u&&p.victim&&!p.victim.dead&&p.victim.team!==u.team)vs.add(p.victim);
      for(const v of vs){darkPoison(u,v,(u.mods.darkvenom?1029.41:s.dps)*u.dmgMul,s.dur);textFx(v.x,v.y-v.rad-30,'Darkness!','#c79bff',13);}break;}
    case 'beam':spawnShot(u,ang,{spd:s.spd,range:s.range*(1+u.mods.range),dmg:s.dmg*m,r:s.r,pierce:true,big:true,style:'beam'});muzzle(u,ang,u.sk.proj,true);break;
    case 'dash':u.dash={vx:ca*s.spd,vy:sa*s.spd,t:s.range/s.spd,dmg:s.dmg*m,kb:s.kb,hit:new Set()};break;
    case 'heal':ringFx(u.x,u.y,u.rad,s.radius,.5,'#6be39a',10);sparks(u.x,u.y,'#b6ffd2',24,s.radius*2,3);
      for(const a of M.units)if(a.team===u.team&&!a.dead&&dist(u.x,u.y,a.x,a.y)<s.radius+a.rad){heal(a,s.heal*m);for(let i=0;i<4;i++)addFx({k:'plus',x:a.x+rand(-18,18),y:a.y-rand(0,14),t:-i*.08,T:.9});}break;
    case 'bigbomb':{const d=clamp(dh==null?s.range:dh,60,s.range);spawnLob(u,u.x+ca*d,u.y+sa*d,{flight:s.flight,dmg:s.dmg*m,splash:s.splash*(1+u.mods.splash),big:true});break;}
    case 'field':{const d=clamp(dh==null?s.range:dh,40,s.range);spawnLob(u,u.x+ca*d,u.y+sa*d,{flight:s.flight,dmg:0,onLand:{radius:s.radius,dur:s.dur,dps:s.dps*m,slow:!s.pull,pull:s.pull||0,kind:s.pull?'hole':'storm'}});break;}
    case 'boomerang3':for(let i=0;i<s.n;i++){const off=-s.arc/2+s.arc*i/(s.n-1);spawnShot(u,ang+off,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,pierce:true,rang:true,big:true,style:'rang'});}break;
    case 'bigwave':spawnShot(u,ang,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,pierce:true,kb:s.kb,style:'wave',big:true});shakeAt(u.x,u.y,5);break;
    case 'chainbig':spawnShot(u,ang,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,style:'spark',big:true,stun:s.stun,chain:{jumps:s.jumps+u.mods.chainplus,jumpR:s.jumpR,falloff:s.falloff,stun:s.stun}});muzzle(u,ang,u.sk.proj,true);break;
    case 'root':ringFx(u.x,u.y,u.rad,s.radius,.5,'#7ed957',10);for(let i=0;i<14;i++){const a2=i/14*TAU;addFx({k:'vine',x:u.x+Math.cos(a2)*s.radius*rand(.4,.95),y:u.y+Math.sin(a2)*s.radius*rand(.4,.95),t:0,T:1.4,rot:rand(0,TAU)});}shakeAt(u.x,u.y,6);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<s.radius+e.rad&&los(u.x,u.y,e.x,e.y)){hurt(e,s.dmg*m,u);stun(e,s.stun);}}break;
    case 'turret':{for(const t of M.structs)if(t.kind==='turret'&&t.owner===u&&!t.dead){t.dead=true;smoke(t.x,t.y,3,18);}
      let tx=u.x+ca*44,ty=u.y+sa*44;if(hitsWall(tx,ty,16)){tx=u.x;ty=u.y;}
      const k=1+u.mods.turretplus;makeStruct('turret',u.team,tx,ty,{rad:16,hp:Math.round(s.hp*m*k),t:s.dur,dmg:s.dmg*m*k,reach:s.reach,rate:s.rate,owner:u,name:'Sentry'});
      ringFx(tx,ty,8,60,.4,u.sk.proj,6);debris(tx,ty,'#c7cedb',6);sfx('build');break;}
    case 'shockcone':addFx({k:'cone',x:u.x,y:u.y,ang,arc:s.arc,r:s.range,t:0,T:.35,col:u.sk.proj});for(let i=0;i<3;i++)addFx({k:'cone',x:u.x,y:u.y,ang,arc:s.arc,r:s.range*(.4+i*.3),t:-i*.06,T:.3,col:'#ffffff'});shakeAt(u.x,u.y,8);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y),an=Math.atan2(e.y-u.y,e.x-u.x);if(d<s.range+e.rad&&Math.abs(angDiff(ang,an))<s.arc/2&&los(u.x,u.y,e.x,e.y)){hurt(e,s.dmg*m,u);stun(e,s.stun);knock(e,an,s.kb);}}break;
    case 'starzone':{const d=clamp(dh==null?s.range:dh,40,s.range);spawnLob(u,u.x+ca*d,u.y+sa*d,{flight:s.flight,dmg:0,onLand:{kind:'starzone',radius:s.radius,dur:s.dur+u.mods.zoneplus,dps:s.dps*m,poison:s.poison*m,poisonT:s.poisonT}});break;}
    case 'leap':{const e=leapTarget(u,ang),a2=Math.atan2(u.y-e.y,u.x-e.x);let tx=e.x+Math.cos(a2)*(e.rad+u.rad*.6),ty=e.y+Math.sin(a2)*(e.rad+u.rad*.6);if(hitsWall(tx,ty,u.rad)){tx=e.x;ty=e.y;}
      u.dash=null;u.kb=null;u.leap={x0:u.x,y0:u.y,tx,ty,t:0,T:s.T,h:0,dmg:s.dmg*m,radius:s.radius,heal:(s.heal||0)*u.mul*(u.mods.kind?1.5:1)};sfx('swish');break;}
    case 'thunder':{createField(u,u.x,u.y,{radius:s.radius,dur:s.dur,kind:'thunder',dps:s.dmg*m});const f=M.fields[M.fields.length-1];f.clouds=s.clouds;f.rate=s.rate;f.zt=.2;ringFx(u.x,u.y,20,s.radius,.6,'#8fd3ff',10);flashFx(u.x,u.y,s.radius,'#bfe6ff',.25);shakeAt(u.x,u.y,8);sfx('bigboom');break;}
    case 'grabthrow':{const e=grabTarget(u);stun(e,1.4);e.kb=null;e.thrown={phase:'grab',t:0,src:u,ang,vx:ca*s.spd,vy:sa*s.spd,spd:s.spd,max:tossDist(u),trav:0,h:0,dmg:s.dmg*m,min:s.min};
      ringFx(e.x,e.y,e.rad*2,e.rad,.25,'#ffd23f',6);textFx(u.x,u.y-u.rad-36,'Big Toss!','#ffd23f',15);sfx('swish');break;}
    case 'homebat':{let tgt=null,bd=s.seek;for(const e of M.units){if(e.team===u.team||e.dead||e.hidden&&e.markT<=0)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;tgt=e;}}
      const a0=tgt?Math.atan2(tgt.y-u.y,tgt.x-u.x):ang;const sh=spawnShot(u,a0,{spd:s.spd,range:99999,dmg:s.dmg*m,r:15,pierce:true,big:true,style:'bat',color:'#c98f55'});
      sh.home={tgt,phase:'out',t:0,free:.55};sh.dmgBack=s.back*m;sh.poison=s.poison*m;sh.batDur=s.dur;u.aim=a0;sfx('swish');break;}
    case 'meteor':{const d=clamp(dh==null?s.range*.7:dh,0,s.range);const tx=clamp(u.x+ca*d,30,MW-30),ty=clamp(u.y+sa*d,30,MH-30);
      M.shots.push({lob:true,team:u.team,owner:u,sx:tx,sy:ty,x:tx,y:ty,h:700,tx,ty,t:0,T:s.flight,dmg:0,splash:s.radius,big:true,r:22,color:'#ff7a1a',onLand:{kind:'meteor',radius:s.radius},seen:null,style:'meteor'});sfx('super');break;}
    case 'dam':{const d=clamp(dh==null?140:dh,0,s.range);let x=u.x+ca*d,y=u.y+sa*d;x=clamp(x,40,MW-40);y=clamp(y,40,MH-40);const lodge=u.mods.lodge;
      createField(u,x,y,{radius:s.radius,dur:s.dur+(lodge?3:0),kind:'dam',heal:s.heal*(lodge?2:1),speed:s.speed,dps:s.dps*m,poison:s.poison*m,poisonT:s.poisonT});break;}
  }
  return true;
}

/* ---------- Gadgets & pins ---------- */
function useGadget(u,dir){
  if(NETC&&u===P){netAct('gad',dir);return;}
  if(!M||M.state!=='play'||u.dead||!u.gadget||u.gUses<=0||u.gCd>0||u.stunT>0)return false;
  if(u===P&&statOn())S.st.gadgets++;SFXU=u;const g=u.gadget;u.gUses--;u.gCd=5;
  ringFx(u.x,u.y,u.rad,u.rad*2.6,.35,'#6be39a',5);sparks(u.x,u.y,'#b6ffd2',10,200,2.5);textFx(u.x,u.y-u.rad-34,g.name,'#9ff5bf',12);sfx('gadget');
  if((g.type==='darkvirus'||g.type==='darkreveal')&&!u.dive){u.gUses++;u.gCd=0;textFx(u.x,u.y-u.rad-50,'Use it during Dark Dive','#d9c2ff',12);return false;}
  switch(g.type){
    case 'darkvirus':for(const e of M.units){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<230)darkPoison(u,e,g.val*u.mul,5);}ringFx(u.x,u.y,u.rad,230,.5,'#5a2a8a',9);break;
    case 'darkreveal':for(const e of M.units){if(e.team===u.team||e.dead)continue;if(e.darkT>0||e.poisonT>0){e.markT=Math.max(e.markT,g.val);e.darkX=g.val;}}break;
    case 'heal':heal(u,u.maxHp*g.val);break;
    case 'shield':u.guardT=2.5;break;
    case 'speed':u.boostT=3;break;
    case 'reload':u.ammo=u.maxAmmo;break;
    case 'pickrarity':{const l=trickRarList(u);if(u===P&&typeof openRarPick==='function')openRarPick(l);else forceTrickAtk(u,l[l.length-1]);break;}
    case 'healzone':createField(u,u.x,u.y,{radius:130,dur:4,kind:'healzone',heal:g.val*u.mul});ringFx(u.x,u.y,20,130,.5,'#6be39a',8);break;
    case 'reloadzone':createField(u,u.x,u.y,{radius:130,dur:4,kind:'reloadzone',speed:g.val});ringFx(u.x,u.y,20,130,.5,'#ffd23f',8);break;
    case 'dash':{let a=dir;if(a==null)a=u.moving?Math.atan2(u.vy,u.vx):u.aim;u.dash={vx:Math.cos(a)*900,vy:Math.sin(a)*900,t:g.val/900,dmg:0,kb:0,hit:new Set()};break;}
    case 'blast':ringFx(u.x,u.y,u.rad,140,.35,u.sk.proj,9);flashFx(u.x,u.y,120,u.sk.proj,.2);shakeAt(u.x,u.y,5);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<140+e.rad){hurt(e,g.val*u.mul,u);knock(e,Math.atan2(e.y-u.y,e.x-u.x),200);}}break;
    case 'slowfield':createField(u,u.x,u.y,{radius:g.val,dur:3,dps:0,slow:true,kind:'storm'});break;
    case 'pull':ringFx(u.x,u.y,g.val,u.rad,.4,'#c9b5ff',6);for(const e of M.units){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<g.val)knock(e,Math.atan2(u.y-e.y,u.x-e.x),420);}break;
    case 'reveal':for(const e of M.units){if(e.team===u.team||e.dead)continue;e.markT=g.val;addFx({k:'mark',x:e.x,y:e.y,t:0,T:.6});}sfx('mark');break;
    case 'shotgun':{let best=null,bd=380;for(const e of foesOf(u.team)){if(e.isStruct)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd&&los(u.x,u.y,e.x,e.y)){bd=d;best=e;}}
      const a=best?Math.atan2(best.y-u.y,best.x-u.x):u.aim;u.aim=a;
      for(let i=0;i<6;i++)spawnShot(u,a+(-.3+.6*i/5)+rand(-.03,.03),{spd:900,range:340,dmg:320*u.mul,r:6,style:'pellet',stun:g.val,color:'#ffe08a'});
      muzzle(u,a,'#ffe08a',true);smoke(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,3,16,'#8a8299');shakeAt(u.x,u.y,7);sfx('shotgun');break;}
  }
  if(u.b.random&&!u.trickPick)trickGadget(u);
  return true;
}
function sendPin(u,id){if(NETC&&u===P){netAct('pin',null,null,id);return;}if(!M||u.pinCd>0||u.dead)return;u.pin=id;u.pinT=2.6;u.pinCd=3;if(u===P){sfx('pin');if(S&&S.st)S.st.pins++;}}

/* Lil T's bat: slow, +25% damage taken, and poison, all for the bat's duration */
function batHit(s,e,dmg){
  hurt(e,dmg,s.owner);batEffects(s.owner,e,s.poison,s.batDur);
  hitFx(e.x,e.y,'#ffd36b');ringFx(e.x,e.y,8,60,.35,'#9be35a',6);sparks(e.x,e.y,'#c98f55',10,260,3);textFx(e.x,e.y-e.rad-30,'BONK!','#ffd36b',18);shakeAt(e.x,e.y,6);sfx('crack');
}
function nearestFoeUnit(team,x,y,max){let best=null,bd=max;for(const e of M.units){if(e.team===team||e.dead||e.hidden&&e.markT<=0)continue;const d=dist(x,y,e.x,e.y);if(d<bd){bd=d;best=e;}}return best;}
function batEffects(owner,e,poison,dur){if(e.dead)return;slowE(e,dur,owner);e.vulnT=Math.max(e.vulnT,dur);e.poisonT=dur;e.poisonDmg=poison;e.poisonSrc=owner;e.poisonTick=1;ringFx(e.x,e.y,6,40,.3,'#9be35a',4);}
/* Orion's star splits toward up to n enemies standing near the one it hit */
function spreadStar(s,t){
  const near=M.ents.filter(e=>e.team!==s.team&&!e.dead&&e!==t&&e.kind!=='core'&&!s.hit.has(e.id)&&dist(t.x,t.y,e.x,e.y)<s.spread.r).sort((a,b)=>dist(t.x,t.y,a.x,a.y)-dist(t.x,t.y,b.x,b.y)).slice(0,s.spread.n);
  for(const e of near){const d=dist(t.x,t.y,e.x,e.y);spawnShot(s.owner,Math.atan2(e.y-t.y,e.x-t.x),{x:t.x,y:t.y,spd:900,range:d*1.8+90,dmg:s.dmg,r:8,slow:s.slow,color:s.color,style:'star',hit:[t.id],seek:e,ghost:true});}
  if(near.length){ringFx(t.x,t.y,8,s.spread.r,.35,s.color,4);sparks(t.x,t.y,s.color,10,240,2.5);}
}
/* Solo Showdown energy cubes: each one adds 10% damage and 10% max health */
function dropCube(x,y,spd){const a=rand(0,TAU),v=spd?rand(spd*.5,spd):0;M.cubes.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,cd:.35,t:0,ph:rand(0,6)});}
function addCube(u,shared){if(u.dead)return;u.cubes++;const old=u.maxHp;u.maxHp=Math.round(u.baseHp*(1+.1*u.cubes));u.hp=Math.min(u.maxHp,u.hp+(u.maxHp-old));u.dmgMul=u.baseDmg*(1+.1*u.cubes);
  textFx(u.x,u.y-u.rad-42,shared?'+1 team cube':'+1 cube','#7fd3ff',14);sparks(u.x,u.y,'#7fd3ff',10,200,2.5);ringFx(u.x,u.y,u.rad,u.rad*2.4,.35,'#7fd3ff',4);if(u===P)sfx('pickup');}
/* In Duo and Trio, one pickup gives every teammate who's standing a cube too */
function teamCube(u){addCube(u);if(M.mode.size>1)for(const m of M.units)if(m!==u&&m.team===u.team&&!m.shadow)addCube(m,true);}
/* Showdown teams: a knocked-out rumbler comes back while a teammate stands; the team is out when all are down at once */
function sdTeamsLeft(){let n=0;for(let k=0;k<M.nTeams;k++)if(!M.elim[k])n++;return n;}
function sdRespawn(t){const mates=M.units.filter(u=>u.team===t.team&&!u.shadow);
  if(mates.every(u=>u.dead)){for(const u of mates)u.respawn=Infinity;M.elim[t.team]=true;if(t.team===0&&!M.place)M.place=sdTeamsLeft()+1;
    if(M.mode.size>1&&t.team!==0&&M.state==='play')textFx(t.x,t.y-50,'Team out!','#ffa6a2',16);return Infinity;}
  return 10;}

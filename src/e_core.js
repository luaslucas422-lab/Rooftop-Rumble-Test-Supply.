const SET_PIN_OWNER={lantern:'juggler',wildcard:'trick'};
/* skin, prestige and set pins belong to one rumbler: they go in that rumbler's own 3 pin slots */
const pinPersonal=pid=>/^(sk|pr):/.test(pid)||!!SET_PIN_OWNER[pid];
function pinAllowedFor(pid,id){if(/^(sk|pr):/.test(pid))return pid.split(':')[1]===id;if(SET_PIN_OWNER[pid])return SET_PIN_OWNER[pid]===id;return true;}

/* ---------- Numbers ---------- */
function fmt(v){v=Number(v)||0;if(v<10000)return Math.floor(v).toLocaleString('en-US');if(v<1e6)return(Math.floor(v/100)/10)+'K';return(Math.floor(v/1e5)/10)+'M';}
const fmtFull=v=>Math.floor(Number(v)||0).toLocaleString('en-US');

/* ---------- Save ---------- */
const KEY=RR_MODE==='sandbox'?'rooftop-rumble-sandbox':'rooftop-rumble-v2';
function newRumbler(){return{pinSlots:[null,null],facePins:[null,null,null],lvl:1,skins:['classic'],skin:'classic',prestige:0,gadgets:[],stars:[],gadget:null,star:null};}
function newSt(){return{kills:0,deaths:0,dmg:0,supers:0,gadgets:0,pins:0,time:0,bestStreak:0,tricksW:0,tricksL:0,sims:0,replays:0,watched:0,sdWins:0,modes:{},drops:{}};}
function defaultSave(){return{st:newSt(),pf:{...PF_DEF,show:null},exNew:[],hw:{wins:0,used:0,spent:0,knocks:0,opened:0,doors:null},party:[],name:'You',trophies:0,best:0,coins:150,gems:30,pp:0,chromos:0,packs:[],pins:[],onboarded:false,nameChanges:0,nameLockUntil:0,pass:{xp:0,premium:false,super:false,superPick:null,boost:false,cf:[],cp:[],cs:[],bonus:0,wins:0},drops:[],dropDay:{date:'',n:0},pendingSkins:[],owned:{[STARTER]:newRumbler()},selected:STARTER,mode:'ring',rp:0,rpBest:0,rankClaimed:0,road:0,streak:0,daily:{date:'',claimed:false,dealSkins:[],bought:[]},sound:true,music:true,voice:true,shake:true,matches:0,wins:0};}
function loadSave(given){
  const d=defaultSave();let s=null;
  if(given)s=given;else try{const raw=localStorage.getItem(KEY);if(raw)s=JSON.parse(raw);}catch(e){}
  if(!s||typeof s!=='object')return d;
  const o={...d,...s};
  for(const k of['trophies','best','coins','gems','pp','chromos','rp','rpBest','rankClaimed','road','streak','matches','wins','nameChanges','nameLockUntil']){const n=Number(s[k]);o[k]=isFinite(n)&&n>=0?Math.floor(n):d[k];}
  if(!s.rankV){o.rankV=2;if(o.rp>=1800)o.rp+=300;if(o.rpBest>=1800)o.rpBest+=300;if(o.rankClaimed>=18)o.rankClaimed+=3;}else o.rankV=2;
  o.rankPeak=Math.max(o.rankClaimed|0,Number.isFinite(+s.rankPeak)?+s.rankPeak|0:0,rankInfo(o.rp).i);o.rankCycle=Math.max(0,s.rankCycle|0);o.masterAll=!!s.masterAll;
  o.owned={};
  if(halloweenOn()&&!o.hwDef){o.hwDef=1;o.musicTrack='spooky';o.theme='halloween';}if(o.theme!=='halloween'&&o.theme!=='default')o.theme=halloweenOn()?'halloween':'default';
  o.hw={wins:0,used:0,spent:null,knocks:0,opened:0,doors:null,...(s.hw&&typeof s.hw==='object'?s.hw:{})};o.hw.wins=Math.max(0,o.hw.wins|0);o.hw.used=Math.max(0,Math.min(o.hw.used|0,Math.floor(o.hw.wins/KNOCK_EVERY)));if(o.hw.spent==null)o.hw.spent=o.hw.used;o.hw.spent=Math.max(0,o.hw.spent|0);o.hw.knocks=Math.max(0,o.hw.knocks|0);o.hw.opened=Math.max(0,o.hw.opened|0);o.hw.dead=Math.max(0,Math.min(DEAD_PITY,o.hw.dead|0));o.hw.knocked=Math.max(o.hw.knocked|0,o.hw.used|0,o.hw.dead|0);if(!Array.isArray(o.hw.doors)||o.hw.doors.length!==6||!o.hw.doors.every(id=>BY_ID[id]))o.hw.doors=null;
  o.party=Array.isArray(s.party)?s.party.filter(f=>f&&typeof f.id==='string'&&BY_ID[f.rumbler]).slice(0,2).map(f=>({id:f.id.slice(0,40),name:String(f.name||'Friend').slice(0,20),rumbler:f.rumbler,skin:typeof f.skin==='string'?f.skin:'classic'})):[];o.netUrl=typeof s.netUrl==='string'?s.netUrl.slice(0,200):'';o.invitesOn=s.invitesOn!==false;{const sp=s.simPick,ok=a=>Array.isArray(a)&&a.length===3&&a.every(x=>x===null||!!BY_ID[x]);o.simPick=sp&&ok(sp.blue)&&ok(sp.red)&&MODE_BY[sp.mode]?{blue:sp.blue.slice(),red:sp.red.slice(),mode:sp.mode}:null;}{const d=newSt(),x=s.st&&typeof s.st==='object'?s.st:{};o.st=d;for(const k in d)if(typeof d[k]==='number')d[k]=Math.max(0,+x[k]||0);
    if(x.modes&&typeof x.modes==='object')for(const k in x.modes)if(MODE_BY[k]&&Array.isArray(x.modes[k]))d.modes[k]=[Math.max(0,x.modes[k][0]|0),Math.max(0,x.modes[k][1]|0)];
    if(x.drops&&typeof x.drops==='object')for(const k in x.drops)if(RARITY[k])d.drops[k]=Math.max(0,x.drops[k]|0);}o.party=[];o.exNew=Array.isArray(s.exNew)?s.exNew.filter(x=>typeof x==='string'&&EX_BY_SKIN[x]).slice(0,20):[];{const q=s.pf&&typeof s.pf==='object'?s.pf:{};o.pf={};for(const k in PF_DEF)o.pf[k]=typeof q[k]==='string'&&PF_KINDS[k].some(x=>x.id===q[k])?q[k]:PF_DEF[k];o.pf.show=Array.isArray(q.show)&&BY_ID[q.show[0]]&&typeof q.show[1]==='string'?[q.show[0],q.show[1].slice(0,30)]:null;}if(o.hw&&o.hw.darkClaimed&&o.owned&&o.owned.dark&&Array.isArray(o.owned.dark.skins)&&!o.owned.dark.skins.includes('hw_reaper'))o.owned.dark.skins.push('hw_reaper');o.friends=Array.isArray(s.friends)?s.friends.filter(f=>f&&typeof f.id==='string').slice(0,20).map(f=>({id:f.id.slice(0,40),name:String(f.name||'Friend').slice(0,20)})):[];o.rankTop=Math.max(0,Math.min(7,s.rankTop|0));o.orient=['auto','portrait','landscape'].includes(s.orient)?s.orient:'auto';o.findByName=!!s.findByName;o.icon=typeof s.icon==='string'?s.icon.slice(0,40):'';o.icons=Array.isArray(s.icons)?s.icons.filter(x=>SPECIAL_ICONS.some(y=>y[0]===x)):[];
  const src=(s.owned&&typeof s.owned==='object')?s.owned:{};
  for(const id in src){if(!BY_ID[id])continue;const r={...newRumbler(),...src[id]};r.lvl=clamp(Math.round(+r.lvl||1),1,MAX_LVL);r.prestige=Math.min(PRESTIGE_MAX,Math.max(0,Math.round(+r.prestige||0)));r.prClaim=Math.max(0,Math.round(+r.prClaim||0));r.pinSlots=Array.isArray(r.pinSlots)?[r.pinSlots[0]||null,r.pinSlots[1]||null]:[null,null];const gr=GEAR[id];r.gadgets=Array.isArray(r.gadgets)?r.gadgets.filter(x=>gr.g.some(g=>g.id===x)):[];r.stars=Array.isArray(r.stars)?r.stars.filter(x=>gr.s.some(g=>g.id===x)):[];if(!r.gadgets.includes(r.gadget))r.gadget=r.gadgets[0]||null;if(!r.stars.includes(r.star))r.star=r.stars[0]||null;
    r.skins=Array.isArray(r.skins)?r.skins.filter(x=>skinsOf(BY_ID[id]).some(k=>k.id===x)):['classic'];if(!r.skins.includes('classic'))r.skins.unshift('classic');if(!r.skins.includes(r.skin))r.skin='classic';o.owned[id]=r;}
  if(!o.owned[STARTER])o.owned[STARTER]=newRumbler();
  if(!o.owned[o.selected])o.selected=STARTER;
  if(!MODE_BY[o.mode])o.mode='ring';
  if(typeof o.name!=='string'||!o.name.trim())o.name='You';
  o.daily={...d.daily,...(s.daily||{})};if(!Array.isArray(o.daily.dealSkins))o.daily.dealSkins=[];if(!Array.isArray(o.daily.bought))o.daily.bought=[];
  o.packs=Array.isArray(s.packs)?s.packs.filter(x=>BY_ID[x]):[];o.pins=Array.isArray(s.pins)?s.pins.filter(x=>PREMIUM_PINS.concat(PASS_PINS,TOXIC_PINS,RANK_PINS,SET_PINS,DAILY_ONLY_PINS,SEASON_PINS,TROLL_PINS,GEN_PINS,HALLOWEEN_PINS,SECRET_PINS,FRIENDLY_PINS,SOLAR_PINS,TESTER_PINS).some(p=>p[0]===x)||isPrestigePin(x)||isSkinPin(x)):[];
  const ps=s.pass||{},ints=a=>Array.isArray(a)?a.filter(n=>Number.isInteger(n)&&n>=0&&n<PASS_TIERS):[];
  o.pass={xp:Math.max(0,Math.floor(+ps.xp||0)),premium:!!ps.premium||!!ps.super,super:!!ps.super,boost:!!ps.boost,superPick:typeof ps.superPick==='string'?ps.superPick.slice(0,20):null,cf:ints(ps.cf),cp:ints(ps.cp),cs:ints(ps.cs),bonus:Math.max(0,Math.floor(+ps.bonus||0)),wins:Math.max(0,Math.floor(+ps.wins||0))};
  o.drops=Array.isArray(s.drops)?s.drops.filter(d=>d&&(d.r==null||DROP_RAR.includes(d.r)||isSpecialDrop(d.r))).map(d=>({r:d.r||null,min:DROP_RAR.includes(d.min)?d.min:null,g:d.g?1:0})).slice(0,300):[];
  o.dropDay={date:'',n:0,...(s.dropDay||{})};
  o.pendingSkins=Array.isArray(s.pendingSkins)?s.pendingSkins.filter(x=>{if(typeof x!=='string')return false;const[i,k]=x.split(':');return!!BY_ID[i]&&skinsOf(BY_ID[i]).some(q=>q.id===k);}):[];
  for(const id in o.owned){const me=o.owned[id];for(const m of[50,100,150,200,250])if(me.prestige>=m&&(me.prClaim||0)<m){const rw=PRESTIGE_REWARDS[m];me.prClaim=m;if(rw.skin&&!me.skins.includes(rw.skin))me.skins.push(rw.skin);if(rw.pin&&!o.pins.includes('pr:'+id+':'+rw.pin))o.pins.push('pr:'+id+':'+rw.pin);}}
  for(const id in o.owned)for(const sid of o.owned[id].skins){const sk=skinsOf(BY_ID[id]).find(k=>k.id===sid);if(sk&&skinHasPin(sk)){for(const pid of skinPinIds(id,sk))if(!o.pins.includes(pid))o.pins.push(pid);if(skinPinFaces(sk)){const old='sk:'+id+':'+sid,i=o.pins.indexOf(old);if(i>=0)o.pins.splice(i,1);const me=o.owned[id];if(Array.isArray(me.pinSlots))me.pinSlots=me.pinSlots.map(p=>p===old?old+':happy':p);}}}
  {const ok=p=>typeof p==='string'&&(o.pins.includes(p)||BASIC_PINS.some(q=>q[0]===p));
   if(!Array.isArray(s.customPins)){const sel=o.owned[o.selected]||Object.values(o.owned)[0];o.customPins=[null,null];if(sel&&Array.isArray(sel.pinSlots)){let k=0;for(const p of sel.pinSlots)if(p&&!pinPersonal(p)&&k<2)o.customPins[k++]=p;}}
   else o.customPins=[0,1].map(k=>ok(s.customPins[k])&&!pinPersonal(s.customPins[k])?s.customPins[k]:null);
   for(const id in o.owned){const me=o.owned[id];me.facePins=Array.isArray(me.facePins)?[0,1,2].map(k=>ok(me.facePins[k])&&pinAllowedFor(me.facePins[k],id)?me.facePins[k]:null):[null,null,null];
     if(Array.isArray(me.pinSlots))for(const p of me.pinSlots)if(p&&pinPersonal(p)&&pinAllowedFor(p,id)&&!me.facePins.includes(p)){const k=me.facePins.indexOf(null);if(k>=0)me.facePins[k]=p;}}}
  if(!Number.isInteger(o.seed)||o.seed<=0)o.seed=1+Math.floor(Math.random()*2e9);
  /* Only Grandmaster stays on Ember: lower rank skins move off Ember onto that rank's random rumbler */
  {const lowRk=RANK_SETS.slice(0,-1).map(rs=>rs.skin.id),em=o.owned[STARTER];
   if(em){em.skins=em.skins.filter(x=>!lowRk.includes(x));if(lowRk.includes(em.skin))em.skin='classic';if(Array.isArray(em.pinSlots))em.pinSlots=em.pinSlots.map(p=>p&&lowRk.some(r=>p.startsWith('sk:'+STARTER+':'+r))?null:p);}
   o.pins=o.pins.filter(p=>!lowRk.some(r=>p===('sk:'+STARTER+':'+r)||p.startsWith('sk:'+STARTER+':'+r+':')));
   o.pendingSkins=o.pendingSkins.filter(x=>!lowRk.some(r=>x===STARTER+':'+r));}
  for(const[k,rs]of RANK_SETS.entries()){const got=rs.idx===0?(o.rpBest>0||o.rankClaimed>0):o.rankClaimed>=rs.idx;if(got){if(!o.pins.includes(rs.pin))o.pins.push(rs.pin);const rid=rankSetRumbler(k,rankSeed(o)),e=o.owned[rid];if(e){if(!e.skins.includes(rs.skin.id))e.skins.push(rs.skin.id);}else if(!o.pendingSkins.includes(rid+':'+rs.skin.id))o.pendingSkins.push(rid+':'+rs.skin.id);}}o.onboarded=!!s.onboarded;o.sound=s.sound!==false;o.music=s.music!==false;o.voice=s.voice!==false;o.shake=s.shake!==false;
  return o;
}
let S=loadSave();try{checkExclusives();}catch(e){}
function persist(){try{checkExclusives();}catch(e){}try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function stMatches(){let n=0;const m=(S.st&&S.st.modes)||{};for(const k in m)n+=(m[k]&&m[k][0])|0;return n;}
function exProgress(e){const st=S.st||{};switch(e.stat){case'pins':return st.pins|0;case'sims':return st.sims|0;case'replays':return st.replays|0;case'rbox':return(st.drops&&st.drops.rbox)|0;case'secrets':return secretsFound();case'sdWins':return st.sdWins|0;case'kills':return st.kills|0;case'matches':return stMatches();case'pass':return S.pass?passTier(S.pass.xp|0):0;case'best':return S.best|0;case'rid':return S.rid&&S.rid.id?1:0;}return 0;}
function exOwned(e){return hasSkin(e.rid,e.skin.id);}
function exCount(){return EXCLUSIVE_SKINS.filter(exOwned).length;}
function ownsSkinTier(t){for(const id in S.owned)for(const sid of S.owned[id].skins){const sk=skinsOf(BY_ID[id]).find(k=>k.id===sid);if(sk&&sk.tier===t)return true;}return false;}
function pfHas(k,id){const it=PF_KINDS[k].find(x=>x.id===id);if(!it)return false;try{return!it.ok||!!it.ok();}catch(e){return false;}}
/* the player's chosen look, falling back to the default if it is somehow locked */
function pfMine(){const pf=S.pf||{},o={};for(const k in PF_DEF)o[k]=pfHas(k,pf[k])?pf[k]:PF_DEF[k];const sh=pf.show;o.show=sh&&S.owned[sh[0]]&&(sh[1]==='classic'||S.owned[sh[0]].skins.includes(sh[1]))?sh.slice():null;return o;}
/* Grants any exclusive skin whose goal is met. New ones wait in S.exNew until the player is on the home screen. */
function checkExclusives(){if(!S||!S.st||!S.owned)return;for(const e of EXCLUSIVE_SKINS){if(exOwned(e))continue;if(exProgress(e)>=e.goal){grantSkin(e.rid,e.skin.id);(S.exNew||(S.exNew=[])).push(e.skin.id);}}}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
/* Daily deal skins come from every rumbler, not just the ones you own */
/* Daily skins price: the first one is the featured deal (50% off), the rest are full price */
function dailySkinMult(id,sid){const i=(S.daily.dealSkins||[]).findIndex(([r,s])=>r===id&&s===sid);return i<0?null:i===0?.5:1;}
function hasSkin(id,sid){return S.owned[id]?S.owned[id].skins.includes(sid):S.pendingSkins.includes(id+':'+sid);}
function dailySkinPicks(h){const pool=[];for(const b of RUMBLERS)for(const sk of skinsOf(b))if(sk.tier!==0&&!earnOnly(sk)&&!ALWAYS_SKIN(sk)&&!hasSkin(b.id,sk.id))pool.push([b.id,sk.id]);
  const picks=[],used=new Set();let x=h;const mineP=pool.filter(([id])=>S.owned[id]);for(let i=0;i<2&&mineP.length;i++){x=Math.imul(x^(x>>>13),2654435761)>>>0;const pk=mineP.splice(x%mineP.length,1)[0];if(used.has(pk[0]))continue;used.add(pk[0]);picks.push(pk);pool.splice(pool.findIndex(q=>q[0]===pk[0]&&q[1]===pk[1]),1);}
  for(let i=0;i<80&&picks.length<11&&pool.length;i++){x=Math.imul(x^(x>>>13),2654435761)>>>0;const j=x%pool.length,[rid]=pool[j];if(used.has(rid))continue;used.add(rid);picks.push(pool.splice(j,1)[0]);}return picks;}
/* Daily pin shop: one free pin from anywhere (not skin-set or ranked pins), plus 6 pins to buy. All of it changes every day. */
function dailyPinPicks(h){let x=h;const rnd=n=>{x=Math.imul(x^(x>>>15),2246822519)>>>0;return x%n;};
  const freePool=SHOP_PINS().concat(PASS_PINS).map(p=>p[0]).filter(id=>!S.pins.includes(id));const free=freePool.length?freePool[rnd(freePool.length)]:null;
  const pool=SHOP_PINS().map(p=>p[0]).filter(id=>!S.pins.includes(id)&&id!==free),out=[];while(out.length<15&&pool.length)out.push(pool.splice(rnd(pool.length),1)[0]);return{v:3,free,pins:out};}
function ensureDaily(){
  const k=todayKey();
  /* one-time fix: older versions could keep showing the same rumbler, so swap today's unbought offer for a fresh one */
  if(!S.offerV){S.offerV=2;if(S.daily.date===k&&S.daily.offer&&!S.daily.offer.bought){S.daily.offer=pickOffer(k,S.daily.offer.id);persist();}}
  if(S.daily.date===k&&(!S.daily.pinShop||S.daily.pinShop.v!==3)){S.daily.pinShop=dailyPinPicks(hashStr(k+'pins'));persist();}
  if(S.daily.date===k){if((S.dealV||0)<4){S.dealV=4;S.daily.dealSkins=dailySkinPicks(hashStr(k+'deals'));persist();}return;}
  S.dealV=4;
  const prevOffer=S.daily.offer?S.daily.offer.id:null;
  const h=hashStr(k+S.name.length);
  const picks=dailySkinPicks(h);
  S.daily={date:k,claimed:false,dealSkins:picks,bought:[],gift:h%3,offer:pickOffer(k,prevOffer),pinShop:dailyPinPicks(hashStr(k+'pins'))};
  persist();
}

/* sight: how far they notice you · focus: how hard they go for weak targets · strafe: side-stepping in fights
   sup / gad: how quickly they use a ready super or gadget (checks per second) */
const SKILL={
  easy:{aimErr:.32,react:.6,dodge:.12,lead:.15,fire:[.7,1.2],retreat:.15,sight:520,focus:.4,strafe:.6,sup:1,gad:1},
  normal:{aimErr:.17,react:.38,dodge:.35,lead:.55,fire:[.45,.85],retreat:.25,sight:620,focus:.8,strafe:.85,sup:3,gad:2},
  hard:{aimErr:.08,react:.22,dodge:.65,lead:.9,fire:[.28,.55],retreat:.32,sight:680,focus:1,strafe:1,sup:8,gad:2.5},
  insane:{aimErr:.035,react:.12,dodge:.88,lead:1,fire:[.18,.35],retreat:.35,sight:740,focus:1.2,strafe:1,sup:20,gad:3},
};
/* Opponent skill in normal matches follows your trophies. Each tier creeps a little toward the next one as you climb it. */
const OPP_TIERS=[
  {at:0,name:'Rookie',col:'#8be28b',note:'Miss a lot, barely dodge and are slow to use supers.',
   sk:{aimErr:.42,react:.8,dodge:.04,lead:.05,fire:[.9,1.5],retreat:.1,sight:440,focus:.2,strafe:.3,sup:.5,gad:.4}},
  {at:300,name:'Skilled',col:'#5ec8ff',note:'Aim better, start dodging and use their supers.',
   sk:{aimErr:.28,react:.55,dodge:.2,lead:.32,fire:[.65,1.1],retreat:.18,sight:520,focus:.45,strafe:.55,sup:1.2,gad:.9}},
  {at:500,name:'Expert',col:'#ffb547',note:'Lead their shots, dodge often and use supers and gadgets well.',
   sk:{aimErr:.11,react:.27,dodge:.58,lead:.82,fire:[.34,.64],retreat:.3,sight:680,focus:1,strafe:.95,sup:5,gad:2.2}},
  {at:1000,name:'Pro',col:'#ff5e87',note:'Genuinely good, like strong real players: sharp aim, constant dodging, focus fire and smart retreats.',
   sk:{aimErr:.042,react:.13,dodge:.86,lead:1,fire:[.2,.38],retreat:.36,sight:760,focus:1.4,strafe:1,sup:14,gad:3}},
  {at:5000,name:'Hell',col:'#ff2a2a',note:'Every game is hell: perfect-aim opponents with 35% more health and 20% more damage.',
   sk:{aimErr:.012,react:.06,dodge:.97,lead:1,fire:[.12,.24],retreat:.4,sight:850,focus:1.6,strafe:1,sup:40,gad:5}},
];
function oppTier(t){let i=0;for(let k=0;k<OPP_TIERS.length;k++)if(t>=OPP_TIERS[k].at)i=k;return i;}
function oppSkill(t){
  const i=oppTier(t),a=OPP_TIERS[i].sk,n=OPP_TIERS[i+1];if(!n)return{...a,fire:a.fire.slice()};
  const f=(i===0?1:.35)*clamp((t-OPP_TIERS[i].at)/(n.at-OPP_TIERS[i].at),0,1),b=n.sk,o={};
  for(const k in a)o[k]=Array.isArray(a[k])?a[k].map((v,j)=>v+(b[k][j]-v)*f):a[k]+(b[k]-a[k])*f;
  return o;
}
/* Ranked: each rank tier is harder. Master is meant to be brutal. */
const SKILL_GODLIKE={aimErr:.025,react:.09,dodge:.93,lead:1,fire:[.15,.3],retreat:.38,sight:800,focus:1.5,strafe:1,sup:25,gad:4};
const SKILL_HELL={aimErr:.012,react:.06,dodge:.97,lead:1,fire:[.12,.24],retreat:.4,sight:850,focus:1.6,strafe:1,sup:40,gad:5};
const SKILL_ULTRA={aimErr:.018,react:.075,dodge:.95,lead:1,fire:[.13,.27],retreat:.39,sight:820,focus:1.55,strafe:1,sup:32,gad:4.5};
const RANK_FOES=()=>[OPP_TIERS[0].sk,OPP_TIERS[1].sk,OPP_TIERS[2].sk,OPP_TIERS[3].sk,SKILL.insane,SKILL_GODLIKE,SKILL_ULTRA,SKILL_HELL];
const RANK_FOE_NAMES=['Easy','Easy-ish','Kind of hard','Hard','Pretty hard','Really hard','Complete hell'];
/* small per-bot differences so a lobby doesn't feel like clones */
function varySkill(sk){const m=rand(.88,1.12);return{...sk,aimErr:sk.aimErr*m,react:sk.react*rand(.9,1.1),dodge:clamp(sk.dodge*(2-m),0,.95),fire:sk.fire.slice()};}

/* ---------- Map system ---------- */
const TILE=50,COLS=20,ROWS=32,MW=COLS*TILE,MH=ROWS*TILE,ZX=MW/2,ZY=MH/2;
const WALL=new Uint8Array(COLS*ROWS),BUSH=new Uint8Array(COLS*ROWS);
let MAP=null;
const fieldCache=new Map();
function loadMap(id){
  MAP=MAPS[id];const top=MAP.top,grid=top.concat(top.slice().reverse().map(r=>r.split('').reverse().join('')));
  WALL.fill(0);BUSH.fill(0);
  grid.forEach((row,r)=>{for(let c=0;c<COLS;c++){if(row[c]==='#')WALL[r*COLS+c]=1;else if(row[c]==='b')BUSH[r*COLS+c]=1;}});
  fieldCache.clear();
}
loadMap('yard');
function isWall(x,y){const c=Math.floor(x/TILE),r=Math.floor(y/TILE);if(c<0||r<0||c>=COLS||r>=ROWS)return true;return WALL[r*COLS+c]===1;}
function inBush(x,y){const c=Math.floor(x/TILE),r=Math.floor(y/TILE);if(c<0||r<0||c>=COLS||r>=ROWS)return false;return BUSH[r*COLS+c]===1;}
function hitsWall(x,y,r){
  if(x-r<0||y-r<0||x+r>MW||y+r>MH)return true;
  const c0=Math.floor((x-r)/TILE),c1=Math.floor((x+r)/TILE),r0=Math.floor((y-r)/TILE),r1=Math.floor((y+r)/TILE);
  for(let rr=r0;rr<=r1;rr++)for(let cc=c0;cc<=c1;cc++){if(rr<0||cc<0||rr>=ROWS||cc>=COLS)continue;if(WALL[rr*COLS+cc]){const nx=clamp(x,cc*TILE,cc*TILE+TILE),ny=clamp(y,rr*TILE,rr*TILE+TILE);if((x-nx)**2+(y-ny)**2<r*r)return true;}}
  return false;
}
function los(x1,y1,x2,y2){const d=dist(x1,y1,x2,y2),n=Math.ceil(d/12);for(let i=1;i<n;i++){const t=i/n;if(isWall(x1+(x2-x1)*t,y1+(y2-y1)*t))return false;}return true;}
function losWide(x1,y1,x2,y2,r){const d=dist(x1,y1,x2,y2)||1,nx=-(y2-y1)/d*r,ny=(x2-x1)/d*r;return los(x1,y1,x2,y2)&&los(x1+nx,y1+ny,x2+nx,y2+ny)&&los(x1-nx,y1-ny,x2-nx,y2-ny);}
function rayLen(x,y,a,max){const cx=Math.cos(a),sy=Math.sin(a);for(let d=10;d<=max;d+=8)if(isWall(x+cx*d,y+sy*d))return d;return max;}
function openPoint(cx,cy,r0,r1){for(let i=0;i<16;i++){const a=rand(0,TAU),r=rand(r0,r1),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(!hitsWall(x,y,26))return[x,y];}return[cx,cy];}
function tileIdx(x,y){return clamp(Math.floor(y/TILE),0,ROWS-1)*COLS+clamp(Math.floor(x/TILE),0,COLS-1);}
function nearestOpen(i){if(!WALL[i])return i;const c=i%COLS,r=(i/COLS)|0;for(let d=1;d<6;d++)for(let dr=-d;dr<=d;dr++)for(let dc=-d;dc<=d;dc++){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=COLS||nr>=ROWS)continue;const ni=nr*COLS+nc;if(!WALL[ni])return ni;}return i;}
function field(gi){
  let f=fieldCache.get(gi);if(f)return f;
  f=new Int16Array(COLS*ROWS).fill(-1);const q=new Int16Array(COLS*ROWS);let h=0,t=0;f[gi]=0;q[t++]=gi;
  while(h<t){const i=q[h++],c=i%COLS,r=(i/COLS)|0;
    for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=COLS||nr>=ROWS)continue;const ni=nr*COLS+nc;if(WALL[ni]||f[ni]>=0)continue;f[ni]=f[i]+1;q[t++]=ni;}}
  fieldCache.set(gi,f);return f;
}
function steer(u,gx,gy){
  const d0=dist(u.x,u.y,gx,gy);if(d0<6)return[0,0];
  if(losWide(u.x,u.y,gx,gy,u.rad*.9))return[(gx-u.x)/d0,(gy-u.y)/d0];
  const f=field(nearestOpen(tileIdx(gx,gy))),si=tileIdx(u.x,u.y),c=si%COLS,r=(si/COLS)|0;
  let best=-1,bv=f[si]>=0?f[si]:9999;
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
    if(!dr&&!dc)continue;const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=COLS||nr>=ROWS)continue;const ni=nr*COLS+nc;if(WALL[ni])continue;
    if(dr&&dc&&(WALL[r*COLS+nc]||WALL[nr*COLS+c]))continue;const v=f[ni];if(v>=0&&v<bv){bv=v;best=ni;}}
  if(best<0)return[(gx-u.x)/d0,(gy-u.y)/d0];
  const tx=(best%COLS)*TILE+TILE/2,ty=((best/COLS)|0)*TILE+TILE/2,d=dist(u.x,u.y,tx,ty)||1;
  return[(tx-u.x)/d,(ty-u.y)/d];
}

/* ---------- Granting & Rumble Drops ---------- */
const _secT={};
function secretTap(id,need,ms){if(!S||S.pins.includes(id))return;const now=Date.now(),a=(_secT[id]||[]).filter(t=>now-t<ms);a.push(now);_secT[id]=a;if(a.length>=need){_secT[id]=[];findSecret(id);}}
function secretsFound(){return SECRET_PINS.filter(p=>S.pins.includes(p[0])).length;}
function findSecret(id){if(!S||S.pins.includes(id)||!SECRET_PINS.some(p=>p[0]===id))return false;S.pins.push(id);persist();sfx('unlock');
  const nm=pinName(id),busy=view==='game'||(typeof sheetEl!=='undefined'&&!sheetEl.hidden);
  if(busy)toast('\ud83d\udd13 <b>Secret found: '+esc(nm)+'!</b> New pin + profile icon');
  else openSheet(c=>{c.classList.add('secretfound');c.insertAdjacentHTML('beforeend','<p class="of-kick" style="text-align:center">Secret '+secretsFound()+' of '+SECRET_PINS.length+'</p><h2 style="text-align:center">You found a secret!</h2>');const w=document.createElement('div');w.className='sf-row';w.append(pinCanvas('b:'+id,110),iconCanvas('z:'+id,84));c.append(w);
    c.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center"><b>'+esc(nm)+'</b> pin and profile icon are yours. Find the rest in the Secret tab of the pin catalog.</p>');const ok=document.createElement('button');ok.className='btn primary';ok.textContent='Awesome!';ok.addEventListener('click',closeSheet);c.append(ok);});
  if(id!=='sec_detective'&&SECRET_PINS.filter(p=>p[0]!=='sec_detective'&&S.pins.includes(p[0])).length>=10)setTimeout(()=>findSecret('sec_detective'),busy?2500:200);
  return true;}
function ownedIcons(){const out=[];for(const id in S.owned)out.push('r:'+id);for(const n of TROPHY_ICONS)if((S.best|0)>=n)out.push('t:'+n);
  for(const id in S.owned)for(const sid of S.owned[id].skins){const sk=skinsOf(BY_ID[id]).find(k=>k.id===sid);if(sk&&(ICON_SKIN_TIERS.includes(sk.tier)||sk.ultraFx))out.push('s:'+id+':'+sid);}
  S.rankTop=Math.max(S.rankTop|0,rankInfo(S.rp|0).tier,rankInfo(S.rankPeak|0).tier);for(let t=0;t<=Math.min(7,S.rankTop);t++)out.push('k:'+t);
  for(const p of SECRET_PINS)if(S.pins.includes(p[0]))out.push('z:'+p[0]);
  for(const x of S.icons||[])out.push('x:'+x);for(let l=1;l<=SOLAR_MAX;l++){if((S.sol|0)>=l*3-2)out.push('o:'+l);if((S.sol|0)>=l*3-1)out.push('o:'+l+'a');}if((S.sol|0)>SOLAR_STEPS)out.push('o:11','o:11a');if(S.betaTester)out.push('x:tester');if(S.pass&&S.pass.super)out.push('x:super');return out;}
function playerCode(){const pid=myPid();let h=2166136261;for(const ch of pid)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<6;i++){o+=A[h%A.length];h=((Math.floor(h/A.length)^Math.imul(h,2654435761))>>>0);}return o;}
function grantRumbler(id){
  if(S.owned[id])return false;S.owned[id]=newRumbler();if(S.masterAll&&!S.owned[id].skins.includes('master'))S.owned[id].skins.push('master');const keep=[];
  for(const k of S.pendingSkins){const[rid,skid]=k.split(':');if(rid===id){if(!S.owned[id].skins.includes(skid))S.owned[id].skins.push(skid);}else keep.push(k);}
  S.pendingSkins=keep;return true;
}
/* Save codes: your whole save as text you can paste into any new version of the game */
function saveCode(){const b64=btoa(unescape(encodeURIComponent(JSON.stringify(S))));return 'RR1.'+b64+'.'+hashStr(b64).toString(36);}
function readCode(code){const m=String(code||'').replace(/\s+/g,'').match(/^RR1\.([A-Za-z0-9+/=]+)\.([a-z0-9]+)$/);if(!m)return{err:'That doesn\u2019t look like a save code. It should start with RR1.'};
  if(hashStr(m[1]).toString(36)!==m[2])return{err:'That code is damaged or cut off. Copy the whole code and try again.'};
  try{const o=JSON.parse(decodeURIComponent(escape(atob(m[1]))));if(!o||typeof o!=='object'||!o.owned)throw 0;return{save:loadSave(o)};}catch(e){return{err:'That code couldn\u2019t be read.'};}}
function grantPrestige(id,m,r){const rw=PRESTIGE_REWARDS[m],me=S.owned[id];if(!rw||!me)return;me.prClaim=Math.max(me.prClaim||0,m);
  if(rw.skin&&!me.skins.includes(rw.skin))me.skins.push(rw.skin);if(rw.pin){const pid='pr:'+id+':'+rw.pin;if(!S.pins.includes(pid))S.pins.push(pid);}
  if(r){S.coins+=rw.coins;S.pp+=rw.pp;for(const d of rw.drops)for(let k=0;k<d.n;k++)S.drops.push({r:d.r,min:null});r.prestigeReward={id,m,...rw};}}
/* Skin and prestige pins only work for their own rumbler; set pins only for the rumbler whose skin they came with */
function grantRankSet(k){const rs=RANK_SETS[k];grantSkin(rankSetRumbler(k,rankSeed(S)),rs.skin.id);if(!S.pins.includes(rs.pin))S.pins.push(rs.pin);}
function skinPinIds(id,sk){const f=skinPinFaces(sk);return f?f.map(x=>'sk:'+id+':'+sk.id+':'+x):['sk:'+id+':'+sk.id];}
function grantSkinPin(id,skid){const sk=getSkin(BY_ID[id],skid);if(sk&&sk.id===skid&&skinHasPin(sk))for(const pid of skinPinIds(id,sk))if(!S.pins.includes(pid))S.pins.push(pid);}
function grantSkin(id,skid){grantSkinPin(id,skid);const me=S.owned[id];if(me){if(!me.skins.includes(skid))me.skins.push(skid);}else if(!S.pendingSkins.includes(id+':'+skid))S.pendingSkins.push(id+':'+skid);}
function rollDropRarity(start){let i=Math.max(0,DROP_RAR.indexOf(start||'rare'));while(i<DROP_RAR.length-1&&Math.random()<DROP_UP[i])i++;return DROP_RAR[i];}
function winDropPlan(){const k=todayKey();if(S.dropDay.date!==k)S.dropDay={date:k,n:0};const D=S.dropDay;
  if(!Array.isArray(D.plan)||D.plan.length!==WIN_DROPS_PER_DAY){D.plan=Array.from({length:WIN_DROPS_PER_DAY},()=>rollWinDrop()||'rare');D.pv=0;}
  /* every day: one guaranteed Starfall drop and one Rumbler Box among the 5 win drops */
  if(D.pv!==2){D.pv=2;const open=[];for(let i=(D.n|0);i<WIN_DROPS_PER_DAY;i++)open.push(i);shuffle(open);
    const take=v=>{if(D.plan.includes(v))return;const i=open.findIndex(j=>D.plan[j]!=='season'&&D.plan[j]!=='rbox');if(i>=0){D.plan[open[i]]=v;open.splice(i,1);}};take('season');take('rbox');}
  persist();return D.plan;}
function rollWinDrop(){if(halloweenOn()&&Math.random()<.08)return pick(SPOOKY);let x=Math.random()*100;for(const[r,p]of WIN_DROP_LUCKY){if(x<p)return r;x-=p;}return null;}
function pickWeighted(list){const tot=list.reduce((n,e)=>n+e[1],0);let x=Math.random()*tot;for(const e of list){x-=e[1];if(x<0)return e;}return list[list.length-1];}
/* Starfall (seasonal) drops: better than Amazing. Starfall skins and pins, currencies and pass tokens. Never rumblers. */
const SEASON_LOOT=[['skin',24],['pin',14],['coins',16,[800,2000]],['gems',12,[40,100]],['pp',14,[500,1100]],['chromos',12,[1200,3000]],['pass',12,[120,280]]];
function openSeasonDrop(){const e=pickWeighted(SEASON_LOOT),res={rar:'season',start:'season',kind:e[0]};
  if(e[0]==='skin'){const ids=RUMBLERS.map(b=>b.id).filter(id=>!hasSkin(id,'starfall'));const mine=ids.filter(id=>S.owned[id]);const pool=mine.length?mine:ids;
    if(pool.length){const id=pick(pool);grantSkin(id,'starfall');res.id=id;res.skid='starfall';}else{res.kind='gems';res.n=60;res.note='You own every Starfall skin, so it became gems';}}
  else if(e[0]==='pin'){const pool=PASS_PINS.concat(SEASON_PINS).map(x=>x[0]).filter(x=>!S.pins.includes(x));if(pool.length){res.pin=pick(pool);S.pins.push(res.pin);}else{res.kind='gems';res.n=40;res.note='You own every Starfall pin, so it became gems';}}
  else{res.n=randi(e[2][0],e[2][1]);res.n=Math.round(res.n/5)*5;if(e[0]==='pass'){S.pass.xp+=res.n;}else S[e[0]]+=res.n;}
  if(res.kind==='gems'&&res.note)S.gems+=res.n;persist();return res;}
/* Halloween drops: Halloween skins and pins, other skins, power points, pass tokens, coins, gems */
function grantHwSkin(res){const pairs=[];for(const b of RUMBLERS)for(const hs of HALLOWEEN_SKINS)if(!hasSkin(b.id,hs.id))pairs.push([b.id,hs.id]);const mine=pairs.filter(p=>S.owned[p[0]]),pool=mine.length?mine:pairs;
  if(!pool.length)return false;const[id,sk]=pick(pool);grantSkin(id,sk);res.kind='skin';res.id=id;res.skid=sk;return true;}
function grantAnySkin(res){const pool=[];for(const id in S.owned)for(const sk of skinsOf(BY_ID[id]))if(sk.tier!==0&&!earnOnly(sk)&&!ALWAYS_SKIN(sk)&&!hasSkin(id,sk.id))pool.push([id,sk.id]);if(!pool.length)return false;const[id,sk]=pick(pool);grantSkin(id,sk);res.kind='skin';res.id=id;res.skid=sk;return true;}
function grantHwPin(res){const pool=HALLOWEEN_PINS.map(x=>x[0]).filter(x=>!S.pins.includes(x));if(!pool.length)return false;res.kind='pin';res.pin=pick(pool);S.pins.push(res.pin);return true;}
function openSpookyDrop(r){if(halloweenOn())S.hw.opened=(S.hw.opened|0)+1;const e=pickWeighted(SPOOKY_LOOT),res={rar:r,start:r,kind:e[0]};
  const ok=e[0]==='hskin'?grantHwSkin(res):e[0]==='skin'?grantAnySkin(res):e[0]==='hpin'?grantHwPin(res):null;
  if(ok===false){res.kind='pp';res.n=500;S.pp+=500;res.note='Nothing new left there, so it became power points';}
  else if(ok===null){res.n=Math.round(randi(e[2][0],e[2][1])/5)*5;if(e[0]==='pass')S.pass.xp+=res.n;else S[e[0]]+=res.n;}
  persist();return res;}
function knocksLeft(){return S.hw.knocks|0;}
function tokensLeft(){return Math.max(0,Math.floor((S.hw.wins|0)/KNOCK_EVERY)-(S.hw.spent|0));}
function spendToken(choice){if(tokensLeft()<=0)return null;S.hw.spent++;if(choice==='knock'){S.hw.knocks++;persist();return{kind:'knock'};}const r=pick(SPOOKY);S.drops.push({r,min:null});persist();return{kind:'spooky',r};}
function hwDoors(){if(!S.hw.doors){S.hw.doors=shuffle(RUMBLERS.filter(b=>!b.random).map(b=>b.id)).slice(0,6);persist();}return S.hw.doors;}
/* Knock on a door: a skin, a drop, a guaranteed drop, a Halloween skin or pin, or a Halloween drop */
/* i = -1 is the taped-off Dead Inside house: 5% chance of Surged Dark, guaranteed by the 50th knock there */
/* the Happy House opens once you've knocked 100 times (any doors) and always gives Surged Dark; it doesn't use a knock */
function happyReady(){return(S.hw.knocked|0)>=HAPPY_KNOCKS&&!hasSkin('dark','hw_surged');}
function knockHappy(){if(!happyReady())return null;grantSkin('dark','hw_surged');S.hw.surged=1;persist();return{who:'dark',kind:'surged'};}
function knockDoor(i){if(knocksLeft()<=0)return null;S.hw.knocks--;S.hw.used++;
  S.hw.knocked=(S.hw.knocked|0)+1;
  if(i<0){S.hw.dead=(S.hw.dead|0)+1;if(!hasSkin('dark','hw_grim')&&(Math.random()<DEAD_CHANCE||S.hw.dead>=DEAD_PITY)){grantSkin('dark','hw_grim');persist();return{who:'dark',kind:'grim'};}}
  const who=i<0?'dark':hwDoors()[i],e=pickWeighted(KNOCK_LOOT),res={who,kind:e[0]};
  if(e[0]==='skin'&&!grantAnySkin(res))e[0]='hskin';
  if(e[0]==='hskin'&&!grantHwSkin(res))e[0]='hpin';
  if(e[0]==='hpin'&&!grantHwPin(res))e[0]='spooky';
  if(e[0]==='drop'){S.drops.push({r:null,min:null});res.kind='drop';}
  else if(e[0]==='gdrop'){const r=pickWeighted([['epic',5],['mythic',4],['legendary',2]])[0];S.drops.push({r,min:null,g:1});res.kind='gdrop';res.r=r;}
  else if(e[0]==='spooky'){const r=pick(SPOOKY);S.drops.push({r,min:null});res.kind='spooky';res.r=r;}
  else if(e[0]==='coins'||e[0]==='pp'){res.kind=e[0];res.n=e[0]==='coins'?Math.round(randi(400,1200)/10)*10:Math.round(randi(250,700)/10)*10;S[e[0]]+=res.n;}
  else if(e[0]==='trick'){res.kind='trick';}
  if(i>=0){const pool=RUMBLERS.filter(b=>!b.random&&!S.hw.doors.includes(b.id));S.hw.doors[i]=pick(pool).id;}persist();return res;}
function claimDark(){if(S.owned.dark||(S.hw.opened|0)<DARK_DROPS)return false;grantRumbler('dark');const d=S.owned.dark;if(d&&!d.skins.includes('hw_reaper')){d.skins.push('hw_reaper');d.skin='hw_reaper';}S.hw.darkClaimed=1;persist();return true;}
/* Rumbler Box: a guaranteed rumbler (mostly Rare/Epic/Mythic, Legendary is rare) plus resources.
   Skin Box: three guaranteed skins plus five resources (8 rewards). Both show a reward counter while you open them. */
function grantBoxRumbler(){const w=[['rare',35],['epic',35],['mythic',22],['legendary',7],['ultra',1]],free=b=>!S.owned[b.id]&&!eventLocked(b);
  const avail=w.filter(([r])=>RUMBLERS.some(b=>b.rarity===r&&free(b)));
  if(!avail.length){const n=Math.round(randi(2000,6000)/50)*50;S.chromos+=n;return{kind:'chromos',n,note:'You own every rumbler, so it became chromos'};}
  const r=pickWeighted(avail)[0],b=pick(RUMBLERS.filter(x=>x.rarity===r&&free(x)));grantRumbler(b.id);return{kind:'rumbler',id:b.id};}
function openBox(kind){const items=[],R=[['coins',[300,900]],['pp',[200,600]],['gems',[10,30]],['chromos',[500,1500]]];
  /* Rumbler Box: 7 rewards guaranteed, and each lucky roll adds one more (up to 10). Skin Box: 8 rewards. */
  let extra=kind==='rbox'?6:5;if(kind==='rbox')while(extra<9&&Math.random()<.35)extra++;
  for(let i=0;i<extra;i++){const[k,[a,b]]=R[Math.floor(Math.random()*R.length)];let n=randi(a,b);if(n>=50)n=Math.round(n/10)*10;S[k]+=n;items.push({kind:k,n});}
  if(kind==='rbox'&&Math.random()<.3){const it={};if(grantAnySkin(it))items.push(it);}
  if(kind==='rbox'&&Math.random()<.25){const left=SPECIAL_ICONS.map(x=>x[0]).filter(x=>!(S.icons||[]).includes(x));if(left.length){const ic=pick(left);(S.icons||(S.icons=[])).push(ic);items.push({kind:'icon',icon:ic});}}
  if(kind==='rbox')items.push(grantBoxRumbler());
  else for(let i=0;i<3;i++){const it={};if(grantAnySkin(it))items.push(it);else{S.gems+=40;items.push({kind:'gems',n:40,note:'You own every skin, so it became gems'});}}
  persist();return{rar:kind,start:kind,kind:'box',items,idx:0};}
function openDrop(d){const r=openDrop0(d);try{if(r&&r.rar&&S.st){S.st.drops[r.rar]=(S.st.drops[r.rar]|0)+1;}}catch(e){}return r;}
function openDrop0(d){
  if(d&&BOXES.includes(d.r))return openBox(d.r);
  if(d&&SPOOKY.includes(d.r))return openSpookyDrop(d.r);
  if(d&&d.r==='season')return openSeasonDrop();
  const start=d.r||d.min||'rare',rar=rollDropRarity(start),e=pickWeighted(DROP_LOOT[rar]),res={rar,start,kind:e[0]};
  if(e[0]==='rumbler'){const pool=RUMBLERS.filter(b=>!S.owned[b.id]&&e[2].includes(b.rarity)&&!eventLocked(b));
    if(pool.length){const b=pick(pool);grantRumbler(b.id);res.id=b.id;}
    else{res.kind='chromos';res.n=Math.round(RARITY[e[2][e[2].length-1]].chromos*.25);res.note='You already own every '+e[2].map(x=>RARITY[x].name).join(' and ')+' rumbler, so it became chromos';}}
  else if(e[0]==='skin'){const pool=[];for(const id in S.owned)for(const sk of skinsOf(BY_ID[id]))if(sk.tier!==0&&!earnOnly(sk)&&!S.owned[id].skins.includes(sk.id))pool.push([id,sk.id]);
    if(pool.length){const[id,skid]=pick(pool);grantSkin(id,skid);res.id=id;res.skid=skid;}else{res.kind='gems';res.n=30;res.note='You own every skin, so it became gems';}}
  else{const v=randi(e[2][0],e[2][1]);res.n=e[2][0]>=50?Math.round(v/5)*5:v;}
  if(res.kind!=='rumbler'&&res.kind!=='skin')S[res.kind]+=res.n;
  persist();return res;
}
/* A new rumbler every day, picked from the date, never the same one two days in a row */
function pickOffer(k,prev){
  let el=RUMBLERS.filter(b=>!S.owned[b.id]&&!RARITY[b.rarity].passOnly&&b.rarity!=='common'&&!eventLocked(b));if(!el.length)return null;
  if(prev&&el.length>1)el=el.filter(b=>b.id!==prev);
  return{id:el[hashStr(k+'|offer')%el.length].id,bought:false};
}

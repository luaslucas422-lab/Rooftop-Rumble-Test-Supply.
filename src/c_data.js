<script>
(()=>{
'use strict';
/* online: NETS = running inside the game server; MYT = which team is "mine" on this phone */
const NETS=!!window.__rrServer;let MYT=0;
/* which version is running: main game, sandbox, 3D test, or the beta (beta = its own build served from the game server) */
const RR_BETA=true;
const RR_MODE=(()=>{if(RR_BETA)return'beta';let m='main';try{m=localStorage.getItem('rr-mode')||'main';}catch(e){}return['main','sandbox','d3','beta'].includes(m)?m:'main';})();
const $=s=>document.querySelector(s);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[(Math.random()*a.length)|0];
const dist=(ax,ay,bx,by)=>Math.hypot(bx-ax,by-ay);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const REDUCED=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();
const OUT='#120f26',BLUE='#46b4ff',RED='#ff5d57',SUNC='#ffc93c',OKC='#6be39a';

/* ---------- Rarities & levels ---------- */
const RARITY={
  common:{name:'Common',col:'#c9cfe0',chromos:0},
  rare:{name:'Rare',col:'#46b4ff',chromos:1500},
  epic:{name:'Epic',col:'#b56cff',chromos:7000},
  mythic:{name:'Mythic',col:'#ff5d8f',chromos:11000},
  legendary:{name:'Legendary',col:'#ffc93c',chromos:15000},
  celestial:{name:'Rumble Pass Exclusive',col:'#ffb86b',chromos:0,passOnly:true},
  ultra:{name:'Amazing',col:'#7df9ff',chromos:30000},
  season:{name:'Starfall',col:'#b48cff',chromos:0,seasonal:true},
  rbox:{name:'Rumbler Box',col:'#ff5e87',chromos:0,seasonal:true,box:true},
  sbox:{name:'Skin Box',col:'#ff9bf0',chromos:0,seasonal:true,box:true},
  pumpkin:{name:'Pumpkin',col:'#ff8a1f',chromos:0,seasonal:true,spooky:true},
  skeleton:{name:'Skeleton',col:'#e8e4d8',chromos:0,seasonal:true,spooky:true},
  zombie:{name:'Zombie',col:'#7ed957',chromos:0,seasonal:true,spooky:true},
};
const CHROMOS_PER_KO=10;
const MAX_LVL=11;
const UP_PP=[20,30,50,80,130,210,340,550,890,1440];
const UP_COIN=[20,35,75,140,290,480,800,1250,1875,2800];
const mulFor=l=>1+(l-1)*.07;

/* ---------- Rumblers (all original) ---------- */
const RUMBLERS=[
 {id:'ember',name:'Ember',rarity:'common',role:'Flame sprayer',rad:20,hp:3800,speed:150,reload:1.0,superNeed:4000,pref:.55,
  atk:{kind:'spread',n:5,arc:.5,range:235,spd:560,dmg:250,r:9,pierce:true},sup:{kind:'nova',radius:150,dmg:1300,kb:320},
  atkName:'Torch Spray',atkDesc:'Sprays five short flames that pass through enemies.',supName:'Inferno Ring',supDesc:'Blasts a ring of fire around Ember and knocks enemies back.',
  look:{body:'#ff7a3d',belly:'#ffd3a6',accent:'#ffd23f',proj:'#ff9b3d',hat:'flame'},sig:{name:'Dragon Hatchling',body:'#33a06c',belly:'#c6f0cf',accent:'#ffcf3d',proj:'#7dff9a',hat:'dragon'}},
 {id:'bolt',name:'Bolt',rarity:'rare',role:'Sharpshooter',rad:19,hp:2800,speed:140,reload:1.4,superNeed:3300,pref:.8,trait:'goggles',
  atk:{kind:'single',range:430,spd:950,dmg:1100,r:7},sup:{kind:'beam',range:560,spd:1400,dmg:2200,r:14},
  atkName:'Long Bolt',atkDesc:'Fires one fast bolt that crosses most of the roof.',supName:'Rail Shot',supDesc:'A piercing shot that hits everyone in its lane.',
  look:{body:'#5aa9e6',belly:'#d3ebff',accent:'#ffd23f',proj:'#a6ecff',hat:'none'},sig:{name:'Sky Pirate',body:'#3c5c9e',belly:'#d9e4ff',accent:'#e6b44a',proj:'#ffe08a',hat:'tricorn'}},
 {id:'spritz',name:'Spritz',rarity:'rare',role:'Bubble medic',rad:19,hp:3300,speed:145,reload:1.1,superNeed:3600,pref:.7,trait:'tank',
  atk:{kind:'spread',n:3,arc:.26,range:330,spd:620,dmg:420,r:9},sup:{kind:'heal',radius:180,heal:2400},
  atkName:'Fizz Shot',atkDesc:'Shoots three bubbles in a tight spread.',supName:'Fizz Burst',supDesc:'Heals Spritz and every teammate nearby.',
  look:{body:'#74d6c4',belly:'#e3fbf5',accent:'#ff8fb1',proj:'#bdf3ff',hat:'none'},sig:{name:'Bubble Tea',body:'#d6ad86',belly:'#f4e2cf',accent:'#3d2a1f',proj:'#3d2a1f',hat:'straw',dots:true}},
 {id:'nix',name:'Nix',rarity:'rare',role:'Frost thrower',rad:19,hp:3000,speed:145,reload:1.1,superNeed:3300,pref:.75,trait:'scarf',
  atk:{kind:'single',range:340,spd:780,dmg:820,r:8,slow:1.4},sup:{kind:'field',range:360,radius:120,dur:3.2,dps:900,flight:.45},
  atkName:'Ice Shard',atkDesc:'A frozen shard that slows whoever it hits.',supName:'Blizzard',supDesc:'Throws a storm cloud that freezes and slows an area.',
  look:{body:'#9fd8ff',belly:'#eef8ff',accent:'#3d7bff',proj:'#c9f0ff',hat:'beanie'},sig:{name:'Yeti Pup',body:'#e6edf7',belly:'#ffffff',accent:'#6aa8ff',proj:'#bfe2ff',hat:'horns',frost:true}},
 {id:'zing',name:'Zing',rarity:'rare',role:'Boomerang ranger',rad:19,hp:3100,speed:155,reload:1.0,superNeed:3400,pref:.7,
  atk:{kind:'boomerang',range:300,spd:620,dmg:520,r:11},sup:{kind:'boomerang3',range:340,spd:680,dmg:620,r:12,n:3,arc:.7},
  atkName:'Rang',atkDesc:'Throws a boomerang that hits on the way out and on the way back.',supName:'Triple Rang',supDesc:'Three boomerangs at once in a wide fan.',
  look:{body:'#ffb347',belly:'#ffe6c2',accent:'#e2543b',proj:'#ffd38a',hat:'bandana'},sig:{name:'Outback Ace',body:'#b8763d',belly:'#f0d3ad',accent:'#2b6e58',proj:'#ffb347',hat:'tricorn'}},
 {id:'boulder',name:'Boulder',rarity:'epic',role:'Heavy tank',rad:24,hp:6400,speed:132,reload:.85,superNeed:3900,pref:0,trait:'rocks',boxy:true,
  atk:{kind:'melee',range:80,arc:1.3,dmg:1250,kb:220},sup:{kind:'dash',range:320,spd:720,dmg:1500,kb:380},
  atkName:'Rock Fist',atkDesc:'A heavy punch that shoves enemies back.',supName:'Landslide',supDesc:'Charges forward and flattens anyone in the way.',
  look:{body:'#8d90a6',belly:'#c4c6d4',accent:'#e9b44c',proj:'#e9b44c',hat:'none'},sig:{name:'Moss Giant',body:'#6d7d5a',belly:'#b9c79a',accent:'#9bd36a',proj:'#9bd36a',hat:'moss'}},
 {id:'pip',name:'Pip',rarity:'epic',role:'Bomb lobber',rad:18,hp:2700,speed:140,reload:1.35,superNeed:3000,pref:.75,
  atk:{kind:'lob',range:370,flight:.65,dmg:1000,splash:70},sup:{kind:'bigbomb',range:420,flight:.85,dmg:2300,splash:140},
  atkName:'Pop Bomb',atkDesc:'Lobs a bomb over walls that splashes on landing.',supName:'Big Boomer',supDesc:'Lobs a huge bomb with a wide blast.',
  look:{body:'#ffcf4a',belly:'#fff1bd',accent:'#e2543b',proj:'#3a2f4f',hat:'propeller'},sig:{name:'Firework Fiend',body:'#d6334a',belly:'#ffc4bd',accent:'#ffd23f',proj:'#ffd23f',hat:'fuse'}},
 {id:'marlo',name:'Marlo',rarity:'epic',role:'Tide caller',rad:21,hp:4300,speed:140,reload:1.2,superNeed:3800,pref:.6,
  atk:{kind:'wave',range:300,spd:400,dmg:900,r:22,pierce:true},sup:{kind:'bigwave',range:380,spd:520,dmg:1500,r:46,kb:340},
  atkName:'Swell',atkDesc:'A wide, slow wave that rolls through every enemy in its path.',supName:'Riptide',supDesc:'A giant wave that slams enemies and washes them back.',
  look:{body:'#3fb6c9',belly:'#d4f6fb',accent:'#ffd23f',proj:'#7fe6ff',hat:'snorkel'},sig:{name:'Deep Diver',body:'#2c3f86',belly:'#9fb6ff',accent:'#ff9f43',proj:'#6ad0ff',hat:'helmet'}},
 {id:'volta',name:'Volta',rarity:'epic',role:'Storm caster',rad:19,hp:3000,speed:150,reload:1.15,superNeed:3500,pref:.75,
  atk:{kind:'chain',range:340,spd:1100,dmg:850,r:7,jumps:2,jumpR:170,falloff:.7},sup:{kind:'chainbig',range:380,spd:1300,dmg:1400,r:10,jumps:5,jumpR:220,falloff:1,stun:.7},
  atkName:'Arc Zap',atkDesc:'A spark that jumps to two more enemies nearby.',supName:'Overload',supDesc:'A huge bolt that chains through five enemies and stuns them.',
  look:{body:'#5b4be0',belly:'#c8c1ff',accent:'#fff26b',proj:'#fff26b',hat:'spikes'},sig:{name:'Neon Coil',body:'#1d1f2e',belly:'#3a3f5c',accent:'#3dfcff',proj:'#3dfcff',hat:'spikes',glow:'#3dfcff',eye:'#3dfcff'}},
 {id:'vex',name:'Vex',rarity:'mythic',role:'Shadow striker',rad:19,hp:3500,speed:172,reload:.65,superNeed:3150,pref:0,trait:'ears',
  atk:{kind:'melee',range:90,arc:1.1,dmg:560,double:true},sup:{kind:'dash',range:380,spd:900,dmg:1200,kb:200},
  atkName:'Twin Slash',atkDesc:'Two quick dagger slashes up close.',supName:'Shadow Step',supDesc:'Dashes through enemies, slicing each one.',
  look:{body:'#6c5bd6',belly:'#bbb2f4',accent:'#ff4d8d',proj:'#ff4d8d',hat:'none'},sig:{name:'Night Moth',body:'#4b3d6e',belly:'#a99cd0',accent:'#f5d76e',proj:'#f5d76e',hat:'antennae'}},
 {id:'bramble',name:'Bramble',rarity:'mythic',role:'Vine warden',rad:20,hp:4700,speed:148,reload:.95,superNeed:3600,pref:.55,
  atk:{kind:'melee',range:150,arc:.5,dmg:1050,pull:150},sup:{kind:'root',radius:170,dmg:900,stun:1.6},
  atkName:'Vine Lash',atkDesc:'A long whip that yanks enemies closer.',supName:'Overgrowth',supDesc:'Roots every enemy nearby in place.',
  look:{body:'#5fb04a',belly:'#d4f0b8',accent:'#ff7ab8',proj:'#7ed957',hat:'flower'},sig:{name:'Autumn Thorn',body:'#c4622d',belly:'#f6d1a8',accent:'#ffd23f',proj:'#ff9f43',hat:'leaf'}},
 {id:'rook',name:'Rook',rarity:'mythic',role:'Turret tinker',rad:20,hp:3400,speed:145,reload:1.25,superNeed:3200,pref:.75,
  atk:{kind:'burst',n:3,gap:.09,range:360,spd:900,dmg:380,r:6},sup:{kind:'turret',hp:3000,dur:12,rate:.5,dmg:300,reach:380},
  atkName:'Rivet Burst',atkDesc:'Three rivets in quick succession.',supName:'Sentry',supDesc:'Builds a turret that shoots nearby enemies for 12 seconds.',
  look:{body:'#e8913c',belly:'#ffe0bd',accent:'#2b3a55',proj:'#ffd38a',hat:'hardhat'},sig:{name:'Chrome Mech',body:'#b8c2d6',belly:'#eef2fa',accent:'#ff4d6d',proj:'#ff9ab0',hat:'antenna',shine:true}},
 {id:'echo',name:'Echo',rarity:'legendary',role:'Sound shaper',rad:19,hp:3600,speed:162,reload:.95,superNeed:3400,pref:.2,
  atk:{kind:'pulse',range:125,dmg:720},sup:{kind:'shockcone',range:280,arc:1.1,dmg:1600,stun:1,kb:260},
  atkName:'Bass Drop',atkDesc:'A sound pulse that hits every enemy close by.',supName:'Shockwave',supDesc:'A blast of sound that stuns everyone in front of Echo.',
  look:{body:'#ff5ea8',belly:'#ffd1e6',accent:'#2b2a4a',proj:'#ff9ccc',hat:'headphones'},sig:{name:'Disco Star',body:'#ffd23f',belly:'#fff4c2',accent:'#7c3aed',proj:'#ffe680',hat:'headphones',sprinkles:true,glow:'#ffd23f'}},
 {id:'woodrow',name:'Woodrow',rarity:'legendary',role:'Dam builder',rad:21,hp:4400,speed:150,reload:1.3,superNeed:3800,pref:.7,trait:'beaver',
  atk:{kind:'log',range:380,spd:650,dmg:1176.5,r:12,split:4,splitDmg:.3,splitRange:160},sup:{kind:'dam',range:260,radius:150,dur:8,heal:.06,speed:.3,dps:300,poison:450,poisonT:4},
  atkName:'Log Toss',atkDesc:'Throws a heavy log in a straight line (2,000 damage at level 11). On a hit it splits into four splinters that fly on and hit for less.',
  supName:'Beaver Dam',supDesc:'Builds a dam pond. Teammates inside slowly heal and move faster. Enemies inside take damage, and stay soaked with slower, harder-hitting poison after they leave.',
  look:{body:'#8a5a3b',belly:'#d9b48f',accent:'#ff8fc7',proj:'#a0673f',hat:'none'},sig:{name:'Lumberjack',body:'#6e4229',belly:'#caa27c',accent:'#e23d3d',proj:'#8a5a3b',hat:'beanie'}},
 {id:'pebble',name:'Pebble',rarity:'rare',role:'Slingshot scout',rad:18,hp:2900,speed:152,reload:1.0,superNeed:3200,pref:.75,weapon:'sling',
  atk:{kind:'burst',n:2,gap:.12,range:370,spd:820,dmg:520,r:7},sup:{kind:'bigbomb',range:400,flight:.7,dmg:1800,splash:120},
  atkName:'Double Flick',atkDesc:'Flicks two stones in quick succession.',supName:'Rockfall',supDesc:'Lobs a boulder that crushes a wide area.',
  look:{body:'#7fc96b',belly:'#e6f7d9',accent:'#e2543b',proj:'#c9c2b6',hat:'cap'},sig:{name:'Street Champ',body:'#2b2a4a',belly:'#6c6aa0',accent:'#ffd23f',proj:'#ffd23f',hat:'cap'}},
 {id:'coco',name:'Coco',rarity:'rare',role:'Coconut bomber',rad:20,hp:3600,speed:148,reload:1.2,superNeed:3500,pref:.7,weapon:'coconut',
  atk:{kind:'lob',range:340,flight:.55,dmg:950,splash:62},sup:{kind:'nova',radius:165,dmg:1200,kb:280},
  atkName:'Coconut Lob',atkDesc:'Lobs a coconut over walls that cracks open on landing.',supName:'Banana Blast',supDesc:'Stomps the roof, blasting everyone nearby back.',
  look:{body:'#a86b3c',belly:'#f2d1a8',accent:'#ffd23f',proj:'#7a4a28',hat:'monkey'},sig:{name:'Temple Guardian',body:'#d4a63a',belly:'#fff0c2',accent:'#3fae58',proj:'#ffd23f',hat:'crown'}},
 {id:'gus',name:'Gus',rarity:'epic',role:'Wrench bruiser',rad:23,hp:6000,speed:135,reload:.9,superNeed:3800,pref:0,trait:'goggles',weapon:'wrench',
  atk:{kind:'melee',range:95,arc:1.2,dmg:1400,kb:160},sup:{kind:'root',radius:150,dmg:1100,stun:1.2},
  atkName:'Wrench Swing',atkDesc:'A big wrench swing that pushes enemies back.',supName:'Ground Shock',supDesc:'Slams the wrench down, stunning everyone close by.',
  look:{body:'#4f86c6',belly:'#cfe3f7',accent:'#ffb347',proj:'#ffb347',hat:'none'},sig:{name:'Rust Bucket',body:'#a5532c',belly:'#e9b38f',accent:'#9fb0c2',proj:'#e9b38f',hat:'antenna'}},
 {id:'luna',name:'Luna',rarity:'epic',role:'Moon witch',rad:19,hp:3200,speed:150,reload:1.05,superNeed:3500,pref:.75,weapon:'moon',
  atk:{kind:'crescent',range:340,spd:560,dmg:520,r:12,curve:2.0},sup:{kind:'heal',radius:200,heal:2800},
  atkName:'Twin Crescents',atkDesc:'Throws two moon crescents that curve in from both sides and cut through enemies.',supName:'Moonlight',supDesc:'Bathes every teammate nearby in healing light.',
  look:{body:'#7c6cf0',belly:'#e0dbff',accent:'#ffe27a',proj:'#fff1b0',hat:'witch'},sig:{name:'Eclipse',body:'#1f1a3a',belly:'#3c335f',accent:'#ff7a1a',proj:'#ff7a1a',hat:'witch',glow:'#ff7a1a',eye:'#ffb347'}},
 {id:'quill',name:'Quill',rarity:'mythic',role:'Spiky skirmisher',rad:20,hp:4000,speed:145,reload:1.1,superNeed:3600,pref:.5,weapon:'quill',
  atk:{kind:'spread',n:7,arc:1.0,range:250,spd:620,dmg:210,r:6},sup:{kind:'nova',radius:200,dmg:1500,kb:240},
  atkName:'Quill Spray',atkDesc:'Fires seven quills in a wide fan.',supName:'Quill Storm',supDesc:'Launches quills in every direction at once.',
  look:{body:'#9a7b5c',belly:'#efe0c9',accent:'#4a3628',proj:'#f5ead8',hat:'quills'},sig:{name:'Punk Spike',body:'#2d2a3e',belly:'#5a5577',accent:'#ff3fa4',proj:'#ff3fa4',hat:'quills'}},
 {id:'fang',name:'Fang',rarity:'mythic',role:'Wolf hunter',rad:19,hp:3700,speed:168,reload:.7,superNeed:3200,pref:.2,trait:'ears',weapon:'claw',
  atk:{kind:'spread',n:3,arc:.7,range:150,spd:700,dmg:420,r:9,pierce:true},sup:{kind:'dash',range:400,spd:950,dmg:1300,kb:220},
  atkName:'Claw Swipe',atkDesc:'Three short claw slashes that cut through enemies.',supName:'Pounce',supDesc:'Leaps forward, tearing through everyone in the way.',
  look:{body:'#8b95a8',belly:'#e4e8f0',accent:'#ff4d6d',proj:'#ffd1dc',hat:'none'},sig:{name:'Midnight Howl',body:'#2b2f4a',belly:'#56607f',accent:'#7fe9fb',proj:'#7fe9fb',hat:'none',glow:'#7fe9fb',eye:'#7fe9fb'}},
 {id:'astra',name:'Astra',rarity:'legendary',role:'Star caller',rad:19,hp:3300,speed:152,reload:1.15,superNeed:3600,pref:.8,weapon:'laser',
  atk:{kind:'single',range:420,spd:1200,dmg:950,r:7,pierce:true},sup:{kind:'field',range:380,radius:140,dur:3,dps:1000,flight:.5,pull:120},
  atkName:'Star Lance',atkDesc:'A piercing laser that hits every enemy in a line.',supName:'Black Hole',supDesc:'Opens a black hole that drags enemies in and damages them.',
  look:{body:'#2e2a6b',belly:'#7f78d6',accent:'#ffe27a',proj:'#fff4b0',hat:'halo',sprinkles:true},sig:{name:'Supernova',body:'#ff7a1a',belly:'#ffd29a',accent:'#ffffff',proj:'#ffd38a',hat:'halo',glow:'#ffb347'}},
 {id:'lilt',name:'Lil T',rarity:'mythic',role:'Bat bruiser',rad:21,hp:5200,speed:155,reload:1.1,superNeed:12000,pref:0,trait:'wood',
  atk:{kind:'melee',range:95,arc:1.4,dmg:3235.3,kb:160,bat:{poison:294.12,dur:5}},sup:{kind:'homebat',seek:700,spd:720,dmg:4117.65,back:4117.65,poison:294.12,dur:5},
  atkName:'Bat Smash',atkDesc:'Swings his bat up close (5,500 damage at level 11). Every bat hit slows the enemy, makes them take 25% more damage and poisons them for 500 a second, all for 5 seconds.',
  supName:'Bat Toss',supDesc:'Throws his bat at the nearest enemy. It chases them until it hits (7,000 damage at level 11), then flies back and hits anyone else in its way for 7,000 too. Thrown bat hits slow, weaken and poison just like his swings.',
  look:{body:'#b07a45',belly:'#e2bf8a',accent:'#2fae66',proj:'#f4f1e6',hat:'sprout'},sig:{name:'Midnight Slugger',body:'#3b2a20',belly:'#7a5a40',accent:'#ff4d6d',proj:'#ffd1dc',hat:'cap'}},
 {id:'zapper',name:'Zapper',rarity:'mythic',role:'Storm caller',rad:19,hp:5200,speed:140,reload:.5,ammo:3,superNeed:9000,pref:.15,trait:'cloud',
  atk:{kind:'cloudzap',zone:150,range:150,dmg:1764.71,jumpR:150,jumps:2},sup:{kind:'thunder',range:0,radius:300,dur:6,clouds:4,dmg:380,rate:.5},
  atkName:'Storm Cloud',atkDesc:'Zapper has no bullets of his own. A storm cloud floats above him, and it only charges up while an enemy is inside his zone. Each charge zaps an enemy in the zone with lightning (3,000 damage at level 11), and the bolt jumps to up to 2 more enemies standing close to them.',
  supName:'Thunderhead',supDesc:'Summons a huge storm zone around him with a ring of thunderclouds that keep zapping every enemy inside for 6 seconds.',
  look:{body:'#4f6bd8',belly:'#d6e2ff',accent:'#ffe14d',proj:'#bfe6ff',hat:'none'},sig:{name:'Red Storm',body:'#7a2340',belly:'#ffc2d4',accent:'#ff5e87',proj:'#ff9bb5',hat:'none'}},
 {id:'fizz',name:'Fizz',rarity:'epic',role:'Soda blaster',rad:19,hp:3500,speed:155,reload:1.3,superNeed:5000,pref:.6,boxy:true,weapon:'bolt',
  atk:{kind:'burst',n:4,gap:.07,range:310,spd:760,dmg:300,r:7},sup:{kind:'field',range:360,radius:130,dur:4,dps:750,flight:.5},
  atkName:'Shaken Up',atkDesc:'Fires four fizzy bubbles in a quick burst.',supName:'Sugar Rush',supDesc:'Lobs a can that bursts into a sticky soda puddle, hurting and slowing enemies in it.',
  look:{body:'#ff5e87',belly:'#ffd1dc',accent:'#ffffff',proj:'#ffd1dc',hat:'straw'},sig:{name:'Lime Zero',body:'#5fd35f',belly:'#e3ffd6',accent:'#1f3a1f',proj:'#c8ff9a',hat:'straw'}},
 {id:'sprocket',name:'Sprocket',rarity:'rare',role:'Gear tosser',rad:19,hp:3300,speed:150,reload:1.0,superNeed:3400,pref:.7,boxy:true,weapon:'wrench',
  atk:{kind:'saw',range:300,spd:600,dmg:560,r:11,sawDps:900},sup:{kind:'sawring',n:8,range:320,spd:640,dmg:700,r:12},
  atkName:'Buzz Saw',atkDesc:'Throws a saw blade that keeps spinning on the ground where it stops.',supName:'Saw Storm',supDesc:'Eight saw blades fly out in a ring around him, cutting through everyone.',
  look:{body:'#ff9a3d',belly:'#ffe2c2',accent:'#3a2d22',proj:'#c9c2b6',hat:'hardhat'},sig:{name:'Chrome',body:'#aeb8cc',belly:'#f2f5fb',accent:'#5ef2ff',proj:'#5ef2ff',hat:'antenna',shine:true}},
 {id:'dotty',name:'Dotty',rarity:'rare',role:'Paint splasher',rad:18,hp:3000,speed:156,reload:.9,superNeed:3300,pref:.7,weapon:'bolt',
  atk:{kind:'paint',n:3,arc:.35,range:330,spd:700,dmg:340,r:7,splat:280},sup:{kind:'rainbow',range:380,dps:700,n:5},
  atkName:'Paint Splat',atkDesc:'Flicks three paint blobs that leave sticky puddles where they land.',supName:'Rainbow Road',supDesc:'Paints a long rainbow stripe that slows and hurts enemies standing on it.',
  look:{body:'#5ec8ff',belly:'#ffffff',accent:'#ff5e87',proj:'#ffd23f',hat:'beanie'},sig:{name:'Graffiti',body:'#2a2238',belly:'#ffd23f',accent:'#6be39a',proj:'#ff3fa4',hat:'cap'}},
 {id:'hopper',name:'Hopper',rarity:'rare',role:'Bouncy frog',rad:18,hp:3200,speed:162,reload:.95,superNeed:3200,pref:.5,trait:'ears',weapon:'claw',
  atk:{kind:'bounce',range:420,spd:780,dmg:820,r:8},sup:{kind:'tongue',range:380,dmg:1300,stun:.6},
  atkName:'Bouncy Blob',atkDesc:'Spits a blob that bounces once off walls.',supName:'Tongue Grab',supDesc:'Shoots out his tongue, grabs the first enemy it touches and yanks them right next to him.',
  look:{body:'#6bcf5a',belly:'#e3ffd6',accent:'#ff7aa8',proj:'#ff7aa8',hat:'none'},sig:{name:'Poison Dart',body:'#3d5aff',belly:'#ffd23f',accent:'#1a1430',proj:'#ffd23f',hat:'none'}},
 {id:'blaze',name:'Blaze',rarity:'epic',role:'Flame dancer',rad:19,hp:3600,speed:158,reload:.8,superNeed:3800,pref:.4,weapon:'bolt',
  atk:{kind:'melee',range:150,arc:.8,dmg:950,kb:40,burn:{dps:250,dur:3}},sup:{kind:'phoenix',range:380,spd:900,dmg:1200,dps:800},
  atkName:'Flame Whip',atkDesc:'Cracks a long fiery whip that sets enemies on fire for 3 seconds.',supName:'Phoenix Dash',supDesc:'Bursts forward as a phoenix, leaving a trail of fire behind.',
  look:{body:'#ff6b2c',belly:'#ffd9a8',accent:'#ffd23f',proj:'#ffb347',hat:'flame'},sig:{name:'Blue Flame',body:'#2b5bff',belly:'#bfe6ff',accent:'#7fe9fb',proj:'#7fe9fb',hat:'flame',glow:'#7fe9fb'}},
 {id:'mossy',name:'Mossy',rarity:'epic',role:'Mushroom healer',rad:20,hp:4200,speed:142,reload:1.2,superNeed:4000,pref:.65,weapon:'moon',
  atk:{kind:'spore',range:330,flight:.55,dmg:600,splash:60,dps:300,heal:.06},sup:{kind:'mushring',radius:200,dur:4,heal:700,dps:500},
  atkName:'Spore Puff',atkDesc:'Lobs a puffball that bursts into a spore cloud: it hurts enemies and heals teammates inside.',supName:'Fairy Ring',supDesc:'Grows a ring of glowing mushrooms that heals teammates and hurts enemies inside for 4 seconds.',
  look:{body:'#e2543b',belly:'#fff6e8',accent:'#ffffff',proj:'#ffe27a',hat:'sprout'},sig:{name:'Glowcap',body:'#2a1458',belly:'#9dff6b',accent:'#5ef2ff',proj:'#9dff6b',hat:'sprout',glow:'#9dff6b'}},
 {id:'rivet',name:'Rivet',rarity:'epic',role:'Nail gunner',rad:21,hp:4600,speed:140,reload:.75,superNeed:4200,pref:.6,boxy:true,weapon:'wrench',
  atk:{kind:'nails',n:3,gap:.09,range:360,spd:840,dmg:300,r:6,boom:260},sup:{kind:'scaffold',hp:3000,life:10},
  atkName:'Sticky Nails',atkDesc:'Fires three nails that stick in enemies and pop a moment later.',supName:'Scaffolding',supDesc:'Builds a wall of three sturdy crates in front of him to hide behind.',
  look:{body:'#4f86c6',belly:'#ffe8a8',accent:'#ffb000',proj:'#c9c2b6',hat:'hardhat'},sig:{name:'Demolition',body:'#2a2238',belly:'#ff9a3d',accent:'#ff3b30',proj:'#ff9a3d',hat:'hardhat'}},
 {id:'nova',name:'Nova',rarity:'mythic',role:'Star knight',rad:20,hp:4400,speed:150,reload:.85,superNeed:3800,pref:.3,weapon:'claw',
  atk:{kind:'starslash',range:130,arc:1.2,dmg:620,shards:3,shardDmg:260},sup:{kind:'starfall',range:400,n:6,dmg:700,splash:70},
  atkName:'Star Slash',atkDesc:'A glowing sword slash that also throws three little star shards.',supName:'Starfall',supDesc:'Calls six stars down around a spot, each one exploding as it lands.',
  look:{body:'#3b3399',belly:'#e0dbff',accent:'#ffd36b',proj:'#ffd36b',hat:'starcrest',glow:'#ffd36b'},sig:{name:'Solar',body:'#ffb000',belly:'#fff3b0',accent:'#ff3b30',proj:'#ff9a3d',hat:'halo',shine:true}},
 {id:'shade',name:'Shade',rarity:'mythic',role:'Shadow sniper',rad:18,hp:2900,speed:152,reload:1.4,superNeed:3300,pref:.9,trait:'goggles',weapon:'bolt',
  atk:{kind:'phase',range:520,spd:1100,dmg:1450,r:7},sup:{kind:'shadowstep',range:450,cloak:2},
  atkName:'Phase Shot',atkDesc:'A long shot that passes straight through walls.',supName:'Shadow Step',supDesc:'Steps through the shadows to appear behind the nearest enemy and turns invisible for 2 seconds.',
  look:{body:'#29253a',belly:'#3e3855',accent:'#b56cff',proj:'#d6c9ff',eye:'#d6c9ff',hat:'hood'},sig:{name:'Phantom',body:'#f1f4ff',belly:'#cfd8ff',accent:'#5ef2ff',proj:'#5ef2ff',hat:'hood',glow:'#5ef2ff'}},
 {id:'dark',name:'Dark',rarity:'legendary',role:'Shadow stalker',rad:20,hp:4600,speed:168,reload:.85,superNeed:3100,pref:.1,trait:'dark',eventOnly:true,
  atk:{kind:'melee',range:118,arc:1.55,dmg:1300,kb:60,dark:{dps:330,dur:2.5,steal:.25}},sup:{kind:'darkdive',dur:5,dps:588.24},
  atkName:'Darkness Slash',atkDesc:'His hands sweep together in a dark slash (2,210 damage at level 11) that poisons for 560 a second for 2.5 seconds and heals Dark for a quarter of the damage. Poisoned enemies leave a black trail behind them that lasts 7 seconds.',
  supName:'Dark Dive',supDesc:'Stand in one of your black trails and dive in: for 5 seconds Dark can\u2019t be hurt, glides through the dark, stretches the trail wherever he goes, and everyone who left a trail takes 1,000 damage a second.',
  look:{body:'#0d0a14',belly:'#0d0a14',accent:'#2a1a3a',proj:'#1a0d2e',eye:'#ffffff',hat:'none',glow:'#5a2a8a'},sig:{name:'Void',body:'#1a0b2e',belly:'#1a0b2e',accent:'#7b2fe0',proj:'#7b2fe0',eye:'#c79bff',hat:'none',glow:'#7b2fe0'}},
 {id:'frostbyte',name:'Frostbyte',rarity:'epic',role:'Ice slinger',rad:19,hp:3700,speed:150,reload:1.15,superNeed:5200,pref:.7,weapon:'nix',
  atk:{kind:'single',range:390,spd:820,dmg:920,r:8,slow:1.2},sup:{kind:'bigwave',range:380,spd:520,dmg:1400,r:46,kb:300},
  atkName:'Snow Sling',atkDesc:'Flings a hard snowball that slows whoever it hits.',supName:'Avalanche',supDesc:'Sends a huge wave of snow rolling forward that pushes enemies back.',
  look:{body:'#2b3a55',belly:'#f4fbff',accent:'#ffb000',proj:'#bfefff',hat:'beanie'},sig:{name:'Emperor',body:'#1a1a2e',belly:'#fff3d6',accent:'#ffd23f',proj:'#fff3b0',hat:'crown'}},
 {id:'clank',name:'Clank',rarity:'epic',role:'Junk bot',rad:20,hp:4600,speed:145,reload:1.0,superNeed:5600,pref:.15,boxy:true,weapon:'rook',
  atk:{kind:'pulse',range:130,dmg:820},sup:{kind:'magnet',radius:300,dmg:1200,stun:.8},
  atkName:'Scrap Shock',atkDesc:'Sends out a short shock pulse around him.',supName:'Scrap Magnet',supDesc:'Switches on a huge magnet that yanks every nearby enemy in close, zaps them and stuns them for a moment.',
  look:{body:'#8a96ab',belly:'#d7dde8',accent:'#ff9a3d',proj:'#ffcf8a',hat:'antenna'},sig:{name:'Rust Bucket',body:'#a0552b',belly:'#e6b98f',accent:'#3a2d22',proj:'#ffb36b',hat:'antenna'}},
 {id:'perk',name:'Perk',rarity:'legendary',role:'Healer',rad:18,hp:3700,speed:160,reload:1.0,superNeed:4500,pref:.1,trait:'cat',
  atk:{kind:'melee',range:82,arc:2.1,dmg:620,double:true,healAlly:520},sup:{kind:'leap',zone:420,dmg:1500,radius:120,T:.45,allies:true,heal:2600},
  atkName:'Double Scratch',atkDesc:'Scratches with both paws at everyone close by. Enemies get hurt, and teammates in reach get healed instead.',
  supName:'Pounce',supDesc:'Pounces onto the nearest enemy or teammate in his zone. Aim to pick who. Landing hurts enemies close by and heals every teammate close by, Perk included.',
  look:{body:'#f2a65a',belly:'#fff1dc',accent:'#ff7aa8',proj:'#ffd1dc',hat:'none'},sig:{name:'Midnight Kitty',body:'#3a3355',belly:'#8a7fb0',accent:'#ffd23f',proj:'#ffe9a6',hat:'none'}},
 {id:'trick',name:'Trick',rarity:'legendary',role:'Wild card',rad:19,hp:4200,speed:155,reload:1.2,superNeed:5000,pref:.5,trait:'trick',random:true,
  atk:{kind:'single',range:400,spd:900,dmg:900,r:8},sup:{kind:'nova',radius:150,dmg:1300,kb:320},
  atkName:'Anything Goes',atkDesc:'Every shot is a random attack borrowed from another rumbler, never the same one twice in a row. Levels 1-4 roll Common to Epic rumblers, levels 5-10 add Mythic and Legendary, and level 11 can roll anything, even Amazing. Borrowed moves hit as hard as Trick\u2019s own level, not the original rumbler\u2019s.',
  supName:'Wild Card',supDesc:'Every super is a random super from another rumbler. His gadget changes every time he uses it, and he spawns with a random star power and new moves every time.',
  look:{body:'#7a52ff',belly:'#e3dbff',accent:'#ffd23f',proj:'#ff9bf0',hat:'party'},sig:{name:'Joker Flip',body:'#1f1a2e',belly:'#ff5e87',accent:'#5ef2ff',proj:'#5ef2ff',hat:'party'}},
 {id:'edray',name:'Ed Ray',rarity:'mythic',role:'Combo brawler',rad:19,hp:4400,speed:175,reload:1.25,ammo:2,superNeed:5200,pref:.05,trait:'ray',
  atk:{kind:'fist',range:130,spd:900,r:10,dmg:900,kb:110,strongDmg:1650,strongKb:380,far:.3,strongFar:.6},sup:{kind:'leap',zone:380,dmg:2000,radius:110,T:.5},
  atkName:'One-Two',atkDesc:'Up close, fires a short spring-loaded fist that pushes enemies back a little. Land it and his next fist comes back fast and turns gold: a power punch with much more damage and knockback. Fists hit harder the farther they fly.',
  supName:'Thunder Hop',supDesc:'Leaps onto the nearest enemy inside his hop zone and lands with an electric blast. If nobody is in the zone, the super stays gray and he can\u2019t jump.',
  look:{body:'#3fb6c9',belly:'#d8f6ff',accent:'#ffe14d',proj:'#9fe8ff',hat:'none'},sig:{name:'Storm Ray',body:'#2b2f6b',belly:'#8fa2ff',accent:'#7df9ff',proj:'#7df9ff',hat:'none'}},
 {id:'juggler',name:'Juggler',rarity:'mythic',role:'Tank brawler',rad:24,hp:6800,speed:145,reload:2.2,ammo:1,superNeed:9000,pref:0,trait:'strongman',
  atk:{kind:'melee',range:88,arc:1.25,dmg:3529.41,kb:520,punch:true},sup:{kind:'grabthrow',grab:210,dist:600,spd:950,dmg:3529.41,min:.25},
  atkName:'Haymaker',atkDesc:'Throws one huge punch that knocks enemies back (6,000 damage at level 11). He only has one punch loaded, and it takes a while to come back.',
  supName:'Big Toss',supDesc:'Grabs the nearest enemy and hurls them across the roof. The farther they fly, the more it hurts, up to 6,000 damage at level 11. Walls stop them early, so aim for open space.',
  look:{body:'#c0563a',belly:'#f1c9a8',accent:'#2f3a66',proj:'#ffd23f',hat:'none'},sig:{name:'Iron Titan',body:'#5d6b80',belly:'#aab6c8',accent:'#ffb000',proj:'#ffd23f',hat:'hardhat'}},
 {id:'orion',name:'Orion',rarity:'celestial',role:'Star weaver',rad:20,hp:4000,speed:152,reload:1.15,superNeed:9000,pref:.75,trait:'constellation',
  atk:{kind:'star',range:380,spd:820,dmg:1764.71,r:11,spread:2,spreadR:170,slow:2},sup:{kind:'starzone',range:400,radius:140,flight:.55,dur:6,dps:352.94,poison:176.47,poisonT:3},
  atkName:'Shooting Star',atkDesc:'Throws a star for 3,000 damage at level 11 that slows. When it hits, it splits into stars that fly at up to 2 more enemies standing close to the target, each also hitting for 3,000.',
  supName:'Star Well',supDesc:'Throws a black hole that opens a star zone for 6 seconds. Enemies inside are slowed, hit by falling stars (600 a second) and poisoned (300 a second for 3 seconds after). Teammates inside deal 15% more damage and move 10% faster, and Orion reloads twice as fast.',
  look:{body:'#232057',belly:'#3d3590',accent:'#ffd36b',proj:'#ffe48a',eye:'#ffe9a6',hat:'starcrest'},sig:{name:'Solar Flare',body:'#ff7a3d',belly:'#ffd29a',accent:'#fff3a6',proj:'#ffb347',hat:'starcrest',glow:'#ffb347'}},
 {id:'zenith',name:'Meteorite',rarity:'ultra',role:'Solar system controller',rad:21,hp:4200,speed:150,reload:1.2,superNeed:4200,pref:.75,trait:'cosmic',
  atk:{kind:'orbs',range:360,flight:.65,dmg:1176.47,splash:60},sup:{kind:'meteor',range:420,radius:115,flight:1.1},
  atkName:'Sun & Moon',atkDesc:'Lobs a sun and a moon that land side by side (2,000 damage each at level 11, 4,000 together). Every rumbler Meteorite knocks out adds their attack to his volley, up to 15 different attacks and 100,000 total damage. Getting knocked out loses every absorbed attack.',
  supName:'Meteor Fall',supDesc:'Calls down a meteor that knocks out anything it lands on. Up to 3 shadows of rumblers Meteorite has absorbed rise from the crater, wearing their skins, and fight for him at half strength.',
  look:{body:'#ffb347',belly:'#2a2766',accent:'#fff3a6',proj:'#ffd36b',hat:'none'},sig:{name:'Black Sun',body:'#ff3d6e',belly:'#140b2e',accent:'#ff9a3d',proj:'#ff7a5c',hat:'none',glow:'#ff3d6e'}},
];
const BY_ID={};RUMBLERS.forEach(b=>BY_ID[b.id]=b);
const STARTER='ember';

/* Gadgets (3 uses per match) and star powers (always on). Bought in the rumbler sheet once the rumbler is high enough level. */
const GADGET_LVL=5,STAR_LVL=7,GADGET_COST=1000,STAR_COST=2000;
const G=(id,name,type,val,desc)=>({id,name,type,val,desc});
const GEAR={
 ember:{g:[G('ember-g1','Fire Starter','blast',900,'Bursts into flame, hitting enemies close by.'),G('ember-g2','Hot Feet','speed',.4,'Moves 40% faster for 3 seconds.')],
        s:[G('ember-s1','Wildfire','dmg',.1,'Flames deal 10% more damage.'),G('ember-s2','Ember Heart','lifesteal',.15,'Heals for 15% of damage dealt.')]},
 bolt:{g:[G('bolt-g1','Quick Load','reload',0,'Instantly refills all ammo.'),G('bolt-g2','Roll Out','dash',220,'Rolls a short distance.')],
       s:[G('bolt-s1','Long Sight','range',.12,'Attack range is 12% longer.'),G('bolt-s2','Steady Hands','charge',.2,'Super charges 20% faster.')]},
 spritz:{g:[G('spritz-g1','Fizz Pop','heal',.35,'Heals 35% of max health.'),G('spritz-g2','Bubble Wall','shield',.5,'Takes half damage for 2.5 seconds.')],
         s:[G('spritz-s1','Extra Fizz','regen',1.5,'Starts healing 1.5 seconds sooner.'),G('spritz-s2','Sugar Rush','speed',.08,'Moves 8% faster.')]},
 nix:{g:[G('nix-g1','Cold Snap','slowfield',140,'Freezes the air around Nix, slowing nearby enemies.'),G('nix-g2','Ice Skates','speed',.4,'Moves 40% faster for 3 seconds.')],
      s:[G('nix-s1','Deep Freeze','slowplus',1,'Slows last twice as long.'),G('nix-s2','Thick Coat','hp',.12,'12% more health.')]},
 zing:{g:[G('zing-g1','Spin Out','dash',220,'Spins a short distance.'),G('zing-g2','Lucky Catch','reload',0,'Instantly refills all ammo.')],
       s:[G('zing-s1','Sharp Edge','dmg',.1,'Boomerangs deal 10% more damage.'),G('zing-s2','Light Feet','speed',.08,'Moves 8% faster.')]},
 boulder:{g:[G('boulder-g1','Rock Armor','shield',.5,'Takes half damage for 2.5 seconds.'),G('boulder-g2','Ground Pound','blast',1100,'Slams the ground, hitting enemies close by.')],
          s:[G('boulder-s1','Bedrock','hp',.12,'12% more health.'),G('boulder-s2','Avalanche','charge',.2,'Super charges 20% faster.')]},
 pip:{g:[G('pip-g1','Spare Bombs','reload',0,'Instantly refills all ammo.'),G('pip-g2','Smoke Hop','dash',230,'Hops a short distance.')],
      s:[G('pip-s1','Bigger Bang','splash',.25,'Bomb blasts are 25% wider.'),G('pip-s2','Short Fuse','reloadspd',.15,'Reloads 15% faster.')]},
 marlo:{g:[G('marlo-g1','High Tide','heal',.3,'Heals 30% of max health.'),G('marlo-g2','Undertow','pull',220,'Drags nearby enemies toward Marlo.')],
        s:[G('marlo-s1','Tsunami','dmg',.1,'Waves deal 10% more damage.'),G('marlo-s2','Sea Legs','speed',.08,'Moves 8% faster.')]},
 volta:{g:[G('volta-g1','Static Shield','shield',.5,'Takes half damage for 2.5 seconds.'),G('volta-g2','Short Circuit','blast',900,'Discharges, hitting enemies close by.')],
        s:[G('volta-s1','Conductor','chainplus',1,'Sparks jump to one more enemy.'),G('volta-s2','Battery Pack','charge',.2,'Super charges 20% faster.')]},
 vex:{g:[G('vex-g1','Smoke Step','dash',240,'Blinks a short distance.'),G('vex-g2','Second Wind','heal',.3,'Heals 30% of max health.')],
      s:[G('vex-s1','Shadow Blade','dmg',.1,'Slashes deal 10% more damage.'),G('vex-s2','Drain','lifesteal',.15,'Heals for 15% of damage dealt.')]},
 bramble:{g:[G('bramble-g1','Thorn Snare','pull',220,'Drags nearby enemies toward Bramble.'),G('bramble-g2','Bark Skin','shield',.5,'Takes half damage for 2.5 seconds.')],
          s:[G('bramble-s1','Deep Roots','hp',.12,'12% more health.'),G('bramble-s2','Sap','regen',1.5,'Starts healing 1.5 seconds sooner.')]},
 rook:{g:[G('rook-g1','Patch Kit','heal',.3,'Heals 30% of max health.'),G('rook-g2','Overclock','reload',0,'Instantly refills all ammo.')],
       s:[G('rook-s1','Reinforced','turretplus',.4,'Sentries have 40% more health and damage.'),G('rook-s2','Quick Build','charge',.2,'Super charges 20% faster.')]},
 echo:{g:[G('echo-g1','Feedback','blast',1000,'A burst of noise that hits enemies close by.'),G('echo-g2','Encore','reload',0,'Instantly refills all ammo.')],
       s:[G('echo-s1','Subwoofer','range',.15,'Pulses reach 15% farther.'),G('echo-s2','Groove','speed',.08,'Moves 8% faster.')]},
 woodrow:{g:[G('woodrow-g1','Super Find','reveal',6,'Puts a red X on every opponent, wherever they are. Marked enemies can\'t hide in bushes and take 15% more damage for 6 seconds.'),
             G('woodrow-g2','Hunter\'s Shotgun','shotgun',2,'Whips out the shotgun he found near the dam and blasts the nearest enemy with auto-aim, stunning them for 2 seconds.')],
          s:[G('woodrow-s1','Splinter Storm','split6',6,'Logs split into six splinters instead of four.'),G('woodrow-s2','Cozy Lodge','lodge',1,'Dams last 3 seconds longer and heal twice as fast.')]},
 lilt:{g:[G('lilt-g1','Big Swing','blast',1300,'Swings his bat in a full circle, smacking enemies close by.'),G('lilt-g2','Stolen Base','speed',.4,'Moves 40% faster for 3 seconds.')],
       s:[G('lilt-s1','Long Reach','range',.12,'Bat swings reach 12% farther.'),G('lilt-s2','Clutch Hitter','charge',.2,'Bat Toss charges 20% faster.')]},
 zapper:{g:[G('zapper-g1','Static Charge','reload',0,'Instantly fills the storm cloud.'),G('zapper-g2','Lightning Rod','blast',1100,'Calls a lightning strike on enemies close by.')],
         s:[G('zapper-s1','Wide Front','range',.15,'His zone reaches 15% farther.'),G('zapper-s2','Overcharge','dmg',.12,'Lightning hits 12% harder.')]},
 dark:{g:[G('dark-g1','Virus','darkvirus',588.24,'Only during Dark Dive: everyone close to Dark catches the virus and takes 1,000 a second for 5 seconds.'),G('dark-g2','Marked in Shadow','darkreveal',6,'Only during Dark Dive: poisoned enemies are revealed even in bushes, with a dark X over their heads.')],
  s:[G('dark-s1','Deep Venom','darkvenom',1,'Dark Dive poison hits 1,750 a second, but Darkness Slash hits a bit softer and its poison is weaker.'),G('dark-s2','Kind Shadows','darkheal',205.88,'Darkness Slash also touches teammates, healing them 350 a second for 2 seconds.')]},
 sprocket:{g:[G('spr-g1','Oil Slick','speed',.4,'Moves 40% faster for 3 seconds.'),G('spr-g2','Spring Trap','blast',900,'Pops a spring that blasts enemies close by.')],s:[G('spr-s1','Sharp Teeth','dmg',.1,'Gears hit 10% harder.'),G('spr-s2','Quick Hands','reloadspd',.2,'Reloads 20% faster.')]},
 dotty:{g:[G('dot-g1','Fresh Coat','speed',.4,'Moves 40% faster for 3 seconds.'),G('dot-g2','Splash Zone','blast',900,'Splashes paint on everyone close by.')],s:[G('dot-s1','Thick Paint','dmg',.1,'Paint hits 10% harder.'),G('dot-s2','Fast Brush','reloadspd',.2,'Reloads 20% faster.')]},
 hopper:{g:[G('hop-g1','Leap Frog','speed',.5,'Moves 50% faster for 3 seconds.'),G('hop-g2','Croak','blast',900,'A loud croak that blasts enemies close by.')],s:[G('hop-s1','Sticky Tongue','dmg',.12,'Hits 12% harder.'),G('hop-s2','Lily Pad','reloadspd',.2,'Reloads 20% faster.')]},
 blaze:{g:[G('blz-g1','Hot Feet','speed',.4,'Moves 40% faster for 3 seconds.'),G('blz-g2','Flare','blast',1100,'A flare of fire hits enemies close by.')],s:[G('blz-s1','Hotter','dmg',.1,'Flames hit 10% harder.'),G('blz-s2','Quick Spark','reloadspd',.2,'Reloads 20% faster.')]},
 mossy:{g:[G('mos-g1','Spore Cloud','blast',900,'Puffs spores that hurt enemies close by.'),G('mos-g2','Speedy Spores','speed',.4,'Moves 40% faster for 3 seconds.')],s:[G('mos-s1','Big Puffs','dmg',.1,'Puffballs hit 10% harder.'),G('mos-s2','Regrow','reloadspd',.2,'Reloads 20% faster.')]},
 rivet:{g:[G('riv-g1','Hard Hat','speed',.35,'Moves 35% faster for 3 seconds.'),G('riv-g2','Nail Ring','blast',1000,'Sprays nails all around.')],s:[G('riv-s1','Steel Nails','dmg',.1,'Nails hit 10% harder.'),G('riv-s2','Auto Feed','reloadspd',.2,'Reloads 20% faster.')]},
 nova:{g:[G('nov-g1','Starstep','speed',.5,'Moves 50% faster for 3 seconds.'),G('nov-g2','Supernova','blast',1300,'Explodes in starlight around her.')],s:[G('nov-s1','Bright Blade','dmg',.12,'Slashes hit 12% harder.'),G('nov-s2','Stardust','reloadspd',.2,'Reloads 20% faster.')]},
 shade:{g:[G('shd-g1','Fade','speed',.5,'Moves 50% faster for 3 seconds.'),G('shd-g2','Dark Pulse','blast',1000,'A pulse of shadow hits enemies close by.')],s:[G('shd-s1','Steady Aim','dmg',.12,'Shots hit 12% harder.'),G('shd-s2','Night Reload','reloadspd',.2,'Reloads 20% faster.')]},
 fizz:{g:[G('fizz-g1','Sugar High','speed',.4,'Moves 40% faster for 3 seconds.'),G('fizz-g2','Pop Top','blast',1000,'Pops his lid, blasting enemies close by.')],
       s:[G('fizz-s1','Extra Fizz','dmg',.1,'Bubbles hit 10% harder.'),G('fizz-s2','Quick Shake','reloadspd',.2,'Reloads 20% faster.')]},
 frostbyte:{g:[G('frostbyte-g1','Ice Slide','dash',240,'Belly-slides a short distance.'),G('frostbyte-g2','Snow Globe','slowfield',150,'Freezes the ground around him, slowing enemies.')],
            s:[G('frostbyte-s1','Deep Freeze','slowplus',1,'Slows last twice as long.'),G('frostbyte-s2','Thick Coat','hp',.12,'12% more health.')]},
 clank:{g:[G('clank-g1','Patch Up','heal',.3,'Heals 30% of max health.'),G('clank-g2','Overclock','reload',0,'Instantly refills all ammo.')],
        s:[G('clank-s1','Bolted Down','hp',.12,'12% more health.'),G('clank-s2','Spare Parts','turretplus',1,'Junk Turret has more health and lasts longer.')]},
 perk:{g:[G('perk-g1','Ultra Heal','healzone',420,'Drops a healing circle where Perk is standing. Teammates inside heal for 4 seconds.'),G('perk-g2','Quick Paws','reloadzone',2,'Drops a circle where Perk is standing. Teammates inside reload twice as fast for 4 seconds.')],
       s:[G('perk-s1','Selfish Claws','selfish',1,'Scratching a teammate hurts them instead, and Perk heals by the same amount.'),G('perk-s2','Big Heart','kind',1,'Heals teammates 50% more, but every heal costs Perk some of his own health.')]},
 trick:{g:[G('trick-g1','Mystery Gadget','mystery',0,'A random gadget from any rumbler. It changes every time he uses it.'),G('trick-g2','Pick a Rarity','pickrarity',0,'Choose a rarity and his next attack is guaranteed to come from a rumbler of that rarity. Which rarities you can pick depends on his level.')],
        s:[G('trick-s1','Mystery Star','mystery',0,'A random star power from any rumbler, new every time he spawns.')]},
 edray:{g:[G('edray-g1','Spring Hop','dash',240,'Bounces a short distance.'),G('edray-g2','Static Shock','blast',1000,'Zaps enemies close by.')],
        s:[G('edray-s1','Hard Knuckles','dmg',.12,'Fists deal 12% more damage.'),G('edray-s2','Quick Recoil','reloadspd',.25,'Fists come back 25% faster.')]},
 juggler:{g:[G('juggler-g1','Come Here','pull',220,'Yanks nearby enemies right up to Juggler.'),G('juggler-g2','Iron Skin','shield',.5,'Tenses up and takes half damage for 2.5 seconds.')],
          s:[G('juggler-s1','Quick Hands','reloadspd',.35,'His punch comes back 35% faster.'),G('juggler-s2','Long Toss','tossplus',.3,'Big Toss throws enemies 30% farther.')]},
 orion:{g:[G('orion-g1','Stardust','slowfield',150,'Sprinkles stardust that slows enemies close by.'),G('orion-g2','Starlight','heal',.3,'Heals 30% of max health.')],
        s:[G('orion-s1','Supercluster','chainplus',1,'Stars split to one more nearby enemy.'),G('orion-s2','Event Horizon','zoneplus',2,'Star Well lasts 2 seconds longer.')]},
 zenith:{g:[G('zenith-g1','Solar Flare','blast',1400,'Flares like a sun, burning enemies close by.'),G('zenith-g2','Lunar Shield','shield',.5,'Moonlight wraps Meteorite, halving damage for 2.5 seconds.')],
         s:[G('zenith-s1','Infinite Orbit','maxsteal',20,'Meteorite can hold up to 20 absorbed attacks instead of 15.'),G('zenith-s2','Lasting Shadows','shadowlife',4,'Shadows stay for 12 seconds instead of 8.')]},
 pebble:{g:[G('pebble-g1','Pocket Refill','reload',0,'Instantly refills all ammo.'),G('pebble-g2','Slide','dash',220,'Slides a short distance.')],
         s:[G('pebble-s1','Lucky Stone','dmg',.1,'Stones deal 10% more damage.'),G('pebble-s2','Quick Hands','reloadspd',.15,'Reloads 15% faster.')]},
 coco:{g:[G('coco-g1','Banana Snack','heal',.35,'Heals 35% of max health.'),G('coco-g2','Monkey Hop','dash',230,'Hops a short distance.')],
       s:[G('coco-s1','Big Coconut','splash',.25,'Coconut splashes are 25% wider.'),G('coco-s2','Thick Fur','hp',.12,'12% more health.')]},
 gus:{g:[G('gus-g1','Tune Up','shield',.5,'Takes half damage for 2.5 seconds.'),G('gus-g2','Pipe Burst','blast',1100,'Bursts a pipe, hitting enemies close by.')],
      s:[G('gus-s1','Steel Toes','hp',.12,'12% more health.'),G('gus-s2','Torque','charge',.2,'Super charges 20% faster.')]},
 luna:{g:[G('luna-g1','Moon Dust','slowfield',140,'Sprinkles dust that slows nearby enemies.'),G('luna-g2','Lunar Step','dash',230,'Glides a short distance.')],
       s:[G('luna-s1','Full Moon','dmg',.1,'Moon discs deal 10% more damage.'),G('luna-s2','Night Glow','lifesteal',.15,'Heals for 15% of damage dealt.')]},
 quill:{g:[G('quill-g1','Prickle','blast',1000,'Puffs up, hitting enemies close by.'),G('quill-g2','Curl Up','shield',.5,'Takes half damage for 2.5 seconds.')],
        s:[G('quill-s1','Sharp Quills','dmg',.1,'Quills deal 10% more damage.'),G('quill-s2','Spiky Hide','regen',1.5,'Starts healing 1.5 seconds sooner.')]},
 fang:{g:[G('fang-g1','Howl','speed',.4,'Moves 40% faster for 3 seconds.'),G('fang-g2','Lunge','dash',260,'Lunges a short distance.')],
       s:[G('fang-s1','Bloodhound','lifesteal',.15,'Heals for 15% of damage dealt.'),G('fang-s2','Pack Leader','speed',.08,'Moves 8% faster.')]},
 astra:{g:[G('astra-g1','Gravity Well','pull',240,'Drags nearby enemies toward Astra.'),G('astra-g2','Warp','dash',260,'Warps a short distance.')],
        s:[G('astra-s1','Event Horizon','range',.12,'Lasers reach 12% farther.'),G('astra-s2','Stardust','charge',.2,'Super charges 20% faster.')]},
};
const gearOf=b=>GEAR[b.id];
function gearById(id){for(const k in GEAR){for(const x of GEAR[k].g)if(x.id===id)return x;for(const x of GEAR[k].s)if(x.id===id)return x;}return null;}

const THEMES=[
 {id:'cardboard',name:'Cardboard Bot',tier:1,body:'#c99c63',belly:'#e0bd8b',accent:'#5d4026',proj:'#c99c63',hat:'antenna',boxy:true,tape:true},
 {id:'jungle',name:'Jungle Scout',tier:1,body:'#4f8f3c',belly:'#94c870',accent:'#f2d36b',proj:'#94c870',hat:'leaf',stripes:true},
 {id:'candy',name:'Candy Pop',tier:1,body:'#ff8fc7',belly:'#ffd6eb',accent:'#6fe0d0',proj:'#ff8fc7',hat:'swirl',sprinkles:true},
 {id:'pumpkin',name:'Pumpkin Patch',tier:1,body:'#ff8a1f',belly:'#ffc07a',accent:'#3f7d2c',proj:'#ff8a1f',hat:'stem',grin:true},
 {id:'frost',name:'Frostbite',tier:1,body:'#bfe6ff',belly:'#f1faff',accent:'#3d9bff',proj:'#d4f1ff',hat:'icecrown',frost:true},
 {id:'space',name:'Space Cadet',tier:1,body:'#e9edf6',belly:'#ffffff',accent:'#ff6b4a',proj:'#ff6b4a',hat:'helmet'},
 {id:'neon',name:'Neon Night',tier:2,body:'#231d55',belly:'#3b3090',accent:'#29e3ff',proj:'#29e3ff',eye:'#29e3ff',glow:'#29e3ff',hat:'visor'},
 {id:'lava',name:'Lava Core',tier:2,body:'#3a1d16',belly:'#6e2a14',accent:'#ff7a1a',proj:'#ff7a1a',hat:'horns',cracks:true},
 {id:'shadow',name:'Shadow Mode',tier:2,body:'#29253a',belly:'#3e3855',accent:'#a78bfa',proj:'#a78bfa',eye:'#d6c9ff',hat:'hood'},
 {id:'arcade',name:'Arcade Glitch',tier:2,body:'#2bd4a4',belly:'#a8f5df',accent:'#ff3fa4',proj:'#ff3fa4',hat:'pixel',scan:true},
 {id:'ninja',name:'Shadow Ninja',tier:2,body:'#2a2238',belly:'#4a3d66',accent:'#ff3b5c',proj:'#ff3b5c',hat:'bandana'},
 {id:'pirate',name:'Sea Dog',tier:1,body:'#c0563a',belly:'#f1c9a8',accent:'#ffd23f',proj:'#ffd23f',hat:'tricorn'},
 {id:'witchy',name:'Hex Witch',tier:2,body:'#6b4bd8',belly:'#cdb8ff',accent:'#7ed957',proj:'#9dff6b',hat:'witch',glow:'#9dff6b'},
 {id:'zombie',name:'Zombie',tier:2,body:'#7fb069',belly:'#c8e6a0',accent:'#5a2d2d',proj:'#a6d86a',hat:'none',stripes:true},
 {id:'vampire',name:'Night Fang',tier:3,body:'#3a1d3a',belly:'#e6d0e6',accent:'#ff3b5c',proj:'#ff3b5c',hat:'horns',glow:'#ff3b5c'},
 {id:'beach',name:'Beach Day',tier:1,body:'#5ec8ff',belly:'#fff3c4',accent:'#ff9a3d',proj:'#7fd3ff',hat:'snorkel'},
 {id:'flowery',name:'Flower Power',tier:1,body:'#ff9bc0',belly:'#fff0f6',accent:'#6be39a',proj:'#ff9bc0',hat:'flower'},
 {id:'builder',name:'Builder',tier:1,body:'#ffb000',belly:'#ffe8a8',accent:'#3a2d22',proj:'#ffd23f',hat:'hardhat'},
 {id:'dj',name:'DJ Drop',tier:2,body:'#1f1a2e',belly:'#3a2d6b',accent:'#5ef2ff',proj:'#5ef2ff',hat:'headphones',glow:'#5ef2ff'},
 {id:'cosmo',name:'Cosmonaut',tier:3,body:'#e9edf6',belly:'#ffffff',accent:'#ff3b30',proj:'#ff9a3d',hat:'helmet',shine:true},
 {id:'heli',name:'Propeller Kid',tier:1,body:'#6be39a',belly:'#e3ffef',accent:'#ff5e87',proj:'#6be39a',hat:'propeller'},
 {id:'knight',name:'Iron Knight',tier:3,body:'#9aa6bd',belly:'#e3e8f2',accent:'#ffd23f',proj:'#ffe98a',hat:'helmet',shine:true},
 {id:'galaxy2',name:'Galaxy Brain',tier:3,body:'#1d1b52',belly:'#3b3399',accent:'#ff9bf0',proj:'#ff9bf0',hat:'halo',starry:true,glow:'#ff9bf0'},
 {id:'sushi',name:'Sushi Chef',tier:1,body:'#ffffff',belly:'#ff8a80',accent:'#1a1430',proj:'#ff8a80',hat:'bandana'},
 {id:'robo',name:'Robo Rumbler',tier:2,body:'#9aa6bd',belly:'#e3e8f2',accent:'#5ef2ff',proj:'#5ef2ff',hat:'antenna',boxy:true,scan:true},
 {id:'lavaqueen',name:'Magma Royal',tier:3,body:'#3a1d16',belly:'#ff7a1a',accent:'#ffd23f',proj:'#ff7a1a',hat:'crown',cracks:true,glow:'#ff7a1a'},
 {id:'snowday',name:'Snow Day',tier:1,body:'#f1faff',belly:'#bfe6ff',accent:'#ff3b5c',proj:'#ffffff',hat:'beanie'},
 {id:'bubblegum',name:'Bubblegum',tier:2,body:'#ff9bc0',belly:'#ffffff',accent:'#5ec8ff',proj:'#ff9bc0',hat:'swirl',sprinkles:true},
 {id:'jungleking',name:'Jungle King',tier:3,body:'#ffb000',belly:'#fff0b0',accent:'#3f7d2c',proj:'#ffd23f',hat:'leaf',stripes:true,shine:true},
 {id:'cyber',name:'Cyber Punk',tier:2,body:'#1f1a2e',belly:'#ff3fa4',accent:'#5ef2ff',proj:'#ff3fa4',hat:'visor',glow:'#ff3fa4',scan:true},
 {id:'gold',name:'Golden',tier:'golden',body:'#f0b429',belly:'#ffe08a',accent:'#fff6cf',proj:'#ffd84d',hat:'crown',shine:true,glow:'#ffd23f'},
];
/* Season 1 Rumble Pass exclusive skins: only from the pass, never sold */
const PASS_SKIN_IDS=['ember','bolt','pip','woodrow','zenith'];
const STARFALL={id:'starfall',name:'Starfall',tier:'pass',body:'#1d1b52',belly:'#3b3399',accent:'#ffd36b',proj:'#ffd36b',eye:'#ffe9a6',hat:'halo',starry:true,glow:'#ffd36b'};
const MASTER_SKIN={id:'master',name:'Grandmaster',tier:'master',body:'#1b1430',belly:'#4a2f7a',accent:'#ffd23f',proj:'#ffd23f',eye:'#ffd23f',hat:'crown',glow:'#ff5e87',shine:true};
/* Rank sets: the first time you reach a rank you get a rank skin (Ember for Grandmaster, a random rumbler for the rest) and an "I reached …" pin of Ember holding a sign.
   idx is the ladder step that unlocks it (0 = your first ranked match). Master's set is the Grandmaster skin + Master pin. */
const RANK_SETS=[
 {key:'bronze',name:'Bronze',idx:0,pin:'rk_bronze',pal:['#ffd2a8','#c77a43'],ink:'#8a4a24',skin:{id:'rk_bronze',name:'Bronze Rank',tier:'rank',body:'#c47a45',belly:'#f2cfa6',accent:'#ffb47a',proj:'#e7a36b',hat:'flame'}},
 {key:'silver',name:'Silver',idx:3,pin:'rk_silver',pal:['#ffffff','#8d97ae'],ink:'#4f5a74',skin:{id:'rk_silver',name:'Silver Rank',tier:'rank',body:'#aeb8cc',belly:'#f2f5fb',accent:'#ffffff',proj:'#dfe6f5',hat:'flame',shine:true}},
 {key:'gold',name:'Gold',idx:6,pin:'rk_gold',pal:['#fff1a0','#d9951a'],ink:'#9a5f00',skin:{id:'rk_gold',name:'Gold Rank',tier:'rank',body:'#f0b429',belly:'#fff0b0',accent:'#fff6cf',proj:'#ffd84d',hat:'flame',shine:true,glow:'#ffd23f'}},
 {key:'diamond',name:'Diamond',idx:9,pin:'rk_diamond',pal:['#e6fdff','#2fa9d8'],ink:'#13719e',skin:{id:'rk_diamond',name:'Diamond Rank',tier:'rank',body:'#56cfee',belly:'#e3fbff',accent:'#ffffff',proj:'#9ff0ff',hat:'icecrown',frost:true,shine:true,glow:'#7fe9fb'}},
 {key:'mythic',name:'Mythic',idx:12,pin:'rk_mythic',pal:['#f0dcff','#8a4ff0'],ink:'#5a2cc0',skin:{id:'rk_mythic',name:'Mythic Rank',tier:'rank',body:'#8a5cf5',belly:'#e3d4ff',accent:'#ff9bf0',proj:'#c79bff',hat:'horns',glow:'#c79bff'}},
 {key:'legendary',name:'Legendary',idx:15,pin:'rk_legendary',pal:['#ffd1dc','#e83a6a'],ink:'#b81f4f',skin:{id:'rk_legendary',name:'Legendary Rank',tier:'rank',body:'#ff4f7e',belly:'#ffd1dc',accent:'#ffd23f',proj:'#ff9bb5',hat:'starcrest',glow:'#ff7aa8',shine:true}},
 {key:'ultra',name:'Ultra',idx:18,pin:'rk_ultra',pal:['#e6fdff','#7df9ff'],ink:'#1a6a8a',skin:{id:'rk_ultra',name:'Ultra Rank',tier:'rank',body:'#141a4a',belly:'#7df9ff',accent:'#ff9bf0',proj:'#7df9ff',eye:'#e6fdff',hat:'starcrest',glow:'#7df9ff',shine:true,starry:true,ultraFx:true}},
 {key:'master',name:'Masters',idx:18,pin:'master',pal:['#ffd23f','#9d7bff'],ink:'#b8336a',skin:MASTER_SKIN},
];
/* Ghost Lantern set: a Juggler skin that comes with its own pin */
const LANTERN_SKIN={id:'lantern',name:'Ghost Lantern',tier:2,set:'lantern',body:'#6fd9bd',belly:'#e2fff5',accent:'#3a2d6b',proj:'#a8ffe0',eye:'#2b2450',hat:'flame',glow:'#7fffd4'};
/* Close-range rumblers have a zone: while an enemy is inside it their super slowly charges. Stronger attacks get a smaller zone. */
function closeZone(b){if(b.random)return 0;if(b._zone!=null)return b._zone;if(b.atk.kind==='cloudzap')return(b._zone=b.atk.zone);const a=b.atk,close=a.kind==='melee'||a.kind==='fist'||(a.kind==='spread'&&a.range<=240);
  return(b._zone=close?Math.round(clamp(330-a.dmg*(a.n||1)/b.reload/12,170,300)):0);}
const ZONE_CHARGE=.04;
const WILDCARD_SKIN={id:'wildcard',name:'Wild Card',tier:3,set:'wildcard',body:'#ff5e87',belly:'#fff6e8',accent:'#1f1a2e',proj:'#ffd23f',eye:'#1f1a2e',hat:'party',wildcard:true,glow:'#ffffff'};
const MAID_SKIN={id:'maid',name:'Maid Outfit',tier:3,maid:true,body:'#2b2238',belly:'#ffffff',accent:'#ffffff',proj:'#ff9bc0',hat:'none'};
const SET_PINS=[['lantern','Ghost Lantern'],['wildcard','Wild Card']];
/* Voice lines: s = spawn, k = takedown, u = super, d = knocked out, w = win. Some rumblers never talk. */
const VOICE_SILENT=['clank','zenith','orion','frostbyte'];
const VOICE_GENERIC={s:['Let\u2019s rumble!','Rooftop time!'],k:['Got one!','Too easy!','Next!'],u:['Here it comes!','Super time!'],d:['Ouch!','I\u2019ll be back!'],w:['We win!','GG!']};
const VOICE={ember:{k:['Burned!','Too hot to handle!'],u:['Inferno!']},bolt:{k:['Bullseye!'],u:['Rail shot!']},spritz:{k:['Splash!'],u:['Heal up, team!']},nix:{k:['Chill out.'],u:['Freeze zone!']},zing:{k:['Zing!'],u:['Triple toss!']},
 boulder:{k:['Rock solid!'],u:['Rolling through!']},pip:{k:['Kaboom!'],u:['Big bomb!']},marlo:{k:['Washed out!'],u:['Surf\u2019s up!']},volta:{k:['Shocking!'],u:['Chain reaction!']},vex:{k:['Vexed!'],u:['Dash!']},
 bramble:{k:['Tangled!'],u:['Roots!']},rook:{k:['Calculated.'],u:['Turret up!']},echo:{k:['Hear that?'],u:['Sound wave!']},woodrow:{k:['Timber!'],u:['Dam it up!']},pebble:{k:['Pebbled!'],u:['Bombs away!']},
 coco:{k:['Cracked!'],u:['Coconut storm!']},gus:{k:['Blown away!'],u:['Gust!']},luna:{k:['Moonstruck!'],u:['Moonlight!']},quill:{k:['Pricked!'],u:['Needles!']},fang:{k:['Chomp!'],u:['Pounce!']},
 astra:{k:['Stargazed!'],u:['Black hole!']},lilt:{k:['Home run!','Batter up!'],u:['Bat toss!']},perk:{s:['Meow!'],k:['Hiss!','Meow!'],u:['Pounce!'],d:['Mrrow!']},trick:{k:['Ta-da!'],u:['Pick a card!'],s:['Abracadabra!']},
 edray:{k:['One-two!'],u:['Thunder hop!']},juggler:{k:['Too strong!'],u:['Big toss!'],s:['Who wants a hug?']},zapper:{k:['Zapped!'],u:['Storm\u2019s coming!']},fizz:{k:['Pop!'],u:['Sugar rush!']},blaze:{k:['Toasted!'],u:['Firestorm!']},dark:{s:['...'],k:['Into the dark.'],u:['Dive.'],d:['I fade...']},mossy:{k:['Spored!'],u:['Grow, team!']},nova:{k:['Starstruck!'],u:['Comet charge!']},shade:{k:['From the dark.'],u:['Shadow chain!']},hopper:{s:['Ribbit!'],k:['Ribbit!']},dotty:{k:['Splat!'],u:['Paint bomb!']},sprocket:{k:['Clank clank!'],u:['Bot online!']},rivet:{k:['Nailed it!'],u:['Toolbox!']}};
/* Prestige: 1 per win, max 250. Rewards every 50. Bronze under 150, Silver from 150, Gold at 250. */
const PRESTIGE_MAX=250;
const PRESTIGE_SKINS=[
 {id:'pr_bronze',name:'Bronze',tier:'prestige',prestige:50,body:'#c47a45',belly:'#f2cfa6',accent:'#8a4a24',proj:'#e7a36b'},
 {id:'pr_charged',name:'Charged',tier:'prestige',prestige:150,charged:true,glow:'#5ef2ff',accent:'#5ef2ff',proj:'#5ef2ff',eye:'#bdfbff'},
 {id:'pr_super',name:'Supercharged',tier:'prestige',prestige:250,supercharged:true,glow:'#ffd23f',accent:'#ffd23f',proj:'#ffe98a',eye:'#fff3b0',shine:true}];
const PRESTIGE_REWARDS={50:{coins:500,pp:250,drops:[{r:'epic',n:1}],skin:'pr_bronze',pin:'bronze'},100:{coins:1000,pp:500,drops:[{r:'mythic',n:1}]},
 150:{coins:1500,pp:750,drops:[{r:'mythic',n:2}],skin:'pr_charged',pin:'silver'},200:{coins:2000,pp:1000,drops:[{r:'legendary',n:1}]},250:{coins:3000,pp:1500,drops:[{r:'legendary',n:2}],skin:'pr_super',pin:'gold'}};
const prestigeTier=n=>n>=250?{name:'Gold',col:'#ffd23f'}:n>=150?{name:'Silver',col:'#d6dbe8'}:{name:'Bronze',col:'#e7a36b'};
const isPrestigePin=id=>/^pr:[a-z]+:(bronze|silver|gold)$/.test(id)&&!!BY_ID[id.split(':')[1]];
/* Troll skins: silly animated skins for every rumbler */
const TROLL_SKINS=[{id:'disco',name:'Disco Fever',tier:'troll',troll:'disco',body:'#ff5e87',belly:'#fff3f8',accent:'#ffd23f',proj:'#ff9bf0',hat:'party',glow:'#ff9bf0'},
 {id:'glitch',name:'Glitched',tier:'troll',troll:'glitch',body:'#2bd4a4',belly:'#1a1430',accent:'#ff3fa4',proj:'#5ef2ff',eye:'#5ef2ff',scan:true},
 {id:'honk',name:'Honk Honk',tier:'troll',troll:'clown',body:'#f7f4ff',belly:'#ffd1dc',accent:'#ff3b5c',proj:'#ff3b5c',hat:'none'},
 {id:'ducky',name:'Rubber Ducky',tier:'troll',troll:'duck',body:'#ffd23f',belly:'#fff3b0',accent:'#ff9a3d',proj:'#ffe98a',hat:'none'}];
/* Every buyable skin comes with a matching skin pin: sk:<rumbler>:<skin> */
/* Every skin better than the basic ones comes with a 3-pin set (happy, angry, sad) */
const skinPinFaces=sk=>sk.tier!==0?['happy','angry','sad','cool','love']:null;
const isSkinPin=id=>{const m=/^sk:([a-z]+):([a-z_0-9]+)(?::(happy|angry|sad|cool|love))?$/.exec(id);return!!(m&&BY_ID[m[1]]&&skinsOf(BY_ID[m[1]]).some(k=>k.id===m[2]));};
const skinHasPin=sk=>sk.tier!==0&&sk.tier!=='master';
/* How flashy a skin's takedown and spawn effects are: 0 none, 1 small, 2 medium, 3 big */
const skinFx=sk=>sk.ultraFx||sk.fame?4:sk.tier==='solar'?3:sk.tier==='halloween'||sk.tier==='exclusive'?3:sk.supercharged?0:sk.tier==='power'?4:sk.tier==='golden'?3:sk.tier==='troll'?2:sk.charged||sk.tier===3||sk.tier==='sig'||sk.tier==='pass'||sk.tier==='master'?3:sk.tier===2||sk.tier==='rank'?2:sk.tier===1||sk.tier==='prestige'?1:0;
/* skins you can only earn, never buy */
const earnOnly=sk=>sk.tier==='solar'||sk.tier==='exclusive'||sk.tier==='halloween'||sk.tier==='pass'||sk.tier==='master'||sk.tier==='rank'||sk.tier==='prestige';
const SKIN_PRICE={1:{gems:30,coins:1500,pp:600},2:{gems:60,coins:3000,pp:1200},3:{gems:120,coins:6000,pp:2400},sig:{gems:90,coins:4500,pp:1800}};
SKIN_PRICE.troll={gems:80,coins:4000,pp:1600};
/* Golden skins: coins only, always for sale. Power skins: the best rarity, power points only, always for sale. */
SKIN_PRICE.golden={coins:20000};SKIN_PRICE.power={pp:10000};
const POWER_SKIN={id:'power',name:'Power Surge',tier:'power',body:'#2a1458',belly:'#6b3fd8',accent:'#c79bff',proj:'#d9b8ff',eye:'#f0e6ff',glow:'#9d7bff',powered:true,shine:true};
const ALWAYS_SKIN=sk=>sk.tier==='golden'||sk.tier==='power';
/* ---------- Halloween event ---------- */
/* Quick chat: set phrases only (no free typing with strangers). Under 7: pins only. */
const QUICK_CHAT=['Nice shot!','Thanks!','Good game!','Follow me!','Help me!','Attack!','Defend!','Wait!','Oops, sorry!','Well played!','Let\u2019s go!','So close!','Good luck!','Great team!'];
const canQuickChat=()=>S.ageBand&&S.ageBand!=='u7';
/* Profile icons: rumbler faces you own, trophy milestones, special skins, and rare icons from Rumbler Boxes */
const TROPHY_ICONS=[250,500,1000,1500,2000,2500,3000,3500,4000,4500,5000];
const SPECIAL_ICONS=[['crown','\ud83d\udc51','#ffd23f'],['skull','\ud83d\udc80','#c9cfe0'],['star','\u2b50','#ffb547'],['flame','\ud83d\udd25','#ff7a1a'],['heart','\ud83d\udc96','#ff7aa8'],['ghost','\ud83d\udc7b','#b48cff'],['bolt','\u26a1','#5ec8ff'],['moon','\ud83c\udf19','#3b3399'],['dino','\ud83e\udd96','#6be39a'],['alien','\ud83d\udc7d','#7ed957'],['gem','\ud83d\udc8e','#7df9ff'],['cool','\ud83d\ude0e','#ffd23f']];
const ICON_SKIN_TIERS=['golden','power','halloween','rank','master','exclusive','solar'];
const SPOOKY=['pumpkin','skeleton','zombie'],BOXES=['rbox','sbox'],isSpecialDrop=r=>r==='season'||SPOOKY.includes(r)||BOXES.includes(r),KNOCK_EVERY=5;
const dropName=r=>RARITY[r]?(RARITY[r].box?RARITY[r].name:RARITY[r].name+' Drop'):'Drop';
const BOX_PRICE={rbox:70,sbox:80};
const eventLocked=b=>!!(b&&b.eventOnly&&halloweenOn());
const halloweenOn=d=>{if(RR_MODE==='sandbox'&&SBX&&SBX.hw!=null)return SBX.hw;d=d||new Date();const m=d.getMonth();return m===9||(m===10&&d.getDate()<=7);};
const HALLOWEEN_SKINS=[
 {id:'hw_jack',name:'Jack-o’-Lantern',tier:'halloween',body:'#ff8a1f',belly:'#ffc07a',accent:'#3f7d2c',proj:'#ffb347',eye:'#ffe27a',hat:'stem',grin:true,glow:'#ffb347'},
 {id:'hw_skelly',name:'Skelly Bones',tier:'halloween',body:'#f1f4ff',belly:'#2a2238',accent:'#1a1430',proj:'#f1f4ff',eye:'#ff3b30',hat:'none',stripes:true},
 {id:'hw_mummy',name:'Mummy Wrap',tier:'halloween',body:'#e8dcc0',belly:'#f6eedb',accent:'#7a6a50',proj:'#e8dcc0',eye:'#7fffd4',hat:'none',tape:true,glow:'#7fffd4'},
 {id:'hw_ghost',name:'Ghostly',tier:'halloween',body:'#e9f0ff',belly:'#ffffff',accent:'#9d7bff',proj:'#cfe0ff',eye:'#3a2d6b',hat:'none',glow:'#cfe0ff'},
 {id:'hw_count',name:'Count Fangula',tier:'halloween',body:'#2a1430',belly:'#ff3b5c',accent:'#ffd23f',proj:'#ff3b5c',eye:'#ff3b5c',hat:'horns',glow:'#ff3b5c',shine:true},
 {id:'hw_frank',name:'Franken-Rumbler',tier:'halloween',body:'#7fb069',belly:'#c8e6a0',accent:'#3a2d22',proj:'#b9f27c',hat:'antennae',stripes:true},
 {id:'hw_corn',name:'Candy Corn',tier:'halloween',body:'#ffb000',belly:'#fff6e8',accent:'#ff6b2c',proj:'#ffd23f',hat:'swirl',sprinkles:true},
 {id:'hw_wolf',name:'Werewolf',tier:'halloween',body:'#5a4a3a',belly:'#a8927a',accent:'#ffd23f',proj:'#ffd23f',eye:'#ffd23f',hat:'quills'},
 {id:'hw_spider',name:'Spider Queen',tier:'halloween',body:'#1a1430',belly:'#7b2fe0',accent:'#ff3fa4',proj:'#b56cff',eye:'#ff3fa4',hat:'crown',glow:'#b56cff'},
 {id:'hw_witch',name:'Midnight Witch',tier:'halloween',body:'#3b1f6b',belly:'#7ed957',accent:'#ff8a1f',proj:'#ff8a1f',hat:'witch',glow:'#ff8a1f',starry:true}];
const DARK_EVENT_SKIN={id:'hw_reaper',name:'Pumpkin Reaper',tier:'halloween',body:'#1a0f08',belly:'#ff8a1f',accent:'#ff8a1f',proj:'#ff8a1f',eye:'#ff9a1a',glow:'#ff6a00',rim:'#ff8a1f',reaper:true,exclusive:true};
const SURGED_SKIN={id:'hw_surged',name:'Surged Dark',tier:'halloween',body:'#ff5ad1',belly:'#ffffff',accent:'#ffffff',proj:'#ff5ad1',eye:'#ffffff',glow:'#ff7ad9',surged:true,exclusive:true};
const GRIM_SKIN={id:'hw_grim',name:'Grim Dark',tier:'halloween',body:'#0e1712',belly:'#3dff8a',accent:'#3dff8a',proj:'#3dff8a',eye:'#7dffb0',glow:'#2bd46a',rim:'#1f3a2a',grim:true,exclusive:true};
const DEAD_PITY=50,DEAD_CHANCE=.05,HAPPY_KNOCKS=100;
const SPOOKY_LOOT=[['hskin',24],['skin',10],['hpin',16],['pp',16,[300,700]],['pass',14,[80,200]],['coins',12,[500,1200]],['gems',8,[20,60]]];
const KNOCK_LOOT=[['skin',13],['drop',18],['gdrop',12],['hskin',14],['hpin',12],['spooky',10],['coins',7],['pp',7],['trick',20]];
const DARK_DROPS=15;
/* Exclusive skins: never in the shop or boxes. Each one is earned by doing something special. */
const EX_COL='#2de0b0';
const EXCLUSIVE_SKINS=[
 {rid:'ember',stat:'pins',goal:100,how:'Send 100 pins in matches',skin:{id:'ex_emoji',name:'Emoji',tier:'exclusive',body:'#ffd23f',belly:'#fff3a6',accent:'#ff8a1f',proj:'#ffd23f',hat:'party',grin:true,sprinkles:true}},
 {rid:'ember',stat:'rid',goal:1,how:'Sign in with a Rumble ID (\u2630 menu)',skin:{id:'ex_rid',name:'Rumble ID',tier:'exclusive',body:'#2a7fd0',belly:'#e8f4ff',accent:'#ffd23f',proj:'#7ad7ff',eye:'#ffd23f',hat:'visor',glow:'#7ad7ff',scan:true}},
 {rid:'boulder',stat:'sims',goal:10,how:'Run 10 simulations (\u2630 menu)',skin:{id:'ex_robo',name:'Robo',tier:'exclusive',body:'#8fa3b8',belly:'#dce6ef',accent:'#ff3b5c',proj:'#46e0ff',eye:'#46e0ff',hat:'antenna',glow:'#46e0ff',rivets:true,scan:true}},
 {rid:'luna',stat:'replays',goal:5,how:'Watch 5 replays (\u2630 menu)',skin:{id:'ex_noir',name:'Film Noir',tier:'exclusive',body:'#2d2d33',belly:'#e9e9ec',accent:'#ffffff',proj:'#f2f2f2',eye:'#ffffff',hat:'fedora',rim:'#ffffff',grain:true}},
 {rid:'gus',stat:'rbox',goal:10,how:'Open 10 Rumbler Boxes',skin:{id:'ex_unbox',name:'Unboxer',tier:'exclusive',body:'#c89a5e',belly:'#f0d9a8',accent:'#ff5e87',proj:'#ff5e87',hat:'hardhat',tape:true}},
 {rid:'quill',stat:'secrets',goal:10,how:'Find 10 secrets',skin:{id:'ex_sleuth',name:'Sleuth',tier:'exclusive',body:'#9a7148',belly:'#efdcb4',accent:'#5a3a1e',proj:'#ffd23f',hat:'deerstalker',plaid:true}},
 {rid:'fang',stat:'sdWins',goal:10,how:'Finish 1st in Solo Showdown 10 times',skin:{id:'ex_lone',name:'Last One Standing',tier:'exclusive',body:'#3a1f24',belly:'#ffb000',accent:'#ff3b5c',proj:'#ff6a00',eye:'#ffd23f',hat:'bandana',glow:'#ff6a00',warpaint:true}},
 {rid:'rook',stat:'kills',goal:500,how:'Get 500 takedowns',skin:{id:'ex_warlord',name:'Warlord',tier:'exclusive',body:'#5a1418',belly:'#ffd23f',accent:'#ffd23f',proj:'#ff3b5c',eye:'#ffd23f',hat:'spikes',glow:'#ff3b5c',shine:true,warpaint:true}},
 {rid:'pip',stat:'matches',goal:300,how:'Play 300 matches',skin:{id:'ex_marathon',name:'Marathon',tier:'exclusive',body:'#2ad19a',belly:'#ffffff',accent:'#ff5ad1',proj:'#ffd23f',hat:'visor',checker:true}},
 {rid:'zapper',stat:'pass',goal:45,how:'Reach Rumble Pass tier 45',skin:{id:'ex_passmaster',name:'Pass Master',tier:'exclusive',body:'#1b2a6b',belly:'#ffd23f',accent:'#ffd23f',proj:'#7ad7ff',eye:'#7ad7ff',hat:'laurel',glow:'#7ad7ff',starry:true}},
 {rid:'echo',stat:'best',goal:3000,how:'Reach 3,000 trophies',skin:{id:'ex_diamond',name:'Diamond',tier:'exclusive',body:'#bfefff',belly:'#ffffff',accent:'#46b4ff',proj:'#9be8ff',eye:'#2a7fd0',hat:'icecrown',glow:'#9be8ff',facets:true,shine:true}}];
/* Solar: levels bought with chromos after you've done everything else. Each level gives a profile icon and more. */
const SOLAR_LEVELS=[{name:'Spark',base:10000},{name:'Glow',base:15000},{name:'Flare',base:22000},{name:'Ray',base:30000},{name:'Beam',base:40000},
 {name:'Blaze',base:55000},{name:'Corona',base:75000},{name:'Nova',base:100000},{name:'Eclipse',base:140000},{name:'Solar Fame',base:200000}];
/* every Solar level has 3 steps: I (a pin + an icon), II (gems, coins, power points + an animated pin + an animated icon), III (a skin) */
const SOLAR_MAX=SOLAR_LEVELS.length,SOLAR_STEPS=SOLAR_MAX*3,SOL_SUB_MUL=[1,1.5,2],SOL_COL='#ffb000',SOL_ROMAN=['I','II','III'];
const solCost=i=>Math.round(SOLAR_LEVELS[Math.floor(i/3)].base*SOL_SUB_MUL[i%3]);   /* i = 0-based step */
const SOLDAR_STEP=SOLAR_STEPS+1,SOLDAR_COST=500000,SOLDAR_CASH={gems:2000,coins:100000,pp:50000};
const solStepName=n=>n<=0?'Not started':n>SOLAR_STEPS?'Soldar':SOLAR_LEVELS[Math.ceil(n/3)-1].name+' '+SOL_ROMAN[(n-1)%3];
const solDone=L=>(S.sol|0)>=L*3;
const SOLAR_SKINS=[
 {lv:1,rid:'zing',skin:{id:'sol_spark',name:'Spark',tier:'solar',body:'#fff3a6',belly:'#ffffff',accent:'#ffb000',proj:'#ffe680',eye:'#ff8a1f',hat:'antenna',glow:'#ffe680',sprinkles:true}},
 {lv:2,rid:'spritz',skin:{id:'sol_sunbeam',name:'Sunbeam',tier:'solar',body:'#ffd23f',belly:'#fff6d0',accent:'#ff8a1f',proj:'#ffe680',eye:'#ff8a1f',hat:'halo',glow:'#ffd23f',shine:true}},
 {lv:3,rid:'fizz',skin:{id:'sol_flarefizz',name:'Flare',tier:'solar',body:'#ff8a1f',belly:'#ffe680',accent:'#ff3b5c',proj:'#ffb000',eye:'#fff3a6',hat:'flame',glow:'#ff8a1f',stripes:true}},
 {lv:4,rid:'blaze',skin:{id:'sol_flare',name:'Solar Flare',tier:'solar',body:'#ff6a00',belly:'#ffd23f',accent:'#fff3a6',proj:'#ffb000',eye:'#fff3a6',hat:'flame',glow:'#ff8a1f',cracks:true}},
 {lv:5,rid:'bolt',skin:{id:'sol_beam',name:'Sunbeam Sniper',tier:'solar',body:'#fffbe6',belly:'#ffd23f',accent:'#46b4ff',proj:'#7ad7ff',eye:'#46b4ff',hat:'visor',glow:'#7ad7ff',scan:true}},
 {lv:6,rid:'volta',skin:{id:'sol_storm',name:'Sunstorm',tier:'solar',body:'#ffb000',belly:'#fff3a6',accent:'#ff3b5c',proj:'#ffe680',eye:'#ff3b5c',hat:'starcrest',glow:'#ffb000',charged:true}},
 {lv:7,rid:'nova',skin:{id:'sol_corona',name:'Corona',tier:'solar',body:'#fff3a6',belly:'#ffffff',accent:'#ffb000',proj:'#ffd23f',eye:'#ff8a1f',hat:'crown',glow:'#ffe680',rim:'#ffb000',shine:true}},
 {lv:8,rid:'shade',skin:{id:'sol_supernova',name:'Supernova',tier:'solar',body:'#ff5ad1',belly:'#fff3fb',accent:'#ffd23f',proj:'#ff9ae6',eye:'#ffd23f',hat:'halo',glow:'#ff5ad1',rim:'#ffffff',starry:true}},
 {lv:9,rid:'luna',skin:{id:'sol_eclipse',name:'Eclipse',tier:'solar',body:'#120f26',belly:'#ffb000',accent:'#ffd23f',proj:'#ffd23f',eye:'#ffd23f',hat:'halo',glow:'#ffb000',rim:'#ffd23f',starry:true}},
 {lv:10,rid:'astra',skin:{id:'sol_fame',name:'Solar Fame',tier:'solar',fame:true,body:'#ffd23f',belly:'#fffbe6',accent:'#ff5e87',proj:'#fff3a6',eye:'#ff3b5c',hat:'starcrest',glow:'#ffd23f',rim:'#ffffff',shine:true,starry:true}}];
/* Soldar: the final level after Solar Fame. No steps, just one huge unlock. */
const SOLDAR_SKINS=[
 {lv:11,rid:'orion',skin:{id:'sdr_orion',name:'Soldar',tier:'solar',fame:true,soldar:true,body:'#120f26',belly:'#ffd23f',accent:'#ff3b5c',proj:'#ffb000',eye:'#ffd23f',hat:'crown',glow:'#ff6a00',rim:'#ffd23f',starry:true,shine:true}},
 {lv:11,rid:'zenith',skin:{id:'sdr_meteor',name:'Soldar',tier:'solar',fame:true,soldar:true,body:'#2a0a12',belly:'#ffb000',accent:'#ffd23f',proj:'#ff6a00',eye:'#fff3a6',hat:'spikes',glow:'#ff3b5c',rim:'#ffb000',cracks:true}}];
const SOL_BY_SKIN={};for(const x of SOLAR_SKINS.concat(SOLDAR_SKINS))SOL_BY_SKIN[x.skin.id]=x;
const EX_BY_SKIN={};for(const e of EXCLUSIVE_SKINS)EX_BY_SKIN[e.skin.id]=e;
function skinsOf(b){
  if(b._skins)return b._skins;
  const base={...b.look,boxy:!!b.boxy};
  const list=[{...base,id:'classic',name:'Classic',tier:0}];
  THEMES.forEach(t=>list.push({...base,...t,boxy:!!(b.boxy||t.boxy)}));
  list.push({...base,...STARFALL,boxy:!!b.boxy});
  for(const ps of PRESTIGE_SKINS)list.push({...base,...ps,boxy:!!b.boxy});
  for(const hs of HALLOWEEN_SKINS)list.push({...base,...hs,boxy:!!b.boxy});
  if(b.id==='juggler')list.push({...base,...LANTERN_SKIN,boxy:!!b.boxy});
  if(b.id==='dark')list.push({...base,...DARK_EVENT_SKIN},{...base,...SURGED_SKIN},{...base,...GRIM_SKIN});
  if(b.id==='trick')list.push({...base,...WILDCARD_SKIN,boxy:!!b.boxy});
  for(const rs of RANK_SETS)list.push({...base,...rs.skin,boxy:!!b.boxy});
  for(const ts of TROLL_SKINS)list.push({...base,...ts,boxy:!!b.boxy});
  list.push({...base,...POWER_SKIN,boxy:!!b.boxy});
  if(b.id==='juggler')list.push({...base,...MAID_SKIN,boxy:!!b.boxy});
  for(const e of EXCLUSIVE_SKINS)if(e.rid===b.id)list.push({...base,...e.skin,boxy:!!b.boxy});
  for(const x of SOLAR_SKINS.concat(SOLDAR_SKINS))if(x.rid===b.id)list.push({...base,...x.skin,boxy:!!b.boxy});
  list.push({...base,...b.sig,id:'sig',tier:'sig'});
  return(b._skins=list);
}
function getSkin(b,id){const l=skinsOf(b);return l.find(s=>s.id===id)||l[0];}
const skinPrice=sk=>sk.tier===0||earnOnly(sk)?null:SKIN_PRICE[sk.tier];
const SKIN_TOTAL=RUMBLERS.reduce((n,b)=>n+skinsOf(b).length,0);

/* ---------- Modes & maps ---------- */
const MODES=[
 {id:'ring',name:'Ring Rumble',desc:'Hold the center ring to score. Takedowns are worth 5. First team to 140 wins.',map:'yard',goal:140,time:150,ranked:true,col:'#ffc93c'},
 {id:'battery',name:'Battery Run',desc:'Grab batteries from the middle and drop them at your charger. First team to 12 wins.',map:'vents',goal:12,time:150,ranked:true,col:'#5ce1a0'},
 {id:'core',name:'Core Breaker',desc:'Smash the enemy core before they smash yours.',map:'lanes',goal:1,time:150,ranked:true,col:'#ff5d57'},
 {id:'crown',name:'Crown Carrier',desc:'Carry the crown to score. Knock out the carrier to steal it. First team to 80 wins.',map:'vents',goal:80,time:150,ranked:true,col:'#c792ff'},
 {id:'stand',name:'Last Stand',desc:'No respawns, and a storm closes in. The last team standing wins.',map:'pit',goal:0,time:120,ranked:true,col:'#ff5e87'},
 {id:'bounty',name:'Star Hunt',desc:'Every takedown earns your team a star. First team to 20 stars wins.',map:'yard',goal:20,time:150,ranked:true,col:'#ffd23f'},
 {id:'boss',name:'Giant Brawl',desc:'Your team of 3 takes on one giant rumbler with 10\u00d7 health. Take it down before time runs out.',map:'pit',goal:1,time:150,ranked:false,col:'#ff7a1a',tag:'3 vs Giant'},
 {id:'chaos',name:'Super Rush',desc:'Supers charge 4\u00d7 faster, everyone starts with a super and respawns fast. First team to 20 takedowns wins.',map:'vents',goal:20,time:150,ranked:false,col:'#ff5e87'},
 {id:'duel',name:'Duel',desc:'Just you and one opponent. First to 5 takedowns wins.',map:'pit',goal:5,time:120,ranked:false,col:'#9fe8ff',tag:'1 vs 1'},
 {id:'rush',name:'Takedown Rush',desc:'Pure 3v3 brawling. First team to 15 takedowns wins.',map:'yard',goal:15,time:150,ranked:false,col:'#46b4ff'},
 {id:'knockout',name:'Knockout',desc:'Best of 3 rounds with no respawns. Knock out the whole enemy team to win a round. Drag a round out and a storm closes in.',map:'yard',goal:2,time:300,ranked:true,col:'#ff7a5c',tag:'3 vs 3 \u00b7 best of 3'},
 {id:'hunt',name:'Bounty',desc:'Everyone has a bounty over their head: it starts at 2 stars and grows with every takedown. Knock someone out to take their whole bounty. First team to 25 stars wins.',map:'yard',goal:25,time:150,ranked:true,col:'#ffb547'},
 {id:'showdown',name:'Solo Showdown',desc:'Every rumbler for themselves with no respawns. Break boxes for energy cubes and be the last one standing. Finish in the top 3 and it counts as a win.',map:'grove',goal:0,time:150,ranked:false,ffa:true,players:8,size:1,teams:8,sd:true,group:'sd',col:'#46d0ff'},
 {id:'duo',name:'Duo Showdown',desc:'Teams of 2. Knocked out? You come back next to your teammate 10 seconds later with no cubes, as long as they\u2019re still standing. When either of you grabs a cube, you both get one. Your team is out when you\u2019re both down at once. Finish in the top 3 and it counts as a win.',map:'grove',goal:0,time:150,ranked:false,ffa:true,players:10,size:2,teams:5,sd:true,group:'sd',col:'#46d0ff'},
 {id:'trio',name:'Trio Showdown',desc:'Teams of 3. Knocked-out rumblers come back next to a standing teammate 10 seconds later with no cubes. Every cube a teammate grabs goes to everyone on the team who\u2019s standing. Your team is out when all three of you are down at once. Finish in the top 3 and it counts as a win.',map:'grove',goal:0,time:150,ranked:false,ffa:true,players:12,size:3,teams:4,sd:true,group:'sd',col:'#46d0ff'},
 {id:'frenzy',name:'Frenzy',desc:'Six rumblers, every one for themselves. First to 8 takedowns wins.',map:'pit',goal:8,time:120,ranked:false,ffa:true,col:'#ff9f43'},
 {id:'try',name:'Training',desc:'Try any rumbler at max level against practice bots. No rewards, no risk.',map:'yard',goal:0,time:120,ranked:false,hidden:true,col:'#6be39a'},
];
const MODE_BY={};MODES.forEach(m=>MODE_BY[m.id]=m);
const MI=(inner,bg)=>'<svg viewBox="0 0 48 48" class="mi">'+inner+'</svg>';
const SPIN=(d,cx,cy,rev)=>'<animateTransform attributeName="transform" type="rotate" from="'+(rev?360:0)+' '+cx+' '+cy+'" to="'+(rev?0:360)+' '+cx+' '+cy+'" dur="'+d+'s" repeatCount="indefinite"/>';
const BOB=(d,dy)=>'<animateTransform attributeName="transform" type="translate" values="0 0;0 '+(-dy)+';0 0" dur="'+d+'s" repeatCount="indefinite"/>';
const PULSE=(a,b,d)=>'<animate attributeName="opacity" values="'+a+';'+b+';'+a+'" dur="'+d+'s" repeatCount="indefinite"/>';
const O='stroke="#120f26" stroke-width="3" stroke-linejoin="round"';
/* Fresh animated mode icons */
const MODE_ICON={
 ring:MI('<circle cx="24" cy="24" r="18" fill="none" stroke="#120f26" stroke-width="4" stroke-dasharray="7 5"><animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="6s" repeatCount="indefinite"/></circle><circle cx="24" cy="24" r="11" fill="#fff" '+O+'/><circle cx="24" cy="24" r="5" fill="#120f26"><animate attributeName="r" values="4;6;4" dur="1.2s" repeatCount="indefinite"/></circle>'),
 battery:MI('<rect x="13" y="9" width="22" height="33" rx="5" fill="#fff" '+O+'/><rect x="19" y="4" width="10" height="6" rx="2" fill="#120f26"/><rect x="17" y="30" width="14" height="8" rx="2" fill="#5ce1a0"><animate attributeName="y" values="30;14;30" dur="2.4s" repeatCount="indefinite"/><animate attributeName="height" values="8;24;8" dur="2.4s" repeatCount="indefinite"/></rect><path d="M26 15l-6 9h5l-3 8 7-10h-5z" fill="#120f26"/>'),
 core:MI('<g>'+SPIN(10,24,24)+'<path d="M24 3l17 10v22L24 45 7 35V13z" fill="#fff" '+O+'/></g><circle cx="24" cy="24" r="9" fill="#ff5d57" '+O+'>'+PULSE(1,.5,1)+'</circle><path d="M24 15v18M15 24h18" stroke="#120f26" stroke-width="2.5"/>'),
 crown:MI('<g>'+BOB(1.6,3)+'<path d="M7 36l-2-22 10 9 9-16 9 16 10-9-2 22z" fill="#ffd23f" '+O+'/><rect x="7" y="37" width="34" height="6" rx="2" fill="#ffd23f" '+O+'/><circle cx="24" cy="26" r="3.5" fill="#ff4d6d"/></g><path d="M40 6l1.5 3.5L45 11l-3.5 1.5L40 16l-1.5-3.5L35 11l3.5-1.5z" fill="#fff">'+PULSE(1,.2,1.1)+'</path>'),
 stand:MI('<path d="M24 4l17 6v12c0 11-8 18-17 22C15 40 7 33 7 22V10z" fill="#fff" '+O+'/><path d="M24 12v20M16 22h16" stroke="#120f26" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="24" r="21" fill="none" stroke="#120f26" stroke-width="2" stroke-dasharray="3 4">'+SPIN(5,24,24,1)+'</circle>'),
 bounty:MI('<g>'+SPIN(4,24,24)+'<path d="M24 4l5.5 12 13 1.2-9.8 8.6 2.9 12.8L24 31.9l-11.6 6.7 2.9-12.8-9.8-8.6 13-1.2z" fill="#fff" '+O+'/></g><circle cx="24" cy="24" r="4" fill="#120f26"/>'),
 hunt:MI('<rect x="8" y="5" width="32" height="38" rx="3" fill="#f6e2b0" '+O+'/><text x="24" y="16" text-anchor="middle" font-family="Bungee,Impact,sans-serif" font-size="8" fill="#120f26">WANTED</text><g>'+BOB(1.2,2)+'<path d="M24 20l3 6.5 7 .7-5.3 4.7 1.6 7L24 35.2l-6.3 3.7 1.6-7-5.3-4.7 7-.7z" fill="#ffb000" stroke="#120f26" stroke-width="2"/></g>'),
 boss:MI('<g>'+BOB(1,1.5)+'<circle cx="24" cy="27" r="17" fill="#fff" '+O+'/><path d="M10 15l-3-11 10 7M38 15l3-11-10 7" fill="#ff7a1a" '+O+'/><path d="M14 23l7 3M34 23l-7 3" stroke="#120f26" stroke-width="3" stroke-linecap="round"/><path d="M15 35q9-7 18 0" fill="none" stroke="#120f26" stroke-width="3"/></g>'),
 chaos:MI('<path d="M27 3L9 27h12l-3 18 21-26H26z" fill="#ffd23f" '+O+'>'+PULSE(1,.45,.5)+'</path><circle cx="38" cy="9" r="3" fill="#fff">'+PULSE(.2,1,.7)+'</circle><circle cx="9" cy="40" r="2.5" fill="#fff">'+PULSE(1,.2,.9)+'</circle>'),
 duel:MI('<g><animateTransform attributeName="transform" type="rotate" values="-6 24 24;6 24 24;-6 24 24" dur="1s" repeatCount="indefinite"/><path d="M8 6l20 20-4 4L4 10V6zM40 6v4L20 30l-4-4L36 6z" fill="#fff" '+O+'/><path d="M10 34l6-6 4 4-6 6zM38 34l-6-6-4 4 6 6z" fill="#120f26"/></g>'),
 rush:MI('<g>'+BOB(.6,2)+'<path d="M6 30h22l-4 10 18-18H20l4-10z" fill="#fff" '+O+'/></g><path d="M4 18h10M2 24h8M6 12h8" stroke="#120f26" stroke-width="3" stroke-linecap="round">'+PULSE(1,.3,.6)+'</path>'),
 knockout:MI('<g><animateTransform attributeName="transform" type="translate" values="-3 0;4 0;-3 0" dur=".7s" repeatCount="indefinite"/><path d="M10 16c0-6 5-10 11-10h8c7 0 12 5 12 12v8c0 6-5 10-11 10H19l-4 6H9l2-8c-1-2-1-4-1-6z" fill="#ff5d57" '+O+'/><path d="M22 6v10c0 3 2 5 5 5h6" fill="none" stroke="#120f26" stroke-width="3"/></g><path d="M3 22h4M2 28h5" stroke="#120f26" stroke-width="3" stroke-linecap="round"/>'),
 showdown:MI('<g>'+SPIN(8,24,24)+'<path d="M24 4l18 10v20L24 44 6 34V14z" fill="#fff" '+O+'/></g><path d="M24 12l10 6-10 6-10-6z" fill="#46d0ff" stroke="#120f26" stroke-width="2.5"><animate attributeName="fill" values="#46d0ff;#9ff0ff;#46d0ff" dur="1.4s" repeatCount="indefinite"/></path><path d="M14 18v12l10 6V24zM34 18v12l-10 6V24z" fill="#1f8fb5" stroke="#120f26" stroke-width="2.5"/>'),
 frenzy:MI('<path d="M24 4c3 8 12 10 12 22a12 12 0 0 1-24 0c0-6 3-9 5-12 1 4 3 5 4 5-1-6 1-11 3-15z" fill="#ff9f43" '+O+'><animateTransform attributeName="transform" type="scale" values="1 1;1.04 .96;1 1" dur=".5s" repeatCount="indefinite" additive="sum"/></path><path d="M24 22c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" fill="#ffd23f">'+PULSE(1,.6,.4)+'</path>'),
 try:MI('<circle cx="24" cy="24" r="18" fill="#fff" '+O+'/><circle cx="24" cy="24" r="11" fill="#6be39a" '+O+'/><circle cx="24" cy="24" r="4" fill="#120f26">'+PULSE(1,.3,.8)+'</circle>')
};

/* Maps: top half of a 20x32 tile grid; the bottom half is the top rotated 180°. */
const MAPS={
 yard:{name:'Crate Yard',top:['....................','....................','..##............##..','..##....bbbb....##..','........bbbb........','bb..#..........#..bb','bb..#....##....#..bb','....#....##....#....','....................','..###..........###..','......bb....bb......','......bb....bb......','...#............#...','...#....#..#....#...','bb......#..#......bb','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 vents:{name:'Vent Alley',top:['....................','....................','.##..............##.','.##.....####.....##.','....................','....bb........bb....','....bb..#..#..bb....','........#..#........','.###............###.','....................','......bbb..bbb......','.##..............##.','.##....#....#....##.','.......#....#.......','....................','....................'],
  spawns:[[[330,1530],[500,1555],[670,1530]],[[670,70],[500,45],[330,70]]],pads:[[500,1505],[500,95]]},
 lanes:{name:'Twin Lanes',top:['....................','....................','....................','......##....##......','.......#....#.......','..bb............bb..','..bb...######...bb..','....................','#..#............#..#','#..#....bbbb....#..#','........bbbb........','....##........##....','....##........##....','.bb..............bb.','.bb.....#..#.....bb.','....................'],
  spawns:[[[300,1540],[500,1562],[700,1540]],[[700,60],[500,38],[300,60]]],cores:[[500,1460],[500,140]]},
 grove:{name:'Storm Grove',top:['....................', '.bb..............bb.', '.bb...##....##...bb.', '......#......#......', '..##....bbbb....##..', '..#.....bbbb.....#..', '.....##......##.....', 'bbb..............bbb', 'bbb...#......#...bbb', '......#..bb..#......', '..##.....bb.....##..', '..##............##..', '.......##..##.......', '.bb..............bb.', '.bb....#....#....bb.', '....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],
  ffa:[[75,75],[500,75],[925,75],[75,800],[925,800],[75,1525],[500,1525],[925,1525]],
  boxes:[[175,175],[825,175],[475,325],[75,525],[925,525],[325,575],[675,575],[825,1425],[175,1425],[525,1275],[925,1075],[75,1075],[675,1025],[325,1025]]},
 pit:{name:'The Pit',top:['....................','....................','...##..........##...','........bbbb........','.bb......##......bb.','.bb..............bb.','......#......#......','...#..#......#..#...','...#............#...','.......bb..bb.......','.##....bb..bb....##.','....................','.....##......##.....','..b..............b..','..b.....#..#.....b..','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],
  ffa:[[75,75],[925,75],[75,800],[925,800],[75,1525],[925,1525]]},
 rooftops:{name:'Sky Rooftops',top:['....................','....................','.##..............##.','.##....b....b....##.','.......b....b.......','...###........###...','..........bb........','bb.....#....#.....bb','bb.....#....#.....bb','....#..........#....','....#...bbbb...#....','........bbbb........','..##............##..','..##....#..#....##..','........#..#........','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 garden:{name:'Hedge Garden',top:['....................','....................','..bbb..........bbb..','..bbb...####...bbb..','....................','.##...bb....bb...##.','.##...bb....bb...##.','.........##.........','bbb..............bbb','bbb.....#..#.....bbb','........#..#........','...##..........##...','...##...bbbb...##...','........bbbb........','.bb..............bb.','.bb..............bb.'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 harbor:{name:'Harbor Docks',top:['....................','....................','....#..........#....','....#..........#....','....####....####....','..........bb........','bb........bb......bb','bb..###......###..bb','....................','......bb....bb......','......bb....bb......','.##......##......##.','.##......##......##.','....................','....bb........bb....','....bb........bb....'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 hollow:{name:'Haunted Hollow',top:['....................','....................','.##......bb......##.','.#.......bb.......#.','....##........##....','....#..........#....','.bb..............bb.','.bb...###..###...bb.','....................','..##....bbbb....##..','..#.....bbbb.....#..','....................','.....##......##.....','.bb..............bb.','.bb....#....#....bb.','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],ffa:[[75,75],[500,75],[925,75],[75,800],[925,800],[75,1525],[500,1525],[925,1525]],boxes:[[175,175],[825,175],[475,325],[75,525],[925,525],[325,575],[675,575],[825,1425],[175,1425],[525,1275],[925,1075],[75,1075],[675,1025],[325,1025]]},
 arena:{name:'Spooky Arena',top:['....................','....................','...##....bb....##...','...#.....bb.....#...','.........##.........','.bb..............bb.','.bb...##....##...bb.','......#......#......','....................','...###...bb...###...','.........bb.........','....................','..bb....#..#....bb..','..bb....#..#....bb..','....................','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],ffa:[[75,75],[925,75],[75,800],[925,800],[75,1525],[925,1525]]},
};
/* Maps rotate every day. Each mode picks from the maps that fit it. */
const MAP_POOLS={team:['yard','vents','lanes','pit','rooftops','garden','harbor'],core:['lanes','yard','rooftops','harbor','pit'],sd:['grove','hollow'],ffa:['pit','arena','grove','hollow']};
function mapPool(m){m=MODE_BY[m]||m;return m.id==='core'?MAP_POOLS.core:m.sd?MAP_POOLS.sd:m.ffa?MAP_POOLS.ffa:MAP_POOLS.team;}
function dailyMap(modeId,day){const pool=mapPool(modeId);let h=2166136261;for(const ch of (day||todayKey())+modeId)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return pool[h%pool.length];}

/* Ranked ladder */
const TIERS=[['Bronze','#e7a36b'],['Silver','#d6dbe8'],['Gold','#ffd23f'],['Diamond','#7fe9fb'],['Mythic','#c79bff'],['Legendary','#ff7aa8'],['Ultra','#7df9ff']];
const DIVS=['I','II','III'];
const RANK_STEPS=TIERS.length*3+1;
function rankInfo(rp){
  const i=Math.min(RANK_STEPS-1,Math.floor(Math.max(0,rp)/100));
  if(i===RANK_STEPS-1)return{i,name:'Master',col:'#ff5e87',tier:TIERS.length,div:'',into:Math.max(0,rp)-i*100,need:0};
  const t=Math.floor(i/3);return{i,name:TIERS[t][0]+' '+DIVS[i%3],col:TIERS[t][1],tier:t,div:DIVS[i%3],into:rp-i*100,need:100};
}
/* Ranked rewards: every division gives a bundle with guaranteed drops; Master gives a huge one */
const RR_DROP=['rare','epic','mythic','legendary','legendary','legendary','legendary'];
const MASTER_REWARD={master:true,chromos:15000,gems:500,coins:10000,pp:5000,drops:[{r:'ultra',n:3},{r:'legendary',n:5}]};
function rankReward(i){if(i>=RANK_STEPS-1)return MASTER_REWARD;const t=Math.floor(i/3);
  if(t===6){const d=i%3;return{chromos:[3000,4500,5000][d],gems:[80,90,100][d],coins:200+i*120,pp:100+i*60,drops:d<2?[{r:'legendary',n:d+1}]:[{r:'legendary',n:3},{r:'ultra',n:1}]};}return{chromos:250+i*150,gems:10+i*4,coins:200+i*120,pp:100+i*60,drops:[{r:RR_DROP[t],n:i%3===0?2:1}]};}
RANK_SETS[RANK_SETS.length-1].idx=RANK_STEPS-1;
/* Which rumbler a player's rank set is for: Grandmaster is always Ember, every lower rank is a random rumbler picked per player (never repeats) */
function rankSetRumbler(k,seed){if(k>=RANK_SETS.length-1)return STARTER;const pool=RUMBLERS.filter(b=>b.id!==STARTER&&!b.random&&!b.eventOnly).map(b=>b.id),used=[STARTER];let h=((seed>>>0)||1)^0x5bd1e995;
  for(let j=0;j<=k;j++){h=Math.imul(h^(h>>>13),2654435761)>>>0;const free=pool.filter(x=>!used.includes(x));const pick=free[h%free.length];used.push(pick);if(j===k)return pick;}return STARTER;}
/* Ranked season maxed rumblers: 3 per month, usable by everyone in ranked at max level with gadget + star power */
const SEASON_MAX_FIXED={'2026-10':['zapper','juggler','perk']};
function seasonMaxed(d){d=d||new Date();const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');if(SEASON_MAX_FIXED[k])return SEASON_MAX_FIXED[k];
  let h=0;for(const ch of k)h=Math.imul(h^ch.charCodeAt(0),2654435761)>>>0;const pool=RUMBLERS.filter(b=>!b.random&&b.rarity!=='common').map(b=>b.id),out=[];
  while(out.length<3&&pool.length){h=Math.imul(h^(h>>>13),2246822519)>>>0;out.push(pool.splice(h%pool.length,1)[0]);}return out;}
const rankSeed=o=>(((o&&o.seed)>>>0)+((o&&o.rankCycle)|0)*7919)>>>0;
const RANK_PINS=RANK_SETS.map(rs=>[rs.pin,'I reached '+rs.name]);

/* ---------- Rumble Pass: Season 1 · Starfall ---------- */
const PASS_TIERS=45,PASS_STEP=100,PASS_GEMS=150,PASS_BONUS_STEP=100,PASS_WIN_EVERY=5;
const PASS_FREE=[{coins:100},{drop:'rare'},{pp:50},{chromos:200},{drop:'rare'},{gems:10},{coins:150},{drop:'rare'},{pp:80},{drop:'epic'},
 {coins:200},{chromos:400},{pp:100},{gems:15},{drop:'season'},{chromos:500},{coins:250},{drop:'rare'},{pp:120},{drop:'rbox'},
 {chromos:600},{drop:'epic'},{coins:300},{pp:150},{drop:'mythic'},{chromos:800},{gems:25},{drop:'season'},{pp:200},{drop:'sbox'},
 {coins:300},{drop:'season'},{pp:200},{chromos:900},{gems:15},{drop:'season'},{coins:400},{drop:'rbox'},{pp:250},{chromos:1100},
 {drop:'mythic'},{gems:20},{drop:'season'},{coins:500},{drop:'legendary',n:3}];
const PASS_PREM=[{skin:'ember'},{gems:10},{drop:'season'},{coins:300},{pin:'comet'},{pp:150},{chromos:600},{skin:'bolt'},{drop:'mythic'},{gems:20},
 {coins:400},{drop:'rbox'},{pp:200},{chromos:800},{skin:'pip'},{drop:'season',n:2},{drop:'sbox'},{pin:'galaxy'},{coins:500},{drop:'legendary'},
 {pp:250},{skin:'woodrow'},{chromos:1000},{drop:'mythic'},{drop:'rbox'},{coins:600},{drop:'legendary'},{skin:'zenith'},{drop:'ultra'},{drop:'season',n:2},
 {drop:'rbox'},{gems:30},{pin:'nebula'},{chromos:1200},{drop:'sbox'},{coins:700},{drop:'legendary'},{pin:'meteorshower'},{drop:'season',n:2},{drop:'rbox'},
 {gems:40},{drop:'ultra'},{pin:'supernova'},{drop:'season',n:3},{rumbler:'orion'}];
const passTier=xp=>Math.min(PASS_TIERS,Math.floor(xp/PASS_STEP));
const bonusAvail=xp=>Math.max(0,Math.floor((xp-PASS_TIERS*PASS_STEP)/PASS_BONUS_STEP));

/* ---------- Profile customization: banners, frames, titles, name colors ---------- */
const RB_LINE='#ff5d57,#ffb000,#ffe66b,#6be39a,#46b4ff,#9d7bff,#ff5ad1';
const isMaster=()=>(S.rankPeak|0)>=RANK_STEPS-1;
const PF_BANNERS=[
 {id:'b_sky',name:'Sky',css:'linear-gradient(135deg,#1f3b8f,#46b4ff)'},
 {id:'b_sunset',name:'Sunset',css:'linear-gradient(135deg,#c4366f,#ff5e87 45%,#ffb000)'},
 {id:'b_mint',name:'Mint',css:'linear-gradient(135deg,#0f4b5c,#2de0b0)'},
 {id:'b_grape',name:'Grape',css:'linear-gradient(135deg,#2a1458,#b56cff)'},
 {id:'b_city',name:'Rooftops',css:'linear-gradient(180deg,#1b1546 0%,#3a2d7a 55%,#ff8a5c 100%)',ok:()=>S.best>=250,how:'Reach 250 trophies'},
 {id:'b_robo',name:'Circuit',css:'repeating-linear-gradient(90deg,transparent 0 22px,rgba(70,224,255,.35) 22px 24px),repeating-linear-gradient(0deg,transparent 0 22px,rgba(70,224,255,.25) 22px 24px),linear-gradient(135deg,#0b1a2e,#123a5a)',ok:()=>(S.st.sims|0)>=1,how:'Run a simulation'},
 {id:'b_secret',name:'Mystery',css:'repeating-linear-gradient(45deg,#1b1046 0 12px,#2a1a66 12px 24px)',ok:()=>secretsFound()>=5,how:'Find 5 secrets'},
 {id:'b_pumpkin',name:'Pumpkin Patch',css:'radial-gradient(circle at 80% 20%,#ffe9a8 0 10px,transparent 11px),linear-gradient(180deg,#1a0f08,#5a2a08 60%,#ff8a1f)',ok:()=>(S.hw.knocked|0)>=10,how:'Knock on 10 Halloween doors'},
 {id:'b_lava',name:'Lava',css:'radial-gradient(circle at 30% 130%,#ffd23f,#ff3b5c 45%,#3a0a14 100%)',ok:()=>S.best>=1000,how:'Reach 1,000 trophies'},
 {id:'b_galaxy',name:'Galaxy',css:'radial-gradient(circle at 18% 30%,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle at 72% 62%,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle at 46% 84%,#fffa 0 1px,transparent 2px),radial-gradient(circle at 88% 18%,#fffa 0 1px,transparent 2px),linear-gradient(135deg,#0b0b2e,#3b1f6b 60%,#7a3fb5)',ok:()=>passTier(S.pass.xp|0)>=20,how:'Reach Rumble Pass tier 20'},
 {id:'b_exclusive',name:'Exclusive',css:'linear-gradient(135deg,#053a30,#1a9c80 55%,#7dffd9)',ok:()=>exCount()>=3,how:'Earn 3 exclusive skins'},
 {id:'b_gold',name:'Gold Rush',css:'linear-gradient(135deg,#7a4a00,#ffd23f 50%,#fff3a6)',ok:()=>S.best>=3000,how:'Reach 3,000 trophies'},
 {id:'b_solar',name:'Solar Flare',css:'radial-gradient(circle at 80% 30%,#fffbe6 0 8%,#ffd23f 12%,#ff8a1f 34%,#c4366f 66%,#3a0a24)',ok:()=>solDone(5),how:'Finish Solar level 5'},
 {id:'b_rainbow',name:'Rainbow',css:'linear-gradient(135deg,'+RB_LINE+')',ok:isMaster,how:'Reach Master in ranked'}];
const PF_FRAMES=[
 {id:'f_none',name:'None',css:''},
 {id:'f_silver',name:'Silver',css:'linear-gradient(135deg,#ffffff,#9aa3c7)'},
 {id:'f_sun',name:'Sunny',css:'linear-gradient(135deg,#fff3a6,#ffd23f)'},
 {id:'f_gold',name:'Gold',css:'linear-gradient(135deg,#fff3a6,#ffb000 50%,#a86b00)',glow:'#ffb000',ok:()=>S.best>=1000,how:'Reach 1,000 trophies'},
 {id:'f_flame',name:'Flame',css:'linear-gradient(0deg,#ff3b5c,#ff8a1f 50%,#ffd23f)',glow:'#ff6a00',ok:()=>(S.wins|0)>=50,how:'Win 50 matches'},
 {id:'f_pumpkin',name:'Pumpkin',css:'repeating-linear-gradient(45deg,#ff8a1f 0 6px,#1a0f08 6px 12px)',ok:()=>ownsSkinTier('halloween'),how:'Get a Halloween skin'},
 {id:'f_secret',name:'Mystery',css:'linear-gradient(135deg,#d6b8ff,#8a5cf5 50%,#1b1046)',glow:'#8a5cf5',ok:()=>secretsFound()>=10,how:'Find 10 secrets'},
 {id:'f_star',name:'Starfall',css:'linear-gradient(135deg,#7ad7ff,#ffffff 45%,#ffd23f)',glow:'#7ad7ff',ok:()=>passTier(S.pass.xp|0)>=30,how:'Reach Rumble Pass tier 30'},
 {id:'f_exclusive',name:'Exclusive',css:'linear-gradient(135deg,#c8fff0,#2de0b0 50%,#0b5a4a)',glow:'#2de0b0',ok:()=>exCount()>=5,how:'Earn 5 exclusive skins'},
 {id:'f_diamond',name:'Diamond',css:'linear-gradient(135deg,#e8fbff,#7ad7ff 30%,#ffffff 55%,#46b4ff)',glow:'#9be8ff',ok:()=>S.best>=3000,how:'Reach 3,000 trophies'},
 {id:'f_solar',name:'Sunburst',css:'conic-gradient(#ffd23f,#ff8a1f,#fff3a6,#ffb000,#ff5e87,#ffd23f)',glow:'#ffb000',ok:()=>solDone(7),how:'Finish Solar level 7'},
 {id:'f_rainbow',name:'Rainbow',css:'conic-gradient('+RB_LINE+',#ff5d57)',glow:'#ff5ad1',ok:isMaster,how:'Reach Master in ranked'}];
const PF_TITLES=[
 {id:'t_rookie',name:'Rookie'},{id:'t_runner',name:'Rooftop Runner'},{id:'t_friendly',name:'Good Sport'},
 {id:'t_hunter',name:'Trophy Hunter',ok:()=>S.best>=1000,how:'Reach 1,000 trophies'},
 {id:'t_breaker',name:'Box Breaker',ok:()=>((S.st.drops&&S.st.drops.rbox)|0)>=5,how:'Open 5 Rumbler Boxes'},
 {id:'t_secret',name:'Secret Keeper',ok:()=>secretsFound()>=5,how:'Find 5 secrets'},
 {id:'t_director',name:'Director',ok:()=>(S.st.sims|0)>=10,how:'Run 10 simulations'},
 {id:'t_buff',name:'Movie Buff',ok:()=>(S.st.replays|0)>=5,how:'Watch 5 replays'},
 {id:'t_knocker',name:'Door Knocker',ok:()=>(S.hw.knocked|0)>=100,how:'Knock on 100 Halloween doors'},
 {id:'t_collector',name:'Collector',ok:()=>Object.keys(S.owned).length>=20,how:'Unlock 20 rumblers'},
 {id:'t_lone',name:'Last One Standing',ok:()=>(S.st.sdWins|0)>=10,how:'Finish 1st in Solo Showdown 10 times'},
 {id:'t_king',name:'Takedown King',ok:()=>(S.st.kills|0)>=500,how:'Get 500 takedowns'},
 {id:'t_marathon',name:'Marathoner',ok:()=>stMatches()>=300,how:'Play 300 matches'},
 {id:'t_pass',name:'Pass Master',ok:()=>passTier(S.pass.xp|0)>=45,how:'Reach Rumble Pass tier 45'},
 {id:'t_trend',name:'Trendsetter',ok:()=>exCount()>=5,how:'Earn 5 exclusive skins'},
 {id:'t_legend',name:'Legend',ok:()=>S.best>=3000,how:'Reach 3,000 trophies'},
 {id:'t_master',name:'Master',ok:isMaster,how:'Reach Master in ranked'},
 {id:'t_spark',name:'Spark',ok:()=>solDone(1),how:'Finish Solar level 1'},{id:'t_sun',name:'Sun Chaser',ok:()=>solDone(3),how:'Finish Solar level 3'},{id:'t_eclipse',name:'Eclipse',ok:()=>solDone(9),how:'Finish Solar level 9'},{id:'t_fame',name:'Solar Fame',ok:()=>solDone(SOLAR_MAX),how:'Finish Solar Fame'},{id:'t_soldar',name:'Soldar',ok:()=>(S.sol|0)>SOLAR_STEPS,how:'Reach Soldar'}];
const GRAD_TXT=g=>'background:'+g+';-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 2px 0 rgba(0,0,0,.55))';
const PF_NCOLS=[
 {id:'n_white',name:'White',css:'color:#ffffff'},{id:'n_sun',name:'Sunny',css:'color:#ffd23f'},{id:'n_pink',name:'Pink',css:'color:#ff8ad8'},{id:'n_sky',name:'Sky',css:'color:#8fdcff'},
 {id:'n_mint',name:'Mint',css:'color:#2de0b0',ok:()=>exCount()>=1,how:'Earn an exclusive skin'},
 {id:'n_pumpkin',name:'Pumpkin',css:'color:#ff8a1f;text-shadow:0 0 8px rgba(255,106,0,.7),0 2px 0 #000',ok:()=>ownsSkinTier('halloween'),how:'Get a Halloween skin'},
 {id:'n_fire',name:'Fire',css:GRAD_TXT('linear-gradient(0deg,#ff3b5c,#ff8a1f 50%,#ffd23f)'),ok:()=>(S.wins|0)>=50,how:'Win 50 matches'},
 {id:'n_ghost',name:'Ghost Green',css:'color:#7dffb0;text-shadow:0 0 10px #2bd46a,0 2px 0 #000',ok:()=>hasSkin('dark','hw_grim'),how:'Get Grim Dark'},
 {id:'n_gold',name:'Gold',css:GRAD_TXT('linear-gradient(180deg,#fff3a6,#ffb000 60%,#c47a00)'),ok:()=>S.best>=2000,how:'Reach 2,000 trophies'},
 {id:'n_rainbow',name:'Rainbow',css:GRAD_TXT('linear-gradient(90deg,'+RB_LINE+')'),ok:()=>isMaster()||hasSkin('dark','hw_surged'),how:'Reach Master or get Surged Dark'},
 {id:'n_solar',name:'Solar',css:GRAD_TXT('linear-gradient(180deg,#fffbe6,#ffd23f 45%,#ff8a1f)'),ok:()=>solDone(6),how:'Finish Solar level 6'},
 {id:'n_fame',name:'Fame',css:GRAD_TXT('linear-gradient(90deg,#ffd23f,#ff8a1f,#ff5e87,#ffd23f)'),ok:()=>solDone(SOLAR_MAX),how:'Finish Solar Fame'},
 {id:'n_soldar',name:'Soldar',css:'background:linear-gradient(90deg,#ffd23f,#ff6a00,#ff3b5c,#2a0a12,#ffd23f);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 2px 0 rgba(0,0,0,.6));animation:soldarName 3s linear infinite',ok:()=>(S.sol|0)>SOLAR_STEPS,how:'Reach Soldar'}];
const PF_KINDS={banner:PF_BANNERS,frame:PF_FRAMES,title:PF_TITLES,ncol:PF_NCOLS};
const PF_DEF={banner:'b_sky',frame:'f_none',title:'t_rookie',ncol:'n_white'};
const pfItem=(k,id)=>PF_KINDS[k].find(x=>x.id===id)||PF_KINDS[k].find(x=>x.id===PF_DEF[k]);
/* ---------- Rumble Drops ---------- */
const DROP_RAR=['rare','epic','mythic','legendary','ultra'];
/* A drop starts at Rare (or the pass's guaranteed rarity). Each tap has this chance to upgrade one step. */
const DROP_UP=[.55,.35,.12,.05];
const DROP_ODDS=[45,35.75,16.94,2.19,.12]; // final rarity odds for a drop that starts at Rare
const DROP_LOOT={
 rare:[['coins',45,[40,80]],['pp',35,[20,40]],['chromos',19,[50,100]],['gems',1,[3,5]]],
 epic:[['coins',38,[150,250]],['pp',32,[80,140]],['chromos',26,[250,400]],['gems',2,[5,10]],['rumbler',2,['rare']]],
 mythic:[['coins',32,[400,650]],['pp',28,[200,320]],['chromos',30,[800,1200]],['gems',3,[10,20]],['skin',4],['rumbler',3,['rare','epic']]],
 legendary:[['coins',22,[900,1400]],['pp',20,[450,700]],['chromos',38,[2000,3000]],['gems',5,[25,40]],['skin',7],['rumbler',8,['epic','mythic']]],
 ultra:[['chromos',50,[6000,8000]],['coins',20,[2500,3500]],['gems',8,[60,80]],['skin',10],['rumbler',12,['mythic','legendary','ultra']]],
};
const WIN_DROPS_PER_DAY=5;
/* Lucky win drops: sometimes a daily win drop comes with a guaranteed rarity (chance in %) */
const WIN_DROP_LUCKY=[['season',.1],['ultra',.2],['legendary',1],['mythic',3],['epic',8]];

const ORD=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'];

/* Daily rumbler offer: 50% off in chromos, or a set price in gems, coins or power points */
const OFFER_GEMS={rare:30,epic:60,mythic:100,legendary:150,ultra:250};
function offerPrices(b){const ch=RARITY[b.rarity].chromos;return[['chromos',Math.round(ch*.5)],['gems',OFFER_GEMS[b.rarity]],['coins',ch],['pp',Math.round(ch*.8)]];}
MODE_ICON.duo=MODE_ICON.showdown.replace('</svg>','<circle cx="38" cy="38" r="9" fill="#ff5e87" stroke="#120f26" stroke-width="2.5"/><text x="38" y="42.5" text-anchor="middle" font-family="Bungee,Impact,sans-serif" font-size="12" fill="#fff">2</text></svg>');
MODE_ICON.trio=MODE_ICON.showdown.replace('</svg>','<circle cx="38" cy="38" r="9" fill="#ffc93c" stroke="#120f26" stroke-width="2.5"/><text x="38" y="42.5" text-anchor="middle" font-family="Bungee,Impact,sans-serif" font-size="12" fill="#120f26">3</text></svg>');
/* Team showdown spawn spots: indexes into the map's free-for-all points */
const SD_WIN_PLACES=3,STAR_PLAYER_TROPHIES=5;
const SD_ANCHORS={5:[0,2,3,4,6],4:[0,2,5,7]};

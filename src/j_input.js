
/* ---------- Sound (synthesized, starts after the first tap) ---------- */
let AC=null,SFXU=null;const sfxLast={};
function ensureAC(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}if(AC.state==='suspended'){try{AC.resume();}catch(e){}}return AC;}
function audio(){if(!S.sound)return null;return ensureAC();}
/* ---------- Lobby music: an original bouncy loop, synthesized live ---------- */
const MUS={gain:null,next:0,step:0,on:false,song:null};
const mhz=n=>440*Math.pow(2,(n-69)/12),_=null;
/* Lobby tracks. Each: tempo, 8 bars of chords, a lead (written or arpeggiated) and a drum feel. */
const SONGS=[
 {id:'bounce',name:'Rooftop Bounce',bpm:118,ch:[[48,52,55],[45,48,52],[41,45,48],[43,47,50],[48,52,55],[45,48,52],[41,45,48],[43,47,50]],
  lead:[[72,_,76,_,79,_,76,_,72,_,74,_,76,_,_,_],[72,_,69,_,72,_,76,_,74,_,72,_,69,_,_,_],[69,_,72,_,77,_,76,_,74,_,72,_,74,_,76,_],[79,_,_,_,77,_,76,_,74,_,_,_,71,_,74,_],
   [76,_,79,_,84,_,79,_,76,_,79,_,81,_,79,_],[76,_,72,_,69,_,72,_,76,_,77,_,76,_,74,_],[72,_,_,77,_,_,76,_,74,_,72,_,74,_,77,_],[79,_,77,_,74,_,71,_,74,_,_,_,67,_,_,_]],
  leadWave:'triangle',kick:[0,6,8],snare:[4,12],hat:2,bass:[0,3,6,8,10,14],stab:[2,6,10,14],vol:1},
 {id:'neon',name:'Neon Night',bpm:100,ch:[[45,48,52],[41,45,48],[48,52,55],[43,47,50],[45,48,52],[41,45,48],[48,52,55],[43,47,50]],
  arp:[0,1,2,1,0,2,1,2],arpUp:24,lead:[[76,_,_,_,_,_,74,_,72,_,_,_,71,_,72,_],_,[79,_,_,_,77,_,76,_,_,_,74,_,72,_,_,_],_,[81,_,_,_,79,_,76,_,_,_,79,_,77,_,76,_],_,[72,_,74,_,76,_,79,_,_,_,77,_,76,_,74,_],[71,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]],
  leadWave:'sawtooth',leadVol:.06,kick:[0,8,10],snare:[4,12],hat:1,bass:[0,2,4,6,8,10,12,14],stab:[],vol:.9},
 {id:'sunny',name:'Sunny Skies',bpm:136,ch:[[43,47,50],[50,54,57],[40,43,47],[48,52,55],[43,47,50],[50,54,57],[40,43,47],[48,52,55]],
  lead:[[79,_,79,_,81,_,83,_,_,_,81,_,79,_,_,_],[78,_,_,_,74,_,78,_,81,_,_,_,78,_,_,_],[76,_,79,_,83,_,_,_,81,_,79,_,76,_,_,_],[72,_,76,_,79,_,81,_,79,_,76,_,74,_,_,_],
   [83,_,83,_,84,_,86,_,_,_,84,_,83,_,_,_],[81,_,78,_,74,_,78,_,81,_,83,_,81,_,_,_],[79,_,_,_,76,_,79,_,83,_,_,_,79,_,_,_],[81,_,79,_,76,_,74,_,79,_,_,_,_,_,_,_]],
  leadWave:'square',leadVol:.07,kick:[0,4,8,12],snare:[4,12],hat:2,bass:[0,4,8,12],stab:[2,6,10,14],vol:.85},
 {id:'chill',name:'Chill Breeze',bpm:84,ch:[[41,45,48,52],[40,43,47,50],[38,41,45,48],[48,52,55,59],[41,45,48,52],[40,43,47,50],[38,41,45,48],[48,52,55,59]],
  lead:[[_,_,72,_,_,_,69,_,_,_,72,_,74,_,_,_],[_,_,71,_,_,_,67,_,_,_,_,_,_,_,_,_],[_,_,69,_,72,_,_,_,74,_,72,_,_,_,69,_],[_,_,67,_,_,_,_,_,_,_,_,_,_,_,_,_],
   [_,_,76,_,_,_,72,_,_,_,74,_,76,_,_,_],[_,_,74,_,_,_,71,_,_,_,67,_,_,_,_,_],[_,_,72,_,74,_,_,_,77,_,76,_,_,_,74,_],[_,_,72,_,_,_,_,_,_,_,_,_,_,_,_,_]],
  leadWave:'sine',leadVol:.16,kick:[0,10],snare:[8],hat:4,bass:[0,10],stab:[0,8],stabWave:'triangle',stabVol:.035,stabLen:5,vol:1},
 /* Halloween: a spooky minor-key tune with a creepy organ arp */
 {id:'spooky',name:'Spooky Rooftops',bpm:112,ch:[[45,48,52],[41,45,48],[44,47,50],[45,48,52],[45,48,52],[50,53,57],[44,47,52],[45,48,51]],
  arp:[0,2,1,2,0,2,1,2],arpUp:24,
  lead:[[69,_,72,_,76,_,75,_,76,_,_,_,72,_,_,_],[77,_,76,_,72,_,_,_,69,_,_,_,_,_,_,_],[71,_,74,_,77,_,_,_,76,_,74,_,71,_,_,_],[69,_,_,_,64,_,_,_,69,_,_,_,_,_,_,_],
   [81,_,_,80,81,_,_,_,76,_,_,_,72,_,_,_],[74,_,77,_,81,_,_,_,79,_,77,_,74,_,_,_],[76,_,_,_,71,_,74,_,76,_,80,_,_,_,_,_],[81,_,_,_,_,_,_,_,69,_,_,_,_,_,_,_]],
  leadWave:'triangle',leadVol:.12,kick:[0,7,8],snare:[4,12],hat:2,bass:[0,3,6,8,11,14],stab:[],vol:.95}];
const MSONG=()=>MUS.song||SONGS[0];
function mNote(type,f,t,dur,vol){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+dur+.05);}
function mHit(t,dur,vol,freq,hp){const a=AC;if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*.6,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=noiseBuf;f.type=hp?'highpass':'bandpass';f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(MUS.gain);s.start(t);s.stop(t+dur+.02);}
function mKick(t){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.14);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+.2);}
function mStep(i,t){const so=MSONG(),st=60/so.bpm/4,bar=Math.floor(i/16)%8,s=i%16,ch=so.ch[bar];
  if(so.kick.includes(s))mKick(t);if(so.snare.includes(s))mHit(t,.14,.2,1800);if(s%so.hat===0)mHit(t,.04,s%4===2?.08:.045,7000,true);
  if(so.bass.includes(s))mNote('triangle',mhz(ch[0]-12),t,st*1.6,.26);
  if(so.stab.includes(s))for(const n of ch)mNote(so.stabWave||'square',mhz(n+12),t,st*(so.stabLen||.9),so.stabVol||.022);
  if(so.arp)mNote('square',mhz(ch[so.arp[s%so.arp.length]%ch.length]+so.arpUp),t,st*.8,.025);
  const lb=so.lead[bar];const l=lb?lb[s]:null;if(l!=null){mNote(so.leadWave,mhz(l),t,st*1.8,so.leadVol||.13);mNote('sine',mhz(l+12),t,st*1.2,.025);}}
function pickSong(shuffle){const id=S.musicTrack||(halloweenOn()?'spooky':'bounce');if(shuffle||id==='shuffle'){const l=SONGS.filter(x=>x!==MUS.song);MUS.song=l[Math.floor(Math.random()*l.length)];}else MUS.song=SONGS.find(x=>x.id===id)||SONGS[0];MUS.step=0;}
function musicTick(){if(!AC||AC.state!=='running')return;if(!MUS.song)pickSong(false);
  if(!MUS.gain){MUS.gain=AC.createGain();MUS.gain.gain.value=0;MUS.gain.connect(AC.destination);}
  const want=!!S.music&&typeof view!=='undefined'&&view!=='game'&&!document.hidden,now=AC.currentTime;
  if(want!==MUS.on){MUS.on=want;MUS.gain.gain.cancelScheduledValues(now);MUS.gain.gain.setValueAtTime(MUS.gain.gain.value,now);MUS.gain.gain.linearRampToValueAtTime(want?.16*MSONG().vol:0,now+(want?1.2:.5));if(want){MUS.next=0;if(S.musicTrack==='shuffle')pickSong(true);}else MUS.stopAt=now+.6;}
  if(!want&&now>(MUS.stopAt||0))return;
  if(!MUS.next||MUS.next<now)MUS.next=now+.06;
  while(MUS.next<now+.3){mStep(MUS.step,MUS.next);MUS.next+=60/MSONG().bpm/4;MUS.step=(MUS.step+1)%128;if(MUS.step===0&&S.musicTrack==='shuffle')pickSong(true);}}
document.addEventListener('pointerdown',()=>{if(S.music)ensureAC();});
function tone(type,f1,f2,dur,vol,delay){const a=audio();if(!a)return;const t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f1,t0);o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.03);}
let noiseBuf=null;
function noise(dur,vol,freq){const a=audio();if(!a)return;if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*.6,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t0=a.currentTime;s.buffer=noiseBuf;f.type='lowpass';f.frequency.setValueAtTime(freq,t0);f.frequency.exponentialRampToValueAtTime(80,t0+dur);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(f);f.connect(g);g.connect(a.destination);s.start(t0);s.stop(t0+dur+.02);}
const NEAR=['shoot','tick','swish','flame','lob','zap','laser','splash','bass','crack'];
function sfx(n){
  if(NETS){if(M&&M.netEv&&M.netEv.length<40)M.netEv.push(['s',n,SFXU&&SFXU.id||0]);return;}
  if(!S.sound)return;const now=performance.now();if(sfxLast[n]&&now-sfxLast[n]<70)return;
  if(NEAR.includes(n)&&M&&P&&SFXU&&SFXU!==P&&dist(SFXU.x,SFXU.y,P.x,P.y)>420)return;
  sfxLast[n]=now;const me=SFXU===P;
  switch(n){
    case 'shoot':tone('square',me?620:480,220,.07,me?.05:.025);break;
    case 'tick':tone('square',900,500,.04,me?.04:.02);break;
    case 'laser':tone('sawtooth',1200,300,.12,me?.05:.025);break;
    case 'flame':noise(.12,me?.08:.04,2400);break;
    case 'swish':noise(.09,me?.07:.035,4200);break;
    case 'lob':tone('sine',300,520,.12,me?.06:.03);break;
    case 'zap':tone('sawtooth',1500,200,.1,me?.05:.025);noise(.06,.03,6000);break;
    case 'splash':noise(.2,me?.07:.035,1400);break;
    case 'bass':tone('sine',140,50,.22,me?.14:.07);break;
    case 'crack':noise(.1,.06,3000);tone('square',260,120,.06,.03);break;
    case 'boom':noise(.32,.14,900);tone('sine',120,40,.3,.12);break;
    case 'bigboom':noise(.55,.2,700);tone('sine',90,30,.5,.18);break;
    case 'super':tone('sawtooth',220,880,.25,.05);tone('sine',440,1320,.3,.05,.05);break;
    case 'ready':tone('sine',660,660,.08,.06);tone('sine',990,990,.12,.06,.08);break;
    case 'gadget':tone('triangle',500,1000,.15,.07);break;
    case 'shotgun':noise(.28,.22,2600);tone('square',160,50,.2,.1);break;
    case 'mark':tone('square',880,880,.06,.05);tone('square',660,660,.06,.05,.08);tone('square',880,880,.06,.05,.16);break;
    case 'build':noise(.12,.08,900);noise(.12,.08,900);tone('triangle',200,300,.15,.06,.1);break;
    case 'freeze':noise(.3,.06,7000);tone('sine',1400,800,.25,.03);break;
    case 'pop':tone('sine',700,200,.12,.06);break;
    case 'thud':tone('sine',180,45,.28,.13);noise(.14,.08,500);break;
    case 'ko':tone('sawtooth',400,80,.5,.08);break;
    case 'pickup':tone('sine',880,1320,.1,.06);break;
    case 'score':tone('triangle',660,990,.12,.07);tone('triangle',990,1480,.15,.07,.1);break;
    case 'pin':tone('sine',1000,1200,.07,.05);break;
    case 'go':tone('square',523,523,.1,.06);tone('square',784,784,.2,.06,.12);break;
    case 'win':[523,659,784,1047].forEach((f,i)=>tone('triangle',f,f,.25,.07,i*.12));break;
    case 'lose':[392,330,262].forEach((f,i)=>tone('triangle',f,f*.95,.3,.06,i*.16));break;
    case 'draw':tone('triangle',440,440,.3,.06);break;
    case 'click':tone('sine',800,600,.04,.04);break;
    case 'buy':tone('triangle',700,1400,.12,.07);tone('sine',1400,1400,.15,.05,.1);break;
    case 'unlock':[523,659,784,1047,1319].forEach((f,i)=>tone('triangle',f,f,.3,.07,i*.09));break;
  }
}

/* ---------- Input ---------- */
function pt(e){const r=canvas.getBoundingClientRect();if(ROT)return{x:e.clientY-r.top,y:r.right-e.clientX};return{x:e.clientX-r.left,y:e.clientY-r.top};}
function fireAtMouse(kind){
  if(!P||P.dead)return;const[wx,wy]=toWorld(mouse.x,mouse.y),a=Math.atan2(wy-P.y,wx-P.x),d=dist(P.x,P.y,wx,wy);
  kind==='atk'?tryAttack(P,a,d):trySuper(P,a,d);
}
function release(kind,o){
  if(!P||P.dead||!M)return;
  const dx=o.x-o.sx,dy=o.y-o.sy,l=Math.hypot(dx,dy);let a,d;
  if(o.drag&&l<AIM_CANCEL_R){textFx(P.x,P.y-P.rad-36,kind==='sup'?'Super cancelled':'Cancelled','#d6d3ea',12);return;}
  if(!o.drag){[a,d]=autoAim(P,kind);}
  else{const spec=kind==='atk'?P.b.atk:P.b.sup;a=Math.atan2(dy,dx)-WA;d=(spec.range||spec.radius||300)*clamp(l/70,.15,1);}
  kind==='atk'?tryAttack(P,a,d):trySuper(P,a,d);
}
canvas.addEventListener('pointerdown',e=>{
  if(!M||paused)return;if(isWatching()){watchNext();return;}audio();const p=pt(e);
  if(e.pointerType==='mouse'){mouseMode=true;mouse.x=p.x;mouse.y=p.y;mouse.has=true;if(e.button===0)fireAtMouse('atk');else if(e.button===2)fireAtMouse('sup');e.preventDefault();return;}
  touchUI=true;mouseMode=false;mouse.has=false;
  const L=layout();
  if(P&&P.gadget&&dist(p.x,p.y,L.gx,L.gy)<36){useGadget(P);e.preventDefault();return;}
  const o={id:e.pointerId,sx:p.x,sy:p.y,x:p.x,y:p.y,drag:false};
  if(!ctl.sup&&dist(p.x,p.y,L.sx,L.sy)<50)ctl.sup=o;
  else if(!ctl.atk&&p.x>W*.5)ctl.atk=o;
  else if(!ctl.move){o.ox=p.x;o.oy=p.y;ctl.move=o;}
  else return;
  try{canvas.setPointerCapture(e.pointerId);}catch(err){}
  e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
  const p=pt(e);
  if(e.pointerType==='mouse'){mouse.x=p.x;mouse.y=p.y;mouse.has=true;if(M&&!touchUI)mouseMode=true;return;}
  for(const k of['move','atk','sup']){const o=ctl[k];if(!o||o.id!==e.pointerId)continue;o.x=p.x;o.y=p.y;
    if(k==='move'){const dx=o.x-o.ox,dy=o.y-o.oy,l=Math.hypot(dx,dy);if(l>64){o.ox=o.x-dx/l*64;o.oy=o.y-dy/l*64;}}
    else if(Math.hypot(o.x-o.sx,o.y-o.sy)>14)o.drag=true;}
});
function endPointer(e,cancel){for(const k of['move','atk','sup']){const o=ctl[k];if(!o||o.id!==e.pointerId)continue;ctl[k]=null;if(!cancel&&k!=='move')release(k,o);}}
canvas.addEventListener('pointerup',e=>endPointer(e,false));
canvas.addEventListener('pointercancel',e=>endPointer(e,true));
canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')mouse.has=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{if(view==='game'&&isWatching())return;
  if(view!=='game'||!M)return;const k=e.key.toLowerCase();
  if(k==='escape'||k==='p'){setPaused(!paused);return;}
  if(paused)return;
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys.add(k);touchUI=false;e.preventDefault();}
  if((k==='e'||k===' ')&&!e.repeat){e.preventDefault();if(mouseMode&&mouse.has)fireAtMouse('sup');else{const[a,d]=autoAim(P,'sup');trySuper(P,a,d);}}
  if(k==='f'&&!e.repeat){const[a,d]=autoAim(P,'atk');tryAttack(P,a,d);}
  if(k==='q'&&!e.repeat)useGadget(P);
  if(/^[1-8]$/.test(k)&&!e.repeat){const l=pinList();const id=l[+k-1];if(id)sendPin(P,id);}
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());

/* pins */
function pinList(){const id=P&&P.b?P.b.id:S.selected,me=S.owned[id],fp=me&&me.facePins||[];const l=PIN_FACES.map((f,k)=>fp[k]&&S.pins.includes(fp[k])&&pinAllowedFor(fp[k],id)?'b:'+fp[k]:'r:'+id+':'+f[0]);
  const slots=S.customPins||[null,null],fall=['b:gg','b:thumb'];slots.forEach((s,k)=>l.push(s&&(S.pins.includes(s)||BASIC_PINS.some(p=>p[0]===s))&&!pinPersonal(s)?'b:'+s:fall[k]));return l;}
const pinBtn=$('#pinBtn'),pinPick=$('#pinPick');
pinBtn.addEventListener('click',()=>{if(!M)return;if(!pinPick.hidden){pinPick.hidden=true;return;}pinPick.innerHTML='';
  const ids=pinList(),rows=[ids.slice(0,3),ids.slice(3)];rows.forEach((row,r)=>{const d=document.createElement('div');d.className='pp-row'+(r?' custom':'');
    for(const id of row){const b=document.createElement('button');b.className='pinopt';b.append(pinCanvas(id,44));b.setAttribute('aria-label','Send pin');b.addEventListener('click',()=>{sendPin(P,id);pinPick.hidden=true;});d.append(b);}pinPick.append(d);});
  pinPick.hidden=false;});
function sendQuickChat(i){if(!M||!P||P.dead||!QUICK_CHAT[i])return;if(NETC){netAct('qc',null,null,String(i));return;}if((P.qcCd||0)>M.now)return;P.say={txt:QUICK_CHAT[i],at:M.now};P.qcCd=M.now+2.5;sfx('pin');}

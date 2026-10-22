
/* ---------- Rendering ---------- */
const gameEl=$('#game'),canvas=$('#world'),ctx=canvas.getContext('2d');
let W=1,H=1,dpr=1;
const cam={x:MW/2,y:MH*.75,zoom:1,sx:0,sy:0};
let ROT=false,LANDW=false,WA=0;
/* Landscape on a phone: the battlefield is turned sideways so you see exactly what portrait shows (same zoom, same distance ahead), just on a wide screen. Your team attacks to the right. */
const curWA=()=>(LANDW&&touchUI&&!mouseMode)?Math.PI/2:0;
function upr(c,x,y){if(WA){c.translate(x,y);c.rotate(-WA);c.translate(-x,-y);}}
function upP(ox,oy,x,y){if(!WA)return[x,y];const dx=x-ox,dy=y-oy;return[ox-dy,oy+dx];}
const s2w=(x,y)=>WA?[y,-x]:[x,y];
/* Screen setting: Auto / Portrait / Landscape. Tries a real orientation lock first; if the phone or app won't allow it, the match view is turned sideways instead. */
function applyOrient(){const want=S.orient||'auto';
  try{const so=screen.orientation;if(so){if(want==='auto'){if(so.unlock)so.unlock();}else if(so.lock){const p=so.lock(want);if(p&&p.catch)p.catch(()=>{});}}}catch(e){}
  const land=innerWidth>innerHeight,rot=view==='game'&&want!=='auto'&&(want==='landscape')!==land;
  ROT=rot;document.body.classList.toggle('rot-game',rot);if(rot){gameEl.style.width=innerHeight+'px';gameEl.style.height=innerWidth+'px';}else{gameEl.style.width='';gameEl.style.height='';}}
function resize(){if(typeof S!=='undefined'&&S)try{applyOrient();}catch(e){}const r={width:gameEl.offsetWidth||gameEl.getBoundingClientRect().width,height:gameEl.offsetHeight||gameEl.getBoundingClientRect().height};W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);LANDW=W>H&&H<600;cam.zoom=clamp(LANDW?Math.min(W/820,H/520):Math.min(W/520,H/820),.5,1.6);}
function toWorld(sx,sy){const[dx,dy]=s2w((sx-W/2)/cam.zoom,(sy-H/2)/cam.zoom);return[dx+cam.x,dy+cam.y];}
function camera(dt,snap){
  if(M&&M.followU){if(M.followU.dead){const nx=M.units.find(u=>!u.dead&&!u.shadow);if(nx&&M.now-(M.followDeadT||0)>2.5){M.followU=nx;}else if(!M.followDeadT||M.now-M.followDeadT>3)M.followDeadT=M.now;}P=M.followU;}
  if(!P)return;let f=P;if(P.dead&&M&&M.mode.sd){const m=M.units.find(o=>o.team===MYT&&!o.dead&&!o.shadow);if(m)f=m;}const sp0=P.spawn||[P.x,P.y],tx=f.dead?sp0[0]:f.x,ty=f.dead?sp0[1]:f.y;
  const k=snap?1:Math.min(1,dt*8);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
  WA=curWA();const vw=(WA?H:W)/cam.zoom,vh=(WA?W:H)/cam.zoom;
  cam.x=vw<MW+40?clamp(cam.x,vw/2-20,MW-vw/2+20):MW/2;
  cam.y=vh<MH+40?clamp(cam.y,vh/2-60,MH-vh/2+60):MH/2;
  const s=M?M.shake:0;cam.sx=s?rand(-s,s):0;cam.sy=s?rand(-s,s):0;
}
const add=c=>{c.globalCompositeOperation='lighter';},norm=c=>{c.globalCompositeOperation='source-over';};
function crate(c,x,y,cc,rr){
  const v=((cc*13+rr*7)%3);
  c.fillStyle='rgba(8,6,22,.35)';c.fillRect(x+4,y+TILE-6,TILE,8);
  c.fillStyle='#6f3f2c';c.fillRect(x,y+TILE-12,TILE,12);
  c.fillStyle=v===0?'#b8714a':v===1?'#ad6843':'#c07b52';c.fillRect(x,y,TILE,TILE-12);
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+2,y+2,TILE-4,4);
  c.strokeStyle='rgba(18,15,38,.4)';c.lineWidth=1.5;c.beginPath();c.moveTo(x+4,y+13);c.lineTo(x+TILE-4,y+13);c.moveTo(x+4,y+25);c.lineTo(x+TILE-4,y+25);if(v===2){c.moveTo(x+6,y+4);c.lineTo(x+TILE-6,y+34);}c.stroke();
  c.strokeStyle=OUT;c.lineWidth=2.5;c.strokeRect(x+1.25,y+1.25,TILE-2.5,TILE-2.5);
}
function bush(c,x,y,cc,rr,t){
  const sw=Math.sin(t*1.6+cc+rr)*1.5;
  c.fillStyle='#276b3b';rrect(c,x+2,y+3,TILE-4,TILE-5,14);c.fill();
  c.fillStyle='#3f9d55';ell(c,x+15+sw,y+17,12,11);c.fill();ell(c,x+34+sw,y+21,13,12);c.fill();ell(c,x+23+sw*.5,y+35,12,9);c.fill();
  c.fillStyle='#62c27a';ell(c,x+13+sw,y+13,5,4);c.fill();ell(c,x+33+sw,y+17,5,4);c.fill();
  c.strokeStyle='#143a22';c.lineWidth=2;rrect(c,x+2,y+3,TILE-4,TILE-5,14);c.stroke();
}
function drawArena(c,x0,y0,x1,y1){
  c.fillStyle='#4a3149';c.fillRect(-20,-20,MW+40,MH+40);
  c.fillStyle='#2e1f33';for(let i=-20;i<MW+20;i+=40){c.fillRect(i,-20,20,6);c.fillRect(i,MH+14,20,6);}
  c.strokeStyle=OUT;c.lineWidth=3;c.strokeRect(-20,-20,MW+40,MH+40);
  const c0=Math.max(0,Math.floor(x0/TILE)),c1=Math.min(COLS-1,Math.floor(x1/TILE)),r0=Math.max(0,Math.floor(y0/TILE)),r1=Math.min(ROWS-1,Math.floor(y1/TILE));
  for(let r=r0;r<=r1;r++)for(let cc=c0;cc<=c1;cc++){c.fillStyle=((r+cc)&1)?'#356a73':'#3a7079';c.fillRect(cc*TILE,r*TILE,TILE,TILE);if(((cc*7+r*11)%9)===0){c.fillStyle='rgba(0,0,0,.08)';c.fillRect(cc*TILE+8,r*TILE+8,12,12);}}
  c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=1;c.beginPath();for(let cc=c0;cc<=c1+1;cc++){c.moveTo(cc*TILE,r0*TILE);c.lineTo(cc*TILE,(r1+1)*TILE);}c.stroke();
  if(!M.mode.ffa){c.fillStyle='rgba(70,180,255,.1)';c.fillRect(0,MH-3*TILE,MW,3*TILE);c.fillStyle='rgba(255,93,87,.1)';c.fillRect(0,0,MW,3*TILE);}
  c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=4;c.setLineDash([22,18]);c.beginPath();c.moveTo(0,MH/2);c.lineTo(MW,MH/2);c.stroke();c.setLineDash([]);
  for(const d of M.decals){const k=d.t/d.T;c.save();c.globalAlpha=1-k*k;c.translate(d.x,d.y);c.rotate(d.rot);c.fillStyle=d.col;ell(c,0,0,d.r,d.r*.8);c.fill();c.restore();}
  for(let r=r0;r<=r1;r++)for(let cc=c0;cc<=c1;cc++){if(BUSH[r*COLS+cc])bush(c,cc*TILE,r*TILE,cc,r,M.now);}
}
function drawWalls(c,x0,y0,x1,y1){
  const c0=Math.max(0,Math.floor(x0/TILE)),c1=Math.min(COLS-1,Math.floor(x1/TILE)),r0=Math.max(0,Math.floor(y0/TILE)),r1=Math.min(ROWS-1,Math.floor(y1/TILE));
  for(let r=r0;r<=r1;r++)for(let cc=c0;cc<=c1;cc++)if(WALL[r*COLS+cc]){if(WA){c.save();upr(c,cc*TILE+TILE/2,r*TILE+TILE/2);crate(c,cc*TILE,r*TILE,cc,r);c.restore();}else crate(c,cc*TILE,r*TILE,cc,r);}
}
function drawZone(c){
  const col=M.zone===(MYT?'red':'blue')?BLUE:M.zone===(MYT?'blue':'red')?RED:M.zone==='contested'?SUNC:'#ffffff',t=M.now;
  c.save();add(c);glow(c,ZX,ZY,ZR*1.5,col,.18+.06*Math.sin(t*3));norm(c);
  c.globalAlpha=.16;c.fillStyle=col;c.beginPath();c.arc(ZX,ZY,ZR,0,TAU);c.fill();
  c.globalAlpha=.9;c.strokeStyle=col;c.lineWidth=5;c.setLineDash([18,12]);c.lineDashOffset=-t*20;c.stroke();c.setLineDash([]);
  c.globalAlpha=.3;c.lineWidth=3;c.beginPath();c.arc(ZX,ZY,ZR*.45,0,TAU);c.stroke();c.restore();
  if(M.zone!=='empty'&&Math.random()<.5)addFx({k:'spark',x:ZX+rand(-ZR,ZR)*.8,y:ZY+rand(-ZR,ZR)*.8,vx:0,vy:-60,t:0,T:.8,s:2.2,col});
}
function drawModeObjects(c){
  const id=M.mode.id,t=M.now;
  if(id==='ring')drawZone(c);
  if(M.mode.sd)for(const cb of M.cubes){const bb=Math.sin(t*4+cb.ph)*3,sc=Math.min(1,cb.t*5);c.save();upr(c,cb.x,cb.y);c.translate(cb.x,cb.y-8+bb);c.scale(sc,sc);c.fillStyle='rgba(8,6,22,.35)';ell(c,0,16-bb,9,3.5);c.fill();add(c);glow(c,0,0,28,'#46b4ff',.55+.15*Math.sin(t*5+cb.ph));norm(c);drawCube(c,0,0,11);c.restore();}
  if(id==='battery'){
    (MAP.pads||[[500,1505],[500,95]]).forEach((p,i)=>{const col=i===MYT?BLUE:RED;c.save();add(c);glow(c,p[0],p[1],PAD_R*1.5,col,.25+.08*Math.sin(t*4));norm(c);
      c.fillStyle='rgba(13,10,36,.6)';c.beginPath();c.arc(p[0],p[1],PAD_R,0,TAU);c.fill();c.lineWidth=5;c.strokeStyle=col;c.setLineDash([12,8]);c.lineDashOffset=t*30;c.stroke();c.setLineDash([]);
      c.fillStyle=col;c.globalAlpha=.8;c.beginPath();c.moveTo(p[0]+4,p[1]-22);c.lineTo(p[0]-10,p[1]+3);c.lineTo(p[0]-1,p[1]+3);c.lineTo(p[0]-4,p[1]+22);c.lineTo(p[0]+10,p[1]-3);c.lineTo(p[0]+1,p[1]-3);c.closePath();c.fill();c.restore();});
    c.fillStyle='rgba(92,225,160,.08)';c.beginPath();c.arc(ZX,ZY,90,0,TAU);c.fill();
    for(const it of M.items){const b=Math.sin(t*4+it.ph)*3,s=Math.min(1,it.t*4);c.save();upr(c,it.x,it.y);c.translate(it.x,it.y-6+b);c.scale(s,s);add(c);glow(c,0,0,30,'#5ce1a0',.5);norm(c);
      rrect(c,-7,-11,14,22,4);c.fillStyle='#1d3b30';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.fillStyle='#5ce1a0';c.fillRect(-4,-4,8,12);c.fillStyle='#c9ffe6';c.fillRect(-3,-14,6,4);c.restore();}
  }
  if(id==='core')for(const s of M.cores){if(s.dead){c.fillStyle='rgba(15,10,25,.55)';ell(c,s.x,s.y+10,44,22);c.fill();continue;}
    const col=s.team===MYT?BLUE:RED,k=s.hp/s.maxHp;c.save();add(c);glow(c,s.x,s.y,90,col,.3+.15*Math.sin(t*3));norm(c);
    c.fillStyle='rgba(8,6,22,.4)';ell(c,s.x,s.y+30,44,14);c.fill();
    c.translate(s.x,s.y);c.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;c.lineTo(Math.cos(a)*38,Math.sin(a)*38);}c.closePath();c.fillStyle='#2a2560';c.fill();c.strokeStyle=OUT;c.lineWidth=3.5;c.stroke();
    c.rotate(t*.8);c.fillStyle=col;star(c,0,0,22,12,6);c.fill();c.rotate(-t*.8);c.fillStyle=s.flash>0?'#ffffff':'#fff';ell(c,0,0,9+2*Math.sin(t*6),9+2*Math.sin(t*6));c.fill();
    if(k<.66){c.strokeStyle='rgba(13,10,36,.85)';c.lineWidth=2.5;c.beginPath();c.moveTo(-20,-18);c.lineTo(-6,-4);c.lineTo(-14,10);if(k<.33){c.moveTo(18,-20);c.lineTo(8,0);c.lineTo(20,16);}c.stroke();}
    c.restore();}
  if(id==='crown'&&M.crown.live&&!M.crown.carrier){const cr=M.crown,b=Math.sin(t*3)*4;c.save();upr(c,cr.x,cr.y);add(c);glow(c,cr.x,cr.y,50,'#ffd23f',.5);norm(c);c.fillStyle='rgba(8,6,22,.35)';ell(c,cr.x,cr.y+14,16,6);c.fill();drawCrownIcon(c,cr.x,cr.y-8+b,1.1);c.restore();if(Math.random()<.3)addFx({k:'spark',x:cr.x+rand(-14,14),y:cr.y-rand(0,20),vx:0,vy:-40,t:0,T:.6,s:2,col:'#ffe27a'});}
}
function drawCrownIcon(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-14,8);c.lineTo(-16,-10);c.lineTo(-7,-2);c.lineTo(0,-14);c.lineTo(7,-2);c.lineTo(16,-10);c.lineTo(14,8);c.closePath();c.fillStyle='#ffd23f';c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();c.fillStyle='#ff4d6d';ell(c,0,1,3,3);c.fill();c.restore();}
function drawCloud(c,x,y,s,flash){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=flash?'#e8f2ff':'#5b6380';c.strokeStyle=OUT;c.lineWidth=2.5;c.beginPath();c.arc(-14,4,12,0,TAU);c.arc(0,-4,16,0,TAU);c.arc(15,4,12,0,TAU);c.rect(-14,4,29,10);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.25)';ell(c,-4,-10,8,4);c.fill();c.restore();}
function drawFields(c){
  const t=M.now;
  for(const f of M.fields){const life=Math.min(1,f.t*4,(f.dur-f.t)*3);c.save();c.globalAlpha=life;
    if(f.kind==='dam'){
      const g=c.createRadialGradient(f.x,f.y,10,f.x,f.y,f.r);g.addColorStop(0,'rgba(90,190,235,.55)');g.addColorStop(1,'rgba(40,120,190,.35)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(220,250,255,.5)';c.lineWidth=2;for(let i=0;i<3;i++){const rr=((t*30+i*f.r/3)%f.r);c.globalAlpha=life*(1-rr/f.r)*.7;c.beginPath();c.arc(f.x,f.y,rr,0,TAU);c.stroke();}c.globalAlpha=life;
      const n=Math.round(f.r/11);for(let i=0;i<n;i++){const a=i/n*TAU;c.save();c.translate(f.x+Math.cos(a)*f.r,f.y+Math.sin(a)*f.r);c.rotate(a+Math.PI/2);rrect(c,-12,-6,24,12,5);c.fillStyle=i%2?'#8a5a3b':'#a0673f';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.fillStyle='#e8c79a';ell(c,12,0,3.5,5);c.fill();c.restore();}
      if(Math.random()<.2)addFx({k:'bubble',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,t:0,T:.8,col:'#d9f6ff'});
    }else if(f.kind==='saw'){c.translate(f.x,f.y);c.rotate(t*14);c.fillStyle='#d8dbe6';c.strokeStyle=OUT;c.lineWidth=2;c.beginPath();for(let i=0;i<16;i++){const a=i*TAU/16,rr=i%2?f.r*.55:f.r*.8;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();c.fillStyle='#7a8094';ell(c,0,0,f.r*.2,f.r*.2);c.fill();
    }else if(f.kind==='paint'){c.fillStyle=f.col||'#ff5e87';c.globalAlpha=life*.55;c.beginPath();for(let i=0;i<10;i++){const a=i*TAU/10,rr=f.r*(.8+.2*Math.sin(i*2.3));c.lineTo(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr);}c.closePath();c.fill();c.globalAlpha=life*.35;c.fillStyle='#fff';ell(c,f.x-f.r*.25,f.y-f.r*.25,f.r*.2,f.r*.12);c.fill();
    }else if(f.kind==='fire'){c.globalCompositeOperation='lighter';glow(c,f.x,f.y,f.r*1.2,'#ff7a1a',.5);c.globalCompositeOperation='source-over';if(Math.random()<.25)addFx({k:'spark',x:f.x+rand(-f.r,f.r)*.6,y:f.y+rand(-f.r,f.r)*.6,vx:0,vy:-70,t:0,T:.4,s:3,col:'#ffb347'});
    }else if(f.kind==='spore'||f.kind==='mush'){const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(185,242,124,.4)');g.addColorStop(1,'rgba(120,200,90,.08)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();c.strokeStyle='rgba(185,242,124,.8)';c.lineWidth=3;c.setLineDash([10,8]);c.lineDashOffset=-t*25;c.stroke();c.setLineDash([]);
      if(f.kind==='mush')for(let i=0;i<8;i++){const a=i*TAU/8,x=f.x+Math.cos(a)*f.r*.88,y=f.y+Math.sin(a)*f.r*.88;c.fillStyle='#fff6e8';c.fillRect(x-3,y-2,6,9);c.fillStyle=i%2?'#e2543b':'#9dff6b';ell(c,x,y-3,9,6);c.fill();}
      if(Math.random()<.3)addFx({k:'bubble',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,t:0,T:.8,col:'#d9ffb0'});
    }else if(f.kind==='starzone'){
      c.globalCompositeOperation='lighter';glow(c,f.x,f.y,f.r*1.3,'#7b4bff',.3);c.globalCompositeOperation='source-over';
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(8,4,24,.85)');g.addColorStop(.55,'rgba(40,24,100,.55)');g.addColorStop(1,'rgba(120,80,255,.18)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(255,211,107,.85)';c.lineWidth=3;c.setLineDash([10,8]);c.lineDashOffset=-t*30;c.stroke();c.setLineDash([]);
      c.strokeStyle='rgba(200,180,255,.5)';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(f.x,f.y,f.r*(.3+i*.2),-t*2+i,-t*2+i+1.8);c.stroke();}
      c.fillStyle='#fff6d0';for(let i=0;i<14;i++){const a=i*2.4+t*.4,rr=f.r*(.15+((i*37)%80)/100),k=.5+.5*Math.sin(t*4+i);c.globalAlpha=life*(.4+.6*k);star(c,f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,3+k*2,1.3,4);c.fill();}c.globalAlpha=life;
      if(Math.random()<.35)addFx({k:'fallstar',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,t:0,T:.35,col:'#ffe48a'});
    }else if(f.kind==='thunder'){const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(40,50,110,.15)');g.addColorStop(1,'rgba(60,80,170,.4)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(191,230,255,.7)';c.lineWidth=3;c.setLineDash([14,10]);c.lineDashOffset=t*40;c.stroke();c.setLineDash([]);
      for(let k=0;k<f.clouds;k++){const a=t*.8+k*TAU/f.clouds,cx=f.x+Math.cos(a)*f.r*.55,cy=f.y+Math.sin(a)*f.r*.55-50;c.fillStyle='rgba(10,8,30,.25)';ell(c,cx,cy+50,34,10);c.fill();drawCloud(c,cx,cy,1.3,Math.random()<.06);}
    }else if(f.kind==='healzone'||f.kind==='reloadzone'){const col=f.kind==='healzone'?'107,227,154':'255,210,63';
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba('+col+',.35)');g.addColorStop(1,'rgba('+col+',.08)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba('+col+',.85)';c.lineWidth=3;c.setLineDash([12,8]);c.lineDashOffset=-t*30;c.stroke();c.setLineDash([]);
      if(Math.random()<.3)addFx({k:f.kind==='healzone'?'plus':'spark',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,vx:0,vy:-30,t:0,T:.8,s:2.5,col:'#ffd23f'});
    }else if(f.kind==='hole'){
      c.globalCompositeOperation='lighter';glow(c,f.x,f.y,f.r*1.2,'#7b4bff',.35);c.globalCompositeOperation='source-over';
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(5,2,15,.95)');g.addColorStop(.5,'rgba(40,20,90,.6)');g.addColorStop(1,'rgba(120,80,255,0)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(200,180,255,.6)';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.arc(f.x,f.y,f.r*(.3+i*.17),t*3+i,t*3+i+2.2);c.stroke();}
      if(Math.random()<.6){const a=rand(0,TAU);addFx({k:'spark',x:f.x+Math.cos(a)*f.r,y:f.y+Math.sin(a)*f.r,vx:-Math.cos(a)*f.r*1.6,vy:-Math.sin(a)*f.r*1.6,t:0,T:.5,s:2,col:'#c9b5ff'});}
    }else{
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(220,245,255,.45)');g.addColorStop(1,'rgba(140,200,255,.15)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(230,248,255,.7)';c.lineWidth=2;c.setLineDash([6,8]);c.lineDashOffset=-t*20;c.stroke();c.setLineDash([]);
      if(Math.random()<.7)addFx({k:'snow',x:f.x+rand(-f.r,f.r)*.8,y:f.y+rand(-f.r,f.r)*.8,t:0,T:.9});
    }
    c.restore();}
}
function drawStorm(c,x0,y0,vw,vh){
  if(!M.storm||M.storm.r>=999)return;const sf=M.storm.fill||'rgba(90,30,140,.42)',se=M.storm.edge||'rgba(220,150,255,.8)',sg=M.storm.fog||'#6a2fa0';const r=M.storm.r;
  c.save();c.beginPath();c.rect(x0-50,y0-50,vw+100,vh+100);c.arc(ZX,ZY,r,0,TAU,true);c.fillStyle=sf;c.fill('evenodd');
  c.strokeStyle=se;c.lineWidth=4;c.setLineDash([16,10]);c.lineDashOffset=M.now*25;c.beginPath();c.arc(ZX,ZY,r,0,TAU);c.stroke();c.restore();
  if(Math.random()<.8){const a=rand(0,TAU);addFx({k:'smoke',x:ZX+Math.cos(a)*(r+rand(0,60)),y:ZY+Math.sin(a)*(r+rand(0,60)),vx:0,vy:-10,t:0,T:1,s:20,col:sg});}
}
function drawAim(c){
  if(!P||P.dead||M.state!=='play')return;
  let kind=null,ang=0,frac=1,faint=false;
  const drag=o=>[Math.atan2(o.y-o.sy,o.x-o.sx)-WA,clamp(Math.hypot(o.x-o.sx,o.y-o.sy)/70,.15,1)];
  if(ctl.sup&&ctl.sup.drag){kind='sup';[ang,frac]=drag(ctl.sup);}
  else if(ctl.atk&&ctl.atk.drag){kind='atk';[ang,frac]=drag(ctl.atk);}
  else if(mouseMode&&mouse.has){kind='atk';faint=true;const[wx,wy]=toWorld(mouse.x,mouse.y);ang=Math.atan2(wy-P.y,wx-P.x);if(P.b.atk.kind==='lob')frac=clamp(dist(P.x,P.y,wx,wy)/P.b.atk.range,.1,1);}
  if(!kind)return;
  const spec=kind==='atk'?P.b.atk:P.b.sup,k=spec.kind,base=kind==='sup'?'rgba(255,201,60,':'rgba(255,255,255,',a0=faint?.12:.24,R=1+P.mods.range;
  c.save();c.fillStyle=base+a0+')';c.strokeStyle=base+(a0+.3)+')';c.lineWidth=2;
  if(['single','beam','dash','log','chain','star','chainbig','boomerang','wave','bigwave','burst'].includes(k)){const w=k==='dash'?P.rad*2:(spec.r||7)*2+8,len=k==='dash'||k==='boomerang'||k==='bigwave'?spec.range*R:rayLen(P.x,P.y,ang,spec.range*R);c.translate(P.x,P.y);c.rotate(ang);rrect(c,0,-w/2,len,w,w/2);c.fill();c.stroke();}
  else if(k==='spread'||k==='melee'||k==='shockcone'||k==='boomerang3'){const RR=(spec.range||200)*R+(k==='melee'?10:0),arc=(spec.arc||.3)+(k==='spread'?.12:0);c.beginPath();c.moveTo(P.x,P.y);c.arc(P.x,P.y,RR,ang-arc/2,ang+arc/2);c.closePath();c.fill();c.stroke();}
  else if(k==='lob'||k==='orbs'||k==='meteor'||k==='bigbomb'||k==='field'||k==='starzone'||k==='dam'){const d=(k==='dam'?spec.range:spec.range*R)*frac,tx=P.x+Math.cos(ang)*d,ty=P.y+Math.sin(ang)*d,rr=k==='field'||k==='starzone'||k==='dam'||k==='meteor'?spec.radius:spec.splash*(1+P.mods.splash);c.setLineDash([6,8]);c.beginPath();c.moveTo(P.x,P.y);c.quadraticCurveTo((P.x+tx)/2,(P.y+ty)/2-80,tx,ty);c.stroke();c.setLineDash([]);c.beginPath();c.arc(tx,ty,rr,0,TAU);c.fill();c.stroke();}
  else if(k==='grabthrow'){const gt=grabTarget(P),L=rayLen(P.x,P.y,ang,tossDist(P));c.setLineDash([5,7]);c.beginPath();c.arc(P.x,P.y,spec.grab,0,TAU);c.stroke();c.setLineDash([]);c.translate(P.x,P.y);c.rotate(ang);rrect(c,0,-14,L,28,14);c.fill();c.stroke();c.rotate(-ang);c.translate(-P.x,-P.y);if(gt){c.lineWidth=3;c.beginPath();c.arc(gt.x,gt.y,gt.rad+8,0,TAU);c.stroke();}}
  else{const rr=spec.zone||spec.radius||spec.range*R||spec.reach||120;c.beginPath();c.arc(P.x,P.y,k==='turret'?44:rr,0,TAU);c.fill();c.stroke();}
  c.restore();
}
function drawUnit(c,u){c.save();upr(c,u.x,u.y);try{drawUnit0(c,u);}finally{c.restore();}}
function drawUnit0(c,u){
  const ally=u.team===MYT,alpha=((ally&&u.hidden)?.5:1)*(u.dive?.45:1),col=u.isPlayer?OKC:ally?BLUE:RED;
  if(M.mode.id==='hunt'&&u.bounty){const by=u.y-u.rad*1.65-50;c.save();c.fillStyle=u.bounty>=5?'#ff7a1a':'#ffd23f';c.strokeStyle=OUT;c.lineWidth=2.5;star(c,u.x,by,11,5,5);c.fill();c.stroke();c.fillStyle='#120f26';c.font='900 11px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(u.bounty),u.x,by+1);c.restore();}
  if(u.darkT>0){c.save();c.strokeStyle='rgba(20,10,36,.9)';c.lineWidth=5;c.setLineDash([6,5]);c.lineDashOffset=-M.now*20;c.beginPath();c.arc(u.x,u.y,u.rad*1.25,0,TAU);c.stroke();c.restore();}
  if(u.darkX>0&&(u.darkT>0||u.poisonT>0)){const yx=u.y-u.rad*2.4;c.save();c.lineCap='round';for(const[w,col2]of[[9,'#ffffff'],[5,'#120a20']]){c.strokeStyle=col2;c.lineWidth=w;c.beginPath();c.moveTo(u.x-9,yx-9);c.lineTo(u.x+9,yx+9);c.moveTo(u.x+9,yx-9);c.lineTo(u.x-9,yx+9);c.stroke();}c.restore();}
  for(const g of u.ghosts){const gp=upP(u.x,u.y,g.x,g.y);drawFighter(c,gp[0],gp[1],u.rad,u.b,u.sk,u.aim+WA,M.now,{alpha:.35*(1-g.t/.3),still:true,noShadow:true,flat:true,tint:'rgba(255,255,255,.35)'});}
  c.save();c.globalAlpha=alpha;add(c);glow(c,u.x,u.y+u.rad*.9,u.rad*1.6,col,.22);norm(c);c.strokeStyle=col;c.lineWidth=3;ell(c,u.x,u.y+u.rad*.92,u.rad*1.05,u.rad*.38);c.stroke();c.restore();
  if(u.shadow){c.save();add(c);glow(c,u.x,u.y,u.rad*2.2,'#9d7bff',.45);c.restore();}
  if(u.zoneT>0){c.save();add(c);glow(c,u.x,u.y+u.rad*.5,u.rad*2,'#ffd36b',.35);c.restore();}
  if(u.damT>0){c.save();add(c);glow(c,u.x,u.y,u.rad*2,'#7fd3ff',.35);c.restore();}
  if(u.guardT>0){c.save();c.globalAlpha=.6;c.strokeStyle='#9ff5bf';c.lineWidth=3;c.beginPath();c.arc(u.x,u.y,u.rad*1.4,0,TAU);c.stroke();c.restore();}
  const lift=u.thrown?u.thrown.h:u.leap?u.leap.h:0;
  if(u===P||(u.team===MYT&&!u.isPlayer)){const z=closeZone(u.b);if(z){c.save();c.globalAlpha=u===P?(u.zoneOn?.5:.2):.12;c.strokeStyle=u.zoneOn?'#ffd23f':'#ffffff';c.lineWidth=u.zoneOn?3:2;c.setLineDash([10,9]);c.beginPath();c.arc(u.x,u.y,z,0,TAU);c.stroke();c.restore();}}
  if(u===P&&u.b.sup.kind==='leap'&&u.super>=1){const has=!!leapTarget(u);c.save();c.globalAlpha=has?.55:.3;c.strokeStyle=has?'#9fe8ff':'#9a98a8';c.lineWidth=3;c.beginPath();c.arc(u.x,u.y,u.b.sup.zone,0,TAU);c.stroke();c.restore();}
  if(lift){c.save();c.fillStyle='rgba(8,6,22,.35)';ell(c,u.x,u.y+u.rad*.9,u.rad*.9*(1-lift/200),u.rad*.3);c.fill();c.restore();}
  drawFighter(c,u.x,u.y-lift,u.rad,u.b,u.sk,(u.thrown?u.thrown.t*14+u.aim:u.aim)+WA,M.now,{noShadow:!!lift,alpha,flash:u.flash,moving:u.moving&&u.stunT<=0,phase:u.phase,swing:u.swingT!=null?M.now-u.swingT:9,hurt:u.hp/u.maxHp<.3,still:REDUCED||u.stunT>0,squash:u.squash,tint:u.shadow?'rgba(40,15,90,.6)':u.slowT>0?'rgba(150,210,255,.35)':u.poisonT>0?'rgba(140,230,80,.3)':null});
  if(u.b.atk.kind==='cloudzap'){const ch=u.ammo/u.maxAmmo;drawCloud(c,u.x,u.y-lift-u.rad*2.4+Math.sin(M.now*2)*2,.85,u.zoneOn&&Math.random()<.08);c.fillStyle=ch>=.34?'#ffe14d':'rgba(255,225,77,.35)';for(let k=0;k<u.maxAmmo;k++){c.beginPath();c.arc(u.x-10+k*10,u.y-lift-u.rad*2.4+16,3,0,TAU);c.fillStyle=u.ammo>=k+1?'#ffe14d':'rgba(255,255,255,.25)';c.fill();}}
  if(u.hasCrown){drawCrownIcon(c,u.x,u.y-u.rad*1.9-22+Math.sin(M.now*4)*2,.8);c.save();add(c);glow(c,u.x,u.y-u.rad*2-20,30,'#ffd23f',.5);c.restore();}
  if(u.carry>0){c.save();c.translate(u.x+u.rad*.9,u.y-u.rad*.9);rrect(c,-11,-9,22,18,6);c.fillStyle='#1d3b30';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.fillStyle='#5ce1a0';c.font='800 12px Rubik, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(u.carry,0,1);c.restore();}
  if(u.shield>0){c.save();c.globalAlpha=.35+.15*Math.sin(M.now*10);c.strokeStyle='#bff3ff';c.fillStyle='rgba(191,243,255,.15)';c.lineWidth=3;c.beginPath();c.arc(u.x,u.y,u.rad*1.55,0,TAU);c.fill();c.stroke();c.restore();}
  if(u.vulnT>0){c.save();c.translate(u.x+u.rad*1.15,u.y-u.rad*1.05);c.fillStyle='#ff9a3d';c.strokeStyle=OUT;c.lineWidth=2;c.beginPath();c.moveTo(-6,-5);c.lineTo(6,-5);c.lineTo(0,5);c.closePath();c.fill();c.stroke();c.restore();}
  for(const s of M.shots)if(s.home&&s.home.phase==='out'&&s.home.tgt===u&&s.team!==u.team){c.save();c.strokeStyle='#ffd36b';c.lineWidth=3;c.setLineDash([6,5]);c.lineDashOffset=M.now*30;c.beginPath();c.arc(u.x,u.y,u.rad*1.7,0,TAU);c.stroke();c.restore();}
  if(u.markT>0&&!ally){c.save();c.translate(u.x,u.y-u.rad*2.2-16);c.rotate(Math.sin(M.now*6)*.15);c.strokeStyle=OUT;c.lineWidth=8;c.beginPath();c.moveTo(-10,-10);c.lineTo(10,10);c.moveTo(10,-10);c.lineTo(-10,10);c.stroke();c.strokeStyle='#ff2b3a';c.lineWidth=5;c.stroke();c.restore();}
  if(u.stunT>0){for(let i=0;i<3;i++){const a=M.now*5+i*TAU/3;c.fillStyle='#ffe27a';star(c,u.x+Math.cos(a)*u.rad*.9,u.y-u.rad*1.3+Math.sin(a)*u.rad*.3,5,2.2,5);c.fill();}}
  if(u.isPlayer&&u.super>=1){c.save();c.strokeStyle=SUNC;c.lineWidth=3;c.setLineDash([8,7]);c.lineDashOffset=-M.now*30;c.beginPath();c.arc(u.x,u.y,u.rad*1.45,0,TAU);c.stroke();add(c);glow(c,u.x,u.y,u.rad*2.2,SUNC,.2+.1*Math.sin(M.now*6));c.restore();}
}
function drawStructs(c){
  for(const s of M.structs){if(s.dead||s.kind!=='box')continue;const hit=s.flash>0?s.flash:0,jx=Math.sin(M.now*26+s.id*1.7)*1.3+(hit?rand(-3,3)*hit:0);
    c.save();c.translate(s.x+jx,s.y);if(WA)c.rotate(-WA);c.fillStyle='rgba(8,6,22,.38)';ell(c,0,21,23,7);c.fill();c.rotate(Math.sin(M.now*19+s.id)*.05);
    rrect(c,-22,-20,44,40,8);c.fillStyle='#2f5f9e';c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    rrect(c,-16,-14,32,28,5);c.fillStyle='#4a86c8';c.fill();c.fillStyle='rgba(255,255,255,.18)';c.fillRect(-16,-14,32,5);
    c.fillStyle='#c98f55';c.fillRect(-22,-3,44,6);c.strokeStyle=OUT;c.lineWidth=2;c.strokeRect(-22,-3,44,6);
    add(c);glow(c,0,0,26,'#7fd3ff',.35+.15*Math.sin(M.now*4+s.id));norm(c);drawCube(c,0,0,8);
    if(hit){c.fillStyle='rgba(255,255,255,'+(hit*.6)+')';rrect(c,-22,-20,44,40,8);c.fill();}c.restore();}
  for(const s of M.structs){if(s.dead||s.kind!=='turret')continue;const col=s.owner.sk.proj;c.save();c.translate(s.x,s.y);if(WA)c.rotate(-WA);
    c.fillStyle='rgba(8,6,22,.35)';ell(c,0,14,18,7);c.fill();rrect(c,-15,-6,30,20,6);c.fillStyle='#4a4f66';c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();
    c.rotate(s.aim+WA);rrect(c,-10,-10,20,20,7);c.fillStyle=s.owner.sk.body;c.fill();c.stroke();rrect(c,6,-4,18,8,3);c.fillStyle='#3a3350';c.fill();c.stroke();c.rotate(-(s.aim+WA));
    add(c);glow(c,0,0,14,col,.5+.3*Math.sin(M.now*8));c.restore();}
}
function bar(c,x,y,w,h,f,col){c.fillStyle='rgba(10,8,25,.8)';rrect(c,x-2,y-2,w+4,h+4,4);c.fill();if(f>0){c.fillStyle=col;rrect(c,x,y,Math.max(2,w*f),h,3);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x+2,y+1,Math.max(0,w*f-4),2);}}
function drawLabels(c,u,z){
  const ally=u.team===MYT,col=u.isPlayer?OKC:ally?BLUE:RED,bw=52,bh=7,top=u.y-u.rad*1.65-14,bx=u.x-bw/2;
  c.save();upr(c,u.x,u.y);if(ally&&u.hidden)c.globalAlpha=.6;
  bar(c,bx,top,bw,bh,clamp(u.hp/u.maxHp,0,1),col);
  const fs=11/z;c.font='800 '+fs+'px Rubik, system-ui, sans-serif';c.textAlign='center';c.textBaseline='bottom';c.lineWidth=3/z;c.strokeStyle='rgba(10,8,25,.9)';c.lineJoin='round';
  const nm=u.name+' · '+u.lvl+(u.stolen.length?'  ✦'+u.stolen.length:'');c.strokeText(nm,u.x,top-3);if(u.cubes){const cy=top-3-fs-8/z;drawCube(c,u.x-9/z,cy,6/z);c.save();c.textAlign='left';c.textBaseline='middle';c.font='900 '+(12/z)+'px Rubik, system-ui, sans-serif';c.strokeText(u.cubes,u.x+1/z,cy+1/z);c.fillStyle='#bfeaff';c.fillText(u.cubes,u.x+1/z,cy+1/z);c.restore();}c.fillStyle='#ffffff';c.fillText(nm,u.x,top-3);
  if(u.isPlayer){const na=u.maxAmmo||3,gap=3,sw=na===1?42:15,tot=sw*na+gap*(na-1),ay=u.y+u.rad*1.3+6;let ax=u.x-tot/2;
    for(let i=0;i<na;i++){c.fillStyle='rgba(10,8,25,.8)';c.fillRect(ax-1,ay-1,sw+2,7);const fl=clamp(u.ammo-i,0,1),ac=u.b.atk.kind==='fist'?(u.strongFist?'#ffd23f':'#9fe8ff'):SUNC;c.fillStyle=fl>=1?ac:'rgba(255,201,60,.5)';c.fillRect(ax,ay,sw*fl,5);ax+=sw+gap;}}
  if(u.say&&M.now-u.say.at<2.2&&!u.pin){const age=M.now-u.say.at,k=Math.min(1,age*8),py=top-26/z-(u.cubes?16/z:0);c.save();c.translate(u.x,py);c.scale(k,k);c.font='800 '+(12/z)+'px Rubik, system-ui, sans-serif';const w=c.measureText(u.say.txt).width+16/z;
    rrect(c,-w/2,-12/z,w,22/z,10/z);c.fillStyle=u===P?'#fff6c2':'#ffffff';c.fill();c.strokeStyle=OUT;c.lineWidth=2/z;c.stroke();c.beginPath();c.moveTo(-5/z,10/z);c.lineTo(0,17/z);c.lineTo(5/z,10/z);c.fill();c.fillStyle='#1b1430';c.textAlign='center';c.textBaseline='middle';c.fillText(u.say.txt,0,0);c.restore();}
  if(u.pin){const k=Math.min(1,(2.6-u.pinT)*6),py=top-30/z-6-(u.cubes?16/z:0);c.translate(u.x,py);c.scale(k,k);rrect(c,-24,-24,48,46,14);c.fillStyle='#ffffff';c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();c.beginPath();c.moveTo(-6,21);c.lineTo(0,30);c.lineTo(6,21);c.fillStyle='#fff';c.fill();drawPin(c,u.pin,0,-1,40);}
  c.restore();
}
function drawShot(c,s){
  if(s.lob){c.fillStyle='rgba(8,6,22,.35)';ell(c,s.x,s.y,s.r,s.r*.45);c.fill();const y=s.y-s.h;
    if(s.style==='meteor'){const k=Math.min(1,s.t/s.T);c.fillStyle='rgba(8,6,22,.4)';ell(c,s.tx,s.ty,s.r*(.4+k*1.4),s.r*(.2+k*.6));c.fill();
      c.save();add(c);glow(c,s.x,y,s.r*3.5,'#ff7a1a',.9);glow(c,s.x+40,y-60,s.r*2.5,'#ffb347',.45);norm(c);
      c.translate(s.x,y);c.rotate(M.now*4);c.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,rr=s.r*(.82+((i*37)%5)*.06);c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fillStyle='#5a3a2a';c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
      c.fillStyle='#ff9a3d';ell(c,-s.r*.25,-s.r*.2,s.r*.22,s.r*.16);c.fill();ell(c,s.r*.3,s.r*.25,s.r*.16,s.r*.12);c.fill();c.restore();return;}
    if(s.style==='sun'){c.save();add(c);glow(c,s.x,y,s.r*3,'#ffb347',.8);norm(c);c.strokeStyle='#fff1a6';c.lineWidth=2;for(let i=0;i<8;i++){const a=i/8*TAU+M.now*3;c.beginPath();c.moveTo(s.x+Math.cos(a)*s.r*1.2,y+Math.sin(a)*s.r*1.2);c.lineTo(s.x+Math.cos(a)*s.r*1.8,y+Math.sin(a)*s.r*1.8);c.stroke();}
      ell(c,s.x,y,s.r,s.r);c.fillStyle='#ffd36b';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.restore();return;}
    if(s.style==='moon2'){c.save();add(c);glow(c,s.x,y,s.r*2.6,'#9fc8ff',.7);norm(c);c.beginPath();c.arc(s.x,y,s.r,Math.PI*.3,Math.PI*1.7);c.arc(s.x+s.r*.45,y,s.r*.78,Math.PI*1.55,Math.PI*.45,true);c.closePath();c.fillStyle='#e6efff';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.restore();return;}
    if(s.style==='coco'){ell(c,s.x,y,s.r,s.r);c.fillStyle='#6b4226';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();}
    else if(s.onLand){c.save();add(c);glow(c,s.x,y,s.r*2.4,s.onLand.kind==='hole'||s.onLand.kind==='starzone'?'#9d7bff':'#c9f0ff',.7);c.restore();ell(c,s.x,y,s.r,s.r);c.fillStyle=s.onLand.kind==='hole'||s.onLand.kind==='starzone'?'#1b1035':'#e6f8ff';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();}
    else if(s.style==='pebble'){ell(c,s.x,y,s.r*1.2,s.r);c.fillStyle='#9a948a';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();}
    else{ell(c,s.x,y,s.r,s.r);c.fillStyle='#2c2340';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.save();add(c);glow(c,s.x+s.r*.5,y-s.r*.8,8,'#ffd38a',.9);c.restore();}
    return;}
  const a=Math.atan2(s.vy,s.vx),col=s.color;
  c.save();add(c);
  const tr=s.trail;if(tr.length>=4){c.lineCap='round';for(let i=2;i<tr.length;i+=2){const k=i/tr.length;c.globalAlpha=k*.55;c.strokeStyle=col;c.lineWidth=s.r*2*k*(s.big?1.4:1);c.beginPath();c.moveTo(tr[i-2],tr[i-1]);c.lineTo(tr[i],tr[i+1]);c.stroke();}c.globalAlpha=1;}
  glow(c,s.x,s.y,s.r*(s.big?3.6:2.6),col,s.style==='splinter'||s.style==='log'||s.style==='stone'?.25:.75);norm(c);
  c.translate(s.x,s.y);c.strokeStyle=OUT;c.lineWidth=2;c.fillStyle=col;
  switch(s.style){
    case 'fist':c.rotate(a);c.fillStyle='#f4f1e6';rrect(c,-s.r*1.6,-s.r*.55,s.r*.6,s.r*1.1,s.r*.2);c.fill();c.stroke();c.fillStyle=col;ell(c,0,0,s.r*1.15,s.r);c.fill();c.stroke();ell(c,-s.r*.15,-s.r*.85,s.r*.45,s.r*.32);c.fill();c.stroke();break;
    case 'flame':{const k=clamp(s.left/s.range,0,1);c.globalAlpha=.5+.5*k;ell(c,0,0,s.r*1.2,s.r*1.2);c.fill();c.fillStyle='#fff3c4';ell(c,0,0,s.r*.5,s.r*.5);c.fill();break;}
    case 'beam':c.rotate(a);rrect(c,-s.r*2.4,-s.r*.7,s.r*3.4,s.r*1.4,s.r*.7);c.fill();c.stroke();c.fillStyle='#fff';rrect(c,-s.r*1.8,-s.r*.3,s.r*2.6,s.r*.6,s.r*.3);c.fill();break;
    case 'laser':c.rotate(a);rrect(c,-s.r*3,-s.r*.45,s.r*4,s.r*.9,s.r*.45);c.fill();c.fillStyle='#fff';rrect(c,-s.r*2.4,-s.r*.2,s.r*3,s.r*.4,s.r*.2);c.fill();break;
    case 'shard':c.rotate(a);c.beginPath();c.moveTo(s.r*1.6,0);c.lineTo(0,-s.r*.7);c.lineTo(-s.r*1.2,0);c.lineTo(0,s.r*.7);c.closePath();c.fill();c.stroke();break;
    case 'needle':case 'claw':c.rotate(a);c.beginPath();c.moveTo(s.r*1.6,0);c.lineTo(-s.r,-s.r*.45);c.lineTo(-s.r,s.r*.45);c.closePath();c.fill();c.stroke();break;
    case 'rang':case 'moon':c.rotate(s.spin);if(s.style==='moon'){c.beginPath();c.arc(0,0,s.r,Math.PI*.35,Math.PI*1.65);c.arc(s.r*.4,0,s.r*.75,Math.PI*1.55,Math.PI*.45,true);c.closePath();c.fill();c.stroke();}
      else{c.beginPath();c.moveTo(-s.r,-s.r*.2);c.lineTo(0,-s.r*.2);c.lineTo(s.r*.2,-s.r);c.lineTo(s.r*.6,-s.r*.8);c.lineTo(s.r*.3,s.r*.2);c.lineTo(-s.r,s.r*.2);c.closePath();c.fill();c.stroke();}break;
    case 'wave':{c.rotate(a);const k=clamp(s.left/s.range,0,1);c.globalAlpha=.4+.6*k;c.beginPath();c.arc(-s.r*.4,0,s.r,-1.1,1.1);c.arc(-s.r*.9,0,s.r*.8,1.0,-1.0,true);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='rgba(255,255,255,.8)';c.stroke();
      if(Math.random()<.5)addFx({k:'bubble',x:s.x+rand(-s.r,s.r)*.5,y:s.y+rand(-s.r,s.r)*.5,t:0,T:.5,col:'#e6faff'});break;}
    case 'spark':c.save();add(c);glow(c,0,0,s.r*3,'#ffffff',.8);c.restore();c.beginPath();for(let i=0;i<6;i++){const aa=i/6*TAU+s.spin,rr=i%2?s.r*.6:s.r*1.5;c.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr);}c.closePath();c.fill();break;
    case 'log':c.rotate(a+Math.sin(s.spin*.4)*.1);rrect(c,-s.r*1.6,-s.r*.65,s.r*3.2,s.r*1.3,s.r*.6);c.fillStyle='#a0673f';c.fill();c.stroke();c.fillStyle='#e8c79a';ell(c,s.r*1.5,0,s.r*.35,s.r*.6);c.fill();c.lineWidth=1.5;c.stroke();c.strokeStyle='rgba(60,30,15,.6)';c.beginPath();c.moveTo(-s.r,-s.r*.2);c.lineTo(s.r*.8,-s.r*.2);c.moveTo(-s.r*.6,s.r*.25);c.lineTo(s.r,s.r*.25);c.stroke();break;
    case 'splinter':c.rotate(s.spin);rrect(c,-s.r,-s.r*.35,s.r*2,s.r*.7,s.r*.3);c.fillStyle='#b67a4c';c.fill();c.stroke();break;
    case 'stone':c.rotate(s.spin);ell(c,0,0,s.r*1.1,s.r*.9);c.fillStyle='#a49e94';c.fill();c.stroke();break;
    case 'ball':ell(c,0,0,s.r,s.r);c.fillStyle='#f4f1e6';c.fill();c.stroke();c.strokeStyle='#e23d3d';c.lineWidth=1.5;c.beginPath();c.arc(-s.r*.9,0,s.r*.7,-.9,.9);c.stroke();c.beginPath();c.arc(s.r*.9,0,s.r*.7,Math.PI-.9,Math.PI+.9);c.stroke();break;
    case 'bat':c.rotate(s.spin*1.3);rrect(c,-s.r*1.6,-s.r*.22,s.r*1.4,s.r*.44,s.r*.2);c.fillStyle='#8a5a2e';c.fill();c.stroke();
      c.beginPath();c.moveTo(-s.r*.3,-s.r*.22);c.quadraticCurveTo(s.r*.6,-s.r*.5,s.r*1.6,-s.r*.4);c.quadraticCurveTo(s.r*1.9,0,s.r*1.6,s.r*.4);c.quadraticCurveTo(s.r*.6,s.r*.5,-s.r*.3,s.r*.22);c.closePath();c.fillStyle='#c98f55';c.fill();c.stroke();
      c.fillStyle='#ff4d6d';c.fillRect(-s.r*1.5,-s.r*.2,s.r*.6,s.r*.4);break;
    case 'star':c.rotate(s.spin*.6);star(c,0,0,s.r*1.35,s.r*.58,5);c.fill();c.stroke();c.fillStyle='#fff';star(c,0,0,s.r*.6,s.r*.26,5);c.fill();break;
    case 'pellet':ell(c,0,0,s.r*.8,s.r*.8);c.fill();break;
    case 'rivet':c.rotate(a);rrect(c,-s.r*1.2,-s.r*.5,s.r*2.4,s.r,s.r*.4);c.fill();c.stroke();break;
    default:ell(c,0,0,s.r,s.r);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';ell(c,-s.r*.3,-s.r*.3,s.r*.35,s.r*.35);c.fill();
  }
  c.restore();
}
function drawLobMarkers(c){for(const s of M.shots){if(!s.lob)continue;const enemy=s.team!==MYT;c.save();c.globalAlpha=enemy?.65:.3;c.strokeStyle=enemy?RED:'#ffffff';c.fillStyle=enemy?'rgba(255,93,87,.16)':'rgba(255,255,255,.08)';c.lineWidth=2.5;c.setLineDash([7,6]);c.lineDashOffset=-M.now*20;const rr=s.onLand?s.onLand.radius:s.splash;c.beginPath();c.arc(s.tx,s.ty,rr*(.6+.4*Math.min(1,s.t/s.T)),0,TAU);c.fill();c.stroke();c.restore();}}
const UPR_FX=new Set(['ghost','beam','fallstar','plus','star','bubble','snow','vine']);
function drawFx(c,front){
  for(const f of M.fx){if(f.t<0)continue;const k=f.t/f.T;
    if(front!==(f.k!=='smoke'&&f.k!=='leaf'&&f.k!=='vine'&&f.k!=='beam'))continue;
    c.save();if(WA&&UPR_FX.has(f.k))upr(c,f.x,f.y);
    switch(f.k){
      case 'spark':add(c);glow(c,f.x,f.y,f.s*3.2*(1-k*.6),f.col,1-k);break;
      case 'flash':add(c);glow(c,f.x,f.y,f.r*(.6+k*.6),f.col,(1-k)*.95);break;
      case 'smoke':c.globalAlpha=(1-k)*.45;c.fillStyle=f.col;ell(c,f.x,f.y,f.s*(1+k*1.4),f.s*(1+k*1.4));c.fill();break;
      case 'debris':c.globalAlpha=k>.8?(1-k)*5:1;c.fillStyle='rgba(8,6,22,.3)';ell(c,f.x,f.y,f.s,f.s*.4);c.fill();c.translate(f.x,f.y-f.z);c.rotate(f.rot);c.fillStyle=f.col;c.fillRect(-f.s,-f.s*.6,f.s*2,f.s*1.2);c.strokeStyle=OUT;c.lineWidth=1.2;c.strokeRect(-f.s,-f.s*.6,f.s*2,f.s*1.2);break;
      case 'ring':c.globalAlpha=(1-k)*.9;c.strokeStyle=f.col;c.lineWidth=f.w*(1-k)+1;c.beginPath();c.arc(f.x,f.y,Math.max(0,f.r0+(f.r1-f.r0)*(1-(1-k)*(1-k))),0,TAU);c.stroke();break;
      case 'swipe':if(f.gm){c.globalAlpha=.55*(1-k);c.fillStyle='rgba(8,20,12,.9)';c.beginPath();c.moveTo(f.x,f.y);c.arc(f.x,f.y,f.r,f.ang-f.arc/2,f.ang+f.arc/2);c.closePath();c.fill();c.globalAlpha=1-k;add(c);c.strokeStyle='#3dff8a';c.lineWidth=7;c.lineCap='round';c.beginPath();c.arc(f.x,f.y,f.r*(.8+k*.2),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();c.strokeStyle='#eafff2';c.lineWidth=2;c.stroke();break;}
      if(f.rb){c.globalAlpha=.5*(1-k);c.fillStyle=rainbowGrad(c,f.x-f.r,f.y-f.r,f.x+f.r,f.y+f.r,M.now,60);c.beginPath();c.moveTo(f.x,f.y);c.arc(f.x,f.y,f.r,f.ang-f.arc/2,f.ang+f.arc/2);c.closePath();c.fill();c.globalAlpha=1-k;c.strokeStyle=rainbowGrad(c,f.x-f.r,f.y,f.x+f.r,f.y,M.now*1.5,62);c.lineWidth=7;c.lineCap='round';c.beginPath();c.arc(f.x,f.y,f.r*(.8+k*.2),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=2;c.stroke();break;}
      if(f.dark){c.globalAlpha=.55*(1-k);c.fillStyle='#0a0612';c.beginPath();c.moveTo(f.x,f.y);c.arc(f.x,f.y,f.r,f.ang-f.arc/2,f.ang+f.arc/2);c.closePath();c.fill();c.globalAlpha=1-k;c.strokeStyle='#000000';c.lineWidth=6;c.lineCap='round';c.beginPath();c.arc(f.x,f.y,f.r*(.8+k*.2),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();c.strokeStyle='rgba(123,47,224,.6)';c.lineWidth=2;c.stroke();break;}add(c);c.globalAlpha=.6*(1-k);c.fillStyle=f.col;c.beginPath();c.moveTo(f.x,f.y);c.arc(f.x,f.y,f.r,f.ang-f.arc/2,f.ang+f.arc/2);c.closePath();c.fill();c.globalAlpha=1-k;c.strokeStyle='#ffffff';c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,f.r*(.8+k*.2),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();break;
      case 'cone':add(c);c.globalAlpha=.45*(1-k);c.strokeStyle=f.col;c.lineWidth=10*(1-k)+2;c.beginPath();c.arc(f.x,f.y,f.r*(.2+k*.8),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();break;
      case 'bolt':add(c);c.globalAlpha=1-k;c.strokeStyle=f.col;c.lineWidth=5;c.lineJoin='round';c.beginPath();f.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.strokeStyle='#ffffff';c.lineWidth=2;c.stroke();break;
      case 'lines':add(c);c.globalAlpha=1-k;c.strokeStyle=f.col;c.lineWidth=3;for(let i=0;i<14;i++){const a=i/14*TAU+f.seed,r0=30+k*70,r1=r0+40+((i*37)%30);c.beginPath();c.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0);c.lineTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1);c.stroke();}break;
      case 'plus':c.globalAlpha=1-k;c.fillStyle='#6be39a';c.strokeStyle=OUT;c.lineWidth=1.5;c.translate(f.x,f.y-k*30);c.fillRect(-2,-6,4,12);c.fillRect(-6,-2,12,4);break;
      case 'leaf':c.globalAlpha=1-k;c.translate(f.x,f.y);c.rotate(f.rot+k*4);c.fillStyle='#62c27a';ell(c,0,0,5,2.5);c.fill();break;
      case 'vine':{const g=Math.min(1,f.t*6),fade=k>.75?(1-k)*4:1;c.globalAlpha=fade;c.translate(f.x,f.y);c.rotate(f.rot);c.strokeStyle='#3c8a2e';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(8*g,-12*g,0,-24*g);c.stroke();c.strokeStyle='#7ed957';c.lineWidth=2.5;c.stroke();break;}
      case 'star':c.globalAlpha=1-k;c.fillStyle='#ffe27a';star(c,f.x+Math.cos(f.a)*12*k,f.y-14*k,5,2.2,5);c.fill();break;
      case 'snow':c.globalAlpha=1-k;c.fillStyle='#ffffff';ell(c,f.x,f.y+k*16,2,2);c.fill();break;
      case 'bubble':c.globalAlpha=1-k;c.strokeStyle=f.col;c.lineWidth=1.5;c.beginPath();c.arc(f.x,f.y-k*20,2+k*3,0,TAU);c.stroke();break;
      case 'ghost':c.globalAlpha=.55*(1-k);drawFighter(c,f.x+Math.sin(f.t*6)*6,f.y-k*70,f.b.rad*.9,f.b,f.sk,Math.PI/2,0,{still:true,noShadow:true,flat:true,ko:true,tint:'rgba(255,255,255,.5)'});break;
      case 'beam':add(c);c.globalAlpha=1-k;const g2=c.createLinearGradient(f.x,f.y-260,f.x,f.y);g2.addColorStop(0,'rgba(255,255,255,0)');g2.addColorStop(1,f.col);c.fillStyle=g2;c.fillRect(f.x-18*(1-k*.5),f.y-260,36*(1-k*.5),260);break;
      case 'fallstar':{add(c);const yy=f.y-(1-k)*80;c.globalAlpha=1-k*.4;c.strokeStyle=f.col;c.lineWidth=2.5;c.beginPath();c.moveTo(f.x-10*(1-k)-6,yy-30);c.lineTo(f.x,yy);c.stroke();glow(c,f.x,yy,11,f.col,1);if(k>.85)glow(c,f.x,f.y,18,'#ffffff',(1-k)*6);break;}
      case 'mark':c.globalAlpha=1-k;c.strokeStyle='#ff2b3a';c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,20+k*50,0,TAU);c.stroke();break;
    }
    c.restore();}
}
function drawTexts(c,z){
  c.save();c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  for(const t of M.texts){const k=t.t/t.T,pop=k<.15?1+(.15-k)*4:1;c.globalAlpha=1-k*k;c.font='900 '+(t.size*pop/z)+'px Rubik, system-ui, sans-serif';c.lineWidth=4/z;c.strokeStyle='rgba(10,8,25,.9)';if(WA){c.save();upr(c,t.x,t.y);}c.strokeText(t.txt,t.x,t.y);c.fillStyle=t.col;c.fillText(t.txt,t.x,t.y);if(WA)c.restore();}
  c.restore();
}
function drawEmbers(c){c.save();add(c);for(const e of M.embers){glow(c,e.x,e.y,e.s*4,'#ffb35c',.35+.25*Math.sin(M.now*3+e.ph));}c.restore();}
function layout(){return{mx:105,my:H-125,ax:W-100,ay:H-125,sx:W-185,sy:H-225,gx:W-72,gy:H-238,px:W-36,py:118};}
function drawControls(c){if(isWatching())return;
  if(!P||M.state==='ended')return;
  const L=layout();c.save();
  if(touchUI&&!mouseMode){
    const mv=ctl.move,mbx=mv?mv.ox:L.mx,mby=mv?mv.oy:L.my;
    c.globalAlpha=mv?.95:.4;c.fillStyle='rgba(10,8,25,.35)';c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=3;c.beginPath();c.arc(mbx,mby,52,0,TAU);c.fill();c.stroke();
    let kx=mbx,ky=mby;if(mv){const dx=mv.x-mv.ox,dy=mv.y-mv.oy,l=Math.hypot(dx,dy),m=Math.min(l,52);if(l>0){kx+=dx/l*m;ky+=dy/l*m;}}
    c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(kx,ky,24,0,TAU);c.fill();
    const at=ctl.atk;c.globalAlpha=.95;c.fillStyle='rgba(255,201,60,.16)';c.strokeStyle=SUNC;c.beginPath();c.arc(L.ax,L.ay,54,0,TAU);c.fill();c.stroke();
    let ax=L.ax,ay=L.ay;if(at&&at.drag){const dx=at.x-at.sx,dy=at.y-at.sy,l=Math.hypot(dx,dy),m=Math.min(l,54);ax+=dx/l*m;ay+=dy/l*m;}
    c.fillStyle=P.ammo>=1?(P.b.atk.kind==='fist'?(P.strongFist?'#ffd23f':'#9fe8ff'):SUNC):'rgba(255,201,60,.45)';c.beginPath();c.arc(ax,ay,26,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    const blocked=P.super>=1&&P.b.sup.kind==='leap'&&!leapTarget(P),ready=P.super>=1&&!blocked,su=ctl.sup;
    if(ready){c.save();add(c);glow(c,L.sx,L.sy,60,SUNC,.4+.2*Math.sin(M.now*6));c.restore();}
    c.fillStyle=ready?'rgba(255,201,60,.95)':blocked?'rgba(150,148,165,.85)':'rgba(10,8,25,.6)';c.beginPath();c.arc(L.sx,L.sy,34,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    c.strokeStyle=SUNC;c.lineWidth=5;c.beginPath();c.arc(L.sx,L.sy,40,-Math.PI/2,-Math.PI/2+TAU*P.super);c.stroke();
    star(c,L.sx,L.sy,15,6.5,5);c.fillStyle=ready?OUT:'rgba(255,255,255,.45)';c.fill();
    if(su&&su.drag&&ready){const dx=su.x-su.sx,dy=su.y-su.sy,l=Math.hypot(dx,dy),m=Math.min(l,40);c.fillStyle='#fff';c.beginPath();c.arc(L.sx+dx/l*m,L.sy+dy/l*m,12,0,TAU);c.fill();}
  }
  if(P.gadget&&(touchUI&&!mouseMode)){const ok=P.gUses>0&&P.gCd<=0;c.globalAlpha=1;c.fillStyle=ok?'#4fd585':'rgba(10,8,25,.6)';c.beginPath();c.arc(L.gx,L.gy,26,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    c.fillStyle=ok?OUT:'rgba(255,255,255,.5)';c.font='900 18px Rubik, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('G',L.gx,L.gy+1);
    for(let i=0;i<3;i++){c.fillStyle=i<P.gUses?'#9ff5bf':'rgba(255,255,255,.2)';c.beginPath();c.arc(L.gx-12+i*12,L.gy+34,4,0,TAU);c.fill();}}
  c.restore();
}
function drawTrails(c){if(!M.trails||!M.trails.length)return;c.save();let ti=0;for(const p of M.trails){const a=Math.max(0,1-p.t/p.T);ti++;if(p.gm){c.globalAlpha=.6*a;c.fillStyle='#07120b';ell(c,p.x,p.y,20,14);c.fill();c.globalAlpha=.5*a;c.strokeStyle='#3dff8a';c.lineWidth=2.5;ell(c,p.x,p.y,21,15);c.stroke();if(ti%4===0){c.globalAlpha=.35*a*(.6+.4*Math.sin(M.now*4+ti));c.fillStyle='#3dff8a';ell(c,p.x,p.y-6-((M.now*20+ti*7)%14),4,6);c.fill();}continue;}
  if(p.rb){const h=Math.round((ti*24+M.now*140)%360);c.globalAlpha=.6*a;c.fillStyle='hsl('+h+',95%,60%)';ell(c,p.x,p.y,20,14);c.fill();c.globalAlpha=.4*a;c.strokeStyle='#ffffff';c.lineWidth=2;ell(c,p.x,p.y,21,15);c.stroke();continue;}c.globalAlpha=.55*a;c.fillStyle='#0a0612';ell(c,p.x,p.y,20,14);c.fill();c.globalAlpha=.25*a;c.strokeStyle='#7b2fe0';c.lineWidth=2;ell(c,p.x,p.y,21,15);c.stroke();}c.restore();}
function render(){
  const c=ctx;c.setTransform(dpr,0,0,dpr,0,0);
  const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1b1546');bg.addColorStop(1,'#0b0820');c.fillStyle=bg;c.fillRect(0,0,W,H);
  if(!M)return;
  WA=curWA();const z=cam.zoom,vw=(WA?H:W)/z,vh=(WA?W:H)/z,x0=cam.x-vw/2+cam.sx,y0=cam.y-vh/2+cam.sy;
  if(WA){c.setTransform(dpr,0,0,dpr,0,0);c.translate(W/2,H/2);c.rotate(WA);c.scale(z,z);c.translate(-(x0+vw/2),-(y0+vh/2));}else c.setTransform(dpr*z,0,0,dpr*z,-x0*z*dpr,-y0*z*dpr);
  drawArena(c,x0,y0,x0+vw,y0+vh);
  drawFields(c);drawTrails(c);drawModeObjects(c);drawLobMarkers(c);drawFx(c,false);
  drawWalls(c,x0,y0,x0+vw,y0+vh);
  drawAim(c);
  const list=M.units.filter(u=>!u.dead&&!(u.team!==MYT&&u.hidden)).sort(WA?(a,b)=>a.x-b.x:(a,b)=>a.y-b.y);
  drawStructs(c);for(const u of list)drawUnit(c,u);
  for(const s of M.shots){if(WA&&s.lob&&s.style!=='meteor'){c.save();upr(c,s.x,s.y);drawShot(c,s);c.restore();}else drawShot(c,s);}
  drawFx(c,true);drawStorm(c,x0,y0,vw,vh);drawEmbers(c);
  for(const u of list)drawLabels(c,u,z);
  for(const s of M.structs)if(!s.dead&&(s.kind!=='box'||s.hp<s.maxHp)){c.save();upr(c,s.x,s.y);if(s.kind==='box')bar(c,s.x-22,s.y-32,44,5,s.hp/s.maxHp,'#7fd3ff');else bar(c,s.x-34,s.y-(s.kind==='core'?58:30),68,s.kind==='core'?9:6,s.hp/s.maxHp,s.team===MYT?BLUE:RED);c.restore();}
  drawTexts(c,z);
  c.setTransform(dpr,0,0,dpr,0,0);
  const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(5,3,18,.55)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  if(P&&!P.dead&&P.hp/P.maxHp<.35){const a=(.35-P.hp/P.maxHp)*1.6*(.7+.3*Math.sin(M.now*8));const rg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);rg.addColorStop(0,'rgba(255,0,40,0)');rg.addColorStop(1,'rgba(255,0,40,'+a+')');c.fillStyle=rg;c.fillRect(0,0,W,H);}
  drawControls(c);
}

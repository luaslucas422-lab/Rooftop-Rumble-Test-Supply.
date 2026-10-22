
/* ================= 3D test: first-person view =================
   A raycaster draws the arena from your rumbler's eyes: sky, checkered floor, tall crates, a pink wall around the map,
   other rumblers as cut-outs, a crosshair, a minimap and your arm. Drag on the right side to look around, tap to shoot. */
const FP={yaw:-Math.PI/2,fov:Math.PI*.42,eye:26,wallH:62,lastT:0,move:0,bob:0,floor:null,fctx:null,img:null,buf:null,fw:0,fh:0,zbuf:new Float32Array(0)};
const fpOn=()=>RR_MODE==='d3'&&view==='game'&&!!M&&!!P&&!isWatching();
function fpCol(hex){const n=parseInt(hex.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}
/* the normal game's colours, just seen from the rumbler's eyes */
const FP_FOG=fpCol('#3b2f6e'),FP_FLOOR_A=fpCol('#356a73'),FP_FLOOR_B=fpCol('#3a7079'),FP_BUSH=fpCol('#276b3b'),FP_OUT=fpCol('#4a3149'),FP_BLUE=fpCol('#46b4ff'),FP_RED=fpCol('#ff5d57'),FP_WHITE=[255,255,255];
const FP_CRATE=[fpCol('#b8714a'),fpCol('#ad6843'),fpCol('#c07b52')],FP_EDGE=fpCol('#4a3149');
const FP_CITY=(()=>{const out=[];let h=7;for(let i=0;i<64;i++){h=(h*16807)%2147483647;out.push([.35+(h%1000)/1000*.9,(h>>10)%3]);}return out;})();
/* start each match looking the way your rumbler faces */
{const _nm=newMatch;newMatch=function(){const r=_nm.apply(this,arguments);try{if(P)FP.yaw=P.aim;}catch(e){}return r;};}
/* moving: the stick and WASD move relative to where you look */
{const _pm=playerMove;playerMove=function(){if(!fpOn())return _pm.apply(this,arguments);let fx=0,sx=0;
  if(ctl.move){const dx=ctl.move.x-ctl.move.ox,dy=ctl.move.y-ctl.move.oy,l=Math.hypot(dx,dy);if(l>8){sx=dx/l;fx=-dy/l;}}
  else{if(keys.has('w'))fx++;if(keys.has('s'))fx--;if(keys.has('d'))sx++;if(keys.has('a'))sx--;if(keys.has('arrowup'))fx++;if(keys.has('arrowdown'))fx--;}
  const c=Math.cos(FP.yaw),s=Math.sin(FP.yaw);let mx=c*fx-s*sx,my=s*fx+c*sx;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}FP.move=l>.01?1:0;return[mx,my];};}
/* aiming: always straight ahead at the crosshair */
{const _aa=autoAim;autoAim=function(u,kind){if(fpOn()&&u===P){const spec=kind==='atk'?P.b.atk:P.b.sup;return[FP.yaw,spec.range||spec.radius||300];}return _aa.apply(this,arguments);};}
{const _fm=fireAtMouse;fireAtMouse=function(kind){if(!fpOn())return _fm.apply(this,arguments);if(!P||P.dead)return;const[a,d]=autoAim(P,kind);kind==='atk'?tryAttack(P,a,d):trySuper(P,a,d);};}
{const _rl=release;release=function(kind,o){if(!fpOn())return _rl.apply(this,arguments);if(!P||P.dead||!M)return;if(kind==='atk'&&o.look)return;const[a,d]=autoAim(P,kind);kind==='atk'?tryAttack(P,a,d):trySuper(P,a,d);};}
{const _up=update;update=function(dt){if(fpOn()&&P&&!P.dead)P.aim=FP.yaw;return _up.apply(this,arguments);};}
{const _nc=netClientUpdate;netClientUpdate=function(dt){if(fpOn()&&P&&!P.dead)P.aim=FP.yaw;return _nc.apply(this,arguments);};}
/* looking around: drag on the right side (touch) or drag the mouse */
canvas.addEventListener('pointermove',e=>{if(!fpOn())return;
  if(e.pointerType==='mouse'){if(e.buttons&1){FP.yaw+=(e.movementX||0)*.006;}return;}
  const o=ctl.atk;if(!o||o.id!==e.pointerId)return;const p=pt(e);const lx=o.lx==null?o.sx:o.lx;FP.yaw+=(p.x-lx)*.009;o.lx=p.x;if(Math.abs(p.x-o.sx)+Math.abs(p.y-o.sy)>12)o.look=true;});

function fpEnsureFloor(){const fw=Math.max(40,Math.ceil(W/4)),fh=Math.max(20,Math.ceil(H/8));if(FP.fw===fw&&FP.fh===fh&&FP.floor)return;
  FP.fw=fw;FP.fh=fh;FP.floor=document.createElement('canvas');FP.floor.width=fw;FP.floor.height=fh;FP.fctx=FP.floor.getContext('2d');FP.img=FP.fctx.createImageData(fw,fh);FP.buf=new Uint32Array(FP.img.data.buffer);}
const fpMix=(a,b,t)=>[(a[0]+(b[0]-a[0])*t)|0,(a[1]+(b[1]-a[1])*t)|0,(a[2]+(b[2]-a[2])*t)|0];
function fpRender(){const now=performance.now(),dt=Math.min(.05,FP.lastT?(now-FP.lastT)/1000:.016);FP.lastT=now;
  if(keys.has('arrowleft'))FP.yaw-=dt*2.4;if(keys.has('arrowright'))FP.yaw+=dt*2.4;
  FP.bob+=dt*(FP.move&&!P.dead?9:0);
  const c=ctx;c.setTransform(dpr,0,0,dpr,0,0);const hz=Math.round(H*.5+Math.sin(FP.bob)*2.5),D=(W/2)/Math.tan(FP.fov/2),eye=FP.eye,cy=Math.cos(FP.yaw),sy=Math.sin(FP.yaw),px=P.x,py=P.y,t=M.now;
  /* night sky over the rooftops, with a city skyline that turns with you */
  const sk=c.createLinearGradient(0,0,0,hz);sk.addColorStop(0,'#0b0820');sk.addColorStop(.6,'#1b1546');sk.addColorStop(1,'#3b2f6e');c.fillStyle=sk;c.fillRect(0,0,W,hz+1);
  c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<40;i++){const a=i*2.399,x=((a*97-FP.yaw*W/FP.fov*.5)%(W*2)+W*2)%(W*2)-W*.5,y=(i*53%100)/100*hz*.7;c.fillRect(x,y,1.5,1.5);}
  {const span=W/FP.fov*TAU,off=((-FP.yaw/TAU)*span%span+span)%span,bw=span/FP_CITY.length;c.fillStyle='#16123a';
    for(let rep=-1;rep<=1;rep++)for(let i=0;i<FP_CITY.length;i++){const x=i*bw+off+rep*span-span*.5;if(x>W||x+bw<0)continue;const [h,k]=FP_CITY[i],bh=h*H*.07;c.fillRect(x,hz-bh,bw+1,bh+1);
      if(k===1){c.fillStyle='rgba(255,210,63,.55)';for(let wy=hz-bh+4;wy<hz-3;wy+=7)c.fillRect(x+bw*.3,wy,2,2);c.fillStyle='#16123a';}}}
  /* floor: the teal arena tiles, team zones, bushes, the ring and the storm */
  fpEnsureFloor();const fw=FP.fw,fh=FP.fh,buf=FP.buf,floorH=H-hz,tanH=Math.tan(FP.fov/2);
  const lx=cy+sy*tanH,ly=sy-cy*tanH,rx=cy-sy*tanH,ry=sy+cy*tanH;
  const zone=M.mode.id==='ring',zc=zone?fpCol(M.zone===(MYT?'red':'blue')?BLUE:M.zone===(MYT?'blue':'red')?RED:M.zone==='contested'?SUNC:'#ffffff'):null,storm=M.storm&&M.storm.r<999?M.storm.r:0,sc=fpCol(M.storm&&M.storm.fog||'#6a2fa0');
  for(let j=0;j<fh;j++){const p=(j+.5)/fh*floorH;const dist=eye*D/Math.max(.5,p);const fog=Math.min(.8,dist/1500);
    for(let i=0;i<fw;i++){const q=(i+.5)/fw,wx=px+dist*(lx+(rx-lx)*q),wy=py+dist*(ly+(ry-ly)*q);let col;
      if(wx<0||wy<0||wx>=MW||wy>=MH)col=FP_OUT;else{const cx=(wx/TILE)|0,cz=(wy/TILE)|0;col=BUSH[cz*COLS+cx]?FP_BUSH:((cx+cz)&1)?FP_FLOOR_A:FP_FLOOR_B;
        if(!M.mode.ffa){if(wy>MH-3*TILE)col=fpMix(col,MYT?FP_RED:FP_BLUE,.12);else if(wy<3*TILE)col=fpMix(col,MYT?FP_BLUE:FP_RED,.12);if(Math.abs(wy-MH/2)<2.5&&((wx/40)|0)%2===0)col=fpMix(col,FP_WHITE,.25);}
        if(zone){const d=Math.hypot(wx-ZX,wy-ZY);if(d<ZR)col=fpMix(col,zc,d>ZR-6?.8:.18);}
        if(storm&&Math.hypot(wx-ZX,wy-ZY)>storm)col=fpMix(col,sc,.55);}
      const f=fpMix(col,FP_FOG,fog);buf[j*fw+i]=(255<<24)|(f[2]<<16)|(f[1]<<8)|f[0];}}
  FP.fctx.putImageData(FP.img,0,0);c.imageSmoothingEnabled=true;c.drawImage(FP.floor,0,hz,W,floorH);
  /* walls: the wooden crates, and the dark wall around the arena */
  const step=2,nc=Math.ceil(W/step);if(FP.zbuf.length!==nc)FP.zbuf=new Float32Array(nc);const zb=FP.zbuf;let prevKey=-1,prevD=0;const edges=[];
  for(let k=0;k<nc;k++){const cam=((k*step+step/2)/W)*2-1,dx=cy-sy*tanH*cam,dy=sy+cy*tanH*cam;
    let mx=Math.floor(px/TILE),my=Math.floor(py/TILE);const ddx=Math.abs(1/(dx||1e-9)),ddy=Math.abs(1/(dy||1e-9));const stx=dx<0?-1:1,sty=dy<0?-1:1;
    let sdx=(dx<0?(px/TILE-mx):(mx+1-px/TILE))*ddx,sdy=(dy<0?(py/TILE-my):(my+1-py/TILE))*ddy,side=0,hit=0,n=0;
    while(!hit&&n++<80){if(sdx<sdy){sdx+=ddx;mx+=stx;side=0;}else{sdy+=ddy;my+=sty;side=1;}if(mx<0||my<0||mx>=COLS||my>=ROWS)hit=2;else if(WALL[my*COLS+mx])hit=1;}
    const dist=Math.max(1,(side===0?sdx-ddx:sdy-ddy)*TILE);zb[k]=dist;
    const wh=hit===2?FP.wallH*1.25:FP.wallH,top=hz-(wh-eye)*D/dist,bot=hz+eye*D/dist,hgt=bot-top;const fog=Math.min(.75,dist/1500),x=k*step;
    let base=hit===2?FP_EDGE:FP_CRATE[((mx*13+my*7)%3+3)%3];if(side)base=fpMix(base,[0,0,0],.18);base=fpMix(base,FP_FOG,fog);
    c.fillStyle='rgb('+base[0]+','+base[1]+','+base[2]+')';c.fillRect(x,top,step+.6,hgt);
    if(hit===1){c.fillStyle='rgba(255,255,255,'+(.14*(1-fog))+')';c.fillRect(x,top+hgt*.03,step+.6,hgt*.06);c.fillStyle='rgba(18,15,38,'+(.35*(1-fog))+')';c.fillRect(x,top+hgt*.34,step+.6,Math.max(1,hgt*.03));c.fillRect(x,top+hgt*.6,step+.6,Math.max(1,hgt*.03));
      c.fillStyle='rgba(111,63,44,'+(1-fog)+')';c.fillRect(x,bot-hgt*.18,step+.6,hgt*.18);}
    else{c.fillStyle='rgba(46,31,51,'+(1-fog)+')';const band=(((side?mx:my)+(side?0:0))%2===0);if(band)c.fillRect(x,top,step+.6,hgt*.12);}
    const lw=Math.max(1.2,Math.min(3,100/dist));c.fillStyle='rgba(18,15,38,'+(.9-fog*.6)+')';c.fillRect(x,top,step+.6,lw);c.fillRect(x,bot-lw,step+.6,lw);
    const key=hit*10+side;if(k>0&&(key!==prevKey||Math.abs(dist-prevD)>Math.max(18,dist*.12)))edges.push([x,top,bot,lw,fog]);prevKey=key;prevD=dist;}
  for(const[x,tp,bt,lw,fog]of edges){c.fillStyle='rgba(18,15,38,'+(.9-fog*.6)+')';c.fillRect(x-lw/2,tp,lw,bt-tp);}
  /* things in the arena: rumblers, bushes, boxes, mode objects and shots, far to near, hidden behind walls */
  const sp=[];const toCam=(x,y)=>{const rx=x-px,ry=y-py;return[rx*cy+ry*sy,-rx*sy+ry*cy];};const add=(x,y,o)=>{const[d,s]=toCam(x,y);if(d>8&&d<2200&&Math.abs(s)<d*tanH+80){o.d=d;o.s=s;sp.push(o);}};
  for(const u of M.units){if(u===P||u.dead||(u.team!==MYT&&u.hidden))continue;add(u.x,u.y,{u});}
  for(let r=0;r<ROWS;r++)for(let q=0;q<COLS;q++)if(BUSH[r*COLS+q])add(q*TILE+TILE/2,r*TILE+TILE/2,{bush:q*7+r});
  for(const s0 of M.structs){if(!s0.dead)add(s0.x,s0.y,{st:s0});}
  if(M.mode.sd&&M.cubes)for(const cb of M.cubes)add(cb.x,cb.y,{cube:cb});
  if(M.items)for(const it of M.items)add(it.x,it.y,{item:it});
  if(M.cores)for(const co of M.cores)if(!co.dead)add(co.x,co.y,{core:co});
  if(M.mode.id==='crown'&&M.crown&&M.crown.live&&!M.crown.carrier)add(M.crown.x,M.crown.y,{crown:1});
  for(const sh of M.shots)add(sh.x,sh.y,{sh});
  sp.sort((a,b)=>b.d-a.d);
  for(const o of sp){const sx=W/2+o.s*D/o.d,scl=D/o.d,gy=hz+eye*scl;
    const half=(o.u?o.u.rad*1.6:o.bush!=null?30:o.st||o.core?40:16)*scl;const c0=Math.max(0,Math.floor((sx-half)/step)),c1=Math.min(nc-1,Math.floor((sx+half)/step));if(c1<0||c0>=nc)continue;
    let any=false;c.save();c.beginPath();for(let k=c0;k<=c1;k++)if(zb[k]>o.d){c.rect(k*step,0,step+.6,H);any=true;}if(!any){c.restore();continue;}c.clip();
    if(o.u){const u=o.u,R=u.rad*scl,ally=u.team===MYT;c.fillStyle='rgba(8,6,22,.35)';ell(c,sx,gy,R*1.1,R*.32);c.fill();
      try{drawFighter(c,sx,gy-R*1.15,R,u.b,u.sk,Math.PI/2+Math.sin(u.aim-FP.yaw)*.6,t,{flash:u.flash});}catch(e){}
      if(o.d<900){const bw=Math.max(28,R*2.4),by=gy-R*3.1;c.fillStyle='rgba(10,8,25,.8)';rrect(c,sx-bw/2-2,by-2,bw+4,8,4);c.fill();c.fillStyle=u.isPlayer?OKC:ally?BLUE:RED;rrect(c,sx-bw/2,by,bw*clamp(u.hp/u.maxHp,0,1),4,2);c.fill();
        c.font='800 '+Math.max(9,Math.min(13,R*.55))+'px system-ui,sans-serif';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle=OUT;c.lineWidth=3;c.strokeText(u.name,sx,by-5);c.fillText(u.name,sx,by-5);}}
    else if(o.bush!=null){const r=26*scl,by=gy-r*.7,sw=Math.sin(t*1.6+o.bush)*1.5*scl;c.fillStyle='#276b3b';ell(c,sx,by,r*1.15,r*.8);c.fill();c.fillStyle='#3f9d55';ell(c,sx-r*.4+sw,by-r*.25,r*.55,r*.5);c.fill();ell(c,sx+r*.45+sw,by-r*.15,r*.55,r*.5);c.fill();ell(c,sx+sw*.5,by-r*.55,r*.5,r*.45);c.fill();
      c.fillStyle='#62c27a';ell(c,sx-r*.45+sw,by-r*.45,r*.2,r*.15);c.fill();c.strokeStyle='#143a22';c.lineWidth=Math.max(1,2*scl);ell(c,sx,by,r*1.15,r*.8);c.stroke();}
    else if(o.st){const s0=o.st,w=44*scl,h=40*scl,jx=s0.flash>0?rand(-3,3)*s0.flash*scl:0;c.fillStyle='rgba(8,6,22,.38)';ell(c,sx,gy,w*.55,w*.16);c.fill();rrect(c,sx-w/2+jx,gy-h,w,h,8*scl);c.fillStyle=s0.kind==='box'?'#2f5f9e':s0.team===MYT?BLUE:RED;c.fill();c.strokeStyle=OUT;c.lineWidth=Math.max(1,3*scl);c.stroke();
      if(s0.kind==='box'){rrect(c,sx-w*.36+jx,gy-h*.85,w*.72,h*.7,5*scl);c.fillStyle='#4a86c8';c.fill();}c.fillStyle='rgba(255,255,255,.18)';c.fillRect(sx-w*.36+jx,gy-h*.85,w*.72,h*.12);}
    else if(o.cube){const r=9*scl,y=gy-18*scl+Math.sin(t*4+o.cube.ph)*3*scl;c.save();c.globalCompositeOperation='lighter';glow(c,sx,y,r*3,'#46b4ff',.5);c.restore();drawCube(c,sx,y,r);}
    else if(o.item){const r=10*scl,y=gy-20*scl+Math.sin(t*4+o.item.ph)*3*scl;c.save();c.globalCompositeOperation='lighter';glow(c,sx,y,r*3,'#5ce1a0',.5);c.restore();rrect(c,sx-r*.7,y-r*1.1,r*1.4,r*2.2,3*scl);c.fillStyle='#1d3b30';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.fillStyle='#5ce1a0';c.fillRect(sx-r*.4,y-r*.4,r*.8,r*1.2);}
    else if(o.core){const co=o.core,r=38*scl,y=gy-r,col=co.team===MYT?BLUE:RED;c.save();c.globalCompositeOperation='lighter';glow(c,sx,y,r*2.2,col,.35);c.restore();c.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;c.lineTo(sx+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fillStyle='#2a2560';c.fill();c.strokeStyle=OUT;c.lineWidth=Math.max(1,3.5*scl);c.stroke();c.fillStyle=col;star(c,sx,y,r*.58,r*.32,6);c.fill();
      const bw=r*2;c.fillStyle='rgba(10,8,25,.8)';rrect(c,sx-bw/2,y-r-14*scl,bw,7*scl,3);c.fill();c.fillStyle=col;rrect(c,sx-bw/2,y-r-14*scl,bw*clamp(co.hp/co.maxHp,0,1),7*scl,3);c.fill();}
    else if(o.crown){const y=gy-26*scl+Math.sin(t*3)*4*scl;c.save();c.globalCompositeOperation='lighter';glow(c,sx,y,50*scl,'#ffd23f',.5);c.restore();drawCrownIcon(c,sx,y,1.1*scl);}
    else{const sh=o.sh,r=Math.max(2.5,(sh.rad||7)*scl),y=gy-(sh.z||20)*scl;const col=sh.col||(sh.team===MYT?'#ffe680':'#ff7a7a');c.save();c.globalCompositeOperation='lighter';glow(c,sx,y,r*2.5,col,.45);c.restore();c.fillStyle=col;c.strokeStyle=OUT;c.lineWidth=1.5;c.beginPath();c.arc(sx,y,r,0,TAU);c.fill();c.stroke();}
    c.restore();}
  /* your arm, in your rumbler's colours */
  {const sw=Math.min(W,H)*.085,ax=W*.76+Math.cos(FP.bob*.5)*6,ay=H*.62+Math.abs(Math.sin(FP.bob))*8,rec=Math.max(0,.18-(M.now-P.lastAttack))*120;
    c.save();c.lineCap='round';c.strokeStyle=OUT;c.lineWidth=sw*.8;c.beginPath();c.moveTo(W+sw,ay+sw*2.6);c.lineTo(ax,ay-sw*.2+rec);c.stroke();
    c.strokeStyle=P.sk.body||'#ff7a2f';c.lineWidth=sw*.55;c.stroke();c.fillStyle=OUT;c.beginPath();c.arc(ax,ay-sw*.3+rec,sw*.62,0,TAU);c.fill();c.fillStyle=P.sk.belly||P.sk.body||'#ff7a2f';c.beginPath();c.arc(ax,ay-sw*.3+rec,sw*.5,0,TAU);c.fill();
    c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(ax-sw*.15,ay-sw*.48+rec,sw*.16,0,TAU);c.fill();c.restore();}
  /* crosshair */
  {const x=W/2,y=hz,r=13;c.save();c.strokeStyle=OUT;c.lineWidth=6;const cross=()=>{c.beginPath();c.arc(x,y,r,0,TAU);c.moveTo(x-r-10,y);c.lineTo(x-r+3,y);c.moveTo(x+r-3,y);c.lineTo(x+r+10,y);c.moveTo(x,y-r-10);c.lineTo(x,y-r+3);c.moveTo(x,y+r-3);c.lineTo(x,y+r+10);c.stroke();};cross();c.strokeStyle='#ffffff';c.lineWidth=2.5;cross();c.restore();}
  /* health */
  {const bw=Math.min(220,W*.5),bx=W/2-bw/2,by=Math.max(118,H*.13);bar(c,bx,by,bw,14,clamp(P.hp/P.maxHp,0,1),P.hp/P.maxHp>.35?OKC:RED);
    c.font='900 12px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle=OUT;const tx=fmtFull(Math.max(0,Math.round(P.hp)));c.strokeText(tx,W/2,by+7.5);c.fillStyle='#fff';c.fillText(tx,W/2,by+7.5);}
  /* minimap */
  {const mw=Math.min(90,W*.23),s=mw/MW,mh=MH*s,mx0=10,my0=Math.max(150,H*.18);c.fillStyle='rgba(13,10,36,.75)';rrect(c,mx0-4,my0-4,mw+8,mh+8,8);c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();
    for(let r=0;r<ROWS;r++)for(let q=0;q<COLS;q++){if(WALL[r*COLS+q]){c.fillStyle='#c07b52';c.fillRect(mx0+q*TILE*s,my0+r*TILE*s,TILE*s+.5,TILE*s+.5);}else if(BUSH[r*COLS+q]){c.fillStyle='#3f9d55';c.fillRect(mx0+q*TILE*s,my0+r*TILE*s,TILE*s+.5,TILE*s+.5);}}
    for(const u of M.units){if(u.dead||u.shadow||(u.team!==MYT&&u.hidden)||u===P)continue;c.fillStyle=u.team===MYT?BLUE:RED;c.beginPath();c.arc(mx0+u.x*s,my0+u.y*s,2.8,0,TAU);c.fill();}
    c.strokeStyle=OKC;c.lineWidth=2;c.beginPath();c.moveTo(mx0+px*s,my0+py*s);c.lineTo(mx0+(px+cy*130)*s,my0+(py+sy*130)*s);c.stroke();c.fillStyle=OKC;c.beginPath();c.arc(mx0+px*s,my0+py*s,3.6,0,TAU);c.fill();}
  {const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(5,3,18,.45)');c.fillStyle=vg;c.fillRect(0,0,W,H);}
  if(!P.dead&&P.hp/P.maxHp<.35){const a=(.35-P.hp/P.maxHp)*1.6*(.7+.3*Math.sin(M.now*8));const rg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);rg.addColorStop(0,'rgba(255,0,40,0)');rg.addColorStop(1,'rgba(255,0,40,'+a+')');c.fillStyle=rg;c.fillRect(0,0,W,H);}
  if(P.dead){c.fillStyle='rgba(13,10,36,.55)';c.fillRect(0,0,W,H);c.font='400 28px '+getComputedStyle(document.body).getPropertyValue('--display')+',system-ui,sans-serif';c.textAlign='center';c.fillStyle='#fff';c.fillText(P.respawn===Infinity?'Knocked out':'Respawning…',W/2,H*.42);}
  drawControls(c);}
{const _r=render;render=function(){if(!fpOn())return _r.apply(this,arguments);try{fpRender();}catch(e){console.error(e);return _r.apply(this,arguments);}};}

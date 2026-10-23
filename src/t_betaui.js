
/* ================= Beta UI refresh =================
   Only switched on in the beta build (RR_BETA). The look itself lives in a_css.html under body.beta-ui,
   so the main game is not changed at all. Here we turn it on and tidy the home tiles into pairs. */
function betaTiles(){const t=$('#tiles');if(!t||!t.querySelector)return;
  const pass=t.querySelector('.passtile'),bank=t.querySelector('.banktile');
  if(pass&&bank){pass.classList.remove('wide');bank.classList.remove('wide');
    const pk=pass.querySelector('.tk');if(pk)pk.textContent='Rumble Pass';
    const parts=bankSummary(),bb=bank.querySelector('b');if(bb)bb.textContent=parts.length?parts.length+' bank'+(parts.length>1?'s':'')+' in use':'Save your stuff';}
  const nx=[...t.children].filter(x=>!x.classList.contains('wide'));for(const x of nx)x.classList.add('bt-mini');}
if(RR_BETA&&!NETS){
  try{if(document.body&&document.body.classList)document.body.classList.add('beta-ui');}catch(e){}
  {const _rt=renderTiles;renderTiles=function(){const r=_rt.apply(this,arguments);try{betaTiles();}catch(e){}return r;};}
}

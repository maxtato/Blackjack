/* Presentation effects only. No writes to game state or use of the deck's RNG. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.id = 'arcadeFX';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  const lightningLayer = $('tableLightning');
  const animations = new Set();
  const timers = new Set();
  let seed = (performance.now() * 1000) >>> 0;
  let lastLevel = barakaLevel();
  let popupTimer;
  let lastHaptic = -Infinity;
  const palette = ['#ffce3a', '#fff7e6', '#1fd1c8', '#ff5470', '#a64dff'];
  let preference;
  try{preference=localStorage.getItem('colddeck-motion');}catch(e){}
  const reduced = () => preference==='gentle'||motion.matches;
  const boardActive = () => !reduced()&&!document.hidden&&!document.querySelector('.overlay.show,#adOverlay.show');
  // Original motion moves by one physical pixel at every display density.
  let densityQuery;
  function syncPixelDensity(){
    const ratio=window.devicePixelRatio||1;
    document.documentElement.style.setProperty('--device-pixel',`${1/ratio}px`);
    densityQuery?.removeEventListener('change',syncPixelDensity);
    densityQuery=matchMedia(`(resolution: ${ratio}dppx)`);
    densityQuery.addEventListener('change',syncPixelDensity);
  }
  window.addEventListener('resize',syncPixelDensity);
  syncPixelDensity();
  function syncMotion(){document.documentElement.dataset.motion=reduced()?'gentle':'punchy';}
  syncMotion();
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  }
  function clear() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
    for (const animation of [...animations]) animation.cancel();
    animations.clear();
    layer.replaceChildren();
    lightningLayer?.replaceChildren();
    shakeAmt = 0;
    $('shaker').style.transform = '';
    try { navigator.vibrate?.(0); } catch(e) {}
    $('felt')?.removeAttribute('data-arcade-result');
    $('multPop')?.classList.remove('go');
  }
  function animate(el, frames, options, remove = false) {
    if (!el || reduced() || document.hidden) { if (remove) el?.remove(); return; }
    const animation = el.animate(frames, {easing:'cubic-bezier(.2,.8,.3,1)', ...options});
    animations.add(animation);
    const finish = () => { animations.delete(animation); if (remove) el.remove(); };
    animation.onfinish = finish;
    animation.oncancel = finish;
    return animation;
  }
  function rect(el) {
    if (!el?.isConnected || !el.getClientRects().length) return null;
    const r = el.getBoundingClientRect();
    return {x:r.left + r.width / 2, y:r.top + r.height / 2, width:r.width, height:r.height};
  }
  function piece(cls, x, y, color, target=layer) {
    if (layer.childElementCount + (lightningLayer?.childElementCount||0) >= 84) return null;
    const el = document.createElement('i');
    el.className = cls;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    if (color) el.style.setProperty('--spark', color);
    target.appendChild(el);
    return el;
  }
  function haptic(strong=false) {
    if (reduced() || document.hidden || document.querySelector('.overlay.show,#adOverlay.show')) return;
    const now = performance.now();
    if (now-lastHaptic < 95) return;
    lastHaptic = now;
    try { navigator.vibrate?.(strong ? [16,24,28] : 8); } catch(e) {}
  }
  // Feedback stays local: the table, totals and inventory keep their positions.
  function kick(strength=3) {
    if (reduced() || document.hidden || document.querySelector('.overlay.show,#adOverlay.show')) return;
    haptic(strength>=6);
  }
  function electricPath(ax,ay,bx,by,jitter=10,branch=true){
    const dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
    const points=[[ax,ay]];
    for(let i=1;i<7;i++){
      const t=i/7,offset=(random()-.5)*jitter*2*Math.sin(t*Math.PI);
      points.push([ax+dx*t+nx*offset,ay+dy*t+ny*offset]);
    }
    points.push([bx,by]);
    let d=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    if(branch)for(const i of [2,5]){
      const [x,y]=points[i],side=random()>.5?1:-1;
      d+=` M${x.toFixed(1)} ${y.toFixed(1)} l${(dx*.07+nx*jitter*side).toFixed(1)} ${(dy*.07+ny*jitter*side).toFixed(1)} l${(dx*.12-nx*jitter*side*.4).toFixed(1)} ${(dy*.12-ny*jitter*side*.4).toFixed(1)}`;
    }
    return d;
  }
  const electricInk=d=>`<path class="electric-glow" d="${d}"/><path class="electric-color" d="${d}"/><path class="electric-core" d="${d}"/>`;
  function lightning(el, reach=110, arms=5, color='#7eece4') {
    if (!boardActive()) return;
    let p=rect(el);if(!p)return;
    // The hand element spans the table. Anchor the impact to the actual cards.
    const cards=[...el.querySelectorAll('.card')].map(card=>card.getBoundingClientRect()).filter(r=>r.width>0);
    if(cards.length){
      const left=Math.min(...cards.map(r=>r.left)),right=Math.max(...cards.map(r=>r.right));
      const top=Math.min(...cards.map(r=>r.top)),bottom=Math.max(...cards.map(r=>r.bottom));
      p={x:(left+right)/2,y:(top+bottom)/2,width:right-left,height:bottom-top};
    }
    const inside=lightningLayer&&$('felt').contains(el);
    const origin=inside?lightningLayer.getBoundingClientRect():{left:0,top:0};
    const bolt=piece('arcade-lightning electric-burst',p.x-origin.left,p.y-origin.top,color,inside?lightningLayer:layer);if(!bolt)return;
    const radius=Math.min(reach,innerWidth*.4),size=radius*2+32,center=size/2;
    bolt.style.width=bolt.style.height=size+'px';
    const paths=()=>Array.from({length:Math.min(arms,8)},(_,i)=>{
      const angle=Math.PI*2*i/arms+(random()-.5)*.3,dx=Math.cos(angle),dy=Math.sin(angle);
      const inner=Math.min(radius*.4,Math.max(p.width,p.height)*.28),outer=radius*(.7+random()*.3);
      return electricPath(center+dx*inner,center+dy*inner,center+dx*outer,center+dy*outer,Math.max(5,radius*.1));
    }).join(' ');
    bolt.innerHTML=`<svg viewBox="0 0 ${size} ${size}" aria-hidden="true">${electricInk(paths())}</svg>`;
    later(()=>{if(bolt.isConnected){const d=paths();bolt.querySelectorAll('path').forEach(path=>path.setAttribute('d',d));}},100);
    animate(bolt,[
      {transform:'translate(-50%,-50%) scale(.72)',opacity:0},
      {transform:'translate(-50%,-50%) scale(.97)',opacity:1,offset:.12},
      {transform:'translate(-50%,-50%) scale(1)',opacity:.4,offset:.3},
      {transform:'translate(-50%,-50%) scale(1.025)',opacity:.95,offset:.43},
      {transform:'translate(-50%,-50%) scale(1.1)',opacity:0}
    ],{duration:420,easing:'linear'},true);
  }
  function burst(el, {count=10, reach=58, color, ring=false} = {}) {
    if (!boardActive()) return;
    const p = rect(el); if (!p) return;
    if (ring) {
      const halo = piece('arcade-ring', p.x, p.y, color);
      animate(halo, [
        {transform:'translate(-50%,-50%) rotate(0deg) scale(.3)', opacity:.95},
        {transform:'translate(-50%,-50%) rotate(35deg) scale(3)', opacity:0}
      ], {duration:470}, true);
    }
    for (let i=0; i<count; i++) {
      const angle = Math.PI * 2 * (i / count) + random() * .4;
      const distance = reach * (.45 + random() * .7);
      const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance;
      const spark = piece('arcade-spark' + (i % 4 === 0 ? ' star' : ''), p.x, p.y, color || palette[i % palette.length]);
      if (!spark) break;
      animate(spark, [
        {transform:'translate(-50%,-50%) scale(.25)', opacity:0},
        {transform:`translate(calc(-50% + ${dx*.55}px),calc(-50% + ${dy*.55}px)) rotate(35deg) scale(1)`, opacity:1, offset:.2},
        {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy+22}px)) rotate(100deg) scale(.3)`, opacity:0}
      ], {duration:420 + random()*230}, true);
    }
  }
  function pulse(el, big=false) {
    animate(el, [
      {scale:'1', filter:'brightness(1)'},
      {scale:big?'1.09':'1.05', filter:'brightness(1.25)', offset:.3},
      {scale:'1', filter:'brightness(1)'}
    ], {duration:big?480:320});
  }
  function collectCoins(count) {
    const start = rect($('pHand')), end = rect($('gainStat'));
    if (!start || !end || reduced()) return;
    for (let i=0; i<count; i++) later(() => {
      const x = start.x + (random()-.5)*90, y = start.y - 5;
      const dx = end.x-x, dy = end.y-y;
      const coin = piece('arcade-coin', x, y);
      animate(coin, [
        {transform:'translate(-50%,-50%) scale(.5)',opacity:0},
        {transform:`translate(calc(-50% + ${dx*.1+20}px),calc(-50% - 48px)) rotate(35deg) scale(1)`,opacity:1,offset:.25},
        {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(180deg) scale(.45)`,opacity:0}
      ], {duration:650}, true);
      if (i === count-1) later(() => pulse($('gainStat'), true), 580);
    }, i*48);
  }
  function onAnnouncement() {
    clearTimeout(popupTimer);
    timers.delete(popupTimer);
    popupTimer = later(() => $('multPop')?.classList.remove('go'), 1450);
  }
  function onResult(kind, gain, mult, natural) {
    onAnnouncement();
    if(kind==='win'&&!G.splitActive)$('comboRow').querySelectorAll('.combo-tile.on:not([data-combo-key="contract"])').forEach(markComboPaid);
    if(!boardActive())return;
    $('felt').dataset.arcadeResult = kind;
    later(() => $('felt')?.removeAttribute('data-arcade-result'), 800);
    if (kind === 'win') {
      const big = natural || mult>=3;
      kick(big?8:5);
      lightning($('pHand'),big?310:230,big?8:6);
      $('pHand').querySelectorAll('.card:not(.back)').forEach(card=>cardCharge(card,'#ffce3a',true));
      impact($('pHand'));
      burst($('pHand'), {count:big?28:18,reach:big?205:135,ring:true});
      if(big)later(()=>{
        lightning($('center'),190,6);
        burst($('center'),{count:12,reach:170,color:'#f4ff28',ring:true});
      },125);
      collectCoins(natural?13:mult>=3?11:7);
      pulse($('scorebox'), true);
    } else if (kind === 'lose') {
      kick(4);
      burst($('pVal'),{count:10,reach:68,color:'#ff9238'});
      pulse($('pVal'));
    } else {
      burst($('pVal'), {count:6,reach:36,color:'#fffefa'});
    }
  }
  function cardNode(card) {
    const dealer = G.dHand.includes(card);
    const container = $(dealer?'dHand':'pHand');
    const hands=dealer?[G.dHand]:G.splitActive?G.hands:[G.pHand];
    const index=hands.flat().filter(c=>!c._pending).indexOf(card);
    const slot=container.querySelectorAll('.cardslot')[index];
    return slot?.querySelector('.card:not(.back)')||slot?.querySelector('.card');
  }
  function cardCharge(el,color='#ffce3a',strong=false){
    if(!boardActive()||!el)return;
    el.querySelector('.card-charge')?.remove();
    const glow=piece('card-charge',0,0,color,el);if(!glow)return;
    glow.style.left=glow.style.top='-4px';
    glow.innerHTML=`<svg viewBox="0 0 100 148" preserveAspectRatio="none" aria-hidden="true">${electricInk('M9 2 H91 L98 10 V138 L91 146 H9 L2 138 V10 Z')}</svg>`;
    animate(glow,[{opacity:0,scale:'.96'},{opacity:strong?1:.7,scale:'1',offset:.15},{opacity:.65,scale:'1.015',offset:.5},{opacity:0,scale:'1.05'}],{duration:strong?560:350},true);
  }
  function onCardLand(card){
    if(!boardActive())return;
    const el=cardNode(card),p=rect(el);if(!p)return;
    const ring=piece('landing-ring',p.x,p.y+p.height*.4,'#ffce3a');
    if(ring){ring.style.width=p.width*.9+'px';animate(ring,[{transform:'translate(-50%,-50%) scale(.6)',opacity:.8},{transform:'translate(-50%,-50%) scale(1.7)',opacity:0}],{duration:240},true);}
    burst(el,{count:3,reach:Math.min(30,p.width*.42),color:'#fff7e6'});haptic();
  }
  function onCard(card) {
    if(!boardActive())return;
    const el = cardNode(card); if (!el) return;
    pulse($(G.dHand.includes(card)?'dVal':'pVal'));
    cardCharge(el,card.ed==='poly'?'#b49aff':card.ed==='holo'?'#7eece4':'#ffce3a');
    if(card.ed)lightning(el,78,4,card.ed==='poly'?'#b49aff':'#7eece4');
  }
  // Reference rhythm: a local card accent, then an energy transfer to the HUD.
  function energyLink(from,to,color='#7eece4'){
    if(!boardActive())return;
    const a=rect(from),b=rect(to);if(!a||!b)return;
    const left=Math.min(a.x,b.x)-18,top=Math.min(a.y,b.y)-18;
    const width=Math.abs(b.x-a.x)+36,height=Math.abs(b.y-a.y)+36;
    const beam=piece('score-link electric-link',left,top,color);if(!beam)return;
    beam.style.width=width+'px';beam.style.height=height+'px';
    const x=a.x-left,y=a.y-top,dx=b.x-a.x,dy=b.y-a.y;
    const d=electricPath(x,y,x+dx,y+dy,12);
    beam.innerHTML=`<svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${electricInk(d)}</svg>`;
    for(const path of beam.querySelectorAll('path')){
      path.setAttribute('pathLength','1');
      animate(path,[{strokeDasharray:'1',strokeDashoffset:'1'},{strokeDasharray:'1',strokeDashoffset:'0',offset:.48},{strokeDasharray:'1',strokeDashoffset:'-1'}],{duration:430,easing:'ease-in-out'});
    }
    animate(beam,[{opacity:0},{opacity:.85,offset:.15},{opacity:.8,offset:.7},{opacity:0}],{duration:460},true);
    later(()=>{if(boardActive())pulse(to);},240);
  }
  function onScoreCard(el) {
    if(!boardActive()||!el)return;
    // Tracked with all effects so pause and motion changes cancel the bounce.
    animate(el,[
      {translate:'0 0',rotate:'0deg',scale:'1',filter:'brightness(1)',boxShadow:'0 7px 12px #06137f30'},
      {translate:'0 -15px',rotate:'-4deg',scale:'1.13',filter:'brightness(1.08)',boxShadow:'0 0 0 2px #f4ff28,0 0 24px #f4ff2880',offset:.22},
      {translate:'0 -5px',rotate:'2deg',scale:'1.03',filter:'brightness(1.04)',boxShadow:'0 0 0 1px #f4ff2870,0 0 10px #f4ff2830',offset:.57},
      {translate:'0 0',rotate:'0deg',scale:'1',filter:'brightness(1)',boxShadow:'0 7px 12px #06137f30'}
    ],{duration:420});
    const p=rect(el);
    if(p&&el.dataset.rank){
      const value=piece('card-value-pop',p.x,p.y-p.height*.38);
      if(value){value.textContent=el.dataset.rank;value.style.color=getComputedStyle(el).color;
        animate(value,[{transform:'translate(-50%,0) scale(.5)',opacity:0},{transform:'translate(-50%,-12px) scale(1.2)',opacity:1,offset:.2},{transform:'translate(-50%,-20px) scale(1)',opacity:1,offset:.6},{transform:'translate(-50%,-38px) scale(.9)',opacity:0}],{duration:620},true);
      }
    }
    cardCharge(el,'#7eece4',true);
    lightning(el,Math.min(110,rect(el)?.height||90),4);
    energyLink(el,$('pVal'));
    burst(el,{count:6,reach:48,color:'#7eece4'});
    haptic();
  }
  function impact(el){
    if(!boardActive())return;
    const p=rect(el);if(!p)return;
    const wash=piece('impact-wash',p.x,p.y);
    animate(wash,[
      {transform:'translate(-50%,-50%) scale(.45)',opacity:0},
      {transform:'translate(-50%,-50%) scale(1.28)',opacity:.85,offset:.18},
      {transform:'translate(-50%,-50%) scale(1.75)',opacity:0}
    ],{duration:480},true);
    for(let i=0;i<9;i++){
      const angle=(i/9)*Math.PI*2;
      const ray=piece('impact-ray',p.x,p.y);
      const x=Math.cos(angle)*105,y=Math.sin(angle)*105;
      animate(ray,[
        {transform:`translate(-50%,-50%) rotate(${angle}rad) scaleX(.2)`,opacity:0},
        {transform:`translate(calc(-50% + ${x*.5}px),calc(-50% + ${y*.5}px)) rotate(${angle}rad) scaleX(1)`,opacity:1,offset:.2},
        {transform:`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${angle}rad) scaleX(.1)`,opacity:0}
      ],{duration:330},true);
    }
  }
  function onCombo(line){
    if(!boardActive())return;
    const p=rect($('center'));if(!p)return;
    const previous=[...layer.querySelectorAll('.combo-impact')];
    while(previous.length>1)previous.shift().remove();
    previous.reverse().forEach((label,i)=>{label.style.top=(p.y-(i+1)*27)+'px';});
    const el=piece('combo-impact',p.x,p.y);
    if(!el)return;
    // These labels come directly from the engine's real scoring calculation.
    const plain=document.createElement('span');plain.innerHTML=line[0]+' '+line[1];
    el.textContent=plain.textContent;
    const name=document.createElement('span');name.innerHTML=line[0];
    const key=name.textContent.trim().toLocaleLowerCase();
    const box=[...$('comboRow').querySelectorAll('.combo-tile.on')].find(box=>box.querySelector('.combo-name').textContent.split(' ×')[0].trim().toLocaleLowerCase()===key);
    if(box)markComboPaid(box);
    if(reduced()){el.style.transform='translate(-50%,-50%)';later(()=>el.remove(),600);return;}
    animate(el,[
      {transform:'translate(-50%,-50%) rotate(-7deg) scale(1.5)',opacity:0},
      {transform:'translate(-50%,-50%) rotate(-4deg) scale(.94)',opacity:1,offset:.16},
      {transform:'translate(-50%,-50%) rotate(-4deg) scale(1)',opacity:1,offset:.36},
      {transform:'translate(-50%,-70%) rotate(-2deg) scale(.96)',opacity:0}
    ],{duration:680},true);
    kick(2.5);lightning($('center'),115,5,'#b49aff');
    energyLink($('pHand'),$('multVal'));pulse($('multVal'),true);
  }
  function onRelic(el) {
    if(!boardActive())return;
    animate(el.querySelector('.effect-mark')||el,[{filter:'brightness(1)'},{filter:'brightness(1.45)',offset:.28},{filter:'brightness(1)'}],{duration:440});
    kick(3);lightning(el,80,5,'#b49aff');
    energyLink(el,$('multVal'),'#b49aff');
    burst(el, {count:14,reach:90,color:'#ff9238',ring:true});
    pulse($('multVal'),true);
  }
  function onPressure() {
    const level = barakaLevel();
    $('felt').dataset.arcadeHeat = String(level);
    if (level > lastLevel) {burst($('pBar'),{count:12,reach:75});pulse($('pBar'));}
    lastLevel = level;
  }
  function onComboReady(box){
    if(!boardActive())return;
    animate(box,[{scale:'.95',filter:'brightness(1)'},{scale:'1.08',filter:'brightness(1.3)',offset:.35},{scale:'1',filter:'brightness(1)'}],{duration:360});
    burst(box,{count:4,reach:22,color:'#ffce3a'});
  }
  function markComboPaid(box){
    if(box.classList.contains('paid'))return;
    box.classList.add('paid');
    const label=LANG==='fr'?'Bonus gagné':'Bonus won';
    box.querySelector('.combo-detail').textContent=label;
    box.setAttribute('aria-label',box.querySelector('.combo-name').textContent+' · '+label);
    box.title=box.getAttribute('aria-label');
    if(boardActive()){pulse(box,true);burst(box,{count:5,reach:28,color:'#7eece4'});}
  }
  function onHome(){
    if(reduced()||document.hidden||!$('modeMenu').classList.contains('show')||document.querySelector('.overlay.show:not(#modeMenu),#adOverlay.show'))return;
    [...$('menuHand').children].forEach((card,i)=>{
      animate(card,[{translate:'0 30px',rotate:`${(i-1)*8}deg`,scale:'.9',opacity:0},{translate:'0 -4px',rotate:'0deg',scale:'1.025',opacity:1,offset:.68},{translate:'0 0',rotate:'0deg',scale:'1',opacity:1}],{duration:640,delay:i*65});
      later(()=>{
        if(!card.isConnected||!$('modeMenu').classList.contains('show'))return;
        animate(card,[{translate:'0 0',rotate:'0deg'},{translate:`0 ${i===1?-4:-2}px`,rotate:i===0?'-.5deg':'.5deg',offset:.5},{translate:'0 0',rotate:'0deg'}],{duration:4200+i*470,iterations:Infinity,easing:'ease-in-out'});
      },860+i*65);
    });
  }
  window.ColdDeckFX = {
    get reduced() { return reduced(); },
    clear, onHome, onCardLand, onCard, onResult, onScoreCard, onRelic, onPressure, onAnnouncement, onCombo, onComboReady,
    setMotion(value){
      preference=value==='gentle'?'gentle':'punchy';
      try{localStorage.setItem('colddeck-motion',preference);}catch(e){}
      clear();syncMotion();renderMotionOptions();
    },
    onGoal() { onAnnouncement(); kick(7); lightning($('objBar'),160,6); burst($('objBar'), {count:20,reach:135,ring:true}); },
    onRecord() { burst($('recPop'), {count:12,reach:85}); }
  };
  document.addEventListener('visibilitychange', () => {
    document.documentElement.dataset.pageHidden=String(document.hidden);
    if (document.hidden) clear();else onHome();
  });
  motion.addEventListener('change', () => {clear();syncMotion();renderMotionOptions();});
  window.addEventListener('pagehide', clear);
  // Existing navigation owns game state; this observer cleans up presentation only.
  const menuCleanup = new MutationObserver(() => {
    clear();onHome();
  });
  document.querySelectorAll('.overlay,#adOverlay').forEach(el => menuCleanup.observe(el,{attributes:true,attributeFilter:['class']}));
  function renderMotionOptions(){
    const options=$('motionOpts');if(!options)return;
    options.replaceChildren();
    for(const [value,key] of [['punchy','modern.punchy'],['gentle','modern.calm']]){
      const b=document.createElement('button');b.className='btn';b.type='button';b.textContent=t(key);
      const active=value===(reduced()?'gentle':'punchy');
      b.disabled=value==='punchy'&&motion.matches;
      b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active));
      b.onclick=()=>window.ColdDeckFX.setMotion(value);options.appendChild(b);
    }
  }
  const originalSettings=openSettings;
  openSettings=function(){originalSettings();renderMotionOptions();};
  const originalLanguage=setLang;
  setLang=function(id){originalLanguage(id);renderMotionOptions();};

  // Animate the lettering, while preserving a whole-word accessible label.
  // Observe only the small regions the renderer replaces, never each frame.
  const liveRegions=[document.querySelector('.menuTitle'),$('tableName'),$('gainVal'),$('multVal'),$('actions'),$('planqueTitle'),...document.querySelectorAll('.zlbl,.mode-card strong')].filter(Boolean);
  const letterTargets='.menuTitle,#gainVal,#multVal,#pVal,#dVal,#actions .blbl,#planqueTitle,.mode-card strong';
  function enlivenLetters(){
    document.querySelectorAll(letterTargets).forEach(el=>{
      if(el.matches('.menuTitle,#gainVal,#multVal,#pVal,#dVal,.zlbl>[data-i18n],#actions .blbl,.mode-card strong,#planqueTitle'))return;
      if(el.querySelector('.live-letter'))return;
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){
        if(!node.textContent.trim()||node.parentElement.closest('svg,small'))continue;
        const fragment=document.createDocumentFragment();
        for(const word of node.textContent.split(/(\s+)/u)){
          if(!word.trim()){fragment.append(document.createTextNode(word));continue;}
          const group=document.createElement('span');group.className='live-word';
          const readable=document.createElement('span');readable.className='sr-only';readable.textContent=word;group.append(readable);
          const ink=document.createElement('span');ink.className='live-ink';ink.setAttribute('aria-hidden','true');
          for(const character of word){
            const letter=document.createElement('i');letter.className='live-letter';letter.textContent=character;
            const duration=.95+random()*.3;
            letter.style.setProperty('--letter-duration',duration.toFixed(3)+'s');
            letter.style.setProperty('--letter-delay',(-random()*duration).toFixed(3)+'s');
            ink.append(letter);
          }
          group.append(ink);fragment.append(group);
        }
        node.replaceWith(fragment);
      }
    });
  }
  const lettersObserver=new MutationObserver(()=>{
    lettersObserver.disconnect();enlivenLetters();observeLetters();
  });
  function observeLetters(){liveRegions.forEach(el=>lettersObserver.observe(el,{childList:true,subtree:true,characterData:true}));}
  enlivenLetters();observeLetters();
  document.addEventListener('pointerdown',event=>{
    const button=event.target instanceof Element?event.target.closest('button'):null;
    if(!button||button.disabled||button.closest('[inert]'))return;
    animate(button,[{scale:'1'},{scale:'.96',offset:.3},{scale:'1'}],{duration:170});
    if(button.closest('#actions,#chips'))haptic();
  });
  onPressure();
  onHome();
})();

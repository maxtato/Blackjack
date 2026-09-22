/* Presentation effects only. No writes to game state or use of the deck's RNG. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.id = 'arcadeFX';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  const animations = new Set();
  const timers = new Set();
  let seed = (performance.now() * 1000) >>> 0;
  let lastLevel = barakaLevel();
  let popupTimer;
  const palette = ['#e3f479', '#ff826c', '#83d7ba', '#94c7f6', '#f6f1e5'];
  const suitInk = {'♠':'#94c7f6', '♥':'#ff9882', '♦':'#f3d382', '♣':'#83d7ba'};
  let preference;
  try{preference=localStorage.getItem('colddeck-motion');}catch(e){}
  const reduced = () => preference==='gentle'||motion.matches;
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
    $('felt')?.removeAttribute('data-arcade-result');
    $('multPop')?.classList.remove('go');
  }
  function animate(el, frames, options, remove = false) {
    if (!el || reduced()) { if (remove) el?.remove(); return; }
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
  function piece(cls, x, y, color) {
    if (layer.childElementCount >= 84) return null;
    const el = document.createElement('i');
    el.className = cls;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    if (color) el.style.setProperty('--spark', color);
    layer.appendChild(el);
    return el;
  }
  function burst(el, {count=10, reach=58, color, ring=false} = {}) {
    if (reduced() || document.hidden) return;
    const p = rect(el); if (!p) return;
    if (ring) {
      const halo = piece('arcade-ring', p.x, p.y, color);
      animate(halo, [
        {transform:'translate(-50%,-50%) rotate(0deg) scale(.45)', opacity:.8},
        {transform:'translate(-50%,-50%) rotate(35deg) scale(2.2)', opacity:0}
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
    $('felt').dataset.arcadeResult = kind;
    later(() => $('felt')?.removeAttribute('data-arcade-result'), 800);
    if (kind === 'win') {
      burst($('pHand'), {count:natural?26:mult>=3?22:14,reach:natural?150:105,ring:true});
      collectCoins(natural?13:mult>=3?11:7);
      pulse($('scorebox'), true);
    } else if (kind === 'lose') {
      pulse($('pVal'));
    } else {
      burst($('pVal'), {count:6,reach:36,color:'#a2d0ff'});
    }
  }
  function cardNode(card) {
    const dealer = G.dHand.includes(card);
    const container = $(dealer?'dHand':'pHand');
    const nodes = [...container.querySelectorAll('.card:not(.back)')];
    return nodes.find(el => el.dataset.suit === card.s && el.dataset.rank === card.r);
  }
  function onCard(card) {
    const el = cardNode(card); if (!el) return;
    burst(el, {count:card.ed?11:5,reach:card.ed?58:33,color:suitInk[card.s]});
    pulse($(G.dHand.includes(card)?'dVal':'pVal'));
  }
  function onScoreCard(el) {
    impact(el);
    burst(el, {count:14,reach:95,color:'#8edbff',ring:true});
  }
  function impact(el){
    if(reduced()||document.hidden)return;
    const p=rect(el);if(!p)return;
    const wash=piece('impact-wash',p.x,p.y);
    animate(wash,[
      {transform:'translate(-50%,-50%) scale(.45)',opacity:0},
      {transform:'translate(-50%,-50%) scale(1.28)',opacity:.85,offset:.18},
      {transform:'translate(-50%,-50%) scale(1.75)',opacity:0}
    ],{duration:480},true);
    for(let i=0;i<7;i++){
      const angle=(i/7)*Math.PI*2;
      const ray=piece('impact-ray',p.x,p.y);
      const x=Math.cos(angle)*75,y=Math.sin(angle)*75;
      animate(ray,[
        {transform:`translate(-50%,-50%) rotate(${angle}rad) scaleX(.2)`,opacity:0},
        {transform:`translate(calc(-50% + ${x*.5}px),calc(-50% + ${y*.5}px)) rotate(${angle}rad) scaleX(1)`,opacity:1,offset:.2},
        {transform:`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${angle}rad) scaleX(.1)`,opacity:0}
      ],{duration:330},true);
    }
  }
  function onCombo(line){
    layer.querySelector('.combo-impact')?.remove();
    const p=rect($('center'));if(!p)return;
    const el=piece('combo-impact',p.x,p.y);
    if(!el)return;
    // These labels come directly from the engine's real scoring calculation.
    const plain=document.createElement('span');plain.innerHTML=line[0]+' '+line[1];
    el.textContent=plain.textContent;
    if(reduced()){el.style.transform='translate(-50%,-50%)';later(()=>el.remove(),600);return;}
    animate(el,[
      {transform:'translate(-50%,-50%) rotate(-7deg) scale(1.5)',opacity:0},
      {transform:'translate(-50%,-50%) rotate(-4deg) scale(.94)',opacity:1,offset:.16},
      {transform:'translate(-50%,-50%) rotate(-4deg) scale(1)',opacity:1,offset:.36},
      {transform:'translate(-50%,-70%) rotate(-2deg) scale(.96)',opacity:0}
    ],{duration:470},true);
    impact($('multVal'));pulse($('multVal'),true);
  }
  function onRelic(el) {
    burst(el, {count:14,reach:70,color:'#e3f479',ring:true});
    pulse($('multVal'),true);
  }
  function onPressure() {
    const level = barakaLevel();
    $('felt').dataset.arcadeHeat = String(level);
    if (level > lastLevel) {burst($('pBar'),{count:12,reach:75});pulse($('pBar'));}
    lastLevel = level;
  }
  window.ColdDeckFX = {
    get reduced() { return reduced(); },
    clear, onCard, onResult, onScoreCard, onRelic, onPressure, onAnnouncement, onCombo,
    setMotion(value){
      preference=value==='gentle'?'gentle':'punchy';
      try{localStorage.setItem('colddeck-motion',preference);}catch(e){}
      clear();syncMotion();renderMotionOptions();
    },
    onGoal() { onAnnouncement(); burst($('objBar'), {count:20,reach:100,ring:true}); },
    onRecord() { burst($('recPop'), {count:12,reach:85}); }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  motion.addEventListener('change', () => {clear();syncMotion();renderMotionOptions();});
  window.addEventListener('pagehide', clear);
  // Existing navigation owns game state; this observer cleans up presentation only.
  const menuCleanup = new MutationObserver(() => {
    if (document.querySelector('.overlay.show,#adOverlay.show')) clear();
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
  onPressure();
})();

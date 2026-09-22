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
  let cameraAnimation, lastHaptic = -Infinity;
  const palette = ['#edc989', '#b65268', '#8ba875', '#62bfff', '#fff4dd'];
  const suitInk = {'♠':'#62bfff', '♥':'#be586e', '♦':'#d7ac59', '♣':'#78a87e'};
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
    cameraAnimation = null;
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
  function piece(cls, x, y, color) {
    if (layer.childElementCount >= 84) return null;
    const el = document.createElement('i');
    el.className = cls;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    if (color) el.style.setProperty('--spark', color);
    layer.appendChild(el);
    return el;
  }
  function haptic(strong=false) {
    if (reduced() || document.hidden || document.querySelector('.overlay.show,#adOverlay.show')) return;
    const now = performance.now();
    if (now-lastHaptic < 95) return;
    lastHaptic = now;
    try { navigator.vibrate?.(strong ? [16,24,28] : 8); } catch(e) {}
  }
  // Individual translate/rotate compose with the engine's separate #shaker.
  function kick(strength=3) {
    if (reduced() || document.hidden || document.querySelector('.overlay.show,#adOverlay.show')) return;
    cameraAnimation?.cancel();
    const x = Math.min(strength,8), direction = random()>.5 ? 1 : -1;
    cameraAnimation = animate($('app'), [
      {translate:'0px 0px',rotate:'0deg'},
      {translate:`${-x*direction}px ${x*.55}px`,rotate:`${-.025*x*direction}deg`,offset:.12},
      {translate:`${x*.7*direction}px ${-x*.35}px`,rotate:`${.016*x*direction}deg`,offset:.3},
      {translate:`${-x*.4*direction}px ${x*.15}px`,rotate:'0deg',offset:.52},
      {translate:`${x*.16*direction}px 0px`,rotate:'0deg',offset:.72},
      {translate:'0px 0px',rotate:'0deg'}
    ], {duration:strength>=6?360:245,easing:'ease-out'});
    haptic(strength>=6);
  }
  function lightning(el, reach=110, arms=5) {
    if (reduced() || document.hidden) return;
    const p=rect(el);if(!p)return;
    const bolt=piece('arcade-lightning',p.x,p.y);if(!bolt)return;
    const radius=Math.min(reach,innerWidth*.48),size=radius*2+40,center=size/2;
    bolt.style.width=bolt.style.height=size+'px';
    let path='';
    for(let arm=0;arm<arms;arm++){
      const angle=arm/arms*Math.PI*2+random()*.5,length=radius*(.7+random()*.3);
      const points=[[center,center]];
      for(let step=1;step<=6;step++){
        const d=length*step/6,jitter=(random()-.5)*24;
        points.push([center+Math.cos(angle)*d-Math.sin(angle)*jitter,center+Math.sin(angle)*d+Math.cos(angle)*jitter]);
      }
      path+='M'+points.map(([x,y])=>x.toFixed(1)+' '+y.toFixed(1)).join('L');
      const [bx,by]=points[3],branch=angle+(arm%2?-.85:.85);
      path+=`M${bx.toFixed(1)} ${by.toFixed(1)}l${(Math.cos(branch)*22).toFixed(1)} ${(Math.sin(branch)*22).toFixed(1)} ${(Math.cos(branch+.6)*16).toFixed(1)} ${(Math.sin(branch+.6)*16).toFixed(1)}`;
    }
    bolt.innerHTML=`<svg viewBox="0 0 ${size} ${size}" fill="none" aria-hidden="true"><path class="bolt-glow" d="${path}"/><path class="bolt-core" d="${path}"/></svg>`;
    animate(bolt,[
      {transform:'translate(-50%,-50%) scale(.38)',opacity:0},
      {transform:'translate(-50%,-50%) scale(.96)',opacity:1,offset:.1},
      {transform:'translate(-50%,-50%) scale(1.03)',opacity:.9,offset:.34},
      {transform:'translate(-50%,-50%) scale(1.09)',opacity:0}
    ],{duration:360,easing:'ease-out'},true);
  }
  function burst(el, {count=10, reach=58, color, ring=false} = {}) {
    if (reduced() || document.hidden) return;
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
    $('felt').dataset.arcadeResult = kind;
    later(() => $('felt')?.removeAttribute('data-arcade-result'), 800);
    if (kind === 'win') {
      const big = natural || mult>=3;
      kick(big?8:5);
      lightning($('pHand'),big?235:145,big?8:5);
      impact($('pHand'));
      burst($('pHand'), {count:big?28:18,reach:big?205:135,ring:true});
      if(big)later(()=>{
        lightning($('center'),190,6);
        burst($('center'),{count:12,reach:170,color:'#edc989',ring:true});
      },125);
      collectCoins(natural?13:mult>=3?11:7);
      pulse($('scorebox'), true);
    } else if (kind === 'lose') {
      kick(4);
      burst($('pVal'),{count:10,reach:68,color:'#a54960'});
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
    haptic();
    if(card.ed)lightning(el,80,3);
  }
  function onScoreCard(el) {
    kick(3);
    lightning(el,115,5);
    impact(el);
    burst(el, {count:12,reach:110,color:'#70c4ff',ring:true});
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
    kick(4.5);lightning($('center'),145,5);
    impact($('multVal'));pulse($('multVal'),true);
  }
  function onRelic(el) {
    kick(3);lightning(el,90,4);
    burst(el, {count:14,reach:90,color:'#edc989',ring:true});
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
    onGoal() { onAnnouncement(); kick(7); lightning($('objBar'),160,6); burst($('objBar'), {count:20,reach:135,ring:true}); },
    onRecord() { burst($('recPop'), {count:12,reach:85}); }
  };
  document.addEventListener('visibilitychange', () => {
    document.documentElement.dataset.pageHidden=String(document.hidden);
    if (document.hidden) clear();
  });
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

  // Animate the lettering, while preserving a whole-word accessible label.
  // Observe only the small regions the renderer replaces, never each frame.
  const liveRegions=[document.querySelector('.menuTitle'),$('tableName'),$('gainVal'),$('multVal'),$('actions'),$('planqueTitle'),...document.querySelectorAll('.mode-card strong')].filter(Boolean);
  const letterTargets='.menuTitle,#tableName,#gainVal,#multVal,.actMain .blbl,#planqueTitle,.mode-card strong';
  function enlivenLetters(){
    document.querySelectorAll(letterTargets).forEach(el=>{
      if(el.querySelector('.live-letter'))return;
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      let index=0;
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
            letter.style.setProperty('--letter-delay',(-index*.19-.4)+'s');
            ink.append(letter);index++;
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
})();

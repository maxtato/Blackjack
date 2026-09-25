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
  let cameraAnimation, lastHaptic = -Infinity;
  const palette = ['#ffce3a', '#fff7e6', '#1fd1c8', '#ff5470', '#a64dff'];
  let preference;
  try{preference=localStorage.getItem('colddeck-motion');}catch(e){}
  const reduced = () => preference==='gentle'||motion.matches;
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
    const bolt=piece('arcade-lightning',p.x-origin.left,p.y-origin.top,null,inside?lightningLayer:layer);if(!bolt)return;
    const radius=Math.min(reach,innerWidth*.56),size=radius*2+70;
    bolt.style.width=bolt.style.height=size+'px';
    bolt.innerHTML=ColdDeckArt.illustration('ui-burst','lightning-art');
    bolt.firstElementChild.style.transform=`rotate(${(arms%2?1:-1)*(3+random()*7)}deg)`;
    animate(bolt,[
      {transform:'translate(-50%,-50%) scale(.38)',opacity:0},
      {transform:'translate(-50%,-50%) scale(.96)',opacity:1,offset:.1},
      {transform:'translate(-50%,-50%) scale(1.03)',opacity:.9,offset:.34},
      {transform:'translate(-50%,-50%) scale(1.09)',opacity:0}
    ],{duration:430,easing:'ease-out'},true);
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
      lightning($('pHand'),big?310:230,big?8:6);
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
    const nodes = [...container.querySelectorAll('.card:not(.back)')];
    return nodes.find(el => el.dataset.suit === card.s && el.dataset.rank === card.r);
  }
  function onCard(card) {
    const el = cardNode(card); if (!el) return;
    pulse($(G.dHand.includes(card)?'dVal':'pVal'));
  }
  function onFlip(wrap,card,duration=300){
    if(reduced()||document.hidden)return;
    // Anchor to the stable slot, not to the narrowing face. This covers the
    // dealer's hidden card too and survives the final hand redraw.
    later(()=>{
      if(!wrap.isConnected||reduced()||document.hidden||document.querySelector('.overlay.show,#adOverlay.show'))return;
      const p=rect(wrap.closest('.cardslot'));if(!p)return;
      const target=lightningLayer||layer;
      const origin=lightningLayer?lightningLayer.getBoundingClientRect():{left:0,top:0};
      const shock=piece('flip-impact',p.x-origin.left,p.y-origin.top,null,target);if(!shock)return;
      shock.style.width=(p.width*2.1)+'px';shock.style.height=(p.height*1.9)+'px';
      shock.innerHTML=ColdDeckArt.illustration('ui-burst','flip-impact-art');
      animate(shock,[
        {transform:'translate(-50%,-50%) scale(.72)',opacity:0},
        {transform:'translate(-50%,-50%) scale(.96)',opacity:card.ed?1:.86,offset:.18},
        {transform:'translate(-50%,-50%) scale(1.04)',opacity:.62,offset:.45},
        {transform:'translate(-50%,-50%) scale(1.18)',opacity:0}
      ],{duration:260,easing:'cubic-bezier(.15,.8,.3,1)'},true);
      haptic();
    },Math.round(duration*.64));
  }
  // Reference rhythm: a local card accent, then an energy transfer to the HUD.
  function energyLink(from,to){
    if(reduced()||document.hidden)return;
    const a=rect(from),b=rect(to);if(!a||!b)return;
    const left=Math.min(a.x,b.x)-18,top=Math.min(a.y,b.y)-18;
    const width=Math.abs(b.x-a.x)+36,height=Math.abs(b.y-a.y)+36;
    const beam=piece('score-link',left,top);if(!beam)return;
    beam.style.width=width+'px';beam.style.height=height+'px';
    const x=a.x-left,y=a.y-top,dx=b.x-a.x,dy=b.y-a.y;
    const bend=(random()-.5)*22;
    const d=`M${x} ${y} L${x+dx*.32+bend} ${y+dy*.32} L${x+dx*.49-bend} ${y+dy*.49} L${x+dx*.7+bend} ${y+dy*.7} L${b.x-left} ${b.y-top}`;
    beam.innerHTML=`<svg viewBox="0 0 ${width} ${height}" aria-hidden="true"><path class="score-link-halo" d="${d}"/><path class="score-link-core" d="${d}"/></svg>`;
    animate(beam,[{opacity:0},{opacity:.9,offset:.15},{opacity:.65,offset:.5},{opacity:0}],{duration:260},true);
  }
  function onScoreCard(el) {
    if(reduced()||document.hidden||!el)return;
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
    energyLink(el,$('multVal'));
    burst(el,{count:7,reach:65,color:'#f4ff28'});
    haptic();
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
    const p=rect($('center'));if(!p)return;
    const previous=[...layer.querySelectorAll('.combo-impact')];
    while(previous.length>1)previous.shift().remove();
    previous.reverse().forEach((label,i)=>{label.style.top=(p.y-(i+1)*27)+'px';});
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
    ],{duration:680},true);
    kick(2.5);lightning($('center'),125,4);
    energyLink($('pHand'),$('multVal'));pulse($('multVal'),true);
  }
  function onRelic(el) {
    kick(3);lightning(el,90,4);
    burst(el, {count:14,reach:90,color:'#ff9238',ring:true});
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
    clear, onCard, onFlip, onResult, onScoreCard, onRelic, onPressure, onAnnouncement, onCombo,
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
  const liveRegions=[document.querySelector('.menuTitle'),$('tableName'),$('gainVal'),$('multVal'),$('actions'),$('planqueTitle'),...document.querySelectorAll('.zlbl,.mode-card strong')].filter(Boolean);
  const letterTargets='.menuTitle,#tableName,#gainVal,#multVal,#pVal,#dVal,.zlbl>[data-i18n],#actions .blbl,#planqueTitle,.mode-card strong';
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
})();

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
  let popupTimer, chainStar, chainCount=0;
  const graphic={yellow:'#ffce3a',cream:'#fff7e6',teal:'#1fd1c8',purple:'#a986ca'};
  document.documentElement.dataset.effectsStyle='graphic';
  let lastHaptic = -Infinity;
  const palette = [graphic.yellow,graphic.cream,graphic.teal,graphic.purple];
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
    chainStar=null;chainCount=0;
    shakeAmt = 0;
    $('shaker').style.transform = '';
    try { navigator.vibrate?.(0); } catch(e) {}
    $('felt')?.removeAttribute('data-arcade-result');
    $('multPop')?.classList.remove('go','gain-in-flight');
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
  function handRect(el){
    let p=rect(el);if(!p)return null;
    const cards=[...el.querySelectorAll('.card')].map(card=>card.getBoundingClientRect()).filter(r=>r.width>0);
    if(cards.length){
      const left=Math.min(...cards.map(r=>r.left)),right=Math.max(...cards.map(r=>r.right));
      const top=Math.min(...cards.map(r=>r.top)),bottom=Math.max(...cards.map(r=>r.bottom));
      p={x:(left+right)/2,y:(top+bottom)/2,width:right-left,height:bottom-top};
    }
    return p;
  }
  const place=(dx=0,dy=0,angle=0,scale=1)=>`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${angle}deg) scale(${scale})`;
  function paperBolt(x,y,height,angle,color=graphic.yellow){
    if(!boardActive())return;
    const bolt=piece('paper-bolt paper-ink',x,y,color);if(!bolt)return;
    bolt.style.height=height+'px';bolt.style.width=Math.max(15,height*.28)+'px';
    animate(bolt,[{transform:place(0,0,angle,.2),opacity:0},{transform:place(0,0,angle,1),opacity:1,offset:.18},{transform:place(0,0,angle,.92),opacity:.9,offset:.43},{transform:place(0,0,angle,1.04),opacity:1,offset:.57},{transform:place(0,0,angle,.8),opacity:0}],{duration:540},true);
    return bolt;
  }
  function lightning(el,reach=100,arms=4,color=graphic.yellow){
    if(!boardActive())return;
    const p=handRect(el);if(!p)return;
    for(let i=0;i<Math.min(arms,6);i++){
      const angle=(i/arms*Math.PI*2)-Math.PI/2;
      const x=p.x+Math.cos(angle)*(p.width*.47+12),y=p.y+Math.sin(angle)*(p.height*.36+12);
      paperBolt(Math.max(18,Math.min(innerWidth-18,x)),y,Math.min(84,reach),angle*180/Math.PI+90,color);
    }
  }
  function graphicRays(el,count=3,color=graphic.yellow,reach=34){
    if(!boardActive())return;
    const p=rect(el);if(!p)return;
    for(let i=0;i<count;i++){
      const angle=(count===2?(i?0:Math.PI):(-Math.PI*.9+i*Math.PI*.8));
      const x=Math.cos(angle)*(p.width*.35+reach),y=Math.sin(angle)*reach;
      const ray=piece('graphic-ray paper-ink',p.x,p.y,color);if(!ray)break;
      animate(ray,[{transform:place(x*.6,y*.6,angle*180/Math.PI+90,.2),opacity:0},{transform:place(x,y,angle*180/Math.PI+90,1),opacity:1,offset:.23},{transform:place(x*1.13,y*1.13,angle*180/Math.PI+90,.8),opacity:0}],{duration:460},true);
    }
  }
  const starPoints='50% 0,59% 30%,82% 9%,76% 37%,100% 40%,78% 55%,97% 77%,66% 72%,60% 100%,46% 78%,20% 96%,27% 67%,0 61%,26% 45%,8% 20%,37% 30%';
  function paperStar(x,y,size,color=graphic.yellow){
    const star=piece('paper-star paper-ink',x,y,color);if(!star)return;
    star.style.width=star.style.height=size+'px';star.style.clipPath=`polygon(${starPoints})`;star.style.transform=place();return star;
  }
  function awardStar(box){
    const p=rect(box);if(!p)return;
    const size=Math.max(p.width+35,p.height+40),star=paperStar(p.x,p.y,size,graphic.teal);if(!star)return;
    // A transparent center keeps the real tile and its text above the star.
    const x=(size-p.width-7)/size*50,y=(size-p.height-7)/size*50;
    star.style.clipPath=`polygon(evenodd,${starPoints},50% 0,${x}% ${y}%,${100-x}% ${y}%,${100-x}% ${100-y}%,${x}% ${100-y}%,${x}% ${y}%,50% 0)`;
    animate(star,[{transform:place(0,0,0,1),opacity:0},{transform:place(0,0,0,1.1),opacity:1,offset:.27},{transform:place(0,0,0,1.2),opacity:0}],{duration:540},true);
  }
  function burst(el, {count=8, reach=48, color} = {}) {
    if (!boardActive()) return;
    const p = rect(el); if (!p) return;
    for (let i=0; i<count; i++) {
      const angle = Math.PI * 2 * (i / count) + random() * .4;
      const distance = reach * (.45 + random() * .7);
      const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance;
      const spark = piece('paper-fragment paper-ink', p.x, p.y, color || palette[i % palette.length]);
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
      {scale:'1'},
      {scale:big?'1.1':'1.06', offset:.3},
      {scale:'1'}
    ], {duration:big?480:320});
  }
  function transferGain(gain,mult){
    const announcement=$('multPop');
    later(()=>{
      if(!boardActive()||!announcement.classList.contains('go')||announcement.classList.contains('goal-result'))return;
      const start=rect(announcement.querySelector('.t')),end=rect($('gainVal'));if(!start||!end)return;
      const label=piece('payout-value',start.x,start.y,graphic.yellow);if(!label)return;
      label.innerHTML=ColdDeckArt.lettering((mult>1?fmtMult(mult)+'  ':'')+'+'+cash(gain));
      announcement.classList.add('gain-in-flight');
      graphicRays(label,3,graphic.yellow,28);
      const dx=end.x-start.x,dy=end.y-start.y;
      animate(label,[{transform:place(0,0,-3,.9),opacity:0},{transform:place(0,-3,-3,1.08),opacity:1,offset:.17},{transform:place(0,0,-3,1),opacity:1,offset:.45},{transform:place(dx*.5,dy*.5-15,-7,.75),opacity:1,offset:.72},{transform:place(dx,dy,0,.35),opacity:0}],{duration:840},true);
      later(()=>{if(boardActive())pulse($('gainVal'),true);},710);
    },250);
  }
  function finishChain(){
    if(chainStar?.isConnected){burst(chainStar,{count:10,reach:65,color:graphic.yellow});chainStar.remove();}
    chainStar=null;chainCount=0;
  }
  function onAnnouncement() {
    clearTimeout(popupTimer);
    timers.delete(popupTimer);
    popupTimer = later(() => $('multPop')?.classList.remove('go','gain-in-flight'), 1450);
  }
  function onResult(kind, gain, mult, natural) {
    layer.querySelectorAll('.combo-impact').forEach(el=>el.remove());
    finishChain();
    onAnnouncement();
    const activeTotal=G.splitActive?handValue(G.hands[G.hi]).total:0;
    const dealerTotal=G.splitActive?handValue(G.dHand).total:0;
    const comboWon=G.splitActive?activeTotal<=21&&(dealerTotal>21||activeTotal>dealerTotal):kind==='win';
    if(comboWon)$('comboRow').querySelectorAll('.combo-tile.on:not([data-combo-key="contract"])').forEach(markComboPaid);
    if(!boardActive())return;
    $('felt').dataset.arcadeResult = kind;
    later(() => $('felt')?.removeAttribute('data-arcade-result'), 800);
    if (kind === 'win') {
      const big = natural || mult>=3;
      kick(big?8:5);
      if(big){
        lightning($('pHand'),84,4,graphic.yellow);
        $('pHand').querySelectorAll('.card:not(.back)').forEach((card,i)=>later(()=>cardCharge(card,graphic.cream,true),i*65));
      }
      transferGain(gain,mult);
    } else if (kind === 'lose') {
      kick(4);
      burst($('pVal'),{count:6,reach:35,color:'#d4645f'});
      pulse($('pVal'));
    } else {
      graphicRays($('pVal'),2,graphic.cream,22);
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
  function cardCharge(el,color=graphic.cream,strong=false){
    if(!boardActive()||!el)return;
    el.querySelector('.card-charge')?.remove();
    const glow=piece('card-charge',0,0,color,el);if(!glow)return;
    glow.style.left=glow.style.top='-4px';
    glow.innerHTML='<svg viewBox="0 0 100 148" preserveAspectRatio="none" aria-hidden="true"><path d="M9 2 H91 L98 10 V138 L91 146 H9 L2 138 V10 Z"/></svg>';
    animate(glow,[{opacity:0,scale:'.98'},{opacity:strong?1:.65,scale:'1',offset:.15},{opacity:strong?1:.5,scale:'1',offset:.65},{opacity:0,scale:'1.02'}],{duration:strong?780:300},true);
  }
  function onCardLand(card){
    if(!boardActive())return;
    const el=cardNode(card),p=rect(el);if(!p)return;
    graphicRays(el,2,graphic.cream,12);haptic();
  }
  function onCard(card) {
    if(!boardActive())return;
    const el = cardNode(card); if (!el) return;
    pulse($(G.dHand.includes(card)?'dVal':'pVal'));
    cardCharge(el,card.ed==='poly'?graphic.purple:card.ed==='holo'?graphic.teal:graphic.cream);
  }
  // Reference rhythm: a local card accent, then an energy transfer to the HUD.
  function energyLink(from,to,color=graphic.purple){
    if(!boardActive())return;
    const a=rect(from),b=rect(to);if(!a||!b)return;
    const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI-90;
    const beam=paperBolt((a.x+b.x)/2,(a.y+b.y)/2,Math.min(distance*.8,150),angle,color);
    beam?.classList.add('relic-link');
    later(()=>{if(boardActive())pulse(to);},240);
  }
  function onScoreCard(el) {
    if(!boardActive()||!el)return;
    // Tracked with all effects so pause and motion changes cancel the bounce.
    animate(el,[
      {translate:'0 0',rotate:'0deg',scale:'1'},
      {translate:'0 -8px',rotate:'-2deg',scale:'1.06',offset:.25},
      {translate:'0 -2px',rotate:'1deg',scale:'1.02',offset:.58},
      {translate:'0 0',rotate:'0deg',scale:'1'}
    ],{duration:340});
    const p=rect(el);
    if(p&&el.dataset.rank){
      const value=piece('card-value-pop',p.x,p.y-p.height*.38);
      if(value){value.innerHTML=ColdDeckArt.lettering(el.dataset.rank);value.style.color=graphic.cream;
        animate(value,[{transform:'translate(-50%,0) scale(.5)',opacity:0},{transform:'translate(-50%,-12px) scale(1.2)',opacity:1,offset:.2},{transform:'translate(-50%,-20px) scale(1)',opacity:1,offset:.6},{transform:'translate(-50%,-38px) scale(.9)',opacity:0}],{duration:620},true);
      }
    }
    cardCharge(el,graphic.cream);
    graphicRays(el,2,graphic.yellow,14);
    haptic();
  }
  function onCombo(line){
    if(!boardActive())return;
    const p=rect($('center'));if(!p)return;
    layer.querySelectorAll('.combo-impact').forEach(el=>el.remove());
    if(!chainStar?.isConnected){chainStar=paperStar(p.x,p.y,Math.min(130,innerWidth*.34),graphic.yellow);chainCount=0;}
    if(chainStar){
      const before=.48+Math.min(chainCount,4)*.13;chainCount++;
      const after=.48+Math.min(chainCount,4)*.13;
      chainStar.style.transform=place(0,0,chainCount*13,after);
      animate(chainStar,[{transform:place(0,0,(chainCount-1)*13,before),opacity:.9},{transform:place(0,0,chainCount*13,after),opacity:1}],{duration:190});
    }
    const el=piece('combo-impact',p.x,p.y);
    if(!el)return;
    // These labels come directly from the engine's real scoring calculation.
    const plain=document.createElement('span');plain.innerHTML=line[0]+' '+line[1];
    el.innerHTML=ColdDeckArt.lettering(plain.textContent);
    if(plain.textContent.length>24)el.classList.add('long');
    const name=document.createElement('span');name.innerHTML=line[0];
    const key=name.textContent.trim().toLocaleLowerCase();
    const box=[...$('comboRow').querySelectorAll('.combo-tile.on')].find(box=>box.querySelector('.combo-name').textContent.split(' ×')[0].trim().toLocaleLowerCase()===key);
    if(box)markComboPaid(box);
    animate(el,[
      {transform:'translate(-50%,-50%) rotate(-7deg) scale(1.5)',opacity:0},
      {transform:'translate(-50%,-50%) rotate(-4deg) scale(.94)',opacity:1,offset:.16},
      {transform:'translate(-50%,-50%) rotate(-4deg) scale(1)',opacity:1,offset:.36},
      {transform:'translate(-50%,-70%) rotate(-2deg) scale(.96)',opacity:0}
    ],{duration:450},true);
    kick(2.5);pulse($('multVal'),true);
  }
  function onRelic(el) {
    if(!boardActive())return;
    kick(3);graphicRays(el,3,graphic.purple,21);
    energyLink(el,$('multVal'),graphic.purple);
  }
  function onPressure() {
    const level = barakaLevel();
    $('felt').dataset.arcadeHeat = String(level);
    if (level > lastLevel) {burst($('pBar'),{count:12,reach:75});pulse($('pBar'));}
    lastLevel = level;
  }
  function onComboReady(box){
    if(!boardActive())return;
    pulse(box);graphicRays(box,2,graphic.yellow,9);
  }
  function markComboPaid(box){
    if(box.classList.contains('paid'))return;
    box.classList.add('paid');
    const label=LANG==='fr'?'Bonus gagné':'Bonus won';
    box.querySelector('.combo-detail').textContent=label;
    box.setAttribute('aria-label',box.querySelector('.combo-name').textContent+' · '+label);
    box.title=box.getAttribute('aria-label');
    if(boardActive()){awardStar(box);pulse(box,true);}
  }
  function onGoal(){
    onAnnouncement();$('multPop').classList.remove('gain-in-flight');$('multPop').classList.add('goal-result');
    if(!boardActive())return;
    const p=rect($('objBar'));if(!p)return;
    const wave=piece('objective-wave',p.x,p.y,graphic.teal);
    if(wave){wave.style.width=p.width+8+'px';wave.style.height=p.height+8+'px';
      animate(wave,[{transform:place(0,0,0,.96),opacity:0},{transform:place(0,0,0,1.04),opacity:1,offset:.25},{transform:place(0,0,0,1.28),opacity:0}],{duration:700},true);}
    later(()=>graphicRays($('tableNumber'),3,graphic.teal,22),250);kick(7);
  }
  function onRecord(){
    if(!boardActive())return;
    const pop=$('recPop'),p=rect(pop);if(!p)return;
    pop.querySelector('.rm').textContent=t('rec.banner').replace(/★/g,'').trim();
    for(let i=0;i<3;i++)later(()=>{
      if(!boardActive())return;
      const star=paperStar(p.x+(i-1)*Math.min(p.width*.4,72),p.y-p.height*.7-(i===1?13:0),i===1?25:19,graphic.cream);if(!star)return;
      animate(star,[{transform:place(0,5,-15,.15),opacity:0},{transform:place(0,0,4,1.15),opacity:1,offset:.25},{transform:place(0,0,0,1),opacity:1,offset:.7},{transform:place(0,-6,8,.7),opacity:0}],{duration:640},true);
    },i*155);
    later(()=>burst(pop,{count:7,reach:55,color:graphic.cream}),720);
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
    onGoal,onRecord
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

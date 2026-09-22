/* Presentation only: the blackjack engine and progression are unchanged. */
Object.assign(STR.fr,{
 'modern.club':'CLUB PRIVÉ · BLACKJACK ROGUELITE','modern.private':'CLUB PRIVÉ','modern.afterhours':'APRÈS MINUIT',
 'modern.hero':'Une carte de plus.<br>Et tout peut basculer.','modern.tag1':'DES COMBOS','modern.tag2':'DU CULOT','modern.goal':'OBJECTIF','modern.loadout':'TES ATOUTS','modern.empty':'Ta prochaine belle main commence ici.','modern.artCaption':'LA MAISON OBSERVE.','modern.motion':'ANIMATIONS','modern.punchy':'Punchy','modern.calm':'Douces',
 'nav.rules':'RÈGLES','nav.settings':'RÉGLAGES','nav.back':'← MODES DE JEU','nav.reset':'Réinitialiser ce mode',
 'menu.choose':'CHOISIS TA TABLE','menu.freeTag':'À TON RYTHME','menu.circuitTag':"L'AVENTURE",
 'menu.endless':'LIBRE','menu.endlessSub':'Du blackjack, sans missions.',
 'menu.circuit':'CIRCUIT','menu.circuitSub':n=>n+' tables · boss, reliques & tarots',
 'menu.freeAction':'PRENDRE PLACE','menu.circuitAction':'ENTRER DANS LE CIRCUIT',
 'menu.recordNote':'Ta progression est conservée sur cet appareil.',
 'menu.nextHand':"LA PROCHAINE MAIN T'ATTEND",'menu.preparation':'TA PRÉPARATION',
 'menu.first':'Aucune partie jouée','planque.subInf':'Enchaîne les mains à ton rythme. Tu décides quand encaisser.',
 'planque.subCircuit':'Prépare tes atouts, puis tente la traversée du casino.',
 'planque.modeInf':'MODE LIBRE','planque.modeCircuit':'MODE CIRCUIT',
 'planque.seeAll':'LA COLLECTION →','planque.start':'JOUER',
 'planque.startInf':'sans mission · sans limite de mains',
 'planque.startCircuit':n=>'circuit · '+n+' tables',
 'set.title':'RÉGLAGES','set.close':'TERMINÉ','set.dev':'OUTILS DE DÉMONSTRATION',
 'rules.close':'RETOUR','rules.basic':'Les bases du blackjack','rules.bonuses':'Baraka & combinaisons','rules.modes':'Les modes de jeu',
 'tok.bankI':'+$','tok.pourboireI':'+$<small>/main</small>'
});
Object.assign(STR.en,{
 'modern.club':'PRIVATE CLUB · BLACKJACK ROGUELITE','modern.private':'PRIVATE CLUB','modern.afterhours':'AFTER HOURS',
 'modern.hero':'One more card.<br>And everything can change.','modern.tag1':'BIG COMBOS','modern.tag2':'BOLD MOVES','modern.goal':'TARGET','modern.loadout':'YOUR PERKS','modern.empty':'Your next great hand starts here.','modern.artCaption':'THE HOUSE IS WATCHING.','modern.motion':'ANIMATIONS','modern.punchy':'Punchy','modern.calm':'Gentle',
 'nav.rules':'HOW TO PLAY','nav.settings':'SETTINGS','nav.back':'← GAME MODES','nav.reset':'Reset this mode',
 'menu.choose':'CHOOSE YOUR TABLE','menu.freeTag':'AT YOUR OWN PACE','menu.circuitTag':'THE ADVENTURE',
 'menu.endless':'FREE PLAY','menu.endlessSub':'Blackjack. No missions.',
 'menu.circuit':'CIRCUIT','menu.circuitSub':n=>n+' tables · bosses, relics & tarots',
 'menu.freeAction':'TAKE A SEAT','menu.circuitAction':'ENTER THE CIRCUIT',
 'menu.recordNote':'Your progress is saved on this device.',
 'menu.nextHand':'YOUR NEXT HAND AWAITS','menu.preparation':'YOUR PREPARATION',
 'menu.first':'No games played yet','planque.subInf':'Play hand after hand at your own pace. Cash out when you choose.',
 'planque.subCircuit':'Prepare your perks, then take on the casino.',
 'planque.modeInf':'FREE PLAY','planque.modeCircuit':'CIRCUIT MODE',
 'planque.seeAll':'THE COLLECTION →','planque.start':'PLAY',
 'planque.startInf':'no missions · unlimited hands','planque.startCircuit':n=>'circuit · '+n+' tables',
 'set.close':'DONE','set.dev':'DEMO TOOLS','rules.close':'BACK',
 'rules.basic':'Blackjack basics','rules.bonuses':'Streaks & combinations','rules.modes':'Game modes',
 'tok.bankI':'+$','tok.pourboireI':'+$<small>/hand</small>'
});
for(const key of Object.keys(STR.fr))if(typeof STR.fr[key]==='string')STR.fr[key]=STR.fr[key].replaceAll('SANS FIN','LIBRE').replaceAll('LA TOURNÉE','CIRCUIT');
for(const key of Object.keys(STR.en))if(typeof STR.en[key]==='string')STR.en[key]=STR.en[key].replaceAll('ENDLESS','FREE PLAY');
STR.fr['top.metaInf']=(p,a,b)=>'∞ LIBRE · palier '+p+' · mise '+a+'–'+b;
STR.en['top.metaInf']=(p,a,b)=>'∞ FREE PLAY · tier '+p+' · bet '+a+'–'+b;
STR.fr['rules.table']='<span class="rt">LES TABLES DU CIRCUIT</span>Atteins l’objectif de jetons avant d’épuiser tes mains. La table se termine dès que l’objectif est atteint. Les mises ont un minimum et un maximum propres à la table.';
STR.en['rules.table']='<span class="rt">CIRCUIT TABLES</span>Reach the cash goal before you run out of hands. The table ends as soon as you reach the goal. Each table has its own minimum and maximum bet.';

const originalMenuRender=renderMenu;
renderMenu=function(){
 originalMenuRender();
 const records=[['infini',META.infini.record,'menu.endless'],['nuit',META.nuit.record,'menu.circuit']];
 $('menuRecords').innerHTML=records.map(([mode,record,label])=>{
  const played=mode==='infini'?record.palier:record.depth;
  const detail=played?t(mode==='infini'?'menu.recTier':'menu.recTables',played):t('menu.first');
  return `<div class="mrec"><span class="mrl">${t(label)}</span><span class="mrv">${detail}</span></div>`;
 }).join('');
 if(!$('menuHand').children.length){
  $('menuHand').append(cardEl({r:'A',s:'♠'}),cardEl({r:'Q',s:'♥'}),cardEl({r:'7',s:'♣'}));
 }
 $('readySuit').innerHTML=suitSVG('♠',85);
};

renderRules=function(){
 const groups=[['rules.basic',['rules.goal','rules.moves'],true],['rules.bonuses',['rules.streak','rules.combos','rules.bonus'],false],['rules.modes',['rules.endless','rules.circuit','rules.table','rules.stars','rules.contracts','rules.hideout'],false]];
 $('rulesBody').innerHTML=groups.map(([label,keys,open])=>`<details ${open?'open':''}><summary>${t(label)}</summary><div>${keys.map(k=>`<div class="rule-entry">${t(k)}</div>`).join('')}</div></details>`).join('');
};

const originalBackRender=renderBackPicker;
renderBackPicker=function(){
 const restore=document.activeElement?.closest('#bpRow');
 originalBackRender();
 document.querySelectorAll('#bpRow .bpCard').forEach((card,i)=>{
  card.setAttribute('role','button');card.tabIndex=0;
  card.setAttribute('aria-label',t('planque.backSub',i+1,CARD_BACKS.length));
  card.setAttribute('aria-pressed',String(card.classList.contains('sel')));
  card.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();card.click();}};
 });
 if(restore)document.querySelector('#bpRow .bpCard.sel')?.focus({preventScroll:true});
};
const originalSetLang=setLang;
setLang=function(id){
 const restore=document.activeElement?.closest('#langOpts');
 originalSetLang(id);
 if(restore)[...$('langOpts').querySelectorAll('button')].find(b=>b.textContent===LANGS.find(l=>l.id===id)?.label)?.focus({preventScroll:true});
};

// Match the device language only when the player has not made a choice.
try{if(!localStorage.getItem('t21lang'))LANG=navigator.language.toLowerCase().startsWith('fr')?'fr':'en';}catch(e){}
applyI18n();

// Keep keyboard focus within the active menu and return it when a dialog closes.
const overlays=[...document.querySelectorAll('.overlay,#adOverlay')];
const returnFocus=new WeakMap();
let currentMenu=null;
function activeMenu(){
 return overlays.filter(el=>el.classList.contains('show')).sort((a,b)=>{
  const z=(parseInt(getComputedStyle(a).zIndex)||0)-(parseInt(getComputedStyle(b).zIndex)||0);
  return z||overlays.indexOf(a)-overlays.indexOf(b);
 }).at(-1)||null;
}
function syncMenuFocus(){
 const top=activeMenu();
 for(const el of overlays){
  el.inert=el!==top;el.setAttribute('aria-hidden',String(el!==top));
  if(!el.classList.contains('menu-page')){el.setAttribute('role','dialog');el.setAttribute('aria-modal',String(el===top));}
  const heading=el.querySelector('h1');
  if(heading){if(!heading.id)heading.id=el.id+'Title';el.setAttribute('aria-labelledby',heading.id);}
 }
 $('shaker').inert=!!top;
 if(top!==currentMenu){
  const previous=currentMenu;
  if(top&&!top.contains(document.activeElement)){
   const restore=previous&&returnFocus.get(previous);
   if(restore&&top.contains(restore)&&restore.isConnected)restore.focus({preventScroll:true});
   else{
    returnFocus.set(top,document.activeElement);
    const target=top.querySelector('h1')||top;target.tabIndex=-1;target.focus({preventScroll:true});
    top.scrollTop=0;
   }
  }else if(!top&&previous){
   const restore=returnFocus.get(previous);if(restore&&restore.isConnected&&!restore.closest('.overlay'))restore.focus({preventScroll:true});
  }
  currentMenu=top;
 }
}
const menuObserver=new MutationObserver(syncMenuFocus);
overlays.forEach(el=>menuObserver.observe(el,{attributes:true,attributeFilter:['class']}));
document.addEventListener('keydown',e=>{
 const top=activeMenu();if(!top)return;
 if(e.key==='Escape'){
   const close={rulesScreen:closeRules,settingsScreen:closeSettings,upgradesScreen:closeUpgrades,backPickScreen:closeBacks,inspectScreen:closeInspect,confirmRestart:closeRestart,pauseScreen:resumeGame,intro:openMenu,adOverlay:()=>{if($('adX').classList.contains('on'))Ads.closeNow();}}[top.id];
  if(close){e.preventDefault();close();}return;
 }
 if(e.key==='Tab'){
  const items=[...top.querySelectorAll('button:not(:disabled),summary,[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.closest('[inert]'));
  if(!items.length)return;
  const first=items[0],last=items.at(-1);
  if(e.shiftKey&&(document.activeElement===first||!items.includes(document.activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(document.activeElement===last||!items.includes(document.activeElement))){e.preventDefault();first.focus();}
 }
});
syncMenuFocus();

/* ============================================================
   COLD DECK — moteur + présentation Balatro
   ============================================================ */
const $=id=>document.getElementById(id);
const GameClock={
  jobs:new Map(),reasons:new Set(),serial:0,
  arm(job){job.at=performance.now();job.timer=setTimeout(()=>{this.jobs.delete(job.id);job.fn();},job.left);},
  delay(fn,ms=0){const job={id:++this.serial,fn,left:Math.max(0,ms),timer:null,at:0};this.jobs.set(job.id,job);if(!this.reasons.size)this.arm(job);return job.id;},
  cancel(id){const job=this.jobs.get(id);if(job){clearTimeout(job.timer);this.jobs.delete(id);}},
  pause(reason,on){
    const was=this.reasons.size>0;if(on)this.reasons.add(reason);else this.reasons.delete(reason);
    const now=this.reasons.size>0;if(now===was)return;
    for(const job of this.jobs.values()){
      if(now){clearTimeout(job.timer);job.left=Math.max(0,job.left-(performance.now()-job.at));job.timer=null;}
      else this.arm(job);
    }
  },
  clear(){for(const job of this.jobs.values())clearTimeout(job.timer);this.jobs.clear();this.reasons.clear();}
};
function gameDelay(fn,ms){return GameClock.delay(fn,ms);}
function clearGameDelay(id){GameClock.cancel(id);}
document.addEventListener('visibilitychange',()=>GameClock.pause('hidden',document.hidden));
const STAR=ColdDeckArt.icon('doree').replace('class="','class="rep-star '),STARE='<span class="empty-star">'+STAR+'</span>';
const PXI=n=>ColdDeckArt.icon(n);
const rndInt=n=>Math.floor(Math.random()*n);
/* abrège les grands nombres : 1 500 → 1.5K, 2 000 000 → 2M, etc. */
function abbr(n){
  const neg=n<0;n=Math.abs(n);
  const fix=x=>{const r=Math.round(x*100)/100;return Number.isInteger(r)?''+r:r.toFixed(2).replace(/0$/,'');};
  let s;
  if(n<1e4)s=(''+n).replace(/^(\d)(\d{3})$/,'$1 $2');   // milliers en entier + fin espace (1 000 … 9 999)
  else if(n<1e6)s=fix(n/1e3)+'K';                   // 10K … 999K
  else if(n<1e9)s=fix(n/1e6)+'M';
  else if(n<1e12)s=fix(n/1e9)+'B';
  else if(n<1e15)s=fix(n/1e12)+'T';
  else s=fix(n/1e15)+'P';
  return (neg?'-':'')+s;
}
/* Keep grouped values in one text node for lettering and screen readers. */
function abbrS(n){return abbr(n);}
/* montant d'argent, abrégé ET placé selon la langue : « 1.5K $ » en FR, « $1.5K » en EN */
function cash(n){const a=abbr(n);return LANG==='fr'?(a+' $'):(a.charAt(0)==='-'?('-$'+a.slice(1)):('$'+a));}
// Compact currency used by the Équilibre scoreboard and home record.
function boardCash(n){const a=abbr(n);return a.charAt(0)==='-'?('-$'+a.slice(1)):('$'+a);}
function sizeBoardValue(el,capacity){el.style.setProperty('--number-scale',Math.min(1,capacity/Math.max(1,el.textContent.length)).toFixed(3));}
function cashS(n){const a=abbrS(n);return LANG==='fr'?(a+' $'):(a.charAt(0)==='-'?('-$'+a.slice(1)):('$'+a));}

/* ---------- audio ---------- */
const Audio_={ctx:null,started:false};
function audioInit(){
  if(Audio_.started)return;
  try{
    const C=window.AudioContext||window.webkitAudioContext;Audio_.ctx=new C();
    Audio_.started=true;                         // plus de drone continu : la baraka ne bourdonne plus
  }catch(e){}
}
/* Soft plucked tones: short attack and a natural release. */
function blip(f,d,type,v,slideTo){
  if(!Audio_.started)return;
  const o=Audio_.ctx.createOscillator(),g=Audio_.ctx.createGain();
  o.type=(!type||type==='square')?'triangle':type;
  const t=Audio_.ctx.currentTime,vol=v||0.08;
  o.frequency.setValueAtTime(f,t);
  if(slideTo)o.frequency.linearRampToValueAtTime(slideTo,t+d);
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+.004);    // attaque quasi instantanée
  g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol*.32),t+d*.4);            // a softer decay between successive combo notes
  g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(Audio_.ctx.destination);
  o.start(t);o.stop(t+d);
}
/* Rising notes accompany the chain reaction. */
function arp(freqs,step,d,v,type){freqs.forEach((f,i)=>gameDelay(()=>blip(f,d,type||'square',v),i*step));}
const sfx={
  card(){blip(160+rndInt(40),.035,'square',.045);},
  flip(){blip(660,.04,'square',.05);gameDelay(()=>blip(880,.05,'square',.045),42);},
  land(){blip(170,.035,'triangle',.045,80);},
  reveal(){blip(1250,.035,'triangle',.065,520);blip(210,.045,'triangle',.045,90);},
  win(tier=1){arp(tier>=3?[523,659,784,1047,1319,1568]:tier===2?[523,659,784,1047]:[523,659,784],tier>=3?58:46,.09,.075);if(tier>=3)blip(90,.13,'triangle',.07,55);},
  combo(step=0){const root=784*Math.pow(2,Math.min(step,6)/12);arp([root,root*1.25,root*1.5],25,.055,.055);},
  goal(){arp([1047,1568],65,.08,.045,'triangle');},
  push(){blip(392,.09,'square',.05);gameDelay(()=>blip(392,.09,'square',.04),95);},
  lose(){blip(330,.18,'square',.085,130);gameDelay(()=>blip(150,.24,'square',.07,80),110);}, // glissando descendant
  danger(){blip(130,.3,'square',.11,60);},                            // grondement grave qui plonge
  buy(){blip(880,.05,'square',.07);gameDelay(()=>blip(1245,.08,'square',.06),52);},           // a brief coin chime
  thump(){blip(70,.14,'triangle',.13);gameDelay(()=>blip(55,.18,'triangle',.1),120);},        // low heartbeat
  jackpot(){arp([523,659,784,1047,1319,1568],58,.12,.08);}
};

/* ---------- dos de carte (préférence persistante) ---------- */
const CARD_BACKS=['cb9','cb10','cb11','cb12','cb13','cb14','cb15','cb16','cb18','cb19','cb22','cb26'];
let cardBack=(()=>{try{const v=localStorage.getItem('t21back');return CARD_BACKS.includes(v)?v:'cb9';}catch(e){return 'cb9';}})();
function setCardBack(cb){if(!CARD_BACKS.includes(cb))return;cardBack=cb;try{localStorage.setItem('t21back',cb);}catch(e){}renderBackPicker();renderHands();}
function renderBackPicker(){
  // aperçu du dos sélectionné dans La Planque (la galerie complète vit dans l'overlay)
  const prev=document.getElementById('bpPreview');
  if(prev){prev.className='card back '+cardBack+' bpCard';prev.innerHTML=ColdDeckArt.back(cardBack);}
  const sub=document.getElementById('bpSub');
  if(sub)sub.textContent=t('back.'+cardBack)+' · '+t('planque.backSub',CARD_BACKS.indexOf(cardBack)+1,CARD_BACKS.length);
  const row=document.getElementById('bpRow');if(!row)return;row.innerHTML='';
  CARD_BACKS.forEach((cb,i)=>{
    const slot=document.createElement('div');slot.className='bpslot';
    const d=document.createElement('button');d.type='button';d.className='card back '+cb+' bpCard'+(cardBack===cb?' sel':'');d.innerHTML=ColdDeckArt.back(cb,true);
    const sd=hashStr(cb+'#'+i),sd2=hashStr(cb+'~'+i),dur=5.5+sd*2.5;   // phase+durée propres -> mouvement indépendant
    d.style.setProperty('--cdur',dur.toFixed(2)+'s');
    d.style.setProperty('--cd','-'+(sd2*dur).toFixed(2)+'s');
    d.onclick=()=>{setCardBack(cb);try{sfx.flip();}catch(e){}};
    const label=document.createElement('span');label.className='back-name';label.textContent=t('back.'+cb);
    slot.append(d,label);row.appendChild(slot);
  });
}

/* ---------- méta-progression : DEUX économies séparées (nuit / infini) ----------
   Chaque mode a SA réputation, SES déblocages et SON record. La Planque n'affiche
   donc que les objets utiles au mode qu'on vient jouer. */
function blankMeta(){return {
  nuit:  {rep:0,unlocks:{},record:{depth:0,reached:0,chips:0,version:2}},
  infini:{rep:0,unlocks:{},record:{peak:0,palier:0}}
};}
function migrateCircuitRecord(r={}){
  return {depth:Math.min(24,Math.max(0,(r.depth|0)-(r.version===2?0:1))),reached:Math.min(24,Math.max(r.reached|0,r.depth|0)),chips:Math.max(0,r.chips|0),version:2};
}
function loadMeta(){
  try{const v=JSON.parse(localStorage.getItem('t21meta'));
    if(v&&typeof v==='object'){
      if(v.nuit&&v.infini){                                   // nouveau format à deux modes
        return {
          nuit:  {rep:v.nuit.rep|0,  unlocks:v.nuit.unlocks||{},  record:migrateCircuitRecord(v.nuit.record)},
          infini:{rep:v.infini.rep|0,unlocks:v.infini.unlocks||{},record:{peak:(v.infini.record&&v.infini.record.peak)|0,palier:(v.infini.record&&v.infini.record.palier)|0}}
        };
      }
      // ancien format {rep,unlocks,record} : tout va dans « la nuit », l'infini repart vierge
      const m=blankMeta();
      m.nuit.rep=v.rep|0;m.nuit.unlocks=v.unlocks||{};
      m.nuit.record=migrateCircuitRecord(v.record);
      return m;
    }
  }catch(e){}
  return blankMeta();
}
let META=loadMeta();
let MODE='nuit';                                              // mode courant, fixé au choix dans le menu principal
function metaCur(){return META[MODE]||META.nuit;}
function saveMeta(){try{localStorage.setItem('t21meta',JSON.stringify(META));}catch(e){}}
/* records perso (plus gros gain sur une seule main), persistants et séparés par mode */
let RECS=(()=>{try{return JSON.parse(localStorage.getItem('t21rec'))||{};}catch(e){return {};}})();
function saveRecs(){try{localStorage.setItem('t21rec',JSON.stringify(RECS));}catch(e){}}
function checkGainRecord(gain){
  if(gain<=0)return false;
  const k=G.endless?'infini':'nuit',prev=(RECS[k]&&RECS[k].gain)||0;
  if(gain<=prev)return false;
  RECS[k]={gain};saveRecs();
  return prev>0;                       // le tout premier gain fixe la barre sans fanfare
}
function uLvl(id){return (metaCur().unlocks[id])|0;}
/* déblocages permanents de LA NUIT (descente : reliques, tarots, vies) */
const UNLOCKS_NUIT=[
  {id:'bank',      k:'bank',      tc:'#ffce3a', max:5, cost:n=>15+n*15},
  {id:'pourboire', k:'pourboire', tc:'#ffce3a', max:3, cost:n=>25+n*20},
  {id:'net',       k:'net',       tc:'#3f8bd6', max:3, cost:n=>40+n*30},
  {id:'tarot',     k:'tarot',     tc:'#a64dff', max:1, cost:n=>70},
  {id:'contact',   k:'contact',   tc:'#ffce3a', max:1, cost:n=>90},
  {id:'relic2',    k:'relic2',    tc:'#9be84a', max:1, cost:n=>120},
];
/* déblocages permanents de LA CAGNOTTE (infini : capital, rente, plafond, élan)
   — on réutilise les ids 'bank'/'pourboire' (stockés à part par mode) pour
   profiter de startBank()/applyHandIncome() sans code spécifique. */
const UNLOCKS_INFINI=[
  {id:'bank',      k:'bankI',      tc:'#ffce3a', max:5, cost:n=>15+n*15},
  {id:'pourboire', k:'pourboireI', tc:'#ffce3a', max:3, cost:n=>25+n*20},
  {id:'plafond',   k:'plafond',    tc:'#a64dff', max:3, cost:n=>45+n*30},
  {id:'elan',      k:'elan',       tc:'#3f8bd6', max:3, cost:n=>60+n*45},
  {id:'cashplus',  k:'cashplus',   tc:'#19c3c3', max:2, cost:n=>70+n*70},
  {id:'boon2',     k:'boon2',      tc:'#a64dff', max:1, cost:n=>110},
];
function unlocksFor(mode){return (mode||MODE)==='infini'?UNLOCKS_INFINI:UNLOCKS_NUIT;}
function findUnlock(id){return unlocksFor(MODE).find(x=>x.id===id);}
function unlockCost(u){const n=uLvl(u.id);return n>=u.max?null:u.cost(n);}
/* valeurs de départ d'une descente, dérivées des déblocages */
function startBank(){return MODE==='infini'?50+uLvl('bank')*15:80+uLvl('bank')*4;}
function startTokens(){return 3+uLvl('net');}   // secondes chances de départ : plus de marge pour la Tournée
function startRelics(){return [];}
/* ---------- données ---------- */
const SUITS=['♠','♥','♦','♣'];
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

/* ============================================================
   RUN STRUCTURÉE — 24 tables, 8 zones, boss tous les 3 niveaux (3 zones
   écrites à la main + 5 zones profondes générées, cf. TOURNÉE ÉTENDUE).
   Chaque table demande un bénéfice propre en dix mains maximum.
   Les boss ajoutent un défi visible ; les étoiles récompensent les décisions.
   ============================================================ */
/* nom et texte de règle : traduits au rendu (voir tableName / tableRuleText) */
// Each zone has a deliberate respite, a preparation table and a distinct boss.
const RUN=[
  [80,115,5,25,null], [105,180,5,30,'nervous'], [150,255,10,40,'gros','bouncer'],
  [215,355,10,50,'atelier',null,20], [290,490,15,65,'mute'], [395,655,15,85,null,'banker'],
  [535,865,20,85,'nervous',null,45], [725,1230,25,110,'gros'], [975,1660,30,150,'sec','reaper'],
  [1320,2270,40,185,'atelier'], [1780,3205,50,250,'mute'], [2400,4320,60,335,'mute','concierge'],
  [3240,5830,80,420,'serein',null,200], [4375,8225,100,570,'atelier'], [5905,11100,150,770,'sec','accountant'],
  [7970,14825,200,995,'atelier'], [10760,20875,250,1345,'nervous'], [14525,28180,350,1815,'gros','gravedigger'],
  [19610,37650,450,2355,'serein',null,1300], [26475,52950,600,3175,'mute'], [35740,71480,800,4290,'depart','croupier'],
  [48250,96500,1000,5550,'atelier'], [65140,135490,1500,7490,'mute'], [87940,182915,2000,10115,'sec','godfather']
].map(([cap,goal,min,max,rule,challenge,entry=0],i)=>({i,zone:1+Math.floor(i/3),mains:10,min,max,cap,goal,master:goal,rule,challenge,entry,need:0,boss:!!challenge,rt:{rule,entry,boss:!!challenge,last:i===23}}));
function zoneName(z){return t('zone.'+z);}
const ZONE_MULTCAP={1:4,2:5,3:6,4:7,5:8,6:9,7:10,8:12};
const ZONE_FELT={1:'#138f86',2:'#7c3a9e',3:'#a52f55'};
const RUN_LEN=RUN.length;
/* nom de table : clé tbl.<index> pour la tournée, « Palier N » en sans fin */
function tableName(tb){return (tb&&tb.pal!=null)?t('endless.tier',tb.pal+1):t('tbl.'+((tb&&tb.i)|0));}
/* texte de règle : recomposé à partir du descripteur rt (traduit à chaque rendu) */
function tableRuleText(tb){
  if(!tb)return '';
  const parts=[];
  if(tb.rule)parts.push(t('rule.'+tb.rule));
  if(tb.challenge)parts.push(t('boss.'+tb.challenge));
  if(tb.entry)parts.push(t('rtx.entry',cash(tb.entry)));
  return parts.join(' · ')||t(tb.endless?'rtx.endless':'rtx.0');
}
function tableEffectData(tb=G.table){
  const rule=tb?.rule||'standard';
  return {rule,title:t('effect.'+rule+'.title'),short:t('effect.'+rule+'.short'),description:t('effect.'+rule+'.description')};
}
function renderTableEffect(box){
  if(!box)return;
  const effect=tableEffectData();box.dataset.rule=effect.rule;
  box.innerHTML='<span class="table-effect-label">'+t('circuit.tableEffect')+'</span><strong>'+effect.title+'</strong><p>'+effect.description+'</p>'+(effect.rule==='sec'&&hasRelic('diplomate')?'<p class="table-effect-protection">'+t('effect.sec.protected')+'</p>':'');
  const art=document.createElement('span');art.className='table-rule-art';art.setAttribute('aria-hidden','true');
  art.innerHTML=ColdDeckArt.tableRule(effect.rule);
  box.prepend(art);
}
function openTableRules(){
  inspectRef=null;GameClock.pause('inspect',true);
  $('inspectScreen').classList.remove('shop-sale-view');
  const tb=G.table,body=$('inspectBody');
  const context=G.endless?t('planque.modeInf'):t('planque.tableLabel',G.tableIdx+1)+' · '+zoneName(tb.zone);
  const stats=[
    ['circuit.goalLabel',cash(G.endless?palierTarget(G.palier||0):tb.goal)],
    ['table.detailsHands',Number.isFinite(tb.mains)?Math.max(0,tb.mains-G.hand+1):'∞'],
    ['table.detailsMin',cash(tb.min)],
    ['table.detailsMax',cash(tb.max)]
  ];
  const challenge=tb.challenge?'<section class="table-details-note table-boss-challenge"><h2 data-reading-label>'+t('table.detailsChallenge')+'</h2><p>'+bossProgress()+'</p></section>':'';
  const contract=G.contract&&!G.endless?'<section class="table-details-note"><h2 data-reading-label>'+t('table.detailsContract')+'</h2><p>'+contractText(G.contract)+'</p><span class="table-details-status" data-reading-label>'+(G.contract.done?t('top.contractDone'):'+'+G.contract.reward+STAR)+'</span></section>':'';
  const totals=G.endless
    ?[t('top.record',cash(Math.max(G.peak||0,G.bank))),t('top.worth',STAR+abbr(endlessCashRep()))]
    :[t('top.stars',G.runStars||0),...(G.pot>0?[t('top.pot',cash(G.pot))]:[])];
  body.innerHTML='<div class="illustrated-heading table-brief-heading"><div class="table-heading-copy"><span class="table-brief-kicker" data-reading-label>'+context+'</span><h1>'+tableName(tb)+'</h1></div></div><div class="table-effect-card"></div><div class="brief-stats">'+stats.map(([label,value])=>'<div class="brief-stat"><span class="brief-stat-label" data-reading-label>'+t(label)+'</span><strong class="brief-stat-value">'+value+'</strong></div>').join('')+'</div>'+challenge+contract+'<div class="table-details-totals" data-reading-label>'+totals.map(value=>'<span>'+value+'</span>').join('')+'</div>';
  renderTableEffect(body.querySelector('.table-effect-card'));
  $('inspectScreen').dataset.boss=String(!G.endless&&!!tb.boss);
  if(G.endless)for(const key of ['--table-accent','--table-tint'])body.closest('.ovpanel').style.removeProperty(key);
  if(!G.endless&&window.ColdDeckJourney){
    const route=document.createElement('div');route.className='journey-route';body.prepend(route);
    ColdDeckJourney.renderRoute(route,tb);
  }
  const close=document.createElement('button');close.className='btn b-blue';close.textContent=t('insp.close');close.onclick=closeInspect;
  $('inspectActions').replaceChildren(close);$('inspectScreen').classList.add('table-details-view','show');
  if(typeof syncMenuFocus==='function')syncMenuFocus();
}

/* ====== tapis évolutif ====== */
const FELT_COLORS=['#bdc8ad','#becac4','#cec2be','#cec8ae'];
function applyFelt(){
  const zone=Math.max(0,((G.table&&G.table.zone)||1)-1);
  document.documentElement.style.setProperty('--felt',FELT_COLORS[zone%FELT_COLORS.length]);
  $('feltDeco').replaceChildren();
  $('felt').classList.toggle('bossfelt',!!(G.table&&G.table.boss));
  window.ColdDeckBackgrounds?.applyTable(G.table,G.endless);
}
/* annonce de BOSS : gros pop rouge au centre du tapis */
function showBoss(){
  const p=document.getElementById('multPop');if(!p)return;
  p.className='boss long';
  p.querySelector('.m').textContent=t(G.endless?'msg.miniboss':'msg.boss');
  p.querySelector('.t').textContent=tableName(G.table);
  p.classList.remove('go');void p.offsetWidth;p.classList.add('go');
}

/* ZONE_MULTCAP défini plus haut (avec les zones profondes) */
/* ============================================================
   MODE INFINI « LA CAGNOTTE » — blackjack pur, sans objectif ni
   limite de mains ni vies. On accumule une cagnotte tant qu'on peut
   miser. Les MISES montent d'un cran à chaque PALIER de cagnotte
   franchi, et on choisit alors un BONUS. Banqueroute = fin.
   ============================================================ */
/* seuil de cagnotte pour franchir le palier p (0-based) — premier palier vite
   atteint (~2× la banque de départ) puis ×1.6 : la récompense rythme la partie */
function palierTarget(p){return niceRound(300*Math.pow(2.2,p));}
let startPalierIdx=null;   // palier de reprise choisi dans la Planque (index 0-based ; null = défaut = plus loin atteint)
/* valeur d'ENCAISSEMENT de la cagnotte : paliers + racine de la banque
   (rendement dégressif) — la banqueroute (banque ≈ 0) ne garde que les paliers.
   « Blanchisseur » (Planque infini) améliore le taux. */
function endlessCashRep(){
  const base=(G.palier||0)*5+Math.sqrt(Math.max(0,G.bank))*2;
  return Math.round(base*(1+0.25*uLvl('cashplus')));
}
/* niveau de mise (tier) = nombre de paliers franchis ; les mises grimpent */
function endlessTier(tier){
  const bmax=1+((G.boons&&G.boons.betmax)||0);
  const min=Math.max(5,roundBet(5*Math.pow(1.5,tier)));
  // la mise max suit l'OBJECTIF du palier (gain à réaliser ÷ ~15) : ~15 mises max pour franchir, constant à tous les paliers.
  // aux petits paliers l'ancienne échelle 20×1.5^t domine (inchangée) ; dès le palier ~3 la nouvelle prend le relais et grimpe en ×2,2/palier (plus de plafond ~1000).
  const spanNeed=palierTarget(tier)-(tier>0?palierTarget(tier-1):0);
  const base=Math.max(20*Math.pow(1.5,tier),spanNeed/15);
  const max=Math.max(min*3,roundBet(base*bmax));
  const zone=Math.min(9,1+Math.floor(tier/2));
  const rule=tier>=6?'gros':(tier>=3&&tier%2===1?'nervous':null);   // croupier plus dur en montant
  return {pal:(G.palier||0),zone,mains:Infinity,min,max,cap:0,goal:Infinity,master:Infinity,
    rule,entry:0,need:0,endless:true,cagnotte:true,rt:{endless:true,rule}};
}
function tableFor(idx){return G.endless?endlessTier(idx):RUN[Math.min(idx,RUN_LEN-1)];}
function curTable(){return tableFor(G.tableIdx);}
function relicMax(){return 5+((G.boons&&G.boons.relic)||0);}
/* Bonus de palier du mode Libre, proposés avec les cartes disponibles. */
/* titres/descriptions : clés boon.<id>.t / .d */
const BOONS=[
  {id:'mult'},{id:'income'},{id:'betmax'},{id:'filet'},{id:'cash'},
  /* bonus RARES : proposés seulement après l'achat des « Pactes » à La Planque infini */
  {id:'baraplus',lock:'boon2'},
  {id:'evt3',lock:'boon2'},
];
/* mini-événements du mode cagnotte : toutes les 5 mains, la main est SPÉCIALE —
   ça casse la routine et crée des pics de tension/récompense */
const ENDLESS_EVENTS=[
  {id:'doree',   ic:'doree'},
  {id:'forcee',  ic:'forcee'},
  {id:'pompette',ic:'glass'},
  {id:'etoile',  ic:'diamond'},
];
function evtTitle(e){return t('evt.'+e.id+'.t');}
function evtDesc(e){return t('evt.'+e.id+'.d');}
/* CONTRATS (mode nuit) : un défi optionnel par table — le remplir rapporte des ★
   bonus dans la cagnotte. Pousse à jouer AUTREMENT, pas juste à battre le croupier. */
const CONTRACTS=[
  {id:'c5', weight:3, chk:o=>o.n>=5},
  {id:'c21', weight:1.5, chk:o=>o.pv===21&&o.n>2},
  {id:'cpress',weight:1.5,chk:o=>o.level>=2},
  {id:'cmult',weight:1, chk:o=>o.mult>=3},
  {id:'cdbl', weight:1, chk:o=>o.dbl},
  {id:'csuite',weight:2.5,chk:o=>o.suite},
  {id:'ccoul',weight:2,chk:o=>o.coul},
];
function contractText(c){return c?t('ctr.'+c.id):'';}
function openContractInfo(i){
  const c=G.contractChoices?.[i];if(!c)return;
  inspectRef=null;GameClock.pause('inspect',true);
  const screen=$('inspectScreen');screen.classList.remove('table-details-view','shop-sale-view');
  screen.classList.add('contract-info-view');
  $('inspectBody').innerHTML='<h1>'+ColdDeckArt.lettering(contractText(c))+'</h1><p data-reading-label>'+t('ctr.help.'+c.id)+'</p><p data-reading-label>'+t('ctr.help.common')+'</p><div class="contract-info-reward">+'+c.reward+' '+STAR+'</div>';
  const close=document.createElement('button');close.className='btn b-blue';close.textContent=t('insp.close');close.onclick=closeInspect;
  $('inspectActions').replaceChildren(close);screen.classList.add('show');
  if(typeof syncMenuFocus==='function')syncMenuFocus();
}
function rollContract(){
  if(G.endless)return null;
  const controlled=hasRelic('lunettes')||hasRelic('phare')||G.consumables.some(c=>c.id==='magicien');
  const easy=CONTRACTS.filter(c=>['c21','cmult','cdbl'].includes(c.id));
  const hard=CONTRACTS.filter(c=>['cpress','ccoul'].includes(c.id)||(controlled&&['c5','csuite'].includes(c.id)));
  const make=c=>({id:c.id,reward:Math.round((6+G.table.zone*2)*c.weight),done:false});
  G.contractChoices=[make(easy[rndInt(easy.length)]),make(hard[rndInt(hard.length)])];
  return G.contractChoices[0];
}
/* appelé sur chaque main GAGNÉE (mult = multiplicateur payé) */
function checkContract(mult){
  const c=G.contract;if(!c||c.done||G.endless)return;
  const h=G.pHand,n=h.length,pv=handValue(h).total,suits=new Set(h.map(x=>x.s));
  const o={n,pv,press:barakaPct(),level:barakaLevel(),mult:mult||1,dbl:(G.stakeMult||1)>=2,suite:isStraight(h),coul:n>=3&&suits.size===1};
  const def=CONTRACTS.find(x=>x.id===c.id);
  if(def&&def.chk(o)){
    c.done=true;G.pot+=c.reward;
    gameDelay(()=>{sfx.combo&&sfx.combo();coinBurst(8);popText(PXI('scroll')+' '+t('msg.contract'),'+'+c.reward+' '+STAR);renderTop();},1500);
  }
}
/* étoiles : il FAUT atteindre l'objectif pour valider la table.
   0★ = objectif manqué (table ratée) · 1★ objectif · 2★ confort · 3★ maîtrise */
function starsFor(tb,bank){
  if(bank<tb.goal||!bossReady())return 0;
  return 1+(!G.tableRetried?1:0)+(G.contract?.done?1:0);
}
/* réputation d'une table validée : indexée sur la zone, les étoiles, le boss —
   jamais sur le tas de jetons. Petit bonus de risque maîtrisé. */
function tableRep(t,stars,maxBaraka){
  const base=6+t.zone*2;
  let rep=base+stars*4+(t.boss?15:0);
  if(stars>=2&&(maxBaraka||0)>=BARAKA_STEPS[2])rep+=8;          // baraka menée haut (niv 3+)
  return rep;
}
/* réputation totale en fin de run : cagnotte (entière si encaisse, moitié sinon)
   + prime d'effort (tables tenues) + prime de PROXIMITÉ (près du but sur la
   table perdue) — une run ratée sert toujours, et « presque » paie un peu */
function proximityRep(){
  if(G.endless||!G.stats?.played||!G.table||!isFinite(G.table.goal)||G.bank>=G.table.goal)return 0;
  return Math.round(10*Math.max(0,Math.min(1,G.bank/G.table.goal)));
}
function repOnEnd(cashout){
  if(G.endless){                                     // cagnotte : conversion directe, +20 % si on sécurise pile après un palier
    let r=endlessCashRep();
    if(cashout&&G._palierCash)r=Math.round(r*1.2);
    return r;
  }
  const depth=G.tableStars.filter(Boolean).length;
  const base=cashout?G.pot:Math.floor(G.pot*0.5);
  return base+Math.max(0,depth)*3+(G.runStars|0)*2+(cashout?0:proximityRep());
}
/* noms / descriptions : clés relic.<id>.n et relic.<id>.d */
const RELIC_POOL=[
  {id:'lunettes',cost:14},
  {id:'jeton',cost:10},
  {id:'clope',cost:12},
  {id:'as',cost:16},
  {id:'froid',cost:16},
  {id:'compteur',cost:12},
  {id:'mecene',cost:15},
  {id:'usurier',cost:18},
  {id:'collector',cost:16},
  {id:'maitresse',cost:14},
  {id:'bruleur',cost:17},
  {id:'portebonheur',cost:12},
  {id:'diplomate',cost:11},
  /* reliques RARES : n'apparaissent en boutique qu'après l'achat du « Coffre » à La Planque */
  {id:'talisman',cost:15,lock:'relic2'},
  {id:'aimant',cost:12,lock:'relic2'},
  {id:'phare',cost:16,lock:'relic2'},
];

/* Deux éditions : Dorée (foil) = mise bonus, Prisme (poly) = ×1,5. */
const TAROT_POOL=[
  {id:'etoile',cost:7,when:'any',
    use(){if(barakaLevel()>=4)return false;addBaraka(2,false);return t('tarot.etoile.u');}},
  {id:'jugement',cost:11,when:'any',
    use(){const lvl=barakaLevel();if(lvl>=4)return false;addBaraka(BARAKA_STEPS[lvl]-(G.baraka||0),false);return t('tarot.jugement.u');}},
  {id:'soleil',cost:6,when:'any',
    use(){if((G.baraka||0)<2)return false;const gain=Math.round(G.table.max*.75);G.bank+=gain;G.baraka-=2;renderTop();renderPressure();coinBurst(8);return t('tarot.soleil.u',cash(gain));}},
  {id:'diable',cost:9,when:'play',need:'cards',
    use(){const c=addEditionToHand('poly');return c?t('tarot.diable.u',c.r+c.s):false;}},
  {id:'etoileD',cost:7,when:'play',need:'cards',
    use(){const c=addEditionToHand('foil');return c?t('tarot.etoileD.u',c.r+c.s):false;}},
  {id:'pendu',cost:9,when:'play',
    use(){if(G.penduArmed)return false;G.penduArmed=true;return t('tarot.pendu.u');}},
  {id:'magicien',cost:10,when:'play',
    use(){if(G.magicNext||G.smallNext)return false;G.magicNext=true;return t('tarot.magicien.u');}},
  {id:'roue',cost:6,when:'play',need:'cards',
    use(){if(!G.pHand.some(c=>!c.ed))return false;const ed=['foil','poly'][rndInt(2)];const c=addEditionToHand(ed);return c?t('tarot.roue.u',edName(ed)):false;}},
];

/* SERVICES de boutique : régulateurs économiques, appliqués immédiatement à l'achat
   (ni relique ni tarot). Aident à encaisser les coups durs sans casser l'économie. */
const SERVICE_POOL=[
  {id:'soin',      svc:true, baseCost:0.9,
    apply(){const gain=advanceAmount();G.bank+=gain;G._advanceUsed=true;coinBurst(8);return t('svc.soin.u',cash(gain));}},
  {id:'assurance', svc:true, baseCost:0.7,
    apply(){G.insurance=true;return t('svc.assurance.u');}},
  {id:'videur',    svc:true, baseCost:1.1,
    apply(){G.tokens=(G.tokens||0)+1;return t('svc.videur.u');}},
];

const SERVICE_BY_ID=Object.fromEntries(SERVICE_POOL.map(s=>[s.id,s]));
/* espace de noms i18n porté par chaque objet (relique / tarot / service) */
RELIC_POOL.forEach(r=>{r.ns='relic';});
TAROT_POOL.forEach(x=>{x.ns='tarot';});
SERVICE_POOL.forEach(x=>{x.ns='svc';});
function iName(o){return o?t(o.ns+'.'+o.id+'.n'):'';}
function iDesc(o){return o?t(o.ns+'.'+o.id+'.d'):'';}
function edName(ed){return t('m.'+ed);}
function edInfo(ed){return t('ed.'+ed);}
function announceEd(c){if(c&&c.ed)popText(t('ed.card',edName(c.ed)),edInfo(c.ed));}
/* ICON retiré : effets affichés via jetons SHOPTOK */



/* Circuit decisions, protections and progression share the same rules in UI and simulations. */
function canDecide(){return G.phase==='play'&&!G._dealing&&!G._settling&&!GameClock.reasons.size;}
function playerDraw(){
  G.knownCard=null;let c;
  if(G.magicNext)c=drawIdeal();
  else if(G.smallNext){
    if(G.shoe.length<15)buildShoe();
    let best=G.shoe.length-1;
    for(let i=0;i<G.shoe.length;i++)if((G.shoe[i].r==='A'?1:cardBase(G.shoe[i].r))<(G.shoe[best].r==='A'?1:cardBase(G.shoe[best].r)))best=i;
    c=maybeEdition(G.shoe.splice(best,1)[0]);
  }else c=draw();
  G.magicNext=false;G.smallNext=false;return c;
}
function completePlayerDraw(c,before,mustStand){
  G._dealing=false;let v=handValue(G.pHand).total;
  if(v>21&&G.penduArmed){
    G.penduArmed=false;G.pHand.pop();v=handValue(G.pHand).total;
    popText(t('tarot.pendu.n'),t('circuit.saved'));renderHands();
  }else if(v<=21&&before>=16&&hasRelic('aimant')){
    G.bank+=Math.max(1,Math.round(G.bet*(G.stakeMult||1)*.1));renderTop();
  }
  updateBustReadout();renderMult();renderRelics();
  if(c.ed&&G.pHand.includes(c))announceEd(c);
  if(v>21||v===21||mustStand){
    G._settling=true;renderActions();
    gameDelay(()=>{G._settling=false;if(v>21)handBusted();else afterHandDone();},320);
  }else renderActions();
}
function lossRefund(stake,pv){
  if(G.insurance){G.insurance=false;popText(t('msg.insurance'),t('msg.insuranceSub'));return stake;}
  if(hasRelic('talisman')&&!G._talismanUsed){G._talismanUsed=true;popText(t('msg.talisman'),t('msg.talismanSub'));return stake;}
  return hasRelic('jeton')&&pv>=19&&pv<=20?Math.floor(stake/2):0;
}
function recordBossWin(mult){
  const b=G.bossState||(G.bossState={wins:0,qualified:0,totals:[]});
  // A split cannot remove both seals in one round.
  if(b.lastHand!==G.hand){b.wins++;b.lastHand=G.hand;}
  const pv=handValue(G.pHand).total;
  if(!b.totals.includes(pv))b.totals.push(pv);
  const id=G.table.challenge;
  const q=id==='banker'?G.bet>=G.table.max*.6:
    id==='concierge'?G.pHand.length>=3||G.tarotThisHand:
    id==='gravedigger'?G.pHand.length>=4:
    id==='croupier'?barakaLevel()>=1:
    id==='godfather'?G.pHand.length>=3&&mult>=2: true;
  if(q&&b.lastQualified!==G.hand){b.qualified++;b.lastQualified=G.hand;}
}
function bossReady(){
  const id=G.table?.challenge;if(!id)return true;
  const b=G.bossState||{wins:0,qualified:0,totals:[]};
  if(id==='godfather')return b.wins>=3&&b.qualified>=1;
  if(id==='accountant')return b.wins>=2&&b.totals.length>=2;
  if(id==='gravedigger')return b.wins>=2&&(b.qualified>=1||b.wins>=3);
  if(['banker','concierge','croupier'].includes(id))return b.wins>=2&&b.qualified>=1;
  return b.wins>=2;
}
function bossProgress(){
  if(!G.table?.challenge)return '';
  const b=G.bossState||{wins:0,qualified:0,totals:[]},need=G.table.challenge==='godfather'?3:2;
  return t('circuit.seals',Math.min(bossReady()?need:need-1,b.wins),need)+(bossReady()?' · '+t('circuit.ready'):' · '+t('boss.'+G.table.challenge));
}
function checkBankGoal(){
  if(G.endless||G.phase!=='bet')return false;
  if(G.bank>=G.table.goal&&bossReady()){finishTable();return true;}return false;
}
function recommendedBet(){
  const opts=betChoices().filter(x=>x<=G.bank),target=G.table.max*.75;
  return opts.reduce((a,b)=>Math.abs(b-target)<Math.abs(a-target)?b:a,opts[0]||G.table.min);
}
function resetTableState(retry){
  const carry=retry?0:Math.min(2,Math.floor((G.baraka||0)/2));
  Object.assign(G,{hand:1,phase:'bet',pressure:0,baraka:G.table.rule==='depart'?2:carry,tableMaxBaraka:0,dHand:[],pHand:[],forcedUsed:false,tableMaxPressure:0,objHit:false,_talismanUsed:false,_dealing:false,_settling:false,penduArmed:false,magicNext:false,smallNext:false,counterUsed:false,phareUsed:false,knownCard:null,splitActive:false,hands:null,hi:0,stakeMult:1,tarotThisHand:false,bossState:{wins:0,qualified:0,totals:[]}});
  if(!retry)G.tableRetried=false;
}
function showTableBrief(){
  const screen=$('tableBrief');if(!screen)return;
  $('briefTableLabel').textContent=G.table.pal!=null?t('planque.tierLabel',G.table.pal+1):t('planque.tableLabel',G.tableIdx+1);
  $('briefTitle').innerHTML=ColdDeckArt.lettering(tableName(G.table));
  $('briefContractTitle').innerHTML=ColdDeckArt.lettering(t('circuit.contractTitle'));
  renderTableEffect($('briefEffect'));
  $('briefRule').textContent=[G.table.challenge?t('boss.'+G.table.challenge):'',G.table.entry?t('rtx.entry',cash(G.table.entry)):''].filter(Boolean).join(' · ');
  $('briefRule').hidden=!$('briefRule').textContent;
  $('briefGoal').replaceChildren();
  for(const [key,value] of [['journey.minBet',cash(G.table.min)],['circuit.betLabel',cash(recommendedBet())]]){
    const stat=document.createElement('div');stat.className='brief-stat';
    const label=document.createElement('span');label.className='brief-stat-label';label.textContent=t(key);
    const amount=document.createElement('span');amount.className='brief-stat-value';amount.textContent=value;
    stat.append(label,amount);$('briefGoal').append(stat);
  }
  $('briefContracts').replaceChildren();
  G.contractChoices.forEach((c,i)=>{
    const row=document.createElement('div');row.className='contract-option';
    const b=document.createElement('button');b.className='btn b-blue contract-choice';
    b.innerHTML='<span class="contract-copy">'+contractText(c)+'</span><small class="contract-reward"><span class="contract-reward-value">+'+c.reward+' '+STAR+'</span></small><img class="nav-triangle" data-direction="right" src="icons/nav-triangle.svg" width="18" height="18" alt="">';
    const info=document.createElement('button');info.type='button';info.className='contract-info';info.textContent='i';info.setAttribute('aria-label',t('ctr.help.label')+' : '+contractText(c));info.setAttribute('aria-haspopup','dialog');info.onclick=()=>openContractInfo(i);
    const copy=b.querySelector('.contract-copy'),reward=b.querySelector('.contract-reward'),arrow=b.querySelector('.nav-triangle');
    copy.id='contractName'+i;reward.id='contractReward'+i;copy.innerHTML=ColdDeckArt.lettering(contractText(c));
    const label=document.createElement('span');label.className='contract-label-group';label.append(copy,info);
    b.setAttribute('aria-labelledby',copy.id+' '+reward.id);
    b.onclick=()=>chooseContract(i);row.append(b,label,reward,arrow);$('briefContracts').append(row);
  });
  screen.classList.add('show');
  window.ColdDeckJourney?.renderBrief();
}
function chooseContract(i){
  if(G.phase!=='bet'||!G.contractChoices?.[i])return;
  G.contract=G.contractChoices[i];$('tableBrief')?.classList.remove('show');
  renderTop();window.ColdDeckJourney?.renderHud();checkBankGoal();
}
function renderCircuitStatus(){
  const el=$('circuitStatus');if(!el)return;
  const effect=tableEffectData(),protectedTie=effect.rule==='sec'&&hasRelic('diplomate');
  el.hidden=false;el.dataset.rule=effect.rule;el.dataset.protected=String(protectedTie);
  if(!el.querySelector('.table-rule-summary'))el.innerHTML='<span class="table-rule-summary"></span><span class="table-rule-progress"></span><span class="table-rule-info" aria-hidden="true">?</span>';
  el.querySelector('.table-rule-summary').textContent=protectedTie?t('effect.sec.protectedShort'):effect.short;
  const progress=el.querySelector('.table-rule-progress');
  progress.textContent=G.table.challenge?bossProgress().split(' · ')[0]:'';progress.hidden=!G.table.challenge;
  el.title=t('circuit.tableEffect')+' · '+effect.description;
  el.setAttribute('aria-label',t('circuit.tableEffect')+' : '+(protectedTie?t('effect.sec.protected'):effect.description)+(G.table.challenge?' · '+bossProgress():''));
  el.onclick=openTableRules;
  el.classList.toggle('complete',!!G.table.challenge&&bossReady());
}
function renderShopInventory(){
  const el=$('shopInventory');if(!el)return;el.replaceChildren();
  if((!G.endless&&G.tableIdx>=RUN_LEN-1)||!(G.relics.length||G.consumables.length))return;
  const button=document.createElement('button');button.className='btn b-teal shop-sell';
  button.textContent=t('shop.sellCard');button.setAttribute('aria-haspopup','dialog');
  button.setAttribute('aria-controls','inspectScreen');button.onclick=openShopSale;el.append(button);
}
function openShopSale(){
  if(G.phase!=='shop')return;
  const screen=$('inspectScreen'),body=$('inspectBody');
  screen.classList.remove('table-details-view');screen.classList.add('shop-sale-view');
  inspectRef=null;GameClock.pause('inspect',true);body.replaceChildren();
  const title=document.createElement('h1');title.textContent=t('shop.sellCard');body.append(title);
  const cards=document.createElement('div');cards.className='shop-sale-cards';body.append(cards);
  for(const [kind,items] of [['relic',G.relics],['tarot',G.consumables]])items.forEach((item,i)=>{
    const b=document.createElement('button');b.className='btn b-blue shop-sale-card';
    b.innerHTML='<span class="inspCard tag '+(kind==='tarot'?'tarot':'joker')+'" aria-hidden="true">'+effectMark(item.id,tokFor(item.id).c)+'</span><span class="shop-sale-copy"><span class="shop-sale-name" data-reading-label></span><span class="shop-sale-value"></span></span>';
    b.querySelector('.shop-sale-name').textContent=iName(item);
    b.querySelector('.shop-sale-value').textContent=t('insp.sell',cash(sellValue(item)));
    b.disabled=kind==='relic'&&item.id==='portebonheur'&&G.consumables.length>=consumableSlots();
    b.onclick=()=>{if(G.phase!=='shop')return;inspectRef={kind,i};sellItem();};cards.append(b);
  });
  const close=document.createElement('button');close.className='btn b-teal';close.textContent=t('insp.close');close.onclick=closeInspect;
  $('inspectActions').replaceChildren(close);screen.classList.add('show');
  if(typeof syncMenuFocus==='function')syncMenuFocus();
}
function relicStatus(item){
  const used=item.id==='talisman'?G._talismanUsed:item.id==='compteur'?G.counterUsed:item.id==='phare'?G.phareUsed:null;
  return used===null?'':t(used?'circuit.used':'circuit.available');
}
function relicPower(id){
  if(!canDecide()||!hasRelic(id))return false;
  if(id==='compteur'&&!G.counterUsed){
    if(G.shoe.length<15)buildShoe();G.shoe.pop();G.counterUsed=true;G.knownCard=G.shoe[G.shoe.length-1];updateBustReadout();return true;
  }
  if(id==='phare'&&!G.phareUsed&&!G.magicNext&&!G.smallNext){G.smallNext=true;G.phareUsed=true;return true;}
  return false;
}

/* ---------- état ---------- */
let G={};
function freshGame(){
  GameClock.clear();window.ColdDeckFX?.clear();
  G={bank:startBank(),tableIdx:0,hand:1,shoe:[],dHand:[],pHand:[],bet:10,pressure:0,
     peekUsed:false,knownCard:null,penduArmed:false,smallNext:false,counterUsed:false,phareUsed:false,tableRetried:false,bossState:{wins:0,qualified:0,totals:[]},relics:startRelics(),consumables:[],magicNext:false,insisted:false,forced:false,forcedUsed:false,maxPressureReached:0,tableMaxPressure:0,baraka:0,barakaMax:0,insurance:false,objHit:false,
     phase:'bet',pot:0,tokens:startTokens(),runStars:0,tableStars:[],table:RUN[0],stakeMult:1,splitActive:false,hands:null,hi:0,
     endless:false,palier:0,peak:0,boons:{relic:0,tarot:0,mult:0,income:0,betmax:0,calm:0},streak:0,event:null,contract:null,_talismanUsed:false,_palierCash:false,
     stats:{won:0,played:0,bestGain:0,bestMult:1}};
  G.bet=Math.max(G.table.min,Math.min(G.table.max,10));   // valeur interne par défaut
  G.betChosen=false;                                       // il faut choisir une mise sur la 1re table
  G.tableStartBank=G.bank;
}

/* ---------- sabot / cartes ---------- */
function buildShoe(){
  const s=[];
  for(let d=0;d<4;d++)for(const su of SUITS)for(const r of RANKS)s.push({r,s:su});
  for(let i=s.length-1;i>0;i--){const j=rndInt(i+1);[s[i],s[j]]=[s[j],s[i]];}
  G.shoe=s;
}
function maybeEdition(c){
  if(c.ed)return c;
  let chance=0.05;if(hasRelic('collector'))chance*=3;
  // Keep the overall edition chance and the rarer Prism rate unchanged.
  if(Math.random()<chance)c.ed=Math.random()<0.85?'foil':'poly';
  return c;
}
function draw(){if(G.shoe.length<15)buildShoe();return maybeEdition(G.shoe.pop());}
function drawIdeal(){
  if(G.shoe.length<15)buildShoe();
  const top=0;let bestIdx=-1,bestVal=-1;
  for(let i=G.shoe.length-1;i>=top;i--){
    const t=handValue([...G.pHand,G.shoe[i]]).total;
    if(t<=21&&t>bestVal){bestVal=t;bestIdx=i;}
  }
  if(bestIdx<0)return draw();
  return maybeEdition(G.shoe.splice(bestIdx,1)[0]);
}
function cardBase(r){if(r==='A')return 11;if(r==='K'||r==='Q'||r==='J')return 10;return parseInt(r);}
function handValue(cards){
  let total=0,aces=0;
  for(const c of cards){if(c.r==='A'){aces++;total+=11;}else total+=cardBase(c.r);}
  while(total>21&&aces>0){total-=10;aces--;}
  return {total,soft:aces>0};
}
function bustChance(cards){
  const pool=G.shoe?.length?G.shoe:RANKS.map(r=>({r}));
  return Math.round(pool.filter(c=>handValue(cards.concat(c)).total>21).length/pool.length*100);
}

/* ---------- BARAKA (remplace la pression) ----------
   Barre de veine qui persiste entre les mains : monte quand on gagne
   (coup culotté = +2), retombe à zéro quand on perd. Chaque niveau donne
   un multiplicateur ET débloque de plus grosses mises. */
const BARAKA_STEPS=[2,4,7,10];                 // points cumulés pour les niveaux 1..4
const BARAKA_MULT=[1,1.15,1.3,1.45,1.6];          // multiplicateur par niveau (0..4)
const BARAKA_COL=['#9bbfa8','#34b6a8','#e8b84a','#f0902a','#e0524f'];
function barakaLevel(){let l=0;const b=G.baraka||0;for(const s of BARAKA_STEPS)if(b>=s)l++;return l;}
function barakaPct(){const b=G.baraka||0,lvl=barakaLevel();if(lvl>=4)return 100;const lo=lvl>0?BARAKA_STEPS[lvl-1]:0,hi=BARAKA_STEPS[lvl];return Math.min(100,(lvl+(b-lo)/(hi-lo))/4*100);}
function addBaraka(n,boost=true){
  if(n>0&&boost){
    if(hasRelic('clope'))n*=1.3;                       // Cigarette : la baraka monte 30 % plus vite
    if(G.table&&G.table.rule==='nervous')n*=2;          // Table nerveuse : la baraka monte 2× plus vite
  }
  G.baraka=Math.min(BARAKA_STEPS[3],Math.max(0,(G.baraka||0)+n));G.barakaMax=Math.max(G.barakaMax||0,G.baraka);G.tableMaxBaraka=Math.max(G.tableMaxBaraka||0,G.baraka);renderPressure();renderMult();
}
function resetBaraka(){
  if(G.endless){if(G.boons?.filet){const l=barakaLevel();G.baraka=l>=2?BARAKA_STEPS[l-2]:0;}else G.baraka=0;}
  else G.baraka=Math.floor((G.baraka||0)*(hasRelic('froid')||G.table.rule==='serein'?.75:.5)*10)/10;
  renderPressure();renderMult();
}
/* coup culotté : gagner de façon osée → +2 baraka au lieu de +1 */
function isCulotte(pv,mode){
  if((G.stakeMult||1)>=2)return true;                                                   // doublé
  if(mode!=='natural'&&pv===21)return true;                                             // 21 parfait
  if(G.pHand.length>=5&&pv<=21)return true;                                             // Charlie 5 cartes
  if(pv<=16)return true;                                                                // gagner avec un petit total
  const dv=handValue(G.dHand).total; if(dv<=21&&pv-dv===1)return true;                  // AU POIL
  if(G.pHand.length>=3&&handValue(G.pHand.slice(0,2)).total<=11&&pv>=17)return true;    // remontada
  return false;
}
function addPressure(){}                          // ancienne pression neutralisée (remplacée par la BARAKA)
function pressureState(){
  const p=G.pressure;
  if(p>=100)return['SURCHAUFFE','#ff6f5e'];
  if(p>=75) return['BOUILLANT','#e0514f'];
  if(p>=50) return['CHAUD','#f3b32b'];
  if(p>=25) return['TIÈDE','#cfe08a'];
  return['FROID','#9bbfa8'];
}
function hasRelic(id){return G.relics.some(r=>r.id===id);}

/* ---------- multiplicateur (partagé live + résolution) ---------- */
function computeMult(mode){
  const pv=handValue(G.pHand).total;
  let mult=1,bonusChips=0;const lines=[];
  const isNatural=(mode==='natural'&&G.pHand.length===2&&pv===21);
  if(isNatural){mult*=1.5;lines.push([t('m.blackjack'),'×1.5']);}
  if(pv===21&&!isNatural){mult*=3;lines.push([t('m.perfect'),'×3']);}
  if(hasRelic('phare')&&G.pHand.length===4&&pv<=21){mult*=1.5;lines.push([t('relic.phare.n'),'×1.5','phare']);}
  if(G.pHand.length>=5&&pv<=21){const cm=hasRelic('phare')?3:2;mult*=cm;lines.push([t('m.charlie'),'×'+cm,hasRelic('phare')?'phare':undefined]);}
  if(countRank('7')>=2){mult*=1.5;lines.push([t('m.pair7'),'×1.5']);}
  /* bonus de COMPOSITION : récompensent les mains construites (≥3 cartes) */
  const suits=new Set(G.pHand.map(c=>c.s));
  if(G.pHand.length>=3&&suits.size===1){mult*=2;lines.push([PXI('couleur')+' '+t('m.flush'),'×2']);}     // toutes la même enseigne
  if(isStraight(G.pHand)){mult*=2;lines.push([PXI('suite')+' '+t('m.straight'),'×2']);}                    // rangs qui se suivent
  if(G.pHand.length>=4&&suits.size===4){mult*=1.5;lines.push([PXI('arc')+' '+t('m.rainbow'),'×1.5']);}     // une carte de chaque enseigne
  if(G.insisted){mult*=1.5;lines.push([t('m.pushing'),'×1.5']);}
  const _bl=barakaLevel();
  if(_bl>0){mult*=BARAKA_MULT[_bl];lines.push([t('m.streak',_bl),'×'+BARAKA_MULT[_bl]]);}   // veine en cours
  if(hasRelic('bruleur')&&_bl>=2){mult*=1.3;lines.push([t('m.burner'),'×1.3','bruleur']);}
  /* éditions des cartes en main */
  let foil=0,poly=0;
  for(const c of G.pHand){if(c.ed==='foil')foil++;else if(c.ed==='poly')poly++;}
  if(foil){const chips=foil*Math.max(1,Math.round(G.bet*(G.stakeMult||1)*.15));bonusChips+=chips;lines.push([PXI('diamond')+' '+t('m.foil'),t('m.foilV',chips)]);}
  if(poly){const pm=Math.pow(1.5,poly);mult*=pm;lines.push([PXI('diamond')+' '+t('m.poly'),'×'+(Math.round(pm*100)/100)]);}
  if(hasRelic('as')&&G.pHand.some(c=>c.r==='A')){mult+=1;lines.push([t('m.ace'),'+1','as']);}
  if(pv<=15){mult*=1.5;lines.push([t('m.lowball'),'×1.5']);}
  /* One explicit cap, with no hidden reduction of individual bonuses. */
  const cap=(ZONE_MULTCAP[curTable().zone]||9)+((G.boons&&G.boons.mult)||0);
  if(mult>cap){mult=cap;lines.push([t('m.zonecap'),'×'+cap]);}
  mult=Math.round(mult*100)/100;
  return {mult,lines,bonusChips};
}
function countRank(r){return G.pHand.filter(c=>c.r===r).length;}
/* SUITE : ≥3 cartes dont les rangs forment une séquence consécutive (sans doublon) ; l'As peut être bas ou haut */
const RANK_ORD={A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13};
function isStraight(cards){
  if(cards.length<3)return false;
  const ns=[...new Set(cards.map(c=>RANK_ORD[c.r]))];
  if(ns.length!==cards.length)return false;                    // un rang en double casse la suite
  const consec=a=>a.every((v,i)=>i===0||v===a[i-1]+1);
  ns.sort((a,b)=>a-b);
  if(consec(ns))return true;
  if(ns.includes(1)){const hi=ns.filter(v=>v!==1).concat(14).sort((a,b)=>a-b);if(consec(hi))return true;}  // As haut (Q-K-A)
  return false;
}

/* ============================================================
   RENDU
   ============================================================ */
function fmtMult(m){return '×'+(Number.isInteger(m)?m:String(m).replace(/\.0$/,''));}

/* Smooth, illustrated cards. Visuals never consume the deck RNG. */
function suitSVG(suit,size){return ColdDeckArt.suit(suit,size);}
function heartSVG(size){return ColdDeckArt.suit('♥',size);}
function cardEl(c,opts={}){
  const d=document.createElement('div');d.className='card';
  if(opts.back){
    d.classList.add('back',cardBack);d.innerHTML=ColdDeckArt.back(cardBack);
    d.setAttribute('aria-label',LANG==='fr'?'Carte cachée':'Hidden card');
  }else{
    d.dataset.suit=c.s;d.dataset.rank=c.r;
    d.setAttribute('aria-label',c.r+' '+c.s);
    if(c.s==='♥'||c.s==='♦')d.classList.add('red');
    if(!opts.dealer&&c.ed)d.classList.add(c.ed);
    const corner='<span class="corner-r">'+ColdDeckArt.lettering(c.r)+'</span>';
    const tag=(!opts.dealer&&c.ed)?'<span class="edtag '+c.ed+'">'+edName(c.ed)+'</span>':'';
    if(!opts.dealer&&c.ed)d.setAttribute('aria-label',c.r+' '+c.s+' · '+edName(c.ed)+' · '+edInfo(c.ed));
    d.innerHTML=ColdDeckArt.surface('<span class="corner tl">'+corner+'</span>'+ColdDeckArt.face(c.r,c.s)+'<span class="corner br">'+corner+'</span>'+tag);
  }
  if(opts.arrive)d.classList.add('arrive');
  else if(opts.flip)d.classList.add('flip');
  else if(opts.placed)d.classList.add('placed');
  if(!opts.back&&opts.placed&&barakaLevel()>=3&&G.phase==='play')d.classList.add('jit');
  return d;
}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
const renderedCardSlots=new WeakMap();
const dealerFaceTurns=new WeakMap();
function syncChildren(parent,children){
  children.forEach((child,i)=>{if(parent.children[i]!==child)parent.insertBefore(child,parent.children[i]||null);});
  while(parent.children.length>children.length)parent.lastElementChild.remove();
}
function setReadout(el,value){
  const text=String(value);
  if((el.querySelector('.sr-only')?.textContent??el.textContent)!==text)el.textContent=text;
}
function fannedCard(c,idx,total,opts){
  let slot=renderedCardSlots.get(c);
  if(!slot){slot=document.createElement('div');slot.className='cardslot';renderedCardSlots.set(c,slot);}
  const density=window.devicePixelRatio||1;
  const snapPixel=value=>Math.round(value*density)/density;
  const spread=Math.max(2,total);               // garde la première carte sur sa place dans la paire
  const mid=(spread-1)/2;
  const step=Math.min(2.6,9/(spread-1));
  const baseRot=(idx-mid)*step;                 // éventail régulier
  const arc=Math.abs(idx-mid)*1.8;              // cartes extérieures un peu plus basses
  const seed=c.r+c.s+idx;
  const jRot=(hashStr(seed+'r')-0.5)*3;         // ±1.5° pour casser la symétrie
  const jY=(hashStr(seed+'y')-0.5)*3;           // ±1.5px
  // espace horizontal aléatoire entre les cartes : elles ne se chevauchent plus en se retournant
  // (la carte de droite, arrivée après, peut encore se superposer un tout petit peu)
  slot.style.marginLeft=idx>0?snapPixel(hashStr(seed+'x')*5-3)+'px':'';
  slot.style.transform=`translateY(${snapPixel(arc+jY)}px) rotate(${(baseRot+jRot).toFixed(2)}deg)`;
  const motionSeed=c.r+c.s+'#'+idx+(opts.dealer?'d':'p');
  const breathDuration=2.8+hashStr(motionSeed+'life')*1.1;
  slot.style.setProperty('--card-duration',breathDuration.toFixed(3)+'s');
  slot.style.setProperty('--card-delay','-'+(hashStr(motionSeed+'~')*breathDuration).toFixed(3)+'s');
  const contentKey=[c.r,c.s,c.ed||'',!!opts.dealer,LANG,cardBack].join('|');
  const viewKey=[contentKey,!!opts.back,!!opts.flip,!!opts.arrive,!!opts.placed,barakaLevel()>=3&&G.phase==='play'].join('|');
  if(slot._viewKey!==viewKey){
    const front=!opts.flip&&!opts.back&&!opts.arrive&&slot._contentKey===contentKey?slot.querySelector('.flipwrap>.front'):null;
    let view;
    if(front){view=front;front.classList.remove('front');front.classList.toggle('placed',!!opts.placed);front.classList.toggle('jit',!!opts.placed&&barakaLevel()>=3&&G.phase==='play');}
    else view=opts.flip?flipCard(c,Object.assign({idx:idx},opts)):cardEl(c,Object.assign({idx:idx},opts));
    slot.replaceChildren(view);slot._viewKey=viewKey;slot._contentKey=contentKey;
  }
  return slot;
}
// carte à deux faces pour un vrai retournement (dos visible -> pivote -> face)
function flipCard(c,opts){
  const wrap=document.createElement('div');wrap.className='flipwrap';
  const back=cardEl(c,Object.assign({},opts,{back:true,flip:false,arrive:false,placed:false}));
  const front=cardEl(c,Object.assign({},opts,{back:false,flip:false,arrive:false,placed:false}));
  front.classList.add('front');
  wrap.appendChild(back);wrap.appendChild(front);
  return wrap;
}
function renderHands(reveal=false){
  const dh=$('dHand'),ph=$('pHand'),dealerSlots=[],playerSlots=[];
  const dShown=G.dHand.filter(c=>!c._pending),pShown=G.pHand.filter(c=>!c._pending);
  dh.style.setProperty('--hand-count',Math.max(2,dShown.length));ph.style.setProperty('--hand-count',Math.max(2,pShown.length));
  ph.style.setProperty('--split-count',G.splitActive?Math.max(4,G.hands.reduce((n,h)=>n+h.length,0)):4);
  G.dHand.forEach((c,i)=>{
    if(c._pending)return;                                         // pas encore distribuée
    if(G.doFlip&&reveal&&(G.table.rule==='mute'||i===1)&&!dealerFaceTurns.has(c)){
      const turnState=G;dealerFaceTurns.set(c,false);
      gameDelay(()=>{if(G===turnState&&dealerFaceTurns.has(c)){dealerFaceTurns.set(c,true);renderHandTotals(true);window.ColdDeckFX?.onCard(c);}},window.ColdDeckFX?.reduced?0:CARD_FACE_AT);
      gameDelay(()=>{dealerFaceTurns.delete(c);if(G===turnState)renderHands(true);},CARD_FLIP);
    }
    const hideMute=(G.table.rule==='mute'&&!reveal);
    const hideHole=(i===1&&!reveal&&G.phase!=='done');
    const back=(c._fd!=null)?c._fd:(hideMute||hideHole);          // _fd : pilotage par la distribution
    const arrive=!!c._arr;
    const flip=c._flip||dealerFaceTurns.has(c);
    dealerSlots.push(fannedCard(c,i,dShown.length,{back,dealer:true,arrive,flip,placed:!arrive&&!flip}));
  });
  syncChildren(dh,dealerSlots);
  if(G.splitActive){
    const wrap=ph.querySelector('.splitwrap')||document.createElement('div');wrap.className='splitwrap';
    const groups=[];
    G.hands.forEach((h,hi)=>{
      const g=wrap.children[hi]||document.createElement('div');g.className='splithand';
      if(G.phase==='play'&&hi!==G.hi)g.classList.add('dim');
      if(G.phase==='play'&&hi===G.hi)g.classList.add('active');
      const shown=h.filter(c=>!c._pending);
      const slots=shown.map((c,i)=>{
        const arrive=!!c._arr,flip=!!c._flip;
        return fannedCard(c,i,shown.length,{back:c._fd,arrive,flip,placed:!arrive&&!flip});
      });
      const up=shown.filter(cardFaceVisible);
      const val=up.length?handValue(up).total:0;
      const badge=g.querySelector('.shval')||document.createElement('div');badge.className='shval';setReadout(badge,up.length?val:'—');
      if(G.phase==='done'){g.classList.remove('dim','active');const dv=handValue(G.dHand).total;
        const w=val<=21&&(dv>21||val>dv);const l=val>21||(dv<=21&&val<dv);
        if(w)g.classList.add('win');else if(l)g.classList.add('lose');}
      syncChildren(g,[...slots,badge]);groups.push(g);
    });
    syncChildren(wrap,groups);syncChildren(ph,[wrap]);
  }else{
  G.pHand.forEach((c,i)=>{
    if(c._pending)return;
    const arrive=!!c._arr,flip=!!c._flip;
    playerSlots.push(fannedCard(c,i,pShown.length,{back:c._fd,arrive,flip,placed:!arrive&&!flip}));
  });
  syncChildren(ph,playerSlots);
  }
  renderHandTotals(reveal);
}
function cardFaceVisible(c){return !c._pending&&!c._fd&&(!c._flip||c._faceVisible)&&(!dealerFaceTurns.has(c)||dealerFaceTurns.get(c));}
function renderHandTotals(reveal=false){
  const player=(G.splitActive?G.hands[G.hi]:G.pHand).filter(cardFaceVisible);
  setReadout($('pVal'),player.length?handValue(player).total:'—');
  if(G.splitActive)G.hands.forEach((hand,i)=>{
    const up=hand.filter(cardFaceVisible),badge=$('pHand').querySelectorAll('.shval')[i];
    if(badge)setReadout(badge,up.length?handValue(up).total:'—');
  });
  const dealer=G.dHand.filter(cardFaceVisible);
  setReadout($('dVal'),reveal?(dealer.length?handValue(dealer).total:'—'):G.table.rule==='mute'?'?':dealer.length?handValue([dealer[0]]).total:'—');
}
function renderPressure(){   // (barre BARAKA — on garde le nom pour tous les appels)
  const pct=barakaPct(),lvl=barakaLevel();
  document.documentElement.style.setProperty('--p',(pct/100).toFixed(3));
  const f=$('pFill');if(f)f.style.width=pct+'%';
  const levelLabel=t('ui.lvl',lvl,BARAKA_MULT[lvl]).replace(/^·\s*/,'');
  const pp=$('pPct');if(pp){pp.textContent=levelLabel;pp.style.display='';}
  const ps=$('pState');if(ps){ps.textContent=t('ui.streak');ps.style.color='';}
  const bar=$('pBar');if(bar){bar.classList.toggle('tick',lvl>=3);bar.dataset.active=String(pct>0);bar.dataset.level=String(lvl);}
  const track=$('barakaTrack');if(track){track.setAttribute('aria-valuenow',String(Math.round(pct)));track.setAttribute('aria-valuetext',levelLabel);}
  const tbl=document.getElementById('table');if(tbl)tbl.classList.toggle('boil',lvl>=3);
  window.ColdDeckFX?.onPressure();
}
function renderMult(){
  if(G.phase==='play'&&G._dealing&&G.pHand.some(c=>!cardFaceVisible(c))){renderCombos();return;}
  let m=1,bonus=0;
  if(G.phase==='play'&&G.pHand.length){
    const mode=(G.pHand.length===2&&handValue(G.pHand).total===21)?'natural':'stand';
    const r=computeMult(mode);m=r.mult;bonus=r.bonusChips;
  }
  const stake=G.bet*(G.stakeMult||1);
  $('chipsVal').textContent=bonus?(boardCash(stake)+'+'+bonus):boardCash(stake);
  $('multVal').textContent=fmtMult(m);
  sizeBoardValue($('chipsVal'),3.4);sizeBoardValue($('multVal'),3.4);
  $('scorebox').classList.toggle('hot',m>1||bonus>0);
  renderCombos();
}
/* ---------- only combinations already formed by the visible hand ---------- */
function activeCombos(){
  const active=[];
  const add=(key,title,mult)=>active.push({key,title,mult});
  const h=G.pHand,n=h.length,v=handValue(h).total;
  if(!n||v>21)return active;
  const suits=new Set(h.map(c=>c.s));
  const sevens=h.filter(c=>c.r==='7').length;
  if(v===21&&n===2)add('blackjack',t('m.blackjack'),1.5);
  if(v===21&&n>2)add('perfect',t('m.perfect'),3);
  if(n>=5)add('charlie',t('m.charlie'),hasRelic('phare')?3:2);
  if(n===4&&hasRelic('phare'))add('phare',t('relic.phare.n'),1.5);
  if(sevens>=2)add('pair7',t('m.pair7'),1.5);
  if(n>=3&&suits.size===1)add('flush',t('m.flush'),2);
  if(isStraight(h))add('straight',t('m.straight'),2);
  if(n>=4&&suits.size===4)add('rainbow',t('m.rainbow'),1.5);
  if(G.insisted)add('pushing',t('m.pushing'),1.5);
  const bl=barakaLevel();if(bl>0)add('streak'+bl,t('m.streak',bl),BARAKA_MULT[bl]);
  if(v<=15)add('lowball',t('m.lowball'),1.5);
  return active;
}
function renderCombos(){
  const row=$('comboRow');if(!row)return;
  const clear=()=>{row.replaceChildren();row.style.display='none';row.removeAttribute('aria-busy');};
  if(!['play','dealer','done'].includes(G.phase)||!G.pHand.length){clear();return;}
  // Wait for the drawn face; a hidden card must not reveal a new combination.
  if(G._dealing&&G.pHand.some(c=>!cardFaceVisible(c))){row.setAttribute('aria-busy','true');return;}
  if(handValue(G.pHand).total>21){clear();return;}
  // Freeze the qualifying multipliers while the dealer plays and the payout lands.
  if(G.phase==='dealer'||G.phase==='done'){row.setAttribute('aria-busy','false');return;}
  const entries=activeCombos();
  const order=['blackjack','perfect','charlie','phare','pair7','flush','straight','rainbow','lowball','pushing','streak1','streak2','streak3','streak4'];
  entries.sort((a,b)=>order.indexOf(a.key)-order.indexOf(b.key));
  const keys=new Set(entries.map(entry=>entry.key));
  const boxes=new Map([...row.children].map(box=>[box.dataset.comboKey,box]));
  const activated=[];
  entries.forEach((entry,index)=>{
    let box=boxes.get(entry.key);
    if(!box){
      box=document.createElement('div');box.className='combo-tile on';box.dataset.comboKey=entry.key;box.setAttribute('role','listitem');
      const title=document.createElement('span');title.className='combo-name';
      const multiplier=document.createElement('span');multiplier.className='combo-detail combo-multiplier game-number';
      multiplier.dataset.valueKind='bonus';box.append(title,multiplier);activated.push(box);
    }
    const title=entry.title.charAt(0)+entry.title.slice(1).toLocaleLowerCase();
    const value=LANG==='fr'?fmtMult(entry.mult).replace('.',','):fmtMult(entry.mult);
    box.classList.toggle('compact',title.length>12);
    box.querySelector('.combo-name').textContent=title;
    box.querySelector('.combo-multiplier').innerHTML=ColdDeckArt.lettering(value);
    box.style.setProperty('--combo-angle',[-4,2,-2.5,3.5,-2,2][index%6]+'deg');
    box.style.setProperty('--combo-lift',(index%2?2:-1)+'px');
    box.style.setProperty('--combo-layer',index+1);
    const status=box.classList.contains('paid')?(LANG==='fr'?'Bonus gagné':'Bonus won'):(LANG==='fr'?'Si victoire':'On a win');
    box.title=title+' '+value+' · '+status;box.setAttribute('aria-label',box.title);
    if(row.children[index]!==box)row.insertBefore(box,row.children[index]||null);
  });
  for(const box of [...row.children])if(!keys.has(box.dataset.comboKey))box.remove();
  row.style.setProperty('--combo-count',Math.max(1,Math.min(entries.length,4)));
  row.dataset.scroll=String(entries.length>4);
  row.setAttribute('aria-busy','false');row.tabIndex=0;row.setAttribute('role','list');
  row.setAttribute('aria-label',LANG==='fr'?'Combos actifs et multiplicateurs':'Active combinations and multipliers');
  row.style.display=row.childElementCount?'flex':'none';
  activated.forEach(box=>window.ColdDeckFX?.onComboReady(box));
}

function renderTop(){
  const tb=G.table;
  const nMains=isFinite(tb.mains)?tb.mains:0;        // en infini mains = Infinity (bandeau masqué)
  $('tableNum').textContent=G.endless?('∞'+(G.tableIdx+1)):((G.tableIdx+1)+'/'+RUN_LEN);
  $('handNum').textContent=G.hand;$('handMax').textContent=nMains;
  const left=nMains-G.hand+1;
  $('handsLeft').textContent=left;
  // bandeau « tours » permanent (concept 2) — masqué en mode infini
  const tn=$('turnNum');if(tn){tn.textContent=G.endless?'∞':left;tn.classList.toggle('warn',!G.endless&&left===1);}
  const mn=$('mainNum');if(mn)mn.textContent=G.hand;
  const mx=$('mainMax');if(mx)mx.textContent=nMains;
  const tp=$('turnPips');if(tp){let h='';for(let i=0;i<nMains;i++)h+='<i class="'+(i<G.hand?'on':'')+'"></i>';tp.innerHTML=h;}
  applyFelt();   // tapis évolutif : design + couleur selon la table
  const lv=$('lives');if(lv){const n=G.tokens||0;lv.innerHTML=Array.from({length:Math.max(3,Math.min(5,n))},(_,i)=>'<span class="life'+(i>=n?' off':'')+'" aria-hidden="true">'+heartSVG(20)+'</span>').join('')+(n>5?'<span class="lvn">+'+(n-5)+'</span>':'');lv.setAttribute('aria-label',t('ui.lives')+' : '+n);lv.classList.toggle('empty',n<=0);}  // vies / secondes chances
  $('tableName').textContent=tableName(tb);                         // nom seul, en gros
  const tableNumber=$('tableNumber');if(tableNumber)tableNumber.textContent=String(G.endless?(G.palier||0)+1:G.tableIdx+1).padStart(2,'0');
  window.ColdDeckJourney?.renderHud();
  $('shoeCount').textContent=G.shoe.length;
  renderObjective();renderCircuitStatus();
}
/* barre de progression GAIN → OBJECTIF (au-dessus du tapis) */
function renderObjective(){
  const bank=window.ColdDeckFX?.bankValue??G.bank;
  const gv=$('gainVal');if(gv){gv.textContent=boardCash(bank);sizeBoardValue(gv,4.3);}
  const lbl=document.querySelector('#gainStat .lbl');if(lbl)lbl.textContent=G.endless?t('ui.potLbl'):t('ui.gain');
  // nouvelle table / palier : la barre repart de 0 SANS glisser depuis l'objectif précédent (on coupe la transition le temps de la remettre à zéro)
  const _of=$('objFill'),_snap=_of&&G._objBarIdx!==G.tableIdx;
  if(_snap){_of.style.transition='none';_of.style.width='0%';void _of.offsetWidth;_of.style.transition='';G._objBarIdx=G.tableIdx;}
  if(G.endless){                                           // barre = cagnotte vers le prochain PALIER (depuis 0, jamais vide tant qu'on a des jetons)
    const p=G.palier||0,target=palierTarget(p);
    const pct=Math.max(0,Math.min(100,bank/Math.max(1,target)*100));
    const f=$('objFill');if(f)f.style.width=pct+'%';
    const g=$('objGoal');if(g)g.textContent=boardCash(target);
    updateObjectiveReadout(pct);
    const bar=$('objBar');if(bar)bar.classList.remove('full');
    if(gv)gv.classList.remove('warn');
    return;
  }
  const goal=(G.table&&G.table.goal)||1;
  // barre = jetons ABSOLUS (depuis 0) vers l'objectif, exactement comme les paliers en Sans Fin (bank/target)
  const pct=Math.max(0,Math.min(100,bank/Math.max(1,goal)*100));
  const f=$('objFill');if(f)f.style.width=pct+'%';
  const g=$('objGoal');if(g)g.textContent=boardCash(goal);
  updateObjectiveReadout(pct);
  if(gv)gv.classList.toggle('warn',!!(G.table&&bank<G.table.min*3));
  const bar=$('objBar');if(bar)bar.classList.toggle('full',bank>=goal);
}
function updateObjectiveReadout(pct){
  const rounded=Math.round(pct),label=$('objPct'),bar=$('objBar');
  if(label)label.textContent=rounded+'%';
  if(bar){bar.setAttribute('aria-valuenow',rounded);bar.setAttribute('aria-label',t('modern.goal'));}
}
// A stable five-slot shelf, with horizontal scrolling when more items are owned.
function renderInventorySlots(){
  const shelf=$('effects');shelf.hidden=false;
  shelf.setAttribute('aria-label',t('modern.loadout'));
  const count=shelf.querySelectorAll('.joker,.tarot').length;
  const empty=[...shelf.querySelectorAll('.inventory-empty')],needed=Math.max(0,5-count);
  while(empty.length>needed)empty.pop().remove();
  while(empty.length<needed){const slot=document.createElement('span');slot.className='inventory-empty';slot.setAttribute('aria-hidden','true');shelf.append(slot);empty.push(slot);}
}
function fanEffects(){
  // étiquettes : simple rangée (plus d'éventail de jetons)
  document.querySelectorAll('#effects .joker,#effects .tarot').forEach(el=>{el.style.translate='';el.style.rotate='';el.style.zIndex='';});
  fitLabelText();
}
/* réduit la valeur d'une étiquette si elle dépasse la largeur fixe (garde des tags identiques, sans coupe) */
function fitLabelText(){
  document.querySelectorAll('#effects .ft').forEach(ft=>{
    const box=ft.parentElement;if(!box)return;
    const avail=box.clientWidth-8;if(avail<=0)return;
    ft.style.fontSize='';let fs=parseFloat(getComputedStyle(ft).fontSize)||12,g=0;
    while(ft.scrollWidth>avail&&fs>7&&g<40){fs-=0.5;ft.style.fontSize=fs+'px';g++;}
  });
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{
    document.querySelectorAll('#effects .ft').forEach(ft=>{const box=ft.parentElement;if(!box)return;const avail=box.clientWidth-8;if(avail<=0)return;let fs=parseFloat(getComputedStyle(ft).fontSize)||12,g=0;while(ft.scrollWidth>avail&&fs>7&&g<40){fs-=0.5;ft.style.fontSize=fs+'px';g++;}});
  });
}
/* jeton : disque + 12 crans crème (répartis à 30°) + intérieur noir — même markup partout */
/* 12 crans crème : rayon calculé cran par cran pour que le COIN le plus externe
   du carré soit tangent au contour (Rt %) — jamais au-delà, même en diagonale */
const CHIP_NOTCHES=(()=>{
  const Rc=40;                 // rayon des inserts trapèze crème (centrés dans la bande accent)
  const Rt=41;                 // rayon des trapèzes foncés intercalés à +15° (deux tons)
  let s='';
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const x=(50+Rc*Math.sin(a)).toFixed(2),y=(50-Rc*Math.cos(a)).toFixed(2);
    s+=`<i class="chpn" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${(i*30)}deg)"></i>`;
    const a2=(i+0.5)*Math.PI/6;
    const x2=(50+Rt*Math.sin(a2)).toFixed(2),y2=(50-Rt*Math.cos(a2)).toFixed(2);
    s+=`<i class="chptk" style="left:${x2}%;top:${y2}%;transform:translate(-50%,-50%) rotate(${(i*30+15)}deg)"></i>`;
  }
  return s;
})();
/* jeton : ombre + liseret ext. crème + bande accent + crans + liseret int. crème + centre noir */
function chipInner(){return '<i class="chps"></i><i class="chpo"></i><i class="chpd"></i>'+CHIP_NOTCHES+'<i class="chpl"></i><i class="chpb"></i><i class="chpdia dtop"></i><i class="chpdia dbot"></i>';}
/* dimensionne le texte de chaque jeton PROPORTIONNELLEMENT à sa taille (identique en boutique/jeu/détail) :
   on part d'une taille max (les libellés courts remplissent bien le centre) puis on réduit seulement
   si le texte est trop large → variation « fun » selon la longueur, cohérente à toutes les échelles */
function fitChipText(){
  document.querySelectorAll('#inspectBody .inspCard .ft,.shopItem .shopTok .ft').forEach(ft=>{
    const chip=ft.parentElement;if(!chip)return;
    const W=chip.getBoundingClientRect().width;
    if(!W)return;
    const isTag=chip.classList.contains('tag');   // étiquette boutique = presque toute la largeur ; jeton = centre noir (~60%)
    const target=W*(isTag?0.86:0.60);
    let fs=W*(isTag?0.28:0.30), floor=W*0.135, g=0;   // départ = 30% du jeton (max), plancher ≈ libellé très long
    ft.style.fontSize=fs+'px';
    while(ft.getBoundingClientRect().width>target&&fs>floor&&g<80){fs-=0.5;ft.style.fontSize=fs+'px';g++;}
  });
}
/* rejoue l'ajustement après layout + chargement de la police (sinon mesure trop tôt = texte non réduit) */
function scheduleFitChipText(){
  fitChipText();
  requestAnimationFrame(fitChipText);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitChipText);
}
function renderRelics(){
  const wrap=$('relics'),existing=new Map([...wrap.children].map(d=>[d.dataset.inventoryKey,d])),seen=new Map();
  const nodes=G.relics.map((r,idx)=>{
    const occurrence=seen.get(r.id)||0;seen.set(r.id,occurrence+1);
    const key=r.id+':'+occurrence;
    let d=existing.get(key);
    if(!d){d=document.createElement('div');d.className='joker';d.dataset.relic=r.id;d.dataset.inventoryKey=key;d.innerHTML=effectMark(r.id,tokFor(r.id).c);}
    d.classList.toggle('hot',r.id==='bruleur'&&barakaLevel()>=2);
    d.title=`${iName(r)} — ${iDesc(r)} ${relicStatus(r)}`;d.classList.toggle('spent',!!relicStatus(r)&&relicStatus(r)===t('circuit.used'));
    d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label',d.title);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();d.click();}};d.onclick=()=>openInspect('relic',idx);
    return d;
  });
  syncChildren(wrap,nodes);
  $('slotc').textContent=`${G.relics.length}/5`;
  $('slotc').parentElement.setAttribute('aria-label',`${t('ui.relics')} : ${G.relics.length}/5`);
  renderInventorySlots();
  fanEffects();
}
function consumableSlots(){return 2+(hasRelic('portebonheur')?1:0)+uLvl('tarot')+((G.boons&&G.boons.tarot)||0);}
function renderConsumables(){
  const row=$('consumeRow'),wrap=$('consumes'),existing=new Map([...wrap.children].map(d=>[d.dataset.inventoryKey,d])),seen=new Map();
  const nodes=G.consumables.map((card,i)=>{
    const occurrence=seen.get(card.id)||0;seen.set(card.id,occurrence+1);
    const key=card.id+':'+occurrence;
    let d=existing.get(key);
    if(!d){d=document.createElement('div');d.className='tarot';d.dataset.inventoryKey=key;d.innerHTML=effectMark(card.id,tokFor(card.id).c);}
    d.title=`${iName(card)} — ${iDesc(card)}`;
    d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label',d.title);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();d.click();}};d.onclick=()=>openInspect('tarot',i);
    return d;
  });
  syncChildren(wrap,nodes);
  $('consumeSlots').textContent=`${G.consumables.length}/${consumableSlots()}`;
  $('consumeSlots').parentElement.setAttribute('aria-label',`${t('ui.consumables')} : ${G.consumables.length}/${consumableSlots()}`);
  renderInventorySlots();
  row.style.display=(G.consumables.length||hasRelic('portebonheur'))?'flex':'none';
  fanEffects();
}
function addEditionToHand(ed){
  if(ed!=='foil'&&ed!=='poly')return false;
  const eligible=G.pHand.filter(c=>!c.ed);
  const target=G.pHand[G.editionTarget];
  const c=target&&!target.ed?target:eligible[0];
  if(!c)return false;c.ed=ed;renderHands();renderMult();return c;
}
function useConsumable(i,el,target){
  const card=G.consumables[i];if(!card||!['bet','play'].includes(G.phase)||G._dealing||G._settling||GameClock.reasons.size)return;
  if(card.when==='play'&&G.phase!=='play'){popText(t('msg.notNow'),t('msg.notNowSub'));return;}
  if(card.need==='cards'&&!G.pHand.some(c=>!c.ed)){popText(t('circuit.noBlank'),'');return;}
  G.editionTarget=target;
  const res=card.use();delete G.editionTarget;
  if(res===false){popText(t('msg.cant'),'');return;}
  if(el)el.classList.add('flash');
  G.consumables.splice(i,1);G.tarotThisHand=true;sfx.buy();popText(iName(card),res);
  renderConsumables();renderRelics();renderTop();renderActions();renderMult();checkBankGoal();
}
/* prix de revente : la moitié de ce qu'on a payé (jamais plus cher que l'achat) */
function sellValue(item){
  return Math.max(0,Math.floor((item?._paid||0)*.5));
}
let inspectRef=null;
function openInspect(kind,i){
  const item=kind==='tarot'?G.consumables[i]:G.relics[i];if(!item)return;
  $('inspectScreen').classList.remove('table-details-view','shop-sale-view');
  inspectRef={kind,i};GameClock.pause('inspect',true);
  const status=kind==='relic'?relicStatus(item):'';
  $('inspectBody').innerHTML='<div class="inspCard tag '+(kind==='tarot'?'tarot':'joker')+'">'+effectMark(item.id,tokFor(item.id).c)+'</div><h1>'+iName(item)+'</h1><p>'+iDesc(item)+'</p>'+(status?'<p class="relic-state">'+status+'</p>':'');
  const act=$('inspectActions');act.innerHTML='';
  const mk=(label,fn,disabled=false)=>{const b=document.createElement('button');b.className='btn b-blue';b.textContent=label;b.disabled=disabled;b.onclick=fn;act.append(b);return b;};
  const decision=['bet','play'].includes(G.phase)&&!G._dealing&&!G._settling;
  if(kind==='tarot'){
    const playable=decision&&(item.when!=='play'||G.phase==='play');
    mk(t('insp.use'),()=>{
      if(['diable','etoileD'].includes(item.id)){
        const ed={diable:'poly',etoileD:'foil'}[item.id];act.replaceChildren();
        const base=computeMult('stand'),stake=G.bet*(G.stakeMult||1),before=Math.round((stake+base.bonusChips)*base.mult);
        G.pHand.forEach((c,j)=>{if(c.ed)return;c.ed=ed;const after=computeMult('stand');delete c.ed;
          const gain=Math.round((stake+after.bonusChips)*after.mult)-before;
          mk(c.r+c.s+' · '+t('circuit.editionPreview',cash(gain)),()=>{closeInspect();useConsumable(i,null,j);});
        });
        mk(t('insp.close'),closeInspect);
      }else {closeInspect();useConsumable(i);}
    },!playable||(item.need==='cards'&&!G.pHand.some(c=>!c.ed))||(['etoile','jugement'].includes(item.id)&&barakaLevel()>=4)||(item.id==='soleil'&&G.baraka<2)||(item.id==='pendu'&&G.penduArmed)||(item.id==='magicien'&&(G.magicNext||G.smallNext)));
  }else if(['compteur','phare'].includes(item.id)){
    const used=item.id==='compteur'?G.counterUsed:G.phareUsed;
    mk(t('power.'+item.id),()=>{closeInspect();if(relicPower(item.id)){sfx.buy();renderRelics();renderActions();}},!decision||G.phase!=='play'||used||(item.id==='phare'&&(G.magicNext||G.smallNext)));
  }
  mk(t('insp.sell',cash(sellValue(item))),sellItem,!['bet','shop'].includes(G.phase)||(kind==='relic'&&item.id==='portebonheur'&&G.consumables.length>=consumableSlots()));
  mk(t('insp.close'),closeInspect);$('inspectScreen').classList.add('show');
}
function closeInspect(){const s=$('inspectScreen');if(s)s.classList.remove('show','table-details-view','shop-sale-view','contract-info-view');inspectRef=null;GameClock.pause('inspect',false);if(typeof syncMenuFocus==='function')syncMenuFocus();}
function sellItem(){
  if(!inspectRef||!['bet','shop'].includes(G.phase))return;
  const {kind,i}=inspectRef;
  const arr=kind==='tarot'?G.consumables:G.relics;
  const item=arr[i];if(!item){closeInspect();return;}
  if(kind==='relic'&&item.id==='portebonheur'&&G.consumables.length>=consumableSlots())return;
  const val=sellValue(item);
  G.bank+=val;arr.splice(i,1);sfx.buy();
  closeInspect();
  popText(t('msg.sold'),iName(item)+' · +'+cash(val));
  renderRelics();renderConsumables();renderTop();renderChips();renderActions();
  if(G.phase==='shop'){renderShopHead();renderShop();}else checkBankGoal();
}
function applyHandIncome(){
  let inc=0;const parts=[],unit=G.table.max;
  if(hasRelic('mecene')&&G.bank<G.table.cap){const n=Math.max(1,Math.round(unit*.12));inc+=n;parts.push(t('inc.patron',n));}
  if(hasRelic('usurier')){const n=Math.min(Math.round(unit*.12),Math.floor(G.bank*.01));if(n>0){inc+=n;parts.push(t('inc.shark',n));}}
  const tip=G.endless?uLvl('pourboire'):Math.round(unit*.02*uLvl('pourboire'));
  if(tip>0){inc+=tip;parts.push(t('inc.tip',tip));}
  if(G.boons?.income>0){inc+=G.boons.income;parts.push(t('inc.tier',G.boons.income));}
  if(inc>0){G.bank+=inc;renderTop();renderChips();G._income={amt:inc,parts:parts.slice()};}else G._income=null;
}
/* mises échelonnées : on monte avec la banque (100, 200, 500, 1000…) ;
   on n'affiche que les 4 plus grosses valeurs abordables pour ne pas surcharger */
/* paliers de mise FIXES, propres à la table : entre min et max, jamais un % du capital */
function betChoices(){
  const t=curTable();
  const maxB=roundBet(t.max*(1+0.25*barakaLevel()));   // la BARAKA débloque de plus grosses mises (+25 %/niveau)
  const span=maxB-t.min;
  const raw=span<=0?[t.min]:[t.min,roundBet(t.min+span/3),roundBet(t.min+2*span/3),maxB];
  const opts=[...new Set(raw)].sort((a,b)=>a-b);
  if(G.endless&&G.event&&G.event.id==='forcee'){                 // MISE FORCÉE : un seul choix, le plus haut abordable
    const aff=opts.filter(v=>v<=G.bank);
    return [aff.length?aff[aff.length-1]:opts[0]];
  }
  return opts;
}
function clampBet(){
  if(G.phase!=='bet')return; // Never change an already committed stake.
  const opts=betChoices();
  G.bet=Math.max(opts[0],Math.min(opts[opts.length-1],G.bet));
  // toujours calée sur un palier de mise réellement affiché (sinon rien n'apparaît sélectionné)
  if(!opts.includes(G.bet))G.bet=opts.reduce((a,b)=>Math.abs(b-G.bet)<Math.abs(a-G.bet)?b:a,opts[0]);
  // on ne peut pas miser plus que son capital : on retombe sur le plus gros palier abordable
  if(G.bet>G.bank){const aff=opts.filter(v=>v<=G.bank);G.bet=aff.length?aff[aff.length-1]:opts[0];}
  G.betChosen=true;   // une mise reste toujours sélectionnée et visible à l'écran
}
function renderChips(){
  const wrap=$('chips');wrap.innerHTML='';
  const opts=betChoices();clampBet();
  const locked=(G.phase!=='bet');     // mise verrouillée dès qu'une main est lancée
  opts.forEach(v=>{
    const b=document.createElement('button');b.type='button';
    const tooDear=v>G.bank;            // palier hors budget
    b.className='chip'+((G.betChosen&&G.bet===v)?' on':'')+((locked||tooDear)?' locked':'');
    b.innerHTML=ColdDeckArt.illustration('ui-chip','chip-art')+'<span class="chip-value">'+abbr(v)+'</span>';b.disabled=locked||tooDear;b.setAttribute('aria-label',cash(v));b.setAttribute('aria-pressed',String(G.betChosen&&G.bet===v));
    if(!locked&&!tooDear)b.onclick=()=>{G.bet=v;G.betChosen=true;renderChips();renderActions();renderMult();};
    wrap.appendChild(b);
  });
}
function syncPeek(){
  const b=$('peekBtn');if(!b)return;
  b.classList.toggle('show',G.phase==='play'&&!G._dealing&&!G._settling&&hasRelic('lunettes')&&!G.peekUsed);
}
function renderActions(){
  updateBustReadout();syncPeek();
  $('app').dataset.phase=G.phase;
  $('betRow').hidden=G.phase!=='bet';
  const a=$('actions');a.innerHTML='';
  const main=document.createElement('div');main.className='actMain';
  const wide=document.createElement('div');wide.className='actWide';
  const add=(parent,label,cls,fn,sub,dis)=>{
    if(dis)return null;
    const b=document.createElement('button');b.className='btn '+cls;b.setAttribute('aria-label',label);
    const kind=fn===deal?'deal':fn===playerStand?'stand':fn===playerDouble?'double':fn===playerSplit?'split':fn===forcerChance?'force':'hit';
    b.dataset.gameAction=kind;
    b.innerHTML=`<span class="action-copy"><span class="blbl">${label}</span>`+(sub?`<small>${sub}</small>`:'')+'</span>';
    if(sub){const description=document.createElement('span');description.innerHTML=sub;b.title=description.textContent;b.setAttribute('aria-description',description.textContent);}
    b.onclick=fn;parent.appendChild(b);return b;
  };
  if(G.phase==='bet'){
    main.classList.add('betmain');
    const mainTxt=G.endless?'':t('act.handSuffix',G.hand,G.table.mains);
    const sub=(G.betChosen?t('act.betSub',cash(G.bet)):t('act.betChoose'))+mainTxt;
    add(main,t('act.bet'),'b-gold span',deal,sub,G.bank<curTable().min||!G.betChosen);
    a.appendChild(main);return;
  }
  // Le dock garde sa place pendant les animations, seules les actions jouables sont affichées.
  const live=(G.phase==='play'&&!G._dealing&&!G._settling);
  if(!live){renderCombos();return;}
  const v=G.pHand.length?handValue(G.pHand).total:0;
  const flirt=v>=17&&v<=20;
  if(flirt){
    const hit=add(main,t('act.hit'),'b-gold',()=>{G.insisted=true;playerHit();},t('act.hitSub'),!live);
    hit.title=t('act.hitSub')+' · '+t('act.riskSub');hit.setAttribute('aria-description',hit.title);
    add(main,t('act.stand'),'b-blue',playerStand,t('act.standSub'),!live);
  }else{
    add(main,t('act.hit'),'b-gold',()=>playerHit(),t('act.hitSub'),v>=21);
    add(main,t('act.stand'),'b-blue',playerStand,t('act.standSub'),v>21);
  }
  // actions spéciales (2 max, côte à côte). SÉPARER = paire · DOUBLER = total bas · FORCER = 17-20
  const two=G.pHand.length===2, pair=two&&G.pHand[0].r===G.pHand[1].r;
  const canSplit=!G.splitActive&&two&&pair&&G.bank>=G.bet;
  const canDouble=!G.splitActive&&two&&!flirt&&v<21&&G.bank>=G.bet;
  if(pair&&!G.splitActive)add(wide,t('act.split'),'b-blue',playerSplit,t('act.splitSub'),!live||!canSplit);
  else add(wide,t('act.double'),'b-blue',playerDouble,t('act.doubleSub'),!live||!canDouble);
  add(wide,t('act.force'),'b-purple',forcerChance,G.forcedUsed?t('act.forceUsed'):t('act.forceSub'),!live||!flirt||G.forcedUsed);
  if(main.childElementCount)a.appendChild(main);
  if(wide.childElementCount)a.appendChild(wide);
}
function usePeek(){
  if(!canDecide()||G.peekUsed||!hasRelic('lunettes'))return;
  if(G.shoe.length<15)buildShoe();G.peekUsed=true;G.knownCard=G.shoe[G.shoe.length-1];
  blip(880,.05,'sine',.06);syncPeek();updateBustReadout();
}
function updateBustReadout(){
  const el=$('drawReadout');if(!el)return;
  const live=G.phase==='play'&&!G._dealing&&!G._settling&&handValue(G.pHand).total<21;
  el.hidden=!live;if(!live)return;
  el.textContent=(G.knownCard?t('ui.next',G.knownCard.r+G.knownCard.s)+' · ':'')+t('ui.bustRisk',bustChance(G.pHand))+(G.penduArmed?' · '+t('circuit.penduReady'):'')+(G.magicNext?' · '+t('tarot.magicien.u'):'')+(G.smallNext?' · '+t('power.phare'):'');
}

/* ============================================================
   DÉROULÉ
   ============================================================ */
function deal(){
  if(G.phase!=='bet'||GameClock.reasons.size)return;
  if(checkBankGoal())return;
  audioInit();if(!G.betChosen)return;clampBet();if(G.bank<curTable().min)return;
  window.ColdDeckFX?.clear();
  $('turnPop').classList.remove('go');
  G.bank-=G.bet;G.stakeMult=1;G.splitActive=false;G.hands=null;G.hi=0;G.splitAces=false;
  // pression PERSISTANTE : reportée de la main précédente, refroidie si on joue posé
  let p0;
  if(G.hand===1)p0=(G.table.rule==='depart')?30:0;          // table chaude : seulement à l'entrée
  else p0=Math.max(0,(G.pressure||0)-15);                      // léger refroidissement entre les mains
  p0+=Math.round(12*(G.bet-G.table.min)/Math.max(1,G.table.max-G.table.min));   // grosse mise = +pression
  G.penduArmed=false;G.smallNext=false;G._settling=false;G.knownCard=null;G.tarotThisHand=false;
  G.phase='play';G.pressure=Math.min(100,p0);G.peekUsed=false;G.insisted=false;G.forced=false;G.magicNext=false;G.maxPressureReached=G.pressure;G.revealed=false;G.doFlip=false;
  G.dHand=[];G.pHand=[];$('tip').textContent='';$('tip').style.color='';
  // on tire les 4 cartes mais on les distribue une par une, en animation
  const p1=draw(),d1=draw(),p2=draw(),d2=draw();
  if((hasRelic('maitresse')||(G.table.rule==='atelier'&&G.hand%3===1))&&!p1.ed)p1.ed='foil';
  if(G.endless&&G.event&&G.event.id==='etoile'&&!p1.ed)p1.ed='poly';   // CARTE ÉTOILÉE
  [p1,p2,d1,d2].forEach(c=>{c._pending=true;});                 // pas encore arrivées
  G.pHand.push(p1,p2);G.dHand.push(d1,d2);
  G._dealing=true;
  renderAll();renderHands();                                     // tapis vide, actions masquées
  dealSequence([p1,d1,p2,d2]);
}
// The total updates as soon as the front is visible; input unlocks after settling.
const CARD_HOLD=260,CARD_FLIP=520;
const CARD_FACE_AT=Math.round(CARD_FLIP*.48);
document.documentElement.style.setProperty('--card-hold-duration',CARD_HOLD+'ms');
document.documentElement.style.setProperty('--card-flip-duration',CARD_FLIP+'ms');
// stayDown : reste dos (trou du croupier). reveal : main du croupier dévoilée.
function dealCardIn(c,opts,done){
  const reveal=!!(opts&&opts.reveal);
  c._pending=false;c._fd=true;c._flip=false;c._arr=true;delete c._faceVisible;
  renderHands(reveal);sfx.card();
  gameDelay(()=>window.ColdDeckFX?.onCardLand(c),Math.round(CARD_HOLD*.62));
  gameDelay(()=>{
    c._arr=false;
    if(opts&&opts.stayDown){c._fd=true;renderHands(reveal);done&&done();return;}
    c._fd=false;c._flip=true;renderHands(reveal);if(!window.ColdDeckFX)sfx.flip();
    const drawState=G;
    gameDelay(()=>{
      if(G!==drawState||!c._flip)return;
      c._faceVisible=true;renderHandTotals(reveal);renderMult();window.ColdDeckFX?.onCard(c);
    },window.ColdDeckFX?.reduced?0:CARD_FACE_AT);
    gameDelay(()=>{c._flip=false;delete c._faceVisible;renderHands(reveal);done&&done();},CARD_FLIP);
  },CARD_HOLD);
}
// distribution initiale : mes 2 cartes + 2 du croupier, une par une. La 2e du croupier reste dos.
function dealSequence(order){
  const [p1,d1,p2,d2]=order;
  dealCardIn(p1,{},()=>{ dealCardIn(d1,{},()=>{ dealCardIn(p2,{},()=>{ dealCardIn(d2,{stayDown:true},finishDeal); }); }); });
}
function finishDeal(){
  G._dealing=false;
  // on retire les drapeaux transitoires : le jeu reprend son rendu normal
  [...G.pHand,...G.dHand].forEach(c=>{delete c._pending;delete c._fd;delete c._flip;delete c._arr;delete c._faceVisible;});
  renderActions();renderMult();
  const ec=G.pHand.find(c=>c.ed);if(ec)announceEd(ec);
  updateBustReadout();
  if(handValue(G.pHand).total===21){G._settling=true;renderActions();gameDelay(()=>{G._settling=false;playerStand(true);},420);}
}
function playerHit(forced){
  if(!canDecide())return;
  const before=handValue(G.pHand).total;
  if(before>=21)return;
  if(before>=17)G.insisted=true;
  const c=playerDraw();c._pending=true;G.pHand.push(c);G.knownCard=null;
  $('tip').textContent='';G._dealing=true;renderActions();
  dealCardIn(c,{},()=>completePlayerDraw(c,before,!!forced));
}
/* fin d'une main (rester / bust) : en mode séparé on passe à la main suivante, sinon on résout */
function afterHandDone(){
  if(G.splitActive&&G.hi<G.hands.length-1){nextSplitHand();return;}
  G.phase='dealer';renderActions();dealerPlay(false);
}
function handBusted(){
  if(handValue(G.pHand).total<=21)return;
  if(G.splitActive){afterHandDone();return;}
  resolve('bust');
}
/* SÉPARER : une paire (même rang) devient deux mains, chacune reçoit une 2e carte et se joue à tour de rôle */
function playerSplit(){
  if(!canDecide()||G.splitActive||G.pHand.length!==2||G.bank<G.bet)return;
  const [a,b]=G.pHand;if(a.r!==b.r)return;
  G.bank-=G.bet;                                   // 2e mise
  G.splitActive=true;G.splitAces=(a.r==='A');
  G.hands=[[a],[b]];G.hi=0;G.pHand=G.hands[0];G.stakeMult=1;
  sfx.buy();shake(8);popText(t('msg.split'),t('msg.splitSub',a.r+a.s));
  renderTop();renderChips();
  dealSplitCard();
}
/* distribue la 2e carte de la main active, puis rend la main jouable (ou l'auto-résout si As séparés/21) */
function dealSplitCard(){
  const c=playerDraw();
  c._pending=true;G.pHand.push(c);
  G._dealing=true;renderActions();renderHands(false);
  dealCardIn(c,{},()=>{
    G._dealing=false;
    updateBustReadout();renderMult();renderHands(false);
    if(c.ed)announceEd(c);
    const v=handValue(G.pHand).total;
    if(G.splitAces){G._settling=true;gameDelay(()=>{G._settling=false;afterHandDone();},520);return;}   // As séparés : une seule carte par main
    if(v>21){gameDelay(handBusted,300);return;}
    if(v===21){G._settling=true;gameDelay(()=>{G._settling=false;afterHandDone();},320);return;}
    renderActions();
  });
}
function nextSplitHand(){
  G.hi++;G.pHand=G.hands[G.hi];G.insisted=false;G.penduArmed=false;
  popText(t('msg.hand',G.hi+1),t('msg.handSub'));
  renderHands(false);
  dealSplitCard();
}
/* DOUBLER : sur les 2 premières cartes, double la mise, tire UNE carte, puis reste d'office */
function playerDouble(){
  if(!canDecide()||G.splitActive||G.pHand.length!==2||G.bank<G.bet||handValue(G.pHand).total>=17)return;
  const before=handValue(G.pHand).total;
  G.bank-=G.bet;G.stakeMult=2;sfx.buy();shake(10);popText(t('msg.doubled'),t('msg.doubledSub'));
  renderTop();renderChips();renderMult();
  const c=playerDraw();c._pending=true;G.pHand.push(c);G.knownCard=null;
  G._dealing=true;renderActions();dealCardIn(c,{},()=>completePlayerDraw(c,before,true));
}
function forcerChance(){
  const before=handValue(G.pHand).total;
  if(!canDecide()||G.forcedUsed||before<17||before>20)return;
  G.forcedUsed=true;G.forced=true;G.knownCard=null;
  const c1=playerDraw(),c2=draw(),value=c=>{const v=handValue(G.pHand.concat(c)).total;return v>21?-100:v;};
  const keep=value(c1)>=value(c2)?c1:c2;G.insisted=true;sfx.danger();shake(22);
  popText(t('msg.forced'),t('msg.kept',keep.r+keep.s));
  keep._pending=true;G.pHand.push(keep);G._dealing=true;renderActions();
  dealCardIn(keep,{},()=>completePlayerDraw(keep,before,false));
}
function playerStand(natural){
  if(!canDecide()&&!(natural&&G.phase==='play'&&!GameClock.reasons.size))return;
  if(G.splitActive){afterHandDone();return;}          // séparé : passe à la main suivante ou au croupier
  G.phase='dealer';renderActions();dealerPlay(natural);
}
function dealerPlay(natural){
  if(!G.revealed){G.revealed=true;G.doFlip=true;if(!window.ColdDeckFX)sfx.flip();}
  renderHands(true);G.doFlip=false;
  const step=()=>{
    const v=handValue(G.dHand);
    const goal=(G.endless&&G.event&&G.event.id==='pompette')?16:((G.table.rule==='gros')?18:17);
    const hitSoft17=(barakaLevel()>=2);
    const mustHit=v.total<goal||(goal===17&&v.total===17&&v.soft&&hitSoft17);
    if(mustHit){                                                // le croupier tire : même arrivée animée
      const c=draw();c._pending=true;G.dHand.push(c);
      dealCardIn(c,{reveal:true},()=>gameDelay(step,160));
    } else gameDelay(()=>resolve(natural?'natural':'stand'),420);
  };
  gameDelay(step,CARD_FLIP+20);
}

/* ---------- résolution ---------- */
function resolve(mode){
  if(['done','victory','shop','transition','lost','ended'].includes(G.phase))return;
  if(G.splitActive)return resolveSplit();
  G.phase='done';
  if(!G.revealed){G.revealed=true;G.doFlip=true;if(!window.ColdDeckFX)sfx.flip();}
  renderHands(true);G.doFlip=false;
  const pv=handValue(G.pHand).total,dv=handValue(G.dHand).total;
  const pBust=pv>21,dBust=dv>21;
  let outcome;
  if(pBust)outcome='lose';else if(dBust)outcome='win';
  else if(pv>dv)outcome='win';else if(pv<dv)outcome='lose';else outcome='push';
  const tableTieLoss=outcome==='push'&&G.table.rule==='sec'&&!hasRelic('diplomate');
  if(tableTieLoss)outcome='lose';

  let mult=1,lines=[];
  const isNat=(mode==='natural'&&G.pHand.length===2&&pv===21);
  const stake=G.bet*(G.stakeMult||1);   // mise engagée (doublée si DOUBLER)

  if(G.stats){G.stats.played++;}
  let gain=0,tallyMs=0;
  if(outcome==='win'){
    const r=computeMult(mode);mult=r.mult;lines=r.lines;
    const base=stake+r.bonusChips;
    gain=Math.round(base*mult);
    if(G.endless&&G.event&&G.event.id==='doree'){gain*=2;lines.push([PXI('doree')+' '+t('m.golden'),'×2']);}
    window.ColdDeckFX?.holdBank();
    G.bank+=stake+gain;checkContract(mult);recordBossWin(mult);
    if(G.stats){G.stats.won++;G.stats.bestGain=Math.max(G.stats.bestGain,gain);G.stats.bestMult=Math.max(G.stats.bestMult,mult);}
    if(lines.length){$('tip').innerHTML=lines.map(l=>l[0]+' '+l[1]).join('  ·  ');$('tip').style.color='var(--gold)';}
    // décompte animé (carte par carte + multiplicateurs), PUIS l'annonce du gain
    const isPerfect=(pv===21&&!isNat);            // 21 PARFAIT (×3), hors blackjack naturel
    const isRecord=checkGainRecord(gain);         // plus gros gain sur une main (record perso battu)
    const finishWin=()=>{sfx.win(window.ColdDeckFX?.victoryTier(gain,mult,isNat,isRecord)||1);if(!window.ColdDeckFX&&(mult>1||r.bonusChips>0))sfx.combo();
      flashScore();showWord('win',gain,mult,isNat,false,isRecord);
      if(isPerfect)perfectFanfare();
      if(isRecord)gameDelay(()=>showRecord(gain),isPerfect?560:280);
      if(!G.objHit&&G.bank>=G.table.goal&&bossReady()){G.objHit=true;gameDelay(objectiveReached,360);}};   // 1re fois qu'on franchit l'objectif
    tallyMs=animateScoreTally(mode,lines,finishWin);
  }else if(outcome==='push'){
    let pg=0;if(hasRelic('diplomate')&&G.table.rule!=='sec'){pg=Math.floor(stake*.25);G.bank+=pg;}
    G.bank+=stake;gain=pg;sfx.push();showWord('push',pg,1);
  }else{
    const back=lossRefund(stake,pv);
    G.bank+=back;gain=back-stake;
    sfx.lose();shake(8);showWord('lose',gain,1,false,pBust,false,tableTieLoss?'tableTie':'');
  }

  // BARAKA: wins add points; Circuit losses preserve a fraction.
  if(outcome==='win'){const cul=isCulotte(pv,mode);const culN=2+((G.boons&&G.boons.baraplus)?1:0);addBaraka(cul?culN:1);if(cul)gameDelay(()=>popText(t('msg.gutsy'),t('msg.gutsySub',culN)),320);}
  else if(outcome==='lose')resetBaraka();
  renderTop();renderRelics();renderPressure();renderMult();
  gameDelay(()=>nextHandOrEnd(),2200+tallyMs);
}

/* résolution en mode SÉPARÉ : chaque main est comparée au croupier, gains cumulés */
function resolveSplit(){
  if(['done','victory','shop','transition','lost','ended'].includes(G.phase))return;
  G.phase='done';
  window.ColdDeckFX?.holdBank();
  if(!G.revealed){G.revealed=true;G.doFlip=true;if(!window.ColdDeckFX)sfx.flip();}
  renderHands(true);G.doFlip=false;
  const dv=handValue(G.dHand).total,dBust=dv>21;
  let net=0,maxG=0,tied=0,tieLosses=0;const summary=[];
  G.hands.forEach((h,i)=>{
    const pv=handValue(h).total,pBust=pv>21;
    let outcome;
    if(pBust)outcome='lose';else if(dBust)outcome='win';
    else if(pv>dv)outcome='win';else if(pv<dv)outcome='lose';else outcome='push';
    const tableTieLoss=outcome==='push'&&G.table.rule==='sec'&&!hasRelic('diplomate');
    if(tableTieLoss){outcome='lose';tieLosses++;}
    const stake=G.bet;let g=0;
    if(G.stats){G.stats.played++;}
    if(outcome==='win'){
      G.pHand=h;const r=computeMult('stand');const base=stake+r.bonusChips;
      g=Math.round(base*r.mult);G.bank+=stake+g;
      checkContract(r.mult);recordBossWin(r.mult);
      if(G.stats){G.stats.won++;G.stats.bestGain=Math.max(G.stats.bestGain,g);G.stats.bestMult=Math.max(G.stats.bestMult,r.mult);}
    }else if(outcome==='push'){
      tied++;
      let pg=0;if(hasRelic('diplomate')&&G.table.rule!=='sec'){pg=Math.floor(stake*.25);G.bank+=pg;}
      G.bank+=stake;g=pg;
    }else{
      const back=lossRefund(stake,pv);
      G.bank+=back;g=back-stake;
    }
    net+=g;maxG=Math.max(maxG,g);
    const tag=t(tableTieLoss?'sp.tableTie':outcome==='win'?'sp.win':outcome==='push'?'sp.push':'sp.lose');
    summary.push(t('sp.hand',i+1)+tag+(g>0?' +'+abbr(g):(g<0?' '+abbr(g):'')));
  });
  const allTied=tied===G.hands.length;
  const kind=allTied?'push':tieLosses===G.hands.length?'lose':net>0?'win':net<0?'lose':'push';
  const isRecord=!allTied&&checkGainRecord(maxG);
  sfx[kind](kind==='win'?(window.ColdDeckFX?.victoryTier(net,1,false,isRecord)||1):undefined);if(kind==='lose'){shake(8);}
  showWord(kind,net,1,false,false,isRecord,tieLosses===G.hands.length?'tableTie':'');
  if(isRecord)gameDelay(()=>showRecord(maxG),320);
  $('tip').innerHTML=summary.join('  ·  ');$('tip').style.color='var(--gold)';
  if(net>0&&!G.objHit&&G.bank>=G.table.goal&&bossReady()){G.objHit=true;gameDelay(objectiveReached,360);}
  if(kind==='win')addBaraka(1); else if(kind==='lose')resetBaraka();     // BARAKA (mode séparé)
  renderTop();renderRelics();renderPressure();renderMult();
  gameDelay(()=>{G.splitActive=false;G.hands=null;G.hi=0;nextHandOrEnd();},2350);
}

/* ---------- progression ---------- */
/* dès que l'objectif est atteint, la table est validée : pas besoin de finir
   toutes les mains. Sinon on joue les mains restantes. À sec en chemin = table perdue. */
function nextHandOrEnd(){
  if(['victory','shop','transition','lost','ended'].includes(G.phase))return;
  if(G.endless){                                    // mode cagnotte : pas d'objectif ni de limite de mains
    G.peak=Math.max(G.peak||0,G.bank);
    if(G.bank<G.table.min)return endlessBust();     // banqueroute = fin
    if(G.bank>=palierTarget(G.palier||0))return reachPalier();   // palier franchi → bonus + mises ↑
    G.hand++;G.phase='bet';G._settling=false;G.dHand=[];G.pHand=[];
    const cadence=(G.boons&&G.boons.evt3)?3:5;                                   // « Mains spéciales ×2 » resserre le rythme
    G.event=(G.hand%cadence===0)?ENDLESS_EVENTS[rndInt(ENDLESS_EVENTS.length)]:null;   // main spéciale régulière
    clampBet();applyHandIncome();renderAll();renderHands();announceTurn();
    return;
  }
  if(G.bank>=G.table.goal&&bossReady()){return finishTable();}  // objectif atteint → table gagnée tout de suite
  if(G.bank<G.table.min){return finishTable();}    // à sec : on ne peut plus miser le minimum
  if(G.hand>=G.table.mains){return finishTable();}  // toutes les mains jouées → validation
  G.hand++;G.phase='bet';G._settling=false;G.dHand=[];G.pHand=[];   // la mise garde la dernière valeur jouée
  clampBet();
  applyHandIncome();
  if(checkBankGoal())return;
  renderAll();renderHands();
  announceTurn();
}
/* fin de table : 0★ = perdue · 1★ survie · 2★ objectif · 3★ maîtrise */
function finishTable(){
  if(['victory','shop','transition','lost','ended'].includes(G.phase))return;
  const tb=G.table;
  const stars=starsFor(tb,G.bank);
  if(stars===0){onTableLost('lost.goal',G.bank>=tb.goal?'circuit.bossUnfinished':{k:'lost.goalTxt',miss:tb.goal-G.bank});return;}
  G.phase='victory';
  G.tableStars[G.tableIdx]=stars;
  G.runStars=G.tableStars.reduce((a,b)=>a+(b||0),0);
  const reward=tableRep(tb,stars,G.tableMaxBaraka||0);
  G.pot+=reward;G.lastReward=reward;G.lastStars=stars;
  updateRecord(G.tableIdx+1);
  renderTop();renderRelics();renderConsumables();
  window.ColdDeckJourney?.showVictory();
}
function continueTableVictory(){
  if(G.phase!=='victory')return;
  G.phase='shop';$('tableVictory').classList.remove('show');
  if(G.tableIdx>=RUN_LEN-1){cashOut();return;}
  openShop();
}
/* table perdue : seconde chance (jeton) ou fin de descente.
   titre/texte sont des CLÉS i18n (ou {k,...} avec des valeurs) : l'écran est traduit à l'affichage. */
function onTableLost(titleKey,textKey){
  G.phase='lost';updateRecord(0);
  G.loseTitle=titleKey;G.loseText=textKey;
  if(G.tokens>0||(!G._adLifeUsed&&Ads.canRewarded())){openLose();return;}   // plus de reprise disponible : la descente s'arrête
  endRun(false);
}

/* ---------- boutique ---------- */
/* Palette des symboles et anciennes étiquettes : couleur = type d'effet
   or=jetons · orange=mult · cyan=pression · vert=info · violet=édition/slot · rouge=retrait */
const SHOPTOK={
  lunettes:{t:'PEEK',c:'#9be84a'},
  jeton:{t:'½ <small>BET</small>',c:'#ffce3a'},
  clope:{t:'+30<small class="sym">%</small>',c:'#19c3c3'},
  as:{t:'+1<small>×</small>',c:'#ff9326'},
  froid:{t:'+1<small>×</small>',c:'#ff9326'},
  compteur:{t:'BUST<small class="sym">%</small>',c:'#9be84a'},
  mecene:{t:'+4<small class="sym">$</small>',c:'#ffce3a'},
  usurier:{t:'+1<small class="sym">/5$</small>',c:'#ffce3a'},
  collector:{t:'ED<small>×3</small>',c:'#a64dff'},
  maitresse:{t:'GOLD',c:'#ffd21c'},
  bruleur:{t:'×1.5',c:'#ff9326'},
  portebonheur:{t:'+1<small>'+STAR+'</small>',c:'#a64dff'},
  diplomate:{t:'=<small>+25%</small>',c:'#ffce3a'},
  talisman:{t:'1 <small>LIFE</small>',c:'#19c3c3'},
  aimant:{t:'+1<small class="sym">$/card</small>',c:'#ffce3a'},
  phare:{t:'C<small>×3</small>',c:'#ff9326'},
  etoile:{t:'+2 <small class="sym">streak</small>',c:'#f0902a'},
  jugement:{t:'+1<small class="sym">lv</small>',c:'#f0902a'},
  soleil:{t:'+18<small class="sym">$</small>',c:'#ffce3a'},
  diable:{t:'PRISM',c:'#b59aff'},
  etoileD:{t:'GOLD',c:'#ffd21c'},
  pendu:{t:'−1 <small>card</small>',c:'#e0524f'},
  magicien:{t:'IDEAL',c:'#9be84a'},
  roue:{t:'ED<small>?</small>',c:'#a64dff'},
  soin:{t:'+<small class="sym">$$$</small>',c:'#9be84a'},
  assurance:{t:'INSU<small>R</small>',c:'#3f8bd6'},
  videur:{t:'+1 <small>try</small>',c:'#19c3c3'},
};
/* étiquette d'un effet : passe par STR quand elle contient un mot (clé tok.<id>) */
function tokFor(id){
  const tk=SHOPTOK[id]||{t:'?',c:'#ffce3a'};
  const k='tok.'+id;
  return {t:hasStr(k)?t(k):tk.t,c:tk.c};
}
function effectMark(id,color){
  const kind=RELIC_POOL.some(r=>r.id===id)?'relic':TAROT_POOL.some(r=>r.id===id)?'tarot':SERVICE_POOL.some(r=>r.id===id)?'service':'upgrade';
  return `<span class="effect-mark effect-card" data-effect-kind="${kind}" style="color:${color}" aria-hidden="true">${ColdDeckArt.effect(id)}</span>`;
}
function serviceCost(s){return priceRound(shopTable().max*({soin:.3,assurance:.6,videur:1.8}[s.id]||1));}
let shopOffer=[],rerollCost=5;
/* prix de boutique indexés sur la profondeur (≈ ta banque) : les cartes
   d'effet restent chères, on ne peut pas en acheter plein d'un coup */
function niceRound(c){if(c<1000)return Math.max(5,Math.round(c/5)*5);const mag=Math.pow(10,Math.floor(Math.log10(c))-1);return Math.round(c/mag)*mag;}
/* arrondi « joli » pour les mises : pas d'incrément qui grandit avec la grandeur (5→10→25→50→100→500) pour éviter les 102, 178, 187… */
function roundBet(v){let s;if(v<50)s=5;else if(v<200)s=10;else if(v<500)s=25;else if(v<2000)s=50;else if(v<10000)s=100;else s=500;return Math.max(5,Math.round(v/s)*s);}
/* prix de boutique indexés sur l'objectif de la table (pas sur ta richesse) :
   les bons objets restent chers, impossible de tout rafler d'un coup. */
function shopTable(){return RUN[Math.min(RUN_LEN-1,G.tableIdx+1)]||G.table;}
function priceRound(v){return v<20?Math.max(1,Math.round(v)):niceRound(v);}
function shopScale(){return shopTable().max/20;}
function itemCost(r){
  const unit=shopTable().max;
  if(r.ns==='tarot'||TAROT_POOL.some(x=>x===r)){
    const rates={etoile:.25,jugement:.45,soleil:.35,diable:.55,etoileD:.25,pendu:.65,magicien:1,roue:.35};
    return priceRound(unit*(rates[r.id]||.5)*(hasRelic('portebonheur')?.8:1));
  }
  const remaining=RUN_LEN-G.tableIdx-1;
  const cost=priceRound(unit*(r.cost||12)/10*Math.max(.5,Math.min(1,remaining/5)));
  return !G.endless&&uLvl('contact')?Math.max(1,Math.round(cost*.9)):cost;
}
function advanceAmount(bank=G.bank){return Math.max(0,Math.min(shopTable().max*2,Math.round(shopTable().cap*.7)+shopTable().entry-bank));}
function serviceAvailable(r){
  if(r.id==='assurance')return !G.insurance;
  if(r.id==='videur')return G.tokens<6;
  return !G._advanceUsed&&advanceAmount()>serviceCost(r);
}
function shopReserve(){return shopTable().entry+shopTable().min;}

function openShop(){
  rerollCost=priceRound(shopTable().max*.5);G._advanceUsed=false;
  G._adReroll=false;                 // une relance offerte par pub, par boutique
  Ads.countTable();                  // rythme des interstitiels : compté par table franchie
  renderShopHead();
  if(G.tableIdx<RUN_LEN-1)rollShop();else{shopOffer=[];renderShop();}
  $('shop').classList.add('show');
}
/* en-tête de boutique : reconstruit à chaque achat ET à chaque changement de langue */
function renderShopHead(){
  const depth=G.endless?('∞ '+(G.tableIdx+1)):((G.tableIdx+1)+'/'+RUN_LEN);
  $('shopFunds').innerHTML='<span data-reading-label>'+t('shop.available')+'</span><strong>'+ColdDeckArt.lettering(cash(G.bank))+'</strong>';
  $('shopSub').innerHTML=t('shop.sub',depth,cash(G.bank),STAR+abbr(G.pot),abbr(G.lastReward)+' '+STAR);
  $('shopStars').innerHTML=STAR.repeat(G.lastStars||0)+STARE.repeat(3-(G.lastStars||0))+'  ·  '+t('shop.total')+' '+STAR+(G.runStars||0);
  const isBoss=!!G.table.boss, last=(!G.endless&&G.tableIdx>=RUN_LEN-1);
  $('shopTitle').textContent=last?t('shop.titleLast'):(isBoss?t('shop.titleBoss'):t('shop.title'));
  // cash-out seulement aux paliers importants : après un boss (ou fin de run)
  const cb=$('cashBtn');
  if(isBoss||last){cb.style.display='';cb.innerHTML=t(last?'shop.finish':'shop.cash')+'<small>'+STAR+abbr(repOnEnd(true))+' '+t('shop.repSuffix')+'</small>';}
  else{cb.style.display='none';}
  // table suivante : atteindre l'objectif suffit (pas de verrou d'étoiles) · droit d'entrée éventuel
  const nextBtn=$('shopNextBtn'),nextObj=$('shopNextObj');
  if(last){
    nextBtn.style.display='none';$('shopGate').textContent=t('shop.gateDone');
    if(nextObj)nextObj.style.display='none';
  }else{
    const base=tableFor(G.tableIdx+1),nx={...base,goal:base.goal+Math.max(0,G.bank-base.entry-base.cap)},nxName=tableName(base);
    nextBtn.style.display='';nextBtn.disabled=G.bank<nx.entry+nx.min;      // pas de verrou d'étoiles : atteindre l'objectif suffit
    const feeTxt=nx.entry?t('shop.fee',cash(nx.entry)):'';
    nextBtn.innerHTML=t('shop.next')+'<small>'+t('shop.nextInfo',nxName,cash(nx.goal),cash(nx.cap),feeTxt)+'</small>';
    // objectif de la prochaine table, bien visible : aide à décider d'acheter ou de garder du cash
    if(nextObj){nextObj.style.display='';
      nextObj.innerHTML=t('shop.nextObj',nxName,cash(nx.goal),cash(nx.cap))+(nx.entry?t('shop.feeObj',cash(nx.entry)):'');
    }
    $('shopGate').textContent=t('shop.reserve',cash(Math.max(0,G.bank-nx.entry)))+' · '+t('circuit.stars');
  }
  window.ColdDeckJourney?.renderShop();
}
function rollShop(){
  const owned=new Set(G.relics.map(r=>r.id));
  const relics=RELIC_POOL.filter(r=>!owned.has(r.id)&&(!r.lock||uLvl(r.lock))).map(r=>({type:'relic',data:r}));
  const tarots=TAROT_POOL.map(x=>({type:'tarot',data:x}));
  const pool=relics.concat(tarots);
  for(let i=pool.length-1;i>0;i--){const j=rndInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
  shopOffer=pool.slice(0,3);
  // un SERVICE de régulation toujours proposé (soin/assurance/seconde chance)
  const services=SERVICE_POOL.filter(serviceAvailable);
  if(services.length)shopOffer.push({type:'service',data:services[rndInt(services.length)]});
  else if(pool[3])shopOffer.push(pool[3]);
  renderShop();
}
function renderShop(){
  const box=$('shopItems');box.innerHTML='';
  if(!shopOffer.length){box.innerHTML='<p style="color:var(--muted)">'+t('shop.empty')+'</p>';}
  shopOffer.forEach((it,i)=>{
    const r=it.data,isTarot=it.type==='tarot',isSvc=it.type==='service';
    const d=document.createElement('div');d.className='shopItem'+(it.bought?' bought':'');
    const tag=isSvc
      ?'<span style="font-size:9px;color:var(--teal)">'+t('shop.tagService')+'</span>'
      :isTarot
      ?'<span style="font-size:9px;color:var(--grape)">'+STAR+' '+t('shop.tagTarot')+'</span>'
      :'<span style="font-size:9px;color:var(--yellow)">'+t('shop.tagRelic')+'</span>';
    const tk=tokFor(r.id);
    const chipCls=isSvc?'svc':isTarot?'tarot':'joker';
    d.innerHTML=`<div class="shopTok tag ${chipCls}">${effectMark(r.id,tk.c)}</div><div class="sInfo"><div class="nm">${iName(r)} ${tag}</div><div class="ds">${iDesc(r)}</div></div>`;
    const cost=isSvc?serviceCost(r):itemCost(r);
    const b=document.createElement('button');b.className='btn '+(isSvc?'b-teal':isTarot?'b-purple':'b-gold');
    b.style.cssText='font-size:13px;padding:9px 11px';b.textContent=cash(cost);
    const slotFull=isSvc?false:isTarot?G.consumables.length>=consumableSlots():G.relics.length>=relicMax();
    const safe=G.bank-cost>=shopReserve()||(isSvc&&r.id==='soin'&&serviceAvailable(r));
    if(it.bought||G.bank<cost||slotFull||!safe||(isSvc&&!serviceAvailable(r)))b.disabled=true;
    if(!it.bought)d.querySelector('.ds').insertAdjacentHTML('beforeend','<small class="shop-reserve">'+t('shop.after',cash(Math.max(0,G.bank-cost+(isSvc&&r.id==='soin'?advanceAmount(G.bank-cost):0)-shopTable().entry)))+'</small>');
    if(it.bought)b.textContent=t('shop.owned');
    else if(slotFull)b.textContent=t('shop.full');
    b.onclick=()=>buyShopItem(i,d,b);
    d.appendChild(b);box.appendChild(d);
  });
  scheduleFitChipText();
  renderShopInventory();
  const final=G.tableIdx>=RUN_LEN-1;
  const rb=$('rerollBtn');if(rb){rb.style.display=final?'none':'';rb.textContent=t('shop.reroll',cash(rerollCost));rb.disabled=G.bank-rerollCost<shopReserve();}
  const arb=$('adRerollBtn');
  if(arb){const show=!final&&!G._adReroll&&Ads.canRewarded();arb.style.display=show?'':'none';if(show)arb.textContent=t('ad.rerollBtn');}
}
function buyShopItem(i,el,btn){
  const it=shopOffer[i];if(!it||it.bought)return;const r=it.data;
  const cost=it.type==='service'?serviceCost(r):itemCost(r);
  if(G.phase!=='shop'||G.bank<cost)return;
  if(it.type==='service'&&!serviceAvailable(r))return;
  if(G.bank-cost<shopReserve()&&!(it.type==='service'&&r.id==='soin'))return;
  if(it.type==='service'){
    G.bank-=cost;const msg=r.apply();if(msg)popText(iName(r).toUpperCase(),msg);
  }else if(it.type==='tarot'){
    if(G.consumables.length>=consumableSlots()){popText(t('msg.slotsFull'),'');return;}
    G.bank-=cost;G.consumables.push({...r,_paid:cost});
  }else{
    if(G.relics.length>=relicMax()){popText(t('msg.relicsFull'),t('msg.max',relicMax()));return;}
    G.bank-=cost;G.relics.push({...r,_paid:cost});
  }
  it.bought=true;sfx.buy();
  el?.classList.add('bought');if(btn){btn.disabled=true;btn.textContent=t('shop.owned');}
  renderShopHead();
  renderRelics();renderConsumables();renderShop();
}
function rerollShop(){
  if(G.phase!=='shop'||G.bank-rerollCost<shopReserve())return;
  G.bank-=rerollCost;rerollCost=niceRound(rerollCost+3*shopScale());renderShopHead();sfx.card();
  rollShop();
}
/* CONTINUER : table suivante. Verrou par étoiles + droit d'entrée éventuel. */
function leaveShop(){
  if(!G.endless&&G.tableIdx+1>=RUN_LEN)return;     // mode normal : pas de table après la dernière
  const nx=tableFor(G.tableIdx+1);
  if(!nx||G.phase!=='shop'||G.bank<nx.entry+nx.min)return;
  G.phase='transition';                                   // sécurité
  $('shop').classList.remove('show');
  const prevZone=G.table.zone;
  // interstitiel sur la TRANSITION (récompense déjà encaissée), jamais sur l'objectif atteint
  Ads.interstitial().then(()=>{
    G.tableIdx++;
    G.table=tableFor(G.tableIdx);
    enterTable(prevZone);
  });
}
/* mise en place d'une nouvelle table (après boutique / choix de palier) */
function enterTable(prevZone){
  if(G.table.entry){G.bank=Math.max(0,G.bank-G.table.entry);popText(t('msg.entryFee'),'−'+cash(G.table.entry));}
  const base=RUN[G.tableIdx];
  G.table={...base,goal:base.goal+Math.max(0,G.bank-base.cap)};
  resetTableState(false);G.contract=rollContract();
  G.bet=recommendedBet();G.betChosen=true;clampBet();G.tableStartBank=G.bank;
  applyHandIncome();updateRecord(0);
  if(G.bank<G.table.min){onTableLost('lost.broke','lost.brokeTxt');return;}
  window.ColdDeckBackgrounds?.applyTable(G.table,false);
  renderAll();renderHands();renderPressure();announceTurn();
  showTableBrief();
}
/* ENCAISSER : on quitte la descente en banquant toute la cagnotte */
function cashOut(){
  $('shop').classList.remove('show');
  endRun(true);
}

/* ---------- seconde chance / fin de descente ---------- */
/* texte de défaite : clé simple, ou {k, …valeurs} quand il faut interpoler */
function loseBody(){
  const x=G.loseText;
  if(!x)return '';
  if(typeof x==='object')return t(x.k,cash(x.miss||0));
  return t(x);
}
function openLose(){
  $('loseTitle').textContent=t(G.loseTitle||'');
  $('loseText').innerHTML=loseBody()+'<br><br>'+t('lose.info',G.tableIdx+1,STAR+abbr(G.pot));
  const rb=$('retryBtn'),hasLife=G.tokens>0;
  rb.style.display=hasLife?'':'none';rb.className='btn menu b-gold';
  rb.innerHTML=t('lose.retry')+'<small>'+t('lose.tokens',G.tokens)+'</small>';
  const extra=$('extraLifeBtn');if(extra){extra.style.display=!hasLife&&!G._adLifeUsed&&Ads.canRewarded()?'':'none';extra.textContent=t('circuit.extraLife');}
  $('giveupBtn').innerHTML=t('lose.giveup')+'<small>'+t('lose.giveupSub',STAR+abbr(repOnEnd(false)))+'</small>';
  $('loseScreen').classList.add('show');
}
/* rejoue la table en cours (sabot neuf, reliques gardées), contre un jeton */
function retryTable(){
  if(G.phase!=='lost'||G.tokens<=0)return;
  GameClock.clear();G.tokens--;G.tableRetried=true;$('loseScreen').classList.remove('show');buildShoe();
  G.bank=Math.max(G.tableStartBank||0,curTable().cap);
  resetTableState(true);G.bet=recommendedBet();G.betChosen=true;clampBet();
  applyHandIncome();renderAll();renderHands();renderPressure();announceTurn();
}
function giveUp(){
  $('loseScreen').classList.remove('show');
  endRun(false);
}
function updateRecord(depth){
  const r=metaCur().record;
  if(MODE==='infini'){
    r.peak=Math.max(r.peak||0,G.bank);
    r.palier=Math.max(r.palier||0,(G.palier||0)+1);
  }else{
    r.depth=Math.max(r.depth||0,depth);r.reached=Math.max(r.reached||0,G.tableIdx+1);r.version=2;
    if(G.bank>(r.chips||0))r.chips=G.bank;
  }
  saveMeta();
}

/* ---------- fin de descente : cagnotte → réputation ---------- */
/* COFFRE : à l'encaissement, les jetons restants se convertissent en réputation,
   à taux DÉGRESSIF et PLAFONNÉ → un gros tas ne donne pas une réput proportionnelle. */
function coffreBonus(bank){
  const tiers=[[200,0.05],[500,0.02],[Infinity,0.008]];
  let rep=0,prev=0;
  for(const [cap,rate] of tiers){const slice=Math.max(0,Math.min(bank,cap)-prev);rep+=slice*rate;prev=cap;if(bank<=cap)break;}
  return Math.min(40,Math.round(rep));   // plafond dur : 40 ★
}
function endRun(cashout){
  if(G.phase==='ended')return;
  GameClock.clear();
  $('shop').classList.remove('show');$('loseScreen').classList.remove('show');
  $('tableVictory').classList.remove('show');
  document.body.classList.remove('inf');
  const baseGain=repOnEnd(cashout);
  const coffre=(cashout&&!G.endless)?coffreBonus(G.bank):0;   // coffre : mode nuit seulement (l'infini a sa conversion)
  const prox=cashout?0:proximityRep();
  const gained=baseGain+coffre;
  metaCur().rep+=gained;
  // nouveau record ? (comparé AVANT la mise à jour)
  const recBefore=Object.assign({},G.recordAtStart||metaCur().record);
  const newRec=G.endless
    ?Math.max(G.peak||0,G.bank)>(recBefore.peak||0)
    :(metaCur().record.depth>(recBefore.depth||0)||G.bank>(recBefore.chips||0));
  // raccourci : atteindre la zone 2 (table 4) compte pour le déblocage « départ en zone 2 »
  updateRecord(0);
  saveMeta();
  G.endInfo={cashout,endless:!!G.endless,baseGain,coffre,prox,newRec,
    depth:G.tableStars.filter(Boolean).length,bank:G.bank,peak:Math.max(G.peak||0,G.bank),palier:(G.palier||0)+1,
    palierCash:!!G._palierCash,rep:metaCur().rep,
    goal:(G.table&&isFinite(G.table.goal))?G.table.goal:0,
    rec:Object.assign({},metaCur().record),
    stats:Object.assign({won:0,played:0,bestGain:0,bestMult:1},G.stats||{})};
  if(G.endless)G._palierCash=false;
  G.phase='ended';renderEndScreen();
}
/* écran de fin : reconstruit depuis G.endInfo (donc retraduisible à chaud) */
function renderEndScreen(){
  const e=G.endInfo;if(!e)return;
  const rec=e.rec,st=e.stats;
  const recLine=e.newRec?`<br><b style="color:var(--gold)">${PXI('trophy')} ${t('end.newRecord')}</b> `:'<br>';
  if(e.endless){
    $('endTitle').textContent=t(e.cashout?'end.cash':'end.potGone');
    $('endTitle').className=e.cashout?'win':'dead';
    $('endText').innerHTML=
      (e.cashout?t('end.infCashTxt',e.palierCash):t('end.infStopTxt'))+
      '<br><br>'+t('end.infStats',cash(e.peak),e.palier)+
      '<br>'+t('end.rep',STAR+abbr(e.baseGain))+t('end.repTotal',STAR+abbr(e.rep))+
      recLine+'<span style="color:var(--muted)">'+t('end.recordInf',rec.palier||0,cash(rec.peak||0))+'</span>';
  }else{
    const manque=(!e.cashout&&e.goal&&e.bank<e.goal)?t('end.missing',cash(e.goal-e.bank),e.prox?STAR+e.prox:0):'';
    $('endTitle').textContent=t(e.cashout?'end.cash':'end.circuitOver');
    $('endTitle').className=e.cashout?'win':'dead';
    $('endText').innerHTML=
      t(e.cashout?'end.cashTxt':'end.halfTxt')+manque+
      '<br><br>'+t('end.stats',e.depth,cash(e.bank))+
      '<br>'+t('end.rep',STAR+abbr(e.baseGain))+(e.coffre?t('end.vault',STAR+abbr(e.coffre)):'')+t('end.repTotal',STAR+abbr(e.rep))+
      recLine+'<span style="color:var(--muted)">'+t('end.recordCircuit',rec.depth||0,cash(rec.chips||0))+'</span>';
  }
  const eb=$('endAdBtn');
  if(eb){
    const show=!e.doubled&&Ads.canRewarded()&&(e.baseGain+e.coffre)>0;
    eb.style.display=show?'':'none';
    if(show)eb.innerHTML=t('ad.repBtn')+'<small>'+t('ad.repSub',STAR+abbr(e.baseGain+e.coffre))+'</small>';
  }
  $('endStats').innerHTML=
    `<div class="rs"><span class="l">${t('end.won')}</span><span class="v">${st.won}/${st.played}</span></div>`+
    `<div class="rs"><span class="l">${t('end.bestGain')}</span><span class="v">${cash(st.bestGain)}</span></div>`+
    `<div class="rs"><span class="l">${t('end.bestMult')}</span><span class="v">${fmtMult(st.bestMult)}</span></div>`;
  $('endScreen').classList.add('show');
}

/* ---------- popups & juice ---------- */
function popMult(m,label){
  const p=$('multPop');
  p.querySelector('.m').textContent=m;p.querySelector('.t').textContent=label;
  p.classList.remove('go');void p.offsetWidth;p.classList.add('go');
  window.ColdDeckFX?.onAnnouncement();
}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function pickWord(kind){return pick(t('w.'+kind));}
function showWord(kind,gain,mult,natural,bust,record=false,reason=''){
  let word,sub='';
  if(kind==='win'){
    word=natural?pickWord('bj'):(mult>=3?pickWord('jackpot'):pickWord('win'));
    sub=(mult>1?fmtMult(mult)+'   ':'')+'+'+cash(gain);
  }else if(kind==='push'){word=pickWord('push');sub=gain>0?('+'+cash(gain)):t('w.betBack');}
  else{word=bust?pickWord('bust'):pickWord('lose');sub=gain?cash(gain):'';}
  if(reason==='tableTie')word=t('w.tableTie');
  const p=$('multPop');
  p.className=kind+(word.length>7?' long':'');
  p.querySelector('.m').textContent=word;p.querySelector('.t').textContent=sub;
  p.classList.remove('go');void p.offsetWidth;p.classList.add('go');
  window.ColdDeckFX?.onResult(kind,gain,mult,natural,bust,record);
  if(reason==='tableTie'){
    const note=document.createElement('span');note.className='result-reason';note.textContent=t('w.tableTieReason');p.append(note);
  }
}
const RULE_KEYS=['rules.goal','rules.table','rules.moves','rules.stars','rules.streak','rules.combos','rules.bonus','rules.contracts','rules.circuit','rules.hideout','rules.endless'];
function renderRules(){const b=$('rulesBody');if(b)b.innerHTML=RULE_KEYS.map(k=>'<div>'+t(k)+'</div>').join('');}
function openRules(){renderRules();$('rulesScreen').classList.add('show');}
function closeRules(){$('rulesScreen').classList.remove('show');if(pauseReturn){pauseReturn=false;$('pauseScreen').classList.add('show');}}
function openUpgrades(){renderPlanque();$('upgradesScreen').classList.add('show');}   // améliorations : ouvertes depuis La Planque, pour ne pas saturer la page
function closeUpgrades(){$('upgradesScreen').classList.remove('show');}
function openBacks(){renderBackPicker();$('backPickScreen').classList.add('show');}   // galerie des dos de carte : ouverte depuis La Planque
function closeBacks(){$('backPickScreen').classList.remove('show');}
function stepBack(d){   // feuilleter les dos un par un (◀ ▶), avec bouclage
  const i=(CARD_BACKS.indexOf(cardBack)+d+CARD_BACKS.length)%CARD_BACKS.length;
  setCardBack(CARD_BACKS[i]);try{sfx.flip();}catch(e){}
}
/* ---------- pause en jeu ---------- */
let pauseReturn=false;
function openPause(){
  GameClock.pause('manual',true);audioInit();
  const pc=$('pauseCash');
  if(pc){pc.style.display=G.endless?'':'none';if(G.endless)pc.innerHTML=t('pause.cash')+' '+STAR+abbr(endlessCashRep())+'<small>'+t('pause.cashSub')+'</small>';}
  $('pauseScreen').classList.add('show');
}
function resumeGame(){$('pauseScreen').classList.remove('show');GameClock.pause('manual',false);}
/* ---------- PARAMÈTRES (langue) ---------- */
function openSettings(){renderLangOpts();renderTestOptions();renderAdOpts();$('settingsScreen').classList.add('show');}
function closeSettings(){$('testScreen').classList.remove('show');$('settingsScreen').classList.remove('show');if(pauseReturn){pauseReturn=false;$('pauseScreen').classList.add('show');}}
function pauseSettings(){$('pauseScreen').classList.remove('show');pauseReturn=true;openSettings();}   // à la fermeture on revient à la pause
function openTestTools(){renderTestOptions();renderAdOpts();$('testScreen').classList.add('show');}
function closeTestTools(){$('testScreen').classList.remove('show');}
function renderTestOptions(){
  const off=Ads.testDisabled(),button=$('testAdsToggle');
  button.textContent=t(off?'test.adsOff':'test.adsOn');button.setAttribute('aria-checked',String(off));
  button.setAttribute('aria-label',t('test.cutAds'));button.className='btn '+(off?'b-teal':'b-blue');
  $('testAdsNote').textContent=t(off?'test.adsDisabledNote':'test.adsEnabledNote');
  $('testModeStatus').textContent=t(off?'test.activeStatus':'test.hint');
}
/* réglages pub de démo : aperçu des deux formats, achat « sans pub », plafonds */
function renderAdOpts(){
  const row=$('adOpts');if(!row)return;row.innerHTML='';
  const mk=(label,cls,fn)=>{const b=document.createElement('button');b.className='btn'+(cls||'');b.textContent=label;b.onclick=fn;row.appendChild(b);return b;};
  mk(t('set.adTestI'),' b-blue',()=>Ads.show('inter')).disabled=Ads.testDisabled();
  mk(t('set.adTestR'),' b-blue',()=>Ads.rewarded(t('ad.demoReward'))).disabled=Ads.testDisabled();
  for(const [key,on,fn] of [['set.adFree',Ads.removed(),()=>Ads.setRemoved(!Ads.removed())],['set.adCaps',Ads.freeCaps(),()=>Ads.setFreeCaps(!Ads.freeCaps())]]){
    const b=mk(t(key)+' : '+t(on?'set.on':'set.off'),' wide'+(on?' on':''),fn);b.setAttribute('aria-pressed',String(on));b.disabled=Ads.testDisabled();
  }
}
function renderLangOpts(){
  const row=$('langOpts');if(!row)return;row.innerHTML='';
  LANGS.forEach(l=>{
    const b=document.createElement('button');
    b.className='btn'+(LANG===l.id?' on':'');
    b.textContent=l.label;
    b.onclick=()=>setLang(l.id);
    row.appendChild(b);
  });
}
/* change de langue à chaud : tout le texte est (re)produit au rendu */
function setLang(id){
  if(!STR[id]||id===LANG)return;
  LANG=id;
  try{localStorage.setItem('t21lang',id);}catch(e){}
  try{sfx.buy&&sfx.buy();}catch(e){}
  applyI18n();
}
/* applique la langue courante : attributs data-i18n* + tous les écrans dynamiques */
function applyI18n(){
  document.documentElement.lang=LANG;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.getAttribute('data-i18n'));});
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.getAttribute('data-i18n-html'));});
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{el.title=t(el.getAttribute('data-i18n-title'));});
  const hw=$('handWord');if(hw)hw.textContent=(LANG==='fr'?'main':'hand');
  const mc=$('menuCircuit');if(mc)mc.textContent=t('menu.circuit');
  renderLangOpts();renderTestOptions();renderAdOpts();renderRules();
  renderAll();renderMenu();renderPlanque();renderBackPicker();
  if($('shop').classList.contains('show')){renderShopHead();renderShop();}
  if($('inspectScreen').classList.contains('shop-sale-view'))openShopSale();
  if($('loseScreen').classList.contains('show'))openLose();
  if($('endScreen').classList.contains('show'))renderEndScreen();
  if($('pauseScreen').classList.contains('show'))openPause();
  window.ColdDeckBackgrounds?.refresh();
  if($('tableBrief').classList.contains('show'))showTableBrief();
  window.ColdDeckJourney?.refresh();
  window.ColdDeckFonts?.refresh();
}
function pauseRules(){$('pauseScreen').classList.remove('show');pauseReturn=true;openRules();}   // à la fermeture des règles on revient à la pause
function quitToMenu(){GameClock.clear();$('pauseScreen').classList.remove('show');endRun(false);}                   // abandonne : encaisse la réputation puis écran de fin → La Planque
// annonce du nombre de tours restants, en gros, au début de chaque main
// le nombre de tours est désormais permanent dans la barre du haut :
// on ne garde qu'un petit jeton de revenu (pourboire/mécène) au début de la main
let turnTimer;
function announceTurn(){
  const el=$('turnPop');if(!el)return;
  clearGameDelay(turnTimer);el.classList.remove('go');
  let h='';
  if(G._income){
    const lbl=G._income.parts.length===1?G._income.parts[0].replace(/\s*\+.*/,'').toUpperCase():t('msg.income');
    h+=`<div class="tp-coin"><b>+<span class="n">${abbr(G._income.amt)}</span><span class="cur">$</span></b><span>${lbl}</span></div>`;
  }
  const event=G.endless&&G.event;
  if(event)h+=`<div class="tp-evt"><span class="tp-event-icon" aria-hidden="true">${PXI(G.event.ic)}</span><div class="tp-event-copy"><strong class="tp-event-title">${ColdDeckArt.lettering(evtTitle(G.event))}</strong><small>${evtDesc(G.event)}</small></div></div>`;
  el.innerHTML=h;
  if(!h)return;
  el.style.setProperty('--turn-duration',event?'3600ms':'1700ms');
  void el.offsetWidth;el.classList.add('go');
  turnTimer=gameDelay(()=>el.classList.remove('go'),event?3600:1700);
}
let textTimer;
function popText(txt,sub){
  $('tip').innerHTML=`<span style="color:var(--cream)">${txt}</span>${sub?' · '+sub:''}`;
  $('tip').style.color='var(--gold)';
  clearGameDelay(textTimer);textTimer=gameDelay(()=>{$('tip').textContent='';},1400);
}
function flashScore(){const s=$('scorebox');if(!s)return;s.classList.remove('pop');void s.offsetWidth;s.classList.add('pop');gameDelay(()=>s.classList.remove('pop'),360);}
/* ---- décompte animé « à la Balatro » : chaque carte rebondit et fait pop sa valeur, puis les multiplicateurs ---- */
function cardPts(c){if(c.r==='A')return 11;if(c.r==='K'||c.r==='Q'||c.r==='J')return 10;return parseInt(c.r,10)||0;}
function flyTag(x,y,html,cls){
  const t=document.createElement('div');t.className='sctag '+(cls||'');t.innerHTML=html;
  t.style.left=x+'px';t.style.top=y+'px';$('particles').appendChild(t);
  if(window.ColdDeckFX?.reduced){gameDelay(()=>t.remove(),1700);return;}
  // pop rapide, puis reste affiché plus longtemps avant de monter et s'effacer
  const a=t.animate([
    {transform:'translate(-50%,-20%) scale(.5)',opacity:0},
    {transform:'translate(-50%,-55%) scale(1.1)',opacity:1,offset:.12},
    {transform:'translate(-50%,-62%) scale(1)',opacity:1,offset:.28},
    {transform:'translate(-50%,-88%) scale(1)',opacity:1,offset:.78},
    {transform:'translate(-50%,-150%) scale(.9)',opacity:0}
  ],{duration:1700,easing:'cubic-bezier(.25,.7,.3,1)'});
  a.onfinish=()=>t.remove();
}
function bounceEl(el){
  if(!el||window.ColdDeckFX?.reduced)return;
  if(window.ColdDeckFX?.onScoreCard){window.ColdDeckFX.onScoreCard(el);return;}
  el.animate([
    {transform:'translateY(0) scale(1)'},
    {transform:'translateY(-24px) rotate(-7deg) scale(1.22)',offset:.35},
    {transform:'translateY(0) scale(1)'}
  ],{duration:380,easing:'cubic-bezier(.3,1.5,.5,1)'});
}
/* une relique « se déclenche » : le jeton tressaute et brille (comme un joker de Balatro) */
function fireRelic(el){
  if(!el||window.ColdDeckFX?.reduced)return;
  if(window.ColdDeckFX?.onRelic){window.ColdDeckFX.onRelic(el);return;}
  el.animate([
    {transform:'translateY(0) scale(1) rotate(0deg)',filter:'brightness(1)'},
    {transform:'translateY(-11px) scale(1.2) rotate(-5deg)',filter:'brightness(1.55) drop-shadow(0 0 7px #ffe08a)',offset:.32},
    {transform:'translateY(0) scale(1.05) rotate(4deg)',filter:'brightness(1.2) drop-shadow(0 0 4px #ffe08a)',offset:.66},
    {transform:'translateY(0) scale(1) rotate(0deg)',filter:'brightness(1)'}
  ],{duration:540,easing:'cubic-bezier(.3,1.4,.5,1)'});
}
/* rebondit les cartes une par une (valeur qui pop), puis fait pop chaque multiplicateur ; renvoie la durée totale */
function animateScoreTally(mode,lines,cb){
  const slots=[...$('pHand').children];
  const STEP=155;let t=0;
  slots.forEach((slot,i)=>{
    const c=G.pHand[i];if(!c)return;
    const card=slot.querySelector('.card:not(.back)')||slot.querySelector('.card');
    gameDelay(()=>{
      bounceEl(card);                                    // les cartes rebondissent (sans chiffre trompeur : elles ne rapportent pas de jetons)
      try{blip(420+Math.min(i,6)*70,.05,'square',.06);}catch(e){}
    },t);
    t+=STEP;
  });
  t+=140;
  (lines||[]).forEach((ln,index)=>{
    gameDelay(()=>{
      // ligne issue d'une relique → le jeton correspondant se déclenche et l'effet jaillit de lui
      const relEl=ln[2]?document.querySelector('#relics .joker[data-relic="'+ln[2]+'"]'):null;
      if(relEl){
        fireRelic(relEl);
        if(!window.ColdDeckFX){const r=relEl.getBoundingClientRect();flyTag(r.left+r.width/2,r.top+r.height*0.15,ln[0]+' <b>'+ln[1]+'</b>','mult');}
      }else{
        // The center impact now presents this bonus; avoid overlapping floating labels.
        if(!window.ColdDeckFX){const ph=$('pHand').getBoundingClientRect();flyTag(ph.left+ph.width/2,ph.top-2,ln[0]+' <b>'+ln[1]+'</b>','mult');}
      }
      window.ColdDeckFX?.onCombo(ln);
      try{sfx.combo(index);}catch(e){}
    },t);
    t+=210;
  });
  const total=t+120;
  gameDelay(cb,total);
  return total;
}
/* animation quand on franchit l'objectif de gain de la table */
function objectiveReached(){
  if(window.ColdDeckFX?.deferBankEffect(objectiveReached))return;
  const p=$('multPop');
  if(window.ColdDeckFX)window.ColdDeckFX.onGoal();
  else if(p){p.className='win';p.querySelector('.m').textContent=t('obj.reached');p.querySelector('.t').innerHTML=STAR+' '+t('obj.validated');
    p.classList.remove('go');void p.offsetWidth;p.classList.add('go');}
  // animation sur la barre d'objectif (à la place des confettis)
  const ow=$('objWrap');if(ow&&!window.ColdDeckFX){ow.classList.remove('goalpop');void ow.offsetWidth;ow.classList.add('goalpop');gameDelay(()=>ow.classList.remove('goalpop'),900);}
  flashScreen('win');shake(12);
  try{if(window.ColdDeckFX)sfx.goal();else{sfx.win&&sfx.win();sfx.combo&&sfx.combo();}}catch(e){}
  const sb=$('scorebox');if(sb){sb.classList.add('hot');gameDelay(()=>sb.classList.remove('hot'),1500);}
}

/* une SEULE salve de confettis à la fois : si un jackpot et un record tombent sur la
   même main, on ignore la 2e (elles se déclenchent à ~0,5 s d'intervalle) */
let _confettiT=-1e9;   // très négatif : la toute 1re salve part toujours (performance.now() = temps depuis le chargement)
function bigConfetti(n){
  const now=(typeof performance!=='undefined'&&performance.now)?performance.now():0;
  if(now-_confettiT<1300)return false;
  _confettiT=now;
  pixelConfetti(n);flashScreen('win');
  try{if(!window.ColdDeckFX)sfx.jackpot&&sfx.jackpot();}catch(e){}
  return true;
}
/* fanfare 21 PARFAIT : gros feedback quand on décroche le ×3 */
function perfectFanfare(){
  bigConfetti(22);shake(10);
  const sb=$('scorebox');if(sb){sb.classList.add('hot');gameDelay(()=>sb.classList.remove('hot'),1200);}
}
/* bannière NOUVEAU RECORD ! (la bannière s'affiche toujours ; les confettis sont mutualisés) */
function showRecord(gain){
  const p=$('recPop');if(!p)return;
  p.querySelector('.rt').textContent='+'+cash(gain);
  p.classList.remove('go');void p.offsetWidth;p.classList.add('go');
  window.ColdDeckFX?.onRecord();
  bigConfetti(18);
}

let shakeAmt=0;
function shake(n){if(!window.ColdDeckFX?.reduced)shakeAmt=Math.max(shakeAmt,n);}

/* ---- effets visuels ---- */
/* confettis pixel : petits carrés colorés (couleurs emblématiques) qui giclent et retombent en tournoyant */
const CONFETTI_COLS=['#edc989','#8ba875','#bc5266','#62bfff','#fff4dd','#c9994b','#b896ba'];
function pixelConfetti(n){
  if(window.ColdDeckFX?.reduced)return;
  const cont=$('particles');if(!cont)return;const cx=innerWidth/2,cy=innerHeight/2;   // pile au centre de l'écran
  for(let i=0;i<n;i++){
    const c=document.createElement('div');c.className='confetti';
    const sz=6+(i%4)*2;                                    // 6 / 8 / 10 / 12 px
    c.style.width=c.style.height=sz+'px';
    c.style.background=CONFETTI_COLS[i%CONFETTI_COLS.length];
    c.style.left=cx+'px';c.style.top=cy+'px';cont.appendChild(c);
    const ang=Math.random()*Math.PI*2, dist=70+Math.random()*260;   // éclate dans toutes les directions depuis le centre
    const bx=Math.cos(ang)*dist, by=Math.sin(ang)*dist;             // point d'explosion
    const fall=innerHeight*0.5+Math.random()*220;                    // puis retombe doucement
    const rot=(Math.random()*720-360)|0;
    const a=c.animate([
      {transform:'translate(-50%,-50%) rotate(0deg) scale(.4)',opacity:0},
      {transform:`translate(calc(-50% + ${bx.toFixed(0)}px),calc(-50% + ${by.toFixed(0)}px)) rotate(${(rot*.4)|0}deg) scale(1)`,opacity:1,offset:.26},
      {transform:`translate(calc(-50% + ${(bx*1.1).toFixed(0)}px),calc(-50% + ${(by+fall).toFixed(0)}px)) rotate(${rot}deg) scale(.85)`,opacity:0}
    ],{duration:1700+Math.random()*900,easing:'cubic-bezier(.15,.72,.3,1)'});   // plus lent (≈1,7–2,6 s)
    a.onfinish=()=>c.remove();
  }
}
function flashScreen(kind){if(window.ColdDeckFX?.reduced)return;const f=$('fx');f.classList.remove('win','lose');void f.offsetWidth;f.classList.add(kind);gameDelay(()=>f.classList.remove(kind),500);}
function slamBox(){const s=$('scorebox');s.classList.remove('slam');void s.offsetWidth;s.classList.add('slam');}
function badFlash(){const s=$('scorebox');if(!s)return;s.classList.remove('bad');void s.offsetWidth;s.classList.add('bad');gameDelay(()=>s.classList.remove('bad'),520);}
function coinBurst(n){
  if(window.ColdDeckFX?.reduced)return;
  const cont=$('particles'),cx=innerWidth/2,cy=innerHeight*0.5;
  for(let i=0;i<n;i++){
    const c=document.createElement('div');c.className='coin';
    c.style.left=cx+'px';c.style.top=cy+'px';cont.appendChild(c);
    const dx=(Math.random()-.5)*innerWidth*0.65;
    const peak=110+Math.random()*150, fall=innerHeight*0.5+Math.random()*140;
    const a=c.animate([
      {transform:'translate(-50%,-50%) scale(.4)',opacity:0},
      {transform:`translate(calc(-50% + ${dx*.5}px),calc(-50% - ${peak}px)) scale(1)`,opacity:1,offset:.35},
      {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${fall}px)) scale(.85)`,opacity:0}
    ],{duration:780+Math.random()*420,easing:'cubic-bezier(.25,.6,.3,1)'});
    a.onfinish=()=>c.remove();
  }
}
function spawnEmber(){
  if(window.ColdDeckFX?.reduced)return;
  const cont=$('particles'),e=document.createElement('div');e.className='ember';
  e.style.left=(innerWidth*(0.12+Math.random()*0.76))+'px';e.style.top=(innerHeight*0.86)+'px';
  const rise=180+Math.random()*220, drift=(Math.random()-.5)*70;
  const a=e.animate([
    {transform:'translate(0,0) scale(1)',opacity:0},
    {opacity:.9,offset:.18},
    {transform:`translate(${drift}px,${-rise}px) scale(.3)`,opacity:0}
  ],{duration:1100+Math.random()*700,easing:'ease-out'});
  a.onfinish=()=>e.remove();
}

function tick(){
  if(G._adPaused){requestAnimationFrame(tick);return;}   // pub à l'écran : jeu en veille
  const _bpct=barakaPct(),_blv=barakaLevel();
  const ambient=0;
  const amt=window.ColdDeckFX?.reduced?0:Math.min(8,Math.max(shakeAmt,ambient));
  if(amt>0.2){
    const x=(Math.random()-.5)*amt,y=(Math.random()-.5)*amt;
    const pixelRatio=window.devicePixelRatio||1;
    $('shaker').style.transform=`translate(${Math.round(x*pixelRatio)/pixelRatio}px,${Math.round(y*pixelRatio)/pixelRatio}px)`;
  }else $('shaker').style.transform='';
  if(_blv>=3&&G.phase==='play'&&Math.random()<(_bpct/100)*0.32)spawnEmber();
  if(_blv>=4&&G.phase==='play'&&(!G._beat||performance.now()-G._beat>680)){G._beat=performance.now();sfx.thump();}
  staggerUI();
  shakeAmt*=0.82;requestAnimationFrame(tick);
}

/* ============================================================
   PUBLICITÉ — BOUCHON DE DÉMO
   Aucune régie n'est branchée : Ads.show() affiche une fausse pub
   pour valider les flux, le rythme et le rendu. Pour passer en réel,
   il suffit de remplacer le corps de Ads.show() par l'appel du SDK
   (AdMob / AppLovin / SDK du portail HTML5) — tout le reste du jeu
   ne connaît que Ads.interstitial() et Ads.rewarded().
   ============================================================ */
const Ads={
  DEMO:true,
  interDelay:120000,       // délai minimum entre deux pubs (ms)
  tablesPerAd:3,           // tables franchies avant d'autoriser un interstitiel
  interSecs:4, rewardSecs:5,
  _last:0,_tables:0,_busy:false,_resolve:null,_timer:null,_left:0,_kind:'',_ok:false,
  _testDisabled:(()=>{try{return localStorage.getItem('t21testAds')==='1';}catch(e){return false;}})(),
  testDisabled(){return this._testDisabled;},
  setTestDisabled(v){
    this._testDisabled=!!v;try{localStorage.setItem('t21testAds',v?'1':'0');}catch(e){}
    if(v&&this._busy){this._ok=false;this.closeNow();}
    this._last=Date.now();this._tables=0;renderTestOptions();renderAdOpts();
  },
  /* --- achat « sans pub » (simulé ici par un réglage) --- */
  removed(){try{return localStorage.getItem('t21noads')==='1';}catch(e){return false;}},
  setRemoved(v){try{localStorage.setItem('t21noads',v?'1':'0');}catch(e){}renderAdOpts();},
  /* --- démo : ignorer les plafonds pour voir chaque emplacement --- */
  freeCaps(){try{return localStorage.getItem('t21adcaps')==='1';}catch(e){return false;}},
  setFreeCaps(v){try{localStorage.setItem('t21adcaps',v?'1':'0');}catch(e){}renderAdOpts();},
  countTable(){this._tables++;},
  canInterstitial(){
    if(this.testDisabled()||this.removed()||this._busy)return false;
    if(this.freeCaps())return true;                                  // mode démo
    return (Date.now()-this._last>this.interDelay)&&this._tables>=this.tablesPerAd;
  },
  canRewarded(){return !this.testDisabled()&&!this._busy;},
  interstitial(){
    if(!this.canInterstitial())return Promise.resolve(false);
    return this.show('inter').then(()=>{this._last=Date.now();this._tables=0;return true;});
  },
  rewarded(label){
    if(!this.canRewarded())return Promise.resolve(false);
    return this.show('reward',label).then(ok=>{if(ok)this._last=Date.now();return ok;});
  },
  /* ---- rendu de la fausse pub (à remplacer par le SDK) ---- */
  show(kind,label){
    if(this.testDisabled()||this._busy)return Promise.resolve(false);
    return new Promise(resolve=>{
      const ov=$('adOverlay');
      if(!ov){resolve(kind!=='reward');return;}
      this._busy=true;this._kind=kind;this._resolve=resolve;this._ok=(kind!=='reward');
      adPause(true);
      const rew=(kind==='reward');
      this._left=rew?this.rewardSecs:this.interSecs;
      $('adTag').textContent=t('ad.tag');
      $('adKind').textContent=rew?t('ad.rewardedTag'):t('ad.interTag');
      $('adYour').textContent=t('ad.yourAd');
      $('adFormat').textContent=t('ad.format');
      $('adInstall').textContent=t('ad.install');
      $('adDemo').textContent=t('ad.demoTag');
      $('adRewardLine').innerHTML=rew?(label||''):'';
      $('adX').classList.remove('on');
      const btn=$('adFootBtn');btn.disabled=true;
      ov.classList.add('show');
      this._paint();
      clearInterval(this._timer);
      this._timer=setInterval(()=>{
        this._left--;
        if(this._left<=0){
          clearInterval(this._timer);this._timer=null;
          this._ok=true;this._paint(true);
        }else this._paint();
      },1000);
    });
  },
  _paint(done){
    const rew=(this._kind==='reward'),btn=$('adFootBtn');
    if(done){
      $('adTimer').textContent='';
      $('adX').classList.add('on');
      btn.disabled=false;
      btn.textContent=rew?t('ad.claim'):t('ad.continue');
      btn.className='btn '+(rew?'b-gold':'b-blue');
      if(rew)$('adRewardLine').innerHTML='<b>'+t('ad.rewardGot')+'</b>';
    }else{
      $('adTimer').textContent=rew?t('ad.rewardIn',this._left):t('ad.skipIn',this._left);
      btn.textContent=rew?t('ad.rewardIn',this._left):t('ad.skipIn',this._left);
      btn.className='btn b-gold';
      // interstitiel : croix de fermeture anticipée sur la fin du décompte
      if(!rew&&this._left<=1)$('adX').classList.add('on');
    }
  },
  fakeClick(el){el.classList.remove('jit');void el.offsetWidth;el.classList.add('jit');popAdToast(t('ad.demoClick'));},
  closeNow(){
    clearInterval(this._timer);this._timer=null;
    $('adOverlay').classList.remove('show');
    const ok=this._ok,rew=(this._kind==='reward'),r=this._resolve;
    this._busy=false;this._resolve=null;
    adPause(false);
    if(rew&&!ok)popAdToast(t('ad.aborted'));
    if(r)r(ok);
  }
};
/* met le jeu en veille pendant la pub : boucle d'animation + audio */
function adPause(on){
  G._adPaused=!!on;GameClock.pause('ad',on);
  try{if(Audio_.ctx&&Audio_.ctx.state){on?Audio_.ctx.suspend():Audio_.ctx.resume();}}catch(e){}
}
function popAdToast(txt){try{popText(txt,'');}catch(e){}}

/* ---------- emplacements ---------- */
/* Retries use earned lives. One additional video retry is optional per run. */
function adRetryTable(){retryTable();}
function extraLife(){
  if(G.phase!=='lost'||G.tokens>0||G._adLifeUsed)return;
  Ads.rewarded(t('ad.retryReward')).then(ok=>{if(ok&&G.phase==='lost'){G._adLifeUsed=true;G.tokens=1;retryTable();}});
}
/* 2. fin de run : doubler la réputation gagnée */
function adDoubleRep(){
  const e=G.endInfo;if(!e||e.doubled)return;
  Ads.rewarded(t('ad.repReward',STAR+abbr(e.baseGain+e.coffre))).then(ok=>{
    if(!ok)return;
    const bonus=e.baseGain+e.coffre;
    metaCur().rep+=bonus;saveMeta();
    e.doubled=true;e.baseGain+=bonus;e.rep=metaCur().rep;
    coinBurst(14);try{sfx.win&&sfx.win();}catch(err){}
    renderEndScreen();
  });
}
/* 3. boutique : une relance offerte par boutique */
function adFreeReroll(){
  if(G._adReroll)return;
  Ads.rewarded(t('ad.rerollReward')).then(ok=>{
    if(!ok)return;
    G._adReroll=true;try{sfx.card();}catch(e){}
    rollShop();
  });
}
/* 4. Sans Fin : relancer les bonus de palier */
function adRerollBoons(){
  if(G._adBoons)return;
  Ads.rewarded(t('ad.boonReward')).then(ok=>{
    if(!ok)return;
    G._adBoons=true;reachPalier(true);
  });
}

/* ---------- rendu global / boot ---------- */
function renderAll(){renderTop();renderRelics();renderConsumables();renderChips();renderActions();renderPressure();renderMult();}

// Stable typography: visual emphasis is event-driven, never per-letter jitter.
function staggerText(){}
function staggerUI(){}

/* ---------- MENU PRINCIPAL (choix du mode) ---------- */
function renderMenu(){
  const n=META.nuit.record,i=META.infini.record;
  // The new wordmark uses stable, oversized display typography.
  const mt=document.querySelector('#modeMenu .menuTitle');
  if(mt)mt.innerHTML='COLD<span>DECK.</span>';
  const ts=$('menuTourneeSub');if(ts)ts.textContent=t('menu.circuitSub',RUN_LEN);   // nombre de tables réel (RUN_LEN), jamais figé
  const el=$('menuRecords');if(!el)return;
  el.innerHTML=
    `<div class="mrec"><span class="mrl" style="color:var(--gold)">${t('menu.circuit')}</span><span class="mrv">${STAR}${abbrS(META.nuit.rep)} · ${t('menu.recTables',n.depth||0)}</span></div>`+
    `<div class="mrec"><span class="mrl" style="color:var(--grape)">${t('menu.endless')}</span><span class="mrv">${STAR}${abbrS(META.infini.rep)} · ${t('menu.recTier',i.palier||0)}</span></div>`;
}
function openMenu(){
  GameClock.clear();
  startPalierIdx=null;   // au retour menu, la reprise se remet par défaut sur le plus loin atteint
  document.body.classList.remove('inf');
  ['intro','endScreen','loseScreen','shop','pauseScreen','palierScreen','confirmRestart','tableBrief','tableVictory'].forEach(id=>$(id).classList.remove('show'));
  renderMenu();
  $('modeMenu').classList.add('show');
}
function chooseMode(m){
  audioInit();
  MODE=(m==='infini')?'infini':'nuit';
  startPalierIdx=null;                        // la reprise se recale par défaut sur le plus loin atteint
  $('modeMenu').classList.remove('show');
  renderPlanque();renderBackPicker();
  $('intro').classList.add('show');
}
function launchMode(){ if(MODE==='infini')startEndless(); else startGame(startPalierIdx>0?startPalierIdx:0); }
function stepResume(d){ startPalierIdx=(startPalierIdx||0)+d; renderPlanque(); }   // ◀ ▶ palier de reprise

/* ---------- LA PLANQUE (hub de méta-progression, propre au mode courant) ---------- */
function renderPlanque(){
  const m=metaCur(),inf=MODE==='infini';
  $('intro').dataset.mode=MODE;
  $('repBal').innerHTML=abbrS(m.rep);
  const pt=$('planqueTitle');if(pt)pt.textContent=t(inf?'menu.endless':'menu.circuit');
  const ps=$('planqueSub');if(ps)ps.innerHTML=t(inf?'planque.subInf':'planque.subCircuit');
  const tag=$('planqueMode');if(tag){tag.textContent=LANG==='fr'?'La planque':'The hideout';tag.className='planqueMode '+(inf?'inf':'nuit');}
  const hasRecord=inf?(m.record.peak||m.record.palier):(m.record.chips||m.record.depth);
  const rb=$('recBox');if(rb)rb.innerHTML=t('planque.best')+'<br><span style="white-space:nowrap">'+(!hasRecord?t('planque.noRecord'):inf
    ?`<b>${t('planque.tierN',m.record.palier||0)}</b> · <b>${cashS(m.record.peak||0)}</b>`
    :`<b>${t('planque.tables',m.record.depth||0)}</b> · <b>${cashS(m.record.chips||0)}</b>`)+'</span>';
  // sélecteur de palier de reprise (mode cagnotte) : reprendre au palier atteint (sauvegardé)
  const pr=$('palierResume');
  if(pr){
    if(inf){
      const elan=uLvl('elan');
      const maxIdx=Math.max(elan,Math.max(1,m.record.palier||1)-1);
      if(startPalierIdx==null)startPalierIdx=maxIdx; else startPalierIdx=Math.min(Math.max(startPalierIdx,elan),maxIdx);
      if(maxIdx>elan){
        pr.style.display='';
        pr.innerHTML='<span class="prLbl">'+t('planque.resumeTier')+'</span>'+
          '<button class="prBtn" '+(startPalierIdx<=elan?'disabled':'')+' data-action="resume-previous"><span class="ar" style="--o:-.8px">◀</span></button>'+
          '<span class="prVal">'+t('planque.tierLabel',startPalierIdx+1)+'</span>'+
          '<button class="prBtn" '+(startPalierIdx>=maxIdx?'disabled':'')+' data-action="resume-next"><span class="ar" style="--o:.8px;--d:.14s">▶</span></button>';
      } else pr.style.display='none';
    } else {
      // Resume a reached table; record.depth counts only victories.
      const maxIdx=Math.max(0,(m.record.reached||0)-1);   // index 0-based de la table la plus loin atteinte
      if(startPalierIdx==null)startPalierIdx=maxIdx; else startPalierIdx=Math.min(Math.max(startPalierIdx,0),maxIdx);
      if(maxIdx>=1){
        pr.style.display='';
        pr.innerHTML='<span class="prLbl">'+t('planque.resumeTable')+'</span>'+
          '<button class="prBtn" '+(startPalierIdx<=0?'disabled':'')+' data-action="resume-previous"><span class="ar" style="--o:-.8px">◀</span></button>'+
          '<span class="prVal">'+t('planque.tableLabel',startPalierIdx+1)+'</span>'+
          '<button class="prBtn" '+(startPalierIdx>=maxIdx?'disabled':'')+' data-action="resume-next"><span class="ar" style="--o:.8px;--d:.14s">▶</span></button>';
      } else { pr.style.display='none';startPalierIdx=0; }
    }
  }
  const resumeAt=(!inf&&startPalierIdx>0)?startPalierIdx:0;   // table de reprise de la tournée (0 = départ normal)
  const lb=$('planqueLaunch');if(lb){lb.className='btn menu b-gold';
    const sub=inf?t('planque.startInf'):(resumeAt>0?t('planque.startResume',resumeAt+1):t('planque.startCircuit',RUN_LEN));
    lb.innerHTML=t('planque.start')+'<small>'+sub+'</small>';}
  const z2=$('planqueZ2');if(z2)z2.style.display='none';   // remplacé par le sélecteur « REPRENDRE À » dès qu'une table 2+ est atteinte
  const rb2=$('repBal2');if(rb2)rb2.textContent=abbr(m.rep);
  const lead=$('upgradesLead');if(lead)lead.textContent=t('upg.subtitle');
  const box=$('unlockItems');box.innerHTML='';
  let affordable=0,allMax=true;
  unlocksFor(MODE).forEach(u=>{
    const lvl=uLvl(u.id),cost=unlockCost(u),maxed=cost===null;
    if(!maxed){allMax=false;if(m.rep>=cost)affordable++;}
    const d=document.createElement('div');d.className='shopItem'+(maxed?' bought':'');
    const dots='<span class="ulvl" aria-label="'+lvl+'/'+u.max+'">'+Array.from({length:u.max},(_,i)=>'<span class="upgrade-level'+(i<lvl?' filled':'')+'" aria-hidden="true"></span>').join('')+'</span>';
    d.innerHTML=`<div class="shopTok">${effectMark(u.k,u.tc)}</div>`+
      `<div class="sInfo"><div class="nm">${ColdDeckArt.lettering(t('unlock.'+u.k+'.n'))}</div>${dots}<div class="ds">${t('unlock.'+u.k+'.d',lvl)}</div></div>`;
    const b=document.createElement('button');b.className='btn b-blue';
    b.style.cssText='font-size:13px;padding:9px 11px';
    if(maxed){b.textContent=t('planque.max');b.disabled=true;}
    else{b.innerHTML=STAR+cost;if(m.rep<cost)b.disabled=true;b.onclick=()=>buyUnlock(u.id);}
    d.appendChild(b);box.appendChild(d);
  });
  // sous-titre du bouton d'ouverture : indique ce qui est achetable maintenant
  const sub=$('upgradesSub');if(sub)sub.textContent=allMax?t('planque.allMax')
    :affordable?t('planque.avail',affordable):t('planque.upgradesSub');
  $('upgradesBtn')?.classList.toggle('has-upgrades',affordable>0);
}
function buyUnlock(id){
  const u=findUnlock(id);if(!u)return;
  const cost=unlockCost(u),m=metaCur();if(cost===null||m.rep<cost)return;
  m.rep-=cost;m.unlocks[id]=uLvl(id)+1;saveMeta();sfx.buy();
  renderPlanque();
}
function toPlanque(){
  // fin de segment de session : le meilleur emplacement d'interstitiel du jeu
  Ads.interstitial().then(()=>{
    document.body.classList.remove('inf');
    startPalierIdx=null;                     // la reprise se recale par défaut sur le plus loin atteint
    $('endScreen').classList.remove('show');$('loseScreen').classList.remove('show');$('shop').classList.remove('show');
    renderPlanque();renderBackPicker();
    $('intro').classList.add('show');
  });
}

function startGame(fromTable){
  audioInit();MODE='nuit';document.body.classList.remove('inf');
  ['intro','modeMenu','endScreen','loseScreen','shop','tableBrief','tableVictory','palierScreen','pauseScreen'].forEach(id=>$(id)?.classList.remove('show'));
  freshGame();buildShoe();
  fromTable=Math.max(0,Math.min(fromTable|0,RUN_LEN-1));
  G.recordAtStart={...META.nuit.record};G.tableIdx=fromTable;G.table=RUN[fromTable];
  G.bank=Math.round(G.table.cap*(1+.05*uLvl('bank')))+G.table.entry;
  enterTable(0);
}
/* MODE INFINI « CAGNOTTE » : on accumule tant qu'on peut miser. */
function startEndless(){
  audioInit();MODE='infini';
  ['intro','modeMenu','endScreen','loseScreen','shop','tableBrief','tableVictory','pauseScreen'].forEach(id=>$(id)?.classList.remove('show'));
  freshGame();
  const elan=uLvl('elan'),plaf=uLvl('plafond');             // déblocages permanents de l'infini
  // palier de reprise : celui choisi dans la Planque (≥ élan), borné au plus loin atteint
  const maxIdx=Math.max(elan,Math.max(1,metaCur().record.palier||1)-1);
  const si=Math.min(Math.max((startPalierIdx==null?maxIdx:startPalierIdx),elan),maxIdx);
  G.endless=true;G.palier=si;G.tableIdx=si;
  G.relics=[{...RELIC_POOL.find(r=>r.id==='jeton'),_paid:0}];
  G.consumables=[{...TAROT_POOL.find(c=>c.id==='etoile'),_paid:0}];G.tokens=0;
  G.boons={relic:0,tarot:0,mult:0,income:0,betmax:plaf*0.1,calm:0};
  G.table=endlessTier(G.tableIdx);
  if(si>0)G.bank=palierTarget(si-1);                        // reprise : on repart au seuil du palier atteint
  G.peak=G.bank;
  G.bet=Math.max(G.table.min,Math.min(G.table.max,10));G.tableStartBank=G.bank;
  document.body.classList.add('inf');
  buildShoe();
  applyHandIncome();renderAll();renderHands();
  window.ColdDeckBackgrounds?.applyTable(G.table,true);window.ColdDeckJourney?.renderHud();
  announceTurn();
  popText(t('msg.endlessStart'),t('msg.endlessStartSub'));
}
/* palier de cagnotte franchi : on choisit un bonus + les mises montent d'un cran */
function reachPalier(again){
  if(!again){
  G.palier=(G.palier||0)+1;
  G.tableIdx=G.palier;                       // le tier de mise suit le palier
  G.table=endlessTier(G.tableIdx);
  // sauvegarde automatique du palier atteint → on pourra reprendre d'ici même si on meurt/quitte
  const rr=metaCur().record;rr.palier=Math.max(rr.palier||0,(G.palier||0)+1);saveMeta();
  sfx.win&&sfx.win();flashScreen('win');shake(14);coinBurst(12);
  G._adBoons=false;                          // une relance de bonus offerte par palier
  }
  const pool=BOONS.filter(b=>(!b.lock||uLvl(b.lock))&&!(b.id==='evt3'&&G.boons&&G.boons.evt3)&&!(b.id==='filet'&&G.boons&&G.boons.filet)&&!(b.id==='baraplus'&&G.boons&&G.boons.baraplus));
  for(let i=pool.length-1;i>0;i--){const j=rndInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
  const pick=[];
  if(G.relics.length<relicMax()){
    const cards=RELIC_POOL.filter(r=>!hasRelic(r.id)&&(!r.lock||uLvl(r.lock)));
    if(cards.length){const card=cards[rndInt(cards.length)];pick.push({id:'relic:'+card.id,kind:'relic',card});}
  }
  if(G.consumables.length<consumableSlots()){
    const card=TAROT_POOL[rndInt(TAROT_POOL.length)];pick.push({id:'tarot:'+card.id,kind:'tarot',card});
  }
  pick.push(...pool.slice(0,3-pick.length));G.boonChoices=pick;
  $('palierNum').textContent=G.palier;
  $('palierBoons').innerHTML=pick.map(b=>
    `<button class="btn b-purple menu boon-choice" data-action="apply-boon" data-boon="${b.id}" style="width:100%">${effectMark(b.card?b.card.id:b.id,'#eadbff')}<span class="boon-copy">${b.card?iName(b.card):t('boon.'+b.id+'.t')}<small>${b.card?iDesc(b.card):t('boon.'+b.id+'.d')}</small></span></button>`
  ).join('')+
    // le dilemme : replonger avec un bonus, ou sécuriser AVEC prime de palier
    `<button class="btn b-gold menu" data-action="cash-out-endless-bonus" style="width:100%;margin-top:6px">${t('pal.cash',STAR+abbr(Math.round(endlessCashRep()*1.2)))}<small>${t('pal.cashSub')}</small></button>`+
    ((!G._adBoons&&Ads.canRewarded())?`<button class="btn b-teal menu" data-action="adRerollBoons" style="width:100%;margin-top:4px">${t('ad.boonBtn')}<small>${t('ad.boonSub')}</small></button>`:'');
  $('palierScreen').classList.add('show');
}
/* encaissement volontaire de la cagnotte (depuis l'écran palier avec bonus, ou la pause sans) */
function cashOutEndless(fromPalier){
  G._palierCash=!!fromPalier;
  $('palierScreen').classList.remove('show');$('pauseScreen').classList.remove('show');
  endRun(true);
}
function applyBoon(id){
  if(!G.endless||!$('palierScreen').classList.contains('show'))return;
  const choice=G.boonChoices?.find(b=>b.id===id);if(!choice)return;
  if(choice.kind==='relic'){
    if(G.relics.length>=relicMax()||hasRelic(choice.card.id))return;
    G.relics.push({...choice.card,_paid:0});
  }else if(choice.kind==='tarot'){
    if(G.consumables.length>=consumableSlots())return;
    G.consumables.push({...choice.card,_paid:0});
  }
  G.boonChoices=[];
  if(!G.boons)G.boons={relic:0,tarot:0,mult:0,income:0,betmax:0,calm:0};
  if(id==='mult')G.boons.mult++;
  else if(id==='income')G.boons.income+=5;
  else if(id==='betmax')G.boons.betmax+=0.25;
  else if(id==='filet')G.boons.filet=true;
  else if(id==='cash'){G.bank+=Math.round(G.bank*0.2);}
  else if(id==='baraplus')G.boons.baraplus=true;
  else if(id==='evt3')G.boons.evt3=true;
  sfx.buy&&sfx.buy();coinBurst(8);
  $('palierScreen').classList.remove('show');
  G.table=endlessTier(G.tableIdx);                        // reflète le bonus (ex. mise max)
  G.event=null;G.forcedUsed=false;G.counterUsed=false;G.phareUsed=false;G._talismanUsed=false;
  G.hand++;G.phase='bet';G._settling=false;G.dHand=[];G.pHand=[];
  clampBet();applyHandIncome();renderAll();renderHands();announceTurn();
}
/* banqueroute : plus de quoi miser le minimum → fin de la plongée */
function endlessBust(){
  document.body.classList.remove('inf');
  G.loseTitle='endless.bust';G.loseText='endless.bustTxt';
  endRun(false);
}
/* recommencer la progression DU MODE COURANT : on perd sa réputation, ses déblocages et son record */
let restartTarget=null;
function showRestartPrompt(mode,launch){
  restartTarget={mode,launch};
  for(const [id,attr,key] of [['resetTitle','data-i18n',launch?'test.resetTitle':'rst.title'],['resetCopy','data-i18n-html',launch?'test.resetConfirmCopy':'rst.text'],['resetConfirm','data-i18n',launch?'test.resetConfirm':'rst.ok']]){
    const el=$(id);el.setAttribute(attr,key);if(attr==='data-i18n-html')el.innerHTML=t(key);else el.textContent=t(key);
  }
  $('confirmRestart').classList.add('show');
}
function restartAll(){audioInit();showRestartPrompt(MODE,false);}
function requestCircuitReset(){showRestartPrompt('nuit',true);}
function closeRestart(){$('confirmRestart').classList.remove('show');restartTarget=null;}
function doRestart(){
  if(!restartTarget)return;
  const {mode,launch}=restartTarget;restartTarget=null;
  META[mode]=blankMeta()[mode];delete RECS[mode];saveMeta();saveRecs();
  MODE=mode;startPalierIdx=0;pauseReturn=false;inspectRef=null;
  window.ColdDeckFX?.clear();document.body.classList.remove('inf');
  document.querySelectorAll('.overlay.show').forEach(el=>el.classList.remove('show'));
  renderMenu();
  if(launch){startGame(0);return;}
  freshGame();buildShoe();renderAll();renderHands();
  renderPlanque();renderBackPicker();
  $('intro').classList.add('show');                       // on reste dans La Planque du mode, état neuf
}
freshGame();buildShoe();applyI18n();renderHands();tick();

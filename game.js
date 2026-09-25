/* ============================================================
   COLD DECK — moteur + présentation Balatro
   ============================================================ */
const $=id=>document.getElementById(id);
const STAR=ColdDeckArt.icon('doree'),STARE='<span class="empty-star">'+ColdDeckArt.icon('doree')+'</span>';
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
/* même nombre, mais le séparateur de milliers passe par .thouSep (comme les contextes animés :
   gains, etc.) → écart identique partout, même dans les pages figées (Planque, menu). À utiliser en innerHTML. */
function abbrS(n){return abbr(n).replace(/ /g,'<span class="thouSep"></span>');}
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
function arp(freqs,step,d,v,type){freqs.forEach((f,i)=>setTimeout(()=>blip(f,d,type||'square',v),i*step));}
const sfx={
  card(){blip(160+rndInt(40),.035,'square',.045);},
  flip(){blip(660,.04,'square',.05);setTimeout(()=>blip(880,.05,'square',.045),42);},
  win(){arp([523,659,784],46,.09,.08);},                              // do-mi-sol montant
  combo(){arp([784,1047,1319],38,.06,.07);},                          // étincelle aiguë
  push(){blip(392,.09,'square',.05);setTimeout(()=>blip(392,.09,'square',.04),95);},
  lose(){blip(330,.18,'square',.085,130);setTimeout(()=>blip(150,.24,'square',.07,80),110);}, // glissando descendant
  danger(){blip(130,.3,'square',.11,60);},                            // grondement grave qui plonge
  buy(){blip(880,.05,'square',.07);setTimeout(()=>blip(1245,.08,'square',.06),52);},           // a brief coin chime
  thump(){blip(70,.14,'triangle',.13);setTimeout(()=>blip(55,.18,'triangle',.1),120);},        // low heartbeat
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
  nuit:  {rep:0,unlocks:{},record:{depth:0,chips:0},zone2Runs:0},
  infini:{rep:0,unlocks:{},record:{peak:0,palier:0}}
};}
function loadMeta(){
  try{const v=JSON.parse(localStorage.getItem('t21meta'));
    if(v&&typeof v==='object'){
      if(v.nuit&&v.infini){                                   // nouveau format à deux modes
        return {
          nuit:  {rep:v.nuit.rep|0,  unlocks:v.nuit.unlocks||{},  record:{depth:(v.nuit.record&&v.nuit.record.depth)|0,chips:(v.nuit.record&&v.nuit.record.chips)|0},zone2Runs:v.nuit.zone2Runs|0},
          infini:{rep:v.infini.rep|0,unlocks:v.infini.unlocks||{},record:{peak:(v.infini.record&&v.infini.record.peak)|0,palier:(v.infini.record&&v.infini.record.palier)|0}}
        };
      }
      // ancien format {rep,unlocks,record} : tout va dans « la nuit », l'infini repart vierge
      const m=blankMeta();
      m.nuit.rep=v.rep|0;m.nuit.unlocks=v.unlocks||{};
      m.nuit.record={depth:(v.record&&v.record.depth)|0,chips:(v.record&&v.record.chips)|0};
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
function startBank(){return 50+uLvl('bank')*15;}
function startTokens(){return 3+uLvl('net');}   // secondes chances de départ : plus de marge pour la Tournée
function startRelics(){if(uLvl('contact')){const pool=RELIC_POOL.filter(r=>!r.lock||uLvl(r.lock));const r=pool[rndInt(pool.length)];return [Object.assign({},r)];}return [];}
/* ---------- données ---------- */
const SUITS=['♠','♥','♦','♣'];
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

/* ============================================================
   RUN STRUCTURÉE — 24 tables, 8 zones, boss tous les 3 niveaux (3 zones
   écrites à la main + 5 zones profondes générées, cf. TOURNÉE ÉTENDUE).
   Chaque table est une épreuve fermée : on joue TOUTES les mains
   obligatoires, puis on valide en étoiles. Mise plafonnée FIXE.
   ============================================================ */
/* nom et texte de règle : traduits au rendu (voir tableName / tableRuleText) */
const RUN=[
  /* ZONE 1 — Initiation */
  {zone:1, mains:10, min:5,  max:20,  cap:50,   goal:150, master:210,      rule:null,     entry:0,   need:0,           rt:{k:'rtx.0'}},
  {zone:1, mains:10, min:5,  max:25,  cap:130,  goal:220, master:320,      rule:'nervous',entry:0,   need:0,           rt:{rule:'nervous'}},
  {zone:1, mains:10, min:10, max:30,  cap:200,  goal:340, master:460,      rule:'gros',   entry:0,   need:2, boss:true, rt:{boss:true,rule:'gros'}},
  /* ZONE 2 — La Pression */
  {zone:2, mains:10, min:10, max:48,  cap:280,  goal:500, master:700,      rule:'mute',   entry:70,  need:3,           rt:{rule:'mute',entry:70}},
  {zone:2, mains:10, min:15, max:52,  cap:430,  goal:760, master:1010,     rule:null,     entry:0,   need:0,           rt:{k:'rtx.4'}},
  {zone:2, mains:10, min:20, max:62,  cap:640,  goal:1080, master:1420,     rule:'depart', entry:0,   need:6, boss:true, rt:{boss:true,rule:'depart'}},
  /* ZONE 3 — Casino profond */
  {zone:3, mains:10, min:25, max:80,  cap:900,  goal:1580, master:2080,     rule:null,     entry:240, need:8,          rt:{zone:3,entry:240}},
  {zone:3, mains:10, min:30, max:100, cap:1300, goal:2350, master:3000,     rule:'gros',   entry:0,   need:0,           rt:{k:'rtx.7'}},
  {zone:3, mains:10, min:40, max:120, cap:1800, goal:3200, master:4100,     rule:'sec',    entry:0,   need:0,           boss:true, rt:{boss:true,rule:'sec'}},
];
function zoneName(z){return t('zone.'+z);}
const ZONE_MULTCAP={1:4,2:6,3:9,4:11,5:13,6:16,7:19,8:24};        // plafond de multiplicateur par zone
const ZONE_FELT={1:'#138f86',2:'#7c3a9e',3:'#a52f55'};           // héritage
/* TOURNÉE ÉTENDUE : après les 3 zones écrites à la main, on génère 5 zones plus profondes
   (3 tables + boss chacune) → tournée beaucoup plus longue, dans l'esprit des paliers de l'infini. */
(function(){
  const bossR=['gros','depart','sec'],midR=[null,'nervous','mute'];
  let cap=1800;
  for(let zi=0;zi<5;zi++){
    const z=4+zi;
    for(let ti=0;ti<3;ti++){
      const boss=(ti===2),last=(z===8&&ti===2);
      cap=Math.round(cap*1.42/10)*10;
      const goal=Math.round(cap*1.78/10)*10,master=Math.round(cap*2.35/10)*10;
      const min=Math.max(40,Math.round(cap*0.03/5)*5),max=Math.round(cap*0.07/5)*5;
      const rule=last?'sec':(boss?bossR[z%bossR.length]:midR[(ti+z)%midR.length]);
      const entry=(ti===0&&z%2===1)?Math.round(goal*0.1/10)*10:0;
      RUN.push({zone:z,mains:10,min,max,cap,goal,master,rule,entry,need:0,boss,rt:{boss,last,rule,entry}});
    }
  }
})();
RUN.forEach((r,i)=>{r.i=i;});
const RUN_LEN=RUN.length;
/* nom de table : clé tbl.<index> pour la tournée, « Palier N » en sans fin */
function tableName(tb){return (tb&&tb.pal!=null)?t('endless.tier',tb.pal+1):t('tbl.'+((tb&&tb.i)|0));}
/* texte de règle : recomposé à partir du descripteur rt (traduit à chaque rendu) */
function tableRuleText(tb){
  const r=(tb&&tb.rt)||{};
  if(r.endless)return r.rule?t('rule.'+r.rule):t('rtx.endless');
  if(r.last)return t('rtx.bossFinal');
  if(r.boss)return t('rtx.boss',r.rule?t('rule.'+r.rule):t('rtx.bossPlain'));
  const parts=[];
  if(r.k)parts.push(t(r.k));
  else if(r.zone)parts.push(zoneName(r.zone));
  if(r.rule)parts.push(t('rule.'+r.rule));
  if(r.entry)parts.push(t('rtx.entry',cash(r.entry)));
  return parts.length?parts.join(' · '):t('rtx.deep');
}

/* ====== tapis évolutif ====== */
const FELT_COLORS=['#bdc8ad','#becac4','#cec2be','#cec8ae'];
function applyFelt(){
  const zone=Math.max(0,((G.table&&G.table.zone)||1)-1);
  document.documentElement.style.setProperty('--felt',FELT_COLORS[zone%FELT_COLORS.length]);
  $('feltDeco').replaceChildren();
  $('felt').classList.toggle('bossfelt',!!(G.table&&G.table.boss));
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
/* bonus de palier (mode infini cagnotte) — pas de relique/tarot, pas de vie */
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
  {id:'c5',    chk:o=>o.n>=5},
  {id:'c21',   chk:o=>o.pv===21&&o.n>2},
  {id:'cpress',chk:o=>o.press>=75},
  {id:'cmult', chk:o=>o.mult>=3},
  {id:'cdbl',  chk:o=>o.dbl},
  {id:'csuite',chk:o=>o.suite},
  {id:'ccoul', chk:o=>o.coul},
];
function contractText(c){return c?t('ctr.'+c.id):'';}
function rollContract(){
  if(G.endless)return null;
  const c=CONTRACTS[rndInt(CONTRACTS.length)];
  return {id:c.id,reward:10+((G.table&&G.table.zone)|0)*5,done:false};
}
/* appelé sur chaque main GAGNÉE (mult = multiplicateur payé) */
function checkContract(mult){
  const c=G.contract;if(!c||c.done||G.endless)return;
  const h=G.pHand,n=h.length,pv=handValue(h).total,suits=new Set(h.map(x=>x.s));
  const o={n,pv,press:barakaPct(),mult:mult||1,dbl:(G.stakeMult||1)>=2,suite:isStraight(h),coul:n>=3&&suits.size===1};
  const def=CONTRACTS.find(x=>x.id===c.id);
  if(def&&def.chk(o)){
    c.done=true;G.pot+=c.reward;
    setTimeout(()=>{sfx.combo&&sfx.combo();coinBurst(8);popText(PXI('scroll')+' '+t('msg.contract'),'+'+c.reward+' '+STAR);renderTop();},1500);
  }
}
/* étoiles : il FAUT atteindre l'objectif pour valider la table.
   0★ = objectif manqué (table ratée) · 1★ objectif · 2★ confort · 3★ maîtrise */
function starsFor(t,bank){
  if(bank<t.goal)return 0;                                  // objectif manqué → non validée
  if(bank>=t.master)return 3;                               // maîtrise
  if(bank>=t.goal+(t.master-t.goal)*0.5)return 2;           // belle marge
  return 1;                                                 // objectif tout juste
}
/* réputation d'une table validée : indexée sur la zone, les étoiles, le boss —
   jamais sur le tas de jetons. Petit bonus de risque maîtrisé. */
function tableRep(t,stars,maxBaraka){
  const base=4+t.zone*6;
  let rep=base+stars*6+(t.boss?40:0);
  if(stars>=2&&(maxBaraka||0)>=10)rep+=8;          // baraka menée haut (niv 3+)
  return rep;
}
/* réputation totale en fin de run : cagnotte (entière si encaisse, moitié sinon)
   + prime d'effort (tables tenues) + prime de PROXIMITÉ (près du but sur la
   table perdue) — une run ratée sert toujours, et « presque » paie un peu */
function proximityRep(){
  if(G.endless||!G.table||!isFinite(G.table.goal)||G.bank>=G.table.goal)return 0;
  return Math.round(10*Math.max(0,Math.min(1,G.bank/G.table.goal)));
}
function repOnEnd(cashout){
  if(G.endless){                                     // cagnotte : conversion directe, +20 % si on sécurise pile après un palier
    let r=endlessCashRep();
    if(cashout&&G._palierCash)r=Math.round(r*1.2);
    return r;
  }
  const depth=(G.tableIdx|0)+(G.phase==='done'?1:0);
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

/* éditions de cartes : foil = jetons bonus, holo = +mult, poly = ×mult */
const TAROT_POOL=[
  {id:'etoile',cost:7,when:'any',
    use(){addBaraka(2);return t('tarot.etoile.u');}},
  {id:'jugement',cost:11,when:'any',
    use(){const lvl=barakaLevel();const target=lvl<4?BARAKA_STEPS[lvl]:BARAKA_STEPS[3];addBaraka(Math.max(1,target-(G.baraka||0)));return t('tarot.jugement.u');}},
  {id:'soleil',cost:6,when:'any',
    use(){G.bank+=18;renderTop();coinBurst(8);return t('tarot.soleil.u');}},
  {id:'diable',cost:9,when:'play',need:'cards',
    use(){const c=addEditionToHand('poly');return c?t('tarot.diable.u',c.r+c.s):false;}},
  {id:'lune',cost:8,when:'play',need:'cards',
    use(){const c=addEditionToHand('holo');return c?t('tarot.lune.u',c.r+c.s):false;}},
  {id:'etoileD',cost:7,when:'play',need:'cards',
    use(){const c=addEditionToHand('foil');return c?t('tarot.etoileD.u',c.r+c.s):false;}},
  {id:'pendu',cost:9,when:'play',need:'extra',
    use(){const c=G.pHand.pop();renderHands();renderMult();updateBustReadout();renderActions();return t('tarot.pendu.u',c.r+c.s);}},
  {id:'magicien',cost:10,when:'play',
    use(){G.magicNext=true;return t('tarot.magicien.u');}},
  {id:'roue',cost:6,when:'play',need:'cards',
    use(){if(Math.random()<0.5){const ed=['foil','holo','poly'][rndInt(3)];const c=addEditionToHand(ed);return c?t('tarot.roue.u',ed.toUpperCase()):false;}return t('tarot.roue.f');}},
];

/* SERVICES de boutique : régulateurs économiques, appliqués immédiatement à l'achat
   (ni relique ni tarot). Aident à encaisser les coups durs sans casser l'économie. */
const SERVICE_POOL=[
  {id:'soin',      svc:true, baseCost:0.9,
    apply(){const c=curTable().cap;if(G.bank<c){G.bank=c;}coinBurst(8);return t('svc.soin.u');}},
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
const ED_NAME={foil:'FOIL',holo:'HOLO',poly:'POLY'};
function edInfo(ed){return t('ed.'+ed);}
function announceEd(c){if(c&&c.ed)popText(t('ed.card',ED_NAME[c.ed]),edInfo(c.ed));}
/* ICON retiré : effets affichés via jetons SHOPTOK */


/* ---------- état ---------- */
let G={};
function freshGame(){
  G={bank:startBank(),tableIdx:0,hand:1,shoe:[],dHand:[],pHand:[],bet:10,pressure:0,
     peekUsed:false,relics:startRelics(),consumables:[],magicNext:false,insisted:false,forced:false,forcedUsed:false,maxPressureReached:0,tableMaxPressure:0,baraka:0,barakaMax:0,insurance:false,objHit:false,
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
  if(Math.random()<chance){const r=Math.random();c.ed=r<0.55?'foil':r<0.85?'holo':'poly';}
  return c;
}
function draw(){if(G.shoe.length<15)buildShoe();return maybeEdition(G.shoe.pop());}
function drawIdeal(){
  if(G.shoe.length<15)buildShoe();
  const top=Math.max(0,G.shoe.length-30);let bestIdx=-1,bestVal=-1;
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
  const v=handValue(cards).total;
  if(v>=21)return v>21?100:0;
  let bust=0;for(const r of RANKS){let a=cardBase(r);if(r==='A')a=1;if(v+a>21)bust++;}
  return Math.round(bust/RANKS.length*100);
}

/* ---------- BARAKA (remplace la pression) ----------
   Barre de veine qui persiste entre les mains : monte quand on gagne
   (coup culotté = +2), retombe à zéro quand on perd. Chaque niveau donne
   un multiplicateur ET débloque de plus grosses mises. */
const BARAKA_STEPS=[3,6,10,15];                 // points cumulés pour les niveaux 1..4
const BARAKA_MULT=[1,1.25,1.5,1.75,2];          // multiplicateur par niveau (0..4)
const BARAKA_COL=['#9bbfa8','#34b6a8','#e8b84a','#f0902a','#e0524f'];
function barakaLevel(){let l=0;const b=G.baraka||0;for(const s of BARAKA_STEPS)if(b>=s)l++;return l;}
function barakaPct(){const b=G.baraka||0,lvl=barakaLevel();if(lvl>=4)return 100;const lo=lvl>0?BARAKA_STEPS[lvl-1]:0,hi=BARAKA_STEPS[lvl];return Math.min(100,(lvl+(b-lo)/(hi-lo))/4*100);}
function addBaraka(n){
  if(n>0){
    if(hasRelic('clope'))n*=1.3;                       // Cigarette : la baraka monte 30 % plus vite
    if(G.table&&G.table.rule==='nervous')n*=2;          // Table nerveuse : la baraka monte 2× plus vite
  }
  G.baraka=Math.max(0,(G.baraka||0)+n);G.barakaMax=Math.max(G.barakaMax||0,G.baraka);G.tableMaxBaraka=Math.max(G.tableMaxBaraka||0,G.baraka);renderPressure();renderMult();
}
function resetBaraka(){if(G.boons&&G.boons.filet){const l=barakaLevel();G.baraka=l>=2?BARAKA_STEPS[l-2]:0;}else G.baraka=0;renderPressure();renderMult();}
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
  if(hasRelic('bruleur')&&_bl>=2){mult*=1.5;lines.push([t('m.burner'),'×1.5','bruleur']);}
  /* éditions des cartes en main */
  let foil=0,holo=0,poly=0;
  for(const c of G.pHand){if(c.ed==='foil')foil++;else if(c.ed==='holo')holo++;else if(c.ed==='poly')poly++;}
  if(foil){bonusChips+=foil*3;lines.push([PXI('diamond')+' '+t('m.foil'),t('m.foilV',foil*3)]);}
  if(holo){mult+=holo;lines.push([PXI('diamond')+' '+t('m.holo'),'+'+holo]);}
  if(poly){const pm=Math.pow(1.5,poly);mult*=pm;lines.push([PXI('diamond')+' '+t('m.poly'),'×'+(Math.round(pm*100)/100)]);}
  if(hasRelic('as')&&G.pHand.some(c=>c.r==='A')){mult+=1;lines.push([t('m.ace'),'+1','as']);}
  if(hasRelic('froid')&&_bl>=3){mult+=1;lines.push([t('m.cool'),'+1','froid']);}
  /* ---- PETITS BONUS SITUATIONNELS : du pep's, en multiplicateur (proportionnel à la mise → facile à équilibrer) ---- */
  const figs=G.pHand.filter(c=>c.r==='J'||c.r==='Q'||c.r==='K').length;
  if(figs>=2){mult*=1.5;lines.push([t('m.court'),'×1.5']);}                             // les figures paient (2+ têtes)
  if(pv<=15){mult*=1.5;lines.push([t('m.lowball'),'×1.5']);}                             // gagner avec un petit total (≤15)
  if(G.pHand.length>=3&&handValue(G.pHand.slice(0,2)).total<=11&&pv>=17){mult*=1.3;lines.push([t('m.comeback'),'×1.3']);}  // parti de bas, remonté à 17+
  if(!G.endless&&isFinite(G.table.mains)&&G.hand>=G.table.mains){mult*=1.5;lines.push([t('m.clutch'),'×1.5']);} // dernière main de la table
  if(G.revealed){const dvv=handValue(G.dHand).total; if(pv<=21&&dvv<=21&&pv-dvv===1){mult*=1.5;lines.push([t('m.byone'),'×1.5']);}} // battre le croupier d'exactement 1
  /* anti-explosion : rendement décroissant au-delà de ×3, puis plafond de zone */
  const cap=(ZONE_MULTCAP[curTable().zone]||9)+((G.boons&&G.boons.mult)||0);
  if(mult>3)mult=3+(mult-3)*0.6;            // au-delà de ×3, chaque bonus compte à 60 %
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
    const tag=(!opts.dealer&&c.ed)?'<span class="edtag '+c.ed+'">'+ED_NAME[c.ed]+'</span>':'';
    d.innerHTML=ColdDeckArt.surface('<span class="corner tl">'+corner+'</span>'+ColdDeckArt.face(c.r,c.s)+'<span class="corner br">'+corner+'</span>'+tag);
  }
  if(opts.arrive)d.classList.add('arrive');
  else if(opts.flip)d.classList.add('flip');
  else if(opts.placed)d.classList.add('placed');
  if(!opts.back&&opts.placed&&barakaLevel()>=3&&G.phase==='play')d.classList.add('jit');
  return d;
}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
function fannedCard(c,idx,total,opts){
  const slot=document.createElement('div');slot.className='cardslot';
  const density=window.devicePixelRatio||1;
  const snapPixel=value=>Math.round(value*density)/density;
  const mid=(total-1)/2;
  const step=total>1?Math.min(2.6,9/(total-1)):0;
  const baseRot=(idx-mid)*step;                 // éventail régulier
  const arc=Math.abs(idx-mid)*1.8;              // cartes extérieures un peu plus basses
  const seed=c.r+c.s+idx;
  const jRot=(hashStr(seed+'r')-0.5)*3;         // ±1.5° pour casser la symétrie
  const jY=(hashStr(seed+'y')-0.5)*3;           // ±1.5px
  // espace horizontal aléatoire entre les cartes : elles ne se chevauchent plus en se retournant
  // (la carte de droite, arrivée après, peut encore se superposer un tout petit peu)
  if(idx>0)slot.style.marginLeft=snapPixel(hashStr(seed+'x')*5-3)+'px';   // espacement aligné sur les pixels physiques
  slot.style.transform=`translateY(${snapPixel(arc+jY)}px) rotate(${(baseRot+jRot).toFixed(2)}deg)`;
  const motionSeed=c.r+c.s+'#'+idx+(opts.dealer?'d':'p');
  slot.style.setProperty('--card-delay','-'+(idx*.5+hashStr(motionSeed+'~')*3).toFixed(3)+'s');
  slot.appendChild(opts.flip?flipCard(c,Object.assign({idx:idx},opts)):cardEl(c,Object.assign({idx:idx},opts)));
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
  const dh=$('dHand'),ph=$('pHand');dh.innerHTML='';ph.innerHTML='';
  const dShown=G.dHand.filter(c=>!c._pending),pShown=G.pHand.filter(c=>!c._pending);
  dh.style.setProperty('--hand-count',Math.max(2,dShown.length));ph.style.setProperty('--hand-count',Math.max(2,pShown.length));
  ph.style.setProperty('--split-count',G.splitActive?Math.max(4,G.hands.reduce((n,h)=>n+h.length,0)):4);
  G.dHand.forEach((c,i)=>{
    if(c._pending)return;                                         // pas encore distribuée
    const hideMute=(G.table.rule==='mute'&&!reveal);
    const hideHole=(i===1&&!reveal&&G.phase!=='done');
    const back=(c._fd!=null)?c._fd:(hideMute||hideHole);          // _fd : pilotage par la distribution
    const arrive=!!c._arr;
    const flip=c._flip||(G.doFlip&&reveal&&(G.table.rule==='mute'||i===1));
    dh.appendChild(fannedCard(c,i,dShown.length,{back,dealer:true,arrive,flip,placed:!arrive&&!flip}));
  });
  if(G.splitActive){
    const wrap=document.createElement('div');wrap.className='splitwrap';
    G.hands.forEach((h,hi)=>{
      const g=document.createElement('div');g.className='splithand';
      if(G.phase==='play'&&hi!==G.hi)g.classList.add('dim');
      if(G.phase==='play'&&hi===G.hi)g.classList.add('active');
      const shown=h.filter(c=>!c._pending);
      shown.forEach((c,i)=>{
        const arrive=!!c._arr,flip=!!c._flip;
        g.appendChild(fannedCard(c,i,shown.length,{back:c._fd,arrive,flip,placed:!arrive&&!flip}));
      });
      const up=shown.filter(c=>!c._fd&&!c._flip);
      const val=up.length?handValue(up).total:0;
      const badge=document.createElement('div');badge.className='shval';badge.textContent=up.length?val:'—';
      if(G.phase==='done'){g.classList.remove('dim','active');const dv=handValue(G.dHand).total;
        const w=val<=21&&(dv>21||val>dv);const l=val>21||(dv<=21&&val<dv);
        if(w)g.classList.add('win');else if(l)g.classList.add('lose');}
      g.appendChild(badge);
      wrap.appendChild(g);
    });
    ph.appendChild(wrap);
    const act=G.hands[G.hi].filter(c=>!c._pending&&!c._fd&&!c._flip);
    $('pVal').textContent=act.length?handValue(act).total:'—';
  }else{
  G.pHand.forEach((c,i)=>{
    if(c._pending)return;
    const arrive=!!c._arr,flip=!!c._flip;
    ph.appendChild(fannedCard(c,i,pShown.length,{back:c._fd,arrive,flip,placed:!arrive&&!flip}));
  });
  // valeur : on ne compte la carte qu'une fois RETOURNÉE (ni dos _fd, ni en cours de retournement _flip)
  const pUp=pShown.filter(c=>!c._fd&&!c._flip);
  $('pVal').textContent=pUp.length?handValue(pUp).total:'—';
  }
  const dUp=dShown.filter(c=>!c._fd&&!c._flip);
  if(reveal){$('dVal').textContent=dUp.length?handValue(dUp).total:'—';}
  else if(G.table.rule==='mute'){$('dVal').textContent='?';}
  else{$('dVal').textContent=dUp.length?handValue([dUp[0]]).total:'—';}
}
function renderPressure(){   // (barre BARAKA — on garde le nom pour tous les appels)
  const pct=barakaPct(),lvl=barakaLevel();
  document.documentElement.style.setProperty('--p',(pct/100).toFixed(3));
  const f=$('pFill');if(f)f.style.width=pct+'%';
  const pp=$('pPct');if(pp){pp.textContent=lvl?t('ui.lvl',lvl,BARAKA_MULT[lvl]):'';pp.style.display=lvl?'':'none';}
  const ps=$('pState');if(ps){ps.textContent=t('ui.streak');ps.style.color='';}
  const bar=$('pBar');if(bar){bar.classList.toggle('tick',lvl>=3);bar.dataset.active=String(pct>0);}
  const tbl=document.getElementById('table');if(tbl)tbl.classList.toggle('boil',lvl>=3);
  window.ColdDeckFX?.onPressure();
}
function renderMult(){
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
/* ---------- combos visibles : ce que ta main vaut DÉJÀ, et ce qui est À PORTÉE ----------
   Le vrai jeu est de CONSTRUIRE ses mains ; ces pastilles l'enseignent en jouant. */
function comboHints(){
  const on=[],soon=[];
  const add=(list,key,text)=>list.push({key,text});
  const h=G.pHand,n=h.length,v=handValue(h).total;
  const suits=new Set(h.map(c=>c.s));
  const sevens=h.filter(c=>c.r==='7').length;
  /* --- déjà acquis (s'appliquent si tu gagnes la main) --- */
  if(v===21&&n===2)add(on,'blackjack',t('m.blackjack')+' ×1.5');
  if(v===21&&n>2)add(on,'perfect',t('m.perfect')+' ×3');
  if(n>=5&&v<=21)add(on,'charlie',t('m.charlie')+' ×2');
  if(sevens>=2)add(on,'pair7',t('m.pair7')+' ×1.5');
  if(n>=3&&suits.size===1)add(on,'flush',t('m.flush')+' ×2');
  if(isStraight(h))add(on,'straight',t('m.straight')+' ×2');
  if(n>=4&&suits.size===4)add(on,'rainbow',t('m.rainbow')+' ×1.5');
  if(G.insisted)add(on,'pushing',t('m.pushing')+' ×1.5');
  {const bl=barakaLevel();if(bl>0)add(on,'streak'+bl,t('m.streak',bl)+' ×'+BARAKA_MULT[bl]);}
  /* petits bonus situationnels prévisibles en direct */
  if(h.filter(c=>c.r==='J'||c.r==='Q'||c.r==='K').length>=2)add(on,'court',t('m.court')+' ×1.5');
  if(n&&v<=15)add(on,'lowball',t('m.lowball')+' ×1.5');
  if(n>=3&&handValue(h.slice(0,2)).total<=11&&v>=17)add(on,'comeback',t('m.comeback')+' ×1.3');
  if(!G.endless&&isFinite(G.table.mains)&&G.hand>=G.table.mains)add(on,'clutch',t('m.clutch')+' ×1.5');
  /* --- à portée (une carte / un cran) --- */
  if(v<21&&v>=11&&21-v<=10)add(soon,'perfect',t('cb.to21',21-v));
  if(n===4&&v<=20)add(soon,'charlie',t('cb.charlie'));
  if(n===2&&suits.size===1)add(soon,'flush',t('cb.flush',h[0].s));
  if(n===3&&suits.size===3)add(soon,'rainbow',t('cb.rainbow'));
  if(sevens===1&&n<=3)add(soon,'pair7',t('cb.pair7'));
  if(!isStraight(h)&&n>=2&&n<=4&&RANKS.some(r=>isStraight(h.concat([{r,s:'♠'}]))))add(soon,'straight',t('cb.straight'));
  {const bl=barakaLevel();if(bl<4){const need=BARAKA_STEPS[bl]-(G.baraka||0);if(need<=2&&need>0)add(soon,'streak'+(bl+1),t('cb.streak',bl+1,need));}}
  return {on,soon};
}
function renderCombos(){
  const row=$('comboRow');if(!row)return;
  if(G.phase!=='play'||!G.pHand.length){row.replaceChildren();row.style.display='none';row.removeAttribute('aria-busy');return;}
  // Keep each visible box in place while the next card lands and turns.
  if(G._dealing){row.setAttribute('aria-busy','true');return;}
  if(handValue(G.pHand).total>21){row.replaceChildren();row.style.display='none';row.removeAttribute('aria-busy');return;}
  const {on,soon}=comboHints();
  const win=LANG==='fr'?'Si victoire':'On a win';
  const entries=new Map();
  const add=({key,text},ready)=>{
    const [title,...detail]=text.split(' · ');
    entries.set(key,{key,title:title.charAt(0)+title.slice(1).toLocaleLowerCase(),detail:ready?win:(detail.join(' · ')||(LANG==='fr'?'À compléter':'In reach')),ready});
  };
  if(handValue(G.pHand).total<21)soon.forEach(item=>add(item,false));
  on.forEach(item=>add(item,true));
  if(G.endless&&G.event)entries.set('event',{key:'event',title:LANG==='fr'?'Événement':'Event',detail:evtTitle(G.event),ready:false});
  if(!G.endless&&G.contract){
    const short={c5:LANG==='fr'?'5 cartes':'5 cards',c21:'21',cpress:'Baraka 75%',cmult:'Multi ×3',cdbl:t('act.double'),csuite:t('m.straight'),ccoul:t('m.flush')};
    entries.set('contract',{key:'contract',title:LANG==='fr'?'Contrat':'Contract',detail:G.contract.done?(LANG==='fr'?'Validé':'Complete'):short[G.contract.id]||contractText(G.contract),ready:!!G.contract.done,full:contractText(G.contract)});
  }
  const order=['blackjack','perfect','charlie','pair7','flush','straight','rainbow','lowball','court','comeback','pushing','clutch','streak1','streak2','streak3','streak4','event','contract'];
  const boxes=new Map([...row.children].map(box=>[box.dataset.comboKey,box]));
  [...entries.values()].sort((a,b)=>order.indexOf(a.key)-order.indexOf(b.key)).forEach((entry,index)=>{
    let box=boxes.get(entry.key);
    if(!box){box=document.createElement('div');box.className='combo-tile';box.dataset.comboKey=entry.key;box.setAttribute('role','listitem');
      const title=document.createElement('span');title.className='combo-name';
      const detail=document.createElement('span');detail.className='combo-detail';box.append(title,detail);}
    box.classList.toggle('on',entry.ready);box.classList.toggle('compact',entry.title.length>14);
    box.querySelector('.combo-name').textContent=entry.title;
    box.querySelector('.combo-detail').textContent=entry.detail;
    box.title=entry.title+' · '+(entry.full||entry.detail)+(entry.full&&entry.ready?' · '+entry.detail:'');
    box.setAttribute('aria-label',box.title);
    if(row.children[index]!==box)row.insertBefore(box,row.children[index]||null);
  });
  for(const box of [...row.children])if(!entries.has(box.dataset.comboKey))box.remove();
  row.setAttribute('aria-busy','false');row.tabIndex=0;row.setAttribute('role','list');
  row.setAttribute('aria-label',LANG==='fr'?'Combos : gris à compléter, jaune condition remplie, bonus si victoire':'Combos: grey in reach, yellow condition met, bonuses on a win');
  row.style.display=row.childElementCount?'flex':'none';
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
  const tm=$('tableMeta');if(tm)tm.textContent=G.endless
    ?t('top.metaInf',(G.palier||0)+1,abbr(tb.min),abbr(tb.max))
    :t('top.metaCircuit',tb.zone,zoneName(tb.zone),G.tableIdx+1,RUN_LEN);
  const bits=[];
  const rtx=tableRuleText(tb);
  if(rtx)bits.push(rtx);
  if(G.endless){
    bits.push(t('top.betRange',abbr(tb.min),abbr(tb.max)));
    bits.push(t('top.worth',STAR+abbr(endlessCashRep())));         // la tension : sécuriser ou replonger
    bits.push(t('top.record',cash(Math.max(G.peak||0,G.bank))));
  }else{
    bits.push(t('top.mastery',cash(tb.master)));
    bits.push(t('top.betRange',abbr(tb.min),abbr(tb.max)));
    bits.push(t('top.stars',G.runStars||0));
    if(G.pot>0)bits.push(t('top.pot',abbr(G.pot)));
    if(G.contract)bits.push(G.contract.done?t('top.contractDone'):(PXI('scroll')+' '+contractText(G.contract)+' (+'+G.contract.reward+STAR+')'));
  }
  $('ruleText').innerHTML=bits.join('  ·  ');
  $('ruleText').classList.toggle('boss',!!tb.boss);
  $('shoeCount').textContent=G.shoe.length;
  renderObjective();
}
/* barre de progression GAIN → OBJECTIF (au-dessus du tapis) */
function renderObjective(){
  const gv=$('gainVal');if(gv){gv.textContent=boardCash(G.bank);sizeBoardValue(gv,4.3);}
  const lbl=document.querySelector('#gainStat .lbl');if(lbl)lbl.textContent=G.endless?t('ui.potLbl'):t('ui.gain');
  // nouvelle table / palier : la barre repart de 0 SANS glisser depuis l'objectif précédent (on coupe la transition le temps de la remettre à zéro)
  const _of=$('objFill'),_snap=_of&&G._objBarIdx!==G.tableIdx;
  if(_snap){_of.style.transition='none';_of.style.width='0%';void _of.offsetWidth;_of.style.transition='';G._objBarIdx=G.tableIdx;}
  if(G.endless){                                           // barre = cagnotte vers le prochain PALIER (depuis 0, jamais vide tant qu'on a des jetons)
    const p=G.palier||0,target=palierTarget(p);
    const pct=Math.max(0,Math.min(100,G.bank/Math.max(1,target)*100));
    const f=$('objFill');if(f)f.style.width=pct+'%';
    const g=$('objGoal');if(g)g.textContent=boardCash(target);
    updateObjectiveReadout(pct);
    const bar=$('objBar');if(bar)bar.classList.remove('full');
    if(gv)gv.classList.remove('warn');
    return;
  }
  const goal=(G.table&&G.table.goal)||1;
  // barre = jetons ABSOLUS (depuis 0) vers l'objectif, exactement comme les paliers en Sans Fin (bank/target)
  const pct=Math.max(0,Math.min(100,G.bank/Math.max(1,goal)*100));
  const f=$('objFill');if(f)f.style.width=pct+'%';
  const g=$('objGoal');if(g)g.textContent=boardCash(goal);
  updateObjectiveReadout(pct);
  if(gv)gv.classList.toggle('warn',!!(G.table&&G.bank<G.table.min*3));
  const bar=$('objBar');if(bar)bar.classList.toggle('full',G.bank>=goal);
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
  shelf.querySelectorAll('.inventory-empty').forEach(el=>el.remove());
  const count=shelf.querySelectorAll('.joker,.tarot').length;
  for(let i=count;i<5;i++){
    const slot=document.createElement('span');slot.className='inventory-empty';slot.setAttribute('aria-hidden','true');shelf.append(slot);
  }
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
  const wrap=$('relics');wrap.innerHTML='';
  G.relics.forEach((r,idx)=>{
    const d=document.createElement('div');d.className='joker';d.dataset.relic=r.id;
    if((r.id==='froid'||r.id==='clope')&&barakaLevel()>=3)d.classList.add('hot');
    const tk=tokFor(r.id);
    d.innerHTML=effectMark(r.id,tk.c);
    d.title=`${iName(r)} — ${iDesc(r)}`;
    d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label',d.title);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();d.click();}};d.onclick=()=>openInspect('relic',idx);
    wrap.appendChild(d);
  });
  $('slotc').textContent=`${G.relics.length}/5`;
  $('slotc').parentElement.setAttribute('aria-label',`${t('ui.relics')} : ${G.relics.length}/5`);
  renderInventorySlots();
  fanEffects();
}
function consumableSlots(){return 2+(hasRelic('portebonheur')?1:0)+uLvl('tarot')+((G.boons&&G.boons.tarot)||0);}
function renderConsumables(){
  const row=$('consumeRow'),wrap=$('consumes');wrap.innerHTML='';
  G.consumables.forEach((card,i)=>{
    const d=document.createElement('div');d.className='tarot';
    const tk=tokFor(card.id);
    d.innerHTML=effectMark(card.id,tk.c);
    d.title=`${iName(card)} — ${iDesc(card)}`;
    d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label',d.title);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();d.click();}};d.onclick=()=>openInspect('tarot',i);
    wrap.appendChild(d);
  });
  $('consumeSlots').textContent=`${G.consumables.length}/${consumableSlots()}`;
  $('consumeSlots').parentElement.setAttribute('aria-label',`${t('ui.consumables')} : ${G.consumables.length}/${consumableSlots()}`);
  renderInventorySlots();
  row.style.display=(G.consumables.length||hasRelic('portebonheur'))?'flex':'none';
  fanEffects();
}
function addEditionToHand(ed){
  if(!G.pHand.length)return false;
  let pool=G.pHand.map((c,i)=>i).filter(i=>!G.pHand[i].ed);
  if(!pool.length)pool=G.pHand.map((c,i)=>i);
  const idx=pool[rndInt(pool.length)];
  G.pHand[idx].ed=ed;renderHands();renderMult();
  return G.pHand[idx];
}
function useConsumable(i,el){
  const card=G.consumables[i];if(!card)return;
  if(card.when==='play'&&G.phase!=='play'){popText(t('msg.notNow'),t('msg.notNowSub'));return;}
  if(card.need==='cards'&&!G.pHand.length){popText(t('msg.noCards'),'');return;}
  if(card.need==='extra'&&G.pHand.length<=2){popText(t('msg.cant'),t('msg.keep3'));return;}
  const res=card.use();
  if(res===false){popText(t('msg.cant'),'');return;}
  if(el)el.classList.add('flash');
  G.consumables.splice(i,1);sfx.buy();popText(iName(card),res);
  renderConsumables();
}
/* prix de revente : la moitié de ce qu'on a payé (jamais plus cher que l'achat) */
function sellValue(item){
  const base=(item&&item._paid!=null)?item._paid:itemCost(item||{cost:0});
  return Math.max(1,Math.round(base*0.5));
}
let inspectRef=null;
function openInspect(kind,i){
  const item=kind==='tarot'?G.consumables[i]:G.relics[i];
  if(!item)return;
  inspectRef={kind,i};
  const tk=tokFor(item.id);
  const tag=kind==='tarot'
    ?'<span style="color:var(--grape)">'+t('insp.tarot')+'</span>'
    :'<span style="color:var(--yellow)">'+t('insp.relic')+'</span>';
  $('inspectBody').innerHTML=`<div class="inspCard tag ${kind==='tarot'?'tarot':'joker'}">${effectMark(item.id,tk.c)}</div>`
    +`<h1 class="win" style="font-size:24px;margin:0 0 4px">${iName(item)}</h1>`
    +`<p style="font-size:10px;letter-spacing:.08em;margin:0 0 12px">${tag}</p>`
    +`<p style="color:var(--paper);font-size:13px;line-height:1.6;margin:0 0 4px">${iDesc(item)}</p>`;
  scheduleFitChipText();
  const act=$('inspectActions');act.innerHTML='';
  const mk=(label,cls,fn,dis)=>{const b=document.createElement('button');b.className='btn '+cls;b.style.cssText='font-size:13px;padding:11px 15px';b.innerHTML=label;if(dis)b.disabled=true;else b.onclick=fn;act.appendChild(b);return b;};
  if(kind==='tarot'){
    const notYet=(item.when==='play'&&G.phase!=='play');
    mk(t('insp.use'),'b-purple',()=>{const idx=inspectRef.i;closeInspect();useConsumable(idx);},notYet);
  }
  mk(t('insp.sell',cash(sellValue(item))),'b-gold',sellItem);
  mk(t('insp.close'),'b-blue',closeInspect);
  $('inspectScreen').classList.add('show');
}
function closeInspect(){const s=$('inspectScreen');if(s)s.classList.remove('show');inspectRef=null;}
function sellItem(){
  if(!inspectRef)return;
  const {kind,i}=inspectRef;
  const arr=kind==='tarot'?G.consumables:G.relics;
  const item=arr[i];if(!item){closeInspect();return;}
  const val=sellValue(item);
  G.bank+=val;arr.splice(i,1);sfx.buy();
  closeInspect();
  popText(t('msg.sold'),iName(item)+' · +'+cash(val));
  renderRelics();renderConsumables();renderTop();renderChips();renderActions();
}
function applyHandIncome(){
  let inc=0;const parts=[];
  if(hasRelic('mecene')){inc+=4;parts.push(t('inc.patron',4));}
  if(hasRelic('usurier')){const u=Math.min(6,Math.floor(G.bank/5));if(u>0){inc+=u;parts.push(t('inc.shark',u));}}
  const tip=uLvl('pourboire');if(tip>0){inc+=tip;parts.push(t('inc.tip',tip));}
  if(G.boons&&G.boons.income>0){inc+=G.boons.income;parts.push(t('inc.tier',G.boons.income));}
  // on ne montre plus le revenu en pop séparé : il est intégré au panneau de début de main
  if(inc>0){G.bank+=inc;renderTop();renderChips();G._income={amt:inc,parts:parts.slice()};}
  else G._income=null;
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
  b.classList.toggle('show',G.phase==='play'&&hasRelic('lunettes')&&!G.peekUsed);
}
function renderActions(){
  syncPeek();
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
  const live=(G.phase==='play'&&!G._dealing);
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
  if(G.peekUsed||G.phase!=='play'||!hasRelic('lunettes'))return;G.peekUsed=true;
  const n=G.shoe[G.shoe.length-1];
  $('tip').textContent=t('ui.next',n.r+n.s);blip(880,.05,'sine',.06);syncPeek();
}
function updateBustReadout(){
  if(hasRelic('compteur')&&G.phase==='play'){
    const bc=bustChance(G.pHand);
    $('tip').textContent=t('ui.bustRisk',bc);
    $('tip').style.color=bc>50?'var(--orange)':'var(--gold)';
  }
}

/* ============================================================
   DÉROULÉ
   ============================================================ */
function deal(){
  audioInit();if(!G.betChosen)return;clampBet();if(G.bank<curTable().min)return;
  window.ColdDeckFX?.clear();
  G.bank-=G.bet;G.stakeMult=1;G.splitActive=false;G.hands=null;G.hi=0;G.splitAces=false;
  // pression PERSISTANTE : reportée de la main précédente, refroidie si on joue posé
  let p0;
  if(G.hand===1)p0=(G.table.rule==='depart')?30:0;          // table chaude : seulement à l'entrée
  else p0=Math.max(0,(G.pressure||0)-15);                      // léger refroidissement entre les mains
  p0+=Math.round(12*(G.bet-G.table.min)/Math.max(1,G.table.max-G.table.min));   // grosse mise = +pression
  G.phase='play';G.pressure=Math.min(100,p0);G.peekUsed=false;G.insisted=false;G.forced=false;G.magicNext=false;G.maxPressureReached=G.pressure;G.revealed=false;G.doFlip=false;
  G.dHand=[];G.pHand=[];$('tip').textContent='';$('tip').style.color='';
  // on tire les 4 cartes mais on les distribue une par une, en animation
  const p1=draw(),d1=draw(),p2=draw(),d2=draw();
  if(hasRelic('maitresse')&&!p1.ed)p1.ed='foil';
  if(G.endless&&G.event&&G.event.id==='etoile'&&!p1.ed)p1.ed='holo';   // CARTE ÉTOILÉE
  [p1,p2,d1,d2].forEach(c=>{c._pending=true;});                 // pas encore arrivées
  G.pHand.push(p1,p2);G.dHand.push(d1,d2);
  G._dealing=true;
  renderAll();renderHands();                                     // tapis vide, actions masquées
  dealSequence([p1,d1,p2,d2]);
}
// Land face down, lift into the turn, then settle before revealing the new total.
const CARD_HOLD=180,CARD_FLIP=520;
document.documentElement.style.setProperty('--card-hold-duration',CARD_HOLD+'ms');
document.documentElement.style.setProperty('--card-flip-duration',CARD_FLIP+'ms');
// stayDown : reste dos (trou du croupier). reveal : main du croupier dévoilée.
function dealCardIn(c,opts,done){
  const reveal=!!(opts&&opts.reveal);
  c._pending=false;c._fd=true;c._flip=false;c._arr=true;
  renderHands(reveal);sfx.card();
  setTimeout(()=>{
    c._arr=false;
    if(opts&&opts.stayDown){c._fd=true;renderHands(reveal);done&&done();return;}
    c._fd=false;c._flip=true;renderHands(reveal);sfx.flip();    // on la retourne
    setTimeout(()=>{c._flip=false;renderHands(reveal);window.ColdDeckFX?.onCard(c);done&&done();},CARD_FLIP);
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
  [...G.pHand,...G.dHand].forEach(c=>{delete c._pending;delete c._fd;delete c._flip;delete c._arr;});
  renderActions();renderMult();
  const ec=G.pHand.find(c=>c.ed);if(ec)announceEd(ec);
  if(handValue(G.pHand).total===21)setTimeout(()=>playerStand(true),420);
}
function playerHit(forced){
  if(G.phase!=='play'||G._dealing)return;
  const c=(G.magicNext&&!forced)?drawIdeal():draw();G.magicNext=false;
  c._pending=true;G.pHand.push(c);
  $('tip').textContent='';
  G._dealing=true;renderActions();                             // actions et indications masquées pendant l'arrivée
  dealCardIn(c,{},()=>{
    G._dealing=false;
    if(hasRelic('aimant')){G.bank+=1;renderTop();}              // 🧲 +1 $ par carte tirée
    addPressure(forced?0:10);updateBustReadout();renderMult();
    if(c.ed)announceEd(c);
    const v=handValue(G.pHand).total;
    if(v>21){setTimeout(handBusted,300);return;}
    if(v===21){setTimeout(afterHandDone,300);return;}
    if(forced){setTimeout(afterHandDone,350);return;}
    renderActions();
  });
}
/* fin d'une main (rester / bust) : en mode séparé on passe à la main suivante, sinon on résout */
function afterHandDone(){
  if(G.splitActive&&G.hi<G.hands.length-1){nextSplitHand();return;}
  G.phase='dealer';renderActions();dealerPlay(false);
}
function handBusted(){
  if(G.splitActive){afterHandDone();return;}
  resolve('bust');
}
/* SÉPARER : une paire (même rang) devient deux mains, chacune reçoit une 2e carte et se joue à tour de rôle */
function playerSplit(){
  if(G.phase!=='play'||G._dealing||G.splitActive||G.pHand.length!==2||G.bank<G.bet)return;
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
  const c=G.magicNext?drawIdeal():draw();G.magicNext=false;
  c._pending=true;G.pHand.push(c);
  G._dealing=true;renderActions();renderHands(false);
  dealCardIn(c,{},()=>{
    G._dealing=false;
    updateBustReadout();renderMult();renderHands(false);
    if(c.ed)announceEd(c);
    const v=handValue(G.pHand).total;
    if(G.splitAces){setTimeout(afterHandDone,520);return;}   // As séparés : une seule carte par main
    if(v>21){setTimeout(handBusted,300);return;}
    if(v===21){setTimeout(afterHandDone,320);return;}
    renderActions();
  });
}
function nextSplitHand(){
  G.hi++;G.pHand=G.hands[G.hi];G.insisted=false;
  popText(t('msg.hand',G.hi+1),t('msg.handSub'));
  renderHands(false);
  dealSplitCard();
}
/* DOUBLER : sur les 2 premières cartes, double la mise, tire UNE carte, puis reste d'office */
function playerDouble(){
  if(G.phase!=='play'||G._dealing||G.pHand.length!==2||G.bank<G.bet)return;
  G.bank-=G.bet;G.stakeMult=2;
  sfx.buy();shake(10);popText(t('msg.doubled'),t('msg.doubledSub'));   // pas de gerbe de pièces : l'animation de gain est réservée aux victoires
  renderTop();renderChips();renderMult();
  const c=G.magicNext?drawIdeal():draw();G.magicNext=false;
  c._pending=true;G.pHand.push(c);
  G._dealing=true;renderActions();
  dealCardIn(c,{},()=>{
    G._dealing=false;
    addPressure(14);updateBustReadout();renderMult();
    if(c.ed)announceEd(c);
    const v=handValue(G.pHand).total;
    if(v>21){setTimeout(handBusted,320);return;}
    setTimeout(afterHandDone,340);
  });
}
function forcerChance(){
  if(G.phase!=='play'||G._dealing)return;
  const c1=draw(),c2=draw();
  const test=c=>{const t=handValue([...G.pHand,c]).total;return t>21?-100:t;};
  const keep=test(c1)>=test(c2)?c1:c2;
  G.insisted=true;sfx.danger();shake(22);
  popText(t('msg.forced'),t('msg.kept',keep.r+keep.s));
  keep._pending=true;G.pHand.push(keep);
  G._dealing=true;renderActions();
  dealCardIn(keep,{},()=>{
    G._dealing=false;
    addPressure(26);updateBustReadout();renderMult();
    const v=handValue(G.pHand).total;
    if(v>21){setTimeout(handBusted,350);return;}
    renderActions();
  });
}
function playerStand(natural){
  if(G.phase!=='play'||(G._dealing&&!natural))return;
  if(G.splitActive){afterHandDone();return;}          // séparé : passe à la main suivante ou au croupier
  G.phase='dealer';renderActions();dealerPlay(natural);
}
function dealerPlay(natural){
  if(!G.revealed){G.revealed=true;G.doFlip=true;sfx.flip();}
  renderHands(true);G.doFlip=false;
  const step=()=>{
    const v=handValue(G.dHand);
    const goal=(G.endless&&G.event&&G.event.id==='pompette')?16:((G.table.rule==='gros')?18:17);
    const hitSoft17=(barakaLevel()>=2);
    const mustHit=v.total<goal||(goal===17&&v.total===17&&v.soft&&hitSoft17);
    if(mustHit){                                                // le croupier tire : même arrivée animée
      const c=draw();c._pending=true;G.dHand.push(c);
      dealCardIn(c,{reveal:true},()=>setTimeout(step,160));
    } else setTimeout(()=>resolve(natural?'natural':'stand'),420);
  };
  setTimeout(step,CARD_FLIP+20);
}

/* ---------- résolution ---------- */
function resolve(mode){
  if(G.splitActive)return resolveSplit();
  G.phase='done';
  if(!G.revealed){G.revealed=true;G.doFlip=true;sfx.flip();}
  renderHands(true);G.doFlip=false;
  const pv=handValue(G.pHand).total,dv=handValue(G.dHand).total;
  const pBust=pv>21,dBust=dv>21;
  let outcome;
  if(pBust)outcome='lose';else if(dBust)outcome='win';
  else if(pv>dv)outcome='win';else if(pv<dv)outcome='lose';else outcome='push';
  if(outcome==='push'&&G.table.rule==='sec')outcome='lose';   // patron : pas d'égalité qui sauve

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
    G.bank+=stake+gain;
    if(G.stats){G.stats.won++;G.stats.bestGain=Math.max(G.stats.bestGain,gain);G.stats.bestMult=Math.max(G.stats.bestMult,mult);}
    if(lines.length){$('tip').innerHTML=lines.map(l=>l[0]+' '+l[1]).join('  ·  ');$('tip').style.color='var(--gold)';}
    // décompte animé (carte par carte + multiplicateurs), PUIS l'annonce du gain
    const isPerfect=(pv===21&&!isNat);            // 21 PARFAIT (×3), hors blackjack naturel
    const isRecord=checkGainRecord(gain);         // plus gros gain sur une main (record perso battu)
    const finishWin=()=>{sfx.win();if(mult>1||r.bonusChips>0)sfx.combo();
      flashScore();showWord('win',gain,mult,isNat);
      if(isPerfect)perfectFanfare();
      if(isRecord)setTimeout(()=>showRecord(gain),isPerfect?560:280);
      if(!G.objHit&&G.bank>=G.table.goal){G.objHit=true;setTimeout(objectiveReached,360);}};   // 1re fois qu'on franchit l'objectif
    tallyMs=animateScoreTally(mode,lines,finishWin);
  }else if(outcome==='push'){
    let pg=0;if(hasRelic('diplomate')){pg=Math.floor(stake*0.5);G.bank+=pg;}
    G.bank+=stake;gain=pg;sfx.push();showWord('push',pg,1);
  }else{
    let back=0;
    if(G.insurance){G.insurance=false;back=stake;popText(t('msg.insurance'),t('msg.insuranceSub'));}      // service boutique
    else if(hasRelic('talisman')&&!G._talismanUsed){G._talismanUsed=true;back=stake;popText(t('msg.talisman'),t('msg.talismanSub'));}
    else if(hasRelic('jeton')&&pv===20&&!pBust){back=Math.floor(stake/2);}
    G.bank+=back;gain=back-stake;
    sfx.lose();shake(8);showWord('lose',gain,1,false,pBust);
  }

  if(outcome==='win')checkContract(mult);                 // contrat de table (mode nuit)
  // BARAKA : gagner remplit la barre (coup culotté = +2), perdre la remet à zéro
  if(outcome==='win'){const cul=isCulotte(pv,mode);const culN=2+((G.boons&&G.boons.baraplus)?1:0);addBaraka(cul?culN:1);if(cul)setTimeout(()=>popText(t('msg.gutsy'),t('msg.gutsySub',culN)),320);}
  else if(outcome==='lose')resetBaraka();
  renderTop();renderRelics();renderPressure();renderMult();
  setTimeout(()=>nextHandOrEnd(),1750+tallyMs);
}

/* résolution en mode SÉPARÉ : chaque main est comparée au croupier, gains cumulés */
function resolveSplit(){
  G.phase='done';
  if(!G.revealed){G.revealed=true;G.doFlip=true;sfx.flip();}
  renderHands(true);G.doFlip=false;
  const dv=handValue(G.dHand).total,dBust=dv>21;
  let net=0,maxG=0;const summary=[];
  G.hands.forEach((h,i)=>{
    const pv=handValue(h).total,pBust=pv>21;
    let outcome;
    if(pBust)outcome='lose';else if(dBust)outcome='win';
    else if(pv>dv)outcome='win';else if(pv<dv)outcome='lose';else outcome='push';
    if(outcome==='push'&&G.table.rule==='sec')outcome='lose';
    const stake=G.bet;let g=0;
    if(G.stats){G.stats.played++;}
    if(outcome==='win'){
      G.pHand=h;const r=computeMult('stand');const base=stake+r.bonusChips;
      g=Math.round(base*r.mult);G.bank+=stake+g;
      checkContract(r.mult);
      if(G.stats){G.stats.won++;G.stats.bestGain=Math.max(G.stats.bestGain,g);G.stats.bestMult=Math.max(G.stats.bestMult,r.mult);}
    }else if(outcome==='push'){
      let pg=0;if(hasRelic('diplomate')){pg=Math.floor(stake*0.5);G.bank+=pg;}
      G.bank+=stake;g=pg;
    }else{
      let back=0;if(hasRelic('jeton')&&pv===20&&!pBust){back=Math.floor(stake/2);}
      G.bank+=back;g=back-stake;
    }
    net+=g;maxG=Math.max(maxG,g);
    const tag=t(outcome==='win'?'sp.win':outcome==='push'?'sp.push':'sp.lose');
    summary.push(t('sp.hand',i+1)+tag+(g>0?' +'+abbr(g):(g<0?' '+abbr(g):'')));
  });
  if(G.insurance&&net<0){G.insurance=false;G.bank+=Math.abs(net);net=0;popText(t('msg.insurance'),t('msg.insuranceSub'));}
  const kind=net>0?'win':net<0?'lose':'push';
  sfx[kind]();if(kind==='lose'){shake(8);}
  showWord(kind,Math.abs(net),1);
  if(checkGainRecord(maxG))setTimeout(()=>showRecord(maxG),320);
  $('tip').innerHTML=summary.join('  ·  ');$('tip').style.color='var(--gold)';
  if(net>0&&!G.objHit&&G.bank>=G.table.goal){G.objHit=true;setTimeout(objectiveReached,360);}
  if(net>0)addBaraka(1); else if(net<0)resetBaraka();     // BARAKA (mode séparé)
  renderTop();renderRelics();renderPressure();renderMult();
  setTimeout(()=>{G.splitActive=false;G.hands=null;G.hi=0;nextHandOrEnd();},2100);
}

/* ---------- progression ---------- */
/* dès que l'objectif est atteint, la table est validée : pas besoin de finir
   toutes les mains. Sinon on joue les mains restantes. À sec en chemin = table perdue. */
function nextHandOrEnd(){
  if(G.endless){                                    // mode cagnotte : pas d'objectif ni de limite de mains
    G.peak=Math.max(G.peak||0,G.bank);
    if(G.bank<G.table.min)return endlessBust();     // banqueroute = fin
    if(G.bank>=palierTarget(G.palier||0))return reachPalier();   // palier franchi → bonus + mises ↑
    G.hand++;G.phase='bet';G.dHand=[];G.pHand=[];
    const cadence=(G.boons&&G.boons.evt3)?3:5;                                   // « Mains spéciales ×2 » resserre le rythme
    G.event=(G.hand%cadence===0)?ENDLESS_EVENTS[rndInt(ENDLESS_EVENTS.length)]:null;   // main spéciale régulière
    clampBet();applyHandIncome();renderAll();renderHands();announceTurn();
    if(G.event)popText(PXI(G.event.ic)+' '+evtTitle(G.event),evtDesc(G.event));
    return;
  }
  if(G.bank>=G.table.goal){return finishTable();}  // objectif atteint → table gagnée tout de suite
  if(G.bank<G.table.min){return finishTable();}    // à sec : on ne peut plus miser le minimum
  if(G.hand>=G.table.mains){return finishTable();}  // toutes les mains jouées → validation
  G.hand++;G.phase='bet';G.dHand=[];G.pHand=[];   // la mise garde la dernière valeur jouée
  clampBet();
  applyHandIncome();
  renderAll();renderHands();
  announceTurn();
}
/* fin de table : 0★ = perdue · 1★ survie · 2★ objectif · 3★ maîtrise */
function finishTable(){
  const tb=G.table;
  const stars=starsFor(tb,G.bank);
  if(stars===0){onTableLost('lost.goal',{k:'lost.goalTxt',miss:tb.goal-G.bank});return;}
  G.tableStars[G.tableIdx]=stars;
  G.runStars=G.tableStars.reduce((a,b)=>a+(b||0),0);
  const reward=tableRep(tb,stars,G.tableMaxBaraka||0);
  G.pot+=reward;G.lastReward=reward;G.lastStars=stars;
  updateRecord(G.tableIdx+1);
  openShop();
}
/* table perdue : seconde chance (jeton) ou fin de descente.
   titre/texte sont des CLÉS i18n (ou {k,...} avec des valeurs) : l'écran est traduit à l'affichage. */
function onTableLost(titleKey,textKey){
  updateRecord(G.tableIdx+1);
  G.loseTitle=titleKey;G.loseText=textKey;
  if(G.tokens>0){openLose();return;}   // plus de reprise disponible : la descente s'arrête
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
  maitresse:{t:'FOIL',c:'#7fd2ff'},
  bruleur:{t:'×1.5',c:'#ff9326'},
  portebonheur:{t:'+1<small>'+STAR+'</small>',c:'#a64dff'},
  diplomate:{t:'=<small>½</small>',c:'#ffce3a'},
  talisman:{t:'1 <small>LIFE</small>',c:'#19c3c3'},
  aimant:{t:'+1<small class="sym">$/card</small>',c:'#ffce3a'},
  phare:{t:'C<small>×3</small>',c:'#ff9326'},
  etoile:{t:'+2 <small class="sym">streak</small>',c:'#f0902a'},
  jugement:{t:'+1<small class="sym">lv</small>',c:'#f0902a'},
  soleil:{t:'+18<small class="sym">$</small>',c:'#ffce3a'},
  diable:{t:'POLY',c:'#ff7ad9'},
  lune:{t:'HOLO',c:'#b388ff'},
  etoileD:{t:'FOIL',c:'#7fd2ff'},
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
  return `<span class="effect-mark" style="color:${color}" aria-hidden="true">${ColdDeckArt.effect(id)}</span>`;
}
function serviceCost(s){return niceRound(s.baseCost*curTable().goal*0.16);}
let shopOffer=[],rerollCost=5;
/* prix de boutique indexés sur la profondeur (≈ ta banque) : les cartes
   d'effet restent chères, on ne peut pas en acheter plein d'un coup */
function niceRound(c){if(c<1000)return Math.max(5,Math.round(c/5)*5);const mag=Math.pow(10,Math.floor(Math.log10(c))-1);return Math.round(c/mag)*mag;}
/* arrondi « joli » pour les mises : pas d'incrément qui grandit avec la grandeur (5→10→25→50→100→500) pour éviter les 102, 178, 187… */
function roundBet(v){let s;if(v<50)s=5;else if(v<200)s=10;else if(v<500)s=25;else if(v<2000)s=50;else if(v<10000)s=100;else s=500;return Math.max(5,Math.round(v/s)*s);}
/* prix de boutique indexés sur l'objectif de la table (pas sur ta richesse) :
   les bons objets restent chers, impossible de tout rafler d'un coup. */
function shopScale(){return Math.max(1,curTable().goal/100*1.2);}
function itemCost(r){return niceRound(r.cost*shopScale());}
function openShop(){
  rerollCost=niceRound(6*shopScale());
  G._adReroll=false;                 // une relance offerte par pub, par boutique
  Ads.countTable();                  // rythme des interstitiels : compté par table franchie
  renderShopHead();
  rollShop();
  $('shop').classList.add('show');
}
/* en-tête de boutique : reconstruit à chaque achat ET à chaque changement de langue */
function renderShopHead(){
  const depth=G.endless?('∞ '+(G.tableIdx+1)):((G.tableIdx+1)+'/'+RUN_LEN);
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
    const nx=tableFor(G.tableIdx+1),nxName=tableName(nx);
    nextBtn.style.display='';nextBtn.disabled=false;      // pas de verrou d'étoiles : atteindre l'objectif suffit
    const feeTxt=nx.entry?t('shop.fee',cash(nx.entry)):'';
    nextBtn.innerHTML=t('shop.next')+'<small>'+t('shop.nextInfo',nxName,cash(nx.goal),cash(nx.cap),feeTxt)+'</small>';
    // objectif de la prochaine table, bien visible : aide à décider d'acheter ou de garder du cash
    if(nextObj){nextObj.style.display='';
      nextObj.innerHTML=t('shop.nextObj',nxName,cash(nx.goal),cash(nx.cap))+(nx.entry?t('shop.feeObj',cash(nx.entry)):'');
    }
    $('shopGate').textContent=nx.entry?t('shop.gateFee',cash(nx.entry)):'';
  }
}
function rollShop(){
  const owned=new Set(G.relics.map(r=>r.id));
  const relics=RELIC_POOL.filter(r=>!owned.has(r.id)&&(!r.lock||uLvl(r.lock))).map(r=>({type:'relic',data:r}));
  const tarots=TAROT_POOL.map(x=>({type:'tarot',data:x}));
  const pool=relics.concat(tarots);
  for(let i=pool.length-1;i>0;i--){const j=rndInt(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
  shopOffer=pool.slice(0,3);
  // un SERVICE de régulation toujours proposé (soin/assurance/seconde chance)
  const svc=SERVICE_POOL[rndInt(SERVICE_POOL.length)];
  shopOffer.push({type:'service',data:svc});
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
    if(it.bought||G.bank<cost||slotFull)b.disabled=true;
    if(it.bought)b.textContent=t('shop.owned');
    else if(slotFull)b.textContent=t('shop.full');
    b.onclick=()=>buyShopItem(i,d,b);
    d.appendChild(b);box.appendChild(d);
  });
  scheduleFitChipText();
  const rb=$('rerollBtn');if(rb){rb.textContent=t('shop.reroll',cash(rerollCost));rb.disabled=G.bank<rerollCost;}
  const arb=$('adRerollBtn');
  if(arb){const show=!G._adReroll&&Ads.canRewarded();arb.style.display=show?'':'none';if(show)arb.textContent=t('ad.rerollBtn');}
}
function buyShopItem(i,el,btn){
  const it=shopOffer[i];if(!it||it.bought)return;const r=it.data;
  const cost=it.type==='service'?serviceCost(r):itemCost(r);
  if(G.bank<cost)return;
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
  el.classList.add('bought');btn.disabled=true;btn.textContent=t('shop.owned');
  renderShopHead();
  renderRelics();renderConsumables();renderShop();
}
function rerollShop(){
  if(G.bank<rerollCost)return;
  G.bank-=rerollCost;rerollCost=niceRound(rerollCost+3*shopScale());renderShopHead();sfx.card();
  rollShop();
}
/* CONTINUER : table suivante. Verrou par étoiles + droit d'entrée éventuel. */
function leaveShop(){
  if(!G.endless&&G.tableIdx+1>=RUN_LEN)return;     // mode normal : pas de table après la dernière
  const nx=tableFor(G.tableIdx+1);
  if(!nx)return;                                   // sécurité
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
  // droit d'entrée de zone : absorbe une partie des jetons (anti boule de neige)
  if(G.table.entry){G.bank=Math.max(0,G.bank-G.table.entry);popText(t('msg.entryFee'),'−'+cash(G.table.entry));}
  G.hand=1;G.phase='bet';G.pressure=0;G.baraka=0;G.tableMaxBaraka=0;G.dHand=[];G.pHand=[];G.forcedUsed=false;G.tableMaxPressure=0;G.insurance=false;G.objHit=false;G._talismanUsed=false;
  G.contract=rollContract();                               // nouveau contrat à chaque table
  G.bet=Math.max(G.table.min,Math.min(G.table.max,10));   // nouvelle table : on remise à zéro (pas la mise de la table d'avant)
  G.betChosen=false;                                       // nouvelle table : aucune mise présélectionnée, il faut en choisir une
  clampBet();
  G.tableStartBank=G.bank;
  applyHandIncome();
  if(G.bank<G.table.min){onTableLost('lost.broke','lost.brokeTxt');return;}
  renderAll();renderHands();renderPressure();
  announceTurn();
  if(G.table.boss){
    // entrée de BOSS : on la sent — flash rouge, gros pop, tapis rouge (via applyFelt), secousse forte, double grondement
    sfx.danger();shake(32);flashScreen('lose');showBoss();
    setTimeout(()=>{try{sfx.danger&&sfx.danger();}catch(e){}shake(18);},180);
    popText(t(G.endless?'msg.miniboss':'msg.boss'),tableRuleText(G.table));
  }
  else if(G.table.zone>prevZone){
    sfx.danger();shake(24);flashScreen('win');coinBurst(12);
    popText(t('msg.zone',G.table.zone,zoneName(G.table.zone)),tableRuleText(G.table));
  }
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
  // REPRISE = PUB OBLIGATOIRE : les vies ne sont plus qu'un plafond de reprises,
  // jamais un passe-droit. Si aucune pub n'est disponible (SDK indisponible /
  // pas de remplissage), on laisse reprendre gratuitement plutôt que de bloquer.
  const hasLife=(G.tokens||0)>0, byAd=Ads.canRewarded();
  const rb=$('retryBtn');
  rb.style.display=hasLife?'':'none';
  rb.className='btn menu '+(byAd?'b-teal':'b-gold');
  rb.innerHTML=(byAd?t('ad.retryBtn'):t('lose.retry'))
    +'<small>'+(byAd?t('ad.retrySub',G.tokens):t('lose.tokens',G.tokens))+'</small>';
  $('giveupBtn').innerHTML=t('lose.giveup')+'<small>'+t('lose.giveupSub',STAR+abbr(repOnEnd(false)))+'</small>';
  $('loseScreen').classList.add('show');
}
/* rejoue la table en cours (sabot neuf, reliques gardées), contre un jeton */
function retryTable(){
  if(G.tokens<=0)return;
  G.tokens--;
  $('loseScreen').classList.remove('show');
  buildShoe();
  G.bank=Math.max(G.tableStartBank||0,curTable().cap);   // on repart au capital conseillé de la table
  G.hand=1;G.phase='bet';G.pressure=0;G.baraka=0;G.tableMaxBaraka=0;G.dHand=[];G.pHand=[];G.forcedUsed=false;G.tableMaxPressure=0;G.insurance=false;G.objHit=false;G._talismanUsed=false;
  G.bet=Math.max(curTable().min,Math.min(curTable().max,10));   // nouvelle tentative : mise remise à zéro
  G.betChosen=false;                                            // seconde chance : il faut re-choisir une mise
  clampBet();
  applyHandIncome();
  renderAll();renderHands();renderPressure();
  announceTurn();
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
    if(depth>(r.depth||0))r.depth=depth;
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
  $('shop').classList.remove('show');$('loseScreen').classList.remove('show');
  document.body.classList.remove('inf');
  const baseGain=repOnEnd(cashout);
  const coffre=(cashout&&!G.endless)?coffreBonus(G.bank):0;   // coffre : mode nuit seulement (l'infini a sa conversion)
  const prox=cashout?0:proximityRep();
  const gained=baseGain+coffre;
  metaCur().rep+=gained;
  // nouveau record ? (comparé AVANT la mise à jour)
  const recBefore=Object.assign({},metaCur().record);
  const newRec=G.endless
    ?Math.max(G.peak||0,G.bank)>(recBefore.peak||0)
    :(G.tableIdx+1>(recBefore.depth||0)||G.bank>(recBefore.chips||0));
  // raccourci : atteindre la zone 2 (table 4) compte pour le déblocage « départ en zone 2 »
  if(!G.endless&&G.tableIdx>=3)META.nuit.zone2Runs=(META.nuit.zone2Runs|0)+1;
  updateRecord(G.tableIdx+1);
  saveMeta();
  G.endInfo={cashout,endless:!!G.endless,baseGain,coffre,prox,newRec,
    depth:G.tableIdx+1,bank:G.bank,peak:Math.max(G.peak||0,G.bank),palier:(G.palier||0)+1,
    palierCash:!!G._palierCash,rep:metaCur().rep,
    goal:(G.table&&isFinite(G.table.goal))?G.table.goal:0,
    rec:Object.assign({},metaCur().record),
    stats:Object.assign({won:0,played:0,bestGain:0,bestMult:1},G.stats||{})};
  if(G.endless)G._palierCash=false;
  renderEndScreen();
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
function showWord(kind,gain,mult,natural,bust){
  let word,sub='';
  if(kind==='win'){
    word=natural?pickWord('bj'):(mult>=3?pickWord('jackpot'):pickWord('win'));
    sub=(mult>1?fmtMult(mult)+'   ':'')+'+'+cash(gain);
  }else if(kind==='push'){word=pickWord('push');sub=gain>0?('+'+cash(gain)):t('w.betBack');}
  else{word=bust?pickWord('bust'):pickWord('lose');sub=gain?cash(gain):'';}
  const p=$('multPop');
  p.className=kind+(word.length>7?' long':'');
  p.querySelector('.m').textContent=word;p.querySelector('.t').textContent=sub;
  p.classList.remove('go');void p.offsetWidth;p.classList.add('go');
  window.ColdDeckFX?.onResult(kind,gain,mult,natural,bust);
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
  audioInit();
  const pc=$('pauseCash');
  if(pc){pc.style.display=G.endless?'':'none';if(G.endless)pc.innerHTML=t('pause.cash')+' '+STAR+abbr(endlessCashRep())+'<small>'+t('pause.cashSub')+'</small>';}
  $('pauseScreen').classList.add('show');
}
function resumeGame(){$('pauseScreen').classList.remove('show');}
/* ---------- PARAMÈTRES (langue) ---------- */
function openSettings(){renderLangOpts();renderAdOpts();$('settingsScreen').classList.add('show');}
function closeSettings(){$('settingsScreen').classList.remove('show');if(pauseReturn){pauseReturn=false;$('pauseScreen').classList.add('show');}}
function pauseSettings(){$('pauseScreen').classList.remove('show');pauseReturn=true;openSettings();}   // à la fermeture on revient à la pause
/* réglages pub de démo : aperçu des deux formats, achat « sans pub », plafonds */
function renderAdOpts(){
  const row=$('adOpts');if(!row)return;row.innerHTML='';
  const mk=(label,cls,fn)=>{const b=document.createElement('button');b.className='btn'+(cls||'');b.innerHTML=label;b.onclick=fn;row.appendChild(b);};
  mk(t('set.adTestI'),'',()=>{closeSettings();setTimeout(()=>Ads.show('inter').then(()=>Ads.closeNow&&0),260);});
  mk(t('set.adTestR'),'',()=>{closeSettings();setTimeout(()=>Ads.rewarded(t('ad.demoReward')),260);});
  mk((Ads.removed()?'☑ ':'☐ ')+t('set.adFree'),' wide'+(Ads.removed()?' on':''),()=>Ads.setRemoved(!Ads.removed()));
  mk((Ads.freeCaps()?'☑ ':'☐ ')+t('set.adCaps'),' wide'+(Ads.freeCaps()?' on':''),()=>Ads.setFreeCaps(!Ads.freeCaps()));
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
  renderLangOpts();renderAdOpts();renderRules();
  renderAll();renderMenu();renderPlanque();renderBackPicker();
  if($('shop').classList.contains('show')){renderShopHead();renderShop();}
  if($('loseScreen').classList.contains('show'))openLose();
  if($('endScreen').classList.contains('show'))renderEndScreen();
  if($('pauseScreen').classList.contains('show'))openPause();
}
function pauseRules(){$('pauseScreen').classList.remove('show');pauseReturn=true;openRules();}   // à la fermeture des règles on revient à la pause
function quitToMenu(){$('pauseScreen').classList.remove('show');endRun(false);}                   // abandonne : encaisse la réputation puis écran de fin → La Planque
// annonce du nombre de tours restants, en gros, au début de chaque main
// le nombre de tours est désormais permanent dans la barre du haut :
// on ne garde qu'un petit jeton de revenu (pourboire/mécène) au début de la main
function announceTurn(){
  const el=$('turnPop');if(!el)return;
  let h='';
  if(G._income){
    const lbl=G._income.parts.length===1?G._income.parts[0].replace(/\s*\+.*/,'').toUpperCase():t('msg.income');
    h+=`<div class="tp-coin"><b>+<span class="n">${abbr(G._income.amt)}</span><span class="cur">$</span></b><span>${lbl}</span></div>`;
  }
  if(G.endless&&G.event)h+=`<div class="tp-evt">${PXI(G.event.ic)} ${evtTitle(G.event)} · <small>${evtDesc(G.event)}</small></div>`;   // main spéciale
  el.innerHTML=h;
  if(!h)return;
  el.classList.remove('go');void el.offsetWidth;el.classList.add('go');
}
let textTimer;
function popText(txt,sub){
  $('tip').innerHTML=`<span style="color:var(--cream)">${txt}</span>${sub?' · '+sub:''}`;
  $('tip').style.color='var(--gold)';
  clearTimeout(textTimer);textTimer=setTimeout(()=>{$('tip').textContent='';},1400);
}
function flashScore(){const s=$('scorebox');if(!s)return;s.classList.remove('pop');void s.offsetWidth;s.classList.add('pop');setTimeout(()=>s.classList.remove('pop'),360);}
/* ---- décompte animé « à la Balatro » : chaque carte rebondit et fait pop sa valeur, puis les multiplicateurs ---- */
function cardPts(c){if(c.r==='A')return 11;if(c.r==='K'||c.r==='Q'||c.r==='J')return 10;return parseInt(c.r,10)||0;}
function flyTag(x,y,html,cls){
  const t=document.createElement('div');t.className='sctag '+(cls||'');t.innerHTML=html;
  t.style.left=x+'px';t.style.top=y+'px';$('particles').appendChild(t);
  if(window.ColdDeckFX?.reduced){setTimeout(()=>t.remove(),1700);return;}
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
  window.ColdDeckFX?.onRelic(el);
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
    setTimeout(()=>{
      bounceEl(card);                                    // les cartes rebondissent (sans chiffre trompeur : elles ne rapportent pas de jetons)
      try{blip(420+Math.min(i,6)*70,.05,'square',.06);}catch(e){}
    },t);
    t+=STEP;
  });
  t+=140;
  (lines||[]).forEach((ln)=>{
    setTimeout(()=>{
      // ligne issue d'une relique → le jeton correspondant se déclenche et l'effet jaillit de lui
      const relEl=ln[2]?document.querySelector('#relics .joker[data-relic="'+ln[2]+'"]'):null;
      if(relEl){
        fireRelic(relEl);
        const r=relEl.getBoundingClientRect();
        flyTag(r.left+r.width/2,r.top+r.height*0.15,ln[0]+' <b>'+ln[1]+'</b>','mult');
      }else{
        // The center impact now presents this bonus; avoid overlapping floating labels.
        if(!window.ColdDeckFX){const ph=$('pHand').getBoundingClientRect();flyTag(ph.left+ph.width/2,ph.top-2,ln[0]+' <b>'+ln[1]+'</b>','mult');}
      }
      window.ColdDeckFX?.onCombo(ln);
      try{sfx.combo();}catch(e){}
    },t);
    t+=210;
  });
  const total=t+120;
  setTimeout(cb,total);
  return total;
}
/* animation quand on franchit l'objectif de gain de la table */
function objectiveReached(){
  window.ColdDeckFX?.onGoal();
  const p=$('multPop');
  if(p){p.className='win';p.querySelector('.m').textContent=t('obj.reached');p.querySelector('.t').innerHTML=STAR+' '+t('obj.validated');
    p.classList.remove('go');void p.offsetWidth;p.classList.add('go');}
  // animation sur la barre d'objectif (à la place des confettis)
  const ow=$('objWrap');if(ow){ow.classList.remove('goalpop');void ow.offsetWidth;ow.classList.add('goalpop');setTimeout(()=>ow.classList.remove('goalpop'),900);}
  flashScreen('win');shake(12);
  try{sfx.win&&sfx.win();sfx.combo&&sfx.combo();}catch(e){}
  const sb=$('scorebox');if(sb){sb.classList.add('hot');setTimeout(()=>sb.classList.remove('hot'),1500);}
}

/* une SEULE salve de confettis à la fois : si un jackpot et un record tombent sur la
   même main, on ignore la 2e (elles se déclenchent à ~0,5 s d'intervalle) */
let _confettiT=-1e9;   // très négatif : la toute 1re salve part toujours (performance.now() = temps depuis le chargement)
function bigConfetti(n){
  const now=(typeof performance!=='undefined'&&performance.now)?performance.now():0;
  if(now-_confettiT<1300)return false;
  _confettiT=now;
  pixelConfetti(n);flashScreen('win');
  try{sfx.jackpot&&sfx.jackpot();}catch(e){}
  return true;
}
/* fanfare 21 PARFAIT : gros feedback quand on décroche le ×3 */
function perfectFanfare(){
  bigConfetti(22);shake(10);
  const sb=$('scorebox');if(sb){sb.classList.add('hot');setTimeout(()=>sb.classList.remove('hot'),1200);}
}
/* bannière NOUVEAU RECORD ! (la bannière s'affiche toujours ; les confettis sont mutualisés) */
function showRecord(gain){
  const p=$('recPop');if(!p)return;
  window.ColdDeckFX?.onRecord();
  p.querySelector('.rt').textContent='+'+cash(gain);
  p.classList.remove('go');void p.offsetWidth;p.classList.add('go');
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
function flashScreen(kind){if(window.ColdDeckFX?.reduced)return;const f=$('fx');f.classList.remove('win','lose');void f.offsetWidth;f.classList.add(kind);setTimeout(()=>f.classList.remove(kind),500);}
function slamBox(){const s=$('scorebox');s.classList.remove('slam');void s.offsetWidth;s.classList.add('slam');}
function badFlash(){const s=$('scorebox');if(!s)return;s.classList.remove('bad');void s.offsetWidth;s.classList.add('bad');setTimeout(()=>s.classList.remove('bad'),520);}
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
  _last:0,_tables:99,_busy:false,_resolve:null,_timer:null,_left:0,_kind:'',_ok:false,
  /* --- achat « sans pub » (simulé ici par un réglage) --- */
  removed(){try{return localStorage.getItem('t21noads')==='1';}catch(e){return false;}},
  setRemoved(v){try{localStorage.setItem('t21noads',v?'1':'0');}catch(e){}renderAdOpts();},
  /* --- démo : ignorer les plafonds pour voir chaque emplacement --- */
  freeCaps(){try{return localStorage.getItem('t21adcaps')!=='0';}catch(e){return true;}},
  setFreeCaps(v){try{localStorage.setItem('t21adcaps',v?'1':'0');}catch(e){}renderAdOpts();},
  countTable(){this._tables++;},
  canInterstitial(){
    if(this.removed()||this._busy)return false;
    if(this.freeCaps())return true;                                  // mode démo
    return (Date.now()-this._last>this.interDelay)&&this._tables>=this.tablesPerAd;
  },
  canRewarded(){return !this._busy;},                                // le rewarded reste dispo même « sans pub »
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
  G._adPaused=!!on;
  try{if(Audio_.ctx&&Audio_.ctx.state){on?Audio_.ctx.suspend():Audio_.ctx.resume();}}catch(e){}
}
function popAdToast(txt){try{popText(txt,'');}catch(e){}}

/* ---------- emplacements ---------- */
/* 1. REPRISE APRÈS DÉFAITE : vidéo obligatoire, puis on consomme une vie.
   Abandonner la pub en cours = pas de reprise (la vie n'est pas consommée). */
function adRetryTable(){
  if((G.tokens||0)<=0)return;
  if(!Ads.canRewarded()){retryTable();return;}      // aucune pub dispo : on ne bloque pas le joueur
  Ads.rewarded(t('ad.retryReward')).then(ok=>{
    if(!ok){popAdToast(t('ad.retryAborted'));return;}
    retryTable();
  });
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
  startPalierIdx=null;   // au retour menu, la reprise se remet par défaut sur le plus loin atteint
  document.body.classList.remove('inf');
  ['intro','endScreen','loseScreen','shop','pauseScreen','palierScreen','confirmRestart'].forEach(id=>$(id).classList.remove('show'));
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
      // TOURNÉE : reprendre à une table déjà atteinte (record.depth = plus loin tenu)
      const maxIdx=Math.max(0,(m.record.depth||0)-1);   // index 0-based de la table la plus loin atteinte
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
  const z2=$('planqueZ2');if(z2)z2.style.display=(!inf&&(META.nuit.zone2Runs|0)>=2&&(m.record.depth||0)<2)?'':'none';   // remplacé par le sélecteur « REPRENDRE À » dès qu'une table 2+ est atteinte
  const rb2=$('repBal2');if(rb2)rb2.textContent=abbr(m.rep);
  const lead=$('upgradesLead');if(lead)lead.innerHTML=t(inf?'planque.leadInf':'planque.leadCircuit');
  const box=$('unlockItems');box.innerHTML='';
  let affordable=0,allMax=true;
  unlocksFor(MODE).forEach(u=>{
    const lvl=uLvl(u.id),cost=unlockCost(u),maxed=cost===null;
    if(!maxed){allMax=false;if(m.rep>=cost)affordable++;}
    const d=document.createElement('div');d.className='shopItem'+(maxed?' bought':'');
    const dots=u.max>1?` <span class="ulvl">${'●'.repeat(lvl)}${'○'.repeat(u.max-lvl)}</span>`:(lvl?' <span class="ulvl">●</span>':'');
    d.innerHTML=`<div class="shopTok">${effectMark(u.k,u.tc)}</div>`+
      `<div class="sInfo"><div class="nm">${t('unlock.'+u.k+'.n')}${dots}</div><div class="ds">${t('unlock.'+u.k+'.d',lvl)}</div></div>`;
    const b=document.createElement('button');b.className='btn b-gold';
    b.style.cssText='font-size:13px;padding:9px 11px';
    if(maxed){b.textContent=t('planque.max');b.disabled=true;}
    else{b.innerHTML=STAR+cost;if(m.rep<cost)b.disabled=true;b.onclick=()=>buyUnlock(u.id);}
    d.appendChild(b);box.appendChild(d);
  });
  // sous-titre du bouton d'ouverture : indique ce qui est achetable maintenant
  const sub=$('upgradesSub');if(sub)sub.textContent=allMax?t('planque.allMax')
    :affordable?t('planque.avail',affordable):t('planque.upgradesSub');
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
  audioInit();MODE='nuit';
  document.body.classList.remove('inf');
  $('intro').classList.remove('show');$('endScreen').classList.remove('show');$('loseScreen').classList.remove('show');
  freshGame();buildShoe();
  fromTable=Math.max(0,Math.min(fromTable|0,RUN_LEN-1));
  if(fromTable>0){                                  // REPRISE : départ direct à une table déjà atteinte (ou raccourci zone 2)
    G.tableIdx=fromTable;G.table=RUN[fromTable];
    G.bank=(RUN[fromTable].cap||0)+(startBank()-50);   // capital calé sur le conseillé de la table (+ Pécule) ; cagnotte ★ à zéro : on va plus vite mais on rapporte moins
    enterTable(1);return;
  }
  G.contract=rollContract();
  applyHandIncome();renderAll();renderHands();
  announceTurn();
}
/* MODE INFINI « CAGNOTTE » : blackjack pur, on accumule tant qu'on peut miser */
function startEndless(){
  audioInit();MODE='infini';
  $('intro').classList.remove('show');$('endScreen').classList.remove('show');$('loseScreen').classList.remove('show');
  freshGame();
  const elan=uLvl('elan'),plaf=uLvl('plafond');             // déblocages permanents de l'infini
  // palier de reprise : celui choisi dans la Planque (≥ élan), borné au plus loin atteint
  const maxIdx=Math.max(elan,Math.max(1,metaCur().record.palier||1)-1);
  const si=Math.min(Math.max((startPalierIdx==null?maxIdx:startPalierIdx),elan),maxIdx);
  G.endless=true;G.palier=si;G.tableIdx=si;
  G.relics=[];G.consumables=[];G.tokens=0;                  // pas de relique/tarot/vie en infini
  G.boons={relic:0,tarot:0,mult:0,income:0,betmax:plaf*0.1,calm:0};
  G.table=endlessTier(G.tableIdx);
  if(si>0)G.bank=palierTarget(si-1);                        // reprise : on repart au seuil du palier atteint
  G.peak=G.bank;
  G.bet=Math.max(G.table.min,Math.min(G.table.max,10));G.tableStartBank=G.bank;
  document.body.classList.add('inf');
  buildShoe();
  applyHandIncome();renderAll();renderHands();
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
  const pick=pool.slice(0,3);
  $('palierNum').textContent=G.palier;
  $('palierBoons').innerHTML=pick.map(b=>
    `<button class="btn b-purple menu boon-choice" data-action="apply-boon" data-boon="${b.id}" style="width:100%">${effectMark(b.id,'#eadbff')}<span class="boon-copy">${t('boon.'+b.id+'.t')}<small>${t('boon.'+b.id+'.d')}</small></span></button>`
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
  G.event=null;                                           // pas d'événement sur la main de palier
  G.hand++;G.phase='bet';G.dHand=[];G.pHand=[];
  clampBet();applyHandIncome();renderAll();renderHands();announceTurn();
}
/* banqueroute : plus de quoi miser le minimum → fin de la plongée */
function endlessBust(){
  document.body.classList.remove('inf');
  G.loseTitle='endless.bust';G.loseText='endless.bustTxt';
  endRun(false);
}
/* recommencer la progression DU MODE COURANT : on perd sa réputation, ses déblocages et son record */
function restartAll(){audioInit();$('confirmRestart').classList.add('show');}   // petite fenêtre de confirmation in-game
function closeRestart(){$('confirmRestart').classList.remove('show');}
function doRestart(){
  META[MODE]=blankMeta()[MODE];saveMeta();
  freshGame();buildShoe();renderAll();renderHands();
  renderPlanque();renderBackPicker();
  $('confirmRestart').classList.remove('show');
  $('endScreen').classList.remove('show');$('loseScreen').classList.remove('show');$('shop').classList.remove('show');
  $('intro').classList.add('show');                       // on reste dans La Planque du mode, état neuf
}
freshGame();buildShoe();applyI18n();renderHands();tick();

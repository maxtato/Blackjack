import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';
const h=engine(),a=h.api,results=[];
const check=(name,fn)=>{h.reset(123);fn();results.push(name);};
const relic=id=>({...a.RELIC_POOL.find(r=>r.id===id),_paid:0});
const tarot=id=>({...a.TAROT_POOL.find(r=>r.id===id),_paid:10});
check('Circuit starts with one entry action and no unearned bonus cards',()=>{
 for(const from of [0,8]){
  a.startGame(from);assert.equal(a.G.phase,'bet');assert.equal(a.G.tableIdx,from);
  assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
  assert(a.G.briefPending);assert.equal(a.G.contract,undefined);
  const bank=a.G.bank;a.deal();assert.equal(a.G.bank,bank);assert.equal(a.G.pHand.length,0);
  a.startPreparedTable();assert(!a.G.briefPending);
 }
});
check('Every cleared Circuit table goes to preparation without granting cards',()=>{
 for(const contact of [0,1]){
  h.reset(123,{contact});
  for(let i=0;i<a.RUN_LEN;i++){
   a.startGame(i);a.startPreparedTable();a.G.bank=a.G.table.goal;
   a.G.bossState={wins:3,qualified:1,totals:[20,21]};
   assert(a.checkBankGoal());assert.equal(a.G.phase,'victory');
   assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
   const bank=a.G.bank,pot=a.G.pot;a.continueTableVictory();
   assert.equal(a.G.phase,i===a.RUN_LEN-1?'ended':'prepare');
   assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
   assert.equal(a.G.bank,bank);assert.equal(a.G.pot,pot);
   a.continueTableVictory();assert.equal(a.G.pot,pot);
  }
 }
});
check('Relics and Tarots require paid shop purchases and never refill themselves',()=>{
 a.G.phase='shop';a.G.bank=300;
 const items=[{type:'relic',data:a.RELIC_POOL.find(r=>r.id==='lunettes')},{type:'tarot',data:a.TAROT_POOL.find(r=>r.id==='etoile')}];
 a.setOffers(items);
 for(let i=0;i<items.length;i++){
  const before=a.G.bank,cost=a.itemCost(items[i].data);a.buyShopItem(i);
  assert.equal(a.G.bank,before-cost);
  assert.equal((i?a.G.consumables:a.G.relics)[0]._paid,cost);
  a.buyShopItem(i);assert.equal(a.G.bank,before-cost);
 }
 assert.equal(a.G.relics.length,1);assert.equal(a.G.consumables.length,1);
 a.setTable(3);a.enterTable(1);a.G.bank=a.G.table.goal;a.finishTable();a.continueTableVictory();
 assert.equal(a.G.relics.length,1);assert.equal(a.G.consumables.length,1);
 a.openShop();a.openInspect('tarot',0);a.sellItem();assert.equal(a.G.consumables.length,0);
 a.G.phase='bet';a.G.consumables=[tarot('etoile')];a.useConsumable(0);assert.equal(a.G.consumables.length,0);
});
check('Purchased Contact discounts relics while Tarot prices and resale stay accurate',()=>{
 const item=a.RELIC_POOL.find(r=>r.id==='lunettes'),card=a.TAROT_POOL.find(r=>r.id==='etoile');
 const standard=a.itemCost(item),tarotCost=a.itemCost(card);
 a.META.nuit.rep=90;a.buyUnlock('contact');assert.equal(a.META.nuit.rep,0);
 assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
 const discounted=a.itemCost(item);assert(discounted<standard);assert.equal(discounted,Math.round(standard*.9));
 assert.equal(a.itemCost(card),tarotCost);
 a.G.phase='shop';a.G.bank=300;a.setOffers([{type:'relic',data:item}]);a.buyShopItem(0);
 assert.equal(a.G.bank,300-discounted);assert.equal(a.G.relics[0]._paid,discounted);
 assert.equal(a.sellValue(a.G.relics[0]),Math.floor(discounted*.5));
 assert(a.t('unlock.contact.d').includes('10 %'));
});
check('Soft Aces and remaining-shoe odds',()=>{
 a.G.shoe=['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(card);
 assert.equal(a.bustChance([card('A'),card(6)]),0);
 a.G.shoe=[card(10),card('K'),card(2),card('A')];assert.equal(a.bustChance([card(10),card(7)]),50);
});
check('Ties refund the complete stake on ordinary tables and in free play',()=>{
 const tables=[...a.RUN.filter(table=>table.rule!=='sec'),{...a.RUN[0],endless:true}];
 for(const table of tables)for(const total of [17,18,19,20,21])for(const stakeMult of [1,2]){
  const bet=table.min,bankBefore=bet*10,stake=bet*stakeMult;
  const hand=total===21?[card('A'),card('K')]:[card(10),card(total-10)];
  a.setup(hand,[...hand.map(c=>({...c,s:'♥'}))],{table,bet,stakeMult,bank:bankBefore-stake,endless:!!table.endless,baraka:4,insurance:true,relics:[relic('talisman')]});
  a.resolve('stand');
  assert.equal(a.G.bank,bankBefore,`Table ${table.i+1}, ${total}/${total}, stake ×${stakeMult}`);
  assert.equal(h.w.__result.kind,'push');assert.equal(h.w.__result.gain,0);
  assert.equal(a.G.baraka,4);assert(a.G.insurance);assert(!a.G._talismanUsed);
  assert.equal(a.G.stats.won,0);
 }
});
check('The three ties-lose tables retain their rule and explain the loss',()=>{
 assert.deepEqual(Array.from(a.RUN.filter(table=>table.rule==='sec'),table=>table.i+1),[9,15,24]);
 for(const table of a.RUN.filter(table=>table.rule==='sec'))for(const total of [17,18,19,20,21])for(const stakeMult of [1,2]){
  const bet=table.min,stake=bet*stakeMult,bank=bet*10-stake;
  const hand=total===21?[card('A'),card('K')]:[card(10),card(total-10)];
  a.setup(hand,hand.map(c=>({...c,s:'♥'})),{table,bet,stakeMult,bank,baraka:4});
  a.resolve('stand');assert.equal(a.G.bank,bank);assert.equal(a.G.baraka,2);
  assert.equal(h.w.__result.kind,'lose');assert.equal(h.w.__result.gain,-stake);assert.equal(h.w.__result.reason,'tableTie');
 }
});
check('Both tied split hands refund both stakes on ordinary tables',()=>{
 for(const table of a.RUN.filter(table=>table.rule!=='sec')){
  const hands=[[card(10),card(8)],[card(9),card(9)]];
  a.setup(hands[1],[card(10),card(8)],{table,bank:80,bet:10,splitActive:true,hands,hi:1,baraka:4});
  a.resolveSplit();assert.equal(a.G.bank,100);assert.equal(h.w.__result.kind,'push');assert.equal(h.w.__result.gain,0);assert.equal(a.G.baraka,4);
 }
});
check('Both split ties are lost and identified on ties-lose tables',()=>{
 for(const table of a.RUN.filter(table=>table.rule==='sec')){
  const hands=[[card(10),card(8)],[card(9),card(9)]];
  a.setup(hands[1],[card(10),card(8)],{table,bank:80,bet:10,splitActive:true,hands,hi:1,baraka:4});
  a.resolveSplit();assert.equal(a.G.bank,80);assert.equal(a.G.baraka,2);
  assert.equal(h.w.__result.kind,'lose');assert.equal(h.w.__result.gain,-20);assert.equal(h.w.__result.reason,'tableTie');
  assert.equal((h.w.document.getElementById('tip').textContent.match(/ÉGALITÉ PERDUE/g)||[]).length,2);
 }
});
check('A split tie returns its stake while the other hand can still lose',()=>{
 const hands=[[card(10),card(8)],[card(10),card(7)]];
 a.setup(hands[1],[card(10),card(8)],{table:a.RUN[0],bank:80,bet:10,splitActive:true,hands,hi:1});
 a.resolveSplit();assert.equal(a.G.bank,90);assert.equal(h.w.__result.kind,'lose');assert.equal(h.w.__result.gain,-10);
});
check('Diplomat refunds special-table ties and grants its bonus elsewhere',()=>{
 for(const table of [a.RUN[0],a.RUN[8],a.RUN[14],a.RUN[23]]){
  const bonus=table.rule==='sec'?0:10;
  a.setup([card(10),card(8)],[card(10),card(8)],{table,bank:60,bet:20,stakeMult:2,relics:[relic('diplomate')]});
  a.resolve('stand');assert.equal(a.G.bank,100+bonus);assert.equal(h.w.__result.kind,'push');assert.equal(h.w.__result.gain,bonus);assert.equal(h.w.__result.reason,'');
  const hands=[[card(10),card(8)],[card(9),card(9)]];
  a.setup(hands[1],[card(10),card(8)],{table,bank:60,bet:20,relics:[relic('diplomate')],splitActive:true,hands,hi:1,baraka:4});
  a.resolveSplit();assert.equal(a.G.bank,100+bonus);assert.equal(h.w.__result.kind,'push');assert.equal(h.w.__result.gain,bonus);assert.equal(a.G.baraka,4);
 }
});
check('Matching bust totals remain losses and do not trigger Diplomat',()=>{
 a.setup([card('K'),card('Q'),card(2)],[card('K'),card('Q'),card(2)],{bank:90,bet:10,relics:[relic('diplomate')]});
 a.resolve('bust');assert.equal(a.G.bank,90);assert.equal(h.w.__result.kind,'lose');assert.equal(h.w.__result.gain,-10);
});
check('Insurance carries into the next table and refunds one loss',()=>{
 a.G.insurance=true;a.setTable(1);a.G.bank=200;a.enterTable(1);assert.equal(a.G.insurance,true);
 a.G.bank=90;a.G.bet=10;a.G.pHand=[card(10),card(6)];a.G.dHand=[card(10),card(8)];a.G.phase='play';a.resolve('stand');
 assert.equal(a.G.insurance,false);assert.equal(a.G.bank,100);
});
check('Talisman protects exactly one split hand',()=>{
 a.setup([card(10),card(6)],[card(10),card(7)],{bank:80,relics:[relic('talisman')],splitActive:true,hands:[[card(10),card(6)],[card(10),card(6)]],hi:1});
 a.resolveSplit();assert.equal(a.G.bank,90);assert(a.G._talismanUsed);
});
check('Force is limited to one eligible use per table',()=>{
 a.setup([card(10),card(7)],[card(10),card(6)],{shoe:Array.from({length:50},()=>card('A'))});
 a.forcerChance();h.clock.tick(800);assert(a.G.forcedUsed);const n=a.G.pHand.length;a.forcerChance();assert.equal(a.G.pHand.length,n);
});
check('Armed Hanged Man restores a decision, then the dealer plays normally',()=>{
 a.setup([card(10),card(6)],[card(10),card(2)],{consumables:[tarot('pendu')],shoe:Array.from({length:50},()=>card('K'))});
 a.useConsumable(0);assert(a.G.penduArmed);a.playerHit();h.clock.tick(1200);
 assert.equal(a.handValue(a.G.pHand).total,16);assert.equal(a.G.phase,'play');assert.equal(a.G.stats.won,0);
 a.playerStand();h.clock.tick(2500);assert.equal(a.G.dHand.length,3);assert.equal(a.G.stats.won,1);
});
check('Tarots cannot be played during arrival or pending bust resolution',()=>{
 a.setup([card(10),card(6)],[card(10),card(2)],{consumables:[tarot('pendu')],shoe:Array.from({length:50},()=>card('K'))});
 a.playerHit();a.useConsumable(0);assert.equal(a.G.consumables.length,1);
 h.clock.tick(800);a.useConsumable(0);assert.equal(a.G.consumables.length,1);assert.equal(a.G.stats.won,0);
 h.clock.tick(400);assert.equal(a.G.stats.won,0);assert.notEqual(a.G.phase,'play');
});
check('Committed bets survive low cash and a Baraka threshold',()=>{
 a.setup([card(5,'♣'),card(6,'♦')],[card(10),card(7)],{bank:25,bet:20,shoe:Array.from({length:50},()=>card(10)),baraka:1});
 a.playerDouble();assert.equal(a.G.bet,20);assert.equal(a.G.bank,5);h.clock.tick(3000);assert.equal(a.G.bet,20);assert.equal(a.G.bank,165);
});
check('Pause and inspection suspend the remaining engine time',()=>{
 a.setup([card(10),card(6)],[card(10),card(2)],{consumables:[tarot('pendu')],shoe:Array.from({length:50},()=>card(2))});
 a.playerHit();h.clock.tick(100);a.openPause();h.clock.tick(5000);assert(a.G._dealing);
 a.resumeGame();h.clock.tick(150);assert(a.G._dealing);a.openInspect('tarot',0);h.clock.tick(5000);assert(a.G._dealing);
 a.closeInspect();h.clock.tick(600);assert(!a.G._dealing);assert.equal(a.handValue(a.G.pHand).total,18);
});
check('Sun can complete an ordinary table between hands',()=>{
 a.G.bank=a.G.table.goal-5;a.G.baraka=2;a.G.consumables=[tarot('soleil')];a.useConsumable(0);
 a.continueTableVictory();
 assert.equal(a.G.phase,'prepare');assert.equal(a.G.baraka,0);
 assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
});
check('Gift resale is fixed and editions never overwrite',()=>{
 const free=relic('lunettes'),early=a.sellValue(free);a.setTable(23);assert.equal(a.sellValue(free),early);assert.equal(early,0);
 a.G.pHand=[card(7,'♠','poly'),card(5,'♥','foil')];assert.equal(a.addEditionToHand('foil'),false);assert.equal(a.G.pHand[0].ed,'poly');
});
check('Stars reward completion, no retry and two spare hands; records remain distinct',()=>{
 a.G.tableRetried=false;a.G.hand=a.G.table.mains;assert.equal(a.starsFor(a.G.table,a.G.table.goal),2);
 a.G.hand=a.G.table.mains-2;assert.equal(a.starsFor(a.G.table,a.G.table.goal),3);
 a.G.tableRetried=true;assert.equal(a.starsFor(a.G.table,a.G.table.goal),2);
 a.G.hand=a.G.table.mains-1;assert.equal(a.starsFor(a.G.table,a.G.table.goal),1);
 assert.equal(a.starsFor(a.G.table,a.G.table.goal-1),0);
 a.updateRecord(0);assert.equal(a.META.nuit.record.depth,0);assert.equal(a.META.nuit.record.reached,1);
 const legacy=a.migrateCircuitRecord({depth:9,chips:200});assert.equal(legacy.depth,8);assert.equal(legacy.reached,9);
});
check('The final boss cannot be won by bankroll or one lucky hand alone',()=>{
 a.setTable(23);a.G.bank=1e6;a.G.bossState={wins:1,qualified:1,totals:[21]};assert.equal(a.bossReady(),false);assert.equal(a.checkBankGoal(),false);
 a.G.bossState.wins=3;assert(a.bossReady());assert(a.checkBankGoal());assert.equal(a.META.nuit.record.depth,24);
});
check('Shop avoids useless services and reserves entry plus a legal bet',()=>{
 a.G.phase='shop';a.G.bank=10000;assert.equal(a.serviceAvailable(a.SERVICE_POOL.find(s=>s.id==='soin')),false);
 a.G.insurance=true;assert.equal(a.serviceAvailable(a.SERVICE_POOL.find(s=>s.id==='assurance')),false);
 const item=tarot('magicien');a.setOffers([{type:'tarot',data:item}]);a.G.bank=a.itemCost(item)+a.shopReserve()-1;
 const bank=a.G.bank,n=a.G.consumables.length;a.buyShopItem(0);assert.equal(a.G.bank,bank);assert.equal(a.G.consumables.length,n);
});
check('Tarot Baraka is exact and maxed charges remain unspent',()=>{
 a.G.relics=[relic('clope')];a.G.table={...a.G.table,rule:'nervous'};a.G.baraka=0;a.G.consumables=[tarot('etoile'),tarot('jugement')];
 a.useConsumable(0);assert.equal(a.G.baraka,2);a.useConsumable(0);assert.equal(a.G.baraka,4);
 a.G.baraka=10;a.G.consumables=[tarot('jugement')];a.useConsumable(0);assert.equal(a.G.consumables.length,1);
});
check('Scaled Gold, incomes and powers stay useful at depth',()=>{
 a.setTable(23);a.G.bet=10000;a.G.phase='play';a.G.pHand=[card(10,'♠','foil'),card(8)];assert.equal(a.computeMult('stand').bonusChips,1500);
 a.G.relics=[relic('compteur'),relic('phare')];a.G.shoe=[...Array.from({length:50},()=>card(9)),card(2),card('K')];assert(a.relicPower('compteur'));assert.equal(a.G.shoe.at(-1).r,'2');assert(!a.relicPower('compteur'));
 assert(a.relicPower('phare'));assert(a.G.smallNext);assert(!a.relicPower('phare'));
});
check('Only Gold and Prism are drawn, with the Collector rate and rarity preserved',()=>{
 const random=h.w.Math.random;
 try{
  for(const [relics,chance,roll,expected] of [
   [[],.05,.1,undefined],[[],.049,.849,'foil'],[[],.049,.85,'poly'],
   [[relic('collector')],.149,.1,'foil'],[[relic('collector')],.149,.99,'poly'],[[relic('collector')],.151,.1,undefined]
  ]){
   const samples=[chance,roll];h.w.Math.random=()=>samples.shift();a.G.relics=relics;
   assert.equal(a.maybeEdition(card(7)).ed,expected);
  }
  h.w.Math.random=()=>0;const existing=card(7,'♠','poly');assert.equal(a.maybeEdition(existing).ed,'poly');
 }finally{h.w.Math.random=random;}
});
check('Edition payouts combine correctly, include doubled stakes and respect the zone cap',()=>{
 for(const [editions,stakeMult,zone,gain] of [
  [[],1,1,40],[['foil'],1,1,46],[['poly'],1,1,60],
  [['foil','poly'],1,1,69],[['foil','foil'],1,1,52],
  [['foil'],2,1,92],[['poly','poly'],1,1,80],[['poly','poly'],1,2,90]
 ]){
  const table=a.RUN.find(t=>t.zone===zone);
  a.setup([card(4,'♠',editions[0]),card(6,'♠',editions[1]),card(8,'♠')],[card(10,'♥'),card(7,'♣')],{bet:20,stakeMult,bank:100-20*stakeMult});
  a.setTable(table.i);a.resolve('stand');
  assert.equal(h.w.__result.gain,gain,JSON.stringify({editions,stakeMult,zone}));assert.equal(a.G.bank,100+gain);
 }
});
check('Edition Tarots target an unedited card, and the Wheel grants only the two finishes',()=>{
 assert.deepEqual(Array.from(a.TAROT_POOL.filter(t=>t.need==='cards'),t=>t.id),['diable','etoileD','roue']);
 for(const [id,expected] of [['diable','poly'],['etoileD','foil']]){
  a.setup([card(8),card(9,'♥')],[card(10),card(7)],{consumables:[tarot(id)]});
  a.useConsumable(0,null,1);assert.equal(a.G.pHand[1].ed,expected);assert.equal(a.G.pHand[0].ed,undefined);assert.equal(a.G.consumables.length,0);
 }
 const finishes=new Set();
 for(let i=0;i<100;i++){
  a.setup([card(8,'♠','poly'),card(9,'♥')],[card(10),card(7)],{consumables:[tarot('roue')]});
  a.useConsumable(0);assert.equal(a.G.pHand[0].ed,'poly');finishes.add(a.G.pHand[1].ed);assert.equal(a.G.consumables.length,0);
 }
 assert.deepEqual([...finishes].sort(),['foil','poly']);
 a.G.pHand=[card(8)];assert.equal(a.addEditionToHand('unknown'),false);assert.equal(a.G.pHand[0].ed,undefined);
});
check('First-card rules grant Gold or Prism without replacing an existing edition',()=>{
 const random=h.w.Math.random;h.w.Math.random=()=>.9;
 try{
  for(const [rule,relics,endless,event,existing,expected] of [
   ['atelier',[],false,null,undefined,'foil'],['normal',[relic('maitresse')],false,null,undefined,'foil'],
   ['normal',[],true,{id:'etoile'},undefined,'poly'],['normal',[],false,{id:'etoile'},undefined,'poly'],['normal',[],false,{id:'etoile'},'foil','foil'],['atelier',[],false,null,'poly','poly']
  ]){
   a.setup([],[],{phase:'bet',betChosen:true,relics,endless,event,shoe:Array.from({length:60},()=>card(8,'♠',existing))});
   a.G.table={...a.G.table,rule};a.deal();assert.equal(a.G.pHand[0].ed,expected);
  }
 }finally{h.w.Math.random=random;}
});
check('Card tags and accessible descriptions use the two readable edition names',()=>{
 for(const [ed,name] of [['foil','GOLD'],['poly','PRISME']]){
  const node=a.cardEl(card(7,'♠',ed));assert.equal(node.querySelector('.edtag').textContent,name);
  assert(node.getAttribute('aria-label').includes(a.t('ed.'+ed)));
  assert.equal(a.cardEl(card(7,'♠',ed),{dealer:true}).querySelector('.edtag'),null);
 }
 assert.equal(a.STR.en['m.foil'],'GOLD');assert.equal(a.STR.en['m.poly'],'PRISM');
});
check('Free Play starts and resumes with a usable free relic and Tarot',()=>{
 for(const palier of [0,4]){
  a.reset();a.META.infini.record.palier=palier+1;a.startEndless();
  assert.equal(a.G.palier,palier);assert.equal(a.G.relics.length,1);assert.equal(a.G.relics[0].id,'jeton');
  assert.equal(a.G.consumables.length,1);assert.equal(a.G.consumables[0].id,'etoile');
  assert.equal(a.G.relics[0]._paid,0);assert.equal(a.G.consumables[0]._paid,0);
  const bank=a.G.bank;a.useConsumable(0);assert.equal(a.G.consumables.length,0);
  assert(a.G.baraka>0);assert.equal(a.G.bank,bank);
 }
});
check('Free Play tiers offer real cards, grant the selected card once and keep existing inventory',()=>{
 for(const kind of ['relic','tarot']){
  a.reset();a.startEndless();a.G.counterUsed=true;a.G.phareUsed=true;a.G._talismanUsed=true;
  a.reachPalier();assert.equal(a.G.boonChoices.length,3);
  const relicChoice=a.G.boonChoices.find(b=>b.kind==='relic'),tarotChoice=a.G.boonChoices.find(b=>b.kind==='tarot');
  assert(relicChoice);assert(tarotChoice);assert(!a.hasRelic(relicChoice.card.id));assert(!relicChoice.card.lock);
  const choice=kind==='relic'?relicChoice:tarotChoice,items=kind==='relic'?a.G.relics:a.G.consumables;
  const old=items[0],bank=a.G.bank,hand=a.G.hand;a.applyBoon(choice.id);
  assert.equal(items.length,2);assert.equal(items[0],old);assert.equal(items[1].id,choice.card.id);assert.equal(items[1]._paid,0);
  if(kind==='tarot')assert.equal(typeof items[1].use,'function');
  assert.equal(a.G.bank,bank);assert.equal(a.G.hand,hand+1);assert.equal(a.G.phase,'bet');
  assert(!a.G.counterUsed);assert(!a.G.phareUsed);assert(!a.G._talismanUsed);
  a.applyBoon(choice.id);assert.equal(items.length,2);assert.equal(a.G.hand,hand+1);
 }
});
check('Full Free Play inventories receive perks and rerolls cannot award unselected cards',()=>{
 a.reset();a.startEndless();a.G.relics=a.RELIC_POOL.filter(r=>!r.lock).slice(0,a.relicMax()).map(r=>({...r,_paid:0}));
 a.G.consumables=Array.from({length:a.consumableSlots()},()=>tarot('etoile'));
 a.reachPalier();assert.equal(a.G.boonChoices.length,3);assert(a.G.boonChoices.every(b=>!b.kind));
 const relics=a.G.relics.length,tarots=a.G.consumables.length,hand=a.G.hand;
 a.reachPalier(true);assert.equal(a.G.relics.length,relics);assert.equal(a.G.consumables.length,tarots);
 a.applyBoon('relic:phare');assert.equal(a.G.hand,hand);assert.equal(a.G.relics.length,relics);
 a.applyBoon(a.G.boonChoices[0].id);assert.equal(a.G.hand,hand+1);
 assert.equal(a.G.relics.length,relics);assert.equal(a.G.consumables.length,tarots);
});
console.log(JSON.stringify({passed:results.length,checks:results},null,2));h.close();

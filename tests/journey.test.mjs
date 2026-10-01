import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';
const h=engine({journeyUI:true,shopUI:true}),a=h.api,d=h.w.document,passed=[];
const check=(name,fn)=>{h.reset(432);fn();passed.push(name);};
const visible=id=>!!d.getElementById(id)?.classList.contains('show');

check('Victory opens one preparation; a contract starts the next table without visiting the shop',()=>{
 assert(d.getElementById('briefTools').hidden);
 a.chooseContract(0);a.G.bank=a.G.table.goal;a.finishTable();
 assert.equal(a.G.phase,'victory');assert(visible('tableVictory'));assert(!visible('shop'));assert(!visible('draftScreen'));
 assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
 const bank=a.G.bank,pot=a.G.pot,stars=a.G.runStars;
 a.finishTable();a.nextHandOrEnd();a.resolve('stand');a.resolveSplit();a.deal();a.playerHit();a.playerStand();
 assert.equal(a.G.bank,bank);assert.equal(a.G.pot,pot);assert.equal(a.G.runStars,stars);
 assert.equal(a.G.phase,'victory');
 assert.equal(d.getElementById('victoryContinue').textContent,'Continuer');
 a.continueTableVictory();assert(!visible('tableVictory'));assert(!visible('draftScreen'));
 assert.equal(a.G.phase,'prepare');assert(visible('tableBrief'));assert(!visible('shop'));
 assert.equal(a.G.tableIdx,0);assert.equal(a.G.bank,bank);
 assert.equal(d.getElementById('briefTableLabel').textContent,'TABLE 02/24');
 assert.equal(d.getElementById('briefEffect').dataset.rule,a.RUN[1].rule||'standard');
 assert(!d.getElementById('briefTools').hidden);assert(d.getElementById('briefCashBtn').hidden);
 const choices=a.G.contractChoices;
 a.nextHandOrEnd();a.finishTable();a.resolve('stand');a.resolveSplit();a.deal();a.playerHit();a.playerStand();
 assert.equal(a.G.phase,'prepare');assert.equal(a.G.bank,bank);assert.equal(a.G.pot,pot);
 a.continueTableVictory();assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);assert.equal(a.G.pot,pot);
 d.querySelector('.contract-info').click();assert(visible('inspectScreen'));assert.equal(a.G.phase,'prepare');
 a.closeInspect();d.querySelectorAll('.contract-choice')[1].click();
 assert.equal(a.G.tableIdx,1);assert.equal(a.G.phase,'bet');assert(!visible('tableBrief'));assert(!visible('shop'));
 assert.equal(a.G.contract,choices[1]);assert.equal(a.G.bank,bank-a.RUN[1].entry);
 a.chooseContract(0);assert.equal(a.G.contract,choices[1]);assert.equal(a.G.tableIdx,1);
 a.G.bank=a.G.table.goal;a.finishTable();a.continueTableVictory();
 assert.equal(a.G.phase,'prepare');assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
});
check('Optional shop keeps offers, purchases, reroll cost and contracts across returns',()=>{
 a.startGame(2);a.chooseContract(0);a.G.bank=a.G.table.goal+200;
 a.G.bossState={wins:3,qualified:1,totals:[20,21]};a.finishTable();a.continueTableVictory();
 const before=a.G.bank,choices=a.G.contractChoices;
 assert(!d.getElementById('briefCashBtn').hidden);
 a.openShop();assert(visible('shop'));assert(!visible('tableBrief'));assert.equal(a.G.bank,before);
 assert.equal(d.getElementById('shopNextObj'),null);
 assert.equal(d.getElementById('shopNextBtn').textContent.trim(),'Retour à la préparation');
 a.setOffers([{type:'tarot',data:a.TAROT_POOL.find(item=>item.id==='etoile')}]);
 a.leaveShop();assert.equal(a.G.phase,'prepare');assert.equal(a.G.tableIdx,2);assert.equal(a.G.bank,before);
 a.openShop();const offers=a.offers,cost=a.itemCost(offers[0].data);
 d.querySelector('.shop-offer-info').click();assert(visible('inspectScreen'));assert.equal(a.G.bank,before);a.closeInspect();
 d.querySelector('.shop-purchase button').click();assert.equal(a.G.bank,before-cost);assert.equal(a.G.consumables.length,1);
 a.G._advanceUsed=true;a.G._adReroll=true;
 const reroll=a.rerollCost;
 a.leaveShop();assert.equal(a.G.contractChoices,choices);
 assert(d.getElementById('briefBalance').textContent.includes(a.cash(a.G.bank-a.RUN[3].entry)));
 assert.equal(d.getElementById('briefBalance').querySelector('span').textContent,'Après droit d’entrée');
 a.openShop();assert.equal(a.offers,offers);assert(a.offers[0].bought);
 assert.equal(a.rerollCost,reroll);assert(a.G._advanceUsed);assert(a.G._adReroll);
 d.querySelector('.shop-purchase button').click();assert.equal(a.G.bank,before-cost);
 a.rerollShop();assert.equal(a.G.bank,before-cost-reroll);
 const newOffers=a.offers,newReroll=a.rerollCost;assert(newReroll>reroll);
 a.leaveShop();a.openShop();assert.equal(a.offers,newOffers);assert.equal(a.rerollCost,newReroll);
 const sale=a.sellValue(a.G.consumables[0]);a.openShopSale();d.querySelector('.shop-sale-card').click();
 assert.equal(a.G.bank,before-cost-reroll+sale);assert.equal(a.G.consumables.length,0);
 a.leaveShop();const preview=a.ColdDeckJourney.previewNext();
 assert(d.getElementById('briefBalance').textContent.includes(a.cash(preview.table.goal)));
 assert(d.getElementById('briefPressure').textContent.includes(a.cash(preview.profit)));
 a.chooseContract(0);assert.equal(a.G.tableIdx,3);assert.equal(a.G.bank,preview.bank);
 assert.equal(a.G.table.goal,preview.table.goal);assert.equal(a.G.contract,choices[0]);assert(!visible('tableBrief'));
});
check('All upcoming tables show their own rule, boss state and contract reward before direct entry',()=>{
 for(let i=0;i<a.RUN_LEN-1;i++){
  a.startGame(i);a.chooseContract(0);a.G.bank=a.G.table.goal;
  a.G.bossState={wins:3,qualified:1,totals:[20,21]};a.finishTable();a.continueTableVictory();
  const nx=a.ColdDeckJourney.previewNext(),choices=a.G.contractChoices;
  assert.equal(d.getElementById('tableBrief').dataset.boss,String(nx.table.boss));
  assert.equal(d.getElementById('briefEffect').dataset.rule,nx.table.rule||'standard');
  assert.equal(d.getElementById('briefCashBtn').hidden,!a.RUN[i].boss);
  for(const choice of choices)assert.equal(choice.reward,Math.round((6+nx.table.zone*2)*a.CONTRACTS.find(c=>c.id===choice.id).weight));
  a.chooseContract(1);assert.equal(a.G.tableIdx,i+1);assert.equal(a.G.bank,nx.bank);
  assert.equal(a.G.table.goal,nx.table.goal);assert.equal(a.G.contract,choices[1]);assert(!visible('tableBrief'));
 }
});
check('Cash-out after a boss stays available on preparation and closes it exactly once',()=>{
 a.startGame(2);a.chooseContract(0);a.G.bank=a.G.table.goal;
 a.G.bossState={wins:3,qualified:1,totals:[20,21]};a.finishTable();a.continueTableVictory();
 assert(!d.getElementById('briefCashBtn').hidden);const bank=a.G.bank;
 a.cashOut();assert.equal(a.G.phase,'ended');assert(!visible('tableBrief'));assert(!visible('shop'));
 assert.equal(a.G.bank,bank);const rep=a.META.nuit.rep;assert(rep>0);a.cashOut();assert.equal(a.META.nuit.rep,rep);
});
check('The final boss celebrates before ending and banks reputation exactly once',()=>{
 a.startGame(23);a.chooseContract(0);a.G.bossState={wins:3,qualified:1,totals:[21]};a.G.bank=a.G.table.goal;
 assert(a.bossReady());a.finishTable();assert.equal(a.G.phase,'victory');
 assert.equal(a.META.nuit.rep,0);assert.equal(d.getElementById('victoryContinue').textContent,'Encaisser la réputation');
 a.continueTableVictory();assert.equal(a.G.phase,'ended');assert(!visible('tableVictory'));assert(!visible('draftScreen'));
 const reputation=a.META.nuit.rep;assert(reputation>0);a.continueTableVictory();a.endRun(true);assert.equal(a.META.nuit.rep,reputation);
});
check('Preparation projections use actual fees and capital, and block an unaffordable entry',()=>{
 for(const bank of [30,250,1000]){
  a.setTable(2);a.G.phase='prepare';a.G.preparingNext=true;a.G.contractPending=true;a.G.bank=bank;a.showTableBrief();
  const nx=a.ColdDeckJourney.previewNext(),base=a.RUN[3];
  assert.equal(nx.bank,Math.max(0,bank-base.entry));
  assert.equal(nx.table.goal,base.goal+Math.max(0,nx.bank-base.cap));
  assert.equal(nx.profit,nx.table.goal-nx.bank);assert.equal(nx.reserve,base.entry+base.min);
  assert.equal(d.querySelector('.contract-choice').disabled,bank<nx.reserve);
  assert(d.getElementById('briefBalance').textContent.includes(a.cash(nx.table.goal)));
  a.chooseContract(0);
  if(bank>=nx.reserve){assert.equal(a.G.tableIdx,3);assert.equal(a.G.table.goal,nx.table.goal);assert.equal(a.G.bank,nx.bank);}
  else{assert.equal(a.G.phase,'prepare');assert.equal(a.G.bank,bank);a.openShop();assert(!d.getElementById('shopNextBtn').disabled);a.leaveShop();}
 }
});
check('Delayed transitions cannot charge twice or enter a table after a new run starts',()=>{
 const interstitial=a.Ads.interstitial;let resume;
 a.Ads.interstitial=()=>({then(fn){resume=fn;}});
 try{
  a.startGame(2);a.chooseContract(0);a.G.bank=a.G.table.goal;a.G.bossState={wins:3,qualified:1,totals:[20,21]};
  a.finishTable();a.continueTableVictory();const bank=a.G.bank;
  a.chooseContract(0);assert.equal(a.G.phase,'transition');assert.equal(a.G.bank,bank);
  a.chooseContract(1);a.openShop();resume();
  assert.equal(a.G.tableIdx,3);assert.equal(a.G.bank,bank-a.RUN[3].entry);
  resume();assert.equal(a.G.tableIdx,3);assert.equal(a.G.bank,bank-a.RUN[3].entry);
  a.G.bank=a.G.table.goal;a.finishTable();a.continueTableVictory();a.chooseContract(0);
  a.startGame(0);const newBank=a.G.bank;resume();assert.equal(a.G.tableIdx,0);assert.equal(a.G.bank,newBank);
 }finally{a.Ads.interstitial=interstitial;}
});
check('All 24 automatic scenes are distinct, stable and do not consume game randomness',()=>{
 const b=a.ColdDeckBackgrounds;b.setAutomatic(true);const scenes=new Set(),shapes=new Set(),motifs=new Set();let calls=0;
 const random=h.w.Math.random;h.w.Math.random=()=>{calls++;return random();};
 try{
  for(const tb of a.RUN){
   b.applyTable(tb,false);const scene=d.getElementById('tableBackdrop').innerHTML;
   scenes.add(scene);b.applyTable(tb,false);assert.equal(d.getElementById('tableBackdrop').innerHTML,scene);
   motifs.add(b.circuitTheme(tb).motif);
   const shards=[...d.querySelectorAll('#tableBackdrop .background-shard')];
   shapes.add(shards.map(shard=>shard.style.clipPath).join('|'));
   for(const shard of shards){
    const x=[...shard.style.clipPath.matchAll(/(\d+(?:\.\d+)?)% \d+(?:\.\d+)?%/g)].map(match=>Number(match[1]));
    assert(x.length>=3);assert(x.every(v=>v<=18)||x.every(v=>v>=82));
   }
   assert.equal(d.getElementById('bg').dataset.background,'circuit-'+tb.i);
   assert.equal(d.getElementById('bg').dataset.circuitBoss,String(tb.boss));
   assert.equal(a.ColdDeckJourney.bossDistance(tb),2-tb.i%3);
  }
 }finally{h.w.Math.random=random;}
 assert.equal(scenes.size,24);assert.equal(shapes.size,24);assert.equal(motifs.size,24);assert(!motifs.has(undefined));
 for(let i=0;i<24;i+=3){
  const [first,second,boss]=a.RUN.slice(i,i+3).map(tb=>b.circuitTheme(tb));
  assert.equal(first.accent,second.accent);assert.notEqual(first.base,second.base);
  assert.equal(boss.edge,'#873c4b');assert.notEqual(boss.base,second.base);
 }
 assert.equal(calls,0);assert.equal(h.w.localStorage.getItem('colddeck-background'),null);
 b.select('minuit');assert.equal(b.automaticCircuit,false);b.setAutomatic(true);
 a.startEndless();assert.equal(d.getElementById('bg').dataset.background,'minuit');assert(d.getElementById('circuitProgress').hidden);
 a.startGame(4);assert.equal(d.getElementById('bg').dataset.background,'circuit-4');assert.equal(b.selected,'minuit');
 b.setAutomatic(false);assert.equal(d.getElementById('bg').dataset.background,'minuit');
 const reload=engine({storage:{'colddeck-background':'minuit','colddeck-circuit-backgrounds':'0'}});
 try{reload.api.startGame(4);assert.equal(reload.w.document.getElementById('bg').dataset.background,'minuit');}finally{reload.close();}
});
check('Entry and translated milestones reflect the live bankroll and reset across modes',()=>{
 a.startGame(4);a.G.bank=a.G.table.goal-33;a.showTableBrief();
 assert(d.getElementById('briefPressure').textContent.includes('33'));
 assert.equal(d.querySelector('.journey-step[aria-current="step"]').textContent,'TABLE 05');
 assert.equal(d.getElementById('briefTableLabel').textContent,'TABLE 05/24');
 a.setLang('en');assert(d.getElementById('briefPressure').textContent.includes('To earn'));
 a.chooseContract(0);a.G.bank=a.G.table.goal;a.finishTable();assert.equal(d.getElementById('victoryTitle').textContent,'WELL DONE!');
 a.setLang('fr');assert.equal(d.getElementById('victoryTitle').textContent,'BRAVO !');
 a.startEndless();assert(!visible('tableVictory'));assert(!visible('tableBrief'));assert(d.getElementById('circuitProgress').hidden);
 a.setup([card(10),card(7)],[card(10),card(6)],{phase:'victory',bank:100});a.resolve('stand');assert.equal(a.G.bank,100);
});
console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));h.close();

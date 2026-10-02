import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';
const h=engine({journeyUI:true,shopUI:true}),a=h.api,d=h.w.document,passed=[];
const check=(name,fn)=>{h.reset(432);fn();passed.push(name);};
const visible=id=>!!d.getElementById(id)?.classList.contains('show');
const content=node=>{const copy=node.cloneNode(true);copy.querySelectorAll('[aria-hidden="true"]').forEach(el=>el.remove());return copy.textContent.replace(/\s+/g,' ').trim();};

check('Victory explains each earned star independently, including an early win after a retry',()=>{
 for(const [retried,hand,earned] of [[false,8,[true,true,true]],[true,8,[true,false,true]],[false,9,[true,true,false]],[true,10,[true,false,false]]]){
  a.startGame(0);a.startPreparedTable();a.G.tableRetried=retried;a.G.hand=hand;a.G.bank=a.G.table.goal;a.finishTable();
  const stars=[...d.querySelectorAll('#victoryStars .victory-star')];
  assert.deepEqual(stars.map(star=>star.classList.contains('earned')),earned);
  assert.equal(earned.filter(Boolean).length,a.G.lastStars);
  for(const star of stars)assert.equal(star.querySelector('.rep-star').getAttribute('src'),'assets/illustrations/etoile.webp');
  assert.deepEqual(stars.map(star=>star.querySelector('.victory-star-label').textContent),['Objectif\natteint','Sans\nreprise','2 mains\nd’avance']);
  assert.equal(d.getElementById('victoryStars').getAttribute('role'),'list');
 }
});
check('Victory uses the live table, bank and reputation without awarding again on translation',()=>{
 a.startPreparedTable();a.G.bank=146;a.finishTable();
 assert.equal(d.getElementById('victoryLabel').textContent,'TABLE 01 REMPORTÉE');
 assert.equal(content(d.getElementById('victoryTitle')),'BRAVO !');
 assert.equal(content(d.getElementById('victoryTable')),'Arrière-salle');
 assert.deepEqual([...d.querySelectorAll('#victoryRewards strong')].map(content),['+ '+a.G.lastReward,'146 $']);
 assert.equal(d.querySelector('#victoryRewards .rep-star').getAttribute('src'),'assets/illustrations/etoile.webp');
 assert(d.querySelector('.victory-heading .victory-art'));assert(d.getElementById('victoryNext').hidden);
 const pot=a.G.pot;a.setLang('en');
 assert.equal(d.getElementById('victoryLabel').textContent,'TABLE 01 CLEARED');
 assert(content(d.getElementById('victoryRewards')).includes('Reputation earned'));assert.equal(a.G.pot,pot);
 a.setLang('fr');
});

check('Victory opens one preparation; one button starts the next table without visiting the shop',()=>{
 assert(d.getElementById('briefTools').hidden);
 a.startPreparedTable();a.G.bank=a.G.table.goal;a.finishTable();
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
 a.nextHandOrEnd();a.finishTable();a.resolve('stand');a.resolveSplit();a.deal();a.playerHit();a.playerStand();
 assert.equal(a.G.phase,'prepare');assert.equal(a.G.bank,bank);assert.equal(a.G.pot,pot);
 a.continueTableVictory();assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);assert.equal(a.G.pot,pot);
 assert.equal(d.querySelector('.contract-choice'),null);
 d.getElementById('briefEnterBtn').click();
 assert.equal(a.G.tableIdx,1);assert.equal(a.G.phase,'bet');assert(!visible('tableBrief'));assert(!visible('shop'));
 assert.equal(a.G.bank,bank-a.RUN[1].entry);
 a.startPreparedTable();assert.equal(a.G.tableIdx,1);
 a.G.bank=a.G.table.goal;a.finishTable();a.continueTableVictory();
 assert.equal(a.G.phase,'prepare');assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,0);
});
check('Optional shop keeps offers, purchases, reroll cost across returns',()=>{
 a.startGame(2);a.startPreparedTable();a.G.bank=a.G.table.goal+200;
 a.G.bossState={wins:3,qualified:1,totals:[20,21]};a.finishTable();a.continueTableVictory();
 const before=a.G.bank;
 assert(!d.getElementById('briefCashBtn').hidden);
 a.openShop();assert(visible('shop'));assert(!visible('tableBrief'));assert.equal(a.G.bank,before);
 assert.equal(d.getElementById('shopNextObj'),null);
 assert.equal(d.getElementById('shopNextBtn').textContent.trim(),'Retour à la préparation');
 a.setOffers([{type:'tarot',data:a.TAROT_POOL.find(item=>item.id==='etoile')}]);
 a.leaveShop();assert.equal(a.G.phase,'prepare');assert.equal(a.G.tableIdx,2);assert.equal(a.G.bank,before);
 a.openShop();const offers=a.offers,cost=a.itemCost(offers[0].data);
 assert.equal(d.querySelector('#shopItems .shop-kind .rep-star').getAttribute('src'),'assets/illustrations/etoile.webp');
 d.querySelector('.shop-offer-info').click();assert(visible('inspectScreen'));assert.equal(a.G.bank,before);a.closeInspect();
 d.querySelector('.shop-purchase button').click();assert.equal(a.G.bank,before-cost);assert.equal(a.G.consumables.length,1);
 a.G._advanceUsed=true;a.G._adReroll=true;
 const reroll=a.rerollCost;
 a.leaveShop();assert(a.G.briefPending);
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
 a.startPreparedTable();assert.equal(a.G.tableIdx,3);assert.equal(a.G.bank,preview.bank);
 assert.equal(a.G.table.goal,preview.table.goal);assert(!visible('tableBrief'));
});
check('All upcoming tables show their own rule, boss state before direct entry',()=>{
 for(let i=0;i<a.RUN_LEN-1;i++){
  a.startGame(i);a.startPreparedTable();a.G.bank=a.G.table.goal;
  a.G.bossState={wins:3,qualified:1,totals:[20,21]};a.finishTable();a.continueTableVictory();
  const nx=a.ColdDeckJourney.previewNext();
  assert.equal(d.getElementById('tableBrief').dataset.boss,String(nx.table.boss));
  assert.equal(d.getElementById('briefEffect').dataset.rule,nx.table.rule||'standard');
  assert.equal(d.getElementById('briefCashBtn').hidden,!a.RUN[i].boss);
  a.startPreparedTable();assert.equal(a.G.tableIdx,i+1);assert.equal(a.G.bank,nx.bank);
  assert.equal(a.G.table.goal,nx.table.goal);assert(!visible('tableBrief'));
 }
});
check('Cash-out after a boss stays available on preparation and closes it exactly once',()=>{
 a.startGame(2);a.startPreparedTable();a.G.bank=a.G.table.goal;
 a.G.bossState={wins:3,qualified:1,totals:[20,21]};a.finishTable();a.continueTableVictory();
 assert(!d.getElementById('briefCashBtn').hidden);const bank=a.G.bank;
 a.cashOut();assert.equal(a.G.phase,'ended');assert(!visible('tableBrief'));assert(!visible('shop'));
 assert.equal(a.G.bank,bank);const rep=a.META.nuit.rep;assert(rep>0);a.cashOut();assert.equal(a.META.nuit.rep,rep);
});
check('The final boss celebrates before ending and banks reputation exactly once',()=>{
 a.startGame(23);a.startPreparedTable();a.G.bossState={wins:3,qualified:1,totals:[21]};a.G.bank=a.G.table.goal;
 assert(a.bossReady());a.finishTable();assert.equal(a.G.phase,'victory');
 assert.equal(a.META.nuit.rep,0);assert.equal(d.getElementById('victoryContinue').textContent,'Encaisser la réputation');
 a.continueTableVictory();assert.equal(a.G.phase,'ended');assert(!visible('tableVictory'));assert(!visible('draftScreen'));
 const reputation=a.META.nuit.rep;assert(reputation>0);a.continueTableVictory();a.endRun(true);assert.equal(a.META.nuit.rep,reputation);
});
check('Preparation projections use actual fees and capital, and block an unaffordable entry',()=>{
 for(const bank of [30,250,1000]){
  a.setTable(2);a.G.phase='prepare';a.G.preparingNext=true;a.G.briefPending=true;a.G.bank=bank;a.showTableBrief();
  const nx=a.ColdDeckJourney.previewNext(),base=a.RUN[3];
  assert.equal(nx.bank,Math.max(0,bank-base.entry));
  assert.equal(nx.table.goal,base.goal+Math.max(0,nx.bank-base.cap));
  assert.equal(nx.profit,nx.table.goal-nx.bank);assert.equal(nx.reserve,base.entry+base.min);
  assert.equal(d.getElementById('briefEnterBtn').disabled,bank<nx.reserve);
  assert(d.getElementById('briefBalance').textContent.includes(a.cash(nx.table.goal)));
  a.startPreparedTable();
  if(bank>=nx.reserve){assert.equal(a.G.tableIdx,3);assert.equal(a.G.table.goal,nx.table.goal);assert.equal(a.G.bank,nx.bank);}
  else{assert.equal(a.G.phase,'prepare');assert.equal(a.G.bank,bank);a.openShop();assert(!d.getElementById('shopNextBtn').disabled);a.leaveShop();}
 }
});
check('Delayed transitions cannot charge twice or enter a table after a new run starts',()=>{
 const interstitial=a.Ads.interstitial;let resume;
 a.Ads.interstitial=()=>({then(fn){resume=fn;}});
 try{
  a.startGame(2);a.startPreparedTable();a.G.bank=a.G.table.goal;a.G.bossState={wins:3,qualified:1,totals:[20,21]};
  a.finishTable();a.continueTableVictory();const bank=a.G.bank;
  a.startPreparedTable();assert.equal(a.G.phase,'transition');assert.equal(a.G.bank,bank);
  a.startPreparedTable();a.openShop();resume();
  assert.equal(a.G.tableIdx,3);assert.equal(a.G.bank,bank-a.RUN[3].entry);
  resume();assert.equal(a.G.tableIdx,3);assert.equal(a.G.bank,bank-a.RUN[3].entry);
  a.G.bank=a.G.table.goal;a.finishTable();a.continueTableVictory();a.startPreparedTable();
  a.startGame(0);const newBank=a.G.bank;resume();assert.equal(a.G.tableIdx,0);assert.equal(a.G.bank,newBank);
 }finally{a.Ads.interstitial=interstitial;}
});
check('Automatic scenes reuse the first collection unchanged, stay stable and do not consume game randomness',()=>{
 const b=a.ColdDeckBackgrounds;b.setAutomatic(true);const scenes=new Set(),sources=new Set();let calls=0;
 const originalIds=['classic','minuit','obsidienne','prune','sapin','bordeaux','petrole','ardoise','cuivre','indigo','aubergine','emeraude','doree','acier','terre','lagune','grenat','lilas','carbone','bouteille','crepuscule'];
 const random=h.w.Math.random;h.w.Math.random=()=>{calls++;return random();};
 try{
  for(const tb of a.RUN){
   b.applyTable(tb,false);const scene=d.getElementById('tableBackdrop').innerHTML;
   scenes.add(scene);b.applyTable(tb,false);assert.equal(d.getElementById('tableBackdrop').innerHTML,scene);
   const theme=b.circuitTheme(tb),original=b.themes.find(item=>item.id===theme.sourceId);
   assert(originalIds.includes(theme.sourceId));sources.add(theme.sourceId);
   for(const key of ['base','edge','fold','accent','second','index','classic'])assert.equal(theme[key],original[key]);
   const preview=d.querySelector('[data-background-id="'+theme.sourceId+'"] .background-preview');
   assert.equal(scene,original.classic?'':preview.innerHTML);
   assert.equal(d.getElementById('bg').dataset.background,original.classic?'classic':'circuit-'+tb.i);
   assert.equal(d.getElementById('bg').dataset.circuitBoss,String(tb.boss));
   assert.equal(a.ColdDeckJourney.bossDistance(tb),2-tb.i%3);
  }
 }finally{h.w.Math.random=random;}
 assert.equal(scenes.size,originalIds.length);assert.equal(sources.size,originalIds.length);
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
 a.startPreparedTable();a.G.bank=a.G.table.goal;a.finishTable();assert.equal(content(d.getElementById('victoryTitle')),'WELL DONE!');
 a.setLang('fr');assert.equal(content(d.getElementById('victoryTitle')),'BRAVO !');
 a.startEndless();assert(!visible('tableVictory'));assert(!visible('tableBrief'));assert(d.getElementById('circuitProgress').hidden);
 a.setup([card(10),card(7)],[card(10),card(6)],{phase:'victory',bank:100});a.resolve('stand');assert.equal(a.G.bank,100);
});
console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));h.close();

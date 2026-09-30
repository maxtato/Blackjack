import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';
const h=engine({journeyUI:true}),a=h.api,d=h.w.document,passed=[];
const check=(name,fn)=>{h.reset(432);fn();passed.push(name);};
const visible=id=>d.getElementById(id).classList.contains('show');

check('Victory precedes earned cards and shopping; repeated callbacks cannot pay twice',()=>{
 a.chooseContract(0);a.G.bank=a.G.table.goal;a.finishTable();
 assert.equal(a.G.phase,'victory');assert(visible('tableVictory'));assert(!visible('shop'));assert(!visible('draftScreen'));
 assert.equal(a.G.draftLeft,0);assert.equal(a.G.relics.length,0);assert.equal(a.G.consumables.length,1);
 const bank=a.G.bank,pot=a.G.pot,stars=a.G.runStars;
 a.finishTable();a.nextHandOrEnd();a.resolve('stand');a.resolveSplit();a.deal();a.playerHit();a.playerStand();
 assert.equal(a.G.bank,bank);assert.equal(a.G.pot,pot);assert.equal(a.G.runStars,stars);
 assert.equal(a.G.phase,'victory');
 a.continueTableVictory();assert.equal(a.G.phase,'draft');assert(!visible('tableVictory'));
 a.continueTableVictory();assert.equal(a.G.draftLeft,1);a.chooseStarter(0);
 assert.equal(a.G.phase,'shop');assert(visible('shop'));
 a.G.bank--;a.nextHandOrEnd();assert.equal(a.G.phase,'shop');a.G.bank++;
 a.continueTableVictory();assert.equal(a.G.relics.length,1);assert.equal(a.G.pot,pot);
 a.leaveShop();assert.equal(a.G.tableIdx,1);assert(visible('tableBrief'));assert.equal(a.G.phase,'bet');
 a.chooseContract(0);a.G.bank=a.G.table.goal;a.finishTable();assert.equal(a.G.phase,'victory');
 a.continueTableVictory();assert.equal(a.G.phase,'shop');assert.equal(a.G.relics.length,1);
});
check('The final boss celebrates before ending and banks reputation exactly once',()=>{
 a.startGame(23);a.chooseContract(0);a.G.bossState={wins:3,qualified:1,totals:[21]};a.G.bank=a.G.table.goal;
 assert(a.bossReady());a.finishTable();assert.equal(a.G.phase,'victory');
 assert.equal(a.META.nuit.rep,0);assert.equal(d.getElementById('victoryContinue').textContent,'Encaisser la réputation');
 a.continueTableVictory();assert.equal(a.G.phase,'ended');assert(!visible('tableVictory'));assert(!visible('draftScreen'));
 const reputation=a.META.nuit.rep;assert(reputation>0);a.continueTableVictory();a.endRun(true);assert.equal(a.META.nuit.rep,reputation);
});
check('Shop projections use actual fees, purchases and capital without changing the goal rules',()=>{
 for(const bank of [30,250,1000]){
  a.setTable(2);a.G.phase='shop';a.G.bank=bank;a.renderShopHead();
  const nx=a.ColdDeckJourney.previewNext(),base=a.RUN[3];
  assert.equal(nx.bank,Math.max(0,bank-base.entry));
  assert.equal(nx.table.goal,base.goal+Math.max(0,nx.bank-base.cap));
  assert.equal(nx.profit,nx.table.goal-nx.bank);assert.equal(nx.reserve,base.entry+base.min);
  assert.equal(d.getElementById('shopNextBtn').disabled,bank<nx.reserve);
  assert(d.getElementById('shopNextObj').textContent.includes(a.t('journey.totalGoal',a.cash(nx.table.goal))));
  if(bank>=nx.reserve){a.setTable(3);a.enterTable(1);assert.equal(a.G.table.goal,nx.table.goal);assert.equal(a.G.bank,nx.bank);}
 }
 a.setTable(0);a.G.phase='shop';a.G.bank=200;a.renderShopHead();
 const item=a.TAROT_POOL.find(item=>item.id==='etoile');a.setOffers([{type:'tarot',data:item}]);
 const before=a.G.bank;a.buyShopItem(0);assert(a.G.bank<before);
 const nx=a.ColdDeckJourney.previewNext();assert(d.getElementById('shopNextObj').textContent.includes('Objectif total'));
 assert.equal(nx.table.goal,a.RUN[1].goal+Math.max(0,a.G.bank-a.RUN[1].cap));
});
check('All 24 automatic scenes are distinct, stable and do not consume game randomness',()=>{
 const b=a.ColdDeckBackgrounds;b.setAutomatic(true);const scenes=new Set();let calls=0;
 const random=h.w.Math.random;h.w.Math.random=()=>{calls++;return random();};
 try{
  for(const tb of a.RUN){
   b.applyTable(tb,false);const scene=d.getElementById('tableBackdrop').innerHTML;
   scenes.add(scene);b.applyTable(tb,false);assert.equal(d.getElementById('tableBackdrop').innerHTML,scene);
   assert.equal(d.getElementById('bg').dataset.background,'circuit-'+tb.i);
   assert.equal(d.getElementById('bg').dataset.circuitBoss,String(tb.boss));
   assert.equal(a.ColdDeckJourney.bossDistance(tb),2-tb.i%3);
  }
 }finally{h.w.Math.random=random;}
 assert.equal(scenes.size,24);assert.equal(calls,0);assert.equal(h.w.localStorage.getItem('colddeck-background'),null);
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

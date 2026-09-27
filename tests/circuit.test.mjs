import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';
const h=engine(),a=h.api,results=[];
const check=(name,fn)=>{h.reset(123);fn();results.push(name);};
const relic=id=>({...a.RELIC_POOL.find(r=>r.id===id),_paid:0});
const tarot=id=>({...a.TAROT_POOL.find(r=>r.id===id),_paid:10});
check('Soft Aces and remaining-shoe odds',()=>{
 a.G.shoe=['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(card);
 assert.equal(a.bustChance([card('A'),card(6)]),0);
 a.G.shoe=[card(10),card('K'),card(2),card('A')];assert.equal(a.bustChance([card(10),card(7)]),50);
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
 assert.equal(a.G.phase,'shop');assert.equal(a.G.baraka,0);
});
check('Gift resale is fixed and editions never overwrite',()=>{
 const free=a.G.relics[0],early=a.sellValue(free);a.setTable(23);assert.equal(a.sellValue(free),early);assert.equal(early,0);
 a.G.pHand=[card(7,'♠','poly'),card(5,'♥','holo')];assert.equal(a.addEditionToHand('foil'),false);assert.equal(a.G.pHand[0].ed,'poly');
});
check('Stars use decisions; reached and won records are distinct',()=>{
 a.G.tableRetried=false;a.G.contract.done=false;assert.equal(a.starsFor(a.G.table,a.G.table.goal),2);
 a.G.contract.done=true;assert.equal(a.starsFor(a.G.table,a.G.table.goal),3);a.G.tableRetried=true;assert.equal(a.starsFor(a.G.table,a.G.table.goal),2);
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
check('Scaled FOIL, incomes and powers stay useful at depth',()=>{
 a.setTable(23);a.G.bet=10000;a.G.phase='play';a.G.pHand=[card(10,'♠','foil'),card(8)];assert.equal(a.computeMult('stand').bonusChips,1500);
 a.G.relics=[relic('compteur'),relic('phare')];a.G.shoe=[...Array.from({length:50},()=>card(9)),card(2),card('K')];assert(a.relicPower('compteur'));assert.equal(a.G.shoe.at(-1).r,'2');assert(!a.relicPower('compteur'));
 assert(a.relicPower('phare'));assert(a.G.smallNext);assert(!a.relicPower('phare'));
});
console.log(JSON.stringify({passed:results.length,checks:results},null,2));h.close();

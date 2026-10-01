import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';
const h=engine({eventUI:true}),a=h.api,d=h.w.document,passed=[];
const check=(name,fn)=>{h.reset(123);fn();passed.push(name);};
const event=id=>a.HAND_EVENTS.find(e=>e.id===id)||{id};

check('Special rules appear at random intervals of 3 to 8 rounds across tables',()=>{
 for(const endless of [false,true]){
  a.freshGame();a.G.endless=endless;
  let last=0,previous=null;const intervals=new Set();
  for(let round=1;round<=500;round++){
   a.G.tableIdx=Math.floor((round-1)/10);a.G.hand=(round-1)%10+1;
   a.rollHandEvent();const selected=a.G.event,countdown=a.G.eventCountdown;
   a.rollHandEvent();assert.equal(a.G.event,selected);assert.equal(a.G.eventCountdown,countdown);
   if(selected){
    const gap=round-last;assert(gap>=3&&gap<=8,`gap ${gap}`);intervals.add(gap);
    assert.notEqual(selected.id,previous);previous=selected.id;last=round;
   }
  }
  assert.equal(intervals.size,6);assert(500-last<8);
 }
 assert(!a.HAND_EVENTS.some(e=>['doree','etoile'].includes(e.id)));
 assert.equal(a.HAND_EVENTS.length,8);
});
check('The frequent-rules perk stays between three and five rounds',()=>{
 a.freshGame();a.G.endless=true;a.G.boons.evt3=true;
 let last=0;
 for(let hand=1;hand<=150;hand++){
  a.G.hand=hand;a.rollHandEvent();
  if(a.G.event){assert(hand-last>=3&&hand-last<=5);last=hand;}
 }
});
check('A Free Play tier transition counts the next hand for the special rule',()=>{
 a.startEndless();a.G.eventCountdown=1;a.G.bank=a.palierTarget(a.G.palier);
 a.reachPalier();const id=a.G.boonChoices[0].id;a.applyBoon(id);
 assert(a.G.event);assert.equal(a.G.hand,2);
});
check('Forced bets always use the highest affordable amount and keep the committed stake',()=>{
 for(const bank of [5,9,10,24,25,100]){
  a.setup([],[],{phase:'bet',betChosen:true,bank,baraka:4});
  const allowed=a.betChoices().filter(n=>n<=bank),expected=Math.max(...allowed);
  a.G.event=event('forcee');a.clampBet();assert.equal(a.G.bet,expected);
  assert.deepEqual(Array.from(a.betChoices()),[expected]);assert(a.G.bet<=bank);
  a.G.phase='play';a.G.bank-=expected;
  assert.deepEqual(Array.from(a.betChoices()),[expected]);
 }
 a.G.event=null;a.G.phase='bet';assert(a.betChoices().length>1);
});
check('Golden hands double only winnings, including doubled bets and both split hands',()=>{
 for(const endless of [false,true])for(const stakeMult of [1,2]){
  const settle=gold=>{
   a.setup([card(10),card(9)],[card(10),card(7)],{bank:80,stakeMult,endless,event:gold?event('doree'):null});
   a.resolve('stand');return {bank:a.G.bank,gain:h.w.__result.gain};
  };
  const plain=settle(false),gold=settle(true);
  assert.equal(gold.gain,plain.gain*2);assert.equal(gold.bank,plain.bank+plain.gain);
 }
 const split=gold=>{
  const hands=[[card(10),card(8)],[card(10),card(9)]];
  a.setup(hands[0],[card(10),card(7)],{bank:80,splitActive:true,hands,event:gold?event('doree'):null});
  a.resolveSplit();return a.G.bank;
 };
 const plain=split(false);assert.equal(split(true),100+(plain-100)*2);
 for(const dealer of [18,20]){
  const settle=gold=>{
   a.setup([card(10),card(8)],[card(10),card(dealer-10)],{bank:90,event:gold?event('doree'):null});
   a.resolve('stand');return a.G.bank;
  };
  assert.equal(settle(true),settle(false));
 }
});
check('Tipsy dealer temporarily stands at 16 even on a dealer-18 table',()=>{
 for(const special of [false,true]){
  a.setup([card(10),card(9)],[card(10),card(6)],{phase:'dealer',event:special?event('pompette'):null,shoe:Array.from({length:60},()=>card(2))});
  a.G.table={...a.G.table,rule:'gros'};a.dealerPlay();h.clock.tick(550);
  assert.equal(a.G.dHand.length,special?2:3);
  a.GameClock.clear();
 }
});
check('An event remains announced before betting and can be inspected during the hand',()=>{
 a.setup([],[],{phase:'bet',betChosen:true,event:event('forcee'),bank:80});
 a.announceTurn();const popup=d.getElementById('turnPop');
 assert(popup.classList.contains('event-ready'));assert(popup.textContent.includes(a.t('evt.forcee.d')));
 h.clock.tick(8000);assert(popup.classList.contains('go'));
 a.deal();assert(!popup.classList.contains('go'));assert.equal(a.G.bank,80-a.G.bet);
 a.openTableRules();assert(d.getElementById('inspectBody').textContent.includes(a.t('evt.forcee.d')));a.closeInspect();
});
check('Retries and table entry discard the previous event without changing reputation or saved upgrades',()=>{
 a.startPreparedTable();a.G.event=event('forcee');a.G.pot=24;a.G.phase='lost';
 a.retryTable();assert.equal(a.G.event,null);assert.equal(a.G.hand,1);assert.equal(a.G.pot,24);assert(a.betChoices().length>1);
 a.G.event=event('doree');a.G.bank=a.G.table.goal;a.finishTable();
 const reward=a.G.lastReward,pot=a.G.pot;assert.equal(pot,24+reward);
 a.continueTableVictory();assert.equal(a.G.event,null);a.startPreparedTable();assert.equal(a.G.event,null);assert.equal(a.G.pot,pot);
});
console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));h.close();

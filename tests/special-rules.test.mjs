import assert from 'node:assert/strict';
import fs from 'node:fs';
import {engine,card,root} from './engine.mjs';
const h=engine({eventUI:true,handUI:true}),a=h.api,d=h.w.document,passed=[];
const check=(name,fn)=>{h.reset(123);fn();passed.push(name);};
const event=id=>a.HAND_EVENTS.find(e=>e.id===id);
const stack=(...order)=>Array.from({length:40},()=>card(2)).concat(order.reverse());
function deal(id,order,rule=null){
 a.setup([],[],{phase:'bet',betChosen:true,event:event(id),bank:100,shoe:stack(...order)});
 a.G.table={...a.G.table,rule};a.deal();
}
const total=el=>el.querySelector('.sr-only')?.textContent??el.textContent;
check('Open Game reveals both dealer cards and their total, including on a hidden table',()=>{
 for(const rule of [null,'mute']){
  deal('ouvert',[card(10),card(8),card(6),card(9)],rule);h.clock.tick(3130);
  assert.equal(a.G.phase,'play');assert.equal(total(d.getElementById('dVal')),'17');
  assert.equal(d.querySelectorAll('#dHand .card.back').length,0);
  a.renderHands();assert.equal(total(d.getElementById('dVal')),'17');
  a.playerStand();h.clock.tick(1000);assert.equal(a.G.phase,'done');a.GameClock.clear();
 }
});
check('Fog never flashes dealer faces or total during dealing and reveals them at settlement',()=>{
 deal('brouillard',[card(10),card(8),card(6),card(9)]);
 for(let i=0;i<25;i++){
  h.clock.tick(100);
  assert.equal(total(d.getElementById('dVal')),'?');
  assert.equal(d.querySelectorAll('#dHand .flipwrap').length,0);
  assert.equal(d.querySelectorAll('#dHand .card:not(.back)').length,0);
 }
 assert.equal(a.G.phase,'play');assert.equal(d.getElementById('dHand').children.length,2);
 a.playerStand();h.clock.tick(1000);assert.equal(a.G.phase,'done');
 assert.equal(total(d.getElementById('dVal')),'17');
});
check('Boss Favor deals an Ace from the shoe and keeps its edition',()=>{
 const ace=card('A','♥','poly');
 deal('patron',[card(8),card(7),card(6),card(9),ace]);h.clock.tick(3130);
 assert.equal(a.G.pHand[0].r,'A');assert.equal(a.G.pHand[0].ed,'poly');
 assert(!a.G.shoe.includes(ace));assert.equal(a.G.shoe.length,41);
});
check('Three to Start deals all three cards before a decision even after an initial 21',()=>{
 deal('trois',[card('A'),card(8),card('K'),card(9),card(5)]);h.clock.tick(4000);
 assert.equal(a.G.pHand.length,3);assert.equal(a.handValue(a.G.pHand).total,16);
 assert.equal(a.G.phase,'play');assert.equal(a.G._dealing,false);
 assert(!d.querySelector('[data-game-action="double"]'));
 assert(!d.querySelector('[data-game-action="split"]'));
});
check('An opening three-card bust resolves once and gives the player no action window',()=>{
 deal('trois',[card('K'),card(8),card('Q'),card(9),card(5)]);
 h.clock.tick(3600);assert.equal(a.G._settling,true);
 assert(!d.querySelector('[data-game-action="stand"]'));
 assert(!d.querySelector('[data-game-action="hit"]'));
 h.clock.tick(500);assert.equal(a.G.phase,'done');assert.equal(a.G.stats.played,1);
 assert.equal(h.w.__result.kind,'lose');assert.equal(h.w.__result.bust,true);
 assert.equal(a.G.bank,90);
});
check('An opening three-card 21 pays as a perfect 21, never as a natural blackjack',()=>{
 deal('trois',[card(7),card(10),card(7),card(8),card(7)]);
 h.clock.tick(5000);assert.equal(a.G.phase,'done');
 assert.equal(h.w.__result.natural,false);assert.equal(h.w.__result.kind,'win');
});
check('Quick Duel blocks every extra-card action in both the UI and engine',()=>{
 for(const ranks of [[8,8],[5,5],[10,9]]){
  a.setup(ranks.map(r=>card(r)),[card(10),card(7)],{event:event('express'),shoe:stack(card(2)),bank:100});
  a.renderActions();const cards=a.G.pHand.slice(),bank=a.G.bank,shoe=a.G.shoe.length;
  assert.deepEqual(Array.from(d.querySelectorAll('[data-game-action]'),el=>el.dataset.gameAction),['stand']);
  a.playerHit();a.playerDouble();a.playerSplit();a.forcerChance();
  assert.deepEqual(a.G.pHand,cards);assert.equal(a.G.bank,bank);assert.equal(a.G.shoe.length,shoe);
  a.playerStand();h.clock.tick(1000);assert.equal(a.G.phase,'done');a.GameClock.clear();
 }
});
check('Small Bet imposes the minimum and preserves it after the stake is committed',()=>{
 a.setup([],[],{phase:'bet',event:event('petite'),bank:100,bet:25});
 a.clampBet();assert.equal(a.G.bet,a.G.table.min);
 assert.deepEqual(Array.from(a.betChoices()),[a.G.table.min]);
 a.deal();const stake=a.G.bet;assert.equal(a.G.bank,100-stake);
 a.G.baraka=8;a.clampBet();assert.equal(a.G.bet,stake);
});
check('Every new rule has French and English copy and its own existing illustration',()=>{
 const paths=new Set();
 for(const id of ['ouvert','patron','trois','brouillard','express','petite']){
  assert(event(id));assert(a.STR.fr['evt.'+id+'.t']);assert(a.STR.en['evt.'+id+'.d']);
  a.setup([],[],{phase:'bet',event:event(id)});a.announceTurn();
  const src=d.querySelector('#turnPop .hand-event-illustration').getAttribute('src');
  assert(fs.existsSync(root+'/'+src));assert(!paths.has(src));paths.add(src);
 }
});
console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));h.close();

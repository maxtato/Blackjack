import assert from 'node:assert/strict';
import {engine} from './engine.mjs';
const h=engine({endUI:true,journeyUI:true}),a=h.api,d=h.w.document,passed=[];
const content=node=>{const copy=node.cloneNode(true);copy.querySelectorAll('[aria-hidden="true"]').forEach(el=>el.remove());return copy.textContent.replace(/\s+/g,' ').trim();};
const text=id=>content(d.getElementById(id));
const check=(name,fn)=>{h.reset(123);a.setLang('fr');fn();passed.push(name);};
check('A zero-result Circuit displays the mockup with actual data and four compact stats',()=>{
 a.startPreparedTable();a.G.bank=0;a.G.stats={won:0,played:4,bestGain:0,bestMult:1};a.endRun(false);
 assert(d.getElementById('endScreen').classList.contains('circuit-end'));
 assert.equal(d.querySelectorAll('#endTitle .end-title-line').length,2);
 assert.equal(text('endTitle'),'FIN DE CIRCUIT');assert(text('endProgress').includes('0 / 24'));
 assert(text('endMessage').includes('115 $'));assert.equal(text('endRepEarned'),'+ 0');assert.equal(text('endRepTotal'),'0');
 assert.deepEqual([...d.querySelectorAll('#endStats .v')].map(content),['0 / 4','0 $','0 $','×1']);
 assert(text('endRecord').includes('80 $'));assert(d.getElementById('endText').hidden);
});
check('Earned reputation includes the vault and stays distinct from the saved balance',()=>{
 a.META.nuit.rep=350;a.startPreparedTable();a.G.pot=48;a.G.runStars=6;a.G.tableStars=[3,3];a.G.bank=280;
 a.endRun(true);const e=a.G.endInfo,gain=e.baseGain+e.coffre;
 assert(e.coffre>0);assert.equal(text('endRepEarned'),'+ '+gain);assert.equal(text('endRepTotal'),String(350+gain));
 const paid=a.META.nuit.rep;a.renderEndScreen();a.setLang('en');
 assert.equal(a.META.nuit.rep,paid);assert.equal(text('endTitle'),'CASH OUT');assert(text('endProgress').includes('tables cleared'));
 assert(text('endStats').includes('Cash remaining'));assert.equal(content(d.querySelector('#endStats .rs:nth-child(2) .v')),'$280');
 const reward=a.Ads.rewarded;a.Ads.rewarded=()=>({then(fn){fn(true);}});
 try{a.adDoubleRep();assert.equal(a.META.nuit.rep,paid+gain);assert.equal(text('endRepEarned'),'+ '+gain*2);assert.equal(text('endRepTotal'),String(paid+gain));}
 finally{a.Ads.rewarded=reward;}
});
check('A full Circuit shows a completion title and Free Play retains its own result',()=>{
 a.startPreparedTable();a.G.tableStars=Array(24).fill(3);a.G.pot=600;a.G.runStars=72;a.endRun(true);
 assert.equal(text('endTitle'),'CIRCUIT TERMINÉ');assert(text('endProgress').includes('24 / 24'));
 a.startEndless();a.endRun(true);
 assert(!d.getElementById('endScreen').classList.contains('circuit-end'));
 assert(d.getElementById('endCircuitSummary').hidden);assert(d.getElementById('endRecord').hidden);assert(!d.getElementById('endText').hidden);
 assert.equal(d.querySelectorAll('#endStats .rs').length,3);
});
check('The preparation shop keeps one label with a forward arrow and opens the same optional shop',()=>{
 a.startPreparedTable();a.G.bank=a.G.table.goal;a.finishTable();a.continueTableVictory();
 const button=d.getElementById('briefShopBtn');
 assert.equal(button.children.length,3);assert(button.firstElementChild.classList.contains('brief-shop-icon'));
 assert.equal(content(button.querySelector('.brief-shop-label')),a.t('shop.open'));
 assert.equal(button.lastElementChild.dataset.direction,'right');
 a.openShop();assert.equal(a.G.phase,'shop');a.leaveShop();assert.equal(a.G.phase,'prepare');
});
console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));h.close();

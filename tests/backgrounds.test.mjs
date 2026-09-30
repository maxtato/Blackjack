import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';

const h=engine(),a=h.api,backgrounds=a.ColdDeckBackgrounds,passed=[];
const check=(name,fn)=>{fn();passed.push(name);};
h.reset(987);

check('Twenty new backgrounds and the original can all be selected; unknown choices are ignored',()=>{
 assert.equal(backgrounds.themes.filter(theme=>!theme.classic).length,20);
 const grid=h.w.document.getElementById('backgroundGrid'),scenes=new Set();
 assert.equal(grid.children.length,21);
 for(const theme of backgrounds.themes){
  assert(backgrounds.select(theme.id));assert.equal(backgrounds.selected,theme.id);
  assert.equal(h.w.document.getElementById('bg').dataset.background,theme.id);
  assert.equal(grid.querySelectorAll('[aria-pressed="true"]').length,1);
  assert.equal(grid.querySelector('[aria-pressed="true"]').dataset.backgroundId,theme.id);
  if(!theme.classic)scenes.add(h.w.document.getElementById('tableBackdrop').innerHTML);
 }
 assert.equal(scenes.size,20);
 const before=h.w.document.getElementById('tableBackdrop').innerHTML;
 assert.equal(backgrounds.select('missing'),false);assert.equal(h.w.document.getElementById('tableBackdrop').innerHTML,before);
 assert(backgrounds.select('classic'));assert.equal(h.w.document.getElementById('tableBackdrop').children.length,0);
});

check('Background selection survives reloads and game mode changes without changing progress',()=>{
 backgrounds.select('petrole');const selected=h.w.localStorage.getItem('colddeck-background');
 const reload=engine({storage:{'colddeck-background':selected}});
 try{assert.equal(reload.api.ColdDeckBackgrounds.selected,'petrole');}finally{reload.close();}
 const invalid=engine({storage:{'colddeck-background':'missing'}});
 try{assert.equal(invalid.api.ColdDeckBackgrounds.selected,'classic');}finally{invalid.close();}
 a.startEndless();assert.equal(backgrounds.selected,'petrole');a.startGame(0);assert.equal(backgrounds.selected,'petrole');
});

check('Selecting scenery leaves the hand and random stream untouched and keeps all game time paused',()=>{
 a.setup([card(10),card(8)],[card(10),card(7)]);
 const state=()=>JSON.stringify({bank:a.G.bank,phase:a.G.phase,player:a.G.pHand,dealer:a.G.dHand,shoe:a.G.shoe,baraka:a.G.baraka});
 const before=state();let fired=false,calls=0;
 a.GameClock.delay(()=>{fired=true;},250);a.openPause();assert(backgrounds.open());
 const random=h.w.Math.random;h.w.Math.random=()=>{calls++;return random();};
 try{backgrounds.select('grenat');}finally{h.w.Math.random=random;}
 assert.equal(calls,0);assert.equal(state(),before);h.clock.tick(1000);assert.equal(fired,false);
 backgrounds.close();assert(h.w.document.getElementById('pauseScreen').classList.contains('show'));
 h.clock.tick(1000);assert.equal(fired,false);a.resumeGame();h.clock.tick(249);assert.equal(fired,false);h.clock.tick(1);assert(fired);
 assert.equal(backgrounds.open(),false);
});

check('Changing language updates background names and keeps the selected preview',()=>{
 backgrounds.select('minuit');a.setLang('en');
 const name=()=>h.w.document.querySelector('[data-background-id="minuit"] .background-name').textContent;
 assert.equal(name(),'Midnight');a.setLang('fr');assert.equal(name(),'Minuit');
 assert.equal(h.w.document.querySelector('#backgroundGrid [aria-pressed="true"]').dataset.backgroundId,'minuit');
});
console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));h.close();

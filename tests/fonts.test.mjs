import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Window} from 'happy-dom';
import FakeTimers from '@sinonjs/fake-timers';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const passed=[];
const microtasks=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
function windowForFonts(saved,load=()=>Promise.resolve([{}])){
  const w=new Window({url:'http://localhost:8000',settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
  if(saved)w.localStorage.setItem('t21copyFont',saved);
  Object.defineProperty(w.document,'fonts',{value:{load,ready:Promise.resolve()},configurable:true});
  return w;
}
{
  let release;
  const w=windowForFonts('comfortaa',()=>new Promise(resolve=>{release=resolve;}));
  w.eval(fs.readFileSync(root+'/copy-fonts.js','utf8')+'\nwindow.fonts=CopyFonts;');
  await microtasks();assert.equal(w.fonts.status,'loading');assert.equal(w.document.documentElement.dataset.copyFont,'fredoka');
  release([{}]);await w.fonts.ready;
  assert.equal(w.document.documentElement.dataset.copyFont,'comfortaa');
  assert.equal(w.localStorage.getItem('t21copyFont'),'comfortaa');
  w.close();passed.push('A saved font loads before the startup promise resolves');
}
{
  const pending=new Map();
  const w=windowForFonts('unknown-font',spec=>new Promise((resolve,reject)=>pending.set(spec.match(/"([^"]+)"/)[1],{resolve,reject})));
  w.eval(fs.readFileSync(root+'/copy-fonts.js','utf8')+'\nwindow.fonts=CopyFonts;');
  await microtasks();pending.get('Fredoka').resolve([{}]);await w.fonts.ready;
  const first=w.fonts.select('sniglet'),last=w.fonts.select('nunito');await microtasks();
  pending.get('Nunito').resolve([{}]);assert.equal(await last,true);
  pending.get('Sniglet').resolve([{}]);assert.equal(await first,false);
  assert.equal(w.document.documentElement.dataset.copyFont,'nunito');assert.equal(w.localStorage.getItem('t21copyFont'),'nunito');
  const fail=w.fonts.select('itim');await microtasks();pending.get('Itim').reject(new Error('offline'));
  assert.equal(await fail,false);assert.equal(w.fonts.selected,'nunito');assert.equal(w.fonts.status,'error');
  assert.equal(w.document.documentElement.dataset.copyFont,'nunito');assert.equal(w.localStorage.getItem('t21copyFont'),'nunito');
  assert.equal(await w.fonts.select('invalid'),false);
  w.close();passed.push('Rapid changes keep the last choice; failed loads preserve the working font');
}
{
  const w=windowForFonts();
  w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
  w.Image=class{set src(value){queueMicrotask(()=>this.onerror?.());}};
  const clock=FakeTimers.withGlobal(w).install({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance'],loopLimit:20000});
  w.document.write(fs.readFileSync(root+'/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''));
  const code=fs.readFileSync(root+'/cold-deck.js','utf8'),end=code.lastIndexOf('\n})();');
  w.eval(code.slice(0,end)+'\nwindow.audit={CopyFonts,GameClock,previewFonts,closeFontPreview,renderFontControls,openSettings,closeSettings,openPause,resumeGame,applyI18n,activeMenu,get G(){return G;},fr(){LANG="fr";applyI18n();}};'+code.slice(end));
  const a=w.audit,doc=w.document,$=id=>doc.getElementById(id);
  await a.CopyFonts.ready;await microtasks();a.fr();
  for(const select of doc.querySelectorAll('[data-font-select]')){
    assert.equal(select.options.length,10);
    assert.equal(select.querySelector('option[value="baloo-2"]').textContent,'Baloo 2');
    assert.equal(select.querySelector('option[value="baloo-2"]').children.length,0);
  }
  a.openSettings();await microtasks();doc.querySelector('#settingsScreen [data-action="previewFonts"]').click();
  assert.equal(a.activeMenu().id,'fontPreview');assert($('modeMenu').classList.contains('show'));
  assert.equal($('modeMenu').inert,true);assert.equal(doc.activeElement,$('fontPreviewSelect'));
  $('fontPreviewSelect').value='baloo-2';$('fontPreviewSelect').dispatchEvent(new w.Event('change'));
  await microtasks();assert.equal(doc.documentElement.dataset.copyFont,'baloo-2');assert.equal($('fontSelect').value,'baloo-2');
  doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(a.activeMenu().id,'settingsScreen');a.closeSettings();
  passed.push('Settings and the live panel share ten native options, including intact Baloo 2 text');
  $('modeMenu').classList.remove('show');$('intro').classList.remove('show');
  a.G.phase='play';a.G.bank=1234;a.G.bet=50;a.G.pHand=[{r:'10',s:'♠'},{r:'8',s:'♥'}];
  const before=JSON.stringify(a.G);let pendingAction=false;
  a.GameClock.delay(()=>{pendingAction=true;},100);
  a.openPause();await microtasks();
  const openPicker=doc.querySelector('#pauseScreen [data-action="previewFonts"]');openPicker.focus();openPicker.click();
  assert.equal(a.activeMenu().id,'fontPreview');assert.equal($('shaker').inert,true);
  assert(a.GameClock.reasons.has('manual'));assert(a.GameClock.reasons.has('overlay'));
  assert.equal($('pauseScreen').classList.contains('show'),false);
  const start=a.CopyFonts.selected;
  for(let i=0;i<10;i++){$('fontNext').click();await microtasks();}
  assert.equal(a.CopyFonts.selected,start);assert.equal(JSON.stringify(a.G),before);
  clock.tick(1000);assert.equal(pendingAction,false);
  doc.querySelector('#fontPreview [data-action="closeFontPreview"]').click();
  assert.equal(a.activeMenu().id,'pauseScreen');assert(a.GameClock.reasons.has('manual'));
  assert.ok(doc.activeElement===openPicker,'Focus returns to the font picker trigger');
  a.resumeGame();await microtasks();clock.tick(100);assert.equal(pendingAction,true);
  passed.push('All fonts can be cycled over the paused table without altering the hand, timers or focus');
  clock.uninstall();await w.happyDOM.abort();w.close();
}
console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));

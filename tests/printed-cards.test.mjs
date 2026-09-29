import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Window} from 'happy-dom';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
execFileSync(process.execPath,[path.join(root,'scripts/build.mjs')]);
const bundle=fs.readFileSync(path.join(root,'cold-deck.js'),'utf8');
const artSource=bundle.split('/* card-art.js */')[1].split('/* game.js */')[0];
const gameSource=fs.readFileSync(path.join(root,'game.js'),'utf8');
const controls=fs.readFileSync(path.join(root,'controls.js'),'utf8').split("  $('bootNotice')?.remove();")[0]+'\n})();';
const deferred=()=>{let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j;});return {promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};

function artwork(){
  const images=[],timers=new Map();let serial=0;
  class OfflineImage{
    constructor(){this.decoded=deferred();images.push(this);}
    set src(value){assert.match(value,/^data:image\/webp;base64,/,'Card images must not need the network');this.url=value;}
    decode(){return this.decoded.promise;}
  }
  const context=vm.createContext({Image:OfflineImage,setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id)});
  const art=vm.runInContext(artSource+'\nColdDeckArt;',context);
  return {art,images,timers};
}

{
  const {art}=artwork();
  assert.equal(art.cardImageKeys.length,23);
  for(const key of art.cardImageKeys){
    const image=art.image(key);
    assert.match(image,/^data:image\/webp;base64,/);
    assert.deepEqual(Buffer.from(image.split(',')[1],'base64'),fs.readFileSync(path.join(root,'assets/illustrations',key+'.webp')),key);
  }
  // Every rank and suit uses the same drawing, pip count and bevel as before.
  for(const suit of ['♠','♥','♦','♣'])for(const rank of ['A','2','3','4','5','6','7','8','9','10','J','Q','K']){
    const face=art.face(rank,suit);
    if(['J','Q','K'].includes(rank)){
      assert.match(face,/src="data:image\/webp;base64,/);assert.match(face,/decoding="sync"/);
    }else assert.equal((face.match(/class="card-pip /g)||[]).length,rank==='A'?1:Number(rank));
  }
  for(const id of ['cb9','cb10','cb11','cb12','cb13','cb14','cb15','cb16','cb18','cb19','cb22','cb26']){
    assert.match(art.back(id),/src="data:image\/webp;base64,/);assert.match(art.back(id),/card-back-frame/);
  }
}
{
  // Use the actual card renderer for ordinary, Gold and Prisme cards. Their
  // animated finish remains a local CSS layer over the prepared drawing.
  const w=new Window(),{art}=artwork();
  try{
    const renderer=gameSource.slice(gameSource.indexOf('function cardEl('),gameSource.indexOf('function hashStr('));
    const names=['edName','edInfo'].map(name=>gameSource.match(new RegExp('function '+name+'\\([^\\n]+'))[0]).join('\n');
    const context=vm.createContext({document:w.document,ColdDeckArt:art,LANG:'fr',cardBack:'cb9'});
    const cardEl=vm.runInContext(fs.readFileSync(path.join(root,'game-data.js'),'utf8')+'\nfunction t(key){return STR.fr[key];}\n'+names+'\n'+renderer+'\ncardEl;',context);
    for(const ed of [undefined,'foil','poly'])for(const s of ['♠','♥','♦','♣'])for(const r of ['A','2','3','4','5','6','7','8','9','10','J','Q','K']){
      const card=cardEl({r,s,ed});
      if(ed){assert(card.classList.contains(ed));assert.equal(card.querySelector('.edtag').textContent.toUpperCase(),ed==='foil'?'GOLD':'PRISME');}
      for(const image of card.querySelectorAll('img'))assert.match(image.src,/^data:image\/webp;base64,/);
      assert.equal(card.querySelectorAll('.corner').length,2);
    }
    const css=fs.readFileSync(path.join(root,'equilibre.css'),'utf8');
    const lastRule=css.indexOf(':root[data-motion="gentle"] .card.poly .card-surface::after');
    const finishes=css.slice(css.indexOf('/* Two finishes:'),css.indexOf('}',lastRule)+1);
    assert.match(finishes,/linear-gradient/);assert.match(finishes,/conic-gradient/);assert(!finishes.includes('url('),'Gold and Prisme effects must not request an image');
  }finally{w.happyDOM.abort();w.close();}
}
{
  const {art,images,timers}=artwork();let ready=false;
  const first=art.prepareCards('cb9').then(()=>{ready=true;});
  const repeated=art.prepareCards('cb9');assert.equal(images.length,10);
  for(const image of images)image.onload();await flush();assert.equal(ready,false,'Wait for actual decoding, not just load');
  for(const image of images)image.decoded.resolve();await first;await repeated;assert(ready);assert.equal(timers.size,0);
  const changed=art.prepareCards('cb12');assert.equal(images.length,11,'Changing a back must keep the prepared faces');
  images.at(-1).onload();images.at(-1).decoded.resolve();await changed;
  const failed=art.prepareCards('cb26');images.at(-1).onerror();await assert.rejects(failed);
  const retry=art.prepareCards('cb26');assert.equal(images.length,13);images.at(-1).onload();images.at(-1).decoded.resolve();await retry;
  const stalled=art.prepareCards('cb11');for(const timeout of [...timers.values()])timeout();await assert.rejects(stalled,/timed out/);
}

function launchScene(){
  const w=new Window({settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
  w.document.write('<div id="intro" class="show"><button id="planqueLaunch" data-action="launchMode">Jouer</button></div>');
  const gates=new Map(),masks=deferred(),requests=[];let launches=0,audio=0;
  w.$=id=>w.document.getElementById(id);w.cardBack='cb9';w.t=key=>key;
  w.audioInit=()=>audio++;w.launchMode=()=>launches++;
  w.ColdDeckArt={prepareCards(id){requests.push(id);if(!gates.has(id))gates.set(id,deferred());return gates.get(id).promise;}};
  w.ColdDeckRaster={cardsReady:masks.promise,ready:new Promise(()=>{})};
  w.eval(controls);
  return {w,gates,masks,requests,button:w.$('planqueLaunch'),get launches(){return launches;},get audio(){return audio;},close(){w.happyDOM.abort();w.close();}};
}
{
  const s=launchScene();try{
    s.button.click();s.button.click();assert(s.button.disabled);assert.equal(s.audio,1);assert.equal(s.launches,0);
    s.gates.get('cb9').resolve();await flush();assert.equal(s.launches,0,'Ranks must also be ready');
    s.masks.resolve();await flush();assert.equal(s.launches,1,'A late menu logo must not block the cards');assert(!s.button.disabled);assert(!s.button.hasAttribute('aria-busy'));
  }finally{s.close();}
}
{
  const s=launchScene();try{
    s.button.click();s.gates.get('cb9').reject(new Error('decode failure'));await flush();
    assert.equal(s.launches,0);assert(!s.button.disabled);assert.equal(s.button.textContent,'cards.retry');
    s.gates.set('cb9',deferred());s.button.click();s.gates.get('cb9').resolve();s.masks.resolve();await flush();assert.equal(s.launches,1);
  }finally{s.close();}
}
{
  const s=launchScene();try{
    s.button.click();s.w.cardBack='cb12';s.gates.get('cb9').resolve();s.masks.resolve();await flush();
    assert(s.requests.includes('cb12'));assert.equal(s.launches,0);s.gates.get('cb12').resolve();await flush();assert.equal(s.launches,1);
  }finally{s.close();}
}
{
  const s=launchScene();try{
    s.button.click();s.w.$('intro').classList.remove('show');s.gates.get('cb9').resolve();s.masks.resolve();await flush();assert.equal(s.launches,0,'Leaving the menu cancels the pending launch');
  }finally{s.close();}
}
console.log('Printed cards: 23 embedded drawings, 156 ordinary/Gold/Prisme faces and 12 backs offline, decoding before play, double clicks, changed back, retry, timeout and cancelled launch passed.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Window} from 'happy-dom';
import FakeTimers from '@sinonjs/fake-timers';
const w=new Window({settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
const clock=FakeTimers.withGlobal(w).install({toFake:['setTimeout','clearTimeout']});
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};};
const decodes=new Map(),common=deferred();
Object.defineProperty(w.HTMLImageElement.prototype,'complete',{get:()=>true});
Object.defineProperty(w.HTMLImageElement.prototype,'naturalWidth',{get:()=>512});
w.HTMLImageElement.prototype.decode=function(){const pending=deferred();decodes.set(this.getAttribute('src'),pending);return pending.promise;};
w.ColdDeckRaster={ready:common.promise};
w.document.body.innerHTML='<img hidden src="internal.webp"><div class="overlay show"><div class="ovpanel"><h1>Relique</h1><span class="effect-card"><img src="first.webp"></span></div></div>';
const panel=w.document.querySelector('.ovpanel');
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();await new Promise(setImmediate);};
try{
 w.eval(fs.readFileSync(new URL('../art-readiness.js',import.meta.url),'utf8'));
 assert(panel.classList.contains('art-pending'));
 assert(!w.document.body.classList.contains('art-pending'),'Internal hidden sources must not hide the game');
 decodes.get('first.webp').resolve();await flush();
 assert(panel.classList.contains('art-pending'),'Wait for shared ticket surfaces and lettering too');
 common.resolve();await flush();assert(!panel.classList.contains('art-pending'));
 w.ColdDeckReadiness.prepare(panel);assert(!panel.classList.contains('art-pending'),'Ready surfaces reopen immediately');

 panel.querySelector('img').src='replacement.webp';await flush();
 assert(panel.classList.contains('art-pending'),'Changing art hides the entire window until ready');
 decodes.get('replacement.webp').resolve();await flush();assert(!panel.classList.contains('art-pending'));

 panel.innerHTML='<h1>Nouvelle fenêtre</h1><img src="slow.webp">';await flush();
 assert(panel.classList.contains('art-pending'),'Inserted artwork is gated by the observer before display');
 panel.innerHTML='<h1>Fenêtre sans image</h1>';await flush();
 assert(!panel.classList.contains('art-pending'));decodes.get('slow.webp').resolve();await flush();
 assert(!panel.classList.contains('art-pending'),'A stale decode cannot change the replacement window');

 panel.innerHTML='<h1>Image indisponible</h1><img src="timeout.webp">';await flush();
 clock.tick(5000);await flush();assert(!panel.classList.contains('art-pending'));
 const failed=panel.querySelector('img');assert.equal(failed.style.visibility,'hidden');
 decodes.get('timeout.webp').resolve();await flush();assert.equal(failed.style.visibility,'hidden','Late art cannot pop into a revealed fallback');
 console.log('Illustrated surfaces: atomic windows, shared assets, warm reopen, source changes, replacements, hidden sources and timeout passed.');
}finally{clock.uninstall();w.happyDOM.abort();w.close();}

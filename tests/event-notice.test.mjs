import assert from 'node:assert/strict';
import {engine} from './engine.mjs';
const h=engine({eventUI:true}),a=h.api,popup=h.w.document.getElementById('turnPop');
const start=()=>{
 h.reset(123);a.setup([],[],{phase:'bet',bank:80,event:{id:'forcee'}});a.announceTurn();
 return popup.querySelector('.hand-event-illustration');
};
const pending=picture=>{
 let resolve;picture.decode=()=>new Promise(done=>{resolve=done;});picture.onload();
 return async()=>{resolve();await Promise.resolve();};
};
try{
 let picture=start(),ready=pending(picture);
 assert(!popup.classList.contains('go'),'Keep label hidden while image decodes');
 await ready();assert(popup.classList.contains('go'));assert(popup.classList.contains('event-ready'));
 assert(popup.contains(picture),'Image and label enter together');

 picture=start();ready=pending(picture);a.deal();await ready();
 assert(!popup.classList.contains('go'),'A late decode cannot revive a dealt notice');

 picture=start();ready=pending(picture);a.G.event={id:'ouvert'};a.announceTurn();
 await ready();assert(!popup.classList.contains('go'),'An old image cannot reveal a replacement notice');
 const next=popup.querySelector('.hand-event-illustration');await pending(next)();
 assert(popup.classList.contains('go'));assert(popup.contains(next));

 picture=start();picture.onerror();
 assert(popup.classList.contains('go'));assert(!popup.contains(picture),'Broken art cannot appear later');

 picture=start();ready=pending(picture);h.clock.tick(3000);
 assert(popup.classList.contains('go'));assert(!popup.contains(picture),'A stalled image must not hide the rule indefinitely');
 await ready();assert(!popup.contains(picture));
 console.log('Event notices: synchronized decode, stale hand, replacement, failed image and timeout passed.');
}finally{h.close();}

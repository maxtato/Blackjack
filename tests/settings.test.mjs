import assert from 'node:assert/strict';
import {engine,card} from './engine.mjs';

const h=engine({realAds:true,persist:true}),a=h.api,passed=[];
const check=async(name,fn)=>{await fn();passed.push(name);};
h.reset(321);

await check('Turning off ads blocks interstitials, rewards and direct previews',async()=>{
 a.Ads.setFreeCaps(true);a.Ads.setTestDisabled(true);
 assert.equal(a.Ads.canInterstitial(),false);assert.equal(a.Ads.canRewarded(),false);
 for(const result of [a.Ads.interstitial(),a.Ads.rewarded('Test'),a.Ads.show('inter'),a.Ads.show('reward','Test')])assert.equal(await result,false);
 assert.equal(a.Ads._busy,false);assert.equal(h.w.document.getElementById('adOverlay').classList.contains('show'),false);
 assert.equal(h.w.document.getElementById('testAdsToggle').getAttribute('aria-checked'),'true');
 assert.equal(h.w.localStorage.getItem('t21testAds'),'1');
 const reload=engine({realAds:true,storage:{t21testAds:h.w.localStorage.getItem('t21testAds')}});
 assert.equal(reload.api.Ads.testDisabled(),true);assert.equal(reload.api.Ads.canRewarded(),false);reload.close();
});

await check('Ads can be restored and previews work while the game stays paused',async()=>{
 a.Ads.setTestDisabled(false);assert.equal(a.Ads.canRewarded(),true);assert.equal(a.Ads.canInterstitial(),true);
 a.openPause();a.pauseSettings();a.openTestTools();
 const preview=a.Ads.show('reward','Test');assert.equal(a.Ads._busy,true);assert(a.GameClock.reasons.has('manual'));assert(a.GameClock.reasons.has('ad'));
 assert.equal(await a.Ads.show('inter'),false);
 h.clock.tick(6000);a.Ads.closeNow();assert.equal(await preview,true);
 assert(a.GameClock.reasons.has('manual'));assert.equal(a.GameClock.reasons.has('ad'),false);
 a.closeTestTools();a.closeSettings();assert(h.w.document.getElementById('pauseScreen').classList.contains('show'));a.resumeGame();
});

await check('Turning off an active reward cancels it without awarding a bonus',async()=>{
 const preview=a.Ads.show('reward','Test');a.Ads.setTestDisabled(true);
 assert.equal(await preview,false);assert.equal(a.Ads._timer,null);assert.equal(a.Ads._busy,false);
});

await check('Cancelling the reset keeps progress and the paused hand',()=>{
 a.META.nuit.rep=180;a.META.nuit.unlocks={bank:3,contact:1};a.META.nuit.record={depth:8,reached:9,chips:2500,version:2};
 a.setup([card(10),card(8)],[card(10),card(7)],{table:a.RUN[8],tableIdx:8,bank:900});
 a.openPause();a.pauseSettings();a.openTestTools();const before=JSON.stringify(a.META);
 a.requestCircuitReset();a.closeRestart();a.doRestart();
 assert.equal(JSON.stringify(a.META),before);assert.equal(a.G.bank,900);assert.equal(a.G.tableIdx,8);assert.equal(a.G.phase,'play');
 assert(a.GameClock.reasons.has('manual'));assert(h.w.document.getElementById('testScreen').classList.contains('show'));
});

await check('Circuit reset clears its saves and pending actions, keeps Free Play and settings',()=>{
 a.META.infini.rep=85;a.META.infini.unlocks={elan:2};a.META.infini.record={peak:4500,palier:4};
 a.RECS.nuit={gain:900};a.RECS.infini={gain:1800};
 const free=JSON.stringify(a.META.infini);h.w.localStorage.setItem('t21back','cb14');
 a.GameClock.delay(()=>{a.G.bank=999999;},250);
 a.requestCircuitReset();a.doRestart();
 assert.equal(a.MODE,'nuit');assert.equal(a.META.nuit.rep,0);assert.equal(Object.keys(a.META.nuit.unlocks).length,0);
 assert.equal(a.META.nuit.record.depth,0);assert.equal(a.META.nuit.record.reached,1);
 assert.equal(JSON.stringify(a.META.infini),free);assert.equal(a.RECS.nuit,undefined);assert.equal(a.RECS.infini.gain,1800);
 assert.equal(a.G.tableIdx,0);assert.equal(a.G.bank,80);assert.equal(a.G.hand,1);
 assert.equal(a.Ads.testDisabled(),true);assert.equal(h.w.localStorage.getItem('t21back'),'cb14');
 assert.equal(a.GameClock.reasons.has('manual'),false);assert.equal(h.w.document.querySelectorAll('#settingsScreen.show,#testScreen.show,#confirmRestart.show,#pauseScreen.show').length,0);
 h.clock.tick(1000);assert.equal(a.G.bank,80);
 const saved=JSON.parse(h.w.localStorage.getItem('t21meta'));assert.equal(saved.nuit.rep,0);assert.equal(saved.nuit.record.depth,0);assert.equal(JSON.stringify(saved.infini),free);
 assert.equal(JSON.parse(h.w.localStorage.getItem('t21rec')).nuit,undefined);
});

await check('Circuit reset targets Circuit even when opened from Free Play',()=>{
 a.startEndless();assert.equal(a.MODE,'infini');const free=JSON.stringify(a.META.infini);
 a.requestCircuitReset();a.doRestart();assert.equal(a.MODE,'nuit');assert.equal(a.G.endless,false);assert.equal(a.G.tableIdx,0);assert.equal(JSON.stringify(a.META.infini),free);
});

console.log(JSON.stringify({passed:passed.length,checks:passed},null,2));h.close();

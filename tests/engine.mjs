import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Window} from 'happy-dom';
import FakeTimers from '@sinonjs/fake-timers';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function engine({realAds=false,persist=false,storage={},journeyUI=false,shopUI=false}={}){
  const w=new Window({url:'http://localhost:8000',settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
  for(const [key,value] of Object.entries(storage))w.localStorage.setItem(key,value);
  w.document.write(fs.readFileSync(root+'/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''));
  w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
  const clock=FakeTimers.withGlobal(w).install({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance'],loopLimit:20000});
  const noops=['renderTop','renderRelics','renderConsumables','renderActions','renderPressure','renderMult','renderHands','renderHandTotals','renderCombos','renderShopHead','announceTurn','popText','flashScore','showWord','perfectFanfare','showRecord','objectiveReached','showBoss','flashScreen','coinBurst','shake','updateBustReadout','renderPlanque','renderBackPicker','audioInit','announceEd','renderCircuitStatus','renderShopInventory','showTableBrief','saveMeta','saveRecs'];
  const expose=['RUN','RUN_LEN','ZONE_MULTCAP','RELIC_POOL','TAROT_POOL','SERVICE_POOL','UNLOCKS_NUIT','CONTRACTS','BARAKA_STEPS','BARAKA_MULT','STR','Ads','startGame','freshGame','enterTable','retryTable','deal','playerHit','playerStand','playerDouble','playerSplit','forcerChance','usePeek','useConsumable','handValue','computeMult','barakaLevel','barakaPct','addBaraka','hasRelic','drawIdeal','buildShoe','resolve','resolveSplit','betChoices','clampBet','itemCost','serviceCost','niceRound','roundBet','starsFor','GameClock','chooseContract','bossReady','bossProgress','lossRefund','checkBankGoal','recommendedBet','relicPower','resetTableState','shopReserve','serviceAvailable','advanceAmount','openPause','resumeGame','openInspect','closeInspect','migrateCircuitRecord','extraLife','tableRep','repOnEnd','coffreBonus','buyShopItem','leaveShop','cashOut','endRun','updateRecord','addEditionToHand','consumableSlots','relicMax','applyHandIncome','checkContract','t','bustChance','sellValue','sellItem'];
  let code=['game-data.js','card-art.js','game.js','backgrounds.js','circuit-journey.js'].map(f=>fs.readFileSync(root+'/'+f,'utf8')).join('\n');
  expose.push('openSettings','closeSettings','pauseSettings','openTestTools','closeTestTools','requestCircuitReset','closeRestart','doRestart','restartAll','startEndless');
  expose.push('maybeEdition','cardEl');
  expose.push('reachPalier','applyBoon','palierTarget');
  expose.push('ColdDeckBackgrounds','setLang');
  expose.push('ColdDeckJourney','continueTableVictory','finishTable','nextHandOrEnd','showTableBrief','renderShopHead','cash');
  expose.push('openShopSale','renderShopInventory','setLang','openShop','rerollShop','tablePreparation');
  code=code.replace('freshGame();buildShoe();applyI18n();renderHands();tick();','');
  code+='\n'+noops.filter(n=>(!persist||!['saveMeta','saveRecs'].includes(n))&&(!journeyUI||!['showTableBrief','renderShopHead'].includes(n))&&(!shopUI||n!=='renderShopInventory')).map(n=>n+'=()=>{};').join('\n');
  code+=`\nLANG='fr';
    renderChips=()=>clampBet();renderAll=()=>clampBet();
    showWord=(kind,gain,mult,natural,bust,record,reason='')=>{window.__result={kind,gain,mult,natural,bust,record,reason};};
    ${shopUI?'const auditRenderShop=renderShop;renderShop=()=>{window.__screen="shop";auditRenderShop();};':'renderShop=()=>{window.__screen="shop";};'}openLose=()=>{window.__screen='lose';};renderEndScreen=()=>{window.__screen='end';};
    animateScoreTally=(mode,lines,finish)=>{finish();return 0;};
    ${realAds?'':'Ads.canRewarded=()=>false;Ads.interstitial=()=>({then(fn){fn();}});Ads.countTable=()=>{};'}
    for(const key of Object.keys(sfx))sfx[key]=()=>{};
    window.ColdDeckFX=new Proxy({reduced:true},{get:(target,key)=>key in target?target[key]:()=>{}});
    const originalAuditMult=computeMult;
    computeMult=function(mode){const value=originalAuditMult(mode);if(G.phase==='done')window.__onScore?.({mult:value.mult,lines:value.lines,n:G.pHand.length,pv:handValue(G.pHand).total,baraka:barakaLevel(),cap:ZONE_MULTCAP[G.table.zone],table:G.tableIdx+1});return value;};
    window.__audit={${expose.join(',')},buyUnlock,
      get G(){return G},get META(){return META},get RECS(){return RECS},get MODE(){return MODE},get offers(){return shopOffer},get rerollCost(){return rerollCost},
      reset(unlocks={}){META=blankMeta();META.nuit.unlocks={...unlocks};RECS={};window.__screen='';startGame(0);},
      setup(hand,dealer,opts={}){freshGame();window.__result=null;G.pHand=hand;G.dHand=dealer;Object.assign(G,{phase:'play',revealed:false,bet:10,betChosen:true,bank:100},opts);},
      setTable(i){G.tableIdx=i;G.table=RUN[i];},
      setOffers(offers){shopOffer=offers;},
      french(){return STR.fr;}
    };`;
  w.eval(code);
  const api=w.__audit;
  let seed=1;
  w.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  return {w,api,clock,seed(n){seed=n>>>0;},flush(){clock.runAll();},reset(n,upgrades={}){clock.reset();seed=n>>>0;api.reset(upgrades);},close(){clock.uninstall();w.happyDOM.abort();w.close();}};
}
export const card=(r,s='♠',ed)=>({r:String(r),s,...(ed?{ed}:{})});

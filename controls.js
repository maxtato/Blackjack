/* Keep actions in the application's closure, including in embedded previews.
   No inline handlers, eval, or dependency on functions attached to window. */
(() => {
  let preparingCards=false;
  async function launchPreparedGame(){
    if(preparingCards)return;
    audioInit();
    preparingCards=true;
    const launch=$('planqueLaunch'),label=launch.innerHTML;
    launch.disabled=true;launch.setAttribute('aria-busy','true');launch.textContent=t('cards.preparing');
    try{
      // All of these drawings are already inside the bundle. Finish decoding
      // them, including the illustrated ranks, before showing the first hand.
      let preparedBack;
      do{
        preparedBack=cardBack;
        await Promise.all([ColdDeckArt.prepareCards(preparedBack),window.ColdDeckRaster?.cardsReady]);
      }while(preparedBack!==cardBack);
      launch.innerHTML=label;
      if($('intro').classList.contains('show'))launchMode();
    }catch{
      launch.textContent=t('cards.retry');
    }finally{
      preparingCards=false;launch.disabled=false;launch.removeAttribute('aria-busy');
    }
  }
  ColdDeckArt.prepareCards(cardBack).catch(()=>{});
  const actions = {
    'select-circuit': () => chooseMode('nuit'),
    'select-free': () => chooseMode('infini'),
    launchMode: () => launchPreparedGame(),
    'back-previous': () => stepBack(-1),
    'back-next': () => stepBack(1),
    'resume-previous': () => stepResume(-1),
    'resume-next': () => stepResume(1),
    'cash-out-endless': () => cashOutEndless(false),
    'cash-out-endless-bonus': () => cashOutEndless(true),
    'apply-boon': el => applyBoon(el.dataset.boon),
    'close-inspect-backdrop': (el,event) => {if(event.target===el)closeInspect();},
    'ad-close': () => Ads.closeNow(),
    'ad-install': el => Ads.fakeClick(el),
    openPause: () => openPause(),
    openTableRules: () => openTableRules(),
    usePeek: () => usePeek(),
    openRules: () => openRules(),
    openSettings: () => openSettings(),
    openTestTools: () => openTestTools(),
    closeTestTools: () => closeTestTools(),
    toggleTestAds: () => Ads.setTestDisabled(!Ads.testDisabled()),
    requestCircuitReset: () => requestCircuitReset(),
    openMenu: () => openMenu(),
    openUpgrades: () => openUpgrades(),
    openBacks: () => openBacks(),
    restartAll: () => restartAll(),
    closeRules: () => closeRules(),
    closeUpgrades: () => closeUpgrades(),
    closeBacks: () => closeBacks(),
    closeRestart: () => closeRestart(),
    doRestart: () => doRestart(),
    resumeGame: () => resumeGame(),
    pauseRules: () => pauseRules(),
    pauseSettings: () => pauseSettings(),
    openBackgrounds: () => ColdDeckBackgrounds.open(),
    closeBackgrounds: () => ColdDeckBackgrounds.close(),
    'select-background': el => ColdDeckBackgrounds.select(el.dataset.backgroundId),
    quitToMenu: () => quitToMenu(),
    rerollShop: () => rerollShop(),
    adFreeReroll: () => adFreeReroll(),
    cashOut: () => cashOut(),
    leaveShop: () => leaveShop(),
    adRetryTable: () => adRetryTable(),
    extraLife: () => extraLife(),
    giveUp: () => giveUp(),
    adDoubleRep: () => adDoubleRep(),
    toPlanque: () => toPlanque(),
    closeSettings: () => closeSettings(),
    adRerollBoons: () => adRerollBoons()
  };
  document.addEventListener('click',event => {
    const element=event.target instanceof Element?event.target.closest('[data-action]'):null;
    if(!element||element.disabled||element.closest('[inert]'))return;
    const action=actions[element.dataset.action];
    if(action)action(element,event);
  });
  document.querySelectorAll('[data-action="select-circuit"],[data-action="select-free"]').forEach(button=>{button.disabled=false;});
  $('bootNotice')?.remove();
  // Fonts, alpha masks and the artwork visible on the home screen share one reveal.
  const decodeImage=src=>new Promise(resolve=>{
    const image=new Image();image.decoding='async';
    image.onerror=()=>resolve();
    image.onload=()=>image.decode?image.decode().catch(()=>{}).then(resolve):resolve();
    image.src=src;
  });
  const homeAssets=new Set([
    ...[...$('modeMenu').querySelectorAll('img')].map(image=>image.src),
    ...['background-menu','button-yellow','button-teal','card-shape','card-stock','suit-spade'].map(ColdDeckArt.image)
  ]);
  const resources=[window.ColdDeckRaster?.ready,document.fonts?.load('500 16px "Baloo 2"'),document.fonts?.ready,...Array.from(homeAssets,decodeImage)];
  Promise.allSettled(resources).then(()=>{
    window.ColdDeckRaster?.refresh();
    requestAnimationFrame(()=>requestAnimationFrame(()=>window.ColdDeckBoot?.finish()));
  });
})();

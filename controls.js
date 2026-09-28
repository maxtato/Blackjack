/* Keep actions in the application's closure, including in embedded previews.
   No inline handlers, eval, or dependency on functions attached to window. */
(() => {
  const actions = {
    'select-circuit': () => chooseMode('nuit'),
    'select-free': () => chooseMode('infini'),
    launchMode: () => launchMode(),
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
    usePeek: () => usePeek(),
    openRules: () => openRules(),
    openSettings: () => openSettings(),
    previewFonts: () => previewFonts(),
    closeFontPreview: () => closeFontPreview(),
    fontPrevious: () => CopyFonts.step(-1),
    fontNext: () => CopyFonts.step(1),
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
  document.querySelectorAll('[data-font-select]').forEach(select=>select.addEventListener('change',()=>CopyFonts.select(select.value)));
  document.addEventListener('cold-deck-font-change',renderFontControls);
  renderFontControls();
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
  const resources=[window.ColdDeckRaster?.ready,CopyFonts.ready,document.fonts?.ready,...Array.from(homeAssets,decodeImage)];
  Promise.allSettled(resources).then(()=>{
    window.ColdDeckRaster?.refresh();
    requestAnimationFrame(()=>requestAnimationFrame(()=>window.ColdDeckBoot?.finish()));
  });
})();

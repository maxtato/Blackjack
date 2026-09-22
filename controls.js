/* Keep actions in the application's closure, including in embedded previews.
   No inline handlers, eval, or dependency on functions attached to window. */
(() => {
  const actions = {
    'select-circuit': () => chooseMode('nuit'),
    'select-free': () => chooseMode('infini'),
    launchMode: () => launchMode(),
    'start-zone-two': () => startGame(3),
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
})();

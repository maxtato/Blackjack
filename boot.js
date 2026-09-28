/* Reveal the first screen only after its lettering and artwork are ready. */
(() => {
  const root=document.documentElement;
  root.classList.add('boot-loading');
  let complete=false;
  const finish=()=>{
    if(complete)return;
    complete=true;clearTimeout(fallback);
    root.classList.remove('boot-loading');
    document.getElementById('bootSplash')?.remove();
    window.dispatchEvent(new Event('cold-deck-ready'));
  };
  // A failed asset must never leave the menu behind a permanent loading screen.
  const fallback=setTimeout(finish,7000);
  window.ColdDeckBoot={finish,get ready(){return complete;}};
})();

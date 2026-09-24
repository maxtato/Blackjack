/* Generated surfaces and bitmap lettering. Text remains available to assistive tools. */
(() => {
  const assets=['type-letters','type-numbers','suit-spade','suit-heart','suit-diamond','suit-club','button-yellow','button-blue','button-teal','button-purple','button-coral','button-graphite','card-stock','background-table','background-menu','nav-arrow','nav-pause','brand-wordmark'];
  for(const key of assets)document.documentElement.style.setProperty('--art-'+key,`url("${ColdDeckArt.image(key)}")`);
  const labelSelector='button,h1:not(.menuTitle),.mode-card strong,.chip-value,#gainVal,#chipsVal,#multVal,#pVal,#dVal,.tnum,.repNum,.zlbl>[data-i18n]';
  function label(el){
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.textContent.trim()&&!node.parentElement.closest('.raster-copy,.sr-only,small,svg,[aria-hidden="true"]'))nodes.push(node);
    }
    for(const node of nodes){
      const fragment=document.createElement('span');fragment.innerHTML=ColdDeckArt.lettering(node.textContent);
      node.replaceWith(...fragment.childNodes);
    }
  }
  function brand(el){
    if(el.querySelector('.brand-image'))return;
    el.innerHTML='<span class="brand-image" role="img" aria-label="Cold Deck"></span>';
  }
  function decorate(){
    observer.disconnect();
    document.querySelectorAll(labelSelector).forEach(label);
    document.querySelectorAll('.menuTitle,.table-brand,.wordmark').forEach(brand);
    const pause=$('pauseBtn');
    if(pause&&!pause.querySelector('.pause-mark'))pause.innerHTML='<i class="raster-nav pause-mark" aria-hidden="true"></i>';
    for(const el of roots)observer.observe(el,{childList:true,subtree:true,characterData:true});
  }
  const roots=[...document.querySelectorAll('.overlay,#adOverlay,#topbar,#bottombar,.zlbl,#peekBtn')];
  const observer=new MutationObserver(decorate);
  decorate();
  // Deterministic entry point for renders and tests, without any game-state writes.
  window.ColdDeckRaster={refresh:decorate};
})();

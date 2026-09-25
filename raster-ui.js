/* Generated surfaces and bitmap lettering. Text remains available to assistive tools. */
(() => {
  const assets=['type-letters','type-numbers','suit-spade','suit-heart','suit-diamond','suit-club','button-yellow','button-blue','button-teal','button-purple','button-coral','button-graphite','card-stock','card-shape','background-table','background-menu','nav-arrow','nav-pause','brand-wordmark'];
  for(const key of assets)document.documentElement.style.setProperty('--art-'+key,`url("${ColdDeckArt.image(key)}")`);
  // WebKit can ignore luminance masks for large/animated artwork. Decode each
  // mask to alpha once; its text fallback stays visible until decoding succeeds.
  function prepareAlphaMask(key,readyClass){
    return new Promise(resolve=>{
      const source=new Image();source.decoding='async';
      source.onerror=()=>resolve(false);
      source.onload=()=>{
        try{
          const canvas=document.createElement('canvas');
          canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
          const context=canvas.getContext('2d',{willReadFrequently:true});
          if(!context){resolve(false);return;}
          context.drawImage(source,0,0);
          const pixels=context.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
          for(let i=0;i<data.length;i+=4){
            data[i+3]=Math.round((data[i]*.2125+data[i+1]*.7154+data[i+2]*.0721)*data[i+3]/255);
            data[i]=data[i+1]=data[i+2]=255;
          }
          context.putImageData(pixels,0,0);
          const url=canvas.toDataURL('image/png'),decoded=new Image();
          decoded.onerror=()=>resolve(false);
          decoded.onload=()=>{
            document.documentElement.style.setProperty('--alpha-'+key,`url("${url}")`);
            document.documentElement.classList.add(readyClass);
            resolve(true);
          };
          decoded.src=url;
        }catch{resolve(false);}
      };
      source.src=ColdDeckArt.image(key);
    });
  }
  const ready=Promise.all([
    prepareAlphaMask('type-letters','raster-letters-ready'),
    prepareAlphaMask('type-numbers','raster-numbers-ready'),
    prepareAlphaMask('brand-wordmark','raster-brand-ready')
  ]);
  // Reserve illustrated glyphs for display labels, not reading-sized copy.
  const labelSelector='button,h1:not(.menuTitle),.mode-card strong,.chip-value,#menuBestGain,#gainVal,#chipsVal,#multVal,#pVal,#dVal,.tnum,.repNum';
  const copySelector='[data-reading-label],.menu-record-label,.planqueMode,#recBox,small,p,.ds,.mode-description,.mode-topline,.mode-bottom,.hero-copy,.hero-tags,.menu-record-note,.rules .rule-entry,.rules .rt,#tip,#comboRow,#tableName,#tableMeta,#ruleText,#pBar .pmeta,.zlbl>[data-i18n],.tstats .k,.tstats .lbl,.tstats .tt,.tstats .ts,.inventory-label,.objective-label,.section-label,.eyebrow,.setLbl,.back-name,.repLbl,.mrl,.mrv,#slotc,#consumeSlots';
  function readableCopy(el){
    el.classList.add('readable-copy');
    for(const ink of el.querySelectorAll('.raster-copy,.live-word')){
      const text=ink.querySelector('.sr-only')?.textContent;
      if(text!=null)ink.replaceWith(document.createTextNode(text));
    }
  }
  function label(el){
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.textContent.trim()&&!node.parentElement.closest('.raster-copy,.sr-only,.readable-copy,small,svg,[aria-hidden="true"]'))nodes.push(node);
    }
    for(const node of nodes){
      const fragment=document.createElement('span');fragment.innerHTML=ColdDeckArt.lettering(node.textContent);
      node.replaceWith(...fragment.childNodes);
    }
  }
  function brand(el){
    if(el.querySelector('.brand-image'))return;
    el.innerHTML='<span class="brand-image" role="img" aria-label="Cold Deck"><span class="brand-fallback" aria-hidden="true"><span>COLD</span><span>DECK</span></span></span>';
  }
  function decorate(){
    observer.disconnect();
    document.querySelectorAll(copySelector).forEach(readableCopy);
    document.querySelectorAll(labelSelector).forEach(label);
    document.querySelectorAll('.menuTitle,.table-brand,.wordmark').forEach(brand);
    const pause=$('pauseBtn');
    if(pause&&!pause.querySelector('.pause-mark'))pause.innerHTML='<i class="raster-nav pause-mark" aria-hidden="true"></i>';
    for(const el of roots)observer.observe(el,{childList:true,subtree:true,characterData:true});
  }
  const roots=[...document.querySelectorAll('.overlay,#adOverlay,#topbar,#bottombar,#center,.zlbl,#pVal,#dVal,#peekBtn,#pBar,#effects')];
  const observer=new MutationObserver(decorate);
  decorate();
  // Deterministic entry point for renders and tests, without any game-state writes.
  window.ColdDeckRaster={refresh:decorate,ready};
})();

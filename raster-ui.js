/* Generated surfaces and bitmap lettering. Text remains available to assistive tools. */
(() => {
  const assets=['type-letters','type-numbers','suit-spade','suit-heart','suit-diamond','suit-club','button-yellow','button-blue','button-teal','button-purple','button-coral','button-graphite','card-stock','card-shape','background-table','background-menu','nav-arrow','nav-pause'];
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
  const cardsReady=Promise.all([
    prepareAlphaMask('type-letters','raster-letters-ready'),
    prepareAlphaMask('type-numbers','raster-numbers-ready')
  ]);
  const ready=cardsReady;
  // Reserve illustrated glyphs for display labels, not reading-sized copy.
  const labelSelector='button,h1:not(.menuTitle),#tableName,#victoryTable,.table-effect-card>strong,.mode-card strong,.chip-value,#menuBestGain,#gainVal,#chipsVal,#multVal,#pVal,#dVal,.tnum,.repNum';
  const copySelector='[data-reading-label],.menu-record-label,.planqueMode,#recBox,small,p,.ds,.mode-description,.mode-topline,.mode-bottom,.hero-copy,.hero-tags,.menu-record-note,.rules .rule-entry,.rules .rt,#tip,#comboRow,#tableMeta,#ruleText,#pBar .pmeta,.zlbl>[data-i18n],.tstats .k,.tstats .lbl,.tstats .tt,.tstats .ts,.inventory-label,.objective-label,.section-label,.eyebrow,.setLbl,.back-name,.repLbl,.mrl,.mrv,#slotc,#consumeSlots';
  function readableCopy(el){
    el.classList.add('readable-copy');
    for(const ink of el.querySelectorAll('.raster-copy,.live-word')){
      if(ink.closest('.game-number'))continue;
      const text=ink.querySelector('.sr-only')?.textContent;
      if(text!=null)ink.replaceWith(document.createTextNode(text));
    }
  }
  function label(el){
    el.classList.add('raster-label');
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.textContent.trim()&&!node.parentElement.closest('.raster-copy,.game-number,.sr-only,.readable-copy,small,svg,[aria-hidden="true"]'))nodes.push(node);
    }
    for(const node of nodes){
      const fragment=document.createElement('span');fragment.innerHTML=ColdDeckArt.lettering(node.textContent);
      node.replaceWith(...fragment.childNodes);
    }
  }
  function brand(el){
    if(el.querySelector('.brand-image'))return;
    el.innerHTML='<span class="brand-image" role="img" aria-label="Cold Deck">'+ColdDeckArt.lettering('COLD DECK')+'</span>';
  }
  // Emphasize the exact displayed value, including its sign, decimal, unit and
  // grouped thousands. Only text nodes are replaced: links and controls survive.
  const numberPattern=/(?<![\p{L}\p{N}])(?:[+−-]\s*)?(?:[$€×]\s*)?\d+(?:[ \u00a0\u2009\u200a\u202f]\d{3})*(?:[.,]\d+)*(?:[KMBTP](?!\p{L}))?(?:[\/–]\d+(?:[.,]\d+)?)?(?:[ \u00a0\u2009\u200a\u202f]*(?:%|[$€]))?/gu;
  const numberSkip='.font-sample,.game-number,.raster-copy,.live-word,.sr-only,.card,.chip-value,.repNum,.tnum,#menuBestGain,#gainVal,#chipsVal,#multVal,#pVal,#dVal,svg,script,style,textarea,select,option,[aria-hidden="true"]:not(.overlay)';
  function numbers(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(/\d/.test(node.textContent)&&!node.parentElement.closest(numberSkip))nodes.push(node);
    }
    for(const node of nodes){
      const value=node.textContent,matches=[...value.matchAll(numberPattern)];
      if(!matches.length)continue;
      const fragment=document.createDocumentFragment();let end=0;
      for(const match of matches){
        fragment.append(document.createTextNode(value.slice(end,match.index)));
        const number=document.createElement('strong');number.className='game-number';
        number.dataset.valueKind=/[$€]/.test(match[0])?'money':/[×%]/.test(match[0])?'bonus':'quantity';
        number.innerHTML=ColdDeckArt.lettering(match[0]);fragment.append(number);
        end=match.index+match[0].length;
      }
      fragment.append(document.createTextNode(value.slice(end)));node.replaceWith(fragment);
    }
  }
  function reputation(root){
    for(const star of root.querySelectorAll('.rep-star')){
      if(star.closest('.rep-value,.empty-star'))continue;
      const adjacent=direction=>{
        let node=star[direction];
        while(node?.nodeType===3&&!node.textContent.trim())node=node[direction];
        return node?.nodeType===1&&node.matches('.game-number')?node:null;
      };
      const before=adjacent('previousSibling'),after=adjacent('nextSibling'),value=before||after;
      if(!value)continue;
      const group=document.createElement('span');group.className='rep-value';
      value.dataset.valueKind='reputation';
      const first=before?value:star,last=before?star:value;
      first.before(group);
      while(group.nextSibling){const node=group.nextSibling;group.append(node);if(node===last)break;}
    }
  }
  function select(root,selector){return [...(root.matches(selector)?[root]:[]),...root.querySelectorAll(selector)];}
  function decorate(records){
    observer.disconnect();
    // Updating a score never redecorates every shop and menu in the background.
    const scopes=Array.isArray(records)?[...new Set(records.map(record=>roots.find(root=>root.contains(record.target))).filter(Boolean))]:roots;
    for(const root of scopes){
      select(root,copySelector).forEach(readableCopy);
      numbers(root);
      select(root,labelSelector).forEach(label);
      reputation(root);
      select(root,'.menuTitle,.table-brand,.wordmark').forEach(brand);
    }
    const pause=$('pauseBtn');
    if(pause&&!pause.querySelector('.pause-mark'))pause.innerHTML='<i class="raster-nav pause-mark" aria-hidden="true"></i>';
    for(const el of roots)observer.observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-hidden']});
  }
  const roots=[...document.querySelectorAll('.overlay,#adOverlay,#topbar,#bottombar,#center,.zlbl,#pVal,#dVal,#peekBtn,#pBar,#effects,#circuitStatus,#recPop,#turnPop')];
  const observer=new MutationObserver(decorate);
  decorate();
  // Deterministic entry point for renders and tests, without any game-state writes.
  window.ColdDeckRaster={refresh:decorate,ready,cardsReady};
})();

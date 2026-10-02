/* Reveal each illustrated surface as one unit, after its bitmaps decode. */
(() => {
  const pictures=new WeakMap(),surfaces=new WeakMap();
  function preparePicture(picture){
    const src=picture.getAttribute('src')||picture.currentSrc||'';
    const previous=pictures.get(picture);
    if(previous?.src===src)return previous.promise;
    picture.loading='eager';
    if(previous){picture.style.removeProperty('visibility');picture.removeAttribute('data-art-failed');}
    const entry={src,promise:null};
    entry.promise=new Promise(resolve=>{
      let finished=false;
      const finish=failed=>{
        if(finished)return;finished=true;clearTimeout(timeout);
        picture.removeEventListener('load',decode);picture.removeEventListener('error',error);
        if(failed&&pictures.get(picture)===entry){
          picture.style.visibility='hidden';picture.setAttribute('data-art-failed','');
        }
        resolve();
      };
      const error=()=>finish(true);
      const decode=()=>{
        if(picture.decode)picture.decode().then(()=>finish(false),error);
        else finish(!picture.naturalWidth);
      };
      const timeout=setTimeout(error,5000);
      picture.addEventListener('load',decode);picture.addEventListener('error',error);
      if(picture.complete&&picture.naturalWidth)decode();
    });
    pictures.set(picture,entry);return entry.promise;
  }
  function prepare(surface){
    const images=[...surface.querySelectorAll('img[src]')].filter(image=>!image.hidden&&image.style.display!=='none'&&!image.closest('#turnPop,.card,[hidden]'));
    if(!images.length){surface.classList.remove('art-pending');surfaces.delete(surface);return;}
    const signature=images.map(image=>image.getAttribute('src'));
    const previous=surfaces.get(surface);
    if(previous&&images.length===previous.images.length&&images.every((image,i)=>image===previous.images[i]&&signature[i]===previous.signature[i]))return;
    const state={images,signature};surfaces.set(surface,state);
    surface.classList.add('art-pending');
    Promise.all([window.ColdDeckRaster?.ready,...images.map(preparePicture)]).then(()=>{
      if(surfaces.get(surface)===state)surface.classList.remove('art-pending');
    });
  }
  function surfaceFor(image){
    if(image.hidden||image.style.display==='none'||image.closest('#turnPop,.card,[hidden]'))return null;
    return image.closest('.ovpanel')||image.closest('.shopItem,.boon-choice,.mode-card,.table-effect-card,.back-choice')||image.closest('.effect-card,.illustrated-heading,.brand-image,button')||image.parentElement;
  }
  function collect(root,targets){
    if(root.nodeType!==1)return;
    const images=[...(root.matches('img[src]')?[root]:[]),...root.querySelectorAll('img[src]')];
    for(const image of images){const surface=surfaceFor(image);if(surface)targets.add(surface);}
  }
  const observer=new MutationObserver(records=>{
    const targets=new Set();
    for(const record of records){
      if(record.type==='childList'){
        for(const node of record.addedNodes)collect(node,targets);
        // Replacements without artwork must also cancel an older pending reveal.
        const surface=record.target.closest?.('.ovpanel,.effect-card,.shopItem,.boon-choice');
        if(surface?.classList.contains('art-pending'))targets.add(surface);
      }else if(record.attributeName==='src')collect(record.target,targets);
      else if(record.target.matches('.overlay.show'))collect(record.target,targets);
    }
    targets.forEach(prepare);
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class']});
  const initial=new Set();collect(document.body,initial);initial.forEach(prepare);
  window.ColdDeckReadiness={prepare};
})();

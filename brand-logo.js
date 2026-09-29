/* The selected logo shares the fixed header box with its readable fallback. */
(() => {
  const logo=new Image();
  logo.decoding='async';
  logo.onload=async()=>{
    try{
      if(logo.decode)await logo.decode();
      document.documentElement.classList.add('raster-brand-ready');
    }catch{}
  };
  logo.onerror=()=>{};
  logo.src='assets/illustrations/brand-baraka.webp';
  // The game redraws menu headings when returning home or changing language.
  const install=()=>{
    for(const heading of document.querySelectorAll('.menuTitle,.table-brand,.wordmark')){
      let frame=heading.querySelector('.brand-image');
      if(frame?.querySelector('.brand-art'))continue;
      const fallback=document.createElement('span');
      fallback.className='brand-fallback';fallback.setAttribute('aria-hidden','true');
      if(frame)fallback.append(...frame.childNodes);
      else{
        frame=document.createElement('span');frame.className='brand-image';
        frame.setAttribute('role','img');frame.setAttribute('aria-label','Baraka');
        fallback.textContent='BARAKA';heading.replaceChildren(frame);
      }
      const image=document.createElement('img');
      image.className='brand-art';image.src=logo.src;image.width=2025;image.height=777;
      image.alt='';image.setAttribute('aria-hidden','true');image.decoding='async';image.draggable=false;
      frame.replaceChildren(fallback,image);
    }
  };
  const watch=()=>{
    install();
    const observer=new MutationObserver(install);
    document.querySelectorAll('.menuTitle,.table-brand,.wordmark').forEach(heading=>observer.observe(heading,{childList:true,subtree:true}));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});
  else watch();
})();

/* Reading fonts are local. A choice is applied only after its face is ready. */
const CopyFonts=(()=>{
  const options=Object.freeze([
    {id:'fredoka',name:'Fredoka',weight:500},
    {id:'baloo-2',name:'Baloo 2',weight:500},
    {id:'grandstander',name:'Grandstander',weight:500},
    {id:'sniglet',name:'Sniglet',weight:400},
    {id:'dynapuff',name:'DynaPuff',weight:400},
    {id:'itim',name:'Itim',weight:400},
    {id:'quicksand',name:'Quicksand',weight:500},
    {id:'nunito',name:'Nunito',weight:500},
    {id:'comfortaa',name:'Comfortaa',weight:500},
    {id:'bree-serif',name:'Bree Serif',weight:400}
  ].map(Object.freeze));
  const root=document.documentElement,loaded=new Map();
  let applied=options[0].id,selected=applied,status='ready',request=0;
  const notify=()=>document.dispatchEvent(new Event('cold-deck-font-change'));
  const apply=font=>{
    root.style.setProperty('--copy-font','"'+font.name+'","Avenir Next","Segoe UI",Arial,sans-serif');
    root.dataset.copyFont=font.id;
  };
  const load=font=>{
    if(!loaded.has(font.id)){
      const promise=Promise.resolve().then(()=>{
        if(!document.fonts?.load)return;
        return document.fonts.load(font.weight+' 16px "'+font.name+'"').then(faces=>{
          if(!faces.length)throw new Error('Font unavailable');
        });
      }).catch(error=>{loaded.delete(font.id);throw error;});
      loaded.set(font.id,promise);
    }
    return loaded.get(font.id);
  };
  async function select(id,save=true){
    const font=options.find(font=>font.id===id);if(!font)return false;
    const ticket=++request;selected=id;status='loading';notify();
    try{
      await load(font);if(ticket!==request)return false;
      apply(font);applied=selected=id;status='ready';
      if(save)try{localStorage.setItem('t21copyFont',id);}catch{}
      notify();return true;
    }catch{
      if(ticket!==request)return false;
      selected=applied;status='error';notify();return false;
    }
  }
  apply(options[0]);
  let saved=applied;
  try{const value=localStorage.getItem('t21copyFont');if(options.some(font=>font.id===value))saved=value;}catch{}
  const ready=select(saved,false);
  return {options,ready,select,get selected(){return selected;},get applied(){return applied;},get status(){return status;},step(direction){
    const index=options.findIndex(font=>font.id===selected);
    return select(options[(index+direction+options.length)%options.length].id);
  }};
})();

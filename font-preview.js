/* Imported fonts stay on this device and affect reading text only. */
const ColdDeckFonts=(()=>{
  Object.assign(STR.fr,{
    'font.title':'POLICE DES TEXTES','font.import':'CHANGER DE POLICE','font.reset':'POLICE D’ORIGINE',
    'font.scopeNote':'Uniquement les textes standards. Le lettrage illustré est conservé.',
    'font.loading':'Chargement de la police…','font.failed':'Cette police n’a pas pu être chargée. Essaie un fichier OTF, TTF ou WOFF.',
    'font.tooLarge':'Choisis un fichier de police de moins de 2 Mo.',
    'font.active':name=>name+' appliquée aux textes standards.',
    'font.session':name=>name+' appliquée pour cette session.',
    'font.sample':'BLACKJACK · BRAVO !','font.sampleCopy':'Gagner la table. Objectif 250 $ · Chance ×1,5.'
  });
  Object.assign(STR.en,{
    'font.title':'TEXT FONT','font.import':'CHANGE FONT','font.reset':'ORIGINAL FONT',
    'font.scopeNote':'Standard text only. Illustrated lettering is preserved.',
    'font.loading':'Loading font…','font.failed':'This font could not be loaded. Try an OTF, TTF or WOFF file.',
    'font.tooLarge':'Choose a font file smaller than 2 MB.',
    'font.active':name=>name+' applied to standard text.',
    'font.session':name=>name+' applied for this session.',
    'font.sample':'BLACKJACK · WELL DONE!','font.sampleCopy':'Clear the table. Goal $250 · Streak ×1.5.'
  });
  const root=document.documentElement,button=$('fontImport'),input=$('fontFile'),resetButton=$('fontReset'),status=$('fontStatus');
  const key='colddeck-text-font';let active=null,revision=0,serial=0,feedback='',renderedLang='';
  function read(key){try{return localStorage.getItem(key);}catch{return null;}}
  function remove(key){try{localStorage.removeItem(key);}catch{}}
  function save(record){try{localStorage.setItem(key,JSON.stringify(record));return true;}catch{return false;}}
  function valid(record){return record&&typeof record.name==='string'&&typeof record.data==='string'&&record.data.startsWith('data:')&&record.data.length<3*1024*1024;}
  function stored(){
    try{const record=JSON.parse(read(key));if(valid(record))return record;}catch{}
    // Keep an already imported font when upgrading the former name selector.
    const id=read('colddeck-font-preview');
    if(id&&id!=='current'){
      const record={name:id.replace(/(^|-)(\w)/g,(_,separator,letter)=>(separator?' ':'')+letter.toUpperCase()),data:read('colddeck-font-file-'+id)};
      if(valid(record))return record;
    }
    return null;
  }
  function refresh(){
    if(!button)return;
    if(renderedLang!==LANG){
      renderedLang=LANG;$('fontTitle').textContent=t('font.title');$('fontScopeNote').textContent=t('font.scopeNote');
      button.textContent=t('font.import');resetButton.textContent=t('font.reset');
      $('fontSampleTitle').innerHTML=ColdDeckArt.lettering(t('font.sample'));
      $('fontSampleCopy').textContent=t('font.sampleCopy');
    }
    resetButton.hidden=!active;
    status.textContent=feedback?t(feedback,active?.name):'';
  }
  function apply(){
    root.style.removeProperty('--game-type');root.style.removeProperty('--preview-font');root.style.removeProperty('--copy-font');
    if(active){root.dataset.fontPreview='copy';root.style.setProperty('--reading-font','"'+active.family+'", "Baloo 2", Arial, sans-serif');}
    else{delete root.dataset.fontPreview;root.style.removeProperty('--reading-font');}
    refresh();window.ColdDeckRaster?.refresh();
  }
  async function load(record,request){
    const family='Cold Deck Text '+(++serial),face=new FontFace(family,'url("'+record.data+'")',{style:'normal',weight:'400'});
    await face.load();if(request!==revision)return false;
    document.fonts.add(face);const previous=active;
    active={...record,family,face};
    const persisted=save(record);feedback=persisted?'font.active':'font.session';
    if(persisted){remove('colddeck-font-preview');remove('colddeck-font-scope');}
    apply();if(previous)document.fonts.delete(previous.face);return true;
  }
  async function change(makeRecord){
    const request=++revision;feedback='font.loading';button.disabled=true;refresh();
    try{return await load(await makeRecord(),request);}
    catch{if(request===revision){feedback='font.failed';refresh();}return false;}
    finally{if(request===revision)button.disabled=false;}
  }
  function importFile(file){
    if(!file)return Promise.resolve(false);
    if(file.size>2*1024*1024){feedback='font.tooLarge';refresh();return Promise.resolve(false);}
    return change(async()=>({name:file.name,data:await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);
    })}));
  }
  function reset(){
    revision++;if(active)document.fonts.delete(active.face);active=null;feedback='';button.disabled=false;
    remove(key);remove('colddeck-font-preview');remove('colddeck-font-scope');apply();
  }
  if(!button)return {refresh};
  button.addEventListener('click',()=>input.click());
  input.addEventListener('change',()=>{importFile(input.files?.[0]);input.value='';});
  resetButton.addEventListener('click',reset);
  apply();const record=stored(),ready=record?change(()=>record):Promise.resolve(true);
  const api={refresh,importFile,reset,ready,get selected(){return active?.name||'current';},get scope(){return 'copy';}};
  window.ColdDeckFonts=api;return api;
})();

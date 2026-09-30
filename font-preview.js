/* Personal font previews stay on this device; no font file is sent to a server. */
const ColdDeckFonts=(()=>{
  const choices=Object.freeze([
    {id:'think-smart',name:'Think Smart',author:'Lettersiro Studio',source:'https://www.dafont.com/think-smart.font'},
    {id:'lemon-juice',name:'Lemon Juice',author:'Asd Studio',source:'https://www.dafont.com/lemon-juice.font'},
    {id:'tomcat',name:'Tomcat',author:'Trim Studio',source:'https://www.dafont.com/tomcat.font'},
    {id:'holy-macaroni',name:'Holy Macaroni',author:'D K',source:'https://www.dafont.com/holy-macaroni.font'},
    {id:'little-boy',name:'Little Boy',author:'Luluk Surotul',source:'https://www.dafont.com/little-boy.font'}
  ]);
  Object.assign(STR.fr,{
    'font.title':'POLICE DU JEU','font.current':'Lettrage actuel','font.scope':'Appliquer à',
    'font.display':'Titres, boutons et chiffres','font.all':'Tout le texte','font.import':'Importer le fichier',
    'font.loading':'Chargement de la police…','font.load':name=>'Importe le fichier de '+name+' pour voir son rendu.',
    'font.failed':'Cette police n’a pas pu être chargée. Essaie un fichier OTF, TTF ou WOFF.',
    'font.tooLarge':'Choisis un fichier de police de moins de 2 Mo.',
    'font.active':name=>name+' appliquée.','font.session':name=>name+' appliquée pour cette session.',
    'font.sample':'BLACKJACK · BRAVO !','font.sampleCopy':'Gagner la table. Objectif 250 $ · Chance ×1,5.',
    'font.source':'Voir sur DaFont','font.demo':'Versions d’essai pour usage personnel.'
  });
  Object.assign(STR.en,{
    'font.title':'GAME FONT','font.current':'Current lettering','font.scope':'Apply to',
    'font.display':'Headings, buttons and numbers','font.all':'All text','font.import':'Import font file',
    'font.loading':'Loading font…','font.load':name=>'Import the '+name+' font file to preview it.',
    'font.failed':'This font could not be loaded. Try an OTF, TTF or WOFF file.',
    'font.tooLarge':'Choose a font file smaller than 2 MB.',
    'font.active':name=>name+' applied.','font.session':name=>name+' applied for this session.',
    'font.sample':'BLACKJACK · WELL DONE!','font.sampleCopy':'Clear the table. Goal $250 · Streak ×1.5.',
    'font.source':'View on DaFont','font.demo':'Trial versions for personal use.'
  });
  const root=document.documentElement,select=$('fontChoice'),scopeSelect=$('fontScope');
  const input=$('fontFile'),importButton=$('fontImport'),status=$('fontStatus'),source=$('fontSource');
  const data=new Map(),faces=new Map(),ranges=new Map();let selected='current',scope='display',revision=0,persistent=true;
  const key='colddeck-font-preview',scopeKey='colddeck-font-scope',fileKey=id=>'colddeck-font-file-'+id;
  const family=choice=>'Cold Deck '+choice.name;
  function read(key,fallback){try{return localStorage.getItem(key)||fallback;}catch{return fallback;}}
  function save(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
  function choiceFor(id){return choices.find(choice=>choice.id===id);}
  function refresh(){
    if(!select)return;
    const wanted=select.value,choice=choiceFor(wanted);
    select.options[0].textContent=t('font.current');
    scopeSelect.options[0].textContent=t('font.display');scopeSelect.options[1].textContent=t('font.all');
    $('fontTitle').textContent=t('font.title');$('fontScopeLabel').textContent=t('font.scope');
    importButton.textContent=t('font.import');source.textContent=t('font.source');
    $('fontDemo').textContent=t('font.demo');
    $('fontSampleTitle').innerHTML=ColdDeckArt.lettering(t('font.sample'));
    $('fontSampleCopy').textContent=t('font.sampleCopy');
    importButton.hidden=!choice||data.has(wanted);source.hidden=!choice;
    if(choice){source.href=choice.source;source.title=choice.name+' · '+choice.author;}
    if(choice&&selected!==wanted&&!faces.has(wanted))status.textContent=t('font.load',choice.name);
    else status.textContent=selected==='current'?'':t(persistent?'font.active':'font.session',choiceFor(selected).name);
  }
  function apply(id){
    selected=id;select.value=id;scopeSelect.value=scope;
    if(id==='current'){
      delete root.dataset.fontPreview;root.style.removeProperty('--preview-font');root.style.removeProperty('--game-type');root.style.removeProperty('--copy-font');
    }else{
      const font='"'+family(choiceFor(id))+'", "Baloo 2", Arial, sans-serif';
      root.dataset.fontPreview=id;root.style.setProperty('--preview-font',font);root.style.setProperty('--game-type',font);
      if(scope==='all')root.style.setProperty('--copy-font',font);else root.style.removeProperty('--copy-font');
    }
    save(key,id);save(scopeKey,scope);refresh();window.ColdDeckRaster?.refresh();
  }
  async function prepare(id){
    if(faces.has(id))return faces.get(id);
    const fontData=data.get(id),choice=choiceFor(id);if(!fontData||!choice)return null;
    if(typeof FontFace!=='function'||!document.fonts)throw Error('Font loading unavailable');
    const unicodeRange=ranges.get(id);
    const face=new FontFace(family(choice),'url("'+fontData+'")',{style:'normal',weight:'400',...(unicodeRange?{unicodeRange}:{})});
    const ready=face.load().then(loaded=>{document.fonts.add(loaded);return loaded;});
    faces.set(id,ready);
    ready.catch(()=>{if(faces.get(id)===ready)faces.delete(id);});
    return ready;
  }
  async function set(id){
    if(id!=='current'&&!choiceFor(id))return false;
    const request=++revision;select.value=id;
    if(id==='current'){apply(id);return true;}
    if(!data.has(id)){refresh();return false;}
    status.textContent=t('font.loading');
    try{
      await prepare(id);if(request!==revision)return false;
      apply(id);return true;
    }catch{
      if(request===revision){refresh();status.textContent=t('font.failed');}
      return false;
    }
  }
  async function importFile(file,id=select.value){
    if(!file||!choiceFor(id))return false;
    if(file.size>2*1024*1024){status.textContent=t('font.tooLarge');return false;}
    const previous=data.get(id),oldFace=faces.get(id),oldRange=ranges.get(id),request=++revision;
    status.textContent=t('font.loading');
    try{
      const encoded=await new Promise((resolve,reject)=>{
        const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);
      });
      if(request!==revision)return false;
      data.set(id,encoded);faces.delete(id);ranges.delete(id);
      if(!await set(id)){if(previous)data.set(id,previous);else data.delete(id);if(oldFace)faces.set(id,oldFace);if(oldRange)ranges.set(id,oldRange);return false;}
      if(oldFace)oldFace.then(face=>document.fonts.delete(face)).catch(()=>{});
      persistent=save(fileKey(id),encoded);refresh();return true;
    }catch{status.textContent=t('font.failed');return false;}
  }
  if(!select)return {choices,refresh};
  select.add(new Option(t('font.current'),'current'));
  choices.forEach(choice=>{
    select.add(new Option(choice.name,choice.id));
    const saved=window.__coldDeckPreviewFonts?.[choice.id]||read(fileKey(choice.id),'');
    if(saved&&saved.startsWith('data:')&&saved.length<3*1024*1024)data.set(choice.id,saved);
    const range=window.__coldDeckPreviewRanges?.[choice.id];if(range)ranges.set(choice.id,range);
  });
  scope=read(scopeKey,'display')==='all'?'all':'display';scopeSelect.value=scope;
  select.addEventListener('change',()=>{persistent=true;set(select.value);});
  scopeSelect.addEventListener('change',()=>{scope=scopeSelect.value==='all'?'all':'display';apply(selected);});
  importButton.addEventListener('click',()=>input.click());
  input.addEventListener('change',()=>{importFile(input.files?.[0]);input.value='';});
  const saved=read(key,'current'),restored=choiceFor(saved)&&data.has(saved)?saved:'current';
  const ready=set(restored);
  const api={choices,refresh,set,importFile,ready,get selected(){return selected;},get scope(){return scope;}};
  window.ColdDeckFonts=api;return api;
})();

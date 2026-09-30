/* Static cut-paper scenery. Its geometry never uses the game's random stream. */
const ColdDeckBackgrounds=(() => {
  const key='colddeck-background';
  const palettes=[
    ['minuit','Minuit','Midnight','#19232f','#344658','#283746','#c2a15a','#728fb2'],
    ['obsidienne','Obsidienne','Obsidian','#1c1d23','#393a45','#2a2c35','#a795c4','#d1b66f'],
    ['prune','Velours prune','Plum velvet','#28212d','#4c3c58','#3a2e43','#b99bcf','#cbb378'],
    ['sapin','Tapis vert','Green felt','#1b2b27','#375147','#2b4038','#c2ab62','#74a58e'],
    ['bordeaux','Bordeaux','Burgundy','#2a1d25','#543b46','#3d2b34','#c7928d','#c7ab67'],
    ['petrole','Pétrole','Petrol','#172a2e','#33525a','#263d44','#83b8b8','#b6a269'],
    ['ardoise','Ardoise','Slate','#222a33','#435363','#313d4b','#89a6b9','#b5a5ca'],
    ['cuivre','Cuivre','Copper','#2b2421','#59453c','#40322d','#c78c68','#a99a79'],
    ['indigo','Indigo','Indigo','#1e2236','#3b4265','#2d334b','#8899cc','#bba4cb'],
    ['aubergine','Aubergine','Aubergine','#291f30','#503c60','#3b2d47','#aa86c1','#cdb67a'],
    ['emeraude','Émeraude','Emerald','#182b28','#31564b','#254138','#79ad92','#bfb065'],
    ['doree','Nuit dorée','Golden night','#272722','#4a493b','#37382e','#cdb15f','#a69a77'],
    ['acier','Acier','Steel','#202931','#41515b','#303e47','#9cacb5','#7e98ac'],
    ['terre','Terre brûlée','Burnt earth','#2c2422','#5b433b','#42332d','#c58c75','#c3aa7a'],
    ['lagune','Lagune','Lagoon','#18292e','#34515e','#263c48','#7ab5bf','#939fc9'],
    ['grenat','Grenat','Garnet','#2d1c24','#57333f','#3f2731','#b8798c','#c8a567'],
    ['lilas','Lilas fumé','Smoky lilac','#272632','#4b465f','#383447','#aba0c7','#b5b6a0'],
    ['carbone','Carbone','Carbon','#1c2023','#373f44','#292f34','#a5b0b1','#c1a66c'],
    ['bouteille','Vert bouteille','Bottle green','#202922','#414f3e','#2f3c2e','#91a570','#bba46c'],
    ['crepuscule','Crépuscule','Twilight','#292331','#514253','#3d3142','#bd91b1','#ad9dcd']
  ];
  const themes=[{id:'classic',fr:'Classique',en:'Classic',base:'#20252a',classic:true},
    ...palettes.map(([id,fr,en,base,edge,fold,accent,second],index)=>({id,fr,en,base,edge,fold,accent,second,index}))];
  let selected='classic';
  function name(theme){return LANG==='fr'?theme.fr:theme.en;}
  function scenery(theme){
    const scene=document.createElement('span');scene.className='table-background';
    scene.setAttribute('aria-hidden','true');scene.style.setProperty('--scene-base',theme.base);
    if(theme.classic){scene.classList.add('background-original');return scene;}
    for(const tone of ['edge','fold','accent','second'])scene.style.setProperty('--scene-'+tone,theme[tone]);
    const variant=Math.floor(theme.index/5),family=theme.index%5,width=10+variant*2;
    const shard=(points,tone='edge',right=false,reverse=false)=>{
      const paper=document.createElement('i');paper.className='background-shard';
      paper.style.background=`var(--scene-${tone})`;
      paper.style.clipPath='polygon('+points.map(([x,y])=>`${right?100-x:x}% ${reverse?100-y:y}%`).join(',')+')';
      scene.append(paper);
    };
    for(const right of [false,true]){
      const reverse=right!==!!(variant%2),w=width+(right?2:0);
      if(family===0){
        shard([[0,0],[w*.35,0],[w,23],[w*.5,19],[w*.9,51],[0,39]],'edge',right,reverse);
        shard([[0,43],[w*.58,37],[w*.3,69],[w,61],[0,95]],'edge',right,reverse);
        shard([[0,10],[w*.34,31],[0,27]],'fold',right,reverse);
      }else if(family===1){
        shard([[0,0],[w,13],[w*.27,38],[0,31]],'edge',right,reverse);
        shard([[0,34],[w*.8,48],[w*.24,73],[0,60]],'fold',right,reverse);
        shard([[0,65],[w,78],[w*.36,100],[0,100]],'edge',right,reverse);
      }else if(family===2){
        shard([[0,0],[w*1.1,0],[0,42]],'edge',right,reverse);
        shard([[0,0],[w*.72,27],[0,17]],'fold',right,reverse);
        shard([[0,100],[w*.98,47],[w*.6,85]],'edge',right,reverse);
        shard([[0,100],[w*.5,70],[w*1.12,94]],'fold',right,reverse);
      }else if(family===3){
        shard([[0,0],[w*.42,0],[w,18],[w*.35,32],[w*.85,49],[w*.3,62],[w,82],[w*.35,100],[0,100]],'edge',right,reverse);
        shard([[0,16],[w*.58,32],[0,46]],'fold',right,reverse);
        shard([[0,58],[w*.6,73],[0,91]],'fold',right,reverse);
      }else{
        shard([[0,0],[w*.6,0],[w,29],[w*.25,20],[0,44]],'edge',right,reverse);
        shard([[0,48],[w*.4,38],[w*.95,73],[0,61]],'fold',right,reverse);
        shard([[0,68],[w*.75,61],[w*.45,83],[w,100],[0,100]],'edge',right,reverse);
      }
      const corner=right?variant%2===0:variant%2===1;
      shard([[0,100],[w*.7,79+variant*2],[w*.4,100]],'second',right,corner);
      shard([[0,91-variant],[w*.42,100],[0,100]],'accent',right,corner);
    }
    return scene;
  }
  function syncSelection(){
    for(const button of $('backgroundGrid').children){
      const active=button.dataset.backgroundId===selected;
      button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
    }
  }
  function refresh(){
    const grid=$('backgroundGrid');if(!grid)return;
    grid.setAttribute('aria-label',t('background.title'));
    const buttons=themes.map(theme=>{
      const button=document.createElement('button');button.type='button';button.className='background-choice';
      button.dataset.action='select-background';button.dataset.backgroundId=theme.id;button.setAttribute('data-reading-label','');
      const preview=document.createElement('span');preview.className='background-preview';preview.append(scenery(theme));
      const label=document.createElement('span');label.className='background-name';label.textContent=name(theme);
      const check=document.createElement('span');check.className='background-check';check.setAttribute('aria-hidden','true');
      check.innerHTML='<svg viewBox="0 0 16 16" width="16" height="16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      button.append(preview,label,check);return button;
    });
    grid.replaceChildren(...buttons);syncSelection();
  }
  function select(id,persist=true){
    const theme=themes.find(theme=>theme.id===id);if(!theme)return false;
    selected=id;
    const bg=$('bg');bg.dataset.background=id;bg.style.setProperty('--selected-bg-base',theme.base);
    $('tableBackdrop').replaceChildren(...(theme.classic?[]:[scenery(theme)]));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.base);
    if(persist)try{localStorage.setItem(key,id);}catch(e){}
    syncSelection();return true;
  }
  function open(){
    if(!$('pauseScreen').classList.contains('show'))return false;
    refresh();$('pauseScreen').classList.remove('show');$('backgroundScreen').classList.add('show');return true;
  }
  function close(){
    if(!$('backgroundScreen').classList.contains('show'))return;
    $('backgroundScreen').classList.remove('show');$('pauseScreen').classList.add('show');
  }
  const api={themes,open,close,select,refresh,get selected(){return selected;}};
  window.ColdDeckBackgrounds=api;
  let saved;try{saved=localStorage.getItem(key);}catch(e){}
  select(themes.some(theme=>theme.id===saved)?saved:'classic',false);
  refresh();return api;
})();

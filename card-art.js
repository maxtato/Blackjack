/* Generated bitmap artwork with exact game-controlled ranks and pip counts. */
const ColdDeckArt = (() => {
  const suitKeys={'♠':'spade','♥':'heart','♦':'diamond','♣':'club'};
  const letterCells=Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZÉÈÀÇÙÊÔÛÎÏ');
  const numberCells=Array.from('0123456789+×$−∞?');
  const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function glyph(character,index=0){
    const c=character.toUpperCase().replace('-','−');
    const direction={'←':'left','→':'right','↗':'forward','✕':'close'}[c];
    if(direction)return `<i class="raster-nav" data-direction="${direction}" aria-hidden="true"></i>`;
    const letter=letterCells.indexOf(c),number=numberCells.indexOf(c);
    if(letter<0&&number<0)return `<span class="raster-punctuation">${safe(character)}</span>`;
    const cols=letter>=0?6:4,cell=letter>=0?letter:number;
    const rows=letter>=0?6:4;
    return `<i class="raster-glyph live-letter" data-glyph="${safe(c)}" data-font="${letter>=0?'letters':'numbers'}" style="--glyph-x:${cell%cols/(cols-1)*100}%;--glyph-y:${Math.floor(cell/cols)/(rows-1)*100}%;--letter-duration:${1.05+(index%4)*.08}s;--letter-delay:-${(index%7)*.19}s"></i>`;
  }
  function lettering(value){
    const text=String(value);let index=0;
    const words=text.split(/(\s+)/u).map(word=>word.trim()?`<span class="raster-word">${Array.from(word).map(c=>glyph(c,index++)).join('')}</span>`:safe(word)).join('');
    return `<span class="raster-copy"><span class="sr-only">${safe(text)}</span><span class="raster-ink" aria-hidden="true">${words}</span></span>`;
  }
  const suit=(s,size=24)=>`<i class="suit raster-suit" data-suit-art="${suitKeys[s]||'spade'}" style="width:${size}px;height:${size}px" aria-hidden="true"></i>`;
  const pip=(s,x,y,size=15,angle=0)=>`<i class="card-pip raster-suit" data-suit-art="${suitKeys[s]}" style="left:${x}%;top:${y/142*100}%;width:${size}%;height:${size/142*100}%;transform:translate(-50%,-50%) rotate(${angle}deg)" aria-hidden="true"></i>`;
  const layouts={
    2:[[50,43],[50,99]],3:[[50,38],[50,71],[50,104]],
    4:[[33,42],[67,42],[33,100],[67,100]],
    5:[[33,40],[67,40],[50,71],[33,102],[67,102]],
    6:[[33,37],[67,37],[33,71],[67,71],[33,105],[67,105]],
    7:[[33,35],[67,35],[50,53],[33,71],[67,71],[33,107],[67,107]],
    8:[[33,33],[67,33],[50,52],[33,71],[67,71],[50,90],[33,109],[67,109]],
    9:[[33,32],[67,32],[33,58],[67,58],[50,71],[33,84],[67,84],[33,110],[67,110]],
    10:[[33,39],[67,39],[33,55],[67,55],[33,71],[67,71],[33,87],[67,87],[33,103],[67,103]]
  };
  function face(rank,s){
    const courts={K:'king',Q:'queen',J:'jack'};
    const art=courts[rank]
      ?`<img class="court-image" data-court="${rank}" src="${image('court-'+courts[rank])}" width="1024" height="1536" alt="" decoding="async" draggable="false">`
      :rank==='A'?pip(s,50,70,53):(layouts[Number(rank)]||[]).map(([x,y])=>pip(s,x,y,Number(rank)===10?18:Number(rank)>8?20:22,y>71?180:0)).join('');
    return `<div class="card-art raster-card-art" aria-hidden="true">${art}</div>`;
  }
  // HD raster illustrations shared by inventory, shops, effects and menus.
  const illustrationKeys=new Set(["lunettes", "jeton", "clope", "as", "froid", "compteur", "mecene", "usurier", "collector", "maitresse", "bruleur", "portebonheur", "diplomate", "talisman", "aimant", "phare", "etoile", "jugement", "soleil", "diable", "lune", "etoileD", "pendu", "magicien", "roue", "soin", "assurance", "videur", "bank", "pourboire", "net", "tarot", "contact", "relic2", "plafond", "elan", "cashplus", "boon2", "mult", "baraplus", "evt3"]);
  const effectAliases={bankI:'bank',pourboireI:'pourboire',income:'pourboire',betmax:'plafond',filet:'net',cash:'soin'};
  const interfaceArt={flag:'phare',trophy:'ui-trophy',scroll:'boon2',forcee:'baraplus',glass:'baraplus',arc:'lune',suite:'elan',couleur:'tarot',doree:'etoile',diamond:'relic2'};
  const image=key=>`assets/illustrations/${key}.webp`;
  const backKeys={cb9:'back-lightning',cb10:'back-luck',cb11:'back-heart',cb12:'back-moon',cb13:'back-dice',cb14:'back-crown',cb15:'back-eye',cb16:'back-cherry',cb18:'back-flame',cb19:'back-diamond',cb22:'back-snake',cb26:'back-sun'};
  const backKey=id=>backKeys[id]||backKeys.cb9;
  const illustration=(key,className='scene-art',lazy=false)=>`<img class="${className}" src="${image(key)}" width="1024" height="1024" alt="" aria-hidden="true" ${lazy?'loading="lazy" ':''}decoding="async" draggable="false">`;
  const back=(id,lazy=false)=>`<img class="card-back-image" src="${image(backKey(id))}" width="1024" height="1536" alt="" aria-hidden="true" ${lazy?'loading="lazy" ':''}decoding="async" draggable="false">`;
  function effect(id){
    const requested=effectAliases[id]||id;
    const key=illustrationKeys.has(requested)?requested:'etoile';
    return `<img class="effect-symbol effect-illustration" data-effect-symbol="${key}" src="${image(key)}" width="1024" height="1024" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false">`;
  }
  const icon=n=>`<img class="pxi raster-icon" src="${image(interfaceArt[n]||'etoile')}" width="1024" height="1024" alt="" aria-hidden="true" decoding="async" draggable="false">`;
  return {suit,face,icon,effect,image,illustration,back,backKey,lettering};
})();

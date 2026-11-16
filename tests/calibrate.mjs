// Per-table clear rate at the advised bankroll, one attempt per sample, no retry.
// Usage: FROM=0 TO=24 N=300 DECK=full|starter SECOND=0|1 SCALE='{"3":1.1}' node calibrate.mjs
import {engine} from './engine.mjs';
const h=engine(),a=h.api;
const N=+(process.env.N||300),FROM=+(process.env.FROM||0),TO=+(process.env.TO||24);
const full=(process.env.DECK||'full')==='full',second=process.env.SECOND==='1';
const goals=JSON.parse(process.env.GOALS||'null');
const unlocks=full?Object.fromEntries(a.TABLE_DECK.filter(c=>c.cost).map(c=>['card_'+c.id,1])):{};
const rank={lunettes:10,magicien:9,talisman:9,pendu:8,as:7,diplomate:6,jeton:5,compteur:4,phare:4,clope:3,etoile:3,diable:2};
function basic(g){
  const {total:v,soft}=a.handValue(g.pHand),two=g.pHand.length===2;
  const up=g.table.rule==='mute'?10:g.dHand[0].r==='A'?11:Math.min(10,Number(g.dHand[0].r)||10);
  if(!g.splitActive&&two&&g.pHand[0].r===g.pHand[1].r&&['A','8'].includes(g.pHand[0].r)&&g.bank>=g.bet)return 'split';
  if(!g.splitActive&&two&&v<17&&g.pHand[0].r!==g.pHand[1].r&&g.bank>=g.bet){
    if(!soft&&((v===11&&up!==11)||(v===10&&up<=9)||(v===9&&up>=3&&up<=6)))return 'double';
    if(soft&&v<=18&&v>=15&&up>=4&&up<=6)return 'double';
  }
  if(soft)return v<=17||(v===18&&up>=9)?'hit':'stand';
  return v<=11||(v===12&&(up<4||up>6))||(v<=16&&up>=7)?'hit':'stand';
}
export function pickCards(buy){
  const g=a.G;if(!g.cardOffer)a.rollTableCards(g.preparingNext?a.RUN[g.tableIdx+1]:g.table);
  const order=g.cardOffer.map((c,i)=>({i,p:(rank[c.id]||0)+(g.table.rule==='sec'&&c.id==='diplomate'?10:0)})).sort((x,y)=>y.p-x.p);
  a.toggleTableCard(order[0].i);
  if(buy&&order[1]&&a.canBuySecondCard())a.toggleTableCard(order[1].i);
}
export function playHand(){
  const g=a.G,choices=a.betChoices().filter(b=>b<=g.bank);
  g.bet=choices.at(-1)||g.table.min;g.betChosen=true;
  h.w.__screen='';a.deal();h.flush();
  let moves=0;
  while(!h.w.__screen&&g.phase==='play'){
    if(++moves>30)throw Error('Too many actions');
    if(g.event?.id==='express'){a.playerStand();h.flush();continue;}
    const v=a.handValue(g.pHand).total;
    const pendu=g.consumables.findIndex(x=>x.id==='pendu');
    const magic=g.consumables.findIndex(x=>x.id==='magicien');
    if(magic>=0&&v>=12&&v<=16){a.useConsumable(magic);a.playerHit();h.flush();continue;}
    if(pendu>=0&&v>=12&&v<=16&&!g.penduArmed){a.useConsumable(pendu);a.playerHit();h.flush();continue;}
    for(let i=g.consumables.length-1;i>=0;i--){const id=g.consumables[i].id;if(id==='etoile'||(id==='diable'&&v>=18))a.useConsumable(i);}
    let action=basic(g);
    if(a.hasRelic('lunettes')&&!g.peekUsed&&v<21){
      a.usePeek();const after=a.handValue([...g.pHand,g.shoe.at(-1)]).total;
      action=after>21?'stand':(after>=v?'hit':action);
    }
    if(action==='hit')a.playerHit();else if(action==='double')a.playerDouble();else if(action==='split')a.playerSplit();else a.playerStand();
    h.flush();
  }
}
export {h,a,unlocks};
if(process.argv[1].endsWith('calibrate.mjs')){
  const out=[];
  for(let ti=FROM;ti<TO;ti++){
    let clears=0,hands=0,stars3=0;
    if(goals){a.RUN[ti].goal=goals[ti];a.RUN[ti].master=goals[ti];}
    for(let n=0;n<N;n++){
      h.reset(751403+ti*99991+n*53,unlocks);a.setTable(ti);
      a.G.bank=a.G.table.cap+a.G.table.entry;a.enterTable(0);h.flush();h.w.__screen='';a.G.tokens=0;
      pickCards(second);a.startPreparedTable();h.flush();
      while(!h.w.__screen&&a.G.phase!=='victory')playHand();
      if(a.G.phase==='victory'){clears++;if(a.G.lastStars===3)stars3++;}
      hands+=a.G.stats.played;
    }
    out.push({t:ti+1,goal:a.RUN[ti].goal,clear:Math.round(clears/N*1000)/10,hands:Math.round(hands/N*10)/10,s3:Math.round(stars3/Math.max(1,clears)*100)});
  }
  console.log(JSON.stringify(out));h.close();
}

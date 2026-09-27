import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {engine,card} from './engine.mjs';
const h=engine(),a=h.api;
const N=Number(process.env.CIRCUIT_SAMPLES||1000);
const maxUnlocks={bank:5,pourboire:3,net:3,tarot:1,contact:1,relic2:1};
const results={samples:N,method:'Original game rules and timer callbacks; rendering, audio, adverts and animation waits are stubbed. Policies use only visible cards, except a legal one-card peek with Lunettes. Probabilities describe these policies, not optimal human play.',profiles:[],isolated:[],marginal:[]};
const zero=()=>({attempts:0,clears:0,failures:0,hands:0,wins:0,stars:[0,0,0,0],baraka3:0,baraka4:0,contracts:0,force:0,early:0});
function basic(g,advanced=true){
  const {total:v,soft}=a.handValue(g.pHand),two=g.pHand.length===2;
  const up=g.table.rule==='mute'?10:g.dHand[0].r==='A'?11:Math.min(10,Number(g.dHand[0].r)||10);
  if(advanced&&!g.splitActive&&two&&g.pHand[0].r===g.pHand[1].r&&['A','8'].includes(g.pHand[0].r)&&g.bank>=g.bet)return 'split';
  if(advanced&&!g.splitActive&&two&&v<17&&g.pHand[0].r!==g.pHand[1].r&&g.bank>=g.bet){
    if(!soft&&((v===11&&up!==11)||(v===10&&up<=9)||(v===9&&up>=3&&up<=6)))return 'double';
    if(soft&&v<=18&&v>=15&&up>=4&&up<=6)return 'double';
  }
  if(soft)return v<=17||(v===18&&up>=9)?'hit':'stand';
  return v<=11||(v===12&&(up<4||up>6))||(v<=16&&up>=7)?'hit':'stand';
}
function playHand(profile,stats){
  const g=a.G;
  const choices=a.betChoices().filter(b=>b<=g.bank);
  if(profile.stake==='max')g.bet=choices.at(-1)||g.table.min;
  else if(profile.stake==='middle')g.bet=choices[Math.floor((choices.length-1)/2)]||g.table.min;
  g.betChosen=true;
  const beforePlayed=g.stats.played,beforeWon=g.stats.won;
  const oldScreen=h.w.__screen;h.w.__screen='';
  a.deal();h.flush();
  let moves=0,forced=false;
  while(!h.w.__screen&&g.phase==='play'){
    if(++moves>30)throw Error('Too many actions');
    const v=a.handValue(g.pHand).total;
    if(profile.items){
      const pendu=g.consumables.findIndex(x=>x.id==='pendu');if(pendu>=0&&v>=12&&!g.penduArmed)a.useConsumable(pendu);
      const magic=g.consumables.findIndex(x=>x.id==='magicien');
      if(magic>=0&&v>=8&&v<=20){a.useConsumable(magic);if(g.pHand.length===2&&v<=11&&g.bank>=g.bet&&g.pHand[0].r!==g.pHand[1].r)a.playerDouble();else a.playerHit();h.flush();continue;}
      for(let i=g.consumables.length-1;i>=0;i--){
        const id=g.consumables[i].id;
        if(id==='soleil'||(['lune','diable','etoileD','roue'].includes(id)&&v>=18)||(['etoile','jugement'].includes(id)&&v>=19))a.useConsumable(i);
      }
    }
    let action=profile.basic===false?(v<17?'hit':'stand'):basic(g,profile.advanced!==false);
    if(profile.items&&a.hasRelic('lunettes')&&!g.peekUsed){
      a.usePeek();const known=g.shoe.at(-1),after=a.handValue([...g.pHand,known]).total;
      if(after>21)action='stand';
      else if(after>=v&&after<=21&&v<21)action='hit';
    }
    if(profile.force&&v>=17&&v<=18&&(profile.force==='unlimited'||!forced)){
      a.forcerChance();forced=true;stats.force++;h.flush();continue;
    }
    if(action==='hit'){if(v>=17&&v<=20)g.insisted=true;a.playerHit();}
    else if(action==='double')a.playerDouble();
    else if(action==='split')a.playerSplit();
    else a.playerStand();
    h.flush();
  }
  stats.hands+=g.stats.played-beforePlayed;stats.wins+=g.stats.won-beforeWon;
  if(g.tableMaxBaraka>=a.BARAKA_STEPS[2])stats.baraka3++;
  if(g.tableMaxBaraka>=a.BARAKA_STEPS[3])stats.baraka4++;
  return h.w.__screen;
}
function tableAttempt(profile,stats){
  stats.attempts++;
  while(!h.w.__screen)playHand(profile,stats);
  const g=a.G;
  if(h.w.__screen==='shop'){
    stats.clears++;stats.stars[g.lastStars]++;if(g.hand<g.table.mains)stats.early++;if(g.contract?.done)stats.contracts++;
    return true;
  }
  stats.failures++;return false;
}
const priority={as:10,lunettes:10,talisman:9,collector:8,clope:7,diplomate:6,bruleur:5,mecene:8,usurier:9,maitresse:6,froid:2,phare:2};
function shop(profile,history){
  if(!profile.shop)return;
  const g=a.G,nx=a.RUN[g.tableIdx+1];if(!nx)return;
  const reserve=Math.max(nx.min*3+nx.entry,g.bank*.68);
  const ranked=a.offers.map((it,i)=>({it,i,priority:it.type==='relic'?(priority[it.data.id]||0):it.type==='tarot'&&it.data.id==='magicien'?4:0})).sort((x,y)=>y.priority-x.priority);
  for(const {it,i,priority:p} of ranked){
    if(!p||it.bought)continue;
    const id=it.data.id,cost=a.itemCost(it.data);

    if(g.bank-cost<reserve)continue;
    const size=it.type==='relic'?g.relics.length:g.consumables.length,max=it.type==='relic'?a.relicMax():a.consumableSlots();
    if(size>=max)continue;
    a.buyShopItem(i,{classList:{add(){}}},{disabled:false,textContent:''});history[id]=(history[id]||0)+1;
  }
}
const profiles=[
  {name:'Débutant, mise présélectionnée, tire jusqu’à 17',basic:false,stake:'default',upgrades:{},runs:N},
  {name:'Stratégie de base, mises maximales, sans achats',stake:'max',upgrades:{},runs:N},
  {name:'Stratégie de base, mises moyennes, sans achats',stake:'middle',upgrades:{},runs:N},
  {name:'Stratégie de base, achats ciblés, sans améliorations',stake:'max',items:true,shop:true,upgrades:{},runs:N},
  {name:'Améliorations maximales, achats ciblés',stake:'max',items:true,shop:true,upgrades:maxUnlocks,runs:N},
];
if(import.meta.url===pathToFileURL(process.argv[1]).href){
for(const p of profiles){
  const stats=a.RUN.map(zero),hist={},depths=[],rep=[],traces=[];let completions=0;
  for(let n=0;n<p.runs;n++){
    h.reset(19260817+n*37,p.upgrades);const trace=[];
    for(let iterations=0;iterations<40;iterations++){
      const g=a.G,idx=g.tableIdx;
      const passed=tableAttempt(p,stats[idx]);trace.push({table:idx+1,passed,hands:g.hand,bank:g.bank,relics:g.relics.map(r=>r.id),lives:g.tokens});
      if(passed){
        if(idx===23){completions++;a.cashOut();break;}
        shop(p,hist);h.w.__screen='';a.leaveShop();h.flush();
      }else if(g.tokens>0){h.w.__screen='';a.retryTable();h.flush();}
      else break;
    }
    depths.push(a.G.tableIdx+1);rep.push(a.repOnEnd(false));
    if(n===0||traces.length===0||trace.at(-1).table>traces.at(-1).at(-1).table)traces.push(trace);
  }
  results.profiles.push({name:p.name,runs:p.runs,completions,stats,purchases:hist,depths,rep,bestTrace:traces.at(-1)});
  console.log(JSON.stringify({profile:p.name,n:p.runs,completion:completions,meanDepth:depths.reduce((s,x)=>s+x,0)/p.runs,maxDepth:Math.max(...depths),purchases:hist}));
  fs.writeFileSync('balance-simulation.json',JSON.stringify(results,null,2));
}
// Isolate every table at its recommended bankroll to detect local walls without
// survivor selection from the early circuit. A table result is one attempt.
for(const build of [[],['as','lunettes','collector','clope','talisman']]){
 const data=[];
 for(let ti=0;ti<24;ti++){
  const stats=zero();
  for(let n=0;n<N;n++){
   h.reset(751403+ti*99991+n*53,build.length?{pourboire:3}:{});a.setTable(ti);
   a.G.bank=a.G.table.cap+a.G.table.entry;a.G.consumables=[];a.G.giftZones=[1,2,3,4,5,6,7,8];a.G.zoneGift=null;a.G.relics=build.map(id=>({...a.RELIC_POOL.find(r=>r.id===id)}));
   a.enterTable(0);h.flush();h.w.__screen='';a.G.tokens=0;
   tableAttempt({stake:'max',items:true},stats);
  }
  data.push({table:ti+1,...stats});
 }
 results.isolated.push({build:build.length?build:['aucune'],data});
 console.log(JSON.stringify({isolated:build.length?'5 reliques ciblées':'sans reliques',clearRates:data.map(x=>Math.round(x.clears/N*1000)/10)}));
 fs.writeFileSync('balance-simulation.json',JSON.stringify(results,null,2));
}
h.close();
}
export {h,a,maxUnlocks,zero,playHand,tableAttempt,shop};

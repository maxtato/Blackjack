// Whole expeditions from table 1 (three lives), then campaigns that resume and unlock cards.
// Usage: N=200 DECK=full|starter node expedition.mjs   |   MODE=campaign N=60 node expedition.mjs
import {h,a,unlocks,pickCards,playHand} from './calibrate.mjs';
const N=+(process.env.N||200),second=process.env.SECOND==='1';
function attempt(){while(!h.w.__screen&&a.G.phase!=='victory')playHand();return a.G.phase==='victory';}
function expedition(){
  let hands=0;
  pickCards(second);a.startPreparedTable();h.flush();
  for(let guard=0;guard<80;guard++){
    const before=a.G.stats.played,ok=attempt();hands+=a.G.stats.played-before;
    if(ok){
      if(a.G.tableIdx===23){a.cashOut();return {done:true,depth:24,hands};}
      h.w.__screen='';a.continueTableVictory();pickCards(second);a.startPreparedTable();h.flush();
    }else if(a.G.tokens>0){h.w.__screen='';a.retryTable();h.flush();}
    else{a.endRun?.(false);return {done:false,depth:a.G.tableIdx+1,hands};}
  }
  throw Error('expedition did not end');
}
const med=x=>x.slice().sort((p,q)=>p-q)[Math.floor(x.length/2)];
if(process.env.MODE==='campaign'){
  const runs=[],hands=[];
  for(let n=0;n<N;n++){
    h.reset(85771+n*89,{});let r=0,total=0,done=false;
    while(!done&&r<60){
      if(r>0){h.w.__screen='';a.startGame(Math.max(0,a.META.nuit.record.reached-1));h.flush();}
      const e=expedition();r++;total+=e.hands;done=e.done;
      for(const c of a.TABLE_DECK.filter(c=>c.cost&&!a.cardUnlocked(c)))if(a.META.nuit.rep>=c.cost)a.buyUnlock('card_'+c.id);
    }
    runs.push(r);hands.push(total);
  }
  console.log(JSON.stringify({campaigns:N,medianExpeditions:med(runs),maxExpeditions:Math.max(...runs),medianHands:med(hands),maxHands:Math.max(...hands)}));
}else{
  const depth=[],rep=[];let done=0;
  for(let n=0;n<N;n++){h.reset(19260817+n*37,unlocks);const e=expedition();depth.push(e.depth);if(e.done)done++;rep.push(a.META.nuit.rep);}
  console.log(JSON.stringify({deck:process.env.DECK||'full',runs:N,completed:done,medianDepth:med(depth),p25:depth.sort((p,q)=>p-q)[Math.floor(N/4)],medianRep:med(rep)}));
}
h.close();

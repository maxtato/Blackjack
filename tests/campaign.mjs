import fs from 'node:fs';
import {h,a,zero,tableAttempt,shop} from './simulate.mjs';
const N=200,out={campaigns:[],rules:[],relics:[]};
const policy={stake:'max',items:true,shop:true};
for(let n=0;n<N;n++){
 h.reset(85771+n*89);const journey=[];let complete=false;
 for(let run=1;run<=100&&!complete;run++){
  if(run>1){h.w.__screen='';a.startGame(Math.max(0,a.META.nuit.record.reached-1));h.flush();}
  const start=a.G.tableIdx+1,attempts=[];
  for(let i=0;i<40;i++){
   const stats=zero(),g=a.G,idx=g.tableIdx;
   const passed=tableAttempt(policy,stats);attempts.push({table:idx+1,passed,hands:stats.hands});
   if(passed){
    if(idx===23){a.cashOut();complete=true;break;}
    shop(policy,{});h.w.__screen='';a.leaveShop();a.chooseContract(0);h.flush();
   }else if(g.tokens>0){h.w.__screen='';a.retryTable();h.flush();}
   else break;
  }
  journey.push({run,start,end:a.G.tableIdx+1,rep:a.META.nuit.rep,attempts,won:complete});
  // Buy actual permanent unlocks, without ad-doubled reputation.
  const order=['bank','pourboire','contact','net','relic2','tarot'];
  let bought=true;while(bought){bought=false;for(const id of order){const u=a.UNLOCKS_NUIT.find(x=>x.id===id),level=a.META.nuit.unlocks[id]||0;if(level<u.max&&a.META.nuit.rep>=u.cost(level)){a.buyUnlock(id);bought=true;break;}}}
 }
 out.campaigns.push({complete,runs:journey.length,attempts:journey.flatMap(x=>x.attempts).length,hands:journey.flatMap(x=>x.attempts).reduce((s,x)=>s+x.hands,0),unlocks:{...a.META.nuit.unlocks},journey});
}
console.log(JSON.stringify({campaigns:N,completed:out.campaigns.filter(x=>x.complete).length,meanRuns:out.campaigns.reduce((s,x)=>s+x.runs,0)/N,meanHands:out.campaigns.reduce((s,x)=>s+x.hands,0)/N}));
fs.writeFileSync('balance-campaign.json',JSON.stringify(out,null,2));
h.close();

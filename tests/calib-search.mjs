// Finds, for one table, the goal whose clear rate matches a target (bisection on the required profit).
import {h,a,unlocks,pickCards,playHand} from './calibrate.mjs';
const ti=+process.env.T,target=+process.env.TARGET,N=+(process.env.N||500);
function rate(goal,salt){
  a.RUN[ti].goal=goal;a.RUN[ti].master=goal;let clears=0;
  for(let n=0;n<N;n++){
    h.reset(9176+salt*7919+ti*99991+n*53,unlocks);a.setTable(ti);
    a.G.bank=a.G.table.cap+a.G.table.entry;a.enterTable(0);h.flush();h.w.__screen='';a.G.tokens=0;
    pickCards(false);a.startPreparedTable();h.flush();
    while(!h.w.__screen&&a.G.phase!=='victory')playHand();
    if(a.G.phase==='victory')clears++;
  }
  return clears/N*100;
}
const tb=a.RUN[ti],cap=tb.cap,step=tb.max<60?5:a.niceRound(tb.max/10);
let lo=tb.max*0.6,hi=(tb.goal-cap)*1.3,best=null;
for(let i=0;i<6;i++){
  const mid=Math.max(step,Math.round((lo+hi)/2/step)*step),r=rate(cap+mid,i);
  if(!best||Math.abs(r-target)<Math.abs(best.r-target))best={profit:mid,r};
  if(r>target)lo=mid;else hi=mid;
  if(hi-lo<=step)break;
}
console.log(JSON.stringify({t:ti+1,cap,max:tb.max,old:tb.goal,goal:cap+best.profit,rate:Math.round(best.r*10)/10,target}));h.close();

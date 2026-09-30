/* Circuit milestones share the live rules and bankroll; no separate difficulty curve. */
const ColdDeckJourney=(()=>{
  function bossDistance(table){
    const boss=RUN.find(candidate=>candidate.i>=table.i&&candidate.boss);
    return boss?boss.i-table.i:null;
  }
  function bossNotice(table){
    const distance=bossDistance(table);
    return t(distance===0?'journey.bossNow':'journey.bossIn',distance);
  }
  function previewNext(){
    if(G.endless||G.tableIdx>=RUN_LEN-1)return null;
    const base=RUN[G.tableIdx+1],bank=Math.max(0,G.bank-base.entry);
    const table={...base,goal:base.goal+Math.max(0,bank-base.cap)};
    return {table,bank,profit:Math.max(0,table.goal-bank),reserve:base.entry+base.min};
  }
  function renderRoute(node,tb){
    node.replaceChildren();node.dataset.boss=String(!!tb.boss);
    const theme=ColdDeckBackgrounds.circuitTheme(tb);
    node.style.setProperty('--route-color',theme.accent);
    const label=document.createElement('p');label.className='journey-zone';
    const zone=document.createElement('span');zone.textContent=t('journey.zone',tb.zone,zoneName(tb.zone));label.append(zone);
    const notice=document.createElement('span');notice.className='journey-boss-notice';notice.textContent=bossNotice(tb);label.append(notice);
    const steps=document.createElement('ol');steps.className='journey-steps';
    RUN.filter(table=>table.zone===tb.zone).forEach(table=>{
      const step=document.createElement('li');step.className='journey-step';
      step.classList.toggle('past',table.i<tb.i);step.classList.toggle('current',table.i===tb.i);
      step.classList.toggle('boss',table.boss);
      if(table.i===tb.i)step.setAttribute('aria-current','step');
      step.textContent=t(table.boss?'journey.bossStep':'journey.tableStep',String(table.i+1).padStart(2,'0'));
      steps.append(step);
    });
    node.append(label,steps);
  }
  function renderHud(){
    const node=$('circuitProgress');if(!node)return;
    node.hidden=!!G.endless||!G.table;if(node.hidden)return;
    const distance=bossDistance(G.table);node.dataset.boss=String(distance===0);
    node.textContent=t(distance===0?'journey.bossNow':'journey.hudBossIn',distance);
  }
  function stat(label,value){
    const node=document.createElement('div');
    const title=document.createElement('span');title.dataset.readingLabel='';title.textContent=label;
    const amount=document.createElement('strong');amount.textContent=value;
    node.append(title,amount);return node;
  }
  function renderBrief(){
    if(G.endless||!G.table)return;
    const tb=G.table;$('tableBrief').dataset.boss=String(tb.boss);
    $('briefTableLabel').textContent=t('journey.table',String(tb.i+1).padStart(2,'0'),RUN_LEN);
    renderRoute($('briefRoute'),tb);
    const target=stat(t('journey.toWin'),cash(Math.max(0,tb.goal-G.bank)));
    const hands=document.createElement('small');hands.textContent=t('journey.within',tb.mains);target.append(hands);
    $('briefPressure').replaceChildren(target,stat(t('journey.minBet'),cash(tb.min)));
    renderHud();
  }
  function renderShop(){
    const next=previewNext();if(!next)return;
    const tb=next.table,node=$('shopNextObj');
    $('shopTitle').textContent=t('journey.prepare');$('shopStars').hidden=true;
    $('shopSub').textContent=t('journey.shopFunds',cash(G.bank),abbr(G.pot));
    $('shopGate').textContent=t('journey.reserve',cash(next.reserve));
    node.dataset.boss=String(tb.boss);
    node.style.setProperty('--next-zone-color',ColdDeckBackgrounds.circuitTheme(tb).accent);
    node.replaceChildren();
    const label=document.createElement('span');label.className='journey-next-label';
    label.dataset.readingLabel='';label.textContent=t('journey.table',String(tb.i+1).padStart(2,'0'),RUN_LEN)+' · '+bossNotice(tb);
    const title=document.createElement('h2');title.textContent=tableName(tb);
    const stats=document.createElement('div');stats.className='journey-next-stats';
    stats.append(stat(t('journey.profitTarget'),cash(next.profit)),stat(t('circuit.handsLabel'),tb.mains),stat(t('journey.minBet'),cash(tb.min)));
    const rule=document.createElement('p');rule.className='journey-next-rule';rule.textContent=tableRuleText(tb);
    const goal=document.createElement('p');goal.className='journey-next-goal';goal.textContent=t('journey.totalGoal',cash(tb.goal));
    node.append(label,title,stats,rule,goal);
    $('shopNextBtn').innerHTML=t('journey.enter',tb.i+1)+'<small>'+tableName(tb)+'</small>';
  }
  function renderVictory(){
    const tb=G.table,last=G.tableIdx===RUN_LEN-1;
    $('tableVictory').dataset.boss=String(tb.boss);
    $('victoryTitle').textContent=t('journey.bravo');
    $('victoryLabel').textContent=t(last?'shop.titleLast':tb.boss?'shop.titleBoss':'journey.tableWon');
    $('victoryTable').textContent=tableName(tb);
    const stars=$('victoryStars');stars.replaceChildren();stars.setAttribute('role','img');
    stars.setAttribute('aria-label',t('journey.rating',G.lastStars));
    for(let i=0;i<3;i++){
      const star=document.createElement('span');star.className='victory-star'+(i<G.lastStars?' earned':'');
      star.style.setProperty('--star-delay',i*90+'ms');star.setAttribute('aria-hidden','true');
      star.innerHTML=STAR;stars.append(star);
    }
    const reward=stat(t('journey.tableReward'),'+'+abbr(G.lastReward));
    const mark=document.createElement('span');mark.innerHTML=STAR;reward.querySelector('strong').append(mark);
    $('victoryRewards').replaceChildren(reward,stat(t('journey.inPocket'),cash(G.bank)));
    const next=previewNext();
    $('victoryNext').textContent=last?t('journey.circuitDone'):t('journey.nextUp',tableName(next.table))+' · '+bossNotice(next.table);
    $('victoryContinue').textContent=t(last?'journey.bankRun':'journey.prepareNext');
  }
  function showVictory(){renderVictory();$('tableVictory').classList.add('show');sfx.win(G.table.boss?3:2);}
  function refresh(){
    renderHud();
    if($('tableBrief').classList.contains('show'))renderBrief();
    if($('tableVictory').classList.contains('show'))renderVictory();
    if($('shop').classList.contains('show'))renderShop();
  }
  const api={bossDistance,previewNext,renderBrief,renderShop,renderHud,showVictory,refresh};
  window.ColdDeckJourney=api;refresh();return api;
})();

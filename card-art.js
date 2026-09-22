/* Electric edition: geometric courts and precise, readable suit pips. */
const ColdDeckArt = (() => {
  const paths = {
    '♠':'M50 8 16 42Q3 55 14 69q12 14 30 0l-8 22h28l-8-22q18 14 30 0 11-14-2-27Z',
    '♥':'M50 90 14 54Q0 39 13 23q15-16 37 6 22-22 37-6 13 16-1 31Z',
    '♦':'M50 7 87 50 50 93 13 50Z',
    '♣':'M50 8a21 21 0 0 1 18 32 22 22 0 1 1-11 36l7 16H36l7-16a22 22 0 1 1-11-36A21 21 0 0 1 50 8Z'
  };
  const suit = (s,size=24) => `<svg class="suit" viewBox="0 0 100 100" width="${size}" height="${size}" fill="currentColor" aria-hidden="true"><path d="${paths[s]||paths['♠']}"/></svg>`;
  const pip = (s,x,y,size=15,angle=0) => `<g transform="translate(${x} ${y}) rotate(${angle})"><svg x="${-size/2}" y="${-size/2}" width="${size}" height="${size}" viewBox="0 0 100 100"><path fill="currentColor" d="${paths[s]}"/></svg></g>`;
  const layouts={
    2:[[50,43],[50,99]],3:[[50,38],[50,71],[50,104]],
    4:[[33,42],[67,42],[33,100],[67,100]],
    5:[[33,40],[67,40],[50,71],[33,102],[67,102]],
    6:[[33,37],[67,37],[33,71],[67,71],[33,105],[67,105]],
    7:[[33,35],[67,35],[50,53],[33,71],[67,71],[33,107],[67,107]],
    8:[[33,33],[67,33],[50,52],[33,71],[67,71],[50,90],[33,109],[67,109]],
    9:[[33,32],[67,32],[33,58],[67,58],[50,71],[33,84],[67,84],[33,110],[67,110]],
    10:[[33,30],[67,30],[50,43],[33,57],[67,57],[33,85],[67,85],[50,99],[33,112],[67,112]]
  };
  function face(rank,s){
    let art;
    if(rank==='A'){
      art=`${pip(s,50,66,43)}<g fill="none" stroke="var(--art-accent)" stroke-width=".65"><path d="M34 101h32m-26 3h20m-10-9v3M32 41q-4 5-5 11m41-11q4 5 5 11"/><path d="m47 32 3-3 3 3-3 3Z"/></g>`;
    }else if(['J','Q','K'].includes(rank))art=royal(rank,s);
    else art=(layouts[Number(rank)]||[]).map(([x,y])=>pip(s,x,y,Number(rank)>8?16:19,y>71?180:0)).join('');
    return `<svg class="card-art" viewBox="0 0 100 142" aria-hidden="true">${art}</svg>`;
  }
  function royal(rank,s){
    const ink='var(--court-ink)',shade='var(--court-shade)',skin='var(--court-skin)',accent='var(--art-accent)';
    const head=rank==='K'
      ? `<path d="M29 48 34 30h32l6 19-5 24-17 14-17-14Z" fill="${ink}"/><path d="M36 43h28v20L50 76 36 63Z" fill="${skin}"/><path d="M50 43h14v20L50 76Z" fill="${shade}"/><path d="m35 62 9 5 6-3 6 3 9-5-4 16-11 8-11-8Z" fill="${ink}"/><path d="m30 27 11 7 9-14 9 14 11-7-5 17H35Z" fill="${accent}"/><path d="M47 17h6m-3-4v8" stroke="${ink}" stroke-width="2"/>`
      : rank==='Q'
        ? `<path d="M30 48q0-19 20-19t20 19l5 37-20-5-5-8-5 8-20 5Z" fill="${ink}"/><path d="M36 45h28v20L50 76 36 65Z" fill="${skin}"/><path d="M50 45h14v20L50 76Z" fill="${shade}"/><path d="M34 49 40 36h23l4 15-15-9-10 8Z" fill="${ink}"/><path d="m34 26 10 6 6-12 6 12 10-6-4 13H38Z" fill="${accent}"/><path d="m32 61 3 5-3 5-3-5Zm36 0 3 5-3 5-3-5Z" fill="${accent}"/>`
        : `<path d="m31 44 6-12 24-5 10 17-4 27-8 6-22-8Z" fill="${ink}"/><path d="M36 44h28v22L50 77 36 64Z" fill="${skin}"/><path d="M50 44h14v22L50 77Z" fill="${shade}"/><path d="m29 40 10-16 25 4 10 16-19-5-15 8Z" fill="${ink}"/><path d="m34 33 27-5 7 7-29 4Z" fill="${accent}"/><path d="m62 27 3-9 6 2-7 10Z" fill="${shade}"/>`;
    const coat=rank==='Q'
      ? `<path d="m37 77 13 7 13-7 12 16v22H25V93Z" fill="${ink}"/><path d="m37 77 13 15 13-15-5 24H42Z" fill="${accent}"/>`
      : `<path d="m35 77 15 8 15-8 12 16v22H23V93Z" fill="${ink}"/><path d="m35 77 15 8-9 12-10-14Zm30 0-15 8 9 12 10-14Z" fill="${accent}"/><path d="M50 86v29" stroke="${shade}" stroke-width="1.5"/>`;
    return `<g data-court="${rank}"><path d="M27 39v-8h7m32 0h7v8M27 107v10h8m30 0h8v-10" fill="none" stroke="${shade}" stroke-width=".7"/>${coat}${head}<g fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="square"><path d="m40 53 5-1m10 0 5 1M49 54l-2 7h4"/><path d="M46 67h8"/></g><g color="${skin}">${pip(s,50,105,12)}</g></g>`;
  }
  const actionPaths={
    hit:'M5 7 2 8l4 13 3-1M9 4 5 5l4 15 4-1M12 3l9 2-3 16-9-2Z',
    stand:'M7 12V6a1 1 0 0 1 2 0v6-8a1 1 0 0 1 2 0v8-9a1 1 0 0 1 2 0v9-7a1 1 0 0 1 2 0v8l2-4q2-1 2 1l-3 9q-1 3-5 3-4 0-6-4l-3-5q-1-2 1-2l4 3Z',
    double:'M5 6c0-4 15-4 15 0S5 10 5 6Zm0 0v4c0 4 15 4 15 0V6M5 10v4c0 4 15 4 15 0v-4M5 14v4c0 4 15 4 15 0v-4',
    split:'M8 3 3 8l5 5M3 8h6v13m7-18 5 5-5 5m5-5h-6v13',
    force:'m14 2-9 12h7l-2 8 9-12h-7l2-8Z',
    deal:'M5 7 2 8l4 13 3-1M9 4 5 5l4 15 4-1M12 3l9 2-3 16-9-2Z'
  };
  const actionIcon=kind=>`<svg class="action-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${actionPaths[kind]||actionPaths.hit}"/></svg>`;
  const icons={
    flag:'M5 21V3m0 1c5-4 9 5 15 1v10c-6 4-10-5-15-1',
    trophy:'M8 3h8v8a4 4 0 0 1-8 0V3Zm0 2H3v3a5 5 0 0 0 5 5m8-8h5v3a5 5 0 0 1-5 5m-4 2v6m-5 0h10',
    scroll:'M7 3h13v14H9m-2-14a3 3 0 0 0-3 3v2h5V6a3 3 0 0 0-2-3Zm2 3v13a2 2 0 0 0 4 0v-2m-1-10h5m-5 4h5',
    forcee:'m14 2-9 12h7l-2 8 9-12h-7l2-8Z',
    glass:'m5 3 2 18h10l2-18H5Zm1 6h12',
    arc:'M3 18a9 9 0 0 1 18 0M7 18a5 5 0 0 1 10 0',
    suite:'M3 17h5v-5h5V7h5V3m0 4h4',
    couleur:'M12 3C8 8 5 10 5 14a7 7 0 0 0 14 0c0-4-3-6-7-11Z',
    doree:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
    diamond:'m12 2 9 10-9 10L3 12 12 2Z'
  };
  const icon=n=>`<svg class="pxi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[n]||icons.doree}"/></svg>`;
  return {suit,face,icon,actionIcon};
})();

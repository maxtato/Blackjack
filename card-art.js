/* Electric edition: geometric courts and precise, readable suit pips. */
const ColdDeckArt = (() => {
  const paths = {
    '♠':'M50 7C40 24 11 39 11 61c0 19 23 27 34 10-1 12-6 18-15 22h40c-9-4-14-10-15-22 11 17 34 9 34-10C89 39 60 24 50 7Z',
    '♥':'M50 91C36 77 9 56 9 34 9 8 40 5 50 26 60 5 91 8 91 34 91 56 64 77 50 91Z',
    '♦':'M50 5C61 25 75 39 91 50 75 61 61 75 50 95 39 75 25 61 9 50 25 39 39 25 50 5Z',
    '♣':'M43 73C18 95-6 65 16 48c6-5 13-6 19-3C13 11 66-9 73 22c2 9-1 17-7 23 31-12 40 35 12 36-9 1-16-3-21-9 1 10 6 17 15 22H28c9-5 14-11 15-21Z'
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
    else art=(layouts[Number(rank)]||[]).map(([x,y])=>pip(s,x,y,Number(rank)>8?13:16,y>71?180:0)).join('');
    return `<svg class="card-art" viewBox="0 0 100 142" aria-hidden="true">${art}</svg>`;
  }
  function royal(rank,s){
    const crown=rank==='J'
      ? '<path d="m37 39 13-14 13 14-13 6Z" fill="var(--art-accent)"/><path d="m47 26 4 9-6 5" fill="none" stroke="var(--inkCard)" stroke-width="2"/>'
      : rank==='Q'
        ? '<path d="m32 30 11 8 7-16 7 16 11-8-6 18H38Z" fill="var(--art-accent)"/><path d="M39 45h22" stroke="var(--inkCard)" stroke-width="2"/><path d="m50 17 3 5-3 5-3-5Z" fill="#ff8a32"/>'
        : '<path d="m30 30 10 7 10-13 10 13 10-7-7 18H37Z" fill="var(--art-accent)"/><path d="M45 19h10m-5-5v10M37 44h26" fill="none" stroke="var(--inkCard)" stroke-width="2"/>';
    return `<g data-court="${rank}">${crown}${pip(s,50,78,53)}<path d="M29 48v-9h7m28 0h7v9M29 104v8h7m28 0h7v-8" fill="none" stroke="var(--art-line)" stroke-width=".85"/></g>`;
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

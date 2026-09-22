/* Original vector artwork: engraved courts, two traditional inks, ivory stock. */
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
  function portrait(rank,s){
    const crown=rank==='J'
      ? '<path d="M12 11C7 3 22-2 31 5l-3 7Z" fill="currentColor"/><path d="M24 6Q31-5 37 0q-1 7-10 10"/><path d="m29 2-4 8" stroke="var(--art-accent)"/>'
      : '<path d="m12 10-2-8 7 4 5-6 5 6 7-4-2 8Z" fill="var(--art-wash)"/><path d="M12 12h20M15 9h14"/><path d="m17 7 1-1m5 2V5m5 2 1-1" stroke="var(--art-accent)" stroke-width="1.6"/>';
    const hair=rank==='Q'
      ? '<path d="M16 13q-8 7-5 17l-5 6 12-2 3-7M14 16q-4 11 0 15m2-10 1 7m-7 1-3 5"/><path d="M20 24v3" stroke="var(--art-accent)" stroke-width="2"/>'
      : '<path d="M14 13q-4 8 1 14l5-2m-8-6 5-2m-5 6 5-2"/>';
    const beard=rank==='K'
      ? '<path d="m21 24 2 10 6-5 1-6m-7 3 1 5m2-6v4m-6-7 3 1 3-1"/>'
      : '<path d="m25 24 3-.5m-8 3 5 1"/>';
    const emblem=rank==='Q'
      ? '<path d="M37 40V20m0 3c-9-5-4-10 0-7 5-4 9 3 0 7m0 10 5-4m-5 8-5-4"/>'
      : rank==='K'
        ? '<path d="M38 43V9m-4 5h8m-4-9 2 4-2 4-2-4Z"/>'
        : '<path d="m36 43 2-24 4-4 2 7-6 20m1-18 3-3"/>';
    const drawing=`<g fill="none" stroke="currentColor" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 29 5 36 3 44h40l-4-10-10-5-6 7Z" fill="var(--art-wash)"/><path d="m16 30 4 14m7-13-4 13M5 37l12 6m-9-9 10 6m-4-10 6 5M28 32l5 12m-5-7 8 2m-8 2 10 2"/><path d="M20 13h10v5l3 4-4 1v4l-5 3-5-3v-5q-5-2-3-5l3 1v-5" fill="var(--ivory,#fffaf0)"/>${hair}${beard}<path d="m26 17 3 .5m-4 2h2M19 20v2"/>${crown}<g stroke="var(--art-accent)">${emblem}<path d="m10 37 3 2-2 3-3-2Zm20 2 2 2-2 2-2-2Z"/></g></g>`;
    return `<rect x="25" y="24" width="50" height="94" rx="1" fill="var(--art-wash)" stroke="currentColor" stroke-width=".55"/><g transform="translate(27 27)">${drawing}</g><g transform="translate(73 115) rotate(180)">${drawing}</g><path d="m27 72 46-2" stroke="var(--art-accent)" stroke-width="1.3"/>${pip(s,65,35,8)}${pip(s,35,107,8,180)}`;
  }
  function face(rank,s){
    let art;
    if(rank==='A'){
      art=`${pip(s,50,66,43)}<g fill="none" stroke="var(--art-accent)" stroke-width=".65"><path d="M34 101h32m-26 3h20m-10-9v3M32 41q-4 5-5 11m41-11q4 5 5 11"/><path d="m47 32 3-3 3 3-3 3Z"/></g>`;
    }else if(['J','Q','K'].includes(rank))art=portrait(rank,s);
    else art=(layouts[Number(rank)]||[]).map(([x,y])=>pip(s,x,y,Number(rank)>8?13:16,y>71?180:0)).join('');
    return `<svg class="card-art" viewBox="0 0 100 142" aria-hidden="true">${art}</svg>`;
  }
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
  return {suit,face,icon};
})();

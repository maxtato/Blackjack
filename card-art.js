/* Original vector artwork: four inks, twelve backs, no bitmap scaling. */
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
      ? '<path d="M26 36c-4-20 24-29 45-13l-7 11Z" fill="currentColor"/><path d="m61 22 8-12 6 15" fill="var(--art-accent)"/>'
      : '<path d="m26 34-4-19 18 8L50 8l10 15 18-8-4 19Z" fill="var(--art-accent)" stroke="currentColor" stroke-width="2"/><path d="M28 34h44v6H28Z" fill="currentColor"/>';
    const face=rank==='Q'
      ? '<path d="M30 39C17 61 25 84 37 91h28c16-19 17-40 4-52" fill="currentColor"/><path d="M34 37v25c0 21 32 21 32 0V37" fill="#f5d5b8"/><path d="M32 36q20 11 36 0" fill="none" stroke="currentColor" stroke-width="7"/><path d="m45 68 5 2 6-3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="29" cy="67" r="4" fill="var(--art-accent)"/><circle cx="72" cy="67" r="4" fill="var(--art-accent)"/>'
      : '<path d="M31 35h38v26c0 24-38 24-38 0Z" fill="#f5d5b8"/><path d="M29 39q20 6 41-4v11q-8-4-12-10l-7 7-9-4-12 5Z" fill="currentColor"/><path d="M39 65q7-12 12-4 8-8 14 3-9 8-14 2-4 7-12-1Z" fill="currentColor"/>';
    const drawing=`<path d="M17 125V103q4-19 27-23h12q24 4 27 23v22" fill="currentColor"/><path d="m38 81 12 17 13-17-5 43H43Z" fill="var(--art-accent)"/><path d="m24 96 17 22m35-22-18 22" stroke="var(--art-accent)" stroke-width="3"/>${face}${crown}<path d="M38 52h5m14 0h5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="m50 52-3 8h5" fill="none" stroke="currentColor" stroke-width="1.6"/>${pip(s,50,109,12)}`;
    return `<rect x="22" y="23" width="56" height="96" rx="27" fill="var(--art-wash)"/><g transform="translate(10 18) scale(.8)">${drawing}</g><path d="M25 119h50" stroke="currentColor" stroke-width="1" opacity=".4"/>`;
  }
  function face(rank,s){
    let art;
    if(rank==='A'){
      art=`<ellipse cx="50" cy="70" rx="34" ry="47" fill="var(--art-wash)"/><g stroke="currentColor" stroke-width="1.3" opacity=".65"><path d="m50 24 0 7m0 79v7M16 70h7m54 0h7M26 39l5 5m38 53 5 5M26 102l5-5m38-53 5-5"/></g>${pip(s,50,68,51)}<path d="M31 102q19 8 38 0" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="34" r="2.5" fill="var(--art-accent)"/>`;
    }else if(['J','Q','K'].includes(rank))art=portrait(rank,s);
    else art=`<path d="M22 121V37q28-27 56-6v75q-28 27-56 15Z" fill="var(--art-wash)"/>`+(layouts[Number(rank)]||[]).map(([x,y])=>pip(s,x,y,Number(rank)>8?15:18,y>71?180:0)).join('');
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

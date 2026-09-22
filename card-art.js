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
    10:[[33,39],[67,39],[33,55],[67,55],[33,71],[67,71],[33,87],[67,87],[33,103],[67,103]]
  };
  function face(rank,s){
    let art;
    if(rank==='A'){
      art=`${pip(s,50,66,50)}<g fill="none" stroke="var(--art-accent)" stroke-width=".65"><path d="M34 101h32m-26 3h20m-10-9v3M32 41q-4 5-5 11m41-11q4 5 5 11"/><path d="m47 32 3-3 3 3-3 3Z"/></g>`;
    }else if(['J','Q','K'].includes(rank))art=royal(rank,s);
    else art=(layouts[Number(rank)]||[]).map(([x,y])=>pip(s,x,y,Number(rank)===10?18:Number(rank)>8?20:22,y>71?180:0)).join('');
    return `<svg class="card-art" viewBox="0 0 100 142" aria-hidden="true">${art}</svg>`;
  }
  function royal(rank,s){
    const ink='var(--court-ink)',shade='var(--court-shade)',skin='var(--court-skin)',accent='var(--art-accent)';
    const head=rank==='K'
      ? `<path d="M30 48 35 40h30l5 8-3 25-17 14-17-14Z" fill="${ink}"/><path d="M36 43h28v20L50 76 36 63Z" fill="${skin}"/><path d="M50 43h14v20L50 76Z" fill="${shade}"/><path d="m35 62 9 5 6-3 6 3 9-5-4 16-11 8-11-8Z" fill="${ink}"/><path d="M32 24 41 32 50 20 59 32 68 24 65 40H35Z" fill="${accent}"/><path d="M47 17h6m-3-4v8" stroke="${ink}" stroke-width="2"/>`
      : rank==='Q'
        ? `<path d="M30 48q0-9 20-9t20 9l5 37-20-5-5-8-5 8-20 5Z" fill="${ink}"/><path d="M36 45h28v20L50 76 36 65Z" fill="${skin}"/><path d="M50 45h14v20L50 76Z" fill="${shade}"/><path d="M34 50 39 40h23l5 11-15-7-10 7Z" fill="${ink}"/><path d="M33 27 43 33 50 22 57 33 67 27 64 40H36Z" fill="${accent}"/><path d="m32 61 3 5-3 5-3-5Zm36 0 3 5-3 5-3-5Z" fill="${accent}"/>`
        : `<path d="M31 45 35 40 66 41 69 49 66 71 58 77 37 69Z" fill="${ink}"/><path d="M36 44h28v22L50 77 36 64Z" fill="${skin}"/><path d="M50 44h14v22L50 77Z" fill="${shade}"/><path d="M62 31 66 19 72 21 66 34Z" fill="${shade}"/><path d="M29 41 38 27 59 25 69 34 72 44 51 40 39 47Z" fill="${ink}"/><path d="M33 37 62 30 67 36 39 43Z" fill="${accent}"/>`;
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
  // The same symbol follows each item through the table, shop and inspection.
  const effectArt={
    lunettes:'<path d="m3 12 1-6h3m14 6-1-6h-3M9 14h6"/><circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/>',
    jeton:'<circle cx="12" cy="12" r="9"/><path d="m13 3-3 7 4 3-3 8M5 8l2 1m10 6 2 1M5 16l2-1m10-6 2-1"/><path d="m13 3-3 7 4 3-3 8a9 9 0 0 0 2-18Z" fill="currentColor" opacity=".14" stroke="none"/>',
    clope:'<path d="M3 14h17v5H3Zm12 0v5M7 10c-4-3 3-4 0-7m6 7c-4-3 3-4 0-7"/><path d="M16 15h3v3h-3Z" fill="currentColor" stroke="none"/>',
    as:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="m12 7-4 5q-2 4 3 3l-1 3h4l-1-3q5 1 3-3Z" fill="currentColor" stroke="none"/>',
    froid:'<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M3.5 10l4-1-1-4m14 9-4 1 1 4M6.5 19l1-4-4-1m14-9-1 4 4 1"/>',
    compteur:'<path d="M4 19a9 9 0 1 1 16 0ZM12 5v2M5 9l2 1m12-1-2 1m-5 5 4-5"/><circle cx="12" cy="15" r="2" fill="currentColor"/>',
    mecene:'<path d="M3 16h5l3-3h4q3 0 1 3l-3 2m-5-2 4 4h5l5-6M3 14v7"/><circle cx="12" cy="6" r="4"/><path d="M12 4v4m-1-3h2m-2 2h2"/>',
    usurier:'<ellipse cx="8" cy="8" rx="5" ry="2.5"/><path d="M3 8v9c0 3 10 3 10 0V8M3 12c0 3 10 3 10 0m4 4V4m-3 3 3-3 3 3"/>',
    collector:'<path d="M4 17H2V3h12v2M7 20H5V6h12v2"/><rect x="8" y="9" width="13" height="13" rx="2"/><path d="m14.5 12 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" fill="currentColor" stroke="none"/>',
    maitresse:'<rect x="4" y="3" width="15" height="19" rx="3"/><path d="m15 2 1.5 4.5L21 8l-4.5 1.5L15 14l-1.5-4.5L9 8l4.5-1.5Z" fill="currentColor" stroke="none"/><path d="M8 15v3m0-3h3"/>',
    bruleur:'<path d="M13 2c1 6 6 7 6 13a7 7 0 0 1-14 0c0-3 2-6 4-8 0 3 1 4 2 4 2-2 3-4 2-9Z" fill="currentColor" opacity=".2"/><path d="M13 2c1 6 6 7 6 13a7 7 0 0 1-14 0c0-3 2-6 4-8 0 3 1 4 2 4 2-2 3-4 2-9Z"/><path d="M12 13c4 3 4 6 0 8-4-2-4-5 0-8Z" fill="currentColor" stroke="none"/>',
    portebonheur:'<path d="M12 12C1 13 1 4 6 4c4 0 6 5 6 8Zm0 0C11 1 20 1 20 6c0 4-5 6-8 6Zm0 0c11-1 11 8 6 8-4 0-6-5-6-8Zm0 0c1 11-8 11-8 6 0-4 5-6 8-6Z" fill="currentColor" opacity=".8" stroke="none"/><path d="M12 12c2 5 0 8-3 10"/>',
    diplomate:'<path d="m2 11 5-5 5 2 5-2 5 5-5 8-3 1-7-4Zm5-5 5 5 4-2M7 16l3-3m0 5 3-3m0 5 3-3"/>',
    talisman:'<path d="m12 2 8 4v6c0 5-5 9-8 10-3-1-8-5-8-10V6Z" fill="currentColor" opacity=".14"/><path d="m12 2 8 4v6c0 5-5 9-8 10-3-1-8-5-8-10V6Z"/><path d="M12 9c-4-4-8 2 0 7 8-5 4-11 0-7Z" fill="currentColor" stroke="none"/>',
    aimant:'<path d="M4 3h5v10a3 3 0 0 0 6 0V3h5v10a8 8 0 0 1-16 0ZM4 8h5m6 0h5"/><path d="M4 8h5v5a3 3 0 0 0 6 0V8h5v5a8 8 0 0 1-16 0Z" fill="currentColor" opacity=".16" stroke="none"/>',
    phare:'<path d="M7 22 9 10h6l2 12ZM8 10V6l4-3 4 3v4M7 22h10M9 16h6M2 5l3 2m-4 5h4m17-7-3 2m4 5h-4"/><path d="M9 6h6v4H9Z" fill="currentColor" stroke="none"/>',
    etoile:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="currentColor" opacity=".2"/><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    jugement:'<path d="M12 3v14m-6-8 6-6 6 6M5 21h14M3 15v3m18-3v3"/><path d="m12 4-5 5h10Z" fill="currentColor" opacity=".2" stroke="none"/>',
    soleil:'<circle cx="12" cy="12" r="5" fill="currentColor" opacity=".2"/><circle cx="12" cy="12" r="5"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    diable:'<path d="M7 9 3 3v10c0 5 4 8 9 9 5-1 9-4 9-9V3l-4 6Z" fill="currentColor" opacity=".14"/><path d="M7 9 3 3v10c0 5 4 8 9 9 5-1 9-4 9-9V3l-4 6Zm1 4 2 1m6-1-2 1m-4 4h4"/>',
    lune:'<path d="M20 16A9 9 0 0 1 8 3a9.5 9.5 0 1 0 12 13Z" fill="currentColor" opacity=".2"/><path d="M20 16A9 9 0 0 1 8 3a9.5 9.5 0 1 0 12 13Z"/><path d="m17 2 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="currentColor" stroke="none"/>',
    etoileD:'<path d="m17 2 2 5 4 1-4 3v5l-4-3-5 2 2-5-3-4h6Z" fill="currentColor" opacity=".85" stroke="none"/><path d="m3 13 4-4m-5 9 6-6m-2 9 6-6"/>',
    pendu:'<rect x="10" y="3" width="11" height="17" rx="2"/><path d="M7 21H3V4m-1 9h11m-8-4-4 4 4 4"/><path d="M14 8h3m-3 4h3"/>',
    magicien:'<path d="m3 19 13-13 3 3L6 22Zm11-11 3 3M6 3v4m-2-2h4m12-4v4m-2-2h4m-1 13v4m-2-2h4"/><path d="m13 2 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="currentColor" stroke="none"/>',
    roue:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 3v6m0 6v6M3 12h6m6 0h6M5.5 5.5l4.4 4.4m4.2 4.2 4.4 4.4m-13 0 4.4-4.4m4.2-4.2 4.4-4.4"/>',
    soin:'<rect x="2" y="6" width="20" height="14" rx="3"/><path d="M3 6V4h13m0 7v5m-2.5-2.5h5"/><path d="M3 7h18v4H3Z" fill="currentColor" opacity=".15" stroke="none"/>',
    assurance:'<path d="m12 2 8 4v6c0 5-5 9-8 10-3-1-8-5-8-10V6Z" fill="currentColor" opacity=".14"/><path d="m12 2 8 4v6c0 5-5 9-8 10-3-1-8-5-8-10V6ZM8 12l3 3 5-6"/>',
    videur:'<path d="M5 8a8 8 0 1 1-1 9M5 3v5H1"/><path d="M11 9h4v10m-4 0h7"/>',
    bank:'<path d="M4 7h16v14H4Zm-1 0 9-5 9 5M8 10v7m4-7v7m4-7v7M2 21h20"/><path d="M5 18h14v3H5Z" fill="currentColor" opacity=".18" stroke="none"/>',
    pourboire:'<ellipse cx="9" cy="11" rx="6" ry="3"/><path d="M3 11v7c0 4 12 4 12 0v-7M3 15c0 4 12 4 12 0m3-13v6m-3-3h6"/>',
    net:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.5 5.5 3.7 3.7m5.6 5.6 3.7 3.7m-13 0 3.7-3.7m5.6-5.6 3.7-3.7"/>',
    tarot:'<path d="M5 3h14v12l-7 7-7-7ZM5 9h14"/><path d="m12 12 3 3-3 3-3-3Z" fill="currentColor" stroke="none"/>',
    contact:'<circle cx="8" cy="7" r="4"/><path d="M2 21v-3a6 6 0 0 1 10-4m5-8 5 5-5 5-5-5Z"/><path d="m17 8 3 3-3 3-3-3Z" fill="currentColor" opacity=".2" stroke="none"/>',
    relic2:'<rect x="3" y="3" width="18" height="18" rx="3"/><rect x="6" y="6" width="12" height="12" rx="1"/><circle cx="12" cy="12" r="3"/><path d="M12 9v6m-3-3h6M7 21v2m10-2v2"/>',
    plafond:'<path d="M3 4h18M12 21V8m-5 5 5-5 5 5"/><path d="m7 13 5-5 5 5Z" fill="currentColor" opacity=".2" stroke="none"/>',
    elan:'<path d="M2 21h6v-6h6V9h7m-6-6h6v6M4 13l17-10"/>',
    cashplus:'<rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="10" cy="13" r="3"/><path d="M15 3h6m-3-2 3 2-3 3"/>',
    boon2:'<path d="M7 3h13v14H9m-2-14a3 3 0 0 0-3 3v2h5V6a3 3 0 0 0-2-3Zm2 3v13a2 2 0 0 0 4 0v-2"/><path d="m14 6 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" fill="currentColor" stroke="none"/>',
    mult:'<path d="m5 5 14 14M5 19 19 5m0 0h-5m5 0v5"/>',
    baraplus:'<path d="m14 2-9 12h7l-2 8 9-12h-7l2-8Z" fill="currentColor" opacity=".2"/><path d="m14 2-9 12h7l-2 8 9-12h-7l2-8Z"/>',
    evt3:'<rect x="3" y="5" width="12" height="17" rx="2"/><path d="M7 2h13v17m-9-10-5 7h4l-1 4 5-7h-4Z"/>'
  };
  const effectAliases={bankI:'bank',pourboireI:'pourboire',income:'pourboire',betmax:'plafond',filet:'net',cash:'soin'};
  function effect(id){
    const key=effectAliases[id]||id;
    return `<svg class="effect-symbol" data-effect-symbol="${key}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${effectArt[key]||effectArt.etoile}</svg>`;
  }
  return {suit,face,icon,actionIcon,effect};
})();

// Color proposals, used only by the review pages until a palette is approved.
export const equipmentPalettes = Object.freeze({
  a: {letter:'A',name:'Menthe et pêche',relic:'#b5d4ca',tarot:'#ecc0ae',relicName:'Menthe claire',tarotName:'Pêche',note:'Des tons clairs, avec une séparation nette des familles.'},
  b: {letter:'B',name:'Sauge et bleu brume',relic:'#d2dcbd',tarot:'#b9cfdf',relicName:'Sauge claire',tarotName:'Bleu brume',note:'Une palette douce et lumineuse sur le fond sombre.'},
  c: {letter:'C',name:'Crème et bleu ciel',relic:'#eddfbc',tarot:'#aecae7',relicName:'Crème',tarotName:'Bleu ciel',note:'Des reliques très claires et des tarots bleutés.'},
  d: {letter:'D',name:'Rose et amande',relic:'#e6c6d3',tarot:'#c4d8b6',relicName:'Rose poudré',tarotName:'Amande',note:'Des couleurs pastel, légèrement patinées.'}
});

export function equipmentPaletteStyle(palette){
  if(!palette)return '';
  return `.effect-card[data-effect-kind="relic"]{--effect-paper:${palette.relic}}.effect-card[data-effect-kind="tarot"]{--effect-paper:${palette.tarot}}#effects .joker::after{background:${palette.relic}}#effects .tarot::after{background:${palette.tarot}}`;
}

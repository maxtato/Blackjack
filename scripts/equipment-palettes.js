// Color proposals, used only by the review pages until a palette is approved.
export const equipmentPalettes = Object.freeze({
  a: {letter:'A',name:'Pétrole et brique',relic:'#83aaa5',tarot:'#ca9183',relicName:'Pétrole',tarotName:'Brique',note:'Un contraste chaud et froid, avec du caractère.'},
  b: {letter:'B',name:'Sauge et ardoise',relic:'#b0b897',tarot:'#8ea6bd',relicName:'Sauge',tarotName:'Ardoise',note:'Une palette sobre et douce, facile à lire.'},
  c: {letter:'C',name:'Sable et cobalt',relic:'#d0c3a5',tarot:'#7797bd',relicName:'Sable',tarotName:'Cobalt',note:'Des reliques chaleureuses, des tarots plus affirmés.'},
  d: {letter:'D',name:'Rose et sauge',relic:'#c4a2ac',tarot:'#9dac92',relicName:'Rose ancien',tarotName:'Sauge grisée',note:'Un duo plus singulier, aux tons patinés.'}
});

export function equipmentPaletteStyle(palette){
  if(!palette)return '';
  return `.effect-card[data-effect-kind="relic"]{--effect-paper:${palette.relic}}.effect-card[data-effect-kind="tarot"]{--effect-paper:${palette.tarot}}#effects .joker::after{background:${palette.relic}}#effects .tarot::after{background:${palette.tarot}}`;
}

/* Static cut-paper scenery. Its geometry never uses the game's random stream. */
const ColdDeckBackgrounds=(() => {
  const key='colddeck-background';
  const palettes=[
    ['minuit','Minuit','Midnight','#19232f','#344658','#283746','#c2a15a','#728fb2'],
    ['obsidienne','Obsidienne','Obsidian','#1c1d23','#393a45','#2a2c35','#a795c4','#d1b66f'],
    ['prune','Velours prune','Plum velvet','#28212d','#4c3c58','#3a2e43','#b99bcf','#cbb378'],
    ['sapin','Tapis vert','Green felt','#1b2b27','#375147','#2b4038','#c2ab62','#74a58e'],
    ['bordeaux','Bordeaux','Burgundy','#2a1d25','#543b46','#3d2b34','#c7928d','#c7ab67'],
    ['petrole','Pétrole','Petrol','#172a2e','#33525a','#263d44','#83b8b8','#b6a269'],
    ['ardoise','Ardoise','Slate','#222a33','#435363','#313d4b','#89a6b9','#b5a5ca'],
    ['cuivre','Cuivre','Copper','#2b2421','#59453c','#40322d','#c78c68','#a99a79'],
    ['indigo','Indigo','Indigo','#1e2236','#3b4265','#2d334b','#8899cc','#bba4cb'],
    ['aubergine','Aubergine','Aubergine','#291f30','#503c60','#3b2d47','#aa86c1','#cdb67a'],
    ['emeraude','Émeraude','Emerald','#182b28','#31564b','#254138','#79ad92','#bfb065'],
    ['doree','Nuit dorée','Golden night','#272722','#4a493b','#37382e','#cdb15f','#a69a77'],
    ['acier','Acier','Steel','#202931','#41515b','#303e47','#9cacb5','#7e98ac'],
    ['terre','Terre brûlée','Burnt earth','#2c2422','#5b433b','#42332d','#c58c75','#c3aa7a'],
    ['lagune','Lagune','Lagoon','#18292e','#34515e','#263c48','#7ab5bf','#939fc9'],
    ['grenat','Grenat','Garnet','#2d1c24','#57333f','#3f2731','#b8798c','#c8a567'],
    ['lilas','Lilas fumé','Smoky lilac','#272632','#4b465f','#383447','#aba0c7','#b5b6a0'],
    ['carbone','Carbone','Carbon','#1c2023','#373f44','#292f34','#a5b0b1','#c1a66c'],
    ['bouteille','Vert bouteille','Bottle green','#202922','#414f3e','#2f3c2e','#91a570','#bba46c'],
    ['crepuscule','Crépuscule','Twilight','#292331','#514253','#3d3142','#bd91b1','#ad9dcd']
  ];
  const extraPalettes=[
    ['dunes','Dunes','Dunes','#282621','#4c483d','#39372e','#bda97b','#8c9e95'],
    ['eclats','Éclats','Fragments','#22262f','#424b5d','#303947','#9faacb','#c5af76'],
    ['chevrons','Chevrons','Chevrons','#222c29','#42544b','#303f38','#9eae7c','#bda06e'],
    ['eventail','Éventail','Fan','#2b2430','#544258','#3e3244','#b59ac4','#bc9b76'],
    ['prismes','Prismes','Prisms','#1f2934','#3e5166','#2d3c4d','#8daecb','#ae9dca'],
    ['rubans','Rubans','Ribbons','#2b2228','#57404b','#3f3038','#c396a4','#b6a477'],
    ['arches','Arches','Arches','#25282c','#4a5059','#363b44','#a4b0b8','#b6aa85'],
    ['cristaux','Cristaux','Crystals','#222a31','#40515c','#2e3e48','#92b6bd','#aaa0c3'],
    ['marches','Marches','Steps','#262925','#4b5344','#373d32','#a5b68c','#b9a572'],
    ['falaises','Falaises','Cliffs','#2b2622','#574b41','#403930','#b59c81','#929f9e'],
    ['mosaique','Mosaïque','Mosaic','#292430','#51435b','#3b3245','#aa99c1','#bca878'],
    ['orbites','Orbites','Orbits','#222734','#434c66','#30394c','#9da9c7','#b5a079'],
    ['cometes','Comètes','Comets','#212b2d','#3f5459','#2e4044','#9cbec0','#bbaa7d'],
    ['tissage','Tissage','Weave','#2d2525','#584546','#413335','#bc9790','#b6ad83'],
    ['labyrinthe','Labyrinthe','Labyrinth','#252927','#4a534e','#353e39','#a7b8a8','#bca57b'],
    ['couronne','Couronne','Crown','#2b2720','#554d39','#3e392b','#c3ad71','#a299b4'],
    ['ecailles','Écailles','Scales','#222b2b','#415853','#30413e','#99b5a5','#b8ac81'],
    ['plis','Plis','Pleats','#2b2430','#55455e','#3e3348','#b4a2c8','#ac9e84'],
    ['vagues','Vagues','Waves','#1e2a30','#3b5463','#2b3e49','#8faebc','#a9a2be'],
    ['ailes','Ailes','Wings','#28282e','#4e4d5b','#393943','#b2abca','#b8a37b'],
    ['facettes','Facettes','Facets','#242b30','#475660','#33414a','#a1b9c3','#b6a882'],
    ['losanges','Losanges','Diamonds','#2b2330','#57425e','#403148','#b7a0c9','#b7a47c'],
    ['diagonales','Diagonales','Diagonals','#292527','#52474d','#3c3439','#bba2b1','#b5aa86'],
    ['portiques','Portiques','Gateways','#242a2e','#46535b','#333e45','#a5b6bd','#b7a589'],
    ['pyramides','Pyramides','Pyramids','#2c2822','#584f40','#403a2e','#bdac83','#9aa9a4'],
    ['spirales','Spirales','Spirals','#222734','#434e67','#313b4e','#a6afcc','#bca47c'],
    ['dechirures','Déchirures','Torn paper','#292727','#534e49','#3c3935','#b4aba0','#a99bbb'],
    ['eclairs','Éclairs','Lightning','#26252f','#4b4960','#383648','#aca7c9','#bba774'],
    ['paves','Pavés','Pavers','#2b2523','#564940','#40362f','#b7a18a','#a0a7b4'],
    ['piles','Empilement','Stacks','#29232b','#524251','#3c313c','#b69caf','#b5a67c'],
    ['rayons','Rayons','Rays','#272924','#4d5141','#383c30','#b0b68b','#b5a479'],
    ['croissants','Croissants','Crescents','#242832','#485064','#343c4b','#a8b2c8','#b8a583'],
    ['passerelles','Passerelles','Bridges','#252b2c','#495659','#354043','#a6b9bc','#b7ac86'],
    ['lanternes','Lanternes','Lanterns','#2d2427','#59434c','#41313a','#c1a0ae','#bca779'],
    ['triangles','Triangles','Triangles','#232a31','#455363','#323e49','#9db2c6','#aca6bc'],
    ['tresses','Tresses','Braids','#252b26','#48564b','#354038','#a5b59e','#bbaa81'],
    ['cascades','Cascades','Cascades','#222b30','#425761','#30404a','#9cb8c0','#aca6c3']
  ];
  const collagePalettes=[
    ['eclats-bleus','Éclats bleus','Blue fragments','#1d2732','#425976','#2e3d50','#829dc1','#5c7b9f',12467],
    ['papier-prune','Papier prune','Plum paper','#292130','#554163','#3a2c44','#9881af','#725889',58237],
    ['strates-sauge','Strates sauge','Sage layers','#202b27','#41574d','#2d3d35','#92ab9a','#5d7d6b',39981],
    ['cuivre-decoupe','Cuivre découpé','Cut copper','#2b241f','#624838','#3f3027','#bd9377','#8b6550',74073],
    ['ardoise-brute','Ardoise brute','Rough slate','#252931','#4d5564','#353b46','#a0aab8','#737f91',92615],
    ['grenat-froisse','Grenat froissé','Crumpled garnet','#2d2028','#624152','#422d39','#bb93a9','#875b72',61829]
  ];
  // Each new motif has its own silhouette. Coordinates occupy the margins;
  // the opposite edge is a half-turn of the same hand-cut paper layers.
  const motifs={
    dunes:[
      ['edge',[[0,0],[12,0],[17,7],[10,21],[14,31],[5,43],[0,40]]],
      ['fold',[[0,10],[8,5],[12,12],[5,30],[9,43],[0,57]]],
      ['edge',[[0,46],[7,38],[12,53],[7,68],[15,84],[9,100],[0,100]]],
      ['fold',[[0,63],[6,56],[4,78],[11,93],[6,100],[0,100]]],
      ['second',[[0,0],[7,0],[11,7],[6,5]]],
      ['accent',[[0,88],[5,100],[0,100]]]
    ],
    eclats:[
      ['edge',[[0,0],[15,0],[8,17],[3,9]]],
      ['fold',[[0,16],[10,8],[5,29],[0,24]]],
      ['edge',[[0,31],[12,23],[7,45],[0,38]]],
      ['fold',[[0,44],[8,52],[2,65],[0,60]]],
      ['edge',[[0,66],[14,57],[8,80],[0,76]]],
      ['edge',[[0,88],[11,80],[16,100],[0,100]]],
      ['second',[[1,6],[10,2],[5,10]]],
      ['accent',[[1,80],[5,76],[3,87]]]
    ],
    chevrons:[
      ['edge',[[0,0],[5,0],[16,15],[5,30],[0,30],[11,15]]],
      ['fold',[[0,24],[13,40],[0,56],[0,48],[7,40],[0,32]]],
      ['edge',[[0,50],[5,50],[16,65],[5,80],[0,80],[11,65]]],
      ['fold',[[0,74],[13,90],[5,100],[0,100],[7,90],[0,82]]],
      ['accent',[[9,10],[12,15],[9,20],[10,15]]],
      ['second',[[0,95],[4,100],[0,100]]]
    ],
    eventail:[
      ['edge',[[0,0],[17,0],[0,43]]],
      ['fold',[[0,0],[13,6],[0,43]]],
      ['edge',[[0,0],[10,14],[0,43]]],
      ['fold',[[0,0],[6,23],[0,43]]],
      ['edge',[[0,62],[12,84],[17,100],[0,100]]],
      ['fold',[[0,62],[8,92],[11,100],[0,100]]],
      ['second',[[0,0],[4,0],[0,43]]],
      ['accent',[[14,0],[17,0],[11,8]]]
    ],
    prismes:[
      ['edge',[[0,0],[12,0],[17,17],[6,31],[0,21]]],
      ['fold',[[0,0],[6,31],[0,21]]],
      ['fold',[[12,0],[17,17],[6,31],[10,13]]],
      ['edge',[[0,36],[12,49],[4,64],[0,58]]],
      ['fold',[[0,36],[4,64],[0,58]]],
      ['edge',[[0,75],[9,64],[16,89],[9,100],[0,100]]],
      ['fold',[[9,64],[16,89],[9,100],[6,84]]],
      ['accent',[[10,3],[14,15],[11,13]]],
      ['second',[[0,93],[6,100],[0,100]]]
    ],
    rubans:[
      ['edge',[[0,0],[10,0],[6,24],[16,38],[5,52],[0,49],[10,37],[0,25]]],
      ['fold',[[0,23],[10,37],[16,38],[6,27]]],
      ['fold',[[5,52],[16,38],[10,37],[0,49]]],
      ['edge',[[0,62],[5,57],[14,71],[5,83],[11,100],[0,100],[0,86],[8,72]]],
      ['fold',[[5,83],[14,71],[8,72],[0,86]]],
      ['accent',[[0,0],[4,0],[2,12]]],
      ['second',[[5,87],[11,100],[8,100]]]
    ],
    arches:[
      ['edge',[[0,0],[16,0],[16,8],[12,15],[5,20],[0,20],[0,15],[4,15],[11,10],[11,5],[0,5]]],
      ['fold',[[0,27],[12,27],[16,34],[16,44],[11,51],[0,51],[0,46],[8,46],[11,41],[11,36],[8,32],[0,32]]],
      ['edge',[[0,59],[16,59],[16,67],[12,74],[5,79],[0,79],[0,74],[4,74],[11,69],[11,64],[0,64]]],
      ['fold',[[0,87],[12,87],[16,94],[16,100],[11,100],[11,95],[8,92],[0,92]]],
      ['accent',[[12,0],[16,0],[16,5],[14,3]]],
      ['second',[[11,68],[12,66],[12,71],[9,73]]]
    ],
    cristaux:[
      ['edge',[[0,0],[7,0],[15,17],[6,34],[0,23]]],
      ['fold',[[7,0],[15,17],[6,34],[9,16]]],
      ['edge',[[0,37],[10,27],[16,48],[7,68],[0,55]]],
      ['fold',[[10,27],[16,48],[7,68],[10,48]]],
      ['edge',[[0,78],[8,66],[15,87],[9,100],[0,100]]],
      ['fold',[[8,66],[15,87],[9,100],[10,85]]],
      ['second',[[9,6],[12,17],[9,24],[10,16]]],
      ['accent',[[10,75],[13,86],[11,91],[11,84]]]
    ],
    marches:[
      ['edge',[[0,0],[16,0],[16,7],[12,7],[12,16],[8,16],[8,25],[4,25],[4,35],[0,35]]],
      ['fold',[[0,8],[10,8],[10,13],[6,13],[6,22],[2,22],[2,32],[0,32]]],
      ['edge',[[0,45],[4,45],[4,56],[8,56],[8,67],[12,67],[12,78],[16,78],[16,89],[12,89],[12,100],[0,100]]],
      ['fold',[[0,58],[2,58],[2,69],[6,69],[6,80],[10,80],[10,91],[6,91],[6,100],[0,100]]],
      ['accent',[[12,0],[16,0],[16,3],[12,3]]],
      ['second',[[12,78],[16,78],[16,82],[12,82]]]
    ],
    falaises:[
      ['edge',[[0,0],[12,0],[16,15],[11,24],[14,40],[8,51],[11,68],[5,84],[8,100],[0,100]]],
      ['fold',[[0,0],[5,0],[10,15],[5,31],[8,41],[3,55],[6,68],[0,81]]],
      ['fold',[[12,0],[16,15],[11,24],[8,13]]],
      ['fold',[[8,51],[11,68],[5,84],[5,65]]],
      ['edge',[[0,81],[4,74],[3,94],[6,100],[0,100]]],
      ['accent',[[10,2],[13,13],[11,11]]],
      ['second',[[0,91],[4,100],[0,100]]]
    ],
    mosaique:[
      ['edge',[[0,0],[9,0],[14,7],[9,15],[0,15]]],
      ['fold',[[0,17],[6,17],[11,25],[6,33],[0,33]]],
      ['edge',[[0,35],[9,35],[15,43],[9,51],[0,51]]],
      ['fold',[[0,53],[6,53],[11,61],[6,69],[0,69]]],
      ['edge',[[0,71],[9,71],[15,79],[9,87],[0,87]]],
      ['fold',[[0,89],[6,89],[11,97],[9,100],[0,100]]],
      ['accent',[[9,0],[14,7],[12,9],[8,2]]],
      ['second',[[7,71],[12,77],[10,79],[5,73]]]
    ],
    orbites:[
      ['edge',[[0,0],[17,0],[17,8],[14,17],[9,24],[0,29],[0,23],[6,20],[10,14],[12,7],[12,5],[0,5]]],
      ['fold',[[0,0],[9,0],[9,7],[6,14],[0,18],[0,13],[3,10],[4,5],[0,5]]],
      ['edge',[[0,54],[6,57],[12,64],[16,74],[17,84],[15,96],[12,100],[7,100],[11,92],[12,84],[11,75],[7,68],[0,64]]],
      ['fold',[[0,68],[5,72],[8,82],[7,94],[3,100],[0,100],[3,91],[3,83],[0,77]]],
      ['accent',[[12,2],[17,2],[17,6],[12,6]]],
      ['second',[[12,81],[16,83],[15,90],[11,88]]]
    ],
    cometes:[
      ['edge',[[0,0],[17,0],[0,41],[6,9]]],
      ['fold',[[0,6],[11,0],[0,54],[3,16]]],
      ['edge',[[0,60],[16,33],[6,64],[0,84]]],
      ['fold',[[0,69],[11,47],[4,74],[0,87]]],
      ['edge',[[0,100],[16,75],[10,100]]],
      ['second',[[0,1],[7,0],[0,25]]],
      ['accent',[[12,39],[16,33],[13,41]]],
      ['accent',[[12,81],[16,75],[14,83]]]
    ],
    tissage:[
      ['edge',[[0,0],[4,0],[16,20],[12,24]]],
      ['fold',[[0,21],[12,0],[16,0],[0,29]]],
      ['edge',[[0,31],[4,31],[16,51],[12,55]]],
      ['fold',[[0,52],[12,31],[16,31],[0,60]]],
      ['edge',[[0,62],[4,62],[16,82],[12,86]]],
      ['fold',[[0,83],[12,62],[16,62],[0,91]]],
      ['edge',[[0,93],[4,93],[8,100],[3,100]]],
      ['accent',[[8,7],[12,14],[10,18],[6,11]]],
      ['second',[[2,80],[5,74],[7,78],[4,84]]]
    ],
    labyrinthe:[
      ['edge',[[0,0],[16,0],[16,24],[6,24],[6,17],[11,17],[11,5],[0,5]]],
      ['fold',[[0,10],[3,10],[3,29],[14,29],[14,36],[0,36],[0,31],[8,31],[0,26]]],
      ['edge',[[0,42],[16,42],[16,67],[6,67],[6,60],[11,60],[11,47],[0,47]]],
      ['fold',[[0,53],[3,53],[3,73],[14,73],[14,80],[0,80],[0,75],[8,75],[0,69]]],
      ['edge',[[0,86],[16,86],[16,100],[11,100],[11,91],[0,91]]],
      ['accent',[[11,0],[16,0],[16,4],[11,4]]],
      ['second',[[6,63],[10,63],[10,67],[6,67]]]
    ],
    couronne:[
      ['edge',[[0,0],[17,0],[15,13],[11,6],[8,20],[4,10],[0,27]]],
      ['fold',[[0,0],[11,0],[8,8],[4,3],[0,15]]],
      ['edge',[[0,39],[8,31],[6,46],[14,41],[10,58],[3,54],[0,67]]],
      ['fold',[[0,42],[6,37],[3,51],[0,55]]],
      ['edge',[[0,78],[6,71],[9,84],[16,76],[14,100],[0,100]]],
      ['fold',[[0,86],[5,79],[9,92],[14,85],[12,100],[0,100]]],
      ['accent',[[14,0],[17,0],[15,9]]],
      ['second',[[11,81],[16,76],[14,90]]]
    ],
    ecailles:[
      ['edge',[[0,0],[11,0],[16,11],[8,25],[0,17]]],
      ['fold',[[0,16],[7,15],[13,29],[6,43],[0,35]]],
      ['edge',[[0,34],[9,33],[16,47],[8,61],[0,53]]],
      ['fold',[[0,52],[7,51],[13,65],[6,79],[0,71]]],
      ['edge',[[0,70],[9,69],[16,83],[8,97],[0,89]]],
      ['fold',[[0,88],[7,87],[13,100],[0,100]]],
      ['second',[[9,0],[11,0],[15,10],[13,12]]],
      ['accent',[[9,73],[13,81],[11,84],[7,76]]]
    ],
    plis:[
      ['edge',[[0,0],[4,0],[9,19],[5,40],[10,62],[6,84],[10,100],[0,100]]],
      ['fold',[[4,0],[9,0],[13,19],[9,40],[14,62],[10,84],[14,100],[10,100],[6,84],[10,62],[5,40],[9,19]]],
      ['edge',[[9,0],[13,0],[17,19],[13,40],[17,62],[14,84],[17,100],[14,100],[10,84],[14,62],[9,40],[13,19]]],
      ['second',[[11,0],[13,0],[15,11],[13,11]]],
      ['accent',[[10,85],[12,83],[15,95],[13,98]]]
    ],
    vagues:[
      ['edge',[[0,0],[16,0],[10,9],[3,13],[0,21]]],
      ['edge',[[0,29],[7,25],[15,30],[17,38],[10,34],[5,38],[3,47],[0,51]]],
      ['fold',[[0,35],[6,31],[10,34],[5,38],[3,47],[0,51]]],
      ['edge',[[0,58],[7,54],[15,59],[17,67],[10,63],[5,67],[3,76],[0,80]]],
      ['fold',[[0,64],[6,60],[10,63],[5,67],[3,76],[0,80]]],
      ['edge',[[0,88],[8,83],[16,90],[12,100],[0,100]]],
      ['accent',[[11,29],[15,30],[17,38],[14,34]]],
      ['second',[[6,86],[8,83],[12,87],[11,90]]]
    ],
    ailes:[
      ['edge',[[0,0],[17,0],[8,12],[0,40]]],
      ['fold',[[0,5],[16,12],[7,21],[0,40]]],
      ['edge',[[0,13],[14,24],[6,29],[0,40]]],
      ['fold',[[0,22],[10,34],[4,36],[0,40]]],
      ['edge',[[0,61],[17,79],[9,82],[0,94]]],
      ['fold',[[0,70],[14,89],[6,89],[0,100]]],
      ['edge',[[0,81],[9,100],[0,100]]],
      ['accent',[[13,0],[17,0],[12,5]]],
      ['second',[[12,75],[17,79],[13,80]]]
    ],
    facettes:[
      ['edge',[[0,0],[16,0],[7,18],[13,35],[4,46],[0,41]]],
      ['fold',[[0,0],[7,18],[0,26]]],
      ['fold',[[16,0],[7,18],[13,35],[10,12]]],
      ['edge',[[0,54],[13,44],[17,63],[9,75],[14,100],[0,100]]],
      ['fold',[[13,44],[17,63],[9,75],[6,60]]],
      ['fold',[[0,70],[9,75],[14,100],[5,91]]],
      ['accent',[[11,3],[15,0],[12,7]]],
      ['second',[[11,88],[14,100],[11,100]]]
    ],
    losanges:[
      ['edge',[[0,0],[8,0],[15,12],[8,24],[0,11]]],
      ['fold',[[0,21],[9,36],[0,51]]],
      ['edge',[[0,49],[9,37],[17,51],[9,66]]],
      ['fold',[[0,69],[9,83],[0,98]]],
      ['edge',[[0,96],[9,84],[17,97],[15,100],[0,100]]],
      ['fold',[[9,37],[17,51],[9,66],[12,51]]],
      ['accent',[[8,0],[13,8],[11,11],[6,3]]],
      ['second',[[10,87],[14,94],[12,97],[8,90]]]
    ],
    diagonales:[
      ['edge',[[0,0],[17,0],[0,28],[0,19],[11,0]]],
      ['fold',[[0,29],[17,2],[17,10],[0,39]]],
      ['edge',[[0,51],[17,23],[17,33],[0,63]]],
      ['fold',[[0,64],[17,37],[17,45],[0,74]]],
      ['edge',[[0,87],[17,59],[17,69],[0,99]]],
      ['fold',[[6,100],[17,82],[17,91],[12,100]]],
      ['accent',[[12,0],[17,0],[12,8],[9,8]]],
      ['second',[[0,92],[4,85],[4,90],[0,97]]]
    ],
    portiques:[
      ['edge',[[0,0],[15,0],[17,3],[17,25],[12,25],[12,7],[7,7],[7,18],[2,18],[2,7],[0,7]]],
      ['fold',[[0,30],[12,30],[15,34],[15,54],[10,54],[10,37],[5,37],[5,48],[0,48]]],
      ['edge',[[0,60],[15,60],[17,63],[17,85],[12,85],[12,67],[7,67],[7,78],[2,78],[2,67],[0,67]]],
      ['fold',[[0,91],[12,91],[15,95],[15,100],[10,100],[10,98],[5,98],[5,100],[0,100]]],
      ['accent',[[12,0],[15,0],[17,3],[17,8],[15,5],[12,5]]],
      ['second',[[2,70],[5,70],[5,77],[2,77]]]
    ],
    pyramides:[
      ['edge',[[0,0],[17,0],[0,22]]],
      ['fold',[[0,0],[6,0],[0,22]]],
      ['edge',[[0,24],[17,40],[0,56]]],
      ['fold',[[0,24],[6,40],[0,56]]],
      ['edge',[[0,62],[17,78],[0,94]]],
      ['fold',[[0,62],[6,78],[0,94]]],
      ['edge',[[5,100],[17,90],[17,100]]],
      ['accent',[[14,0],[17,0],[14,4]]],
      ['second',[[13,74],[17,78],[13,82],[14,78]]]
    ],
    spirales:[
      ['edge',[[0,0],[17,0],[17,23],[4,23],[4,9],[10,9],[10,15],[8,15],[8,18],[12,18],[12,5],[0,5]]],
      ['fold',[[0,28],[13,28],[13,46],[3,46],[3,35],[8,35],[8,40],[7,40],[7,42],[9,42],[9,32],[0,32]]],
      ['edge',[[0,52],[17,52],[17,75],[4,75],[4,61],[10,61],[10,67],[8,67],[8,70],[12,70],[12,57],[0,57]]],
      ['fold',[[0,81],[13,81],[13,99],[3,99],[3,88],[8,88],[8,93],[7,93],[7,95],[9,95],[9,85],[0,85]]],
      ['accent',[[12,0],[17,0],[17,4],[12,4]]],
      ['second',[[0,54],[4,54],[4,57],[0,57]]]
    ],
    dechirures:[
      ['edge',[[0,0],[13,0],[10,7],[14,14],[8,18],[12,27],[5,32],[10,41],[4,46],[9,54],[3,62],[7,68],[2,77],[6,85],[3,91],[7,100],[0,100]]],
      ['fold',[[0,0],[5,0],[2,9],[6,17],[1,25],[4,31],[0,40]]],
      ['fold',[[0,44],[4,46],[9,54],[3,62],[0,58]]],
      ['fold',[[0,75],[2,77],[6,85],[3,91],[7,100],[2,100],[0,91]]],
      ['accent',[[9,0],[13,0],[10,7],[8,5]]],
      ['second',[[3,91],[7,100],[5,100],[2,94]]]
    ],
    eclairs:[
      ['edge',[[0,0],[17,0],[8,22],[14,21],[3,51],[5,29],[0,32]]],
      ['fold',[[0,0],[9,0],[2,21],[6,20],[0,40]]],
      ['edge',[[0,62],[17,49],[10,72],[15,71],[3,100],[5,79],[0,82]]],
      ['fold',[[0,68],[10,60],[4,79],[8,78],[0,98]]],
      ['accent',[[13,0],[17,0],[12,12],[10,13]]],
      ['second',[[13,52],[17,49],[13,60],[11,61]]]
    ],
    paves:[
      ['edge',[[0,0],[10,0],[15,8],[11,18],[0,18]]],
      ['fold',[[0,23],[9,20],[13,28],[10,39],[0,42]]],
      ['edge',[[0,46],[12,46],[16,54],[12,64],[0,64]]],
      ['fold',[[0,69],[8,66],[13,74],[10,85],[0,88]]],
      ['edge',[[0,92],[11,90],[16,99],[15,100],[0,100]]],
      ['fold',[[0,13],[11,13],[11,18],[0,18]]],
      ['accent',[[10,0],[15,8],[13,11],[8,3]]],
      ['second',[[12,52],[16,54],[12,64],[10,63]]]
    ],
    piles:[
      ['fold',[[0,0],[12,0],[16,5],[8,14],[0,9]]],
      ['edge',[[0,9],[8,14],[16,5],[16,13],[8,22],[0,17]]],
      ['fold',[[0,31],[10,28],[16,35],[7,44],[0,40]]],
      ['edge',[[0,40],[7,44],[16,35],[16,43],[7,52],[0,48]]],
      ['fold',[[0,62],[11,59],[17,66],[8,75],[0,71]]],
      ['edge',[[0,71],[8,75],[17,66],[17,74],[8,83],[0,79]]],
      ['fold',[[0,93],[10,90],[16,97],[13,100],[0,100]]],
      ['accent',[[10,0],[12,0],[16,5],[14,7]]],
      ['second',[[12,72],[17,67],[17,70],[12,75]]]
    ],
    rayons:[
      ['edge',[[0,0],[17,0],[0,57]]],
      ['fold',[[0,0],[12,0],[0,57]]],
      ['edge',[[0,0],[7,0],[0,57]]],
      ['fold',[[0,57],[17,26],[17,38]]],
      ['edge',[[0,57],[16,55],[17,65]]],
      ['fold',[[0,57],[15,85],[9,90]]],
      ['edge',[[0,57],[6,100],[0,100]]],
      ['accent',[[15,0],[17,0],[13,13]]],
      ['second',[[13,31],[17,26],[17,30],[12,34]]]
    ],
    croissants:[
      ['edge',[[0,0],[16,0],[17,8],[14,20],[7,28],[0,31],[0,24],[6,20],[10,12],[10,4],[0,4]]],
      ['fold',[[0,4],[7,5],[8,12],[4,19],[0,21],[0,16],[3,11],[0,7]]],
      ['edge',[[0,44],[8,47],[15,56],[17,68],[15,80],[9,89],[0,93],[0,86],[6,80],[10,69],[9,59],[5,53],[0,51]]],
      ['fold',[[0,58],[5,61],[7,69],[5,77],[0,82],[0,76],[3,69],[0,63]]],
      ['accent',[[12,0],[16,0],[17,8],[14,7]]],
      ['second',[[0,88],[5,85],[5,88],[0,93]]]
    ],
    passerelles:[
      ['edge',[[0,0],[6,0],[6,14],[15,14],[17,17],[17,25],[12,25],[12,20],[6,20],[6,30],[0,30]]],
      ['fold',[[0,35],[11,35],[11,44],[17,44],[17,49],[7,49],[7,40],[0,40]]],
      ['edge',[[0,56],[6,56],[6,70],[15,70],[17,73],[17,81],[12,81],[12,76],[6,76],[6,86],[0,86]]],
      ['fold',[[0,91],[11,91],[11,100],[7,100],[7,96],[0,96]]],
      ['accent',[[9,14],[15,14],[17,17],[17,20],[14,18],[9,18]]],
      ['second',[[0,76],[4,76],[4,83],[0,83]]]
    ],
    lanternes:[
      ['edge',[[0,0],[10,0],[10,5],[16,14],[13,26],[6,32],[0,26]]],
      ['fold',[[10,5],[16,14],[13,26],[6,32],[9,18]]],
      ['edge',[[0,43],[7,38],[14,49],[12,60],[5,65],[0,59]]],
      ['fold',[[7,38],[14,49],[12,60],[5,65],[7,51]]],
      ['edge',[[0,80],[7,74],[16,85],[13,98],[10,100],[0,100]]],
      ['fold',[[7,74],[16,85],[13,98],[10,100],[8,87]]],
      ['accent',[[5,0],[10,0],[10,4],[5,4]]],
      ['second',[[10,78],[14,83],[12,85],[8,80]]]
    ],
    triangles:[
      ['edge',[[0,0],[17,0],[4,19]]],
      ['fold',[[0,8],[8,28],[0,35]]],
      ['edge',[[0,40],[17,24],[10,52]]],
      ['fold',[[0,48],[6,62],[0,69]]],
      ['edge',[[0,75],[16,58],[11,89]]],
      ['fold',[[0,83],[8,100],[0,100]]],
      ['edge',[[12,100],[17,86],[17,100]]],
      ['accent',[[13,0],[17,0],[13,6]]],
      ['second',[[13,62],[16,58],[15,68]]]
    ],
    tresses:[
      ['edge',[[0,0],[5,0],[15,14],[6,26],[15,38],[6,50],[15,62],[6,74],[15,86],[5,100],[0,100],[10,86],[1,74],[10,62],[1,50],[10,38],[1,26],[10,14]]],
      ['fold',[[10,0],[15,0],[5,14],[14,26],[5,38],[14,50],[5,62],[14,74],[5,86],[15,100],[10,100],[0,86],[9,74],[0,62],[9,50],[0,38],[9,26],[0,14]]],
      ['edge',[[7,18],[12,24],[9,28],[4,22]]],
      ['edge',[[7,66],[12,72],[9,76],[4,70]]],
      ['accent',[[10,0],[14,0],[10,6],[8,3]]],
      ['second',[[10,93],[14,99],[10,99],[8,96]]]
    ],
    cascades:[
      ['edge',[[0,0],[15,0],[17,9],[6,20],[6,29],[0,34]]],
      ['fold',[[0,0],[7,0],[9,10],[3,17],[3,27],[0,30]]],
      ['edge',[[0,40],[10,31],[16,39],[5,50],[5,61],[0,67]]],
      ['fold',[[0,45],[5,39],[8,43],[2,49],[2,58],[0,61]]],
      ['edge',[[0,74],[10,65],[17,73],[6,85],[6,96],[2,100],[0,100]]],
      ['fold',[[0,79],[5,73],[9,77],[3,83],[3,93],[0,98]]],
      ['accent',[[12,0],[15,0],[17,9],[14,7]]],
      ['second',[[11,68],[16,72],[13,75],[9,71]]]
    ]
  };
  const themes=[{id:'classic',fr:'Classique',en:'Classic',base:'#20252a',classic:true},
    ...palettes.map(([id,fr,en,base,edge,fold,accent,second],index)=>({id,fr,en,base,edge,fold,accent,second,index})),
    ...extraPalettes.map(([id,fr,en,base,edge,fold,accent,second])=>({id,fr,en,base,edge,fold,accent,second,motif:id})),
    ...collagePalettes.map(([id,fr,en,base,edge,fold,accent,second,seed])=>({id,fr,en,base,edge,fold,accent,second,seed}))];
  let selected='classic';
  function name(theme){return LANG==='fr'?theme.fr:theme.en;}
  function scenery(theme){
    const scene=document.createElement('span');scene.className='table-background';
    scene.setAttribute('aria-hidden','true');scene.style.setProperty('--scene-base',theme.base);
    if(theme.classic){scene.classList.add('background-original');return scene;}
    for(const tone of ['edge','fold','accent','second'])scene.style.setProperty('--scene-'+tone,theme[tone]);
    const shard=(points,tone='edge',right=false,reverse=false)=>{
      const paper=document.createElement('i');paper.className='background-shard';
      paper.style.background=`var(--scene-${tone})`;
      paper.style.clipPath='polygon('+points.map(([x,y])=>`${right?100-x:x}% ${reverse?100-y:y}%`).join(',')+')';
      scene.append(paper);
    };
    if(theme.seed){
      // A private fixed seed keeps the irregular collage identical in its
      // preview and at the table, without consuming any gameplay randomness.
      let seed=theme.seed;
      const between=(min,max)=>{
        seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
        return Number((min+(max-min)*(seed>>>0)/4294967296).toFixed(2));
      };
      for(const right of [false,true]){
        shard([[0,0],[between(9,16),0],[between(8,17),between(19,29)],[between(7,14),between(41,51)],[between(9,17),between(65,78)],[between(7,15),100],[0,100]],'fold',right);
        const upper=between(18,32),middle=between(43,61),lower=between(62,74),tip=between(81,94);
        shard([[0,0],[between(3,9),0],[between(9,17),upper],[between(2,6),upper-9],[between(7,14),middle],[0,middle-9]],'edge',right);
        shard([[0,lower],[between(3,7),lower-10],[between(9,17),tip],[between(3,7),tip-10],[between(6,13),100],[0,100]],'edge',right);
        shard([[0,between(3,10)],[between(3,7),between(19,26)],[between(1,4),between(33,40)],[0,between(28,32)]],'fold',right);
        for(const [start,end] of [[4,18],[35,51],[72,87]]){
          const y=between(start,end),height=between(9,20),width=between(5,14);
          shard([[0,y],[width,y+height],[width*.38,y+height*.43],[0,y+height*.73]],'second',right);
          shard([[0,y+height*.2],[width*.48,y+height*.8],[width*.19,y+height*.48]],'edge',right);
        }
        const corner=right?between(79,84):between(0,5),length=between(11,16);
        shard([[0,corner],[between(2,4),corner+2],[between(6,10),corner+length],[between(2,4),corner+length-4]],'accent',right);
        shard([[0,corner+4],[between(2,4),corner+length-4],[0,corner+length]],'fold',right);
      }
      return scene;
    }
    if(theme.motif){
      for(const right of [false,true])for(const [tone,points] of motifs[theme.motif])shard(points,tone,right,right);
      return scene;
    }
    const variant=Math.floor(theme.index/5),family=theme.index%5,width=10+variant*2;
    for(const right of [false,true]){
      const reverse=right!==!!(variant%2),w=width+(right?2:0);
      if(family===0){
        shard([[0,0],[w*.35,0],[w,23],[w*.5,19],[w*.9,51],[0,39]],'edge',right,reverse);
        shard([[0,43],[w*.58,37],[w*.3,69],[w,61],[0,95]],'edge',right,reverse);
        shard([[0,10],[w*.34,31],[0,27]],'fold',right,reverse);
      }else if(family===1){
        shard([[0,0],[w,13],[w*.27,38],[0,31]],'edge',right,reverse);
        shard([[0,34],[w*.8,48],[w*.24,73],[0,60]],'fold',right,reverse);
        shard([[0,65],[w,78],[w*.36,100],[0,100]],'edge',right,reverse);
      }else if(family===2){
        shard([[0,0],[w*1.1,0],[0,42]],'edge',right,reverse);
        shard([[0,0],[w*.72,27],[0,17]],'fold',right,reverse);
        shard([[0,100],[w*.98,47],[w*.6,85]],'edge',right,reverse);
        shard([[0,100],[w*.5,70],[w*1.12,94]],'fold',right,reverse);
      }else if(family===3){
        shard([[0,0],[w*.42,0],[w,18],[w*.35,32],[w*.85,49],[w*.3,62],[w,82],[w*.35,100],[0,100]],'edge',right,reverse);
        shard([[0,16],[w*.58,32],[0,46]],'fold',right,reverse);
        shard([[0,58],[w*.6,73],[0,91]],'fold',right,reverse);
      }else{
        shard([[0,0],[w*.6,0],[w,29],[w*.25,20],[0,44]],'edge',right,reverse);
        shard([[0,48],[w*.4,38],[w*.95,73],[0,61]],'fold',right,reverse);
        shard([[0,68],[w*.75,61],[w*.45,83],[w,100],[0,100]],'edge',right,reverse);
      }
      const corner=right?variant%2===0:variant%2===1;
      shard([[0,100],[w*.7,79+variant*2],[w*.4,100]],'second',right,corner);
      shard([[0,91-variant],[w*.42,100],[0,100]],'accent',right,corner);
    }
    return scene;
  }
  function syncSelection(){
    for(const button of $('backgroundGrid').children){
      const active=button.dataset.backgroundId===selected;
      button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
    }
  }
  function refresh(){
    const grid=$('backgroundGrid');if(!grid)return;
    grid.setAttribute('aria-label',t('background.title'));
    const buttons=themes.map(theme=>{
      const button=document.createElement('button');button.type='button';button.className='background-choice';
      button.dataset.action='select-background';button.dataset.backgroundId=theme.id;button.setAttribute('data-reading-label','');
      const preview=document.createElement('span');preview.className='background-preview';preview.append(scenery(theme));
      const label=document.createElement('span');label.className='background-name';label.textContent=name(theme);
      const check=document.createElement('span');check.className='background-check';check.setAttribute('aria-hidden','true');
      check.innerHTML='<svg viewBox="0 0 16 16" width="16" height="16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      button.append(preview,label,check);return button;
    });
    grid.replaceChildren(...buttons);syncSelection();
  }
  function select(id,persist=true){
    const theme=themes.find(theme=>theme.id===id);if(!theme)return false;
    selected=id;
    const bg=$('bg');bg.dataset.background=id;bg.style.setProperty('--selected-bg-base',theme.base);
    $('tableBackdrop').replaceChildren(...(theme.classic?[]:[scenery(theme)]));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.base);
    if(persist)try{localStorage.setItem(key,id);}catch(e){}
    syncSelection();return true;
  }
  function open(){
    if(!$('pauseScreen').classList.contains('show'))return false;
    refresh();$('pauseScreen').classList.remove('show');$('backgroundScreen').classList.add('show');return true;
  }
  function close(){
    if(!$('backgroundScreen').classList.contains('show'))return;
    $('backgroundScreen').classList.remove('show');$('pauseScreen').classList.add('show');
  }
  const api={themes,open,close,select,refresh,get selected(){return selected;}};
  window.ColdDeckBackgrounds=api;
  let saved;try{saved=localStorage.getItem(key);}catch(e){}
  select(themes.some(theme=>theme.id===saved)?saved:'classic',false);
  refresh();return api;
})();

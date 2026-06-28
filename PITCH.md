# TABLE 21 — Pitch & Game Design Document

*Blackjack roguelite clandestin · pixel art · mobile*

---

## 1. Pitch court

Dans l'arrière-salle d'un tripot clandestin, on ne gagne pas en jetant son argent sur le tapis.

**TABLE 21** est un **blackjack roguelite** où chaque table est une **épreuve courte et complète** : un nombre de mains imposé, une mise plafonnée, un objectif à atteindre **à la fin**, et des **étoiles** à décrocher si tu joues mieux que survivre. Tu gères ta **pression**, tu choisis tes **atouts** et tes **tarots**, tu décides à chaque palier si tu **encaisses ta réputation** ou si tu **replonges** plus profond.

Tu n'achètes pas la progression avec tes jetons. Tu la **mérites** avec tes étoiles.

---

## 2. Boucle de jeu

1. **LA PLANQUE** (hub) — tu dépenses ta **réputation ★** en avantages permanents, tu prépares ta descente, tu choisis ton dos de carte, puis tu entres dans le casino.
2. **Une table** = une épreuve : tu joues **toutes** les mains obligatoires, en gardant ta mise dans les **limites imposées**.
3. **Validation en fin de table** : on regarde ton capital final → tu décroches **1, 2 ou 3 étoiles**.
4. **Récompense / Boutique** — selon ta performance : réputation, choix de butin, accès boutique (régulateur économique).
5. **Progression cadrée** — tu avances dans une **run en 3 zones**. Les **étoiles** ouvrent les boss, les zones profondes et les chemins alternatifs.
6. **Boss tous les 3 niveaux** — épreuve renforcée qui clôt une zone.
7. **Point de sécurité** — après un boss / une fin de zone : **encaisser** (sécuriser la réputation, finir la nuit) ou **replonger** (zone plus dure, plus payante, plus exclusive).

> Le cœur du jeu : *jouer une table courte → tenir plusieurs mains → gérer sa mise sous plafond → atteindre l'objectif final → viser les étoiles → choisir butin ou boutique → franchir une zone plus dure → affronter un boss → sécuriser ou risquer sa réputation.*

---

## 3. Les deux monnaies (+ une devise de progression)

| Élément | Rôle | Portée |
|---|---|---|
| **Jetons $** | Mise et score d'une table. Servent à atteindre les objectifs et à acheter en boutique. | **Une run** (ne se transmettent jamais d'une nuit à l'autre) |
| **Réputation ★** | Devise **permanente**. Achète les déblocages à la Planque. Récompense la **profondeur, les étoiles et le risque maîtrisé** — jamais une explosion de jetons. | Méta (permanente) |
| **Étoiles ✦** | **Clé de progression d'une run.** Débloquent boss, zones profondes et chemins. On ne progresse **pas** uniquement avec des jetons. | Une run |

Principe directeur : **les jetons font le score d'une table, les étoiles ouvrent le casino, la réputation construit ta légende.** Les trois sont volontairement cloisonnés pour qu'aucun ne casse les autres.

---

## 4. Structure d'une run

Une descente n'est plus infinie : c'est une **run structurée de 9 tables**, en **3 zones de 3 tables**, avec un **boss au 3ᵉ niveau de chaque zone** (tables 3, 6, 9).

```
ZONE 1 — Initiation        T1 → T2 → [BOSS 1]
ZONE 2 — La Pression       T4 → T5 → [BOSS 2]      (droit d'entrée + chemins)
ZONE 3 — Casino profond    T7 → T8 → [BOSS FINAL]  (droit d'entrée, tables dangereuses)
```

- **Mode Run** (principal) : 9 tables, victoire à la chute du boss final.
- **Mode Infini** (avancé, débloqué **après une première victoire**) : reprend les règles de la Zone 3 et continue indéfiniment, pour le scoring et les défis — **jamais** la structure par défaut.

L'accès se mérite : entrer dans une zone profonde et affronter un boss exige un **minimum d'étoiles** (voir §9–10).

---

## 5. Fonctionnement d'une table

Une table est une **épreuve fermée**, lisible en un coup d'œil :

- Un **nombre de mains obligatoire** : tu joues **toutes** les mains, ni plus ni moins. **La table n'est validée qu'à la fin.** Atteindre un montant en cours de route ne « termine » jamais la table — il faut tenir.
- Une **mise minimum** et une **mise maximum fixe** (un nombre, **pas** un pourcentage du capital).
- Un **capital conseillé** : la banque recommandée pour aborder la table sereinement.
- Un **objectif de jetons final** (objectif principal) et un **objectif de maîtrise** (objectif secondaire, plus exigeant).
- Une **règle spéciale** éventuelle (croupier, pression, paiement…).
- Une **récompense selon performance**, exprimée en **étoiles**.

À la fin des mains obligatoires, le jeu compare ton capital final aux deux seuils et attribue les étoiles.

---

## 6. Règles de blackjack maison

- **Sabot** : plusieurs jeux mélangés, reconstitué automatiquement. Valeurs standard — As = 11 ou 1, figures = 10.
- **But d'une main** : battre le croupier sans dépasser 21.
- **Croupier** : tire jusqu'à **17** (jusqu'à **18** sur les tables « gros bras »). Quand la table a chauffé, il devient plus agressif sur les 17 souples.
- **Actions du joueur :**

| Action | Quand | Effet |
|---|---|---|
| **TIRER** | Main < 21 | +1 carte · **monte la pression** |
| **RESTER** | Toujours | Tu figes ta main ; jouer trop prudemment **fait retomber la pression** |
| **RISQUER** | Main 17–20 | Tu tires quand même → bonus **Insistance** si tu survis · grosse pression |
| **FORCER LA CHANCE** | En jeu, **1× par table** | Pioche 2 cartes, garde la meilleure · très grosse pression · coût de risque |

Les actions les plus puissantes sont **bridées** (FORCER : une seule fois par table) pour éviter d'enchaîner les coups gagnants sans risque.

---

## 7. Pression

La **pression** (0 → 100 %) reste un pilier : c'est la **tension du tapis**.

**Elle monte avec le risque :**
- chaque **tirage** (+),
- les **grosses mises** (plus tu mises haut, plus la base de pression est élevée),
- les **tirages dangereux** (RISQUER, FORCER).

**Elle baisse avec la prudence et l'échec :**
- après une **perte** ou un **bust**,
- en **restant tôt** / en jouant petit (refroidissement progressif),
- via certains tarots (refroidir / annuler).

| Palier | État | Effet |
|---|---|---|
| 0 % | **FROID** | — |
| ≥ 25 % | **TIÈDE** | le croupier durcit (17 souple) |
| ≥ 50 % | **CHAUD** | conditionne certains atouts |
| ≥ 75 % | **BOUILLANT** | **bonus de multiplicateur** (plafonné, voir §11/15) |
| 100 % | **SURCHAUFFE** | **TIRAGE FORCÉ** : tu prends une carte de force |

La pression **récompense le risque, mais ne donne jamais une victoire automatique** : à 100 %, elle te met en danger (tirage forcé) autant qu'elle te paie. Elle retombe à 0 entre les mains.

---

## 8. Mises et limites

C'est ici que se joue l'anti-cassage du jeu.

- **Mise minimum** et **mise maximum** sont **propres à chaque table** et **fixes**.
- La **mise maximum n'est jamais un pourcentage du capital.** Un joueur riche **ne peut pas** miser plus que le plafond de la table → il ne peut pas **sauter** la progression en écrasant l'objectif d'un seul coup.
- Tu **peux** miser gros (jusqu'au plafond), mais une grosse mise **monte la pression** et **expose** une grosse perte : c'est un choix tendu, pas un bouton « gagner ».
- Le plafond augmente **lentement** de zone en zone, en cohérence avec les objectifs, pour garder la même **tension relative** du début à la fin.

Conséquence : la difficulté vient de **tenir une table entière sous contrainte**, pas de trouver le montant magique qui fait exploser le score.

---

## 9. Objectifs, étoiles et maîtrise

À la fin des mains obligatoires, la table attribue des **étoiles** :

| Étoiles | Condition |
|---|---|
| ✦ **1 étoile** | **Survie** : table terminée au-dessus du **capital minimum** (tu n'es pas à sec). |
| ✦✦ **2 étoiles** | **Objectif final atteint** : capital final ≥ objectif principal. |
| ✦✦✦ **3 étoiles** | **Objectif + Maîtrise** : objectif principal **et** objectif de maîtrise atteints. |

L'**objectif de maîtrise** est un défi secondaire propre à chaque table (capital nettement supérieur, et/ou condition de style : *ne jamais buster*, *gagner X mains à pression ≥ 50 %*, *réussir un 21 parfait*, *finir avec une carte à édition*…).

**Les étoiles sont la clé de progression :**
- accéder au **boss** d'une zone exige un **minimum d'étoiles** gagnées dans la zone ;
- ouvrir une **zone profonde** ou un **chemin alternatif** demande un total d'étoiles ;
- le **boss final** n'est accessible qu'avec un score d'étoiles élevé : il faut **maîtriser**, pas seulement survivre.

On **ne peut pas** tout débloquer à coups de jetons. C'est le jeu, pas le portefeuille, qui ouvre les portes.

---

## 10. Tables, zones et boss

Trois zones, une vraie **courbe** : épreuves courtes, lisibles, à enjeu propre.

### ZONE 1 — Initiation
Règles simples, mises faibles, on apprend à tenir une table.

### ZONE 2 — La Pression
Règles spéciales, **choix de chemin** (branche sûre / branche risquée selon tes étoiles), boutique plus importante. **Droit d'entrée** à payer.

### ZONE 3 — Casino profond
Tables dangereuses, plafonds de multiplicateur tendus, **droit d'entrée** élevé, **boss final**.

**Grille de référence** *(valeurs de départ à équilibrer en playtest)* :

| # | Table | Zone | Mains oblig. | Mise min | **Mise max (fixe)** | Capital conseillé | Objectif final | Maîtrise | Règle spéciale | Accès |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Arrière-salle | 1 | 4 | 5 | **20** | 50 | 120 | 180 *(0 bust)* | — | libre |
| 2 | Table nerveuse | 1 | 5 | 5 | **25** | 130 | 220 | 320 | Pression ×2 plus vite | — |
| 3 | **Le Videur** ★ | 1 | 5 | 10 | **30** | 200 | 340 | 460 *(2 gains à ≥50 %)* | **BOSS** · croupier tire à 18 | ≥ **2✦** en zone 1 |
| 4 | Cave humide | 2 | 5 | 10 | **40** | 300 | 560 | 760 | Croupier muet (cartes cachées) · **droit d'entrée 150** | ≥ **3✦** total |
| 5 | Salon rouge | 2 | 6 | 15 | **50** | 450 | 820 | 1 080 *(un 21 parfait)* | Choix de chemin (sûr/risqué) | — |
| 6 | **Le Banquier** ★ | 2 | 6 | 20 | **60** | 650 | 1 150 | 1 500 | **BOSS** · départ chaud (+30 % pression) | ≥ **2✦** en zone 2 |
| 7 | Fosse aux as | 3 | 6 | 25 | **80** | 900 | 1 650 | 2 150 | **Droit d'entrée 400** · plafond mult tendu | ≥ **7✦** total |
| 8 | Table maudite | 3 | 7 | 30 | **100** | 1 300 | 2 350 | 3 000 *(jamais à sec)* | Sabot truqué (cartes hautes rares) | — |
| 9 | **La Faucheuse** ★ | 3 | 7 | 40 | **120** | 1 800 | 3 200 | 4 100 | **BOSS FINAL** · gros bras **+** égalité = défaite | ≥ **12✦** total |

Le **cash-out** n'est pas proposé après chaque table : il s'ouvre **aux paliers importants** — après chaque **boss** (fin de zone). C'est là, et seulement là, que tu choisis **encaisser ou replonger**, pour préserver le rythme et le poids de la décision.

---

## 11. Boutique et économie anti-snowball

La boutique n'est pas qu'un magasin : c'est le **régulateur économique** du jeu. Elle **absorbe** les excès de jetons pour casser l'effet boule de neige.

Elle propose : **atouts**, **tarots**, **soins** (récupérer du capital de sécurité), **protections** (annuler une perte, filet anti-bust), **relances** (re-tirer l'offre).

Mécanismes anti-snowball :
1. **Mise max fixe** par table (§8) — la cause racine est neutralisée à la source.
2. **Droits d'entrée / coûts de passage** entre zones (150 puis 400) : montés dans des salles plus exclusives, ils **épongent** une partie des gains et créent la sensation de franchir un seuil.
3. **Prix de boutique indexés sur la profondeur**, pas sur ta richesse : les bons objets restent chers, impossible de tout rafler d'un coup.
4. **Coffre de la Planque** : au-delà d'un **plafond de jetons**, le surplus se **convertit en réputation à taux dégressif** — accumuler bêtement ne paie pas, mieux vaut **dépenser et risquer**.
5. **Jetons non transmissibles** entre runs : seule la réputation reste.

---

## 12. Atouts (reliques)

Objets **permanents pour la durée d'une run**, achetés en boutique. Ils orientent un style (pression, économie, éditions, défense) **sans** créer de combo qui gagne tout seul.

Tous les atouts puissants sont **bridés** par au moins une contrainte :
- **une fois par table**, ou **une fois toutes les X mains** ;
- **seulement sous condition** (pression ≥ seuil, As en main, capital bas…) ;
- **avec un coût** (pression, jetons, ou réputation temporaire).

Familles d'atouts :
- **Lecture & contrôle** — voir la prochaine carte (1×/main), afficher le risque de bust.
- **Pression** — refroidir moins vite, convertir la chaleur en bonus plafonné, primes à pression ≥ 50/75 %.
- **Économie** — petit revenu par main, intérêts plafonnés sur la banque (max fixe), demi-mise rendue sur certaines pertes.
- **Éditions** — éditions plus fréquentes, première carte FOIL.
- **Défense** — filet anti-bust, demi-mise sur égalité.

> Règle d'or de design : **aucun atout ne doit transformer une table en formalité.** Un atout fait **pencher** une décision, il ne la **remplace** pas.

---

## 13. Tarots (consommables)

Cartes à **usage unique**, rangées dans des emplacements limités (extensibles via certains déblocages). Ce sont des **leviers tactiques** que tu lâches au bon moment — et leur puissance est **encadrée** :
- **un seul usage** par carte ;
- au plus **un tarot par main** ;
- certains exigent une **condition** (avoir des cartes en main, une carte tirée à retirer…).

Effets types :
- **Refroidir / annuler la pression** (gérer la surchauffe).
- **Petit apport de jetons** (sécuriser une survie, pas exploser le score).
- **Transformer une carte** en FOIL / HOLO / POLY.
- **Retirer la dernière carte tirée** (sauver une main).
- **Truquer la prochaine carte** (une seule fois).
- **Pari aléatoire** (édition aléatoire ou rien).

---

## 14. Éditions de cartes

Certaines cartes sortent « brillantes » (rares ; un atout les rend plus fréquentes). Trois éditions, animées sur la carte :

- **FOIL** — **jetons bonus** sur la main gagnée.
- **HOLO** — **+1 au multiplicateur**.
- **POLY (polychrome)** — **× multiplicateur**, mais soumis au **rendement décroissant** et au **plafond de zone** (§15) : empiler les POLY ne fait pas exploser le score à l'infini.

Tarots et atouts permettent d'en **fabriquer** ponctuellement — un outil de build, pas une faille.

---

## 15. Multiplicateurs : excitants mais plafonnés

Les combos restent **jouissifs** (Blackjack, 21 parfait, Charlie 5 cartes, paire de 7, Insistance, Pression, éditions), **mais ne peuvent plus s'emballer** :

- **Plafond de multiplicateur par zone** : Zone 1 ≈ **×4**, Zone 2 ≈ **×6**, Zone 3 ≈ **×9**. Au-delà, le multiplicateur est **écrêté**.
- **Rendement décroissant** : à partir d'un certain cumul, chaque bonus supplémentaire compte **à moitié** — récompense les beaux coups, punit l'abus.
- Couplé à la **mise max fixe**, le gain d'une main reste **borné et lisible** : on sait toujours combien une table peut, au mieux, rapporter.

Résultat : la tension monte, le score grimpe fort sur un beau coup… sans jamais transformer une seule main en fin de partie.

---

## 16. Réputation et progression permanente (LA PLANQUE)

La **réputation ★** est la seule chose qui **traverse les nuits**.

Elle récompense **la profondeur, les étoiles et le risque maîtrisé** :
- gain de base par **table franchie**, **bonifié par les étoiles** (✦ < ✦✦ < ✦✦✦) ;
- **primes de zone** et **primes de boss** ;
- bonus de **prise de risque maîtrisée** (avoir gardé une table sous contrôle malgré une grosse pression) ;
- à la fin : **encaisser** sécurise la réputation de la nuit, **mourir** n'en rend qu'une partie (+ une petite prime d'effort, pour qu'une descente ratée serve quand même).

Elle **n'est jamais proportionnelle** à un tas de jetons : on ne « farme » pas la réputation en thésaurisant.

À la Planque, tu dépenses la réputation en **déblocages permanents** : capital de départ, petit revenu par main, secondes chances, emplacements de tarot, relique offerte au départ — et l'ouverture du **Mode Infini** après une première victoire. Des choix de **build long terme**, pas de la puissance brute.

---

## 17. Direction artistique

- **Flat pixel** sombre et nerveux : aplats de couleur, contours octogonaux « cassés » au pixel, liseré noir continu, ombre portée qui épouse le contour, rendu `pixelated`.
- **Ambiance tripot clandestin** : arrière-salles, néons, feutre usé ; le **tapis change de couleur par zone** (on s'enfonce dans le casino).
- **Pression incarnée** : braises, vibrations et battements quand la table chauffe.
- **Lettres allumées** : titres et boutons qui tremblent légèrement, vie permanente à l'écran.
- **Cartes** à coins arrondis pixel, **éditions** scintillantes, **dos** personnalisables.
- Police rétro, palette tripot (teal, or, rouge, prune), **100 % pensé pour le mobile**, au pouce.

---

## 18. Phrase finale de vente

> **TABLE 21** — descends de salle en salle dans un casino clandestin où la chance se **mérite** : tiens la table jusqu'au bout, garde ta mise sous contrôle, fais monter la pression sans te brûler, décroche tes étoiles, et choisis à chaque palier — **encaisser ta réputation ou replonger plus profond.** Ici, on ne casse pas la banque d'un seul coup. On la **dompte**.

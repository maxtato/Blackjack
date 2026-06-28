# TABLE 21 — Pitch détaillé

> Un **blackjack roguelite** clandestin, en pixel-art, jouable au doigt sur téléphone.
> Tu enchaînes des tables de plus en plus dures dans des tripots de plus en plus
> louches, tu fais grossir ta pile de jetons jusqu'à l'objectif, et tu repars avec
> de la **réputation** que tu dépenses en améliorations permanentes. Une partie =
> une « descente » ; la mort est permanente, mais la réputation, elle, reste.

---

## 1. La boucle de jeu

1. **LA PLANQUE** (hub méta) : tu dépenses ta **réputation ★** en avantages permanents, tu choisis ton dos de carte, puis tu lances **COMMENCER LA NUIT**.
2. **La descente** : une suite infinie de tables. Sur chaque table tu as **5 mains (TOURS)** pour amener ta banque de **jetons $** au-dessus de l'**OBJECTIF**.
3. **Table franchie** → tu gagnes de la réputation (cagnotte), puis une **boutique** : acheter des atouts/tarots, **continuer** (table suivante, plus dure, plus payante) ou **ENCAISSER** (sécuriser ta réputation et finir la nuit).
4. **Table ratée** (objectif manqué en 5 mains, ou à sec) → **seconde chance** si tu as un jeton d'essai, sinon **fin de descente** : tu récupères la moitié de la cagnotte.
5. Retour à **LA PLANQUE** avec la réputation gagnée → tu réinvestis → tu replonges.

### Les deux monnaies
| Monnaie | Rôle | Portée |
|---|---|---|
| **Jetons $** | Mise et score d'une table (atteindre l'objectif) | Une seule descente |
| **Réputation ★** | Achète les déblocages permanents à la Planque | Permanente (méta) |

La **cagnotte** (★) se remplit à chaque table franchie. En fin de nuit : **tout** si tu encaisses, **la moitié** si tu meurs — plus une petite **prime d'effort** (profondeur × 2) pour qu'une descente ratée rapporte toujours un peu.

---

## 2. Le blackjack, version maison

- **Sabot** : 4 jeux de 52 cartes mélangés (208 cartes), reconstitué automatiquement.
- **Valeurs** : standard — As = 11 ou 1, figures (V/D/R) = 10, le reste à sa valeur.
- **But d'une main** : battre le croupier sans dépasser 21.
- **Le croupier** tire jusqu'à **17** (jusqu'à **18** sur les tables « gros bras »). Subtilité : si la **pression** a atteint 25 % dans la main, il tire aussi sur un **17 souple**.

### Tes actions
| Action | Quand | Effet |
|---|---|---|
| **TIRER** | Main < 21 | +1 carte (**+14 % de pression**) |
| **RESTER** | Toujours | Tu gardes ta main, le croupier joue |
| **RISQUER** | Main de 17 à 20 | Tu tires quand même → bonus **Insistance ×1,5** si tu survis |
| **FORCER LA CHANCE** | En jeu | Pioche 2 cartes, garde la meilleure (**+34 % de pression**, Insistance) |

---

## 3. La PRESSION — le sel du jeu

Une jauge **0 → 100 %** qui monte à chaque tirage (**+14 %**, +34 % pour FORCER).
Plus tu pousses ta chance, plus la table chauffe.

| Palier | État | Effet |
|---|---|---|
| 0 % | **FROID** | — |
| ≥ 25 % | **TIÈDE** | le croupier devient plus agressif (tire le 17 souple) |
| ≥ 50 % | **CHAUD** | déclenche certains atouts (Brûleur) |
| ≥ 75 % | **BOUILLANT** | **multiplicateur ×1,5** sur la main gagnée |
| 100 % | **SURCHAUFFE** | **TIRAGE FORCÉ** : tu prends une carte de force |

Risque vs récompense : la pression te rapproche d'un gros multiplicateur… et d'un bust forcé. Elle retombe à 0 à la fin de chaque main.

---

## 4. Les multiplicateurs (au moment de gagner)

Le gain = `arrondi((mise + bonus FOIL) × multiplicateur)`. Les bonus se **cumulent** :

| Combo | Effet |
|---|---|
| **BLACKJACK** (21 en 2 cartes) | ×1,5 |
| **21 PARFAIT** (21 en 3 cartes ou +) | ×3 |
| **CHARLIE** (5 cartes sans buster) | ×2 |
| **PAIRE DE 7** | ×1,5 |
| **INSISTANCE** (RISQUER / FORCER) | ×1,5 |
| **PRESSION ≥ 75 %** | ×1,5 |
| Atout **Brûleur** (pression ≥ 50 %) | ×1,5 |
| Carte **FOIL** | +3 jetons par carte foil |
| Carte **HOLO** | +1 au multiplicateur par carte |
| Carte **POLY** (polychrome) | ×1,5 par carte (cumulatif) |
| Atout **As truqué** (As en main) | +1 |
| Atout **Sang-froid** (pression ≥ 75 %) | +1 |

---

## 5. Les éditions de cartes ✦

Certaines cartes du sabot sortent « brillantes » (≈ 5 % de base, **×3** avec l'atout Collectionneur). Trois éditions, repérables à l'animation sur la carte :

- **FOIL** (bleu) — donne des **jetons bonus** (+3 chacune).
- **HOLO** (violet) — **+1 au multiplicateur** chacune.
- **POLY / Polychrome** (arc-en-ciel) — **×1,5 au multiplicateur** chacune, cumulatif.

Plusieurs tarots et atouts permettent aussi de **transformer** tes cartes en édition à la volée.

---

## 6. Les tables & la difficulté

La descente est **infinie**, générée à la volée selon la profondeur.

- **Objectif fortement exponentiel** : ≈ ×1,8 de jetons par table, et le facteur **grimpe encore à chaque série de 10 tables** → ça devient vite vertigineux.
- **5 mains** par table pour y arriver.
- **Séries** : tous les 10 paliers, la couleur du **tapis** change (repère visuel de progression).

### Tables normales (noms qui défilent, puis chiffres romains)
*Arrière-salle · Table nerveuse · Croupier muet · Cave humide · Salon rouge · Cercle privé · Fosse aux as · Table maudite…*

Règles spéciales qui apparaissent au fil de la descente :
- **Nerveuse** — la pression monte **2× plus vite**.
- **Croupier muet** — le croupier garde ses **deux cartes cachées**.

### Tables du PATRON (toutes les 10 tables : 10, 20, 30…)
Objectif **×1,25**, plus dures, mais grosse récompense (+40 ★). Boss qui tournent :
*Le Patron · La Maison · Le Banquier · La Faucheuse…*

| Règle de Patron | Effet |
|---|---|
| **Gros bras** | le croupier tire jusqu'à **18** |
| **Départ chaud** | la table démarre déjà à **+30 % de pression** |
| **À sec** | les **égalités comptent comme des défaites** |

---

## 7. Les ATOUTS (reliques) — 13 au total

Objets permanents pour la durée d'une descente, achetés en boutique (ou offerts via le déblocage *Contact*).

| Atout | Effet |
|---|---|
| **Lunettes** | 1×/main : regarde la prochaine carte du sabot |
| **Jeton fendu** | Perdre avec un 20 → tu récupères la moitié de la mise |
| **Cigarette** | La pression monte **30 % moins vite** (permanent) |
| **As truqué** | Gagner une main avec un As → **mult +1** |
| **Sang-froid** | Gagner à pression ≥ 75 % → **mult +1** |
| **Compteur** | Affiche ta **probabilité de buster** au prochain tirage |
| **Mécène** | **+4 jetons** au début de chaque main |
| **Usurier** | Début de main : +1 jeton par tranche de 5 en banque (max +6) |
| **Collectionneur** | Les **éditions** de cartes sortent **3× plus souvent** |
| **Carte maîtresse** | Ta **1ʳᵉ carte** de chaque main est **FOIL** |
| **Brûleur** | Gagner à pression ≥ 50 % → **mult ×1,5** |
| **Porte-bonheur** | **+1 emplacement** de carte Tarot |
| **Diplomate** | Les **égalités** te paient la moitié de la mise |

---

## 8. Les TAROTS (consommables) — 9 au total

Cartes à usage unique, rangées dans tes emplacements (limités, extensibles via *Poche* / *Porte-bonheur*).

| Tarot | Effet |
|---|---|
| **L'Étoile** ❄️ | Refroidit la table : **pression −45 %** |
| **Le Jugement** ⚖️ | **Annule toute la pression** (→ 0 %) |
| **Le Soleil** ☀️ | **+18 jetons** immédiats |
| **Le Diable** 😈 | Rend une carte **POLYCHROME** (×1,5 mult) |
| **La Lune** 🌙 | Rend une carte **HOLO** (+1 mult) |
| **L'Étoile filante** ✨ | Rend une carte **FOIL** (jetons bonus) |
| **Le Pendu** 🪢 | **Retire** ta dernière carte tirée |
| **Le Magicien** 🎩 | Ta **prochaine carte** sera idéale |
| **La Roue** 🎡 | 50 % : édition aléatoire sur une carte, sinon rien |

---

## 9. Les déblocages permanents (LA PLANQUE) — 5

Achetés avec la **réputation ★**, conservés d'une nuit à l'autre.

| Déblocage | Niv. max | Effet |
|---|---|---|
| **Pécule** | 5 | Jetons de départ **+15** par niveau |
| **Pourboire** | 3 | **+1 jeton** (par niveau) au début de chaque main |
| **Filet** | 3 | Plus de **secondes chances** au départ |
| **Poche** | 1 | **+1 emplacement** Tarot permanent |
| **Contact** | 1 | Commence chaque descente avec une **relique offerte** |

Valeurs de départ d'une descente : **Banque** = 50 + 15×(niveau Pécule) · **Jetons d'essai** = 1 + niveau Filet.

---

## 10. Cosmétique — 8 dos de cartes

Huit dos déblocables/sélectionnables à la Planque (rouge classique, croisillon bleu, art-déco noir & or, prune, émeraude, médaillon losange, soleil art-déco, marine étoilé). Purement esthétiques — ton style à la table.

---

## 11. Direction artistique

- **Flat pixel** : aplats de couleur, contours octogonaux « cassés » au pixel, zéro dégradé criard, rendu `pixelated`.
- **Cartes & dés** à coins arrondis pixel, liseré noir continu et ombre portée qui épouse le contour.
- **Lettres allumées** : chaque lettre des titres et boutons tremble très légèrement (vie à l'écran).
- **Tapis** qui change de couleur par série, **pression** matérialisée par des braises et un battement quand ça chauffe.
- Police rétro *Jersey 15*, palette tripot (teal, or, rouge, prune), 100 % responsive téléphone.

---

## 12. En une phrase

> **TABLE 21** : pousse ta chance au blackjack jusqu'à la surchauffe, empile les
> multiplicateurs et les cartes brillantes, franchis les tables du Patron, et
> décide à chaque palier — **encaisser ou replonger** — pour transformer ta
> réputation en pouvoir permanent.

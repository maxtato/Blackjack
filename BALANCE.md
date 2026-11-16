# Circuit — cartes de table (16 novembre 2026)

Le circuit garde ses 24 tables, ses 8 zones et un boss toutes les 3 tables. Les améliorations permanentes, la boutique, la revente et les services sont retirés du circuit. Le mode Libre n’est pas modifié.

## Cartes

Avant chaque table, trois cartes du paquet sont proposées. Une est offerte. Une deuxième peut être achetée pour 60 % de la mise maximale de la table. Son prix est retiré après le calcul de l’objectif : elle doit donc se rembourser. Les cartes quittent le joueur à la fin de la table ; une reprise rend les mêmes cartes sans rembourser la deuxième.

Le paquet compte douze cartes. Six sont disponibles dès le départ : Lunettes, Compteur, Jeton fendu, Cigarette, L’Étoile, Le Pendu. Six se débloquent avec la réputation : Diplomate (40), As truqué (60), Le Magicien (80), Talisman (100), Le Diable (120), Le Phare (150). Les cartes à jouer (Étoile, Pendu, Magicien, Diable) s’utilisent deux fois par table. Le tirage favorise les cartes utiles à la règle ou au boss de la table.

La réputation dépensée dans les anciennes améliorations est rendue au premier chargement.

## Objectifs

Les objectifs sont réglés par `tests/calib-search.mjs`, pour un joueur en stratégie de base, mise maximale, une seule carte, paquet complet. Le bénéfice demandé ne descend pas sous 1,4 mise maximale, pour qu’une table ne se gagne pas en une main.

Mesure du 16 novembre, 400 tentatives par table, sans reprise (`tests/calibrate.mjs`) :

| Tables | Paquet complet | Paquet de départ | Avec deuxième carte |
| --- | ---: | ---: | ---: |
| 1 à 3 | 78 / 81 / 77 % | 77 / 76 / 68 % | 76 / 75 / 75 % |
| 10 à 12 | 80 / 73 / 58 % | 76 / 71 / 61 % | 78 / 75 / 61 % |
| 22 à 24 | 56 / 58 / 45 % | 49 / 58 / 47 % | 57 / 59 / 54 % |

Expéditions complètes depuis la table 1, trois vies (`tests/expedition.mjs`, 200 expéditions) : table médiane atteinte 12 avec le paquet de départ, 13 avec le paquet complet ; 0 et 3 circuits terminés d’une traite. Avec reprise à la table atteinte et déblocage des cartes (60 campagnes) : 4 expéditions et 224 mains en médiane, 7 expéditions et 349 mains au maximum.

Ces automates ne sont ni un jeu optimal ni des essais humains. Ils misent toujours le maximum et n’utilisent pas les pouvoirs du Compteur et du Phare.

## Reste à faire

Le code de la boutique est encore présent mais inaccessible. La troisième étoile (« deux mains d’avance ») est obtenue dans environ 90 % des victoires et ne distingue rien.

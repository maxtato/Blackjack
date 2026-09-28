# Circuit — rééquilibrage du 27 septembre 2026

Le circuit conserve ses 24 tables. L’entrée est plus accessible, chaque zone a des paramètres définis, et les huit boss demandent des victoires et un défi spécifique. Une réserve supérieure au capital conseillé augmente l’objectif de la même somme : les jetons accumulés sécurisent les mises sans supprimer le bénéfice à produire à la table suivante.

## Économie et décisions

Une relique est choisie parmi trois au départ. Contact donne un deuxième choix. Chaque nouvelle zone offre un tarot ; si les emplacements sont pleins, il attend qu’une place se libère. Les tarifs utilisent la mise maximale de la prochaine table. Les reliques sont moins chères en fin de circuit, quand il reste moins de temps pour les exploiter. Les tarots coûtent généralement 0,25–0,65 mise maximale ; Magicien en coûte une.

FOIL ajoute 15 % de la mise avant multiplication. Les revenus de Mécène, Usurier, Aimant et Pourboire suivent les mises. Mécène aide une réserve faible ; Usurier rémunère l’épargne. Soleil échange deux points de Baraka contre des jetons. Porte-bonheur offre un emplacement et une réduction. La boutique permet de vendre sur place et affiche la réserve après achat et droit d’entrée. Elle préserve de quoi payer l’entrée et une mise minimale.

Le risque de dépassement est une aide de base. Compteur permet une défausse suivie d’une révélation. Phare prépare un petit rang et récompense les mains de quatre et cinq cartes. Pendu s’arme avant le risque et annule le prochain dépassement. Les éditions ciblent les cartes vierges ; la Roue garantit une édition. Magicien examine le sabot restant et ne promet une carte sûre que s’il en existe une.

Les seuils de Baraka sont 2, 4, 7 et 10 points. Les multiplicateurs sont 1,15 / 1,3 / 1,45 / 1,6. Une perte en circuit conserve la moitié des points, ou 75 % avec Sang-froid. Jusqu’à deux points passent à la table suivante. Les tarots donnent leur quantité exacte, sans amplification cachée. Le multiplicateur a un plafond explicite ; la réduction cachée au-delà de ×3 est retirée. Cour, Remontada, Au poil et Dernier souffle ne multiplient plus les gains automatiquement.

Deux contrats sont proposés par table, avec des récompenses liées à leur difficulté. Les étoiles récompensent l’objectif, l’absence de reprise et le contrat. Le record distingue la table atteinte des tables remportées. Les vies gagnées ou achetées s’utilisent sans publicité ; une vidéo peut donner une reprise supplémentaire facultative par expédition.

## Corrections

Depuis le 28 septembre, une égalité à 21 ou moins rembourse toute la mise sur les 24 tables et en jeu libre, y compris après Doubler et pour chaque main séparée. Elle ne réduit pas la Baraka et ne consomme ni Assurance ni Talisman. L’ancienne exception des tables 9, 15 et 24 est supprimée ; leurs défis de victoires restent en place. Diplomate ajoute toujours 25 % à la mise rendue. L’annonce est « ÉGALITÉ · mise rendue ». Un dépassement de 21 reste une défaite, même si le croupier a le même total.

Assurance persiste entre les tables. Talisman protège aussi une main séparée. Le calcul de risque réévalue les As souples. FORCER applique sa limite d’un usage par table. Les tarots ne peuvent plus modifier une résolution déjà engagée. La pause et l’inspection suspendent réellement les délais du moteur. Les mises engagées ne sont plus recalculées pendant la main. Tout apport de banque entre les mains vérifie l’objectif. La revente des objets offerts ne s’apprécie plus avec la profondeur. Les services sans bénéfice sont écartés. Le raccourci de zone 2 obsolète est retiré.

## Animations

L’arrivée des cartes utilise un zoom, un contact bref avec le tapis et des particules de poussière dans la palette papier du jeu, puis le retournement. Le contour de révélation est supprimé. Toutes les issues de main s’annoncent au centre : victoire (1,90 à 2,15 secondes), défaite ou dépassement de 21 (1,90 seconde), égalité (1,75 seconde). La victoire comporte un double rebond des cartes et une seconde salve d’éclairs ; la défaite, un choc et des éclats corail ; l’égalité, un balancement. Les délais du tour suivant restent inchangés. Au repos, les cartes oscillent sur 2,8 à 3,9 secondes, avec une amplitude réduite de moitié, et les grandes lettres reprennent le petit tressautement indépendant du menu, sans vague. Les cases, les petits textes et l’inventaire restent fixes. Les effets conservent leur générateur aléatoire distinct de celui du jeu et respectent les animations réduites.

La palette D validée utilise un rose poudré très clair pour les reliques et un vert amande très clair pour les tarots, avec le grain du papier. Les services/améliorations utilisent un vert grisé et les cartes de jeu leur ivoire. Le même traitement apparaît dans l’inventaire, les achats et les détails.

## Vérification

Vingt contrôles reproductibles couvrent notamment les égalités sur toutes les tables, les mises doublées, les mains séparées, Diplomate, les As souples, Assurance, Talisman, FORCER, Pendu, la pause, les mises engagées, Soleil, les éditions, la boutique, les records et le boss final. Les commandes sont dans `tests/README.md`.

La passe d’équilibrage du 27 septembre utilise 600 expéditions pour chacune de cinq politiques, 600 essais par table dans deux équipements fixes, et 200 campagnes avec réputation et reprises : **78 281 tentatives de table et 500 447 mains**. Les résultats ci-dessous précèdent la suppression de l’exception sur les égalités ; ils restent un historique de cet audit, et non une mesure de la version corrigée.

| Politique depuis la table 1 | Table médiane atteinte | Circuit terminé dans l’expédition |
| --- | ---: | ---: |
| Débutant, mise conseillée, tire jusqu’à 17 | 4 | 0 % |
| Stratégie de base, mises maximales, sans achat | 7 | 0 % |
| Stratégie de base, mises moyennes, sans achat | 4 | 0 % |
| Stratégie de base, achats ciblés | 17 | 9,2 % |
| Améliorations maximales, achats ciblés | 24 | 41,7 % |

Le profil débutant réussit 62,8 % des tentatives de première table et la franchit dans 97,8 % des expéditions, reprises comprises. Il choisit ici les Lunettes sans utiliser leur pouvoir ni le tarot offert : les résultats dépendent fortement des décisions modélisées. L’ancien audit mesurait 9,4 % par tentative et 32,4 % avec reprises pour sa politique débutante.

Les 200 campagnes de la nouvelle simulation finissent le circuit, avec une médiane de 2 expéditions et 192 mains ; le maximum observé est de 6 expéditions et 368 mains. Les achats ciblés et la reprise à la dernière table atteinte expliquent cette durée. Dans la grille sans tarot offert, la réussite de la Faucheuse est de 42,5 % sans relique et 78,5 % avec l’équipement de référence ; le Parrain atteint 18 % et 49,8 %.

Les automates utilisent les fonctions réelles, des graines fixes et les informations visibles, avec consultation légale de la prochaine carte après les Lunettes. Rendu, audio, publicités et temps visuels sont neutralisés. Ils ne représentent ni une stratégie optimale ni des essais humains. Leurs achats n’exploitent ni les reventes, ni les publicités, ni tous les pouvoirs actifs. Les prochaines observations utiles sont les objets réellement choisis, l’usage des tarots et la compréhension des sceaux de boss.

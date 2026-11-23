# Recette — Atlas Terrain (version 1.3)

> Corrigé de l'enseignant. Recette automatisée exécutée le 23 novembre 2026 sur un téléphone Android simulé (Chrome, écran Pixel 7), application servie dans un sous-dossier comme sur GitHub Pages.

**Résultat : 39 tests réussis sur 39.**

## Cas de test du devis (cahier des charges)

| Cas | Données | Attendu (HT / TVA / TTC) | Obtenu |
| --- | --- | --- | --- |
| A | 10 × 45,00 MAD, remise 5 % | 427,50 / 85,50 / 513,00 | Conforme |
| B | 3 × 120,00 + 2 × 35,00 MAD, sans remise | 430,00 / 86,00 / 516,00 | Conforme |
| C | 1 × 999,99 MAD, remise 10 % | 899,99 / 180,00 / 1 079,99 | Conforme |
| D | Remise 120 % | Refus, message, pas de total | Conforme |

## Détail des 39 contrôles

| N° | Contrôle | Résultat |
| --- | --- | --- |
| 1 | Catalogue : 12 produits | Réussi |
| 2 | Recherche « stylo » : 1 produit | Réussi |
| 3 | Calcul A : 427,50 / 85,50 / 513,00 | Réussi |
| 4 | Calcul B : 430,00 / 86,00 / 516,00 | Réussi |
| 5 | Calcul C : 899,99 / 180,00 / 1 079,99 | Réussi |
| 6 | Numéro de devis au format DV-AAAA-NNNN | Réussi |
| 7 | Écran cas A : TTC 513,00 MAD | Réussi |
| 8 | WhatsApp : lien prérempli avec le total | Réussi |
| 9 | Cas D : remise 120 % refusée avec message | Réussi |
| 10 | Cas D : partage désactivé | Réussi |
| 11 | Remise 25 % refusée (plafond 20 %) | Réussi |
| 12 | Remise négative refusée | Réussi |
| 13 | Remise décimale 2,5 % acceptée | Réussi |
| 14 | Quantité « 0 » refusée | Réussi |
| 15 | Quantité « -1 » refusée | Réussi |
| 16 | Quantité « 2.5 » refusée | Réussi |
| 17 | Quantité « abc » refusée | Réussi |
| 18 | Quantité «  » refusée | Réussi |
| 19 | Nouveau devis : numéro incrémenté | Réussi |
| 20 | Écran cas B : TTC 516,00 MAD | Réussi |
| 21 | Écran cas C : TTC 1 079,99 MAD | Réussi |
| 22 | Ajout depuis le catalogue : quantité +1 | Réussi |
| 23 | Visite vide refusée | Réussi |
| 24 | 2 visites enregistrées | Réussi |
| 25 | Visites triées, la plus récente en premier | Réussi |
| 26 | CSV : BOM, en-tête, point-virgule, accents | Réussi |
| 27 | CSV : guillemets du texte doublés, 1 ligne par visite | Réussi |
| 28 | Export CSV téléchargé | Réussi |
| 29 | Visites conservées après réouverture | Réussi |
| 30 | Devis conservé après réouverture | Réussi |
| 31 | Suppression : demande de confirmation | Réussi |
| 32 | Suppression confirmée | Réussi |
| 33 | Manifeste : standalone, start_url et scope relatifs | Réussi |
| 34 | Manifeste : icônes 192 et 512 accessibles | Réussi |
| 35 | Service worker actif et contrôlant la page | Réussi |
| 36 | Mode avion : catalogue affiché | Réussi |
| 37 | Mode avion : badge « Hors ligne » | Réussi |
| 38 | Mode avion : devis calculé (cas A) | Réussi |
| 39 | Aucune erreur JavaScript | Réussi |

## Contrôles à refaire à la main sur de vrais téléphones

Ces points dépendent du téléphone et ne se simulent pas fidèlement :

- [ ] Android : installation depuis Chrome, icône sur l'écran d'accueil, ouverture en plein écran.
- [ ] iPhone : installation depuis Safari (Partager › Sur l'écran d'accueil), icône correcte.
- [ ] Mode avion réel : fermer l'appli, activer le mode avion, rouvrir, calculer le cas A.
- [ ] WhatsApp : le message s'ouvre prérempli dans l'application.
- [ ] Export CSV : le fichier s'ouvre dans Excel avec trois colonnes et des accents corrects.

# Cahier des charges — Atlas Terrain

> Corrigé de l'enseignant · TP « Mission Atlas Terrain » · Master 2 Gestion
> Projet pédagogique : toutes les données sont fictives.

## Utilisateur cible

Karim, commercial terrain d'Atlas Distribution (PME de négoce, 120 salariés). Il visite 6 clients par jour à Casablanca avec un téléphone Android (Chrome) ; certains collègues ont un iPhone (Safari). Le réseau mobile est irrégulier chez une partie des clients.

## Problème à résoudre

Karim consulte un catalogue papier, calcule ses devis le soir et oublie parfois le contenu de ses visites. Il perd du temps et donne des réponses tardives aux clients.

## Fonctions (classées MoSCoW)

| Priorité | Fonction | Justification |
| --- | --- | --- |
| MUST | Consulter le catalogue (nom, référence, prix HT, visuel) | Cœur du besoin : répondre sans papier |
| MUST | Composer un devis (produits, quantités, remise) et afficher HT, TVA, TTC | Le client attend un prix sur place |
| MUST | Fonctionner sans réseau après une première ouverture | Le réseau est irrégulier |
| SHOULD | Noter et relire les comptes rendus de visite | Évite les oublis ; l'appli rend déjà service sans |
| COULD | Envoyer le devis par WhatsApp | Confort ; réalisé en itération |
| WON'T | Vue du directeur sur les visites de toute l'équipe | Exige un serveur, des comptes, une base partagée et une mise en conformité (loi 09-08) |

## Critères d'acceptation

**Catalogue**
- Les 12 produits s'affichent, chacun avec nom, référence et prix HT en MAD.
- Taper « stylo » dans la recherche n'affiche que les produits dont le nom ou la référence contient « stylo ».

**Devis**
- Cas A : 10 × 45,00 MAD HT, remise 5 % → 427,50 HT ; 85,50 TVA ; 513,00 TTC.
- Cas B : 3 × 120,00 + 2 × 35,00 MAD, remise 0 % → 430,00 HT ; 86,00 TVA ; 516,00 TTC.
- Cas C : 1 × 999,99 MAD, remise 10 % → 899,99 HT ; 180,00 TVA ; 1 079,99 TTC.
- Cas D : une remise de 120 % est refusée avec un message ; le total n'est jamais négatif.
- Une quantité nulle, négative ou non entière est refusée.

**Hors ligne**
- En mode avion, après une première ouverture, les 3 onglets s'ouvrent et un devis se calcule.

**Visites**
- Une visite enregistrée (client, date, compte rendu) reste affichée après fermeture et réouverture de l'appli.
- L'export produit un fichier CSV lisible par Excel (séparateur point-virgule, accents corrects).

## Règles de gestion

- **TVA** : 20 % (taux normal au Maroc), appliquée au total HT net.
- **Arrondi** : on calcule le total HT brut, on applique la remise, on arrondit le HT net au centime ; la TVA est calculée sur ce HT arrondi puis arrondie au centime ; TTC = HT net + TVA.
- **Remise** : de 0 à 20 %. Au-delà, l'appli refuse et affiche « Au-delà de 20 %, accord du responsable commercial requis ». Le plafond est fixé par la direction commerciale, pas par l'appli.
- **Numéro de devis** : DV-AAAA-NNNN, incrémenté automatiquement sur le téléphone.

## Contraintes

- Interface entièrement en français ; montants en MAD au format 1 234,56 MAD.
- HTML, CSS et JavaScript simples, sans framework ni ressource externe (fonctionnement hors ligne).
- Chemins relatifs : l'appli est publiée dans un sous-dossier de GitHub Pages.
- Données enregistrées uniquement sur le téléphone (stockage local du navigateur) ; aucun serveur.
- Aucune donnée personnelle réelle, aucun mot de passe. Le dépôt est public.

## Charte visuelle

Bleu pétrole `#0F4C5C`, bleu-gris `#5B9AA0`, accent orange `#E36414`, fond blanc. Ton sobre et professionnel. Logo texte « Atlas Terrain ».

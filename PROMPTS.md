# Prompts de référence — reconstruire Atlas Terrain

> Corrigé de l'enseignant. Ces prompts fonctionnent avec **Claude gratuit** (claude.ai) : l'étudiant dépose ensuite les fichiers sur GitHub. Avec **Claude Code**, retirer la ligne « Donne-moi le contenu complet de chaque fichier… » : l'agent crée les fichiers lui-même.
> Dans le cahier de l'étudiant, ces prompts ne sont **pas** donnés : les étudiants les construisent à partir des canevas.

## Prompt n°1 — Première version (Mission 3)

```
Tu es un développeur qui travaille pour une équipe de managers sans connaissances techniques.
Construis la première version de l'application décrite dans ce cahier des charges :

[COLLER ICI LE CAHIER DES CHARGES]

Contraintes techniques obligatoires :
- HTML, CSS et JavaScript simples, sans framework, sans étape de compilation,
  sans ressource externe (pas de CDN, pas de police en ligne).
- Fichiers à la racine : index.html, style.css, app.js.
- Tous les chemins sont relatifs (commencent par ./) car l'appli sera publiée
  dans un sous-dossier sur GitHub Pages.
- Conçue d'abord pour un téléphone : gros boutons, texte lisible, barre d'onglets en bas.
- Trois onglets : Catalogue, Devis, Visites.
- Catalogue : 12 produits fictifs de fournitures de bureau (nom, référence, prix HT en MAD, emoji).
  Inclure une ramette à 45,00, une cartouche à 120,00, une agrafeuse à 35,00
  et un destructeur à 999,99 MAD (pour nos cas de test).
- Devis : ajout de produits et de quantités, remise en %, calcul HT, TVA 20 % et TTC,
  montants au format 1 234,56 MAD. Applique exactement nos règles d'arrondi.
- Visites : formulaire (client, date, compte rendu) et liste, enregistrées dans le téléphone (localStorage).
- Aucune donnée personnelle réelle, aucun mot de passe, aucun serveur.

Commence par me présenter ton plan en 5 points.
Donne-moi ensuite le contenu complet de chaque fichier, un fichier par message.
À la fin, explique en français simple le rôle de chaque fichier en 2 lignes maximum,
et dis-moi comment vérifier que le calcul du devis est juste.
```

**Contrôle attendu** : cas A = 513,00 MAD TTC ; cas B = 516,00 ; cas C = 1 079,99.

## Prompt n°2 — Application installable et hors ligne (Mission 5)

```
Transforme cette application en PWA installable sur Android et iPhone :
- Crée un fichier manifest.webmanifest : nom "Atlas Terrain", nom court "Atlas",
  couleur de thème #0F4C5C, fond blanc, affichage "standalone", start_url et scope "./".
- Indique-moi comment créer des icônes PNG de 192x192, 512x512 et 180x180
  (initiale "A" blanche sur fond #0F4C5C).
- Crée un service worker sw.js qui met en cache tous les fichiers de l'appli pour
  qu'elle fonctionne en mode avion. Le nom du cache contient un numéro de version (v1).
- Enregistre le service worker dans app.js avec un chemin relatif.
- Ajoute dans index.html les balises utiles pour l'iPhone.
- Affiche un bouton "Installer l'appli" quand le navigateur le permet.
Garde tous les chemins relatifs. N'ajoute aucune ressource externe.
Donne-moi uniquement les fichiers nouveaux ou modifiés, en entier.
À la fin, explique en 3 phrases simples ce qu'est un service worker.
```

## Prompts n°3 à 5 — Évolutions (Mission 6), une par session

```
Contexte : application Atlas Terrain (fichiers joints ou ci-dessous).
Demande : ajoute une recherche dans le catalogue, par nom ou référence, insensible aux accents.
Critère d'acceptation : en tapant « stylo », seul le produit « Stylos bille bleus » s'affiche.
Ne modifie pas : les calculs du devis et l'onglet Visites.
Augmente le numéro de version du cache du service worker.
À la fin, résume ce que tu as changé en 3 points simples.
```

```
Contexte : application Atlas Terrain.
Demande : ajoute un bouton « Envoyer par WhatsApp » qui ouvre WhatsApp avec le devis
rédigé (numéro, lignes, remise, HT, TVA, TTC), et un numéro de devis automatique DV-AAAA-NNNN.
Critère d'acceptation : le message WhatsApp affiche 513,00 MAD TTC pour le cas A.
Ne modifie pas : les règles de calcul.
Augmente le numéro de version du cache du service worker.
À la fin, résume ce que tu as changé en 3 points simples.
```

```
Contexte : application Atlas Terrain.
Demande : ajoute un bouton « Exporter en CSV » dans l'onglet Visites, lisible par Excel
en français (séparateur point-virgule, accents corrects).
Critère d'acceptation : le fichier s'ouvre dans Excel avec 3 colonnes Date, Client, Compte rendu.
Ne modifie pas : le formulaire de visite.
Augmente le numéro de version du cache du service worker.
À la fin, résume ce que tu as changé en 3 points simples.
```

## Prompt n°6 — Correction du bug de la remise (Mission 6)

```
Bug : une remise supérieure à 100 % donne un total négatif.
Étapes pour le reproduire : 1. Onglet Devis. 2. Ajouter 10 ramettes. 3. Saisir une remise de 120.
Résultat constaté : le total TTC est négatif.
Résultat attendu : la remise est limitée de 0 à 20 % (règle fixée par la direction commerciale).
Au-delà, afficher « Au-delà de 20 %, accord du responsable commercial requis »,
ne pas afficher de total et désactiver l'envoi du devis.
Refuser aussi les quantités nulles, négatives ou non entières, avec un message clair.
Corrige ce bug et augmente la version du cache du service worker.
```

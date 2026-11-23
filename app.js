/* Atlas Terrain — logique de l'application
 * Projet pédagogique (TP « Mission Atlas Terrain », Master 2 Gestion).
 * Aucune donnée ne quitte le téléphone : tout est enregistré dans le stockage local du navigateur.
 */
'use strict';

(() => {
  // ================= Paramètres et règles de gestion =================
  const APP_VERSION = '1.3';     // à augmenter avec le cache de sw.js à chaque évolution
  const TVA_TAUX = 20;           // % — taux normal de TVA au Maroc
  const REMISE_MAX = 20;         // % — plafond fixé par la direction commerciale

  // Catalogue fictif. Les prix sont en centimes de dirham pour éviter les erreurs d'arrondi.
  const PRODUITS = [
    { ref: 'PAP-A4-80', nom: 'Ramette papier A4 80 g (500 feuilles)', prix: 4500, emoji: '📄' },
    { ref: 'STY-BB-50', nom: 'Stylos bille bleus (boîte de 50)', prix: 8900, emoji: '🖊️' },
    { ref: 'SUR-LOT-4', nom: 'Surligneurs assortis (lot de 4)', prix: 2450, emoji: '🖍️' },
    { ref: 'CAH-96-GC', nom: 'Cahier 96 pages grands carreaux', prix: 890, emoji: '📒' },
    { ref: 'CLA-LEV-80', nom: 'Classeur à levier dos 80 mm', prix: 1990, emoji: '📁' },
    { ref: 'TRO-28-100', nom: 'Trombones 28 mm (boîte de 100)', prix: 650, emoji: '📎' },
    { ref: 'AGR-BUR-01', nom: 'Agrafeuse de bureau', prix: 3500, emoji: '🖇️' },
    { ref: 'CHE-CAR-50', nom: 'Chemises cartonnées (paquet de 50)', prix: 5400, emoji: '🗂️' },
    { ref: 'CAR-NOI-XL', nom: "Cartouche d'encre noire XL", prix: 12000, emoji: '🖨️' },
    { ref: 'ETI-A4-100', nom: 'Étiquettes adhésives A4 (100 feuilles)', prix: 7500, emoji: '🏷️' },
    { ref: 'CAL-BUR-12', nom: 'Calculatrice de bureau 12 chiffres', prix: 14900, emoji: '🧮' },
    { ref: 'DES-CC-01', nom: 'Destructeur de documents coupe croisée', prix: 99999, emoji: '🗑️' },
  ];
  const PAR_REF = Object.fromEntries(PRODUITS.map((p) => [p.ref, p]));

  const CLES = {
    devis: 'atlas.devis',
    visites: 'atlas.visites',
    seq: 'atlas.devisSeq',
    iosTip: 'atlas.iosTipVu',
  };

  // ================= Stockage local (protégé contre les erreurs) =================
  function charger(cle, defaut) {
    try {
      const v = localStorage.getItem(cle);
      return v === null ? defaut : JSON.parse(v);
    } catch (e) {
      return defaut;
    }
  }
  function enregistrer(cle, valeur) {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
      return true;
    } catch (e) {
      afficherToast("Enregistrement impossible sur ce téléphone");
      return false;
    }
  }

  // ================= Montants =================
  const nf = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const mad = (centimes) => nf.format(centimes / 100) + ' MAD';
  const madTexte = (centimes) => mad(centimes).replace(/[  ]/g, ' ');
  const pct = (v) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(v);

  // ================= Calculs (règles du cahier des charges) =================
  function lireQuantite(brut) {
    const s = String(brut ?? '').trim();
    if (!/^\d+$/.test(s)) return null;
    const q = parseInt(s, 10);
    return q >= 1 && q <= 99999 ? q : null;
  }

  function lireRemise(brut) {
    const s = String(brut ?? '').trim().replace('%', '').replace(',', '.').trim();
    if (s === '') return { ok: true, valeur: 0 };
    if (!/^\d+(\.\d+)?$/.test(s)) {
      return { ok: false, message: `Remise invalide : saisissez un nombre entre 0 et ${REMISE_MAX}.` };
    }
    const v = parseFloat(s);
    if (v > REMISE_MAX) {
      return { ok: false, message: `Au-delà de ${REMISE_MAX} %, accord du responsable commercial requis.` };
    }
    return { ok: true, valeur: v };
  }

  /** lignes : [{prix (centimes), qte (entier)}] ; remise en %.
   *  Règle d'arrondi : HT net arrondi au centime, TVA calculée sur ce HT puis arrondie. */
  function calculer(lignes, remise) {
    const brut = lignes.reduce((s, l) => s + l.prix * l.qte, 0);
    const ht = Math.round((brut * (100 - remise)) / 100);
    const tva = Math.round((ht * TVA_TAUX) / 100);
    return { brut, remise: brut - ht, ht, tva, ttc: ht + tva };
  }

  // Accès pour la recette automatisée (sans effet sur l'utilisateur)
  window.AtlasCalc = { calculer, lireRemise, lireQuantite, REMISE_MAX, TVA_TAUX };

  // ================= Outils d'interface =================
  const $ = (sel) => document.querySelector(sel);
  function el(tag, attrs = {}, enfants = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.includes('-')) n.setAttribute(k, v);
      else n[k] = v;
    }
    for (const e of [].concat(enfants)) if (e) n.append(e);
    return n;
  }
  const sansAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  let minuterieToast;
  function afficherToast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /** Bouton à double appui : le premier appui demande confirmation, le second agit. */
  function doubleAppui(bouton, libelleConfirmation, action) {
    if (bouton.dataset.confirm === '1') {
      action();
      return;
    }
    const libelle = bouton.textContent;
    bouton.dataset.confirm = '1';
    bouton.textContent = libelleConfirmation;
    setTimeout(() => {
      if (bouton.isConnected) {
        bouton.dataset.confirm = '';
        bouton.textContent = libelle;
      }
    }, 4000);
  }

  function aujourdhui() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function dateLisible(iso) {
    const [a, m, j] = iso.split('-').map(Number);
    return new Date(a, m - 1, j).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ================= Onglets =================
  const ONGLETS = ['catalogue', 'devis', 'visites'];
  function afficherOnglet(nom) {
    if (!ONGLETS.includes(nom)) nom = 'catalogue';
    for (const o of ONGLETS) {
      $(`#tab-${o}`).hidden = o !== nom;
      $(`#nav-${o}`).setAttribute('aria-selected', String(o === nom));
    }
    history.replaceState(null, '', `#${nom}`);
    window.scrollTo(0, 0);
  }
  $('.tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) afficherOnglet(b.dataset.tab);
  });

  // ================= Catalogue =================
  function afficherCatalogue() {
    const q = sansAccents($('#search').value.trim());
    const liste = PRODUITS.filter((p) => !q || sansAccents(`${p.nom} ${p.ref}`).includes(q));
    const ul = $('#catalogue-list');
    ul.replaceChildren(...liste.map((p) => el('li', { class: 'card' }, [
      el('span', { class: 'card-emoji', 'aria-hidden': 'true', text: p.emoji }),
      el('div', { class: 'card-body' }, [
        el('p', { class: 'card-name', text: p.nom }),
        el('p', { class: 'card-ref', text: `Réf. ${p.ref}` }),
        el('p', { class: 'card-price' }, [mad(p.prix), ' ', el('small', { text: 'HT' })]),
      ]),
      el('button', {
        class: 'btn btn-small', type: 'button', 'data-add': p.ref,
        text: '+ Devis', 'aria-label': `Ajouter ${p.nom} au devis`,
      }),
    ])));
    const n = liste.length;
    $('#catalogue-count').textContent = n === 0
      ? 'Aucun produit ne correspond à votre recherche.'
      : `${n} produit${n > 1 ? 's' : ''}`;
  }
  $('#search').addEventListener('input', afficherCatalogue);
  $('#catalogue-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    ajouterAuDevis(b.dataset.add);
    afficherToast(`${PAR_REF[b.dataset.add].nom} : ajouté au devis`);
  });

  // ================= Devis =================
  function nouveauNumero() {
    const seq = (charger(CLES.seq, 0) || 0) + 1;
    enregistrer(CLES.seq, seq);
    return `DV-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
  }
  function devisVide() {
    return { numero: nouveauNumero(), client: '', remise: '', lignes: [] };
  }

  let devis = charger(CLES.devis, null);
  if (!devis || !Array.isArray(devis.lignes)) devis = devisVide();
  devis.lignes = devis.lignes.filter((l) => PAR_REF[l.ref]);
  const sauverDevis = () => enregistrer(CLES.devis, devis);
  sauverDevis();

  function ajouterAuDevis(ref) {
    const ligne = devis.lignes.find((l) => l.ref === ref);
    if (ligne) {
      const q = lireQuantite(ligne.qte);
      ligne.qte = String(q ? q + 1 : 1);
    } else {
      devis.lignes.push({ ref, qte: '1' });
    }
    sauverDevis();
    afficherDevis();
  }

  function remplirListeProduits() {
    $('#add-product').replaceChildren(...PRODUITS.map((p) =>
      el('option', { value: p.ref, text: `${p.nom} — ${madTexte(p.prix)}` })));
  }

  function afficherDevis() {
    $('#devis-number').textContent = devis.numero;
    $('#devis-client').value = devis.client;
    $('#devis-remise').value = devis.remise;
    const ul = $('#devis-lines');
    ul.replaceChildren(...devis.lignes.map((l) => {
      const p = PAR_REF[l.ref];
      return el('li', { class: 'line', 'data-ref': l.ref }, [
        el('div', {}, [
          el('p', { class: 'line-name', text: p.nom }),
          el('p', { class: 'line-unit', text: `${madTexte(p.prix)} HT / unité` }),
        ]),
        el('p', { class: 'line-total', 'data-total': l.ref }),
        el('label', { class: 'line-qty' }, [
          el('span', { class: 'muted small', text: 'Quantité' }),
          el('input', {
            type: 'text', inputMode: 'numeric', value: l.qte, 'data-qte': l.ref,
            'aria-label': `Quantité de ${p.nom}`,
          }),
        ]),
        el('button', { class: 'btn-link', type: 'button', 'data-remove': l.ref, text: 'Retirer' }),
      ]);
    }));
    $('#devis-empty').hidden = devis.lignes.length > 0;
    const badge = $('#devis-badge');
    badge.hidden = devis.lignes.length === 0;
    badge.textContent = String(devis.lignes.length);
    afficherTotaux();
  }

  function etatDevis() {
    const erreurs = [];
    const lignes = [];
    for (const l of devis.lignes) {
      const p = PAR_REF[l.ref];
      const q = lireQuantite(l.qte);
      if (q === null) {
        erreurs.push(`Quantité invalide pour « ${p.nom} » : saisissez un nombre entier supérieur ou égal à 1.`);
      } else {
        lignes.push({ ...p, qte: q });
      }
    }
    const r = lireRemise(devis.remise);
    if (!r.ok) erreurs.push(r.message);
    const pret = erreurs.length === 0 && lignes.length > 0;
    return { erreurs, lignes, remise: r.ok ? r.valeur : 0, totaux: pret ? calculer(lignes, r.valeur) : null };
  }

  function texteDevis(etat) {
    const t = etat.totaux;
    const lignes = etat.lignes.map((l) => `- ${l.qte} × ${l.nom} (réf. ${l.ref}) : ${madTexte(l.prix * l.qte)} HT`);
    return [
      `Devis ${devis.numero} — Atlas Distribution`,
      devis.client.trim() ? `Client : ${devis.client.trim()}` : null,
      `Date : ${dateLisible(aujourdhui())}`,
      '',
      ...lignes,
      '',
      `Total HT brut : ${madTexte(t.brut)}`,
      etat.remise > 0 ? `Remise ${pct(etat.remise)} % : -${madTexte(t.remise)}` : null,
      `Total HT : ${madTexte(t.ht)}`,
      `TVA ${TVA_TAUX} % : ${madTexte(t.tva)}`,
      `Total TTC : ${madTexte(t.ttc)}`,
      '',
      'Devis indicatif — projet pédagogique, données fictives.',
    ].filter((x) => x !== null).join('\n');
  }

  function afficherTotaux() {
    const etat = etatDevis();
    // Totaux par ligne et signalement des quantités invalides
    for (const l of devis.lignes) {
      const q = lireQuantite(l.qte);
      const cellule = document.querySelector(`[data-total="${l.ref}"]`);
      const champ = document.querySelector(`[data-qte="${l.ref}"]`);
      if (cellule) cellule.textContent = q === null ? '—' : mad(PAR_REF[l.ref].prix * q);
      if (champ) champ.classList.toggle('invalid', q === null);
    }
    $('#devis-remise').classList.toggle('invalid', !lireRemise(devis.remise).ok);
    $('#devis-errors').replaceChildren(...etat.erreurs.map((m) => el('p', { text: m })));

    const t = etat.totaux;
    $('#t-brut').textContent = t ? mad(t.brut) : '—';
    $('#t-remise').textContent = t ? (t.remise > 0 ? `− ${mad(t.remise)} (${pct(etat.remise)} %)` : mad(0)) : '—';
    $('#t-ht').textContent = t ? mad(t.ht) : '—';
    $('#t-tva').textContent = t ? mad(t.tva) : '—';
    $('#t-ttc').textContent = t ? mad(t.ttc) : '—';

    const wa = $('#whatsapp-btn');
    const copie = $('#copy-btn');
    if (t) {
      wa.href = `https://wa.me/?text=${encodeURIComponent(texteDevis(etat))}`;
      wa.classList.remove('disabled');
      wa.removeAttribute('aria-disabled');
      copie.disabled = false;
    } else {
      wa.href = '#';
      wa.classList.add('disabled');
      wa.setAttribute('aria-disabled', 'true');
      copie.disabled = true;
    }
  }

  $('#devis-lines').addEventListener('input', (e) => {
    const champ = e.target.closest('[data-qte]');
    if (!champ) return;
    const ligne = devis.lignes.find((l) => l.ref === champ.dataset.qte);
    ligne.qte = champ.value;
    sauverDevis();
    afficherTotaux();
  });
  $('#devis-lines').addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    devis.lignes = devis.lignes.filter((l) => l.ref !== b.dataset.remove);
    sauverDevis();
    afficherDevis();
  });
  $('#devis-remise').addEventListener('input', (e) => {
    devis.remise = e.target.value;
    sauverDevis();
    afficherTotaux();
  });
  $('#devis-client').addEventListener('input', (e) => {
    devis.client = e.target.value;
    sauverDevis();
    afficherTotaux();
  });
  $('#add-line-btn').addEventListener('click', () => ajouterAuDevis($('#add-product').value));
  $('#copy-btn').addEventListener('click', async () => {
    const etat = etatDevis();
    if (!etat.totaux) return;
    const texte = texteDevis(etat);
    try {
      await navigator.clipboard.writeText(texte);
    } catch (e) {
      const zone = el('textarea', { value: texte });
      document.body.append(zone);
      zone.select();
      document.execCommand('copy');
      zone.remove();
    }
    afficherToast('Devis copié');
  });
  $('#new-devis-btn').addEventListener('click', (e) => {
    const action = () => {
      devis = devisVide();
      sauverDevis();
      afficherDevis();
      afficherToast(`Nouveau devis ${devis.numero}`);
    };
    if (devis.lignes.length === 0) action();
    else doubleAppui(e.currentTarget, 'Confirmer : nouveau devis', action);
  });

  // ================= Visites =================
  let visites = charger(CLES.visites, []);
  if (!Array.isArray(visites)) visites = [];
  const sauverVisites = () => enregistrer(CLES.visites, visites);

  function afficherVisites() {
    const triees = [...visites].sort((a, b) =>
      b.date.localeCompare(a.date) || b.cree.localeCompare(a.cree));
    $('#visites-list').replaceChildren(...triees.map((v) => el('li', { class: 'card visit' }, [
      el('div', { class: 'visit-head' }, [
        el('p', { class: 'visit-client', text: v.client }),
        el('span', { class: 'visit-date', text: dateLisible(v.date) }),
      ]),
      el('p', { class: 'visit-notes', text: v.notes }),
      el('div', { class: 'visit-foot' }, [
        el('button', { class: 'btn-link', type: 'button', 'data-del': v.id, text: 'Supprimer' }),
      ]),
    ])));
    const n = visites.length;
    $('#visites-count').textContent = `${n} visite${n > 1 ? 's' : ''}`;
    $('#export-btn').disabled = n === 0;
  }

  $('#v-date').value = aujourdhui();
  $('#visite-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const client = $('#v-client').value.trim();
    const date = $('#v-date').value;
    const notes = $('#v-notes').value.trim();
    const erreurs = [];
    if (!client) erreurs.push('Indiquez le client.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) erreurs.push('Indiquez une date valide.');
    if (!notes) erreurs.push('Rédigez le compte rendu.');
    $('#visite-errors').replaceChildren(...erreurs.map((m) => el('p', { text: m })));
    if (erreurs.length) return;
    visites.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      client, date, notes, cree: new Date().toISOString(),
    });
    if (sauverVisites()) {
      $('#v-client').value = '';
      $('#v-notes').value = '';
      $('#v-date').value = aujourdhui();
      afficherVisites();
      afficherToast('Visite enregistrée');
    }
  });
  $('#visites-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    doubleAppui(b, 'Confirmer la suppression', () => {
      visites = visites.filter((v) => v.id !== b.dataset.del);
      sauverVisites();
      afficherVisites();
      afficherToast('Visite supprimée');
    });
  });

  function csvVisites() {
    const cel = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const lignes = [...visites]
      .sort((a, b) => a.date.localeCompare(b.date) || a.cree.localeCompare(b.cree))
      .map((v) => [v.date, v.client, v.notes].map(cel).join(';'));
    return '﻿' + ['Date;Client;Compte rendu', ...lignes].join('\r\n');
  }
  window.AtlasCalc.csvVisites = csvVisites;

  $('#export-btn').addEventListener('click', () => {
    const blob = new Blob([csvVisites()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `visites-atlas-${aujourdhui()}.csv` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    afficherToast('Fichier CSV créé');
  });

  // ================= Connexion, installation, mise à jour =================
  const majReseau = () => { $('#offline-pill').hidden = navigator.onLine; };
  window.addEventListener('online', majReseau);
  window.addEventListener('offline', majReseau);
  majReseau();

  let invitation = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    invitation = e;
    $('#install-btn').hidden = false;
  });
  $('#install-btn').addEventListener('click', async () => {
    if (!invitation) return;
    invitation.prompt();
    await invitation.userChoice.catch(() => null);
    invitation = null;
    $('#install-btn').hidden = true;
  });
  window.addEventListener('appinstalled', () => {
    $('#install-btn').hidden = true;
    afficherToast('Application installée');
  });

  const estIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const estInstallee = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (estIOS && !estInstallee && !charger(CLES.iosTip, false)) $('#ios-tip').hidden = false;
  $('#ios-tip-close').addEventListener('click', () => {
    $('#ios-tip').hidden = true;
    enregistrer(CLES.iosTip, true);
  });

  if ('serviceWorker' in navigator) {
    const avaitControleur = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (avaitControleur) afficherToast(`Application mise à jour (version ${APP_VERSION})`);
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* hors HTTPS : pas de mode hors ligne */ });
    });
  }

  // ================= Démarrage =================
  document.querySelector('#tab-catalogue .notice').textContent =
    `Projet pédagogique — produits et prix fictifs · version ${APP_VERSION}`;
  $('#remise-max').textContent = String(REMISE_MAX);
  remplirListeProduits();
  afficherCatalogue();
  afficherDevis();
  afficherVisites();
  afficherOnglet(location.hash.slice(1));
})();

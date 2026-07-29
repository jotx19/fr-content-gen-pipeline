// @ts-nocheck
import { createHash } from 'node:crypto';
import { shuffleMcqOptions } from '../../../content-pipeline/subagents/shared/reading.normalize.js';

/**
 * Full TEF-style reading sessions: multiple modules per practice batch.
 * Types: passage_mcq | finding_info | mcq_set
 */

const PRACTICE_SESSIONS = [
  {
    topic: 'Official documents and written comprehension',
    modules: [
      {
        id: 'mod-passage-1',
        type: 'passage_mcq',
        title: 'Compréhension de texte',
        passage: `AVIS AUX RÉSIDENTS — RÉSIDENCE LES CÈDRES

Le conseil d'administration informe les résidents que des travaux de rénovation auront lieu dans le hall d'entrée du 12 au 18 mars inclus.

Pendant cette période :
• L'accès principal sera fermé de 8 h à 17 h.
• Veuillez utiliser l'entrée latérale située rue des Érables.
• Les livraisons doivent être signalées à l'accueil au moins 30 minutes à l'avance.

Pour toute question, contactez la conciergerie au 514-555-0198 ou par courriel à conciergerie@lescedres.ca.

Nous vous remercions de votre collaboration.`,
        items: [
          {
            id: 'p1-q1',
            question: 'Quelle est la durée prévue des travaux ?',
            options: [
              'Du 12 au 18 mars inclus',
              'Uniquement le 12 mars',
              'Du 8 au 17 mars',
              'Tout le mois de mars',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'The notice states works run from 12 to 18 March inclusive.',
          },
          {
            id: 'p1-q2',
            question: 'Pendant les travaux, comment doit-on entrer dans l\'immeuble ?',
            options: [
              'Par l\'entrée latérale rue des Érables',
              'Par l\'accès principal uniquement',
              'Par le stationnement souterrain',
              'Il n\'y a pas d\'accès possible',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Residents must use the side entrance on rue des Érables.',
          },
          {
            id: 'p1-q3',
            question: 'Que doivent faire les livreurs ?',
            options: [
              'Prévenir l\'accueil 30 minutes à l\'avance',
              'Attendre après 17 h seulement',
              'Utiliser l\'ascenseur de service sans prévenir',
              'Livrer directement aux appartements',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Deliveries must be reported to reception at least 30 minutes ahead.',
          },
        ],
      },
      {
        id: 'mod-find-1',
        type: 'finding_info',
        title: 'Repérage d\'informations',
        passage: `SERVICE DES RESSOURCES HUMAINES
Formulaire de demande de congé

Nom : ________________  Prénom : ________________
Date de début : ________  Date de fin : ________
Type de congé : ☐ Annuel  ☐ Maladie  ☐ Parental  ☐ Autre
Motif (si autre) : ________________________________
Signature du salarié : ________  Date : ________
Visa du responsable : ________  Date : ________

À déposer au bureau RH au moins 10 jours ouvrables avant le début du congé, sauf urgence médicale.`,
        items: [
          {
            id: 'f1-q1',
            question: 'Où doit être déposé ce formulaire ?',
            options: [
              'Au bureau des ressources humaines',
              'À la conciergerie',
              'Chez le médecin',
              'À la banque',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'The form must be filed with HR.',
          },
          {
            id: 'f1-q2',
            question: 'Quel délai est demandé avant le début du congé (sauf urgence) ?',
            options: [
              'Au moins 10 jours ouvrables',
              '24 heures',
              'Un mois calendaire',
              'Aucune échéance',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'At least 10 business days notice is required.',
          },
        ],
      },
      {
        id: 'mod-mcq-1',
        type: 'mcq_set',
        title: 'Grammaire et vocabulaire',
        items: [
          {
            id: 'm1-q1',
            question: 'Choisissez la forme correcte : « Il faut que vous ___ le formulaire avant vendredi. »',
            options: ['remplissiez', 'remplissez', 'remplir', 'rempli'],
            correctIndex: 0,
            skillTag: 'grammaire',
            explanation: 'After « il faut que », use the subjunctive: remplissiez.',
          },
          {
            id: 'm1-q2',
            question: 'Dans un courriel professionnel, quel mot remplace le mieux « boss » ?',
            options: ['patron', 'copain', 'frère', 'voisin'],
            correctIndex: 0,
            skillTag: 'vocabulaire',
            explanation: 'Patron is the formal equivalent of boss.',
          },
        ],
      },
    ],
  },
  {
    topic: 'Administrative French and public notices',
    modules: [
      {
        id: 'mod-passage-2',
        type: 'passage_mcq',
        title: 'Compréhension de texte',
        passage: `BIBLIOTHÈQUE MUNICIPALE — RÈGLEMENT DE PRÊT

Chaque abonné peut emprunter jusqu'à 8 documents pour une durée de 21 jours.
Les magazines et DVD sont limités à 7 jours.

Les retards entraînent une pénalité de 0,25 $ par document et par jour, plafonnée à 10 $ par document.
Après 30 jours de retard, le compte est suspendu jusqu'au règlement des frais.

Le renouvellement est possible une fois en ligne, sauf si un autre usager a réservé l'ouvrage.

Horaires : mardi–vendredi 10 h–20 h, samedi 10 h–17 h. Fermé dimanche et lundi.`,
        items: [
          {
            id: 'p2-q1',
            question: 'Combien de documents un abonné peut-il emprunter au maximum ?',
            options: ['8', '7', '21', '10'],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Up to 8 documents may be borrowed.',
          },
          {
            id: 'p2-q2',
            question: 'Quand le compte est-il suspendu ?',
            options: [
              'Après 30 jours de retard',
              'Dès le premier jour de retard',
              'Après une pénalité de 0,25 $',
              'Uniquement le dimanche',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Accounts are suspended after 30 days overdue.',
          },
          {
            id: 'p2-q3',
            question: 'Le renouvellement en ligne est impossible si :',
            options: [
              'Un autre usager a réservé l\'ouvrage',
              'Il reste moins de 21 jours',
              'C\'est un magazine',
              'La bibliothèque est fermée le lundi',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Online renewal is blocked when another user reserved the item.',
          },
        ],
      },
      {
        id: 'mod-find-2',
        type: 'finding_info',
        title: 'Repérage d\'informations',
        passage: `GUICHET UNIQUE — VILLE DE MONTRÉAL
Demande de certificat de naissance

Pièces à fournir :
1. Pièce d'identité avec photo
2. Preuve d'adresse récente (moins de 3 mois)
3. Paiement des frais : 35 $ (carte ou argent comptant)

Délai de traitement : 10 à 15 jours ouvrables.
Retrait uniquement sur place, sur présentation du reçu.

Heures d'ouverture : lundi au jeudi 8 h 30–16 h 30. Fermé le vendredi.`,
        items: [
          {
            id: 'f2-q1',
            question: 'Quel document d\'adresse est accepté ?',
            options: [
              'Une preuve d\'adresse de moins de 3 mois',
              'Un ancien bail de plus d\'un an',
              'Une photo de votre boîte aux lettres',
              'Aucune preuve n\'est exigée',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'A recent proof of address (under 3 months) is required.',
          },
          {
            id: 'f2-q2',
            question: 'Comment peut-on retirer le certificat ?',
            options: [
              'Sur place uniquement, avec le reçu',
              'Par la poste uniquement',
              'En ligne immédiatement',
              'Chez un notaire',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Pickup is in person with the receipt.',
          },
        ],
      },
      {
        id: 'mod-mcq-2',
        type: 'mcq_set',
        title: 'Grammaire et vocabulaire',
        items: [
          {
            id: 'm2-q1',
            question: 'Quelle phrase est correcte au passé composé ?',
            options: [
              'Nous avons reçu votre demande.',
              'Nous avons reçu votre demande hier hier.',
              'Nous recevons votre demande hier.',
              'Nous avons recevoir votre demande.',
            ],
            correctIndex: 0,
            skillTag: 'grammaire',
            explanation: 'Passé composé: avons reçu.',
          },
          {
            id: 'm2-q2',
            question: 'Le mot « loyer » correspond à :',
            options: [
              'Le prix mensuel d\'un logement',
              'Un billet de transport',
              'Une taxe scolaire',
              'Un remboursement médical',
            ],
            correctIndex: 0,
            skillTag: 'vocabulaire',
            explanation: 'Loyer is monthly rent.',
          },
        ],
      },
    ],
  },
  {
    topic: 'Workplace communication and forms',
    modules: [
      {
        id: 'mod-passage-3',
        type: 'passage_mcq',
        title: 'Compréhension de texte',
        passage: `NOTE DE SERVICE — DÉPARTEMENT MARKETING

Objet : Réorganisation des horaires de réunion

À compter du 1er avril, les réunions d'équipe auront lieu le mardi de 9 h 30 à 10 h 30 en salle B12.
La participation est obligatoire pour tous les chargés de projet.
Les absences motivées doivent être signalées à votre gestionnaire avant 17 h la veille.

Un compte rendu sera publié sur l'intranet dans les 48 heures suivant chaque réunion.
Merci de mettre à jour vos agendas avant le 28 mars.`,
        items: [
          {
            id: 'p3-q1',
            question: 'Quand les nouvelles réunions commencent-elles ?',
            options: [
              'À compter du 1er avril',
              'Le 28 mars',
              'Dans les 48 heures',
              'Tous les jeudis',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'New schedule starts April 1.',
          },
          {
            id: 'p3-q2',
            question: 'Qui doit assister aux réunions ?',
            options: [
              'Tous les chargés de projet',
              'Uniquement les gestionnaires',
              'Le service RH seulement',
              'Les stagiaires uniquement',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Attendance is mandatory for all project leads.',
          },
          {
            id: 'p3-q3',
            question: 'Où trouvera-t-on le compte rendu ?',
            options: [
              'Sur l\'intranet sous 48 heures',
              'Par courrier postal',
              'Uniquement en salle B12',
              'Il n\'y a pas de compte rendu',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Minutes are published on the intranet within 48 hours.',
          },
        ],
      },
      {
        id: 'mod-find-3',
        type: 'finding_info',
        title: 'Repérage d\'informations',
        passage: `CLINIQUE MÉDICALE DU CENTRE
Prise de rendez-vous

Tél. : 514-555-0142 (lun–ven 8 h–17 h)
En ligne : www.cliniqueducentre.ca/rdv

Pièces à apporter :
• Carte d'assurance maladie
• Liste de médicaments en cours
• Résultats d'analyses récents (si disponibles)

En cas d'annulation, prévenez au moins 24 heures à l'avance, sinon des frais de 40 $ peuvent s'appliquer.`,
        items: [
          {
            id: 'f3-q1',
            question: 'Que risque-t-on sans annuler 24 h à l\'avance ?',
            options: [
              'Des frais de 40 $',
              'Une amende municipale',
              'La perte de l\'assurance maladie',
              'Rien du tout',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Late cancellations may incur a $40 fee.',
          },
          {
            id: 'f3-q2',
            question: 'Quel document d\'identité santé faut-il apporter ?',
            options: [
              'La carte d\'assurance maladie',
              'Un passeport uniquement',
              'Un permis de conduire seulement',
              'Aucune pièce n\'est demandée',
            ],
            correctIndex: 0,
            skillTag: 'compréhension écrite',
            explanation: 'Bring your health insurance card.',
          },
        ],
      },
      {
        id: 'mod-mcq-3',
        type: 'mcq_set',
        title: 'Grammaire et vocabulaire',
        items: [
          {
            id: 'm3-q1',
            question: 'Complétez : « Si j\'avais su, je ___ plus tôt. »',
            options: ['serais venu', 'viens', 'viendrai', 'venais'],
            correctIndex: 0,
            skillTag: 'grammaire',
            explanation: 'Past hypothesis uses conditional perfect.',
          },
          {
            id: 'm3-q2',
            question: 'Dans un contexte administratif, « pièce d\'identité » signifie :',
            options: [
              'Un document officiel prouvant qui vous êtes',
              'Une facture d\'électricité',
              'Un curriculum vitae',
              'Un billet de banque',
            ],
            correctIndex: 0,
            skillTag: 'vocabulaire',
            explanation: 'Pièce d\'identité is an official ID document.',
          },
        ],
      },
    ],
  },
];

function pickBatchIndex(seed, batchCount) {
  if (!batchCount) return 0;
  const hash = createHash('sha256').update(seed).digest();
  return hash[0] % batchCount;
}

export function flattenReadingModules(modules = []) {
  return modules.flatMap((mod) =>
    (mod.items ?? []).map((item) => ({
      ...item,
      moduleId: mod.id,
      moduleType: mod.type,
      moduleTitle: mod.title,
    }))
  );
}

/** @deprecated Prefer pickReadingPracticeSession */
export function pickReadingPracticeTemplate(seed = '', count = 3) {
  const session = pickReadingPracticeSession(seed);
  const flat = flattenReadingModules(session.modules);
  const size = Math.min(Math.max(Number(count) || 3, 1), flat.length);
  return flat.slice(0, size);
}

export function pickReadingPracticeSession(seed = '') {
  const index = pickBatchIndex(seed || String(Date.now()), PRACTICE_SESSIONS.length);
  const session = PRACTICE_SESSIONS[index] ?? PRACTICE_SESSIONS[0];
  return {
    topic: session.topic,
    modules: session.modules.map((m) => ({
      ...m,
      items: m.items.map((item) => shuffleMcqOptions({ ...item })),
    })),
  };
}

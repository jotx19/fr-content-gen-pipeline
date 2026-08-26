import { withTefSection } from './readingExamStructure.js';
import type { ReadingSessionsByBand } from './readingPractice.types.js';

/** TEF-format practice sessions keyed by CEFR band (14 questions, 7 sections). */
export const READING_SESSIONS_BY_BAND: ReadingSessionsByBand = {
  beginner: [
    {
      topic: 'Compréhension écrite — niveau A1–A2',
      modules: [
        withTefSection(
          {
            id: 'beg-a',
            passage: `CAFÉ DU MARCHÉ
Ouvert du lundi au samedi
7 h 30 – 18 h
Fermé le dimanche
Petit-déjeuner servi jusqu'à 10 h 30`,
            items: [
              {
                id: 'beg-a1',
                question: 'Quand le café est-il fermé ?',
                options: ['Le dimanche', 'Le lundi', 'Le samedi', 'Tous les jours'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'The sign says closed on Sunday.',
              },
              {
                id: 'beg-a2',
                question: 'Jusqu\'à quelle heure peut-on prendre le petit-déjeuner ?',
                options: ['10 h 30', '7 h 30', '18 h', '12 h'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Breakfast is served until 10:30.',
              },
            ],
          },
          'short_documents'
        ),
        withTefSection(
          {
            id: 'beg-b',
            items: [
              {
                id: 'beg-b1',
                question: 'Hier, Marie ___ à la bibliothèque.',
                options: ['est allée', 'va', 'ira', 'allait'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Hier requires passé composé.',
              },
              {
                id: 'beg-b2',
                question: 'Nous ___ français depuis six mois.',
                options: ['apprenons', 'avons appris', 'apprendrons', 'apprenions'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Depuis + present describes ongoing action.',
              },
            ],
          },
          'sentence_gap'
        ),
        withTefSection(
          {
            id: 'beg-c',
            passage: `Bonjour,

Je m'appelle Thomas. J'habite à Québec. Je travaille dans un restaurant le soir. Le matin, je ___ des cours de français.`,
            items: [
              {
                id: 'beg-c1',
                question: 'Quel mot complète le texte ?',
                options: ['suis', 'prends', 'mange', 'dors'],
                correctIndex: 1,
                skillTag: 'grammaire',
                explanation: 'Prendre des cours = take classes.',
              },
            ],
          },
          'text_gap'
        ),
        withTefSection(
          {
            id: 'beg-d',
            passage: `Texte 1 : Le bus 24 part à 8 h 15.
Texte 2 : La piscine ouvre à 9 h.
Texte 3 : Le musée ferme à 17 h.
Texte 4 : Le parc est ouvert toute la journée.`,
            items: [
              {
                id: 'beg-d1',
                question: 'Quel texte parle d\'un horaire de transport ?',
                options: ['Texte 1', 'Texte 2', 'Texte 3', 'Texte 4'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Text 1 mentions bus departure time.',
              },
            ],
          },
          'doc_info_match'
        ),
        withTefSection(
          {
            id: 'beg-e',
            passage: `Graphique — Température à Montréal (semaine)
Lundi : 5 °C | Mardi : 8 °C | Mercredi : 12 °C | Jeudi : 10 °C | Vendredi : 7 °C`,
            items: [
              {
                id: 'beg-e1',
                question: 'Quel jour a la température la plus élevée ?',
                options: ['Mercredi', 'Lundi', 'Vendredi', 'Jeudi'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Wednesday shows 12 °C, the highest.',
              },
            ],
          },
          'statement_graph'
        ),
        withTefSection(
          {
            id: 'beg-f',
            passage: `ÉCOLE DE LANGUES — INSCRIPTION

Nom : _______________
Adresse : _______________
Cours choisi : ☐ Débutant  ☐ Intermédiaire
Date de début : _______________

Apportez une pièce d'identité et payez 120 $ le premier jour.
Inscriptions : lundi à vendredi, 9 h – 16 h.`,
            items: [
              {
                id: 'beg-f1',
                question: 'Combien coûte l\'inscription ?',
                options: ['120 $', '24 $', 'Gratuit', '500 $'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Fee is $120 on first day.',
              },
              {
                id: 'beg-f2',
                question: 'Quel document faut-il apporter ?',
                options: [
                  'Une pièce d\'identité',
                  'Un certificat médical',
                  'Un permis de conduire seulement',
                  'Rien',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'ID is required.',
              },
              {
                id: 'beg-f3',
                question: 'Quand peut-on s\'inscrire ?',
                options: [
                  'Du lundi au vendredi, 9 h – 16 h',
                  'Le dimanche seulement',
                  '24 h sur 24',
                  'Uniquement en ligne',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Registration hours are weekdays 9–16.',
              },
              {
                id: 'beg-f4',
                question: 'Le formulaire sert à :',
                options: [
                  'S\'inscrire à un cours de langue',
                  'Demander un passeport',
                  'Louer un appartement',
                  'Réserver un vol',
                ],
                correctIndex: 0,
                skillTag: 'vocabulaire',
                explanation: 'This is a language school registration form.',
              },
            ],
          },
          'admin_documents'
        ),
        withTefSection(
          {
            id: 'beg-g',
            passage: `Un nouveau parc ouvre à Laval

La ville de Laval a inauguré un parc de 5 hectares près du métro. Des aires de jeux, un terrain de soccer et des bancs sont disponibles pour les familles. Le maire a dit que ce projet améliore la qualité de vie des résidents. Le parc est ouvert tous les jours de 6 h à 22 h.`,
            items: [
              {
                id: 'beg-g1',
                question: 'Où se trouve le nouveau parc ?',
                options: ['À Laval', 'À Paris', 'À Ottawa', 'À Marseille'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'The article says Laval.',
              },
              {
                id: 'beg-g2',
                question: 'Quelles installations sont mentionnées ?',
                options: [
                  'Aires de jeux et terrain de soccer',
                  'Piscine olympique',
                  'Cinéma',
                  'Gare ferroviaire',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Play areas and soccer field are listed.',
              },
              {
                id: 'beg-g3',
                question: 'Jusqu\'à quelle heure le parc est-il ouvert ?',
                options: ['22 h', '18 h', '12 h', 'Minuit'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Open until 22 h.',
              },
            ],
          },
          'press_article'
        ),
      ],
    },
  ],
  intermediate: [
    {
      topic: 'Compréhension écrite — niveau B1–B2',
      modules: [
        withTefSection(
          {
            id: 'int-a',
            passage: `AVIS AUX RÉSIDENTS — RÉSIDENCE LES CÈDRES

Le conseil d'administration informe les résidents que des travaux de rénovation auront lieu dans le hall d'entrée du 12 au 18 mars inclus.

Pendant cette période :
• L'accès principal sera fermé de 8 h à 17 h.
• Veuillez utiliser l'entrée latérale située rue des Érables.
• Les livraisons doivent être signalées à l'accueil au moins 30 minutes à l'avance.

Pour toute question : conciergerie@lescedres.ca — 514-555-0198`,
            items: [
              {
                id: 'int-a1',
                question: 'Quelle est la durée prévue des travaux ?',
                options: [
                  'Du 12 au 18 mars inclus',
                  'Uniquement le 12 mars',
                  'Du 8 au 17 mars',
                  'Tout le mois de mars',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Works run 12–18 March inclusive.',
              },
              {
                id: 'int-a2',
                question: 'Comment entrer dans l\'immeuble pendant les travaux ?',
                options: [
                  'Par l\'entrée latérale rue des Érables',
                  'Par l\'accès principal',
                  'Par le stationnement souterrain',
                  'Il n\'y a pas d\'accès',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Use side entrance on rue des Érables.',
              },
            ],
          },
          'short_documents'
        ),
        withTefSection(
          {
            id: 'int-b',
            items: [
              {
                id: 'int-b1',
                question: 'Il faut que vous ___ le formulaire avant vendredi.',
                options: ['remplissiez', 'remplissez', 'remplir', 'rempli'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'After il faut que, use subjunctive.',
              },
              {
                id: 'int-b2',
                question: 'Si j\'avais plus de temps, je ___ ce cours.',
                options: ['terminerais', 'termine', 'ai terminé', 'terminerai'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Hypothesis in past uses conditional.',
              },
            ],
          },
          'sentence_gap'
        ),
        withTefSection(
          {
            id: 'int-c',
            passage: `Objet : Changement d'horaire

Bonjour Madame Dupont,

Suite à la réunion du 3 avril, les permanences du service client auront lieu les mardi et jeudi de 13 h à 17 h. Les demandes urgentes devront être ___ par courriel avant 10 h.

Cordialement,
Le service client`,
            items: [
              {
                id: 'int-c1',
                question: 'Quel mot complète le courriel ?',
                options: ['transmises', 'transmettre', 'transmet', 'transmis'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Past participle agreement: demandes transmises.',
              },
            ],
          },
          'text_gap'
        ),
        withTefSection(
          {
            id: 'int-d',
            passage: `Document 1 : Remboursement sous 14 jours ouvrables après réception du produit.
Document 2 : Livraison gratuite à partir de 75 $ d'achat.
Document 3 : Garantie de deux ans sur les appareils électroniques.
Document 4 : Échange possible en magasin sous 30 jours avec facture.`,
            items: [
              {
                id: 'int-d1',
                question: 'Quel document concerne les appareils électroniques ?',
                options: ['Document 3', 'Document 1', 'Document 2', 'Document 4'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Document 3 mentions electronic devices warranty.',
              },
            ],
          },
          'doc_info_match'
        ),
        withTefSection(
          {
            id: 'int-e',
            passage: `Enquête — Satisfaction au travail (2025)
Très satisfaits : 32 % | Plutôt satisfaits : 41 % | Peu satisfaits : 19 % | Pas du tout : 8 %`,
            items: [
              {
                id: 'int-e1',
                question: 'Quelle catégorie représente la plus grande part ?',
                options: ['Plutôt satisfaits', 'Très satisfaits', 'Peu satisfaits', 'Pas du tout'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: '41 % is the largest share.',
              },
            ],
          },
          'statement_graph'
        ),
        withTefSection(
          {
            id: 'int-f',
            passage: `SERVICE DES RESSOURCES HUMAINES
Formulaire de demande de congé

Nom : ________________  Prénom : ________________
Date de début : ________  Date de fin : ________
Type : ☐ Annuel  ☐ Maladie  ☐ Parental  ☐ Autre

À déposer au bureau RH au moins 10 jours ouvrables avant le début du congé, sauf urgence médicale.
Visa du responsable obligatoire.`,
            items: [
              {
                id: 'int-f1',
                question: 'Où déposer ce formulaire ?',
                options: [
                  'Au bureau des ressources humaines',
                  'À la conciergerie',
                  'Chez le médecin',
                  'À la banque',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'File with HR office.',
              },
              {
                id: 'int-f2',
                question: 'Quel délai est demandé (sauf urgence) ?',
                options: [
                  'Au moins 10 jours ouvrables',
                  '24 heures',
                  'Un mois',
                  'Aucune échéance',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: '10 business days notice required.',
              },
              {
                id: 'int-f3',
                question: 'Quelle case correspond à un congé de maternité/paternité ?',
                options: ['Parental', 'Annuel', 'Maladie', 'Autre'],
                correctIndex: 0,
                skillTag: 'vocabulaire',
                explanation: 'Parental leave uses Parental checkbox.',
              },
              {
                id: 'int-f4',
                question: 'Que doit obtenir le formulaire avant traitement ?',
                options: [
                  'Le visa du responsable',
                  'Un certificat de naissance',
                  'Une note du médecin systématique',
                  'L\'accord du syndicat uniquement',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Manager approval is mandatory.',
              },
            ],
          },
          'admin_documents'
        ),
        withTefSection(
          {
            id: 'int-g',
            passage: `Le télétravail divise les entreprises québécoises

Selon une étude publiée mardi, 58 % des PME au Québec proposent encore une forme de travail à distance, mais seulement 22 % envisagent de generaliser ce modèle à long terme. Les dirigeants invoquent surtout la collaboration en équipe et l'accueil des nouveaux employés. Les travailleurs, eux, mettent en avant la flexibilité et la réduction du temps de transport. Des experts estiment qu'un modèle hybride deviendra la norme d'ici trois ans.`,
            items: [
              {
                id: 'int-g1',
                question: 'Quel pourcentage de PME propose encore du télétravail ?',
                options: ['58 %', '22 %', '41 %', '75 %'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Study cites 58 % of SMEs.',
              },
              {
                id: 'int-g2',
                question: 'Quel argument les dirigeants mettent-ils en avant ?',
                options: [
                  'La collaboration en équipe',
                  'La flexibilité',
                  'Le temps de transport',
                  'Le coût du loyer',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Managers cite team collaboration.',
              },
              {
                id: 'int-g3',
                question: 'Que prévoient les experts ?',
                options: [
                  'Un modèle hybride à terme',
                  'La fin du télétravail',
                  '100 % de présentiel',
                  'Des licenciements massifs',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Experts expect hybrid to become norm.',
              },
            ],
          },
          'press_article'
        ),
      ],
    },
    {
      topic: 'Documents administratifs et presse — B1–B2',
      modules: [
        withTefSection(
          {
            id: 'int2-a',
            passage: `BIBLIOTHÈQUE MUNICIPALE — RÈGLEMENT DE PRÊT

Emprunt maximum : 8 documents / 21 jours (magazines et DVD : 7 jours).
Retard : 0,25 $ / document / jour (plafond 10 $).
Suspension du compte après 30 jours de retard.
Renouvellement en ligne une fois, sauf réservation par un autre usager.

Horaires : mar–ven 10 h–20 h, sam 10 h–17 h. Fermé dim. et lun.`,
            items: [
              {
                id: 'int2-a1',
                question: 'Combien de documents peut-on emprunter au maximum ?',
                options: ['8', '7', '21', '10'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Maximum 8 documents.',
              },
              {
                id: 'int2-a2',
                question: 'Quand le compte est-il suspendu ?',
                options: [
                  'Après 30 jours de retard',
                  'Dès le premier jour',
                  'Après 7 jours',
                  'Jamais',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Suspended after 30 days overdue.',
              },
            ],
          },
          'short_documents'
        ),
        withTefSection(
          {
            id: 'int2-b',
            items: [
              {
                id: 'int2-b1',
                question: 'Bien qu\'il ___ fatigué, il a terminé le rapport.',
                options: ['fût', 'est', 'sera', 'serait'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Bien que triggers subjunctive: fût.',
              },
              {
                id: 'int2-b2',
                question: 'Les dossiers ___ hier par le service juridique.',
                options: ['ont été validés', 'valident', 'valideront', 'validaient'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Passive passé composé: ont été validés.',
              },
            ],
          },
          'sentence_gap'
        ),
        withTefSection(
          {
            id: 'int2-c',
            passage: `Le candidat doit fournir un curriculum vitae à jour, une lettre de motivation d'une page maximum, ainsi que deux références professionnelles. Les candidatures incomplètes ne seront pas ___ par le comité de sélection.`,
            items: [
              {
                id: 'int2-c1',
                question: 'Quel mot complète le texte ?',
                options: ['examinées', 'examiner', 'examine', 'examiné'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Feminine plural past participle: examinées.',
              },
            ],
          },
          'text_gap'
        ),
        withTefSection(
          {
            id: 'int2-d',
            passage: `Avis 1 : Réduction de 20 % sur les abonnements étudiants.
Avis 2 : Atelier de CV gratuit jeudi à 14 h.
Avis 3 : Fermeture exceptionnelle le 1er juillet.
Avis 4 : Nouveau service de traduction de documents officiels.`,
            items: [
              {
                id: 'int2-d1',
                question: 'Quel avis concerne les étudiants ?',
                options: ['Avis 1', 'Avis 2', 'Avis 3', 'Avis 4'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Notice 1 mentions student subscriptions.',
              },
            ],
          },
          'doc_info_match'
        ),
        withTefSection(
          {
            id: 'int2-e',
            passage: `Immigration — Permis de travail délivrés (trimestre)
Jan–Mar : 12 400 | Avr–Jun : 11 850 | Jul–Sep : 13 200 | Oct–Dec : 10 950`,
            items: [
              {
                id: 'int2-e1',
                question: 'Quel trimestre affiche le plus de permis délivrés ?',
                options: ['Jul–Sep', 'Jan–Mar', 'Avr–Jun', 'Oct–Dec'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Jul–Sep has 13 200, the highest.',
              },
            ],
          },
          'statement_graph'
        ),
        withTefSection(
          {
            id: 'int2-f',
            passage: `GUICHET UNIQUE — VILLE DE MONTRÉAL
Demande de certificat de naissance

Pièces : pièce d'identité avec photo, preuve d'adresse (< 3 mois).
Frais : 35 $ (carte ou comptant).
Délai : 10 à 15 jours ouvrables.
Retrait sur place avec reçu uniquement.
Heures : lun–jeu 8 h 30–16 h 30. Fermé le vendredi.`,
            items: [
              {
                id: 'int2-f1',
                question: 'Quel document d\'adresse est accepté ?',
                options: [
                  'Preuve de moins de 3 mois',
                  'Bail de plus d\'un an',
                  'Photo de boîte aux lettres',
                  'Aucune preuve',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Address proof under 3 months.',
              },
              {
                id: 'int2-f2',
                question: 'Comment retirer le certificat ?',
                options: [
                  'Sur place avec le reçu',
                  'Par la poste',
                  'En ligne immédiatement',
                  'Chez un notaire',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'In-person pickup with receipt.',
              },
              {
                id: 'int2-f3',
                question: 'Quel est le délai de traitement ?',
                options: [
                  '10 à 15 jours ouvrables',
                  '24 heures',
                  '6 mois',
                  'Immédiat',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: '10–15 business days processing.',
              },
              {
                id: 'int2-f4',
                question: 'Quand le guichet est-il ouvert ?',
                options: [
                  'Lundi au jeudi',
                  'Tous les jours',
                  'Week-end seulement',
                  'Mercredi seulement',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Open Monday to Thursday.',
              },
            ],
          },
          'admin_documents'
        ),
        withTefSection(
          {
            id: 'int2-g',
            passage: `La pénurie de logements persiste au Québec

Malgré une légère hausse de l'offre locative à Montréal, le taux d'inoccupation reste inférieur à 2 % dans plusieurs arrondissements. Les associations de locataires demandent au gouvernement d'accélérer la construction de logements sociaux et de renforcer les contrôles sur les hausses de loyer abusives. Les propriétaires rappellent que les coûts d'entretien et d'assurance ont fortement augmenté depuis 2020. Le ministre responsable a annoncé un plan de 1,2 milliard sur cinq ans, sans préciser le calendrier des projets.`,
            items: [
              {
                id: 'int2-g1',
                question: 'Quel taux d\'inoccupation est mentionné ?',
                options: ['Inférieur à 2 %', 'Supérieur à 10 %', 'Exactement 5 %', '50 %'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Vacancy rate under 2 % cited.',
              },
              {
                id: 'int2-g2',
                question: 'Que demandent les associations de locataires ?',
                options: [
                  'Plus de logements sociaux',
                  'La fin des baux',
                  'Des subventions aux propriétaires',
                  'La suppression des taxes',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Tenant groups want social housing accelerated.',
              },
              {
                id: 'int2-g3',
                question: 'Qu\'a annoncé le ministre ?',
                options: [
                  'Un plan de 1,2 milliard sur cinq ans',
                  'Une baisse immédiate des loyers',
                  'La fin de la pénurie en 2026',
                  'Une taxe sur les locataires',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: '$1.2B five-year plan announced.',
              },
            ],
          },
          'press_article'
        ),
      ],
    },
  ],
  advanced: [
    {
      topic: 'Compréhension écrite — niveau C1–C2',
      modules: [
        withTefSection(
          {
            id: 'adv-a',
            passage: `AVIS DE RÉUNION EXTRAORDINAIRE — COPROPRIÉTÉ 1450, RUE SHERBROOKE

Ordre du jour : révision des charges communes, vote sur le remplacement de l'ascenseur, questions diverses.
Date : 18 mai, 19 h 30 | Lieu : salle polyvalente, 2e sous-sol.
Quorum requis : 50 % des voix. Pouvoirs acceptés jusqu'à 17 h le jour même.
Documents disponibles sur le portail résidents depuis le 1er mai.`,
            items: [
              {
                id: 'adv-a1',
                question: 'Quel point nécessite un vote ?',
                options: [
                  'Le remplacement de l\'ascenseur',
                  'La vente de l\'immeuble',
                  'Le changement d\'adresse',
                  'La fermeture du portail',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Agenda includes elevator replacement vote.',
              },
              {
                id: 'adv-a2',
                question: 'Quelle condition est requise pour valider les décisions ?',
                options: ['50 % des voix', 'Unanimité', '10 % des voix', 'Aucun quorum'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Quorum is 50 % of votes.',
              },
            ],
          },
          'short_documents'
        ),
        withTefSection(
          {
            id: 'adv-b',
            items: [
              {
                id: 'adv-b1',
                question: 'Quoi qu\'il ___ arrivé, le contrat restera valide.',
                options: ['soit', 'est', 'sera', 'serait'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Quoi que triggers subjunctive: soit.',
              },
              {
                id: 'adv-b2',
                question: 'C\'est la seule proposition ___ nous ayons examinée avec attention.',
                options: ['que', 'qui', 'dont', 'où'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'Relative pronoun with subjunctive: que.',
              },
            ],
          },
          'sentence_gap'
        ),
        withTefSection(
          {
            id: 'adv-c',
            passage: `Le rapport conclut que, sans mesures correctives immédiates, la marge opérationnelle pourrait se ___ de 4,2 points d'ici la fin de l'exercice fiscal, compte tenu de la volatilité des coûts énergétiques et de la pression salariale persistante.`,
            items: [
              {
                id: 'adv-c1',
                question: 'Quel verbe complète le passage ?',
                options: ['contracter', 'contracte', 'contractait', 'contractera'],
                correctIndex: 0,
                skillTag: 'grammaire',
                explanation: 'After pourrait se, infinitive: contracter.',
              },
            ],
          },
          'text_gap'
        ),
        withTefSection(
          {
            id: 'adv-d',
            passage: `Note A : Clause de non-concurrence valable 12 mois après départ.
Note B : Indemnité de départ négociable selon ancienneté.
Note C : Télétravail limité à deux jours par semaine.
Note D : Formation obligatoire en cybersécurité annuelle.`,
            items: [
              {
                id: 'adv-d1',
                question: 'Quelle note traite des restrictions après la fin du contrat ?',
                options: ['Note A', 'Note B', 'Note C', 'Note D'],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Note A covers non-compete after departure.',
              },
            ],
          },
          'doc_info_match'
        ),
        withTefSection(
          {
            id: 'adv-e',
            passage: `Évolution du taux de chômage (15–24 ans, Canada)
2019 : 10,2 % | 2020 : 15,4 % | 2021 : 13,1 % | 2022 : 9,8 % | 2023 : 9,1 % | 2024 : 8,7 %`,
            items: [
              {
                id: 'adv-e1',
                question: 'Quelle tendance générale observe-t-on de 2020 à 2024 ?',
                options: [
                  'Une baisse progressive après le pic de 2020',
                  'Une hausse constante',
                  'Stabilité autour de 15 %',
                  'Aucune variation',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Rate fell from 2020 peak toward 8.7 %.',
              },
            ],
          },
          'statement_graph'
        ),
        withTefSection(
          {
            id: 'adv-f',
            passage: `CONTRAT DE PRESTATION DE SERVICES — ANNEXE B

Le prestataire s'engage à livrer les livrables selon l'échéancier joint (Annexe C). Tout retard non justifié expose à des pénalités de 0,5 % du montant du contrat par semaine de retard, plafonnées à 10 %.
Les données traitées demeurent propriété du client; le prestataire doit les détruire dans les 30 jours suivant la résiliation.
Juridiction : tribunaux du Québec. Droit applicable : droit québécois.
Signature des deux parties requise; copie numérique certifiée acceptée.`,
            items: [
              {
                id: 'adv-f1',
                question: 'Quelle pénalité est prévue pour un retard ?',
                options: [
                  '0,5 % par semaine, plafond 10 %',
                  '10 % immédiat',
                  'Aucune pénalité',
                  '50 % par jour',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: '0.5 % per week, capped at 10 %.',
              },
              {
                id: 'adv-f2',
                question: 'Que doit faire le prestataire après résiliation ?',
                options: [
                  'Détruire les données sous 30 jours',
                  'Les vendre au client',
                  'Les publier en ligne',
                  'Les conserver indéfiniment',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Data must be destroyed within 30 days.',
              },
              {
                id: 'adv-f3',
                question: 'Quel droit s\'applique au contrat ?',
                options: [
                  'Droit québécois',
                  'Droit américain',
                  'Droit britannique',
                  'Droit international maritime',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Quebec law applies.',
              },
              {
                id: 'adv-f4',
                question: 'Où les litiges seront-ils tranchés ?',
                options: [
                  'Tribunaux du Québec',
                  'Cour suprême du Canada uniquement',
                  'Arbitrage à Paris',
                  'Médiation informelle seulement',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Quebec courts have jurisdiction.',
              },
            ],
          },
          'admin_documents'
        ),
        withTefSection(
          {
            id: 'adv-g',
            passage: `Transition énergétique : entre urgence climatique et réalités économiques

Si l'objectif de neutralité carbone d'ici 2050 fait consensus dans les discours politiques, sa traduction concrète demeure contestée. Les industriels alertent sur le risque de délocalisation si le prix du carbone augmente trop rapidement, tandis que les groupes environnementaux estiment que les annonces gouvernementales manquent d'ambition et de mécanismes de contrôle. Une récente analyse indépendante suggère qu'un mix crédible combinerait subventions ciblées, normes d'efficacité plus strictes et investissements massifs dans le réseau électrique. Sans coordination fédérale-provinciale, plusieurs experts prévoient des écarts régionaux durables dans la décarbonisation.`,
            items: [
              {
                id: 'adv-g1',
                question: 'Quel point de tension central le texte soulève-t-il ?',
                options: [
                  'Objectifs climatiques vs contraintes économiques',
                  'Conflit entre provinces sur la langue',
                  'Manque de personnel en santé',
                  'Crise du logement étudiant',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Article contrasts climate goals with economic realities.',
              },
              {
                id: 'adv-g2',
                question: 'Que craignent les industriels ?',
                options: [
                  'La délocalisation',
                  'Une baisse des taxes',
                  'Trop de subventions',
                  'La fin du commerce international',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Industry warns of relocation risk.',
              },
              {
                id: 'adv-g3',
                question: 'Quelle solution l\'analyse indépendante propose-t-elle ?',
                options: [
                  'Un mix de subventions, normes et investissements',
                  'L\'arrêt total de l\'industrie',
                  'La suppression du réseau électrique',
                  'L\'exportation du pétrole uniquement',
                ],
                correctIndex: 0,
                skillTag: 'compréhension écrite',
                explanation: 'Credible mix of subsidies, standards, grid investment.',
              },
            ],
          },
          'press_article'
        ),
      ],
    },
  ],
};

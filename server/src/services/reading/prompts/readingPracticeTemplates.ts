// @ts-nocheck
import { createHash } from 'node:crypto';

const PRACTICE_BATCHES = [
  [
    {
      id: 'prac-gram-1',
      question: 'Choisissez la forme correcte : « Il faut que vous ___ le formulaire avant vendredi. »',
      options: ['remplissiez', 'remplissez', 'remplir', 'rempli'],
      correctIndex: 0,
      skillTag: 'grammaire',
      explanation: 'After « il faut que », French uses the subjunctive: remplissiez.',
    },
    {
      id: 'prac-voc-1',
      question: 'Dans un courriel professionnel, quel mot remplace le mieux « boss » ?',
      options: ['patron', 'copain', 'frère', 'voisin'],
      correctIndex: 0,
      skillTag: 'vocabulaire',
      explanation: 'Patron is the formal equivalent of boss in professional French.',
    },
    {
      id: 'prac-ce-1',
      question:
        '« Veuillez vous présenter quinze minutes avant l\'heure du rendez-vous. » Que devez-vous faire ?',
      options: [
        'Arriver en avance',
        'Arriver en retard',
        'Annuler le rendez-vous',
        'Appeler le lendemain',
      ],
      correctIndex: 0,
      skillTag: 'compréhension écrite',
      explanation: 'Quinze minutes avant means you should arrive early.',
    },
  ],
  [
    {
      id: 'prac-gram-2',
      question: 'Quelle phrase est correcte au passé composé ?',
      options: [
        'Nous avons reçu votre demande.',
        'Nous avons reçu votre demande hier hier.',
        'Nous recevons votre demande hier.',
        'Nous avons recevoir votre demande.',
      ],
      correctIndex: 0,
      skillTag: 'grammaire',
      explanation: 'Passé composé uses avoir + past participle: avons reçu.',
    },
    {
      id: 'prac-voc-2',
      question: 'Le mot « loyer » correspond à :',
      options: [
        'Le prix mensuel d\'un logement',
        'Un billet de transport',
        'Une taxe scolaire',
        'Un remboursement médical',
      ],
      correctIndex: 0,
      skillTag: 'vocabulaire',
      explanation: 'Loyer is the monthly rent for housing.',
    },
    {
      id: 'prac-ce-2',
      question:
        '« En cas d\'absence, veuillez contacter le service des ressources humaines. » Qui devez-vous appeler ?',
      options: [
        'Les ressources humaines',
        'La police',
        'Le médecin',
        'Le voisin',
      ],
      correctIndex: 0,
      skillTag: 'compréhension écrite',
      explanation: 'The notice directs you to human resources.',
    },
  ],
  [
    {
      id: 'prac-gram-3',
      question: 'Complétez : « Si j\'avais su, je ___ plus tôt. »',
      options: ['serais venu', 'viens', 'viendrai', 'venais'],
      correctIndex: 0,
      skillTag: 'grammaire',
      explanation: 'Hypothesis in the past uses the conditional perfect: serais venu.',
    },
    {
      id: 'prac-voc-3',
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
    {
      id: 'prac-ce-3',
      question:
        '« Le guichet ferme à 16 h 30. » À quelle heure le service n\'est-il plus disponible ?',
      options: ['16 h 30', '16 h 00', '17 h 30', '15 h 30'],
      correctIndex: 0,
      skillTag: 'compréhension écrite',
      explanation: 'Fermer à 16 h 30 means service stops at that time.',
    },
  ],
  [
    {
      id: 'prac-gram-4',
      question: 'Quelle option respecte l\'accord du participe passé avec « être » ?',
      options: [
        'Elles sont arrivées hier.',
        'Elles sont arrivé hier.',
        'Elles ont arrivées hier.',
        'Elles est arrivées hier.',
      ],
      correctIndex: 0,
      skillTag: 'grammaire',
      explanation: 'With être, the past participle agrees: elles sont arrivées.',
    },
    {
      id: 'prac-voc-4',
      question: 'Le terme « assurance maladie » désigne :',
      options: [
        'Une couverture pour les soins de santé',
        'Un permis de conduire',
        'Un contrat de location',
        'Un examen scolaire',
      ],
      correctIndex: 0,
      skillTag: 'vocabulaire',
      explanation: 'Assurance maladie covers health care costs.',
    },
    {
      id: 'prac-ce-4',
      question:
        '« Merci de joindre une copie de votre relevé bancaire. » Quel document faut-il fournir ?',
      options: [
        'Un relevé bancaire',
        'Un passeport',
        'Une photo d\'identité',
        'Un certificat médical',
      ],
      correctIndex: 0,
      skillTag: 'compréhension écrite',
      explanation: 'Joindre un relevé bancaire means attach a bank statement.',
    },
  ],
];

function pickBatchIndex(seed: string, batchCount: number) {
  if (!batchCount) return 0;
  const hash = createHash('sha256').update(seed).digest();
  return hash[0] % batchCount;
}

export function pickReadingPracticeTemplate(
  seed = '',
  count = 3
): typeof PRACTICE_BATCHES[number] {
  const batchIndex = pickBatchIndex(seed || String(Date.now()), PRACTICE_BATCHES.length);
  const batch = PRACTICE_BATCHES[batchIndex] ?? PRACTICE_BATCHES[0];
  const size = Math.min(Math.max(Number(count) || 3, 1), batch.length);
  return batch.slice(0, size);
}

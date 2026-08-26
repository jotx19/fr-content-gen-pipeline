import { createHash } from 'node:crypto';
import { shuffleMcqOptions } from '../../../content-pipeline/subagents/shared/reading.normalize.js';
import type { ReadingMcqItem } from './readingPractice.types.js';

type PlacementQuestion = ReadingMcqItem & { register: string };

/** Static TEF placement MCQs — used when OpenRouter credits are low or TEF_READING_USE_TEMPLATES=true */
const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'place-1',
    question: 'Choisissez la forme correcte : « Hier, nous ___ au marché. »',
    options: ['sommes allés', 'allons', 'irons', 'allions'],
    correctIndex: 0,
    skillTag: 'grammaire',
    explanation: 'Hier signals past tense — passé composé with être: sommes allés.',
    register: 'neutre',
  },
  {
    id: 'place-2',
    question: 'Dans un formulaire administratif, « date de naissance » signifie :',
    options: [
      'Le jour où vous êtes né(e)',
      'Votre adresse actuelle',
      'Votre numéro de téléphone',
      'Votre profession',
    ],
    correctIndex: 0,
    skillTag: 'vocabulaire',
    explanation: 'Date de naissance is your birth date.',
    register: 'formel',
  },
  {
    id: 'place-3',
    question:
      '« Le train partira avec cinq minutes de retard. » Qu\'est-ce qui est annoncé ?',
    options: [
      'Un léger retard du train',
      'L\'annulation du train',
      'Un changement de quai',
      'Une grève',
    ],
    correctIndex: 0,
    skillTag: 'compréhension orale',
    explanation: 'Cinq minutes de retard means a short delay.',
    register: 'formel',
  },
  {
    id: 'place-4',
    question:
      '« Merci de joindre une pièce d\'identité valide à votre dossier. » Quel document faut-il fournir ?',
    options: [
      'Une pièce d\'identité officielle',
      'Un relevé de notes',
      'Une facture d\'électricité seulement',
      'Un certificat médical',
    ],
    correctIndex: 0,
    skillTag: 'compréhension écrite',
    explanation: 'Pièce d\'identité valide means a valid ID document.',
    register: 'formel',
  },
  {
    id: 'place-5',
    question: 'Quelle phrase convient pour commencer une lettre formelle ?',
    options: [
      'Madame, Monsieur,',
      'Salut tout le monde,',
      'Yo,',
      'Coucou,',
    ],
    correctIndex: 0,
    skillTag: 'expression écrite',
    explanation: 'Madame, Monsieur is the standard formal opening.',
    register: 'formel',
  },
  {
    id: 'place-6',
    question:
      'Lors d\'un entretien, on vous demande « Pouvez-vous vous présenter brièvement ? » Que devez-vous faire ?',
    options: [
      'Dire qui vous êtes en quelques phrases',
      'Parler uniquement de vos loisirs',
      'Demander le salaire immédiatement',
      'Refuser de répondre',
    ],
    correctIndex: 0,
    skillTag: 'expression orale',
    explanation: 'Se présenter brièvement means a short personal introduction.',
    register: 'formel',
  },
];

function pickStartIndex(seed: string, length: number) {
  if (!length) return 0;
  const hash = createHash('sha256').update(seed).digest();
  return hash[0] % length;
}

export function pickPlacementTemplate(seed = '', count = 5): ReadingMcqItem[] {
  const size = Math.min(Math.max(Number(count) || 5, 5), PLACEMENT_QUESTIONS.length);
  const start = pickStartIndex(seed || String(Date.now()), PLACEMENT_QUESTIONS.length);
  const questions: ReadingMcqItem[] = [];

  for (let i = 0; i < size; i += 1) {
    questions.push(
      shuffleMcqOptions({
        ...PLACEMENT_QUESTIONS[(start + i) % PLACEMENT_QUESTIONS.length],
      })
    );
  }

  return questions;
}

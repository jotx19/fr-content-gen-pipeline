// @ts-nocheck
import { createHash } from 'crypto';
import { applyFullParagraphPrompt } from '../fillBlankFromParagraph.js';
import {
  applySectionWordLimits,
  tefWritingSectionConfig,
  type TefWritingSectionKey,
} from '../../../content-pipeline/subagents/writing/tefWritingSections.js';

function templateId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

/** A1: one complete paragraph → blanks derived at serve time (never stored pre-filled). */
export const A1_FILL_BLANK_TEMPLATES = [
  {
    id: templateId('a1', 0),
    title: 'Réponse à une invitation',
    instructions: 'Complétez les mots manquants dans le message (1 ou 2 mots par trou).',
    context:
      'Sophie et Marc vous invitent à fêter leurs 5 ans de mariage samedi à 19 h, tenue semi-formelle.',
    fullParagraph:
      "Bonjour Sophie et Marc! Merci pour l'invitation. Je confirme ma présence. Je peux venir samedi. J'arrive à 19 heures. Pour la tenue, je porte une robe élégante. Merci, Pierre",
    blankTargets: [
      { id: '1', text: 'confirme', hint: 'verbe confirmer', acceptableAnswers: ['confirme', 'confirmer'] },
      { id: '2', text: 'peux', hint: 'verbe pouvoir', acceptableAnswers: ['peux', 'pourrai', 'peut'] },
      { id: '3', text: 'à', hint: 'préposition', acceptableAnswers: ['à', 'a'] },
      { id: '4', text: 'porte', hint: 'verbe porter', acceptableAnswers: ['porte', 'porterai', 'porter'] },
      { id: '5', text: 'Merci', hint: 'formule de politesse', acceptableAnswers: ['merci', 'à bientôt', 'cordialement'] },
    ],
    topic: 'invitation response',
  },
  {
    id: templateId('a1', 1),
    title: 'Message à un collègue',
    instructions: 'Complétez les mots manquants dans votre réponse courte.',
    context: 'Ahmed vous propose un déjeuner demain à midi au café du coin.',
    fullParagraph:
      'Salut Ahmed! Oui, je suis libre demain. On se retrouve à midi devant le café. À demain, Léa',
    blankTargets: [
      { id: '1', text: 'suis', hint: 'verbe être', acceptableAnswers: ['suis', 'serai'] },
      { id: '2', text: 'se retrouve', hint: 'verbe se retrouver', acceptableAnswers: ['se retrouve', 'se rejoint', 'se voit'] },
      { id: '3', text: 'midi', hint: 'heure', acceptableAnswers: ['midi', '12h', 'douze heures'] },
      { id: '4', text: 'À demain', hint: 'salutation', acceptableAnswers: ['à demain', 'a demain', 'à plus'] },
    ],
    topic: 'colleague lunch',
  },
  {
    id: templateId('a1', 2),
    title: 'Réserver une chambre',
    instructions: 'Complétez l\'e-mail avec 1 ou 2 mots par trou.',
    context: 'L\'hôtel Bon Séjour vous demande un court e-mail de confirmation.',
    fullParagraph:
      "Bonjour, je voudrais réserver une chambre double du 10 au 12 juin. Merci beaucoup, Nina",
    blankTargets: [
      { id: '1', text: 'voudrais', hint: 'verbe vouloir', acceptableAnswers: ['voudrais', 'veux', 'souhaite'] },
      { id: '2', text: 'double', hint: 'type de chambre', acceptableAnswers: ['double', 'simple', 'twin'] },
      { id: '3', text: 'au', hint: 'préposition', acceptableAnswers: ['au', "jusqu'au", 'à'] },
      { id: '4', text: 'beaucoup', hint: 'formule', acceptableAnswers: ['beaucoup', "d'avance", 'cordialement'] },
    ],
    topic: 'hotel booking',
  },
  {
    id: templateId('a1', 3),
    title: 'Chez le médecin',
    instructions: 'Complétez les mots manquants dans le message.',
    context: 'Vous écrivez un message pour confirmer votre rendez-vous médical.',
    fullParagraph:
      "Bonjour, je confirme mon rendez-vous mardi à 14 heures. J'ai une question sur les documents à apporter. Merci, Karim",
    blankTargets: [
      { id: '1', text: 'confirme', hint: 'verbe confirmer', acceptableAnswers: ['confirme', 'confirmer'] },
      { id: '2', text: 'mardi', hint: 'jour', acceptableAnswers: ['mardi', 'lundi', 'mercredi'] },
      { id: '3', text: 'à', hint: 'préposition', acceptableAnswers: ['à', 'a'] },
      { id: '4', text: 'apporter', hint: 'verbe apporter', acceptableAnswers: ['apporter', 'amener', 'présenter'] },
    ],
    topic: 'medical appointment',
  },
];

export const A2_SENTENCE_TEMPLATES = [
  {
    id: templateId('a2-sent', 0),
    title: 'Ma journée typique',
    instructions: 'Écrivez une phrase complète pour chaque question (4 à 18 mots).',
    prompt: 'Parlez de votre routine quotidienne en français simple.',
    sentencePrompts: [
      { id: '1', prompt: 'À quelle heure vous levez-vous?', minWords: 4, maxWords: 15 },
      { id: '2', prompt: 'Qu\'est-ce que vous mangez au petit-déjeuner?', minWords: 4, maxWords: 18 },
      { id: '3', prompt: 'Comment allez-vous au travail ou à l\'école?', minWords: 5, maxWords: 18 },
      { id: '4', prompt: 'Qu\'est-ce que vous faites le soir?', minWords: 4, maxWords: 18 },
    ],
    topic: 'daily routine',
  },
  {
    id: templateId('a2-sent', 1),
    title: 'Ma famille',
    instructions: 'Répondez en une phrase par question.',
    prompt: 'Décrivez votre famille avec des phrases courtes.',
    sentencePrompts: [
      { id: '1', prompt: 'Combien de personnes il y a dans votre famille?', minWords: 4, maxWords: 15 },
      { id: '2', prompt: 'Qui habite avec vous?', minWords: 4, maxWords: 18 },
      { id: '3', prompt: 'Qu\'est-ce que votre mère ou père aime faire?', minWords: 5, maxWords: 18 },
      { id: '4', prompt: 'Qu\'est-ce que vous faites ensemble le week-end?', minWords: 5, maxWords: 18 },
    ],
    topic: 'family',
  },
  {
    id: templateId('a2-sent', 2),
    title: 'Mes préférences',
    instructions: 'Une phrase par item — vocabulaire A2.',
    prompt: 'Exprimez vos goûts et préférences.',
    sentencePrompts: [
      { id: '1', prompt: 'Quelle est votre saison préférée? Pourquoi?', minWords: 5, maxWords: 18 },
      { id: '2', prompt: 'Qu\'est-ce que vous aimez manger?', minWords: 4, maxWords: 15 },
      { id: '3', prompt: 'Qu\'est-ce que vous n\'aimez pas faire?', minWords: 4, maxWords: 18 },
      { id: '4', prompt: 'Où aimez-vous voyager?', minWords: 4, maxWords: 15 },
    ],
    topic: 'preferences',
  },
];

/** B1+ Section A — no LLM required (works when OpenRouter credits are low). */
export const SECTION_A_FULL_TEMPLATES = [
  {
    id: templateId('sec-a', 0),
    title: 'Invitation à une fête',
    instructions:
      'Rédigez un message de réponse à cette invitation. Confirmez votre présence et posez une question pratique (80–120 mots).',
    prompt:
      'Votre amie Clara vous invite à fêter son anniversaire samedi prochain à 19 h chez elle. Vous acceptez avec plaisir et souhaitez savoir ce que vous pouvez apporter.',
    taskType: 'message',
    register: 'neutre',
    topic: 'birthday invitation',
  },
  {
    id: templateId('sec-a', 1),
    title: 'Continuer une histoire',
    instructions:
      'Continuez ce récit en décrivant ce qui se passe ensuite et ce que le personnage ressent (80–120 mots).',
    prompt:
      'Marc sort de la gare et découvre que son téléphone n\'a plus de batterie. Il doit retrouver son ami dans un quartier qu\'il ne connaît pas.',
    taskType: 'letter',
    register: 'neutre',
    topic: 'story continuation',
  },
  {
    id: templateId('sec-a', 2),
    title: 'Réaction à une annonce',
    instructions:
      'Écrivez un court courriel pour obtenir des renseignements sur cette annonce (80–120 mots).',
    prompt:
      'Vous avez vu une annonce pour des cours de français du soir dans votre quartier. Écrivez à l\'organisme pour demander les horaires, le prix et le niveau requis.',
    taskType: 'email',
    register: 'neutre',
    topic: 'course inquiry',
  },
];

/** B1+ Section B — opinion / argumentative tasks. */
export const SECTION_B_FULL_TEMPLATES = [
  {
    id: templateId('sec-b', 0),
    title: 'Le télétravail',
    instructions:
      'Rédigez un texte argumenté pour ou contre le télétravail régulier (200–280 mots). Structurez votre réponse (introduction, arguments, conclusion).',
    prompt:
      'De plus en plus de travailleurs télétravaillent plusieurs jours par semaine. Selon vous, est-ce une évolution positive ou négative pour la société? Justifiez votre opinion.',
    taskType: 'essay',
    register: 'formel',
    topic: 'remote work',
  },
  {
    id: templateId('sec-b', 1),
    title: 'Réseaux sociaux et jeunes',
    instructions:
      'Exprimez et défendez votre point de vue sur l\'influence des réseaux sociaux (200–280 mots).',
    prompt:
      'Les réseaux sociaux occupent une place centrale dans la vie des jeunes. Pensez-vous qu\'ils ont plutôt un effet bénéfique ou nocif? Appuyez votre réponse avec des exemples.',
    taskType: 'article',
    register: 'formel',
    topic: 'social media',
  },
  {
    id: templateId('sec-b', 2),
    title: 'Transports en commun gratuits',
    instructions:
      'Rédigez un texte formel présentant les avantages et les limites d\'une politique de transport gratuit en ville (200–280 mots).',
    prompt:
      'Certaines villes envisagent de rendre les transports en commun gratuits pour tous. Soutenez-vous cette mesure? Expliquez votre position de manière structurée.',
    taskType: 'essay',
    register: 'formel',
    topic: 'public transit',
  },
];

function pickIndex(templates: unknown[], seed: string) {
  if (!templates.length) return 0;
  const hash = createHash('sha256').update(seed).digest();
  return hash[0] % templates.length;
}

export function pickFillBlankTemplate(seed = '', previousTemplateId?: string | null) {
  let index = pickIndex(A1_FILL_BLANK_TEMPLATES, seed || String(Date.now()));

  if (previousTemplateId && A1_FILL_BLANK_TEMPLATES.length > 1) {
    const prevIndex = A1_FILL_BLANK_TEMPLATES.findIndex((t) =>
      String(previousTemplateId).startsWith(t.id)
    );
    if (prevIndex >= 0 && index === prevIndex) {
      index = (prevIndex + 1) % A1_FILL_BLANK_TEMPLATES.length;
    }
  }

  const base = A1_FILL_BLANK_TEMPLATES[index];
  const built = applyFullParagraphPrompt({
    ...base,
    prompt: base.context,
    id: `${base.id}-${Date.now().toString(36)}`,
    level: 'A1',
    taskMode: 'fill_blanks',
    taskType: 'fill_blanks',
    register: 'neutre',
    minWords: 0,
    maxWords: 0,
  });

  return built;
}

export function pickSentenceTemplate(seed = '', previousTemplateId?: string | null) {
  let index = pickIndex(A2_SENTENCE_TEMPLATES, seed || String(Date.now()));

  if (previousTemplateId && A2_SENTENCE_TEMPLATES.length > 1) {
    const prevIndex = A2_SENTENCE_TEMPLATES.findIndex((t) =>
      previousTemplateId.startsWith(t.id)
    );
    if (prevIndex >= 0 && index === prevIndex) {
      index = (prevIndex + 1) % A2_SENTENCE_TEMPLATES.length;
    }
  }

  const base = A2_SENTENCE_TEMPLATES[index];
  return {
    ...base,
    id: `${base.id}-${Date.now().toString(36)}`,
    level: 'A2',
    taskMode: 'sentences',
    taskType: 'sentences',
    register: 'neutre',
    minWords: 0,
    maxWords: 0,
  };
}

function pickFromPool(
  pool: { id: string }[],
  seed: string,
  previousTemplateId?: string | null
) {
  let index = pickIndex(pool, seed || String(Date.now()));

  if (previousTemplateId && pool.length > 1) {
    const prevIndex = pool.findIndex((t) => String(previousTemplateId).startsWith(t.id));
    if (prevIndex >= 0 && index === prevIndex) {
      index = (prevIndex + 1) % pool.length;
    }
  }

  return pool[index];
}

export function pickFullWritingTemplate(
  section: TefWritingSectionKey,
  level: string,
  seed = '',
  previousTemplateId?: string | null
) {
  const pool = section === 'B' ? SECTION_B_FULL_TEMPLATES : SECTION_A_FULL_TEMPLATES;
  const base = pickFromPool(pool, seed, previousTemplateId);
  const built = {
    ...base,
    id: `${base.id}-${Date.now().toString(36)}`,
    level,
    taskMode: 'full',
    examSection: section,
    register: base.register ?? (section === 'B' ? 'formel' : 'neutre'),
    minWords: tefWritingSectionConfig(section).minWords,
    maxWords: tefWritingSectionConfig(section).maxWords,
  };
  return applySectionWordLimits(built, section);
}

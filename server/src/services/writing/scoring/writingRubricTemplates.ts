// @ts-nocheck

/** Formal register markers — TEF Section A/B letters & essays */
export const FORMAL_OPENERS = [
  'madame',
  'monsieur',
  'madame, monsieur',
  'mesdames',
  'messieurs',
  'cher',
  'chère',
  'objet',
];

export const FORMAL_CLOSINGS = [
  'cordialement',
  'salutations distinguées',
  'salutations respectueuses',
  'veuillez agréer',
  'je vous prie',
  'dans l\'attente',
  'bien à vous',
  'respectueusement',
];

export const CONNECTORS_BY_LEVEL: Record<string, string[]> = {
  A1: ['et', 'mais', 'parce que', 'aussi'],
  A2: ['et', 'mais', 'parce que', 'donc', 'puis', 'ensuite', 'alors'],
  B1: [
    'cependant',
    'en effet',
    'de plus',
    'par conséquent',
    'toutefois',
    'en revanche',
    'd\'abord',
    'ensuite',
    'enfin',
  ],
  B2: [
    'cependant',
    'en effet',
    'de plus',
    'par conséquent',
    'toutefois',
    'en revanche',
    'néanmoins',
    'par ailleurs',
    'en outre',
    'dès lors',
    'afin de',
    'bien que',
  ],
  C1: [
    'néanmoins',
    'en outre',
    'par conséquent',
    'dès lors',
    'afin que',
    'quoique',
    'certes',
    'en définitive',
    'force est de constater',
  ],
  C2: [
    'néanmoins',
    'en définitive',
    'force est de constater',
    'il convient de',
    'en amont de',
    'dans la mesure où',
  ],
};

export const DISCOURSE_MARKERS = [
  'premièrement',
  'deuxièmement',
  'en conclusion',
  'pour conclure',
  'en somme',
  'finalement',
  'd\'un côté',
  'd\'autre part',
  'introduction',
  'conclusion',
];

export const FRENCH_STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais', 'donc',
  'or', 'ni', 'car', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
  'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre',
  'leur', 'leurs', 'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'dont', 'où',
  'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'en', 'au', 'aux',
  'est', 'sont', 'être', 'avoir', 'a', 'ai', 'as', 'ont', 'été', 'très', 'plus',
  'moins', 'ne', 'pas', 'se', 'si', 'y', 'à', 'l', 'd', 'n', 's', 'c', 'm', 't',
]);

/** Task-type expectations for task_fulfillment template checks */
export const TASK_TYPE_MARKERS: Record<string, { required: string[]; optional: string[] }> = {
  letter: {
    required: ['madame', 'monsieur', 'cordialement', 'je vous', 'objet'],
    optional: ['veuillez', 'salutations', 'dans l\'attente'],
  },
  email: {
    required: ['bonjour', 'cordialement', 'merci'],
    optional: ['objet', 'madame', 'monsieur'],
  },
  message: {
    required: ['bonjour', 'merci'],
    optional: ['salut', 'cordialement'],
  },
  essay: {
    required: ['en effet', 'cependant', 'par conséquent', 'conclusion', 'en conclusion'],
    optional: ['premièrement', 'd\'un côté', 'néanmoins'],
  },
  article: {
    required: ['en effet', 'cependant', 'par ailleurs'],
    optional: ['introduction', 'conclusion'],
  },
};

export const LEVEL_MIN_CONNECTORS: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 2,
  B2: 3,
  C1: 4,
  C2: 4,
};

export const LEVEL_MIN_DIVERSITY: Record<string, number> = {
  A1: 0.45,
  A2: 0.48,
  B1: 0.52,
  B2: 0.55,
  C1: 0.58,
  C2: 0.6,
};

/** Opinion / argument markers — Section B essays */
export const OPINION_MARKERS = [
  'je pense',
  'à mon avis',
  'il me semble',
  'selon moi',
  'je crois',
  'je considère',
  'de mon point de vue',
  'en effet',
  'certes',
  'toutefois',
];

/** Subordinate-clause markers — syntactic complexity */
export const COMPLEXITY_MARKERS = [
  ' qui ',
  ' que ',
  ' dont ',
  ' où ',
  ' lorsque ',
  ' puisque ',
  ' bien que ',
  ' quoique ',
  ' afin que ',
  ' pendant que ',
];

/** B2+ sophistication signals */
export const ADVANCED_VOCAB_MARKERS = [
  'néanmoins',
  'par conséquent',
  'en revanche',
  'dès lors',
  'toutefois',
  'en outre',
  'd\'autre part',
  'force est de',
  'il convient',
  'solliciter',
  'conformément',
  'demeurer',
  'excessif',
];

/** Common learner / transfer errors (regex source, penalty weight, message) */
export const GRAMMAR_PATTERNS: { pattern: RegExp; weight: number; message: string }[] = [
  { pattern: /\bje suis (aller|allé|venu|parti|retourné)\b/gi, weight: 10, message: 'Check auxiliary verbs (être/avoir) with past participles.' },
  { pattern: /\bj'ai (aller|allé)\b/gi, weight: 10, message: 'Use “je suis allé(e)” not “j’ai aller/allé”.' },
  { pattern: /\bplus (bon|mauvais|petit|grand)\b/gi, weight: 8, message: 'Prefer “meilleur/pire/plus petit/plus grand” over “plus bon/mauvais”.' },
  { pattern: /\bje a\b/gi, weight: 6, message: 'Use elision: “j’ai”, “j’adore”, etc.' },
  { pattern: /\b(le|la) (maison|voiture|problème|service) (est|a)\b/gi, weight: 4, message: 'Review article–noun gender agreement.' },
  { pattern: /\b(beaucoup des|beaucoup de le)\b/gi, weight: 8, message: 'Use “beaucoup de” + noun (no article).' },
  { pattern: /\b\d+\s*(words|word|mots)\b/gi, weight: 5, message: 'Avoid English meta-commentary inside a French response.' },
];

/** Anglicisms often seen in learner French */
export const ANGLICISM_MARKERS = [
  'actually',
  'however',
  'because',
  'something',
  'people',
  'weekend',
  'shopping',
  'email',
];

/** Action verbs for complaint/request letter tasks */
export const REQUEST_MARKERS = [
  'je souhaite',
  'je demande',
  'je vous prie',
  'merci de',
  'pourriez-vous',
  'je sollicite',
  'j\'aimerais',
  'veuillez',
];

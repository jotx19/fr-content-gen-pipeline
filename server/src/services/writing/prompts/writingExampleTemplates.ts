// @ts-nocheck
import {
  composeFillBlankSubmission,
} from '../scoring/fillBlankScore.js';
import {
  ensureFillBlankPrompt,
  exampleAnswersFromPrompt,
} from '../normalizeFillBlankPrompt.js';

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Match prompt ids like sec-a-2-m5abc or a2-sent-1-xyz */
function extractTemplateBaseId(id: string) {
  const match = String(id).match(/^(sec-[ab]-\d+|a2-sent-\d+)/);
  return match?.[1] ?? '';
}

const SENTENCE_ANSWERS_BY_ID: Record<string, string[]> = {
  'a2-sent-1': [
    'Je me lève à sept heures tous les matins.',
    'Au petit-déjeuner, je mange du pain, du fromage et un fruit.',
    'Je vais au travail en métro parce que c\'est plus rapide.',
    'Le soir, je prépare le dîner et je regarde une série.',
  ],
  'a2-sent-2': [
    'Il y a quatre personnes dans ma famille.',
    'J\'habite avec mes parents et ma sœur.',
    'Mon père aime lire et faire du vélo le week-end.',
    'Nous visitons souvent mes grands-parents le dimanche.',
  ],
  'a2-sent-3': [
    'Mon saison préférée est l\'été parce qu\'il fait chaud.',
    'J\'aime manger des pâtes, du poisson et des légumes.',
    'Je n\'aime pas me lever très tôt le matin.',
    'J\'aime voyager au Canada et en France.',
  ],
};

const SENTENCE_DEFAULT_ANSWERS = SENTENCE_ANSWERS_BY_ID['a2-sent-1'];

/** Keys align with writingPromptTemplates ids: sec-a-1, sec-a-2, sec-b-1, … */
const FULL_EXAMPLE_BY_ID: Record<string, { exampleAnswer: string; notes: string }> = {
  'sec-a-1': {
    exampleAnswer: `Bonjour Clara,

Merci beaucoup pour ton invitation! J'accepte avec plaisir de venir fêter ton anniversaire samedi à 19 h. Je serai là à l'heure et j'ai hâte de te revoir ainsi que les autres amis. Peux-tu me dire si tu préfères que j'apporte un dessert ou des boissons? Dis-moi aussi s'il y a un thème particulier pour la soirée ou un code vestimentaire à respecter. Si tu as besoin d'aide pour préparer la salle, je peux arriver un peu plus tôt. Encore merci pour cette belle nouvelle, et à samedi!

Amicalement,
Léa`,
    notes: 'Short message with greeting, acceptance, a practical question, and a friendly closing — typical Section A structure.',
  },
  'sec-a-2': {
    exampleAnswer: `Marc regarda la rue inconnue, puis la petite carte accrochée près de la sortie de la gare. Son téléphone était complètement éteint, mais il se souvint soudain du café que son ami Julien avait mentionné la veille. Il décida de marcher lentement le long de l'avenue, en observant les enseignes et en demandant son chemin à une passante. Quelques minutes plus tard, il aperçut enfin la devanture familière. Il entra, commanda un thé et expliqua sa situation au serveur. Julien arriva bientôt après, un peu essoufflé mais souriant. Marc ressentit un grand soulagement: la rencontre pouvait commencer, même sans batterie ni GPS.`,
    notes: 'Continues the narrative with clear sequencing (d\'abord, puis, enfin) and describes feelings as well as actions.',
  },
  'sec-a-3': {
    exampleAnswer: `Bonjour,

Je me permets de vous contacter au sujet de vos cours de français du soir, dont j'ai pris connaissance dans une annonce affichée dans mon quartier. Je suis très intéressé par ce programme, car je travaille en journée et je souhaite améliorer mon expression écrite pour des raisons professionnelles. Pourriez-vous m'indiquer les horaires exacts des séances, le tarif mensuel et le niveau requis pour m'inscrire? Je suis disponible en semaine après 18 h et je peux commencer dès le mois prochain. Je vous remercie par avance pour votre réponse et reste à votre disposition pour tout renseignement complémentaire.

Cordialement,
Karim`,
    notes: 'Formal email tone with a clear purpose, two information requests, and polite closings.',
  },
  'sec-b-1': {
    exampleAnswer: `Le télétravail s'est imposé dans de nombreux secteurs depuis plusieurs années, surtout après la généralisation des outils numériques et l'accélération des transformations organisationnelles. À mon avis, cette évolution présente surtout des avantages, même si elle comporte certaines limites qu'il faut reconnaître avec lucidité.

D'un côté, travailler régulièrement de chez soi permet de gagner du temps en évitant les transports quotidiens et d'organiser sa journée avec plus de souplesse. De nombreux employés déclarent être plus concentrés loin du bruit du bureau, ce qui peut améliorer la productivité sur des tâches individuelles. Enfin, cette formule peut réduire la pollution liée aux déplacements et offrir un meilleur équilibre entre vie professionnelle et vie personnelle pour certaines familles, notamment celles qui habitent loin de leur lieu de travail.

Cependant, le télétravail peut aussi isoler les travailleurs, compliquer la communication d'équipe et rendre la frontière entre travail et repos plus floue. Sans encadrement clair, certains employés risquent de travailler plus longtemps, de manquer de reconnaissance ou de perdre le sentiment d'appartenance à leur entreprise.

En conclusion, je considère le télétravail comme une évolution positive à condition qu'il soit encadré par des règles précises, des outils adaptés et des rencontres régulières en présentiel pour maintenir le lien social, la créativité collective et la cohésion des équipes.`,
    notes: 'Section B structure: thesis, arguments for/against, and a conclusion with a clear opinion.',
  },
  'sec-b-2': {
    exampleAnswer: `Les réseaux sociaux occupent aujourd'hui une place centrale dans la vie des jeunes, influençant leurs relations, leurs loisirs, leurs opinions et parfois leur rapport à eux-mêmes. Selon moi, leur influence est à la fois bénéfique et risquée, selon la manière dont on les utilise, le temps qu'on y consacre et la qualité des contenus que l'on consulte.

Sur le plan positif, ces plateformes permettent de rester en contact avec des amis éloignés, de découvrir des contenus éducatifs et de s'exprimer sur des sujets importants. Elles peuvent aussi favoriser la solidarité lors d'événements collectifs, faciliter l'accès à l'information et donner une voix à des causes qui resteraient autrement peu visibles dans les médias traditionnels.

Néanmoins, une utilisation excessive peut nuire à la concentration, à l'estime de soi et au sommeil, surtout lorsque les jeunes comparent constamment leur vie à celle des autres ou lorsqu'ils sont exposés à des contenus anxiogènes. De plus, la désinformation se propage rapidement en ligne, ce qui rend nécessaire un esprit critique, une éducation aux médias et une vigilance constante face aux sources.

Pour cette raison, je pense que les réseaux sociaux peuvent être utiles si les jeunes apprennent à limiter leur temps d'écran, à vérifier les sources et à privilégier des échanges de qualité plutôt que la recherche de validation permanente. L'accompagnement des parents, des enseignants et des écoles reste essentiel pour développer une utilisation responsable et équilibrée.`,
    notes: 'Balanced argument with concrete examples and a nuanced final position.',
  },
  'sec-b-3': {
    exampleAnswer: `La gratuité des transports en commun divise de plus en plus les municipalités, notamment dans les grandes villes où la mobilité représente un enjeu social, économique et environnemental majeur. Personnellement, je soutiens cette idée dans certaines conditions, mais seulement si elle s'accompagne d'un financement durable, d'une offre de service suffisante et d'une planification à long terme.

D'abord, rendre les transports gratuits améliorerait l'accessibilité pour les étudiants, les aînés et les ménages modestes, qui consacrent parfois une part importante de leur budget aux déplacements. Cette mesure pourrait aussi diminuer le trafic automobile, réduire les embouteillages et améliorer la qualité de l'air en ville, ce qui profiterait à l'ensemble de la population et contribuerait aux objectifs de développement durable.

Toutefois, la gratuité totale risque de surcharger le réseau aux heures de pointe et de réduire les ressources disponibles pour l'entretien, la sécurité, la modernisation des véhicules et le développement de nouvelles lignes. Sans planification rigoureuse, la qualité du service pourrait se dégrader, provoquer de la frustration chez les usagers et décourager certains citoyens de choisir les transports collectifs.

En définitive, je suis favorable à une gratuité ciblée ou progressive plutôt qu'à une suppression immédiate des tarifs pour tous. L'objectif doit rester la mobilité durable, équitable, fiable et financièrement viable sur le long terme, au service de l'intérêt général.`,
    notes: 'Presents advantages, limits, and a qualified policy recommendation suitable for Section B.',
  },
};

function resolveFullExampleKey(prompt: Record<string, unknown>) {
  const baseId = extractTemplateBaseId(String(prompt.id ?? ''));
  if (baseId && FULL_EXAMPLE_BY_ID[baseId]) return baseId;
  return String(prompt.examSection ?? 'A') === 'B' ? 'sec-b-1' : 'sec-a-1';
}

function resolveSentenceAnswers(prompt: Record<string, unknown>) {
  const baseId = extractTemplateBaseId(String(prompt.id ?? ''));
  if (baseId && SENTENCE_ANSWERS_BY_ID[baseId]) {
    return SENTENCE_ANSWERS_BY_ID[baseId];
  }
  return SENTENCE_DEFAULT_ANSWERS;
}

export function buildStaticWritingExample(prompt: Record<string, unknown>) {
  const taskMode = String(prompt.taskMode ?? 'full');

  if (taskMode === 'fill_blanks') {
    const fullPrompt = ensureFillBlankPrompt(prompt);
    const blankAnswers = exampleAnswersFromPrompt(fullPrompt);
    const exampleAnswer = composeFillBlankSubmission(
      (fullPrompt.paragraphParts as { type: string; value?: string; id?: string }[]) ?? [],
      blankAnswers
    );

    return {
      exampleAnswer,
      blankAnswers,
      wordCount: countWords(Object.values(blankAnswers).join(' ')),
      notes:
        'Each blank uses a common A1 word form. Copy the pattern: short answers, correct verb tense, simple politeness.',
    };
  }

  if (taskMode === 'sentences') {
    const rows = (prompt.sentencePrompts as { id: string; prompt: string }[]) ?? [];
    const answers = resolveSentenceAnswers(prompt);
    const sentenceAnswers = Object.fromEntries(
      rows.map((row, index) => [row.id, answers[index % answers.length]])
    );
    const exampleAnswer = rows
      .map((row, index) => `${index + 1}. ${row.prompt}\n→ ${sentenceAnswers[row.id]}`)
      .join('\n\n');

    return {
      exampleAnswer,
      sentenceAnswers,
      wordCount: countWords(Object.values(sentenceAnswers).join(' ')),
      notes:
        'Each line is one complete sentence within the word range — match this pattern at A2 level.',
    };
  }

  const key = resolveFullExampleKey(prompt);
  const match = FULL_EXAMPLE_BY_ID[key] ?? FULL_EXAMPLE_BY_ID['sec-a-1'];
  return {
    exampleAnswer: match.exampleAnswer,
    wordCount: countWords(match.exampleAnswer),
    notes: match.notes,
  };
}

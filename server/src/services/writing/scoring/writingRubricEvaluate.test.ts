// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateWritingWithRubric } from './writingRubricEvaluate.js';

const basePrompt = {
  id: 'p1',
  title: 'Lettre de réclamation',
  instructions: 'Rédigez une lettre formelle pour demander un remboursement.',
  prompt: 'Vous avez acheté un produit défectueux. Écrivez au service client pour demander un remboursement.',
  taskMode: 'full',
  taskType: 'letter',
  register: 'formel',
  examSection: 'B',
  level: 'B2',
  topic: 'consommation',
  minWords: 200,
  maxWords: 280,
};

const strongText = `Madame, Monsieur,

Je me permets de vous contacter suite à l'achat d'un aspirateur robot réalisé le 12 mars sur votre site. Dès la première utilisation, l'appareil s'est arrêté de manière inattendue et n'a jamais pu achever un cycle complet.

En effet, le moteur semble défectueux et le service après-vente n'a pas répondu à mes relances. Par conséquent, je sollicite un remboursement intégral conformément à la garantie légale.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Jean Dupont`;

const weakText = 'bonjour bonjour bonjour je veux remboursement produit mauvais mauvais mauvais merci merci merci';

function padToRange(text: string, min = 210) {
  let out = text;
  while (out.split(/\s+/).filter(Boolean).length < min) {
    out += ` ${text}`;
  }
  return out;
}

describe('evaluateWritingWithRubric', () => {
  it('scores strong formal text higher than weak repetitive text', () => {
    const strong = padToRange(strongText);
    const weak = padToRange(weakText, 210);

    const strongResult = evaluateWritingWithRubric(
      strong,
      strong.split(/\s+/).filter(Boolean).length,
      basePrompt,
      'B2'
    );
    const weakResult = evaluateWritingWithRubric(
      weak,
      weak.split(/\s+/).filter(Boolean).length,
      basePrompt,
      'B2'
    );

    assert.ok(strongResult.overallScore > weakResult.overallScore);
    assert.notEqual(strongResult.overallScore, 76);
    assert.notEqual(weakResult.overallScore, 76);
  });

  it('penalizes duplicate paragraphs heavily', () => {
    const duped = padToRange(`${strongText}\n\n${strongText}`);
    const wc = duped.split(/\s+/).filter(Boolean).length;
    const result = evaluateWritingWithRubric(duped, wc, basePrompt, 'B2');
    const coherence = result.criteria.find((c) => c.criterion === 'content_coherence');
    assert.ok(coherence.score < 70);
  });

  it('rewards proper letter structure with higher task and coherence scores', () => {
    const text = padToRange(strongText);
    const wc = text.split(/\s+/).filter(Boolean).length;
    const result = evaluateWritingWithRubric(text, wc, basePrompt, 'B2');
    const task = result.criteria.find((c) => c.criterion === 'task_fulfillment');
    const coherence = result.criteria.find((c) => c.criterion === 'content_coherence');
    assert.ok(task.score >= 70);
    assert.ok(coherence.score >= 55);
    assert.ok(result.overallScore >= 60);
  });
});

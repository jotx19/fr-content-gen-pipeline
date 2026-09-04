import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assembleFullReadingExam } from './readingFullExamAssembler.js';
import { TEF_READING_EXAM, TEF_READING_SECTIONS } from './readingExamStructure.js';

describe('assembleFullReadingExam', () => {
  it('builds 40 questions across 7 TEF sections', () => {
    process.env.TEF_PRACTICE_COUNT = '40';
    const session = assembleFullReadingExam('test-user', 'B1', []);
    const total = session.modules.reduce((sum, m) => sum + (m.items?.length ?? 0), 0);

    assert.equal(session.modules.length, TEF_READING_SECTIONS.length);
    assert.equal(total, TEF_READING_EXAM.totalQuestions);

    for (const section of TEF_READING_SECTIONS) {
      const mod = session.modules.find((m) => m.sectionCode === section.code);
      assert.ok(mod, `missing section ${section.code}`);
      assert.equal(mod!.items.length, section.examCount);
      for (const item of mod!.items) {
        assert.equal(item.options.length, 4);
        assert.ok(item.question.length > 0);
      }
    }
  });
});

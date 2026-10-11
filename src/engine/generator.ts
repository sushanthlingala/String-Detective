import { Case, ConceptId } from '../types/game';
import { TEMPLATES, CaseTemplate, pickRandom } from './templates';

export interface GenerateCaseOptions {
  difficulty: number; // 1 to 5
  conceptFilter: ConceptId | 'all' | 'weak_areas';
  caseNumber: number;
  recentFingerprints?: string[];
  weakConcepts?: ConceptId[];
}

export function generateCase(options: GenerateCaseOptions): Case {
  const { difficulty, conceptFilter, caseNumber, recentFingerprints = [], weakConcepts = [] } = options;

  let candidateTemplates: CaseTemplate[] = [];

  // Determine target concept if weak_areas is chosen
  let targetConcept: ConceptId | undefined = undefined;
  if (conceptFilter === 'weak_areas') {
    if (weakConcepts.length > 0) {
      targetConcept = pickRandom(weakConcepts);
    }
  } else if (conceptFilter !== 'all') {
    targetConcept = conceptFilter;
  }

  // 1. Try exact match for concept and exact difficulty range
  if (targetConcept) {
    candidateTemplates = TEMPLATES.filter(
      (t) => t.concept === targetConcept && difficulty >= t.minDiff && difficulty <= t.maxDiff
    );

    // If no exact difficulty match, relax difficulty constraint slightly
    if (candidateTemplates.length === 0) {
      candidateTemplates = TEMPLATES.filter((t) => t.concept === targetConcept);
    }
  } else {
    // All concepts
    candidateTemplates = TEMPLATES.filter(
      (t) => difficulty >= t.minDiff && difficulty <= t.maxDiff
    );

    // If no candidate templates at exact range, widen tolerance
    if (candidateTemplates.length === 0) {
      candidateTemplates = TEMPLATES.filter(
        (t) => difficulty >= t.minDiff - 1 && difficulty <= t.maxDiff + 1
      );
    }
  }

  // Fallback to all templates if still empty
  if (candidateTemplates.length === 0) {
    candidateTemplates = TEMPLATES;
  }

  // Pick a template with randomized attempt, avoiding recent fingerprints if possible
  let selectedCase: Case | null = null;
  let attempts = 0;

  while (attempts < 10) {
    const template = pickRandom(candidateTemplates);
    const generated = template.generate(difficulty, caseNumber);
    if (!recentFingerprints.includes(generated.fingerprint)) {
      selectedCase = generated;
      break;
    }
    attempts++;
  }

  // If all attempts hit recent fingerprints, just pick one
  if (!selectedCase) {
    const template = pickRandom(candidateTemplates);
    selectedCase = template.generate(difficulty, caseNumber);
  }

  return selectedCase;
}

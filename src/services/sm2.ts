import { Flashcard } from '../types';

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

const GRADE_VALUES: Record<ReviewGrade, number> = {
  again: 1,
  hard: 2,
  good: 4,
  easy: 5,
};

/**
 * Calculates updated SM-2 parameters for a flashcard given user rating
 */
export function calculateSM2(card: Flashcard, gradeType: ReviewGrade): Flashcard {
  const grade = GRADE_VALUES[gradeType];
  let { repetition, interval, easeFactor, reviewCount, failCount } = card;

  reviewCount = (reviewCount || 0) + 1;

  if (grade < 3) {
    // Failed recall
    repetition = 0;
    interval = 1;
    failCount = (failCount || 0) + 1;
  } else {
    // Successful recall
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  nextDate.setHours(0, 0, 0, 0);

  const state: Flashcard['state'] = grade < 3 ? 'learning' : interval > 21 ? 'review' : 'learning';

  return {
    ...card,
    repetition,
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReview: nextDate.toISOString(),
    lastReviewed: new Date().toISOString(),
    reviewCount,
    failCount,
    state,
  };
}

/**
 * Filter flashcards due for review today
 */
export function getDueFlashcards(cards: Flashcard[], topicId?: string, onlyHard?: boolean): Flashcard[] {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

  return cards.filter((card) => {
    if (topicId && card.topicId !== topicId) return false;
    if (onlyHard && (card.failCount || 0) < 1) return false;

    if (!card.nextReview) return true;
    const reviewTime = new Date(card.nextReview).getTime();
    return reviewTime <= todayEnd;
  });
}

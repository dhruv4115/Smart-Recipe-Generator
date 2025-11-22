export interface RecommendationScoreInput {
  overlapScore: number;    // 0–1
  semanticScore: number;   // 0–1
  popularityScore: number; // 0–1
}

export function computeRecommendationScore({
  overlapScore,
  semanticScore,
  popularityScore,
}: RecommendationScoreInput): number {
  const w1 = 0.5; // overlap
  const w2 = 0.3; // semantic
  const w3 = 0.2; // popularity

  return w1 * overlapScore + w2 * semanticScore + w3 * popularityScore;
}

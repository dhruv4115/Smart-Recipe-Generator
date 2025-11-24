import { computeRecommendationScore } from '../src/recipes/utils/recommendation-score';

describe('computeRecommendationScore', () => {
  it('should prioritize overlap score with highest weight', () => {
    const lowOverlap = computeRecommendationScore({
      overlapScore: 0.2,
      semanticScore: 0.9,
      popularityScore: 0.9,
    });

    const highOverlap = computeRecommendationScore({
      overlapScore: 0.8,
      semanticScore: 0.2,
      popularityScore: 0.2,
    });

    expect(highOverlap).toBeGreaterThan(lowOverlap);
  });

  it('should produce a value between 0 and 1 when inputs are between 0 and 1', () => {
    const score = computeRecommendationScore({
      overlapScore: 0.5,
      semanticScore: 0.5,
      popularityScore: 0.5,
    });

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should handle all zeros', () => {
    const score = computeRecommendationScore({
      overlapScore: 0,
      semanticScore: 0,
      popularityScore: 0,
    });
    expect(score).toBe(0);
  });

  it('should increase when popularity increases, with other factors equal', () => {
    const lowPopularity = computeRecommendationScore({
      overlapScore: 0.5,
      semanticScore: 0.5,
      popularityScore: 0.1,
    });

    const highPopularity = computeRecommendationScore({
      overlapScore: 0.5,
      semanticScore: 0.5,
      popularityScore: 0.9,
    });

    expect(highPopularity).toBeGreaterThan(lowPopularity);
  });
});

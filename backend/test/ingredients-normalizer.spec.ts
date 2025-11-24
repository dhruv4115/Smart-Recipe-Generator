import { normalizeIngredients } from '../src/common/utils/ingredients-normalizer';

describe('normalizeIngredients', () => {
  it('should lowercase and trim ingredient names', () => {
    const result = normalizeIngredients(['  Tomato  ', 'ONION']);
    expect(result).toContain('tomato');
    expect(result).toContain('onion');
  });

  it('should de-duplicate similar ingredients', () => {
    const result = normalizeIngredients(['Tomatoes', 'tomato', 'TOMATOES ']);
    expect(result).toEqual(['tomato']);
  });

  it('should map simple synonyms', () => {
    const result = normalizeIngredients(['capsicum', 'tomato']);
    // our utils map "capsicum" to "bell pepper"
    expect(result).toContain('bell pepper');
    expect(result).toContain('tomato');
  });

  it('should ignore empty or malformed labels', () => {
    const result = normalizeIngredients(['', '   ', '***']);
    expect(result.length).toBe(0);
  });

  it('should remove leading/trailing punctuation', () => {
    const result = normalizeIngredients([',Tomato.', ' onion,']);
    expect(result).toContain('tomato');
    expect(result).toContain('onion');
  });
});

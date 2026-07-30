import { describe, expect, it } from 'vitest';
import { filterMedicineSuggestions } from './inventory';

describe('filterMedicineSuggestions', () => {
  it('matches names case-insensitively and preserves a stable order', () => {
    const suggestions = ['Aspirin', 'Paracetamol', 'Aspirin Extra'];

    expect(filterMedicineSuggestions('asp', suggestions, 5)).toEqual(['Aspirin', 'Aspirin Extra']);
  });

  it('returns an empty array for blank queries', () => {
    expect(filterMedicineSuggestions('   ', ['Aspirin'], 5)).toEqual([]);
  });

  it('caps the number of results', () => {
    const suggestions = ['Aspirin', 'Aspirin Plus', 'Aspirin Max', 'Aspirin Pro'];

    expect(filterMedicineSuggestions('asp', suggestions, 2)).toEqual(['Aspirin', 'Aspirin Plus']);
  });
});

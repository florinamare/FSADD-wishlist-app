const {
  calculateRemainingBudget,
  isOverspent,
  getPurchasedItems,
} = require('../utils/budgetUtils');

describe('calculateRemainingBudget', () => {
  test('returns correct remaining budget when partially spent', () => {
    expect(calculateRemainingBudget(1000, 300)).toBe(700);
  });

  test('returns negative value when overspent', () => {
    expect(calculateRemainingBudget(500, 800)).toBe(-300);
  });

  test('returns full budget when nothing is spent', () => {
    expect(calculateRemainingBudget(200, 0)).toBe(200);
  });
});

describe('isOverspent', () => {
  test('returns true when spent exceeds budget', () => {
    expect(isOverspent(500, 600)).toBe(true);
  });

  test('returns false when spent is within budget', () => {
    expect(isOverspent(500, 400)).toBe(false);
  });

  test('returns false when spent equals budget exactly', () => {
    expect(isOverspent(300, 300)).toBe(false);
  });
});

describe('getPurchasedItems', () => {
  const items = [
    { name: 'Carte', price: 50, purchased: true },
    { name: 'Casti', price: 200, purchased: false },
    { name: 'Tastatura', price: 350, purchased: true },
    { name: 'Mouse', price: 100, purchased: false },
  ];

  test('returns only purchased items', () => {
    const result = getPurchasedItems(items);
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.purchased === true)).toBe(true);
  });

  test('returns correct item names', () => {
    const result = getPurchasedItems(items);
    expect(result.map((i) => i.name)).toEqual(['Carte', 'Tastatura']);
  });

  test('returns empty array when no items are purchased', () => {
    const unpurchased = items.map((i) => ({ ...i, purchased: false }));
    expect(getPurchasedItems(unpurchased)).toHaveLength(0);
  });
});

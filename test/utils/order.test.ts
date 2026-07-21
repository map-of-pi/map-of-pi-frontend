import { formatPiAmount } from '../../src/utils/order';

describe('formatPiAmount', () => {
  it('formats Mongo Decimal128 JSON values', () => {
    expect(formatPiAmount({ $numberDecimal: '14' })).toBe('14');
    expect(formatPiAmount({ $numberDecimal: 6 })).toBe('6');
  });

  it('formats plain numeric and string values', () => {
    expect(formatPiAmount(14)).toBe('14');
    expect(formatPiAmount(0.6000000000000001)).toBe('0.6000000000000001');
    expect(formatPiAmount('6')).toBe('6');
  });

  it('returns an empty string for missing values', () => {
    expect(formatPiAmount(null)).toBe('');
    expect(formatPiAmount(undefined)).toBe('');
    expect(formatPiAmount({})).toBe('');
    expect(formatPiAmount({ $numberDecimal: null })).toBe('');
  });
});

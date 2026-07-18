import {
  formatPiAmount,
  getBuyerUsername,
  getSellerName,
} from '../../src/utils/order';

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

describe('getSellerName', () => {
  it('returns the seller name when the seller is populated', () => {
    expect(getSellerName({ name: 'Seller A' })).toBe('Seller A');
  });

  it('returns an empty string for missing or unpopulated sellers', () => {
    expect(getSellerName(null)).toBe('');
    expect(getSellerName(undefined)).toBe('');
    expect(getSellerName('seller-id')).toBe('');
    expect(getSellerName({})).toBe('');
  });
});

describe('getBuyerUsername', () => {
  it('returns the buyer username when the buyer is populated', () => {
    expect(getBuyerUsername({ pi_username: 'alice' })).toBe('alice');
  });

  it('returns an empty string for missing or unpopulated buyers', () => {
    expect(getBuyerUsername(null)).toBe('');
    expect(getBuyerUsername(undefined)).toBe('');
    expect(getBuyerUsername('buyer-id')).toBe('');
    expect(getBuyerUsername({})).toBe('');
  });
});

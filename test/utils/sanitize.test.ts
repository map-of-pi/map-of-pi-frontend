import {
  removeUrls,
  removeUrlsFromEmailField,
} from '../../src/utils/sanitize';

describe('removeUrls', () => {
  it('returns trimmed text when no links are present', () => {
    expect(removeUrls('  Fresh local produce  ')).toBe('Fresh local produce');
  });

  it('removes standard URLs with query params and hashes', () => {
    expect(
      removeUrls('Visit https://example.com/path?category=fruit#apples today'),
    ).toBe('Visit [URL removed] today');
  });

  it('removes URLs with auth and ports as a single match', () => {
    expect(
      removeUrls('Server https://user:pass@example.com:8080/store is live'),
    ).toBe('Server [URL removed] is live');
  });

  it('removes YouTube handle URLs', () => {
    expect(removeUrls('Watch youtube.com/@TestMe')).toBe('Watch [URL removed]');
  });

  it('removes fuzzy domains and email addresses', () => {
    expect(removeUrls('Contact seller@example.com or mapofpi.com')).toBe(
      'Contact [URL removed] or [URL removed]',
    );
  });

  it('does not remove common non-link dotted words', () => {
    expect(removeUrls('Built with next.js')).toBe('Built with next.js');
  });
});

describe('removeUrlsFromEmailField', () => {
  it('preserves valid email addresses', () => {
    expect(removeUrlsFromEmailField('seller@example.com')).toBe(
      'seller@example.com',
    );
  });

  it('removes URL formats from email fields', () => {
    expect(removeUrlsFromEmailField('youtube.com/@TestMe')).toBe(
      '[URL removed]',
    );
  });

  it('preserves email addresses while removing URL formats', () => {
    expect(
      removeUrlsFromEmailField('seller@example.com youtube.com/@TestMe'),
    ).toBe('seller@example.com [URL removed]');
  });
});

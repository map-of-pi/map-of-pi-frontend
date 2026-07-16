export const TRUST_PROTECT_ERROR_CODES = [
  'TRUST_PROTECT_INVALID_REVIEW_ID',
  'TRUST_PROTECT_REVIEW_NOT_FOUND',
  'TRUST_PROTECT_FORBIDDEN_RECEIVER_ONLY',
  'TRUST_PROTECT_ALREADY_APPLIED',
  'TRUST_PROTECT_INSUFFICIENT_MAPPI',
  'TRUST_PROTECT_REVIEW_NOT_DESPAIR',
] as const;

export type TrustProtectErrorCode = (typeof TRUST_PROTECT_ERROR_CODES)[number];

export const isTrustProtectErrorCode = (
  code: unknown,
): code is TrustProtectErrorCode =>
  typeof code === 'string' &&
  TRUST_PROTECT_ERROR_CODES.includes(code as TrustProtectErrorCode);

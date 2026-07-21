// Order payloads can include legacy values, so this helper keeps display-only
// amount fields from crashing the order screens.

type DecimalValue =
  | number
  | string
  | null
  | undefined
  | {
      $numberDecimal?: number | string | null;
    };

export const formatPiAmount = (amount: DecimalValue): string => {
  if (amount === null || amount === undefined) return '';

  if (typeof amount === 'number' || typeof amount === 'string') {
    return amount.toString();
  }

  const decimal = amount.$numberDecimal;
  return decimal === null || decimal === undefined ? '' : decimal.toString();
};

// Order payloads can include legacy or partially populated values, so these
// helpers keep display-only fields from crashing the order screens.

type DecimalValue =
  | number
  | string
  | null
  | undefined
  | {
      $numberDecimal?: number | string | null;
    };

type OrderPartyValue =
  | string
  | null
  | undefined
  | {
      name?: string | null;
      pi_username?: string | null;
    };

export const formatPiAmount = (amount: DecimalValue): string => {
  if (amount === null || amount === undefined) return '';

  if (typeof amount === 'number' || typeof amount === 'string') {
    return amount.toString();
  }

  const decimal = amount.$numberDecimal;
  return decimal === null || decimal === undefined ? '' : decimal.toString();
};

export const getSellerName = (seller: OrderPartyValue): string => {
  if (!seller || typeof seller === 'string') return '';
  return seller.name ?? '';
};

export const getBuyerUsername = (buyer: OrderPartyValue): string => {
  if (!buyer || typeof buyer === 'string') return '';
  return buyer.pi_username ?? '';
};

import { SellerItem } from '@/constants/types';

/**
 * Returns the number of whole weeks remaining on an active listing.
 *
 * Corrections from previous version:
 *  - Removed the arbitrary "exclude current week" (-1) subtraction that caused
 *    an off-by-one: a listing expiring in exactly 7 days has 1 full week left,
 *    not 0.
 *  - Guards against missing/invalid expiry gracefully.
 *  - Clamps to [0, totalDuration] so it can never exceed the original duration.
 */
export const getRemainingWeeks = (item: SellerItem): number => {
  if (!item?.expired_by || !item?.duration) return 0;

  const now = new Date();
  const expiry = new Date(item.expired_by);
  if (isNaN(expiry.getTime())) return 0;

  const msLeft = expiry.getTime() - now.getTime();
  if (msLeft <= 0) return 0; // already expired

  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const weeksLeft = Math.floor(msLeft / MS_PER_WEEK);
  const totalWeeks = Math.floor(Number(item.duration));

  // Never report more weeks remaining than the original duration
  return Math.min(weeksLeft, totalWeeks);
};

/**
 * Calculates how many Mappi credits a save operation will consume.
 *
 * Rules:
 *  - New listing:              cost = ceil(duration)   (every week costs 1 Mappi)
 *  - Existing, duration cut:   cost = 0                (reducing duration is free)
 *  - Existing, no change:      cost = 0
 *  - Existing, duration added: cost = ceil(addedWeeks) (only the delta costs Mappi)
 */
export const computeMappiCost = (
  existingItem: SellerItem,
  newDuration: number
): number => {
  const isNew = !existingItem._id;

  if (isNew) {
    return Math.max(1, Math.ceil(newDuration));
  }

  const prevDuration = existingItem.duration ?? 0;
  const delta = newDuration - prevDuration;
  return delta > 0 ? Math.ceil(delta) : 0;
};

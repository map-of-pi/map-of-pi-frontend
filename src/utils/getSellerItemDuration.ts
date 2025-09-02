import { SellerItem } from "@/constants/types";

export const getRemainingWeeks = (existing_item: SellerItem): number => {
    if (!existing_item || !existing_item.expired_by || !existing_item.duration) return 0;

    const now = new Date();
    const expiry = new Date(existing_item.expired_by);

    // Calculate total weeks from duration
    const totalWeeks = Math.floor(Number(existing_item.duration));

    // Calculate weeks left (excluding current week)
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const msLeft = expiry.getTime() - now.getTime();
    const weeksLeft = Math.floor(msLeft / msPerWeek);

    // Exclude current week
    const remainingWeeks = Math.max(weeksLeft - 1, 0);

    // Ensure not more than total duration
    return Math.min(remainingWeeks, totalWeeks);
  };
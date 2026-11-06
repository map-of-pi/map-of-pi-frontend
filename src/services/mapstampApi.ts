import { MapStampReviewStatus } from '@/constants/types';
import logger from '../../logger.config.mjs';

// TODO: replace these stubs with real MapStamp backend calls once the endpoints exist.
// Set NEXT_PUBLIC_MAPSTAMP_STUB_VARIANT=1..4 in .env.local to preview each tile variant.
const STUB_STATUSES: Record<string, MapStampReviewStatus> = {
  '1': { receiverOptedIn: false, receiverMembershipActive: false, mappiBalance: 5 },
  '2': { receiverOptedIn: true, receiverMembershipActive: false, mappiBalance: 5 },
  '3': { receiverOptedIn: true, receiverMembershipActive: true, mappiBalance: 0 },
  '4': { receiverOptedIn: true, receiverMembershipActive: true, mappiBalance: 5 },
};

export const fetchMapStampReviewStatus = async (
  receiverId: string,
): Promise<MapStampReviewStatus> => {
  logger.info(`[stub] Fetching MapStamp review status for ${receiverId}`);
  return STUB_STATUSES[process.env.NEXT_PUBLIC_MAPSTAMP_STUB_VARIANT ?? '4'] ?? STUB_STATUSES['4'];
};

// Backend should send the issuer: "Please renew your membership so your card holders can receive MapStamps from you"
export const notifyMapStampIssuer = async (issuerId: string): Promise<void> => {
  logger.info(`[stub] Notifying MapStamp issuer ${issuerId} to renew membership`);
};

// Awards one MapStamp to the current user and consumes one mappi
export const awardMapStamp = async (issuerId: string): Promise<void> => {
  logger.info(`[stub] Awarding MapStamp from issuer ${issuerId}`);
};

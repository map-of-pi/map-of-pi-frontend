import axiosClient from '@/config/client';
import { MapStampReviewStatus } from '@/constants/types';
import logger from '../../logger.config.mjs';

// TODO: replace the status stub with a real backend call once the endpoint exists.
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

// Asks the issuer to renew their membership so card holders can receive MapStamps
export const notifyMapStampIssuer = async (issuerPiUid: string): Promise<void> => {
  try {
    logger.info(`Notifying MapStamp issuer ${issuerPiUid}`);
    await axiosClient.post('/mapstamps/notify-issuer', { issuer_pi_uid: issuerPiUid });
  } catch (error) {
    logger.error('Notify MapStamp issuer encountered an error:', error);
    throw new Error('Failed to notify issuer. Please try again later.');
  }
};

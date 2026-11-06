import { MapStampReviewStatus } from '@/constants/types';

// 1: receiver not opted-in | 2: issuer membership lapsed | 3: no mappi | 4: can earn a MapStamp
export type MapStampReviewVariant = 1 | 2 | 3 | 4;

export const getMapStampVariant = (
    status: MapStampReviewStatus,
): MapStampReviewVariant => {
    if (!status.receiverOptedIn) return 1;
    if (!status.receiverMembershipActive) return 2;
    if (status.mappiBalance <= 0) return 3;
    return 4;
};

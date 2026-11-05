import { getMapStampVariant } from '../../src/utils/mapstamp';

describe('getMapStampVariant', () => {
    const base = { receiverOptedIn: true, receiverMembershipActive: true, mappiBalance: 3 };

    it('returns 1 when the receiver is not opted-in', () => {
        expect(getMapStampVariant({ ...base, receiverOptedIn: false })).toBe(1);
    });

    it('returns 2 when the issuer membership has lapsed', () => {
        expect(getMapStampVariant({ ...base, receiverMembershipActive: false })).toBe(2);
    });

    it('returns 3 when the user has no mappi', () => {
        expect(getMapStampVariant({ ...base, mappiBalance: 0 })).toBe(3);
    });

    it('treats a negative mappi balance as no mappi', () => {
        expect(getMapStampVariant({ ...base, mappiBalance: -1 })).toBe(3);
    });

    it('returns 4 when a MapStamp can be earned', () => {
        expect(getMapStampVariant(base)).toBe(4);
    });

    it('checks opt-in before membership before mappi', () => {
        expect(
            getMapStampVariant({ receiverOptedIn: false, receiverMembershipActive: false, mappiBalance: 0 }),
        ).toBe(1);
    });
});

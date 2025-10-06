'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';
import MembershipIcon from '@/components/shared/membership/MembershipIcon';
import { MembershipClassType } from '@/constants/types';
import { createWatchAdsSession, completeWatchAdsSegment } from'../../../../services/watchAdsApi'

const tiers: [string, string, MembershipClassType | null][] = [
  ['Single mappi', 'Watch ads for 10 minutes', null],
  ['White membership', 'Watch ads for 50 minutes', MembershipClassType.WHITE],
  ['Green membership', 'Watch ads for 1 hour and 40 minutes', MembershipClassType.GREEN],
  ['Gold membership', 'Watch ads for 4 hours and 10 minutes', MembershipClassType.GOLD],
  ['Double Gold membership', 'Watch ads for 8 hours and 20 minutes', MembershipClassType.DOUBLE_GOLD],
  ['Triple Gold membership', 'Watch ads for 16 hours and 40 minutes', MembershipClassType.TRIPLE_GOLD],
];

declare const Pi: any;

export default function WatchAdsPage() {
  const ready = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [earnedSecs, setEarnedSecs] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !window.Pi) return;

      try {
        await Pi.init({ version: '2.0' });
        const feats = await Pi.nativeFeaturesList();
        if (!feats.includes('ad_network')) return;

        try {
          await Pi.authenticate();
        } catch {
          console.warn('User skipped authentication.');
        }

        // Create backend watch-ads session
        const data = await createWatchAdsSession();
        if (data?._id) {
          setSessionId(data._id);
          setEarnedSecs(data.earnedSecs ?? 0);
          setStatus(data.status ?? "unknown");
        }

        ready.current = true;
      } catch (err: any) {
        console.error('Initialization error:', err);
      }
    })();
  }, []);

  const showRewarded = async () => {
    if (!ready.current) return;
    try {
      const isReady = await Pi.Ads.isAdReady('rewarded');
      if (!isReady.ready) {
        const req = await Pi.Ads.requestAd('rewarded');
        if (req.result !== 'AD_LOADED') return;
      }

      const show = await Pi.Ads.showAd('rewarded');
      if (show.result === 'AD_REWARDED' && sessionId) {
        // Complete segment
        const updated = await completeWatchAdsSegment(sessionId, show.adId);
        if (updated) {
          setEarnedSecs(Number(updated.earnedSecs ?? 0));
          setStatus(updated.status ?? "unknown");
        }
      }
    } catch (err: any) {
      console.error('Error showing ad:', err);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[335px] rounded-[6px] border border-tertiary bg-background p-4 text-center">
      <div aria-hidden className="-mx-4 -mt-4 mb-4 h-[6px] rounded-t-[6px] bg-primary" />

      <h1 className="text-[17px] font-bold text-[#1e1e1e] mb-4">
        Watch Ads to Buy Membership
      </h1>

      <section className="mb-6">
        <p className="text-[15px] font-semibold text-[#333333] mb-3">
          How many ad minutes do I need:
        </p>

        <ul className="space-y-3">
          {tiers.map(([title, desc, tier], i) => (
            <li key={i}>
              <div className="flex items-center justify-center gap-2 text-[#1e1e1e]">
                <span className="whitespace-nowrap">{title}</span>
                {tier && (
                  <MembershipIcon
                    category={tier}
                    className="inline-block align-middle"
                    styleComponent={{
                      width:
                        tier === MembershipClassType.TRIPLE_GOLD
                          ? '28px'
                          : tier === MembershipClassType.DOUBLE_GOLD
                          ? '24px'
                          : '20px',
                      height:
                        tier === MembershipClassType.TRIPLE_GOLD
                          ? '28px'
                          : tier === MembershipClassType.DOUBLE_GOLD
                          ? '24px'
                          : '20px',
                      objectFit: 'contain',
                      verticalAlign: 'middle',
                    }}
                  />
                )}
              </div>
              <p className="text-[12px] text-[#6b6b6b]">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[14px] font-2xl mb-4">
        Ads are presented in 10 minute blocks
      </p>

      <div className="mb-6 flex justify-center">
        <Button
          label="Watch Ad Block"
          styles={{
            color: '#ffc153',
            backgroundColor: 'var(--default-primary-color)',
            height: '40px',
            padding: '10px 15px',
          }}
          onClick={showRewarded}
        />
      </div>

      <p className="text-[14px] text-[#333333] text-gray-800">
        Ad minutes watched so far
        <br />
        <span className="text-[13px] text-[#6b6b6b]">
          {Math.floor(Number(earnedSecs) / 3600)} hours and{' '}
          {Math.floor((Number(earnedSecs) / 60) % 60)} minutes
        </span>
      </p>
    </main>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';

declare const Pi: any;

export default function WatchAdsPage() {
  const ready = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [earnedSecs, setEarnedSecs] = useState<number>(0);
  const [status, setStatus]= useState<string>("");

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !window.Pi) {
        return;
      }
      try {
        await Pi.init({ version: '2.0' });

        const feats = await Pi.nativeFeaturesList();
        if (!feats.includes('ad_network')) {
          return;
        }

        try {
          await Pi.authenticate(); // no payment callbacks
        } catch {
        // user skipped auth
      } 

      // Call backend to initiate session
      try {
        const res = await fetch('/api/v1/watch-ads/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`Init session failed: ${res.status}`);
        const data = await res.json();

        if (data?._id) {
          setSessionId(data._id);
          setEarnedSecs(data.earnedSecs ?? 0);
          setStatus(data.status ?? "unknown");
        }

        if (data?._id) setSessionId(data._id);
      } catch (err: any) {
        console.error('Error initiating session', err);
    }

      ready.current = true;
    } catch (e: any) {
      console.error('Init/Auth error', e);
    }
  })();
}, []);

const showRewarded = async () => {
  if (!ready.current) return;
  try {
    const isReady = await Pi.Ads.isAdReady('rewarded');

    if (!isReady.ready) {
      const req = await Pi.Ads.requestAd('rewarded');
      if (req.result !== 'AD_LOADED') {
        return;
      }
    }

    const show = await Pi.Ads.showAd('rewarded'); // { result, adId? }
      if (show.result === 'AD_REWARDED' && sessionId) {
      // later: call /segment-complete with { adId }
      try {
        const res = await fetch(`/api/v1/watch-ads/session/${sessionId}/segment-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adId: show.adId}),

        });

        if (!res.ok) throw new Error(`Segment complete failed: ${res.status}`)
        const updated = await res.json();

        // Update FE state with new progress
        setEarnedSecs(Number(updated.earnedSecs ?? 0));
        setStatus(updated.status ?? "unknown");
      } catch (err: any) {
        console.error('Error reporting ad completion', err);
      }
    }
  } catch (e: any) {
    console.error('showRewarded error', e);
  }
};

return (
  <main className="mx-auto w-full max-w-[335px] rounded-[6px] border border-tertiary bg-background p-4 text-center" >
    {/* Top accent bar */}
    <div aria-hidden className="-mx-4 -mt-4 mb-4 h-[6px] rounded-t-[6px] bg-primary" />

    {/* Page title */}
    <h1 className="text-[17px] font-bold text-[#1e1e1e] mb-4">
      Watch Ads to Buy Membership
    </h1>

    <section className="mb-6">
      <p className="text-[15px] font-semibold text-[#333333] mb-3">
        How many ad minutes do I need:
      </p>

      <ul className="space-y-2">
        {[
          ['Single mappi', 'Watch ads for 10 minutes', ''],
          ['White membership', 'Watch ads for 50 minutes', '✔'],
          ['Green membership', 'Watch ads for 1 hour and 40 minutes', '✔'],
          ['Gold membership', 'Watch ads for 4 hours and 10 minutes', '✔'],
          ['Double Gold membership', 'Watch ads for 8 hours and 20 minutes', '✔✔'],
          ['Triple Gold membership', 'Watch ads for 16 hours and 40 minutes', '✔✔✔'],
        ].map(([title, desc, check], i) => (
          <li key={i}>
            <div className="font-semibold text-[#1e1e1e]">
              {title}{' '}
              {check && <span className="text-secondary">{check}</span>}
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

    <p className="text-[14px] text-[#333333]">
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
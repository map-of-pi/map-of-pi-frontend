'use client';
import { useEffect, useRef, useState } from 'react';

declare const Pi: any;

export default function WatchAdsPage() {
  const ready = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [earnedSecs, setEarnedSecs] = useState<string>("");
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
    if (show.result === 'AD_REWARDED') {
    // later: call /segment-complete with { adId }
    }
  } catch (e: any) {
    console.error('showRewarded error', e);
  }
};

return (
  <div className="p-6 max-w-xl mx-auto">
    <h1 className="text-xl font-bold mb-4">Watch Ads</h1>
    {sessionId && (
      <div className="mb-4 text-sm text-gray-700">
        Active Session ID: <span className="font-mono">{sessionId}</span>
        <div>Status: <span className="font-mono">{status}</span></div>
        <div>Minutes earned: {Math.floor(Number(earnedSecs) / 60)}</div>
      </div>
    )}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
        onClick={showRewarded}
      >
        Show Rewarded
      </button>
    </div>
  );
}
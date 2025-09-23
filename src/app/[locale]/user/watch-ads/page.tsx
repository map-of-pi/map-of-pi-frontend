'use client';
import { useEffect, useRef, useState } from 'react';

declare const Pi: any;

export default function WatchAdsPage() {
  const ready = useRef(false);
  const [log, setLog] = useState<string[]>([]);
  const push = (m: string) => setLog(prev => [m, ...prev].slice(0, 60));
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !window.Pi) {
        push('Pi SDK not found. Open this page in Pi Browser.');
        return;
      }
      try {
        await Pi.init({ version: '2.0' });
        push('Pi.init OK');

        const feats = await Pi.nativeFeaturesList();
        push(`nativeFeaturesList: ${JSON.stringify(feats)}`);
        if (!feats.includes('ad_network')) {
          push('ad_network not supported. Update Pi Browser.');
          return;
        }

        try {
          await Pi.authenticate(); // no payment callbacks
          push('Pi.authenticate OK');
        } catch {
          push('User skipped auth; rewarded may not show.');
        }

        // Call backend to initiate session
        try {
          const res = await fetch('/api/v1/watch-ads/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) throw new Error(`Init session failed: ${res.status}`);
          const data = await res.json();
          push(`Session initiated: ${JSON.stringify(data)}`);

          if (data?._id) setSessionId(data._id);
        } catch (err: any) {
          push(`Error initiating session: ${err?.message}`);
        }

        ready.current = true;
      } catch (e: any) {
        push(`Init/Auth error: ${e?.message || String(e)}`);
      }
    })();
  }, []);

  const showRewarded = async () => {
    if (!ready.current) return push('SDK not ready yet.');
    try {
      const isReady = await Pi.Ads.isAdReady('rewarded');
      push(`isAdReady(rewarded): ${JSON.stringify(isReady)}`);

      if (!isReady.ready) {
        const req = await Pi.Ads.requestAd('rewarded');
        push(`requestAd(rewarded): ${JSON.stringify(req)}`);
        if (req.result !== 'AD_LOADED') {
          push('No rewarded ad available right now.');
          return;
        }
      }

      const show = await Pi.Ads.showAd('rewarded'); // { result, adId? }
      push(`showAd(rewarded): ${JSON.stringify(show)}`);
      if (show.result === 'AD_REWARDED') push('Rewarded completed.');
    } catch (e: any) {
      push(`showRewarded error: ${e?.message || String(e)}`);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Watch Ads (Test)</h1>
      {sessionId && (
        <div className="mb-4 text-sm text-gray-700">
          Active Session ID: <span className="font-mono">{sessionId}</span>
        </div>
      )}
      <button className="px-4 py-2 bg-blue-600 text-white rounded mb-4" onClick={showRewarded}>
        Show Rewarded
      </button>

      <div className="border rounded p-3 text-sm max-h-72 overflow-auto bg-gray-50">
        {log.length === 0 ? <div>No logs yet.</div> : (
          <ul className="space-y-2">
            {log.map((l, i) => <li key={i} className="font-mono break-all">{l}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

'use client'

import React from "react";

const WatchAdsPage = () => {
 const showRewardedAd = async () => {
  try {
    const isAdReadyResponse = await Pi.Ads.isAdReady("rewarded");

    if (!isAdReadyResponse.ready) {
      const requestAdResponse = await Pi.Ads.requestAd("rewarded");

      if (requestAdResponse.result !== "AD_LOADED") {
        return alert("Ad not available.");
      }
    }

    const showAdResponse = await Pi.Ads.showAd("rewarded");

    if (showAdResponse.result === "AD_REWARDED") {
      alert("Ad completed!");
    } else {
      alert("Ad not completed.");
    }
  } catch (err) {
    alert("Something went wrong showing the ad.");
  }
};

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Watch Ads</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={showRewardedAd}
      >
        Watch Ad
      </button>
    </div>
  );
};

export default WatchAdsPage;
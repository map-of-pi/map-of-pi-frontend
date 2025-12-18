import axiosClient from "@/config/client";
import logger from '../../logger.config.mjs';

export const createWatchAdsSession = async () => {
  try {
    logger.info("Creating new Watch Ads session");
    const response = await axiosClient.post("/v1/watch-ads/session");

    if (response.status === 200) {
      logger.info("Session created successfully", { data: response.data });
      return response.data;
    } else {
      logger.error(`Session creation failed with status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error("Error creating Watch Ads session:", error);
    throw new Error("Failed to initialize Watch Ads session");
  }
};

export const completeWatchAdsSegment = async (sessionId: string, adId: string) => {
  try {
    logger.info(`Completing ad segment for session ${sessionId}`);
    const response = await axiosClient.post(`/v1/watch-ads/session/${sessionId}/segment-complete`, { adId });

    if (response.status === 200) {
      logger.info("Segment completion successful", { data: response.data });
      return response.data;
    } else {
      logger.error(`Segment completion failed with status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error("Error completing ad segment:", error);
    throw new Error("Failed to complete ad segment");
  }
};
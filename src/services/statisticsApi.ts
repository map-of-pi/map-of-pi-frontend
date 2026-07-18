import axiosClient from "@/config/client";
import axios from "axios";
import logger from "../../logger.config.mjs"

export interface summaryStatisticsResult {
  success: boolean;
  usageStats?: {
    totalUsers: number;
    totalSellers: number;
    totalReviews: number;
    totalVouchers: number;
    totalSellerItems: number;
    totalOrderItems: number;
    totalOrders: number;
    fulfilledOrders: number;
  };
  membershipStats?: {
    totalActiveMembers: number;
    totalActiveWhiteMembers: number;
    totalActiveGreenMembers: number;
    totalActiveGoldMembers: number;
    totalActiveDoubleGoldMembers: number;
    totalActiveTripleGoldMembers: number;
    totalActiveMappiBalance: number;
  };
  error?: string;
}

export const fetchSummaryStatistics = async (): Promise<summaryStatisticsResult> => {
  try {
    logger.info(`get summary statistics`);
    const response = await axiosClient.get("/statistics/summary-stats");

    logger.info(`summary statistics response received with Status ${response.status}`, {
      response
    });

    if (response.status !== 200) {
      logger.info(`Invalid summary statistics received, ${response.data.message}`);

      return {
        success: false,
        error: response.data.message
      }
    }

    return response.data;
  } catch (error) {
    logger.error('get summary statistics encountered an error:', error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Unexpected error getting summary statistics. Please try again later."
        : "Unexpected error getting summary statistics. Please try again later."
    };
  }
};

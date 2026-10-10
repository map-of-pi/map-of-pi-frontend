import axiosClient from "@/config/client";
import { getApiError } from "@/utils/getApiError";

export interface GetAdminsParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Get all admins
 */
export const getAppManagers = async (params?: GetAdminsParams) => {
  try {
    const response = await axiosClient.get("/app-managers", {
      params,
    });
    return response.data;
  } catch (error) {
    const message = getApiError(error, "Failed to load admins.");
    throw new Error(message) ;
  }
};

export const authenticateAppManager = async () => {
  try {
    const response = await axiosClient.get("/app-managers/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create admin
 */
export const addAppManager = async (
  payload: {username: string}
) => {
  try {
    const response = await axiosClient.post(
      "/app-managers",
      payload
    );

    return response.data;
  } catch (error:any) {
    const message = getApiError(error, "Unable to add admin.");
    throw new Error(message) ;
  }
};

/**
 * Delete admin
 */
export const deleteAppManager = async (adminId: string) => {
  try {
    const response = await axiosClient.delete(`/app-managers/${adminId}`);

    return response.data;
  } catch (error) {
    const message = getApiError(error, "Failed to delete admin.");
    throw new Error(message) ;
  }
};

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
    const response = await axiosClient.get("/app-managers/statistics");

    if (response.status !== 200) {
      return {
        success: false,
        error: response.data.message
      }
    }

    return response.data;
  } catch (error) {
    return {
      success: false,
      error: getApiError(error, "Unexpected error getting summary statistics. Please try again later.") || "Unexpected error getting summary statistics. Please try again later."
    };
  }
};
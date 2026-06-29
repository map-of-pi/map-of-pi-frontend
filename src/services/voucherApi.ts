import axios from "axios";
import axiosClient from "@/config/client";
import { IMembership, IVoucher } from "@/constants/types";
import logger from "../../logger.config.mjs"

export interface IUserVouchersResult {
  success: boolean;
  vouchers?: IVoucher[];
  error?: string;
}

export interface IVoucherRedemptionResult {
  success: boolean;
  membership?: IMembership;
  error?: string;
}

export const fetchUserVouchers = async (): Promise<IUserVouchersResult> => {
  try {
    logger.info(`get user voucher`);
    const response = await axiosClient.get("/voucher/user-vouchers");

    logger.info(`user vouchers response received with Status ${response.status}`, {
      response
    });

    if (response.status !== 200) {
      logger.info(`Invalid user voucher successful, ${response.data.message}`);

      return {
        success: false,
        error: response.data.message
      }
    }

    return response.data;
  } catch (error) {
    logger.error('get user voucher encountered an error:', error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Unexpected error getting user voucher. Please try again later."
        : "Unexpected error getting user voucher. Please try again later."
    };
  }
};

// Redeem the voucher and return the updated membership if successful
export const redeemVoucher = async (voucher_id: string): Promise<IVoucherRedemptionResult> => {
  try {
    logger.info(`Redeeming user voucher`);

    const response = await axiosClient.post("/voucher/redeem", { voucher_id });
    if (response.status === 400) {
      logger.info(`Invalid user voucher successful, ${response.data.message}`);

      return {
        success: false,
        error: response.data.message
      }
    }
    return response.data;
  } catch (error) {
    logger.error('Redeem user voucher encountered an error:', error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Unexpected error redeeming voucher. Please try again later."
        : "Unexpected error redeeming voucher. Please try again later."
    };
  }
};

import { IMembership, IVoucher, MembershipClassType } from "@/constants/types";
import logger from "../../logger.config.mjs"
import axiosClient from "@/config/client";

export interface IVoucherVerifyResult {
  success: boolean;
  membership_class?: MembershipClassType;
  voucher_id?: string;
  error?: string;
}

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

// Verify voucher code and return the voucher ID if valid
export const verifyVoucher = async (voucher_code: string): Promise<IVoucherVerifyResult> => {
  try {
    logger.info(`Verifying user voucher`);
    const response = await axiosClient.post("/voucher/verify", { voucher_code });

    logger.info(`Verify user voucher response received with Status ${response.status}`, {
      response
    });

    if (response.status === 400) {
      logger.info(`Invalid user voucher successful, ${response.data.message}`);

      return {
        success: false,
        error: response.data.message
      }
    }

    return response.data;
  } catch (error) {
    logger.error('Verify user voucher encountered an error:', error);
    return {
      success: false,
      error: "Unexpected error verifying voucher. Please try again later."
    };
  }
};

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
      error: "Unexpected error getting user voucher. Please try again later."
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
      error: "Unexpected error redeeming voucher. Please try again later."
    };
  }
};
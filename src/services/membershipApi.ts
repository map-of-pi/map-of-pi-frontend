import axiosClient from "@/config/client";
import { IMembership } from "@/constants/types";
import logger from "../../logger.config.mjs"
import { MembershipClassType, MembershipOption } from "@/constants/membershipClassType";

export const fetchMembershipList = async (): Promise<MembershipOption[] | null> => {
  try {
    logger.info(`Fetching membership list`);
    const response = await axiosClient.get("/memberships/membership-list");
    if (response.status === 200) {
      logger.info(`Fetch membership list successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch membership list failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch membership list encountered an error:', error);
    throw new Error('Failed to fetch membership list. Please try again later.');
  }
};

// Fetch current user’s membership
export const fetchMembership = async (membership_id: string): Promise<IMembership | null> => {
  try {
    logger.info(`Fetching user membership: ${membership_id}`);
    const response = await axiosClient.get("/memberships");
    if (response.status === 200) {
      logger.info(`Fetch user membership successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch user membership failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch user membership encountered an error:', error);
    throw new Error('Failed to fetch user membership. Please try again later.');
  }
};

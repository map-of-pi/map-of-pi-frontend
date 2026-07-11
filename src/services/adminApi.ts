import axiosClient from "@/config/client";
import logger from "../../logger.config.mjs";

export interface GetAdminsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateAdminPayload {
  username: string;
  role?: "admin" | "superadmin";
}

export interface UpdateAdminRolePayload {
  role: "admin" | "superadmin";
}

export interface UpdateAdminStatusPayload {
  isActive: boolean;
}

/**
 * Get all admins
 */
export const getAdmins = async (params?: GetAdminsParams) => {
  try {
    const response = await axiosClient.get("/admins", {
      params,
    });

    return response.data;
  } catch (error) {
    logger.error("Failed to fetch admins.", error);
    throw error;
  }
};

/**
 * Create admin
 */
export const createAdmin = async (
  payload: CreateAdminPayload
) => {
  try {
    const response = await axiosClient.post(
      "/admins",
      payload
    );

    return response.data;
  } catch (error) {
    logger.error("Failed to create admin.", error);
    throw error;
  }
};

/**
 * Update admin role
 */
export const updateAdminRole = async (
  adminId: string,
  payload: UpdateAdminRolePayload
) => {
  try {
    const response = await axiosClient.patch(
      `/admins/${adminId}/role`,
      payload
    );

    return response.data;
  } catch (error) {
    logger.error("Failed to update admin role.", error);
    throw error;
  }
};

/**
 * Activate / Deactivate admin
 */
export const updateAdminStatus = async (
  adminId: string,
  payload: UpdateAdminStatusPayload
) => {
  try {
    const response = await axiosClient.patch(
      `/admins/${adminId}/status`,
      payload
    );

    return response.data;
  } catch (error) {
    logger.error("Failed to update admin status.", error);
    throw error;
  }
};

/**
 * Delete admin
 */
export const deleteAdmin = async (
  adminId: string
) => {
  try {
    const response = await axiosClient.delete(
      `/admins/${adminId}`
    );

    return response.data;
  } catch (error) {
    logger.error("Failed to delete admin.", error);
    throw error;
  }
};
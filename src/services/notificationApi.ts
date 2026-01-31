import axiosClient from '@/config/client';
import { NotificationType } from '@/constants/types';
import { getMultipartFormDataHeaders } from '@/utils/api';
import logger from '../../logger.config.mjs';

/**
 * Interface for the standardized pagination response.
 */
interface NotificationPaginationResponse {
  docs: NotificationType[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

/**
 * Fetches paginated notifications for the user.
 * Updated to use page/limit to sync with the backend pagination middleware.
 */
export const getNotifications = async (page: number = 1, limit: number = 10, status?: 'cleared' | 'uncleared'): Promise<NotificationPaginationResponse> => {
  try {
    const headers = getMultipartFormDataHeaders();

    // Mapping to the new pagination structure: page instead of skip
    const params: any = { page, limit };
    if (status) {
      params.status = status;
    }

    const response = await axiosClient.get(`/notifications`, {
      params,
      headers,
    });

    if (response.status === 200) {
      // Backend returns { docs, totalDocs, limit, page, totalPages }
      return response.data;
    } else {
      return { docs: [], totalDocs: 0, limit, page, totalPages: 0 };
    }
  } catch (error) {
    logger.error('Get notifications encountered an error:', error);
    throw new Error('Failed to get notifications. Please try again later.');
  }
};

export const buildNotification = async (data: NotificationType) => {
  try {
    const response = await axiosClient.post(`/notifications`, data);
    if (response.status === 200) {
      logger.info(`Build notification successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Build notification failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Build notification encountered an error:', error);
    throw new Error('Failed to build notification. Please try again later.');
  }
};

export const updateNotification = async (notification_id: string) => {
  try {
    const response = await axiosClient.put(`/notifications/update/${notification_id}`);
    if (response.status === 200) {
      logger.info(`Update notification successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Update notification failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Update notification encountered an error:', error);
    throw new Error('Failed to update notification. Please try again later.');
  }
};

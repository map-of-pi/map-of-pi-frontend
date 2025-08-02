import axiosClient from '@/config/client';
import { INotification } from '@/constants/types';
import { getMultipartFormDataHeaders } from '@/utils/api';
import logger from '../../logger.config.mjs';

export const getNotifications = async (
  {pi_uid, skip, limit, status}: 
  {pi_uid: string, skip: number, limit: number, status?: 'cleared' | 'uncleared'}) => {
  try {
    const headers = getMultipartFormDataHeaders();

    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (status) {
      queryParams.append('status', status);
    }
    
    const response = await axiosClient.get(`/notifications/${pi_uid}?${queryParams.toString()}`, {
      headers
    });
    
    if (response.status === 200) {
      logger.info(`Get notifications successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Get notifications failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Get notifications encountered an error:', error);
    throw new Error('Failed to get notifications. Please try again later.');
  }
};

export const buildNotification = async (data: INotification) => {
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
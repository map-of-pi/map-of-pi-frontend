import axiosClient from "@/config/client";
import { getMultipartFormDataHeaders } from "@/utils/api";
import logger from '../../logger.config.mjs';

/**
 * fetchUserSettings
 * Retrieves the current authenticated user's preferences.
 * Uses a POST request to sync session data with user settings.
 */
export const fetchUserSettings = async () => {
  try {
    logger.info('Fetching user settings..');
    const response = await axiosClient.post(`/user-preferences/me`);
    if (response.status === 200) {
      logger.info(`Fetch user settings successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch user settings failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch user settings encountered an error:', error);
    throw new Error('Failed to fetch user settings. Please try again later.');
  }
};

/**
 * fetchSingleUserSettings
 * Fetches preference data for a specific seller/pioneer.
 * @param sellerId - The target user's unique identifier.
 */
export const fetchSingleUserSettings = async (sellerId: String) => {
  try {
    logger.info(`Fetching user settings for seller ID: ${sellerId}`);
    const response = await axiosClient.get(`/user-preferences/${sellerId}`);
    if (response.status === 200) {
      logger.info(`Fetch single user settings successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch single user settings failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch single user settings encountered an error:', error);
    throw new Error('Failed to fetch single user settings. Please try again later.');
  }
};

/**
 * createUserSettings
 * Handles the creation or update of user profiles including profile pictures via FormData.
 * Utilizes multipart headers for successful asset handling in the Pi Browser.
 */
export const createUserSettings = async (formData: FormData) => {
  try {
    logger.info('Creating or updating user settings with formData..');
    const headers = getMultipartFormDataHeaders();
    
    const response = await axiosClient.put('/user-preferences/add', formData, { headers });
    
    if (response.status === 200) {
      logger.info(`Create or update user settings successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Create or update user settings failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Create or update user settings encountered an error:', error);
    throw new Error('Failed to create or update user settings. Please try again later.');
  }
};

/**
 * fetchUserLocation
 * Retrieves the stored geographic coordinates for the user.
 * Essential for centering the Map component on the user's last known position.
 */
export const fetchUserLocation = async () => {
  try {
    logger.info('Fetching user location..');
    const headers = getMultipartFormDataHeaders();
    const response = await axiosClient.get(`/user-preferences/location/me`, { headers });
    if (response.status === 200) {
      logger.info(`Fetch user location successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch user location failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch user location encountered an error:', error);
    throw error;
  }
};

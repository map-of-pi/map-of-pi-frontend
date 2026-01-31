import axiosClient from "@/config/client";
import { getMultipartFormDataHeaders } from '@/utils/api';
import logger from '../../logger.config.mjs';

/**
 * Fetch all sellers within map bounds and/or matching search criteria.
 * Core function for the Map view.
 */
export const fetchSellers = async (bounds: L.LatLngBounds, searchQuery?: string) => {
  try {
    logger.debug('Fetching sellers associated with bounds and search query:', { bounds, searchQuery });
    
    // Prepare the request payload with bounds mapping
    const requestPayload: any = {
      bounds: {
        sw_lat: bounds.getSouthWest().lat,
        sw_lng: bounds.getSouthWest().lng,
        ne_lat: bounds.getNorthEast().lat,
        ne_lng: bounds.getNorthEast().lng,
      }
    };
    
    if (searchQuery) {
      requestPayload.search_query = searchQuery.trim();
    }
    
    const response = await axiosClient.post('/sellers/fetch', requestPayload);
    
    if (response.status === 200) {
      logger.info(`Fetch sellers successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch sellers failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch sellers encountered an error:', error);
    throw new Error('Failed to fetch sellers. Please try again later.');
  }
};

/**
 * Fetch a single seller's public profile data.
 */
export const fetchSingleSeller = async (sellerId: string) => {
  try {
    logger.info(`Fetching single seller with ID: ${sellerId}`);
    const response = await axiosClient.get(`/sellers/${sellerId}`);
    if (response.status === 200) {
      logger.info(`Fetch single seller successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch single seller failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch single seller encountered an error:', error);
    throw new Error('Failed to fetch single seller. Please try again later.');
  }
};

/**
 * Fetch authenticated seller's registration details.
 */
export const fetchSellerRegistration = async () => {
  try {
    logger.info('Fetching seller registration info..');
    const response = await axiosClient.post('/sellers/me');
    if (response.status === 200) {
      logger.info(`Fetch seller registration successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch seller registration failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch seller registration encountered an error:', error);
    throw new Error('Failed to fetch seller registration. Please try again later.');
  }
};

/**
 * Register or update seller profile using multipart/form-data.
 * Critical for handling merchant logos and license images.
 */
export const registerSeller = async (formData: FormData) => {
  try {
    logger.info('Creating or updating seller registration with formData..');
    const headers = getMultipartFormDataHeaders();

    const response = await axiosClient.put('/sellers/register', formData, { headers });

    if (response.status === 200) {
      logger.info(`Create or update seller registration successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Create or update seller registration failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Create or update seller registration encountered an error:', error);
    throw new Error('Failed to register seller. Please try again later.');
  }
};

/**
 * Fetch all catalog items for a specific merchant.
 * Enhanced to support pagination via query parameters while maintaining backward compatibility.
 */
export const fetchSellerItems = async (sellerId: string, page: number = 1, limit: number = 10) => {
  try {
    logger.info(`Fetching paginated seller items associated with sellerID: ${sellerId}, Page: ${page}`);
    
    // Using params object to ensure query strings (?page=X&limit=Y) are correctly appended
    const response = await axiosClient.get(`/sellers/item/${sellerId}`, {
      params: { page, limit }
    });

    if (response.status === 200) {
      logger.info(`Fetch seller items successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch seller items failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Fetch seller items encountered an error:', error);
    throw new Error('Failed to fetch seller items. Please try again later.');
  }
};

/**
 * Add or update a product/item in the seller catalog.
 */
export const addOrUpdateSellerItem = async (formData: FormData) => {
  try {
    logger.info('Creating or updating seller item with formData..');
    const headers = getMultipartFormDataHeaders();

    const response = await axiosClient.put('/sellers/item/add', formData, { headers });

    if (response.status === 200) {
      logger.info(`Add or update seller item successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Add or update seller item failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Add or update seller item encountered an error:', error);
    throw new Error('Failed to add or update seller item. Please try again later.');
  }
};

/**
 * Permanently delete a seller item.
 */
export const deleteSellerItem = async (itemId: string) => {
  try {
    logger.info(`Deleting seller item with itemID: ${itemId}`);
    const response = await axiosClient.delete(`/sellers/item/delete/${itemId}`);
    if (response.status === 200) {
      logger.info(`Delete seller item successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Delete seller item failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error('Delete seller item encountered an error:', error);
    throw new Error('Failed to delete seller item. Please try again later.');
  }
};

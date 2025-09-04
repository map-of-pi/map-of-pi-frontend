import axiosClient from "@/config/client";
import { getMultipartFormDataHeaders } from '@/utils/api';
import logger from '../../logger.config.mjs';

// Fetch all sellers or sellers within bounds and/ or matching search criteria
export const fetchSellers = async (bounds: L.LatLngBounds, searchQuery?: string) => {
  try {
    logger.debug('Fetching sellers associated with bounds and search query:', { bounds, searchQuery });
    
    // Prepare the request payload with bounds
    const requestPayload: any = {
      bounds: {
        sw_lat: bounds.getSouthWest().lat,
        sw_lng: bounds.getSouthWest().lng,
        ne_lat: bounds.getNorthEast().lat,
        ne_lng: bounds.getNorthEast().lng,
      }
    };
    
    if (searchQuery) {
      // Split the search query into an array of words
      requestPayload.search_query = searchQuery.split(' ').filter(term => term.length > 0);
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

// Register or update seller
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

// Fetch all seller items associated with the seller
export const fetchSellerItems = async (sellerId: string) => {
  try {
    logger.info(`Fetching seller items associated with sellerID: ${sellerId}`);
    const response = await axiosClient.get(`/sellers/item/${sellerId}`);
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

// Add or update seller item
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

// Delete a seller item
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
  
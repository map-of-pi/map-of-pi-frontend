import axiosClient from "@/config/client";
import { getMultipartFormDataHeaders } from '@/utils/api';
import logger from '../../logger.config.mjs';

// Fetch all sellers or sellers within bounds and/ or matching search criteria
export const fetchSellers = async (bounds: L.LatLngBounds, searchQuery?: string) => {
  try {
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
      requestPayload.search_query = searchQuery.trim();
    }
    
    const response = await axiosClient.post('/sellers/fetch', requestPayload);
    
    if (response.status === 200) {
      return response.data;
    } 

    if (response.status === 204) {
      return [];
    }
      
    return null;

  } catch (error) {
    throw new Error('Failed to fetch sellers. Please try again later.');
  }
};
  
export const fetchSingleSeller = async (sellerId: string) => {
  try {
    const response = await axiosClient.get(`/sellers/${sellerId}`);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error('Failed to fetch single seller. Please try again later.');
  }
};

export const fetchSellerRegistration = async () => {
  try {
    logger.info('Fetching seller registration info..');
    const response = await axiosClient.post('/sellers/me');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Failed to fetch seller registration:', error);
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
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Failed to register seller:', error);
    throw new Error('Failed to register seller. Please try again later.');
  }
};

// Fetch all seller items associated with the seller
export const fetchSellerItems = async (sellerId: string) => {
  try {
    const response = await axiosClient.get(`/sellers/item/${sellerId}`);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error('Failed to fetch seller items. Please try again later.');
  }
};

// Add or update seller item
export const addOrUpdateSellerItem = async (formData: FormData) => {
  try {
    const headers = getMultipartFormDataHeaders();

    const response = await axiosClient.put('/sellers/item/add', formData, { headers });

    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Failed to add or update seller item:', error);
    throw new Error('Failed to add or update seller item. Please try again later.');
  }
};

// Delete a seller item
export const deleteSellerItem = async (itemId: string) => {
  try {
    const response = await axiosClient.delete(`/sellers/item/delete/${itemId}`);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Failed to delete seller item:', error);
    throw new Error('Failed to delete seller item. Please try again later.');
  }
};
  
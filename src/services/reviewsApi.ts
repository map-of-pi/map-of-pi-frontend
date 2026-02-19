import axiosClient from "@/config/client";
import { getMultipartFormDataHeaders } from "@/utils/api";
import logger from '../../logger.config.mjs';

/**
 * Fetch a single review by its ID.
 * @param reviewID - The unique identifier of the review.
 */
export const fetchSingleReview = async (reviewID: string) => {
  try {
    logger.info(`Fetching single review with ID: ${reviewID}`);
    const response = await axiosClient.get(`/review-feedback/single/${reviewID}`);
    
    if (response.status === 200) {
      logger.info(`Fetch single review successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch single review failed with Status ${response.status}`);
      return null;
    }
  } catch (error: any) {
    logger.error(`Fetch single review for ${reviewID} encountered an error:`, error);
    throw new Error('Failed to fetch single review. Please try again later.');
  }
};
  
/**
 * Fetch reviews for a specific seller/user.
 * Improved to handle potential server timeouts and heavy data loads (e.g., Warangkana9565 case).
 * @param userId - The ID or username of the seller.
 * @param searchQuery - Optional search filter.
 */
export const fetchReviews = async (userId: string, searchQuery: string = '') => {
  try {
    // Sanitize input to avoid common trailing space issues
    const sanitizedUserId = userId.trim();
    
    logger.info(`Fetching reviews for seller with ID: ${sanitizedUserId}`);
    
    const response = await axiosClient.get(`/review-feedback/${sanitizedUserId}`, {
      params: { searchQuery },
    });

    if (response.status === 200) {
      logger.info(`Fetch reviews successful for ${sanitizedUserId} with Status ${response.status}`);
      return response.data;
    } else {
      logger.warn(`Fetch reviews returned non-200 status: ${response.status}`);
      return null;
    }
  } catch (error: any) {
    // Advanced error handling for server limits, timeouts, or 500 errors
    if (error.response) {
      const { status } = error.response;
      logger.error(`Server Error ${status} while fetching reviews for ${userId}`);
      
      if (status === 500) {
        // High data volume or backend crash - throwing specific message for UI differentiation
        throw new Error('SERVER_DATA_LIMIT_ERROR');
      }
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      logger.error(`Request timeout for user: ${userId}. The response took too long.`);
      throw new Error('SERVER_TIMEOUT_ERROR');
    }

    logger.error(`Fetch reviews for ${userId} encountered an unexpected error:`, error);
    throw new Error('Failed to fetch reviews. Please check the username or try again later.');
  }
};
  
/**
 * Create a new review with multipart/form-data support.
 */
export const createReview = async (formData: FormData) => {
  try {
    logger.info('Creating a new review with formData..');
    const headers = getMultipartFormDataHeaders();

    const response = await axiosClient.post('/review-feedback/add', formData, { headers });
    
    if (response.status === 200) {
      logger.info(`Create review successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Create review failed with Status ${response.status}`);
      return null;
    }
  } catch (error: any) {
    logger.error('Create review encountered an error:', error);
    throw new Error('Failed to create review. Please try again later.');
  }
};

/**
 * Update an existing review by ID.
 */
export const updateReview = async (review_id: string, formData: FormData) => {
  try {
    logger.info(`Updating review with ID: ${review_id}`);
    const headers = getMultipartFormDataHeaders();

    const response = await axiosClient.put(
      `/review-feedback/update/${review_id}`,
      formData,
      { headers }
    );

    if (response.status === 200) {
      logger.info(`Update review successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Update review failed with Status ${response.status}`);
      return null;
    }
  } catch (error: any) {
    logger.error(`Update review for reviewID ${review_id} encountered an error:`, error);
    throw new Error('Failed to update review. Please try again later.');
  }
};

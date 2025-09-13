import axiosClient from "@/config/client";
import { getMultipartFormDataHeaders } from "@/utils/api";
import logger from '../../logger.config.mjs';

// Fetch a single review for a seller
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
  } catch (error) {
    logger.error(`Fetch single review for ${ reviewID } encountered an error:`, error);
    throw new Error('Failed to fetch single review. Please try again later.');
  }
};
  
// Fetch reviews for a seller
export const fetchReviews = async (userId:string, searchQuery:string='') => {
  try {
    logger.info(`Fetching reviews for seller with ID: ${userId}`);
    const response = await axiosClient.get(`/review-feedback/${userId}`, {
      params: { searchQuery },
    });
    if (response.status === 200) {
      logger.info(`Fetch reviews successful with Status ${response.status}`, {
        data: response.data
      });
      return response.data;
    } else {
      logger.error(`Fetch reviews failed with Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logger.error(`Fetch reviews for ${ userId } encountered an error:`, error);
    throw new Error('Failed to fetch reviews. Please try again later.');
  }
};
  
// Create a new review
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
  } catch (error) {
    logger.error('Create review encountered an error:', error);
    throw new Error('Failed to create review. Please try again later.');
  }
};

// Update an existing review
export const updateReview = async (review_id: string, formData: FormData) => {
  try {
    logger.info(`Updating review with ID: ${review_id}`, formData);
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
  } catch (error) {
    logger.error(`Update review for reviewID ${review_id} encountered an error:`, error);
    throw new Error('Failed to update review. Please try again later.');
  }
};

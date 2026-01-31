import axiosClient from "@/config/client";
import logger from '../../logger.config.mjs';

/**
 * fetchToggle
 * Retrieves the state of a specific feature flag from the MERN backend.
 * Essential for remote feature management and controlling rollout of new Web3 features.
 * * @param toggleName - The unique identifier for the feature flag.
 * @returns The toggle data object including its enabled status.
 */
export const fetchToggle = async (toggleName: string) => {
  try {
    logger.info(`Fetching toggle with ID: ${toggleName}`);
    
    // Direct request to backend without altering existing structure
    const { data } = await axiosClient.get(`/toggles/${toggleName}`);
    
    logger.info(`Fetch toggle successful for ${toggleName}`, { data });
    return data;
  } catch (error) {
    logger.error(`Fetch toggle for ${ toggleName } encountered an error:`, error);
    // Preserving original error handling to maintain application stability
    throw new Error('Failed to fetch toggle. Please try again later.');
  }
};

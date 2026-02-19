import axios from 'axios';

/**
 * Backend API base URL sourced from environment variables.
 */
const backendURL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Axios instance configuration.
 * Increased timeout to 60,000ms (60s) to handle high-volume data requests 
 * and prevent gateway timeout errors reported in the review fetching process.
 */
const axiosClient = axios.create({ 
  baseURL: backendURL, 
  timeout: 60000, // Optimized from 20s to 60s for better stability with large datasets
  withCredentials: true
});

/**
 * Sets or removes the Authorization header for all API requests.
 * @param token - The JWT token to be used for authentication.
 */
export const setAuthToken = (token: string) => {
  if (token) {
    return (axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`);
  } else {
    return delete axiosClient.defaults.headers.common['Authorization'];
  }
};

export default axiosClient;

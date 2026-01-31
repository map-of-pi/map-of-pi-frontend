/**
 * getMultipartFormDataHeaders
 * Utility function to generate headers for multipart/form-data requests.
 * Essential for API calls involving file uploads, such as merchant logos or review images.
 *
 */
export const getMultipartFormDataHeaders = () => {
  return {
    'Content-Type': 'multipart/form-data',
  };
};

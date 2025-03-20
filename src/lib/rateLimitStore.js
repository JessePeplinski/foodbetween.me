// src/lib/rateLimitStore.js

/**
 * Server-side store for rate limit information
 * This allows checking rate limits without making additional API calls
 */

// In-memory storage for rate limit data by endpoint
// This will be shared across all instances of the rate limiter
const rateLimitStore = {
    endpoints: {},
    getEndpointData: (endpoint) => {
      return rateLimitStore.endpoints[endpoint] || null;
    },
    setEndpointData: (endpoint, data) => {
      rateLimitStore.endpoints[endpoint] = data;
    },
    getAllEndpoints: () => {
      return rateLimitStore.endpoints;
    }
  };
  
  /**
   * Updates the rate limit information in the store when an actual API call is made
   * @param {string} endpoint - The API endpoint identifier
   * @param {object} data - Rate limit data including limit, remaining, reset, etc.
   */
  export const updateRateLimitData = (endpoint, data) => {
    rateLimitStore.setEndpointData(endpoint, {
      ...data,
      updatedAt: Date.now()
    });
  };
  
  /**
   * Gets the rate limit data for an endpoint without making an API call
   * @param {string} endpoint - The API endpoint identifier
   * @returns {object|null} - The rate limit data or null if not available
   */
  export const getRateLimitData = (endpoint) => {
    return rateLimitStore.getEndpointData(endpoint);
  };
  
  /**
   * Gets rate limit data for all endpoints
   * @returns {object} - Object with rate limit data for all endpoints
   */
  export const getAllRateLimitData = () => {
    return rateLimitStore.getAllEndpoints();
  };
  
  // Export the store for use in the rate limiter
  export default rateLimitStore;
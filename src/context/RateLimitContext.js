'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Define API cost constants (in USD)
// These are approximate costs based on Google Maps API pricing
const API_COSTS = {
  geocode: 0.005, // $0.005 per geocoding request
  places: 0.02,   // $0.02 per place details request
  midpoint: 0.01  // $0.01 per request (including distance matrix calculations)
};

// Create the context
const RateLimitContext = createContext(null);

// Custom hook to use the rate limit context
export const useRateLimits = () => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimits must be used within a RateLimitProvider');
  }
  return context;
};

// Provider component
export const RateLimitProvider = ({ children }) => {
  const [limits, setLimits] = useState({
    geocode: null,
    places: null,
    midpoint: null
  });
  const [costs, setCosts] = useState({
    geocode: { calls: 0, cost: 0 },
    places: { calls: 0, cost: 0 },
    midpoint: { calls: 0, cost: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sessionStartTime] = useState(new Date()); // To track session duration

  // Function to track API calls and costs
  const trackApiCall = (endpoint, count = 1) => {
    setCosts(prevCosts => {
      const endpointCost = prevCosts[endpoint] || { calls: 0, cost: 0 };
      const costPerCall = API_COSTS[endpoint] || 0;
      
      return {
        ...prevCosts,
        [endpoint]: {
          calls: endpointCost.calls + count,
          cost: endpointCost.cost + (costPerCall * count)
        }
      };
    });
  };

  // Function to reset tracking for a specific endpoint
  const resetTracking = (endpoint) => {
    setCosts(prevCosts => ({
      ...prevCosts,
      [endpoint]: { calls: 0, cost: 0 }
    }));
  };

  // Function to reset all tracking
  const resetAllTracking = () => {
    setCosts({
      geocode: { calls: 0, cost: 0 },
      places: { calls: 0, cost: 0 },
      midpoint: { calls: 0, cost: 0 }
    });
  };

  // Get total cost across all endpoints
  const getTotalCost = () => {
    return Object.values(costs).reduce((total, endpoint) => total + endpoint.cost, 0);
  };

  // Function to fetch rate limits from the dedicated non-impacting endpoint
  const fetchRateLimits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the dedicated rate limits endpoint to avoid impacting quota
      const response = await fetch('/api/rate-limits');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rate limits: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch rate limits');
      }
      
      const limitsData = result.data;
      
      // Process results into a structured format
      const newLimits = {};
      
      // Process each endpoint's data
      for (const [endpoint, data] of Object.entries(limitsData)) {
        if (data) {
          const prevLimit = limits[endpoint];
          
          // IMPORTANT: We're removing this API usage tracking from the rate limit checker
          // This was causing phantom cost increases without actual API calls
          /*
          const prevUsed = prevLimit ? prevLimit.used || 0 : 0;
          const currentUsed = data.used || 0;
          
          // If used count increased, track the API calls
          if (currentUsed > prevUsed) {
            const newCalls = currentUsed - prevUsed;
            trackApiCall(endpoint, newCalls);
          }
          */
          
          newLimits[endpoint] = {
            limit: data.limit || 0,
            remaining: data.remaining || 0,
            reset: data.reset ? new Date(data.reset * 1000) : null,
            used: data.used || 0,
            updatedAt: data.updatedAt || Date.now()
          };
        }
      }
      
      setLimits(newLimits);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching rate limits:', err);
      setError('Failed to load rate limits');
    } finally {
      setLoading(false);
    }
  };

  // Check if any API has reached its rate limit
  const hasReachedRateLimit = () => {
    const endpointNames = Object.keys(limits);
    
    // If we don't have data yet, assume not rate limited
    if (endpointNames.length === 0 || endpointNames.every(name => !limits[name])) {
      return false;
    }
    
    // Check if any endpoint has 0 remaining requests
    return endpointNames.some(name => {
      const endpoint = limits[name];
      return endpoint && endpoint.remaining === 0;
    });
  };

  // Get the endpoint with the lowest remaining requests (for warnings)
  const getLowestRemainingEndpoint = () => {
    const endpointNames = Object.keys(limits).filter(name => limits[name]);
    if (endpointNames.length === 0) return null;
    
    return endpointNames.reduce((lowest, name) => {
      if (!lowest) return name;
      
      const current = limits[name];
      const lowestEndpoint = limits[lowest];
      
      if (!current || !lowestEndpoint) return lowest;
      
      // Compare remaining/limit ratios to find the endpoint with lowest relative remaining
      const currentRatio = current.remaining / current.limit;
      const lowestRatio = lowestEndpoint.remaining / lowestEndpoint.limit;
      
      return currentRatio < lowestRatio ? name : lowest;
    }, null);
  };

  // Get time until reset for specific endpoint
  const getTimeUntilReset = (endpointName) => {
    const endpoint = limits[endpointName];
    if (!endpoint || !endpoint.reset) return null;
    
    const now = new Date();
    const resetTime = endpoint.reset;
    const diffMs = resetTime - now;
    
    if (diffMs <= 0) return 'less than a minute';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return `${diffSeconds} seconds`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    const remainingSeconds = diffSeconds % 60;
    
    if (diffMinutes === 1) {
      return remainingSeconds > 0 
        ? `1 minute and ${remainingSeconds} seconds` 
        : '1 minute';
    }
    
    return remainingSeconds > 0 
      ? `${diffMinutes} minutes and ${remainingSeconds} seconds` 
      : `${diffMinutes} minutes`;
  };

  // Calculate session duration in human-readable format
  const getSessionDuration = () => {
    const now = new Date();
    const diffMs = now - sessionStartTime;
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'less than a minute';
    if (diffMinutes === 1) return '1 minute';
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 1) return `${diffMinutes} minutes`;
    
    const remainingMinutes = diffMinutes % 60;
    return remainingMinutes > 0 
      ? `${diffHours} hour${diffHours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` 
      : `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  };

  // Fetch rate limits on first render and every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchRateLimits();
    
    // Set up interval for periodic updates
    const intervalId = setInterval(fetchRateLimits, 30000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  // The value that will be passed to consumers of this context
  const value = {
    limits,
    costs,
    loading,
    error,
    lastUpdated,
    fetchRateLimits,
    hasReachedRateLimit,
    getLowestRemainingEndpoint,
    getTimeUntilReset,
    trackApiCall,
    resetTracking,
    resetAllTracking,
    getTotalCost,
    getSessionDuration,
    API_COSTS
  };

  return (
    <RateLimitContext.Provider value={value}>
      {children}
    </RateLimitContext.Provider>
  );
};
'use client';

import { createContext, useState, useContext, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to fetch rate limits from API endpoints
  const fetchRateLimits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make ping requests to each API endpoint to get rate limit headers
      const endpoints = [
        { name: 'geocode', url: '/api/geocode?ping=true' },
        { name: 'places', url: '/api/places?ping=true' },
        { name: 'midpoint', url: '/api/midpoint?ping=true' }
      ];
      
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint.url);
            
            return {
              name: endpoint.name,
              limit: response.headers.get('X-RateLimit-Limit'),
              remaining: response.headers.get('X-RateLimit-Remaining'),
              reset: response.headers.get('X-RateLimit-Reset')
            };
          } catch (err) {
            // If an individual endpoint fails, just return null for that endpoint
            console.error(`Error fetching rate limit for ${endpoint.name}:`, err);
            return { name: endpoint.name, error: err.message };
          }
        })
      );
      
      // Process results into a more structured format
      const newLimits = results.reduce((acc, result) => {
        if (!result.error) {
          acc[result.name] = {
            limit: parseInt(result.limit || '0'),
            remaining: parseInt(result.remaining || '0'),
            reset: result.reset ? new Date(parseInt(result.reset) * 1000) : null
          };
        }
        return acc;
      }, {});
      
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
    loading,
    error,
    lastUpdated,
    fetchRateLimits,
    hasReachedRateLimit,
    getLowestRemainingEndpoint,
    getTimeUntilReset
  };

  return (
    <RateLimitContext.Provider value={value}>
      {children}
    </RateLimitContext.Provider>
  );
};
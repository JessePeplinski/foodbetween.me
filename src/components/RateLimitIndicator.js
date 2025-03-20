// src/components/RateLimitIndicator.js
'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';

const RateLimitIndicator = () => {
  const [limits, setLimits] = useState({
    geocode: null,
    places: null,
    midpoint: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

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
    } catch (err) {
      console.error('Error fetching rate limits:', err);
      setError('Failed to load rate limits');
    } finally {
      setLoading(false);
    }
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
  
  // Helper function to format time until reset
  const formatTimeRemaining = (resetTime) => {
    if (!resetTime) return 'Unknown';
    
    const now = new Date();
    const diffMs = resetTime - now;
    
    if (diffMs <= 0) return 'Now';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    return `${diffMinutes}m ${diffSeconds % 60}s`;
  };
  
  // Calculate overall usage status
  const getOverallStatus = () => {
    // If any endpoint is near limit (< 20% remaining), show warning
    const endpoints = Object.values(limits).filter(l => l);
    
    if (endpoints.length === 0) return 'unknown';
    
    const anyNearLimit = endpoints.some(endpoint => {
      if (!endpoint.limit || !endpoint.remaining) return false;
      return (endpoint.remaining / endpoint.limit) < 0.2;
    });
    
    if (anyNearLimit) return 'warning';
    return 'good';
  };
  
  const statusColor = {
    good: 'text-green-600',
    warning: 'text-amber-500',
    unknown: 'text-gray-500'
  };
  
  return (
    <div className="relative">
      {/* Collapsed view - just shows an icon */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${expanded ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        aria-label="API Rate Limits"
      >
        <Activity 
          className={`h-4 w-4 ${loading ? 'animate-pulse text-gray-400' : statusColor[getOverallStatus()]}`} 
        />
        <span className="text-xs font-medium">API Limits</span>
      </button>
      
      {/* Expanded view - shows detailed rate limit info */}
      {expanded && (
        <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 min-w-60">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">API Rate Limits</h3>
            <button 
              onClick={() => fetchRateLimits()}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              Refresh
            </button>
          </div>
          
          {loading && <p className="text-sm text-gray-500">Loading limits...</p>}
          
          {error && (
            <div className="text-sm text-red-500 flex items-center gap-1 mb-2">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <div className="space-y-3">
              {Object.entries(limits).map(([name, data]) => {
                if (!data) return null;
                
                const usagePercentage = data.limit ? Math.max(0, 100 - (data.remaining / data.limit * 100)) : 0;
                const getBarColor = () => {
                  if (usagePercentage > 80) return 'bg-red-500';
                  if (usagePercentage > 60) return 'bg-amber-500';
                  return 'bg-green-500';
                };
                
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium capitalize">{name}</span>
                      <span className="text-gray-500">
                        {data.remaining} / {data.limit} remaining
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      <div className={`h-full ${getBarColor()}`} style={{ width: `${usagePercentage}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Resets in: {formatTimeRemaining(data.reset)}
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  These limits refresh every minute. Excessive usage may result in temporary rate limiting.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RateLimitIndicator;
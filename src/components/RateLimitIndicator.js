// src/components/RateLimitIndicator.js
'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { useRateLimits } from '@/context/RateLimitContext';

const RateLimitIndicator = () => {
  const { 
    limits, 
    loading, 
    error, 
    fetchRateLimits,
    hasReachedRateLimit
  } = useRateLimits();
  
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Set up a timer to update the current time every second when expanded
  useEffect(() => {
    // Only set up timer when the panel is expanded
    if (!expanded) return;
    
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up interval on unmount or when panel is closed
    return () => clearInterval(intervalId);
  }, [expanded]);
  
  // Helper function to format time until reset with live updates
  const formatTimeRemaining = (resetTime) => {
    if (!resetTime) return 'Unknown';
    
    const diffMs = resetTime - currentTime;
    
    if (diffMs <= 0) return 'Now';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    const remainingSeconds = diffSeconds % 60;
    
    return `${diffMinutes}m ${remainingSeconds}s`;
  };
  
  // Calculate overall usage status
  const getOverallStatus = () => {
    // If rate limit is reached, return 'critical'
    if (hasReachedRateLimit()) return 'critical';
    
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
    critical: 'text-red-600',
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
        <span className={`text-xs font-medium ${hasReachedRateLimit() ? 'text-red-600' : ''}`}>
          {hasReachedRateLimit() ? 'Rate Limited' : 'API Limits'}
        </span>
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
          
          {hasReachedRateLimit() && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              <AlertCircle className="inline-block h-4 w-4 mr-1 mb-1" />
              Rate limit reached! Please wait for limits to reset.
            </div>
          )}
          
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
                  if (usagePercentage >= 100) return 'bg-red-600';
                  if (usagePercentage > 80) return 'bg-red-500';
                  if (usagePercentage > 60) return 'bg-amber-500';
                  return 'bg-green-500';
                };
                
                // Determine if this endpoint is reset (timer reached 0)
                const isReset = data.reset && data.reset <= currentTime;
                
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium capitalize">{name}</span>
                      <span className={`${data.remaining === 0 && !isReset ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {data.remaining} / {data.limit} remaining
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      <div 
                        className={`h-full ${getBarColor()} transition-all duration-300`} 
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>
                        Resets in: {formatTimeRemaining(data.reset)}
                      </span>
                      {isReset && (
                        <span className="text-green-600">
                          ✓ Reset
                        </span>
                      )}
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
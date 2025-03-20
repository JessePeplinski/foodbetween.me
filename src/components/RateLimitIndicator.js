// src/components/RateLimitIndicator.js
'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle, DollarSign, RotateCw, Clock } from 'lucide-react';
import { useRateLimits } from '@/context/RateLimitContext';

const RateLimitIndicator = () => {
  const { 
    limits, 
    costs,
    loading, 
    error, 
    fetchRateLimits,
    hasReachedRateLimit,
    resetAllTracking,
    getTotalCost,
    getSessionDuration,
    API_COSTS
  } = useRateLimits();
  
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('limits'); // 'limits' or 'costs'
  
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
  
  // Helper function to format cost to 2 decimal places with dollar sign
  const formatCost = (cost) => {
    return `$${cost.toFixed(2)}`;
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
  
  // Get the style for a tab button
  const getTabStyle = (tab) => {
    return `px-3 py-1.5 text-xs font-medium rounded ${
      tab === activeTab 
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    } transition-colors`;
  };
  
  // Get total cost of all API calls
  const totalCost = getTotalCost();
  
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
        {totalCost > 0 && (
          <span className="text-xs font-medium text-blue-600 ml-1">
            {formatCost(totalCost)}
          </span>
        )}
      </button>
      
      {/* Expanded view - shows detailed rate limit info */}
      {expanded && (
        <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 w-72">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">API Usage</h3>
            <div className="flex gap-1">
              <button 
                onClick={() => fetchRateLimits()}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center p-1"
                title="Refresh"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              {activeTab === 'costs' && (
                <button 
                  onClick={() => resetAllTracking()}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center p-1"
                  title="Reset cost tracking"
                >
                  <Clock className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="flex mb-4 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            <button 
              className={getTabStyle('limits')}
              onClick={() => setActiveTab('limits')}
            >
              <span className="flex items-center">
                <Activity className="h-3.5 w-3.5 mr-1" />
                Limits
              </span>
            </button>
            <button 
              className={getTabStyle('costs')}
              onClick={() => setActiveTab('costs')}
            >
              <span className="flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                Costs
              </span>
            </button>
          </div>
          
          {hasReachedRateLimit() && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              <AlertCircle className="inline-block h-4 w-4 mr-1 mb-1" />
              Rate limit reached! Please wait for limits to reset.
            </div>
          )}
          
          {loading && <p className="text-sm text-gray-500">Loading data...</p>}
          
          {error && (
            <div className="text-sm text-red-500 flex items-center gap-1 mb-2">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
          
          {!loading && !error && activeTab === 'limits' && (
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
            </div>
          )}
          
          {!loading && !error && activeTab === 'costs' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Session duration: {getSessionDuration()}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800 flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Cost</span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{formatCost(totalCost)}</span>
              </div>
              
              <div className="space-y-3">
                {Object.entries(API_COSTS).map(([apiName, costPerCall]) => {
                  const apiCost = costs[apiName] || { calls: 0, cost: 0 };
                  return (
                    <div key={apiName} className="border-b pb-2 border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium capitalize">{apiName}</span>
                        <span className="text-xs">{formatCost(apiCost.cost)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 items-center">
                        <span>Rate: {formatCost(costPerCall)} per call</span>
                        <span>{apiCost.calls} call{apiCost.calls !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  Cost estimates are based on Google Maps API pricing. Actual billing may vary.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'limits' && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500">
                These limits refresh every minute. Excessive usage may result in temporary rate limiting.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RateLimitIndicator;
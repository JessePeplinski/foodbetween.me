// Add this code to src/app/api/rate-limits/route.js to ensure all endpoints are initialized

import { NextResponse } from 'next/server';
import { getAllRateLimitData, getRateLimitData, updateRateLimitData } from '@/lib/rateLimitStore';

// Initialize default rate limits for all endpoints
const initializeRateLimits = () => {
  const endpoints = ['geocode', 'places', 'midpoint'];
  const currentTime = Date.now();
  
  endpoints.forEach(endpoint => {
    // Only initialize if endpoint doesn't have data
    if (!getRateLimitData(endpoint)) {
      // Use the default rate limits from the API routes
      const maxRequests = 
        endpoint === 'geocode' ? 30 : 
        endpoint === 'places' ? 20 : 
        endpoint === 'midpoint' ? 15 : 60;
      
      updateRateLimitData(endpoint, {
        limit: maxRequests,
        remaining: maxRequests,
        reset: Math.ceil((currentTime + 60000) / 1000), // Reset in 1 minute
        used: 0
      });
    }
  });
};

/**
 * API endpoint for checking rate limits without impacting quota
 * This endpoint does not count against the user's rate limit
 */
export async function GET(request) {
  // Initialize rate limits before returning data
  initializeRateLimits();
  
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  // If an endpoint is specified, return data for just that endpoint
  if (endpoint) {
    const endpointData = getRateLimitData(endpoint);
    
    if (!endpointData) {
      return NextResponse.json(
        { success: false, error: 'No data available for the specified endpoint' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        [endpoint]: endpointData
      }
    });
  }
  
  // Otherwise return data for all endpoints
  const allData = getAllRateLimitData();
  
  return NextResponse.json({
    success: true,
    data: allData
  });
}
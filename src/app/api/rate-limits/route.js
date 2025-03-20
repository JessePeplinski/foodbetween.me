// src/app/api/rate-limits/route.js
import { NextResponse } from 'next/server';
import { getAllRateLimitData, getRateLimitData } from '@/lib/rateLimitStore';

/**
 * API endpoint for checking rate limits without impacting quota
 * This endpoint does not count against the user's rate limit
 */
export async function GET(request) {
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
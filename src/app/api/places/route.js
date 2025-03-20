// src/app/api/places/route.js
import { NextResponse } from 'next/server';
import { mockApi, shouldUseMock } from '@/lib/mockApi';
import { rateLimit } from '@/lib/rateLimiter';

export async function GET(request) {
  // Apply rate limiting (20 requests per minute for places search)
  const rateLimitResult = rateLimit(request, { maxRequests: 20 });
  if (rateLimitResult.isRateLimited) return rateLimitResult;

  const { searchParams } = new URL(request.url);
  
  // Handle ping requests for rate limit checking
  if (searchParams.get('ping') === 'true') {
    return rateLimitResult.getResponse({ success: true, message: 'API is operational' });
  }
  
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '1000'; // Default to 1000m but allow custom radius
  const poiType = searchParams.get('type') || 'restaurant'; // Default to restaurant if not specified
  const limit = parseInt(searchParams.get('limit')) || 3; // Default to 3 results
  
  if (!lat || !lng) {
    return rateLimitResult.getResponse(
      { success: false, error: 'Latitude and longitude are required' },
      400
    );
  }
  
  try {
    // Use mock API if we're in development/testing mode
    if (shouldUseMock()) {
      console.log('[MOCK API] Using mock places API for:', { lat, lng, radius, poiType, limit });
      const mockResponse = await mockApi.findPlaces(lat, lng, radius, poiType);
      // Apply limit to mock data
      if (mockResponse.success && Array.isArray(mockResponse.data)) {
        mockResponse.data = mockResponse.data.slice(0, limit);
      }
      return rateLimitResult.getResponse(mockResponse);
    }
    
    // Otherwise use the real Google API
    // Get nearby places with the specified radius and POI type
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${poiType}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    // Check for real API errors, but treat ZERO_RESULTS as valid
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Nearby Search API error:', data.status, data.error_message);
      return rateLimitResult.getResponse(
        { success: false, error: data.status, message: data.error_message || 'Google Places API error' },
        400
      );
    }
    
    // If no results found, return empty array with metadata
    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      return rateLimitResult.getResponse({
        success: true,
        data: [],
        metadata: {
          searchRadius: parseInt(radius),
          poiType: poiType,
          suggestedRadius: Math.min(parseInt(radius) * 2, 5000), // Suggest double radius, max 5km
          originalLocation: { lat, lng }
        },
        message: `No ${poiType} locations found with the current search radius`
      });
    }
    
    // Get top places based on limit parameter
    const topPlaces = data.results.slice(0, limit);
    
    // Get additional details for each place
    const detailedPlaces = await Promise.all(
      topPlaces.map(async (place) => {
        try {
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_phone_number,opening_hours,website,reviews,vicinity,types,user_ratings_total,geometry,url&key=${process.env.GOOGLE_MAPS_API_KEY}`
          );
          
          const detailsData = await detailsResponse.json();
          
          if (detailsData.status === 'OK') {
            return {
              ...place,
              ...detailsData.result,
            };
          }
          
          return place;
        } catch (error) {
          console.error('Error fetching place details:', error);
          return place;
        }
      })
    );
    
    return rateLimitResult.getResponse({
      success: true,
      data: detailedPlaces,
      metadata: {
        searchRadius: parseInt(radius),
        poiType: poiType,
        resultsLimit: limit,
        originalLocation: { lat, lng }
      }
    });
  } catch (error) {
    console.error('Places API error:', error);
    return rateLimitResult.getResponse(
      { success: false, error: 'Server error', message: error.message },
      500
    );
  }
}
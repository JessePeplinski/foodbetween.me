// src/app/api/geocode/route.js
import { NextResponse } from 'next/server';
import { mockApi, shouldUseMock } from '@/lib/mockApi';
import { rateLimit } from '@/lib/rateLimiter';

export async function GET(request) {
  // Apply rate limiting (30 requests per minute for geocoding)
  const rateLimitResponse = rateLimit(request, { maxRequests: 30 });
  if (rateLimitResponse) return rateLimitResponse;
  
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  // Debug info to log
  console.log('Geocode API called with address:', address);
  console.log('API Key available:', !!process.env.GOOGLE_MAPS_API_KEY);
  console.log('API Key length:', process.env.GOOGLE_MAPS_API_KEY ? process.env.GOOGLE_MAPS_API_KEY.length : 0);
  
  if (!address) {
    return NextResponse.json(
      { success: false, error: 'Address is required' },
      { status: 400 }
    );
  }
  
  try {
    // Use mock API if we're in development/testing mode
    if (shouldUseMock()) {
      console.log('[MOCK API] Using mock geocode API for:', address);
      const mockResponse = await mockApi.geocode(address);
      return NextResponse.json(mockResponse);
    }
    
    // Verify API key is available
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('Missing Google Maps API key in server environment');
      return NextResponse.json(
        { success: false, error: 'Configuration error', detail: 'API key missing' },
        { status: 500 }
      );
    }
    
    // Log the full URL we're about to call (without the actual key)
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=REDACTED`;
    console.log('Calling geocode API:', geocodeUrl);
    
    // Otherwise use the real Google API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    // Log the response status
    console.log('Geocode API response status:', data.status);
    
    if (data.status !== 'OK') {
      console.error('Geocode API error:', data.status, data.error_message || 'No detailed error message');
      return NextResponse.json(
        { 
          success: false, 
          error: data.status,
          message: data.error_message || 'Geocoding failed',
          detail: 'Google API returned non-OK status'
        },
        { status: 400 }
      );
    }
    
    const location = data.results[0].geometry.location;
    
    return NextResponse.json({
      success: true,
      data: {
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address,
      },
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error', 
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
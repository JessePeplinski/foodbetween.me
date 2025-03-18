// src/app/api/places/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '1000'; // Default to 1000m but allow custom radius
  const poiType = searchParams.get('type') || 'restaurant'; // Default to restaurant if not specified
  
  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }
  
  try {
    // Get nearby places with the specified radius and POI type
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${poiType}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    // Check for real API errors, but treat ZERO_RESULTS as valid
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Nearby Search API error:', data.status, data.error_message);
      return NextResponse.json(
        { success: false, error: data.status, message: data.error_message || 'Google Places API error' },
        { status: 400 }
      );
    }
    
    // If no results found, return empty array with metadata
    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      return NextResponse.json({
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
    
    // Get top 3 places
    const topPlaces = data.results.slice(0, 3);
    
    // Get additional details for each place
    const detailedPlaces = await Promise.all(
      topPlaces.map(async (place) => {
        try {
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_phone_number,opening_hours,website,reviews,vicinity,types,user_ratings_total,geometry&key=${process.env.GOOGLE_MAPS_API_KEY}`
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
    
    return NextResponse.json({
      success: true,
      data: detailedPlaces,
      metadata: {
        searchRadius: parseInt(radius),
        poiType: poiType,
        originalLocation: { lat, lng }
      }
    });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}
// src/app/api/places/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }
  
  try {
    // First get nearby places - fixed parameters (removed conflicting rankby)
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=restaurant&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Nearby Search API error:', data.status, data.error_message);
      return NextResponse.json(
        { success: false, error: data.status, message: data.error_message || 'Google Places API error' },
        { status: 400 }
      );
    }
    
    // Check if we have results
    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No places found near the midpoint'
      });
    }
    
    // Get top 3 places
    const topPlaces = data.results.slice(0, 3);
    
    // Get additional details for each place - ADDED GEOMETRY to ensure location data is included
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
    });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}
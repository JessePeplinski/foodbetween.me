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
    // First get nearby places
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=restaurant&rankby=prominence&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return NextResponse.json(
        { success: false, error: data.status },
        { status: 400 }
      );
    }
    
    // Get top 3 places
    const topPlaces = data.results.slice(0, 3);
    
    // Get additional details for each place
    const detailedPlaces = await Promise.all(
      topPlaces.map(async (place) => {
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_phone_number,opening_hours,website,reviews,vicinity,types,user_ratings_total&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === 'OK') {
          return {
            ...place,
            ...detailsData.result,
          };
        }
        
        return place;
      })
    );
    
    return NextResponse.json({
      success: true,
      data: detailedPlaces,
    });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
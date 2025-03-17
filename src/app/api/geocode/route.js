// src/app/api/geocode/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json(
      { success: false, error: 'Address is required' },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return NextResponse.json(
        { success: false, error: data.status },
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
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

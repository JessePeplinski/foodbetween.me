// src/app/api/verify/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check server-side API key
    const serverKey = process.env.GOOGLE_MAPS_API_KEY || 'NOT_SET';
    const serverKeyStatus = serverKey !== 'NOT_SET' 
      ? `Available (${serverKey.substring(0, 3)}...${serverKey.substring(serverKey.length - 3)})`
      : 'Not available';
    
    // Check client-side API key 
    const clientKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'NOT_SET';
    const clientKeyStatus = clientKey !== 'NOT_SET'
      ? `Available (${clientKey.substring(0, 3)}...${clientKey.substring(clientKey.length - 3)})`
      : 'Not available';
    
    // Test geocoding API with a simple address
    let geocodeStatus = 'Not tested';
    let geocodeError = null;
    
    if (serverKey !== 'NOT_SET') {
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=New+York+NY&key=${serverKey}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        geocodeStatus = data.status === 'OK' ? 'Working' : `Error: ${data.status}`;
        geocodeError = data.error_message;
      } catch (error) {
        geocodeStatus = 'Exception';
        geocodeError = error.message;
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      server_key: serverKeyStatus,
      client_key: clientKeyStatus,
      geocode_test: {
        status: geocodeStatus,
        error: geocodeError
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Verification failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
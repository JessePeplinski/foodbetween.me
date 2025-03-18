// src/app/api/midpoint/route.js
import { NextResponse } from 'next/server';

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Helper function to convert radians to degrees
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

// Calculate simple geographic midpoint
function calculateSimpleMidpoint(lat1, lng1, lat2, lng2) {
  return {
    lat: (lat1 + lat2) / 2,
    lng: (lng1 + lng2) / 2
  };
}

// Calculate geographic midpoint using Haversine formula
function calculateGeoMidpoint(lat1, lng1, lat2, lng2) {
  // Convert to radians
  lat1 = toRadians(lat1);
  lng1 = toRadians(lng1);
  lat2 = toRadians(lat2);
  lng2 = toRadians(lng2);
  
  // Calculate cartesian coordinates
  const x1 = Math.cos(lat1) * Math.cos(lng1);
  const y1 = Math.cos(lat1) * Math.sin(lng1);
  const z1 = Math.sin(lat1);
  
  const x2 = Math.cos(lat2) * Math.cos(lng2);
  const y2 = Math.cos(lat2) * Math.sin(lng2);
  const z2 = Math.sin(lat2);
  
  // Calculate midpoint in cartesian space
  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;
  const z = (z1 + z2) / 2;
  
  // Convert back to spherical coordinates
  const lng = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);
  
  // Return midpoint coordinates in degrees
  return {
    lat: toDegrees(lat),
    lng: toDegrees(lng)
  };
}

// Generate potential midpoints along the route
function generatePotentialMidpoints(lat1, lng1, lat2, lng2, numPoints = 5) {
  const points = [];
  
  // Add the basic geographic midpoint
  const geoMidpoint = calculateGeoMidpoint(lat1, lng1, lat2, lng2);
  points.push(geoMidpoint);
  
  // Add points at varying distances along the direct line
  for (let i = 1; i < numPoints; i++) {
    const ratio = 0.3 + (i * 0.1); // Generate points at 0.4, 0.5, 0.6, 0.7 of the way
    const lat = lat1 + (lat2 - lat1) * ratio;
    const lng = lng1 + (lng2 - lng1) * ratio;
    points.push({ lat, lng });
  }
  
  return points;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat1 = parseFloat(searchParams.get('lat1'));
  const lng1 = parseFloat(searchParams.get('lng1'));
  const lat2 = parseFloat(searchParams.get('lat2'));
  const lng2 = parseFloat(searchParams.get('lng2'));
  const strategy = searchParams.get('strategy') || 'optimized'; // Default to optimized
  const poiType = searchParams.get('poiType') || 'restaurant'; // Default to restaurant
  
  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
    return NextResponse.json(
      { success: false, error: 'Valid coordinates for both locations are required' },
      { status: 400 }
    );
  }
  
  try {
    // Simple strategy just returns the geographic midpoint
    if (strategy === 'geographic') {
      const midpoint = calculateGeoMidpoint(lat1, lng1, lat2, lng2);
      
      return NextResponse.json({
        success: true,
        data: {
          midpoint,
          method: 'geographic',
          details: {
            description: 'Direct geographic midpoint using spherical coordinates'
          }
        }
      });
    }
    
    // Simple strategy with arithmetic average
    if (strategy === 'simple') {
      const midpoint = calculateSimpleMidpoint(lat1, lng1, lat2, lng2);
      
      return NextResponse.json({
        success: true,
        data: {
          midpoint,
          method: 'simple',
          details: {
            description: 'Simple arithmetic midpoint calculation'
          }
        }
      });
    }
    
    // POI density strategy (formerly 'restaurants')
    if (strategy === 'restaurants') {
      // 1. Generate several potential midpoints
      const potentialMidpoints = generatePotentialMidpoints(lat1, lng1, lat2, lng2);
      
      // 2. Check POI density for each potential midpoint
      const poiDensities = await Promise.all(
        potentialMidpoints.map(async (point) => {
          try {
            // Query for nearby POIs at this midpoint
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
              `location=${point.lat},${point.lng}&radius=1000&type=${poiType}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            );
            
            const data = await response.json();
            
            return {
              point,
              places: data.status === 'OK' ? data.results.length : 0,
              status: data.status
            };
          } catch (error) {
            console.error(`Error checking ${poiType} density:`, error);
            return { point, places: 0, status: 'ERROR' };
          }
        })
      );
      
      // 3. Choose the midpoint with the most POIs
      poiDensities.sort((a, b) => b.places - a.places);
      const bestMidpoint = poiDensities[0];
      
      return NextResponse.json({
        success: true,
        data: {
          midpoint: bestMidpoint.point,
          method: 'poi_density',
          details: {
            poiCount: bestMidpoint.places,
            poiType: poiType,
            description: `Midpoint optimized for ${poiType} availability`
          }
        }
      });
    }
    
    // Time-based strategy (equidistant by travel time)
    if (strategy === 'time' || strategy === 'optimized') {
      // 1. Generate several potential midpoints
      const potentialMidpoints = generatePotentialMidpoints(lat1, lng1, lat2, lng2);
      
      // 2. Check POI density for each potential midpoint
      const poiDensities = await Promise.all(
        potentialMidpoints.map(async (point) => {
          try {
            // Query for nearby POIs at this midpoint
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
              `location=${point.lat},${point.lng}&radius=1000&type=${poiType}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            );
            
            const data = await response.json();
            
            return {
              point,
              places: data.status === 'OK' ? data.results.length : 0,
              status: data.status
            };
          } catch (error) {
            console.error(`Error checking ${poiType} density:`, error);
            return { point, places: 0, status: 'ERROR' };
          }
        })
      );
      
      // 3. Calculate travel times using Distance Matrix API
      const origins = `${lat1},${lng1}|${lat2},${lng2}`;
      const destinations = potentialMidpoints.map(p => `${p.lat},${p.lng}`).join('|');
      
      const distanceMatrixResponse = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${origins}&destinations=${destinations}&mode=driving&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      
      const distanceData = await distanceMatrixResponse.json();
      
      if (distanceData.status !== 'OK') {
        console.error('Distance Matrix API error:', distanceData.status);
        
        // If Distance Matrix fails, fall back to POI density only
        const bestMidpoint = poiDensities.sort((a, b) => b.places - a.places)[0];
        
        return NextResponse.json({
          success: true,
          data: {
            midpoint: bestMidpoint.point,
            method: 'poi_density_fallback',
            details: {
              poiCount: bestMidpoint.places,
              poiType: poiType,
              description: `Midpoint based on ${poiType} availability (time calculation failed)`
            }
          }
        });
      }
      
      // 4. Score each midpoint based on POI density and travel time fairness
      const scoredMidpoints = potentialMidpoints.map((point, i) => {
        // Get travel times for each person to this midpoint
        const travelTime1 = distanceData.rows[0].elements[i].duration?.value || Infinity;
        const travelTime2 = distanceData.rows[1].elements[i].duration?.value || Infinity;
        
        // Calculate travel time difference (fairness score)
        const travelTimeDifference = Math.abs(travelTime1 - travelTime2);
        const fairnessScore = 1 / (1 + travelTimeDifference / 60); // Normalize to 0-1 range
        
        // Get POI density score
        const poiDensity = poiDensities[i].places;
        const poiScore = Math.min(poiDensity / 10, 1); // Cap at 1.0
        
        // Calculate total score (weighted average)
        const totalScore = (fairnessScore * 0.7) + (poiScore * 0.3);
        
        return {
          point,
          score: totalScore,
          details: {
            fairnessScore,
            poiScore,
            travelTime1: Math.round(travelTime1 / 60), // Convert to minutes
            travelTime2: Math.round(travelTime2 / 60), // Convert to minutes
            poiCount: poiDensity,
            poiType: poiType,
            description: `Midpoint optimized for both travel time fairness and ${poiType} availability`
          }
        };
      });
      
      // 5. Choose the midpoint with the highest score
      scoredMidpoints.sort((a, b) => b.score - a.score);
      const bestMidpoint = scoredMidpoints[0];
      
      return NextResponse.json({
        success: true,
        data: {
          midpoint: bestMidpoint.point,
          method: 'optimized',
          details: bestMidpoint.details
        }
      });
    }
    
    // Default fallback to simple midpoint if strategy is not recognized
    const simpleMidpoint = calculateSimpleMidpoint(lat1, lng1, lat2, lng2);
    
    return NextResponse.json({
      success: true,
      data: {
        midpoint: simpleMidpoint,
        method: 'simple_fallback',
        details: {
          description: 'Simple midpoint calculation (fallback)'
        }
      }
    });
    
  } catch (error) {
    console.error('Midpoint calculation error:', error);
    
    // Fall back to simple midpoint calculation if something goes wrong
    const simpleMidpoint = {
      lat: (lat1 + lat2) / 2,
      lng: (lng1 + lng2) / 2
    };
    
    return NextResponse.json({
      success: true,
      data: {
        midpoint: simpleMidpoint,
        method: 'simple_fallback',
        details: {
          error: error.message,
          description: 'Simple midpoint calculation due to error'
        }
      }
    });
  }
}
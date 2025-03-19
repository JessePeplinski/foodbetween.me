// src/components/Map.js
'use client';

import { useEffect, useRef } from 'react';
import { setupMockGoogleMaps } from '@/lib/mockMapComponents';
import { shouldUseMock } from '@/lib/mockApi';

const Map = ({ center, markers = [], zoom = 12, height = '400px', searchRadius }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  
  useEffect(() => {
    // Determine if we should use mock API
    const useMock = shouldUseMock();
    
    if (useMock) {
      // Use mock Google Maps setup
      console.log('[MOCK] Using mock Google Maps for Map component');
      const mockInitialized = setupMockGoogleMaps();
      
      if (mockInitialized || window.google) {
        initMap();
      }
    } else {
      // Use real Google Maps API
      // Load Google Maps script if not already loaded
      if (!window.google && !document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onload = initMap;
      } else if (window.google) {
        initMap();
      }
    }
  }, []);
  
  useEffect(() => {
    if (googleMapRef.current && center) {
      googleMapRef.current.setCenter(center);
      
      // Update the circle when center changes
      updateCircle();
    }
  }, [center, searchRadius]);
  
  useEffect(() => {
    if (!googleMapRef.current || !markers.length) return;
    
    // Clear previous markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add new markers
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map: googleMapRef.current,
        label: markerData.label,
        title: markerData.title,
      });
      
      markersRef.current.push(marker);
    });
    
    // Update the circle when markers change
    updateCircle();
  }, [markers, searchRadius]);
  
  const updateCircle = () => {
    // Remove previous circle if it exists
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
    
    // If we have a center point and search radius, draw the circle
    if (googleMapRef.current && center && searchRadius) {
      // Find the midpoint marker (usually labeled 'M')
      const midpointMarker = markers.find(marker => marker.label === 'M');
      
      if (midpointMarker) {
        // Create a circle at the midpoint position with the search radius
        circleRef.current = new window.google.maps.Circle({
          map: googleMapRef.current,
          center: midpointMarker.position,
          radius: parseInt(searchRadius),
          fillColor: '#4285F4',
          fillOpacity: 0.1,
          strokeColor: '#4285F4', // Google Maps blue
          strokeOpacity: 0.8,
          strokeWeight: 2,
        });
      }
    }
  };
  
  const initMap = () => {
    if (!mapRef.current) return;
    
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: center || { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom,
    });
    
    // Initialize the circle if search radius is provided
    updateCircle();
  };
  
  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height }}
    />
  );
};

export default Map;
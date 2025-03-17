// src/components/Map.js
'use client';

import { useEffect, useRef } from 'react';

const Map = ({ center, markers = [], zoom = 12, height = '400px' }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  
  useEffect(() => {
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
  }, []);
  
  useEffect(() => {
    if (googleMapRef.current && center) {
      googleMapRef.current.setCenter(center);
    }
  }, [center]);
  
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
  }, [markers]);
  
  const initMap = () => {
    if (!mapRef.current) return;
    
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: center || { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom,
    });
  };
  
  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height }}
    />
  );
};

export default Map;
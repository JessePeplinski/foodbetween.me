// src/components/AddressInput.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setupMockGoogleMaps } from '@/lib/mockMapComponents';
import { shouldUseMock } from '@/lib/mockApi';

// Create a global promise to track the loading of the Google Maps script
let googleMapsPromise = null;

// Function to load the Google Maps script only once
const loadGoogleMapsScript = () => {
  // Check if we should use mock API
  if (shouldUseMock()) {
    console.log('[MOCK] Using mock Google Maps for AddressInput');
    if (!googleMapsPromise) {
      googleMapsPromise = new Promise((resolve) => {
        setupMockGoogleMaps();
        resolve(window.google);
      });
    }
    return googleMapsPromise;
  }
  
  // Real Google Maps implementation
  if (!googleMapsPromise && typeof window !== 'undefined') {
    googleMapsPromise = new Promise((resolve, reject) => {
      // Check if script already exists
      if (window.google) {
        resolve(window.google);
        return;
      }

      // Create script element if it doesn't exist
      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => resolve(window.google);
        script.onerror = (error) => reject(error);
        
        document.head.appendChild(script);
      } else {
        // Script tag exists but might still be loading
        const checkIfLoaded = setInterval(() => {
          if (window.google) {
            clearInterval(checkIfLoaded);
            resolve(window.google);
          }
        }, 100);
      }
    });
  }
  
  return googleMapsPromise;
};

const AddressInput = ({ label, value, onChange }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  useEffect(() => {
    // Use the shared loader function
    loadGoogleMapsScript()
      .then(() => {
        setIsScriptLoaded(true);
        initAutocomplete();
      })
      .catch(error => {
        console.error('Error loading Google Maps script:', error);
      });
    
    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(inputRef.current);
      }
    };
  }, []);
  
  const initAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;
    
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current, 
      { types: ['address'] }
    );
    
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        onChange(place.formatted_address);
      }
    });
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter an address"
        aria-autocomplete="both"
      />
    </div>
  );
};

export default AddressInput;
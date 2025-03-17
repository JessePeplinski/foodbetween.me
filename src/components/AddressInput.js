// src/components/AddressInput.js
'use client';

import { useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddressInput = ({ label, value, onChange }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = initAutocomplete;
    } else if (window.google) {
      initAutocomplete();
    }
    
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(inputRef.current);
      }
    };
  }, []);
  
  const initAutocomplete = () => {
    if (!inputRef.current) return;
    
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
      />
    </div>
  );
};

export default AddressInput;
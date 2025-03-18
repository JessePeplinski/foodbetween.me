// src/components/PoiInput.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Common place types supported by Google Places API
const COMMON_PLACE_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bar', label: 'Bar' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'meal_takeaway', label: 'Takeout' },
  { value: 'meal_delivery', label: 'Food Delivery' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'convenience_store', label: 'Convenience Store' },
  { value: 'lodging', label: 'Hotel/Lodging' },
  { value: 'park', label: 'Park' },
  { value: 'shopping_mall', label: 'Shopping Mall' },
  { value: 'movie_theater', label: 'Movie Theater' },
  { value: 'museum', label: 'Museum' },
  { value: 'gas_station', label: 'Gas Station' },
  { value: 'gym', label: 'Gym' },
  { value: 'library', label: 'Library' },
  { value: 'pharmacy', label: 'Pharmacy' }
];

// Function to load Google Maps script - reusing from AddressInput.js
const loadGoogleMapsScript = () => {
  if (!globalThis.googleMapsPromise && typeof window !== 'undefined') {
    globalThis.googleMapsPromise = new Promise((resolve, reject) => {
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
  
  return globalThis.googleMapsPromise;
};

const PoiInput = ({ label, value, onChange }) => {
  const inputRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || 'Restaurant');
  
  useEffect(() => {
    // Use the shared loader function
    loadGoogleMapsScript()
      .then(() => {
        setIsScriptLoaded(true);
      })
      .catch(error => {
        console.error('Error loading Google Maps script:', error);
      });
  }, []);
  
  useEffect(() => {
    // Set initial value
    if (value) {
      setInputValue(value);
    }
  }, [value]);
  
  const filterSuggestions = (input) => {
    if (!input) return [];
    
    const inputLower = input.toLowerCase();
    return COMMON_PLACE_TYPES.filter(type => 
      type.label.toLowerCase().includes(inputLower) || 
      type.value.toLowerCase().includes(inputLower)
    );
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Filter suggestions based on input
    const filtered = filterSuggestions(value);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    
    // If the exact value matches, pass it to parent
    const exactMatch = COMMON_PLACE_TYPES.find(
      type => type.label.toLowerCase() === value.toLowerCase() || 
              type.value.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      onChange(exactMatch.value);
    } else {
      // For non-exact matches, we'll still update the parent with the text
      // This allows for custom POI types not in our predefined list
      onChange(value.toLowerCase().replace(/\s+/g, '_'));
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.label);
    onChange(suggestion.value); // Pass the API value to parent
    setShowSuggestions(false);
  };
  
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };
  
  return (
    <div className="space-y-2 relative">
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        onBlur={handleInputBlur}
        placeholder="Type of place to search for"
      />
      
      {showSuggestions && (
        <div className="absolute z-10 bg-white shadow-lg rounded-md w-full mt-1 max-h-60 overflow-y-auto border border-gray-200">
          <ul>
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.value}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PoiInput;
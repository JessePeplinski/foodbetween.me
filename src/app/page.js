'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddressInput from '@/components/AddressInput';
import PoiInput from '@/components/PoiInput'; // Import the new POI Input component
import Map from '@/components/Map';
import PlaceCard from '@/components/PlaceCard';
import MidpointOptions from '@/components/MidpointOptions';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [addresses, setAddresses] = useState({
    address1: '',
    address2: '',
  });
  const [poiType, setPoiType] = useState('restaurant'); // Default to restaurant
  const [loading, setLoading] = useState(false);
  const [midpoint, setMidpoint] = useState(null);
  const [places, setPlaces] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [noResultsMessage, setNoResultsMessage] = useState('');
  const [midpointInfo, setMidpointInfo] = useState(null);
  const [searchRadius, setSearchRadius] = useState(1609); // Default to 1 mile (1609 meters)
  const [midpointStrategy, setMidpointStrategy] = useState('optimized');
  const [locations, setLocations] = useState(null); // Store geocoded locations
  
  const handleAddressChange = (key, value) => {
    setAddresses(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handlePoiTypeChange = (value) => {
    setPoiType(value);
    
    // If we already have searched, update the results with the new POI type
    if (midpoint && locations) {
      calculateMidpoint(
        locations.location1.lat,
        locations.location1.lng,
        locations.location2.lat,
        locations.location2.lng,
        midpointStrategy
      );
    }
  };
  
  const handleSearch = async () => {
    if (!addresses.address1 || !addresses.address2) {
      alert('Please enter both addresses');
      return;
    }
    
    setLoading(true);
    setPlaces([]); // Clear existing places
    setNoResultsMessage(''); // Clear any previous messages
    setMidpointInfo(null);
    
    try {
      // Geocode addresses
      const geocodeRes1 = await fetch(`/api/geocode?address=${encodeURIComponent(addresses.address1)}`);
      const geocodeRes2 = await fetch(`/api/geocode?address=${encodeURIComponent(addresses.address2)}`);
      
      const location1 = await geocodeRes1.json();
      const location2 = await geocodeRes2.json();
      
      if (!location1.success || !location2.success) {
        throw new Error('Failed to geocode one or both addresses');
      }
      
      // Store locations for future use
      setLocations({
        location1: location1.data,
        location2: location2.data
      });
      
      // Get midpoint calculation with the selected strategy
      await calculateMidpoint(
        location1.data.lat, 
        location1.data.lng, 
        location2.data.lat, 
        location2.data.lng, 
        midpointStrategy
      );
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
      setLoading(false);
    }
  };
  
  const calculateMidpoint = async (lat1, lng1, lat2, lng2, strategy) => {
    try {
      const midpointRes = await fetch(
        `/api/midpoint?lat1=${lat1}&lng1=${lng1}` +
        `&lat2=${lat2}&lng2=${lng2}&strategy=${strategy}&poiType=${poiType}`
      );
      
      if (!midpointRes.ok) {
        throw new Error(`Midpoint calculation error: ${midpointRes.status}`);
      }
      
      const midpointData = await midpointRes.json();
      
      if (!midpointData.success) {
        throw new Error(midpointData.error || 'Failed to calculate midpoint');
      }
      
      const mid = midpointData.data.midpoint;
      setMidpoint(mid);
      setMidpointInfo(midpointData.data);
      
      // Set markers for the map
      const initialMarkers = [
        { position: { lat: lat1, lng: lng1 }, label: 'A', title: 'Address 1' },
        { position: { lat: lat2, lng: lng2 }, label: 'B', title: 'Address 2' },
        { position: mid, label: 'M', title: 'Meeting Point' },
      ];
      setMarkers(initialMarkers);
      
      // Search for places with the current radius and POI type
      await searchPlaces(mid.lat, mid.lng, searchRadius, initialMarkers);
    } catch (error) {
      console.error('Midpoint calculation error:', error);
      alert(`Failed to calculate midpoint: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const searchPlaces = async (lat, lng, radius, initialMarkers = markers) => {
    setLoading(true);
    try {
      // Find nearby places with specified POI type
      const placesRes = await fetch(`/api/places?lat=${lat}&lng=${lng}&radius=${radius}&type=${poiType}`);
      
      if (!placesRes.ok) {
        throw new Error(`Places API error: ${placesRes.status}`);
      }
      
      const placesData = await placesRes.json();
      
      if (placesData.success) {
        if (Array.isArray(placesData.data) && placesData.data.length > 0) {
          setPlaces(placesData.data);
          setNoResultsMessage('');
          
          // Add place markers for valid places only
          const placeMarkers = placesData.data
            .filter(place => place && place.geometry && place.geometry.location)
            .map((place, index) => ({
              position: place.geometry.location,
              label: `${index + 1}`,
              title: place.name,
            }));
          
          if (placeMarkers.length > 0) {
            setMarkers([...initialMarkers, ...placeMarkers]);
          }
        } else {
          // No places found but API call was successful
          setPlaces([]);
          
          // Format POI type for display
          const formattedPoiType = poiType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Determine if we're using miles or kilometers based on the current radius
          const usingMiles = [1609, 3219, 4828, 8047].includes(radius);
          const distanceDisplay = usingMiles 
            ? `${Math.round(radius/1609)} mile${radius > 1609 ? 's' : ''}` 
            : `${radius/1000} km`;
            
          setNoResultsMessage(
            `No ${formattedPoiType} locations found within ${distanceDisplay} of the meeting point. ` +
            `Try a different meeting point method, change the POI type, or increase the search radius.`
          );
          setMarkers(initialMarkers); // Reset to just the initial markers
        }
      } else {
        // API returned an error
        throw new Error(placesData.error || 'Failed to find places');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred searching for places: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (midpoint) {
      searchPlaces(midpoint.lat, midpoint.lng, newRadius);
    }
  };
  
  const handleStrategyChange = (strategy) => {
    setMidpointStrategy(strategy);
    
    // If we already have locations, recalculate midpoint with new strategy
    if (locations) {
      calculateMidpoint(
        locations.location1.lat,
        locations.location1.lng,
        locations.location2.lat,
        locations.location2.lng,
        strategy
      );
    }
  };
  
  // Helper function to format POI type for display
  const formatPoiType = (type) => {
    if (!type) return 'Places';
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Food Between Me</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <AddressInput 
          label="Address 1"
          value={addresses.address1}
          onChange={(value) => handleAddressChange('address1', value)}
        />
        <AddressInput 
          label="Address 2"
          value={addresses.address2}
          onChange={(value) => handleAddressChange('address2', value)}
        />
      </div>
      
      {/* New POI Input */}
      <div className="mb-6">
        <PoiInput
          label="Points of Interest"
          value={poiType}
          onChange={handlePoiTypeChange}
        />
      </div>
      
      <div className="flex justify-center mb-8">
        <Button 
          onClick={handleSearch}
          disabled={loading}
          className="px-8"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : 'Search'}
        </Button>
      </div>
      
      {midpoint && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Map Column */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Map 
                  center={midpoint} 
                  markers={markers}
                  zoom={13}
                  height="400px"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Options Column */}
          <div className="md:col-span-1">
            <MidpointOptions 
              midpointInfo={midpointInfo}
              searchRadius={searchRadius}
              poiType={poiType}
              onRadiusChange={handleRadiusChange}
              onStrategyChange={handleStrategyChange}
              selectedStrategy={midpointStrategy}
            />
          </div>
        </div>
      )}
      
      {noResultsMessage && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-amber-800">{noResultsMessage}</p>
        </div>
      )}
      
      {places.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Top {formatPoiType(poiType)} Near Meeting Point</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {places.map((place, index) => (
              <PlaceCard key={place.place_id} place={place} index={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
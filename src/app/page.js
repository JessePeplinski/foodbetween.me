'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddressInput from '@/components/AddressInput';
import PoiInput from '@/components/PoiInput'; // Import the new POI Input component
import Map from '@/components/Map';
import MapSkeleton from '@/components/MapSkeleton'; // Import the MapSkeleton component
import PlaceCard from '@/components/PlaceCard';
import MidpointOptions from '@/components/MidpointOptions';
import MidpointOptionsSkeleton from '@/components/MidpointOptionsSkeleton'; // Import the MidpointOptionsSkeleton
import PlaceCardsSkeleton from '@/components/PlaceCardsSkeleton'; // Import the PlaceCardsSkeleton
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
  const [resultsLimit, setResultsLimit] = useState(3); // Default to 3 results
  const [locations, setLocations] = useState(null); // Store geocoded locations
  const [mapLoading, setMapLoading] = useState(false); // Map loading state
  const [optionsLoading, setOptionsLoading] = useState(false); // Options loading state
  const [placesLoading, setPlacesLoading] = useState(false); // Places loading state
  const [searchStarted, setSearchStarted] = useState(false); // Track if search has been initiated
  
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
  
  const handleResultsLimitChange = (value) => {
    // Set the new limit first
    setResultsLimit(value);
    
    // If we already have midpoint, update the results with the new limit
    if (midpoint) {
      // Start places loading when results limit changes
      setPlacesLoading(true);
      
      // Use a small timeout to ensure state is updated before the API call
      setTimeout(() => {
        // Make sure we're passing the new value directly rather than relying on state
        searchPlaces(midpoint.lat, midpoint.lng, searchRadius, markers.slice(0, 3), value);
      }, 50);
    }
  };
  
  const handleSearch = async () => {
    if (!addresses.address1 || !addresses.address2) {
      alert('Please enter both addresses');
      return;
    }
    
    // Set all loading states to true
    setLoading(true);
    setMapLoading(true);
    setOptionsLoading(true);
    setPlacesLoading(true);
    setSearchStarted(true); // Indicate search has started to show skeletons
    
    // Clear existing data
    setPlaces([]);
    setNoResultsMessage('');
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
      // Reset all loading states on error
      setLoading(false);
      setMapLoading(false);
      setOptionsLoading(false);
      setPlacesLoading(false);
    }
  };
  
  const calculateMidpoint = async (lat1, lng1, lat2, lng2, strategy) => {
    // Set loading states for midpoint calculation
    setMapLoading(true);
    setOptionsLoading(true);
    
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
      
      // Options loading can end now that we have midpoint data
      setOptionsLoading(false);
      
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
      
      // Reset loading states on error
      setMapLoading(false);
      setOptionsLoading(false);
      setPlacesLoading(false);
      setLoading(false);
    }
  };
  
  const searchPlaces = async (lat, lng, radius, initialMarkers = markers, limit = null) => {
    // Set loading states for places search
    setLoading(true);
    setPlacesLoading(true); // Ensure places are in loading state
    
    // Use the provided limit or fall back to the state value
    const currentLimit = limit !== null ? limit : resultsLimit;
    
    try {
      // Find nearby places with specified POI type and limit
      const placesRes = await fetch(`/api/places?lat=${lat}&lng=${lng}&radius=${radius}&type=${poiType}&limit=${currentLimit}`);
      
      if (!placesRes.ok) {
        throw new Error(`Places API error: ${placesRes.status}`);
      }
      
      const placesData = await placesRes.json();
      
      if (placesData.success) {
        if (Array.isArray(placesData.data) && placesData.data.length > 0) {
          // Store the actual returned places
          setPlaces(placesData.data);
          setNoResultsMessage('');
          
          // Reset markers to just initial markers (A, B, M)
          // Then add new place markers for valid places only
          const placeMarkers = placesData.data
            .filter(place => place && place.geometry && place.geometry.location)
            .map((place, index) => ({
              position: place.geometry.location,
              label: `${index + 1}`,
              title: place.name,
            }));
          
          if (placeMarkers.length > 0) {
            // Use only the base markers (typically A, B, M) and add the new place markers
            const baseMarkers = initialMarkers.filter(marker => 
              ['A', 'B', 'M'].includes(marker.label)
            );
            setMarkers([...baseMarkers, ...placeMarkers]);
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
      // End all loading states after places are loaded
      setLoading(false);
      setMapLoading(false);
      setPlacesLoading(false);
    }
  };
  
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (midpoint) {
      // Start loading states when radius changes
      setMapLoading(true);
      setPlacesLoading(true);
      searchPlaces(midpoint.lat, midpoint.lng, newRadius);
    }
  };
  
  const handleStrategyChange = (strategy) => {
    setMidpointStrategy(strategy);
    
    // If we already have locations, recalculate midpoint with new strategy
    if (locations) {
      // Start all loading states when strategy changes
      setMapLoading(true);
      setOptionsLoading(true);
      setPlacesLoading(true);
      
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
      <h1 className="text-2xl font-bold mb-8 text-center">Find Places Between Addresses</h1>
      
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
      
      {/* Map Section with Skeleton Loading State */}
      {(searchStarted || midpoint) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Map Column with Conditional Rendering */}
          <div className="md:col-span-2">
            {mapLoading ? (
              <MapSkeleton height="400px" />
            ) : midpoint ? (
              <Card>
                <CardContent className="p-0">
                  <Map 
                    center={midpoint} 
                    markers={markers}
                    zoom={13}
                    height="400px"
                    searchRadius={searchRadius}
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>
          
          {/* Options Column with Skeleton */}
          <div className="md:col-span-1">
            {optionsLoading ? (
              <MidpointOptionsSkeleton />
            ) : midpointInfo ? (
              <MidpointOptions 
                midpointInfo={midpointInfo}
                searchRadius={searchRadius}
                poiType={poiType}
                resultsLimit={resultsLimit}
                onRadiusChange={handleRadiusChange}
                onStrategyChange={handleStrategyChange}
                onResultsLimitChange={handleResultsLimitChange}
                selectedStrategy={midpointStrategy}
              />
            ) : null}
          </div>
        </div>
      )}
            
      {noResultsMessage && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-amber-800">{noResultsMessage}</p>
        </div>
      )}
      
      {/* Places Section with Skeleton Loading */}
      {searchStarted && (
        <>
          {placesLoading ? (
            <PlaceCardsSkeleton />
          ) : places.length > 0 ? (
            <div className="results">
              <h2 className="text-2xl font-semibold mb-4">Top {places.length} {formatPoiType(poiType)} Near Meeting Point</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {places.map((place, index) => (
                  <PlaceCard key={place.place_id} place={place} index={index + 1} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
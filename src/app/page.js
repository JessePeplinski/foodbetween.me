'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddressInput from '@/components/AddressInput';
import Map from '@/components/Map';
import PlaceCard from '@/components/PlaceCard';

export default function Home() {
  const [addresses, setAddresses] = useState({
    address1: '',
    address2: '',
  });
  const [loading, setLoading] = useState(false);
  const [midpoint, setMidpoint] = useState(null);
  const [places, setPlaces] = useState([]);
  const [markers, setMarkers] = useState([]);
  
  const handleAddressChange = (key, value) => {
    setAddresses(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSearch = async () => {
    if (!addresses.address1 || !addresses.address2) {
      alert('Please enter both addresses');
      return;
    }
    
    setLoading(true);
    
    try {
      // Geocode addresses
      const geocodeRes1 = await fetch(`/api/geocode?address=${encodeURIComponent(addresses.address1)}`);
      const geocodeRes2 = await fetch(`/api/geocode?address=${encodeURIComponent(addresses.address2)}`);
      
      const location1 = await geocodeRes1.json();
      const location2 = await geocodeRes2.json();
      
      if (!location1.success || !location2.success) {
        throw new Error('Failed to geocode one or both addresses');
      }
      
      // Calculate midpoint
      const mid = {
        lat: (location1.data.lat + location2.data.lat) / 2,
        lng: (location1.data.lng + location2.data.lng) / 2,
      };
      
      setMidpoint(mid);
      
      // Set markers for the map
      setMarkers([
        { position: location1.data, label: 'A', title: 'Address 1' },
        { position: location2.data, label: 'B', title: 'Address 2' },
        { position: mid, label: 'M', title: 'Midpoint' },
      ]);
      
      // Find nearby places
      const placesRes = await fetch(`/api/places?lat=${mid.lat}&lng=${mid.lng}`);
      const placesData = await placesRes.json();
      
      if (placesData.success) {
        setPlaces(placesData.data);
        
        // Add place markers
        const placeMarkers = placesData.data.map((place, index) => ({
          position: place.geometry.location,
          label: `${index + 1}`,
          title: place.name,
        }));
        
        setMarkers(prev => [...prev, ...placeMarkers]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Food Between Me</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
      
      <div className="flex justify-center mb-8">
        <Button 
          onClick={handleSearch}
          disabled={loading}
          className="px-8"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      {midpoint && (
        <div className="mb-8">
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
      )}
      
      {places.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Top Places Near Midpoint</h2>
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
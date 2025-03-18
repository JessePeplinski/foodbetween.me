// src/components/MidpointOptions.js
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, Clock, MapPin, Repeat } from 'lucide-react';

const MidpointOptions = ({ 
  midpointInfo,
  searchRadius = 1609, // Default to 1 mile in meters
  poiType = 'restaurant', // Default to restaurant
  onRadiusChange,
  onStrategyChange,
  selectedStrategy = 'optimized'
}) => {
  const [unitType, setUnitType] = useState('miles'); // Default to miles
  
  // Simplified strategy options
  const strategies = [
    { 
      id: 'optimized', 
      name: 'Time and distance', 
      description: 'Finds a spot with similar travel times for both people, with the best POI options',
      icon: <Clock className="h-4 w-4" /> 
    },
    { 
      id: 'geographic', 
      name: 'Geographic midpoint', 
      description: 'Uses the actual middle point between both addresses',
      icon: <MapPin className="h-4 w-4" /> 
    }
  ];
  
  // Radius options based on unit type
  const radiusOptions = unitType === 'miles' 
    ? [
        { value: 1609, label: '1 mi' },
        { value: 3219, label: '2 mi' },
        { value: 4828, label: '3 mi' },
        { value: 8047, label: '5 mi' }
      ]
    : [
        { value: 1000, label: '1 km' },
        { value: 2000, label: '2 km' },
        { value: 3000, label: '3 km' },
        { value: 5000, label: '5 km' }
      ];
      
  // Toggle between miles and kilometers
  const toggleUnitType = () => {
    const newUnitType = unitType === 'miles' ? 'kilometers' : 'miles';
    setUnitType(newUnitType);
    
    // Convert current radius to the new unit
    let newRadius;
    if (newUnitType === 'miles') {
      // Convert from km to miles (approximate conversion)
      newRadius = Math.round(searchRadius / 1000 * 1609);
    } else {
      // Convert from miles to km (approximate conversion)
      newRadius = Math.round(searchRadius / 1609 * 1000);
    }
    
    // Find the closest standard radius value
    const closestOption = radiusOptions.reduce((prev, curr) => {
      return (Math.abs(curr.value - newRadius) < Math.abs(prev.value - newRadius)) 
        ? curr 
        : prev;
    });
    
    onRadiusChange(closestOption.value);
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
    <div className="space-y-4 mt-2 border border-gray-200 rounded-lg p-4 bg-white">
      <div>
        <h3 className="text-lg font-semibold mb-2">Meeting Point Options</h3>
        
        {/* Description of current midpoint method */}
        {midpointInfo && midpointInfo.details && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">
                {
                  midpointInfo.method === 'optimized' || midpointInfo.method === 'time' ? 'Time and Distance Meeting Point' :
                  'Geographic Midpoint'
                }
              </h4>
              <div className="text-xs mt-1">
                {midpointInfo.details.description && (
                  <p>{midpointInfo.details.description}</p>
                )}
                {midpointInfo.details.travelTime1 !== undefined && (
                  <>
                    <p>Travel time from Address 1: ~{midpointInfo.details.travelTime1} minutes</p>
                    <p>Travel time from Address 2: ~{midpointInfo.details.travelTime2} minutes</p>
                  </>
                )}
                {(midpointInfo.details.poiCount !== undefined || midpointInfo.details.restaurantCount !== undefined) && (
                  <p>Nearby {formatPoiType(midpointInfo.details.poiType || poiType)}: {midpointInfo.details.poiCount || midpointInfo.details.restaurantCount}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Simplified Strategy Selection */}
      <div>
        <Label className="mb-2 block">Calculation Method</Label>
        <div className="grid grid-cols-1 gap-2">
          {strategies.map(strategy => (
            <div key={strategy.id}>
              <Button
                variant={selectedStrategy === strategy.id ? 'default' : 'outline'}
                size="sm"
                className="justify-start w-full"
                onClick={() => onStrategyChange(strategy.id)}
              >
                {strategy.icon}
                <span className="ml-2">{strategy.name}</span>
              </Button>
              <p className="text-xs text-gray-500 mt-1 ml-1">{strategy.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search Radius Selection */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Search Radius</Label>
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 px-2 flex items-center gap-1"
            onClick={toggleUnitType}
          >
            <Repeat className="h-3 w-3" />
            {unitType === 'miles' ? 'Switch to km' : 'Switch to miles'}
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {radiusOptions.map(option => (
            <Button
              key={option.value}
              variant={searchRadius === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRadiusChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MidpointOptions;
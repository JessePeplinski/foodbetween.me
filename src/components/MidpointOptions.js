// src/components/MidpointOptions.js
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, Search, MapPin, Repeat } from 'lucide-react';

const MidpointOptions = ({ 
  midpointInfo,
  searchRadius = 1609, // Default to 1 mile in meters
  onRadiusChange,
  onStrategyChange,
  onMidpointSelect,
  selectedStrategy = 'optimized',
  allMidpoints = []
}) => {
  const [showAllMidpoints, setShowAllMidpoints] = useState(false);
  const [unitType, setUnitType] = useState('miles'); // Default to miles
  
  const strategies = [
    { id: 'optimized', name: 'Optimized (Time & Restaurants)', icon: <Search className="h-4 w-4" /> },
    { id: 'time', name: 'Equal Travel Time', icon: <Search className="h-4 w-4" /> },
    { id: 'restaurants', name: 'Most Restaurants', icon: <Search className="h-4 w-4" /> },
    { id: 'geographic', name: 'Geographic Midpoint', icon: <MapPin className="h-4 w-4" /> }
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
                  midpointInfo.method === 'optimized' ? 'Optimized Meeting Point' :
                  midpointInfo.method === 'restaurants' ? 'Restaurant-Rich Meeting Point' :
                  midpointInfo.method === 'time' ? 'Equal Travel Time Meeting Point' :
                  midpointInfo.method === 'geographic' ? 'Geographic Midpoint' :
                  'Simple Midpoint'
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
                {midpointInfo.details.restaurantCount !== undefined && (
                  <p>Nearby restaurants: {midpointInfo.details.restaurantCount}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Strategy Selection */}
      <div>
        <Label className="mb-2 block">Calculation Method</Label>
        <div className="grid grid-cols-1 gap-2">
          {strategies.map(strategy => (
            <Button
              key={strategy.id}
              variant={selectedStrategy === strategy.id ? 'default' : 'outline'}
              size="sm"
              className="justify-start"
              onClick={() => onStrategyChange(strategy.id)}
            >
              {strategy.icon}
              <span className="ml-2">{strategy.name}</span>
            </Button>
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
      
      {/* Alternative Midpoints (if available) */}
      {allMidpoints.length > 1 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Alternative Meeting Points</Label>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setShowAllMidpoints(!showAllMidpoints)}
              className="h-auto p-0"
            >
              {showAllMidpoints ? 'Hide' : 'Show'} ({allMidpoints.length - 1})
            </Button>
          </div>
          
          {showAllMidpoints && (
            <div className="space-y-2 mt-2">
              {allMidpoints.map((point, index) => (
                <div 
                  key={index}
                  className={`p-2 border rounded-md ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'} cursor-pointer hover:border-blue-400`}
                  onClick={() => onMidpointSelect(point)}
                >
                  <h5 className="text-sm font-medium">Option {index + 1}</h5>
                  <div className="text-xs mt-1 space-y-1">
                    {point.restaurantCount !== undefined && (
                      <p>Nearby restaurants: {point.restaurantCount}</p>
                    )}
                    {point.travelTime1 !== undefined && (
                      <>
                        <p>Travel time A: ~{point.travelTime1} min</p>
                        <p>Travel time B: ~{point.travelTime2} min</p>
                      </>
                    )}
                    {point.score !== undefined && (
                      <p>Score: {Math.round(point.score * 100)}/100</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MidpointOptions;
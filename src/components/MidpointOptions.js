// src/components/MidpointOptions.js
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Repeat } from 'lucide-react';

const MidpointOptions = ({
  searchRadius = 1609,
  onRadiusChange,
  resultsLimit = 3,
  onResultsLimitChange
}) => {
  const [unitType, setUnitType] = useState('miles');
  const [expanded, setExpanded] = useState(true);

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

  const resultsOptions = [
    { value: 3, label: '3' },
    { value: 6, label: '6' },
    { value: 9, label: '9' },
    { value: 12, label: '12' }
  ];

  const toggleUnitType = () => {
    const newUnitType = unitType === 'miles' ? 'kilometers' : 'miles';
    setUnitType(newUnitType);

    let newRadius;
    if (newUnitType === 'miles') {
      newRadius = Math.round(searchRadius / 1000 * 1609);
    } else {
      newRadius = Math.round(searchRadius / 1609 * 1000);
    }

    const newRadiusOptions = newUnitType === 'miles'
      ? [{ value: 1609 }, { value: 3219 }, { value: 4828 }, { value: 8047 }]
      : [{ value: 1000 }, { value: 2000 }, { value: 3000 }, { value: 5000 }];

    const closestOption = newRadiusOptions.reduce((prev, curr) => {
      return (Math.abs(curr.value - newRadius) < Math.abs(prev.value - newRadius))
        ? curr
        : prev;
    });

    onRadiusChange(closestOption.value);
  };

  const currentRadiusLabel = radiusOptions.find(r => r.value === searchRadius)?.label || '1 mi';

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div>
          <h3 className="text-sm font-semibold">Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentRadiusLabel} radius · {resultsLimit} results
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Search Radius */}
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

          {/* Results Limit */}
          <div>
            <Label className="mb-2 block">Number of Results</Label>
            <div className="grid grid-cols-4 gap-2">
              {resultsOptions.map(option => (
                <Button
                  key={option.value}
                  variant={resultsLimit === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onResultsLimitChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MidpointOptions;

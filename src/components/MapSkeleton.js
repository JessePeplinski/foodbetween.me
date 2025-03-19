// src/components/MapSkeleton.js
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const MapSkeleton = ({ height = '400px' }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div 
          className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center"
          style={{ width: '100%', height }}
        >
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          
          {/* Pulsing dots to indicate loading */}
          <div className="flex space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-ping" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-ping" style={{ animationDelay: '300ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-ping" style={{ animationDelay: '600ms' }}></div>
          </div>
          
          <div className="text-gray-500 dark:text-gray-400 text-sm">Calculating meeting point...</div>
          
          {/* Fake map elements */}
          <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded mt-8"></div>
          <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
          <div className="w-2/3 h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
          
          {/* Fake map controls */}
          <div className="absolute top-4 right-4">
            <div className="w-8 h-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapSkeleton;
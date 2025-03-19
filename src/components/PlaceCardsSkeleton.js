// src/components/PlaceCardsSkeleton.js
'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PlaceCardSkeleton = () => {
  return (
    <Card className="h-full animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-5 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-700 mr-2"></div>
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start">
            <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700 mr-2 mt-1"></div>
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700 mr-2"></div>
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        
        <div className="h-16 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
        
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
};

const PlaceCardsSkeleton = () => {
  return (
    <div className="results">
      <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
      </div>
    </div>
  );
};

export default PlaceCardsSkeleton;
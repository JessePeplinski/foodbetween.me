// src/components/MidpointOptionsSkeleton.js
'use client';

const MidpointOptionsSkeleton = () => {
  return (
    <div className="space-y-4 mt-2 border border-gray-200 rounded-lg p-4 bg-white animate-pulse">
      <div>
        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      </div>
      
      {/* Calculation Method Section */}
      <div>
        <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
        <div className="grid grid-cols-1 gap-2">
          <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mt-1"></div>
          <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mt-1"></div>
        </div>
      </div>
      
      {/* Search Radius Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <div className="h-5 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-7 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      
      {/* Number of Results Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <div className="h-5 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default MidpointOptionsSkeleton;
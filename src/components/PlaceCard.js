// src/components/PlaceCard.js
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ExternalLink, Copy, Clock } from "lucide-react";

const PlaceCard = ({ place, index }) => {
  const copyAddress = () => {
    if (place.vicinity) {
      navigator.clipboard.writeText(place.vicinity);
      alert('Address copied to clipboard!');
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold">
            {index}. {place.name}
          </CardTitle>
          {place.opening_hours && (
            <div className={`text-sm font-medium flex items-center ${place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
              <Clock className="h-4 w-4 mr-1" />
              {place.opening_hours.open_now ? 'Open' : 'Closed'}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {place.types?.map(type => type.replace(/_/g, ' ')).slice(0, 2).join(', ')}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {place.rating && (
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-1" />
            <span className="font-medium">{place.rating}</span>
            {place.user_ratings_total && (
              <span className="text-sm text-gray-500 ml-1">
                ({place.user_ratings_total} reviews)
              </span>
            )}
          </div>
        )}
        
        <div className="text-sm">
          <p className="mb-1">{place.vicinity}</p>
          {place.formatted_phone_number && (
            <p>{place.formatted_phone_number}</p>
          )}
        </div>
        
        {place.reviews && place.reviews.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top Review:</p>
            <p className="text-xs italic">{place.reviews[0].text.slice(0, 100)}...</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {place.website && (
            <Button variant="outline" size="sm" onClick={() => window.open(place.website, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-1" /> Visit Website
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copyAddress}>
            <Copy className="h-4 w-4 mr-1" /> Copy Address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;
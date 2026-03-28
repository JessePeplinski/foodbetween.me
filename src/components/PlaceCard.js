// src/components/PlaceCard.js
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Clock, MapPin } from "lucide-react";

const PlaceCard = ({ place, index }) => {
  if (!place || !place.name) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold">
            {index}. {place.name}
          </CardTitle>
          {place.opening_hours && typeof place.opening_hours.open_now === 'boolean' && (
            <div className={`text-sm font-medium flex items-center shrink-0 ${place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
              <Clock className="h-4 w-4 mr-1" />
              {place.opening_hours.open_now ? 'Open' : 'Closed'}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {typeof place.rating === 'number' && (
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="font-medium text-sm">{place.rating}</span>
            {typeof place.user_ratings_total === 'number' && (
              <span className="text-sm text-gray-500 ml-1">
                ({place.user_ratings_total})
              </span>
            )}
          </div>
        )}

        {place.vicinity && (
          <div className="flex items-start text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5 shrink-0" />
            <p>{place.vicinity}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaceCard;

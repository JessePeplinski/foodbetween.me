  // src/lib/mockApi.js

  // Mock data for geocoding responses
  const mockGeocodingData = {
    "123 Main St, New York, NY": {
      success: true,
      data: {
        lat: 40.7128,
        lng: -74.006,
        formatted_address: "123 Main St, New York, NY 10001, USA"
      }
    },
    "456 Broadway, Brooklyn, NY": {
      success: true,
      data: {
        lat: 40.6782,
        lng: -73.9442,
        formatted_address: "456 Broadway, Brooklyn, NY 11211, USA"
      }
    },
    "789 Market St, San Francisco, CA": {
      success: true,
      data: {
        lat: 37.7749,
        lng: -122.4194,
        formatted_address: "789 Market St, San Francisco, CA 94103, USA"
      }
    },
    "1 Infinite Loop, Cupertino, CA": {
      success: true,
      data: {
        lat: 37.3318,
        lng: -122.0312,
        formatted_address: "1 Infinite Loop, Cupertino, CA 95014, USA"
      }
    }
  };

  // For any address not in our mock data, generate a random nearby location
  const generateRandomLocation = (address) => {
    // Base location (New York City by default)
    const baseLat = 40.7128;
    const baseLng = -74.006;
    
    // Generate a random offset (-0.1 to 0.1 degrees)
    const latOffset = (Math.random() - 0.5) * 0.2;
    const lngOffset = (Math.random() - 0.5) * 0.2;
    
    return {
      success: true,
      data: {
        lat: baseLat + latOffset,
        lng: baseLng + lngOffset,
        formatted_address: `${address} (Mock Address)`
      }
    };
  };

  // Mock places data
  const mockPlacesData = {
    restaurants: [
      {
        place_id: "mock-place-1",
        name: "Mock Restaurant One",
        vicinity: "123 Mock Street",
        rating: 4.5,
        user_ratings_total: 356,
        types: ["restaurant", "food", "establishment"],
        geometry: {
          location: { lat: 40.7129, lng: -74.007 }
        },
        opening_hours: {
          open_now: true
        },
        website: "https://example.com/restaurant1",
        formatted_phone_number: "(123) 456-7890",
        url: "https://maps.google.com/?cid=12345",
        reviews: [
          {
            text: "This is a great mock restaurant with excellent food and service. Would definitely recommend to anyone looking for a nice meal.",
            rating: 5
          }
        ]
      },
      {
        place_id: "mock-place-2",
        name: "Mock Cafe Two",
        vicinity: "456 Mock Avenue",
        rating: 4.2,
        user_ratings_total: 218,
        types: ["cafe", "food", "establishment"],
        geometry: {
          location: { lat: 40.7131, lng: -74.005 }
        },
        opening_hours: {
          open_now: true
        },
        website: "https://example.com/cafe2",
        formatted_phone_number: "(123) 456-7891",
        url: "https://maps.google.com/?cid=12346",
        reviews: [
          {
            text: "Cozy atmosphere with decent coffee. The staff is friendly but it can get crowded during peak hours.",
            rating: 4
          }
        ]
      },
      {
        place_id: "mock-place-3",
        name: "Mock Bistro Three",
        vicinity: "789 Mock Boulevard",
        rating: 4.7,
        user_ratings_total: 482,
        types: ["restaurant", "bistro", "establishment"],
        geometry: {
          location: { lat: 40.7127, lng: -74.003 }
        },
        opening_hours: {
          open_now: false
        },
        website: "https://example.com/bistro3",
        formatted_phone_number: "(123) 456-7892",
        url: "https://maps.google.com/?cid=12347",
        reviews: [
          {
            text: "Exceptional food and ambiance. Their specialty dishes are worth trying. A bit on the pricey side but worth every penny.",
            rating: 5
          }
        ]
      }
    ],
    cafe: [
      {
        place_id: "mock-cafe-1",
        name: "Mock Coffee House",
        vicinity: "123 Coffee Lane",
        rating: 4.3,
        user_ratings_total: 287,
        types: ["cafe", "coffee", "establishment"],
        geometry: {
          location: { lat: 40.7129, lng: -74.007 }
        },
        opening_hours: {
          open_now: true
        },
        website: "https://example.com/coffee1",
        formatted_phone_number: "(123) 456-7893",
        url: "https://maps.google.com/?cid=12348",
        reviews: [
          {
            text: "Great coffee and pastries. The staff is friendly and efficient. Good place to work or meet friends.",
            rating: 4
          }
        ]
      }
    ],
    bar: [
      {
        place_id: "mock-bar-1",
        name: "Mock Tavern",
        vicinity: "123 Pub Street",
        rating: 4.6,
        user_ratings_total: 328,
        types: ["bar", "pub", "establishment"],
        geometry: {
          location: { lat: 40.7129, lng: -74.007 }
        },
        opening_hours: {
          open_now: true
        },
        website: "https://example.com/tavern1",
        formatted_phone_number: "(123) 456-7894",
        url: "https://maps.google.com/?cid=12349",
        reviews: [
          {
            text: "Great selection of craft beers. The bartenders are knowledgeable and the atmosphere is laid back.",
            rating: 5
          }
        ]
      }
    ]
  };

  // Generate places for any POI type not in our mock data
  const generateMockPlacesForType = (poiType) => {
    return [
      {
        place_id: `mock-${poiType}-1`,
        name: `Mock ${poiType.replace('_', ' ')} One`,
        vicinity: "123 Mock Street",
        rating: 4.2 + Math.random() * 0.8, // Random rating between 4.2 and 5.0
        user_ratings_total: Math.floor(Math.random() * 400) + 100, // Random number between 100 and 500
        types: [poiType, "establishment"],
        geometry: {
          location: { lat: 40.7129 + (Math.random() - 0.5) * 0.01, lng: -74.007 + (Math.random() - 0.5) * 0.01 }
        },
        opening_hours: {
          open_now: Math.random() > 0.3 // 70% chance of being open
        },
        website: `https://example.com/${poiType}1`,
        formatted_phone_number: `(123) 456-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        url: `https://maps.google.com/?cid=${Math.floor(Math.random() * 100000)}`,
        reviews: [
          {
            text: `This is a great mock ${poiType.replace('_', ' ')} with excellent service. Would definitely recommend to anyone looking for a good experience.`,
            rating: 5
          }
        ]
      },
      {
        place_id: `mock-${poiType}-2`,
        name: `Mock ${poiType.replace('_', ' ')} Two`,
        vicinity: "456 Mock Avenue",
        rating: 3.8 + Math.random() * 0.8, // Random rating between 3.8 and 4.6
        user_ratings_total: Math.floor(Math.random() * 300) + 50, // Random number between 50 and 350
        types: [poiType, "establishment"],
        geometry: {
          location: { lat: 40.7131 + (Math.random() - 0.5) * 0.01, lng: -74.005 + (Math.random() - 0.5) * 0.01 }
        },
        opening_hours: {
          open_now: Math.random() > 0.3 // 70% chance of being open
        },
        website: `https://example.com/${poiType}2`,
        formatted_phone_number: `(123) 456-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        url: `https://maps.google.com/?cid=${Math.floor(Math.random() * 100000)}`,
        reviews: [
          {
            text: `Decent ${poiType.replace('_', ' ')} with good service. Could improve in some areas but overall satisfactory.`,
            rating: 4
          }
        ]
      }
    ];
  };

  // Mock midpoint calculation
  const calculateMockMidpoint = (lat1, lng1, lat2, lng2, strategy) => {
    // Simple midpoint calculation
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;
    
    // Add small random variation to make it look more realistic
    const latVariation = (Math.random() - 0.5) * 0.01;
    const lngVariation = (Math.random() - 0.5) * 0.01;
    
    const midpoint = {
      lat: midLat + latVariation,
      lng: midLng + lngVariation
    };
    
    let details = {
      description: 'Mock midpoint calculation'
    };
    
    // Generate mock distance data (in meters)
    // Calculate approximate distances
    const distance1 = Math.floor(Math.random() * 5000) + 5000; // 5-10km
    const distance2 = Math.floor(Math.random() * 5000) + 5000; // 5-10km
    
    // If geographic strategy, make distances more balanced
    if (strategy === 'geographic') {
      details = {
        ...details,
        description: 'Direct geographic midpoint using spherical coordinates',
        travelTime1: Math.floor(distance1 / 1000 * 2), // ~ 2 min per km
        travelTime2: Math.floor(distance2 / 1000 * 2), // ~ 2 min per km
        distance1,
        distance2
      };
    }
    
    // If optimized or time strategy, add travel time details
    else if (strategy === 'optimized' || strategy === 'time') {
      details = {
        ...details,
        description: 'Midpoint optimized for both travel time fairness and POI availability',
        fairnessScore: 0.85 + Math.random() * 0.15, // Random score between 0.85 and 1.0
        poiScore: 0.7 + Math.random() * 0.3, // Random score between 0.7 and 1.0
        travelTime1: Math.floor(Math.random() * 10) + 15, // Random time between 15-25 minutes
        travelTime2: Math.floor(Math.random() * 10) + 15, // Random time between 15-25 minutes
        distance1,
        distance2,
        poiCount: Math.floor(Math.random() * 15) + 5, // Random count between 5-20
        poiType: 'restaurant'
      };
    }
    
    return {
      success: true,
      data: {
        midpoint,
        method: strategy,
        details
      }
    };
  };

  // Export mock API functions
  export const mockApi = {
    // Geocode an address to coordinates
    geocode: async (address) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if we have pre-defined mock data for this address
      if (mockGeocodingData[address]) {
        return mockGeocodingData[address];
      }
      
      // Otherwise generate a random location
      return generateRandomLocation(address);
    },
    
    // Find places near a location
    findPlaces: async (lat, lng, radius, poiType = 'restaurant') => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if we have mock data for this POI type
      let places;
      if (mockPlacesData[poiType]) {
        places = mockPlacesData[poiType];
      } else {
        // Generate mock places for this POI type
        places = generateMockPlacesForType(poiType);
      }
      
      // Add small location variations to make it look like they're around the specified coordinates
      places = places.map(place => {
        const latVariation = (Math.random() - 0.5) * 0.01;
        const lngVariation = (Math.random() - 0.5) * 0.01;
        
        return {
          ...place,
          geometry: {
            location: {
              lat: parseFloat(lat) + latVariation,
              lng: parseFloat(lng) + lngVariation
            }
          }
        };
      });
      
      return {
        success: true,
        data: places,
        metadata: {
          searchRadius: parseInt(radius),
          poiType: poiType,
          originalLocation: { lat, lng }
        }
      };
    },
    
    // Calculate midpoint between two locations
    calculateMidpoint: async (lat1, lng1, lat2, lng2, strategy = 'optimized', poiType = 'restaurant') => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return calculateMockMidpoint(
        parseFloat(lat1), 
        parseFloat(lng1), 
        parseFloat(lat2), 
        parseFloat(lng2), 
        strategy
      );
    }
  };

  // Helper function to check if we should use mock API
  export const shouldUseMock = () => {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    if (useMock) {
      console.warn('USING MOCK API MODE - This should not happen in production!');
    }
    return useMock;
  };
// src/lib/mockMapComponents.js

/**
 * This file provides mock implementations of Google Maps JavaScript components
 * for local development without using the actual Google Maps JavaScript API.
 */

// Mock Google Maps JavaScript API
export class MockGoogleMapsAPI {
    constructor() {
      console.log('[MOCK] Initializing mock Google Maps API');
      
      // Create a global window.google object if it doesn't exist
      if (typeof window !== 'undefined' && !window.google) {
        window.google = {
          maps: this.createMockMapsAPI()
        };
        
        console.log('[MOCK] Mock Google Maps API initialized');
      }
    }
    
    createMockMapsAPI() {
      return {
        Map: MockMap,
        Marker: MockMarker,
        places: {
          Autocomplete: MockAutocomplete
        },
        event: {
          addListener: (instance, event, callback) => {
            console.log(`[MOCK] Added listener for ${event} event`);
            if (instance && instance._events) {
              instance._events[event] = callback;
            }
            return { remove: () => console.log(`[MOCK] Removed listener for ${event} event`) };
          },
          clearInstanceListeners: (instance) => {
            console.log('[MOCK] Cleared all event listeners');
            if (instance && instance._events) {
              instance._events = {};
            }
          }
        }
      };
    }
    
    // Method to initialize the mock Google Maps API
    static initialize() {
      new MockGoogleMapsAPI();
    }
  }
  
  // Mock Map class
  class MockMap {
    constructor(element, options) {
      console.log('[MOCK] Creating mock Map with options:', options);
      this.element = element;
      this.options = options;
      this.markers = [];
      this._events = {};
      
      // Create a mock map display in the element
      if (element) {
        this.renderMockMapInElement(element);
      }
    }
    
    renderMockMapInElement(element) {
      // Only update if we're in a browser environment
      if (typeof document === 'undefined') return;
      
      // Create a simple mock map display
      element.innerHTML = '';
      element.style.backgroundColor = '#e5e7eb';
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.style.borderRadius = '8px';
      
      // Add a watermark to indicate this is a mock map
      const watermark = document.createElement('div');
      watermark.style.position = 'absolute';
      watermark.style.top = '50%';
      watermark.style.left = '50%';
      watermark.style.transform = 'translate(-50%, -50%)';
      watermark.style.fontSize = '18px';
      watermark.style.fontFamily = 'sans-serif';
      watermark.style.color = '#94a3b8';
      watermark.style.fontWeight = 'bold';
      watermark.style.pointerEvents = 'none';
      watermark.style.textAlign = 'center';
      watermark.innerHTML = 'MOCK MAP<br>(No API Calls)';
      
      element.appendChild(watermark);
      
      // Add coordinates display
      const coords = document.createElement('div');
      coords.style.position = 'absolute';
      coords.style.bottom = '10px';
      coords.style.left = '10px';
      coords.style.fontSize = '12px';
      coords.style.fontFamily = 'monospace';
      coords.style.color = '#475569';
      coords.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      coords.style.padding = '4px 8px';
      coords.style.borderRadius = '4px';
      
      if (this.options && this.options.center) {
        coords.textContent = `Center: ${this.options.center.lat.toFixed(4)}, ${this.options.center.lng.toFixed(4)}`;
      } else {
        coords.textContent = 'Center: (not set)';
      }
      
      element.appendChild(coords);
    }
    
    setCenter(latLng) {
      console.log('[MOCK] Setting map center to:', latLng);
      if (this.options) {
        this.options.center = latLng;
      }
      
      // Update the coordinates display if it exists
      if (this.element) {
        const coordsDisplay = this.element.querySelector('div:last-child');
        if (coordsDisplay && latLng) {
          coordsDisplay.textContent = `Center: ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`;
        }
      }
    }
    
    setZoom(zoom) {
      console.log('[MOCK] Setting map zoom to:', zoom);
      if (this.options) {
        this.options.zoom = zoom;
      }
    }
    
    getBounds() {
      // Mock bounds based on center and zoom
      const center = this.options.center || { lat: 0, lng: 0 };
      const zoom = this.options.zoom || 10;
      
      // Higher zoom = smaller area (arbitrary calculation for mock)
      const offset = 0.01 * Math.pow(2, 10 - Math.min(zoom, 20));
      
      return {
        getNorthEast: () => ({ 
          lat: () => center.lat + offset, 
          lng: () => center.lng + offset 
        }),
        getSouthWest: () => ({ 
          lat: () => center.lat - offset, 
          lng: () => center.lng - offset 
        }),
        contains: (latLng) => {
          const ne = { lat: center.lat + offset, lng: center.lng + offset };
          const sw = { lat: center.lat - offset, lng: center.lng - offset };
          return latLng.lat <= ne.lat && latLng.lat >= sw.lat && 
                 latLng.lng <= ne.lng && latLng.lng >= sw.lng;
        }
      };
    }
  }
  
  // Mock Marker class
  class MockMarker {
    constructor(options) {
      console.log('[MOCK] Creating marker with options:', options);
      this.options = options;
      this.map = options.map;
      this.position = options.position;
      this.title = options.title;
      this.label = options.label;
      this._events = {};
      
      // Add marker to the map's marker collection
      if (this.map && this.map.markers) {
        this.map.markers.push(this);
        this.renderMockMarker();
      }
    }
    
    renderMockMarker() {
      // Only update if we're in a browser environment and we have a map element
      if (typeof document === 'undefined' || !this.map || !this.map.element) return;
      
      const markerElement = document.createElement('div');
      markerElement.style.position = 'absolute';
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.backgroundColor = this.options.icon ? '#3498db' : '#e74c3c';
      markerElement.style.borderRadius = '50%';
      markerElement.style.transform = 'translate(-50%, -50%)';
      markerElement.style.top = '50%';
      markerElement.style.left = '50%';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
      markerElement.style.cursor = 'pointer';
      markerElement.style.zIndex = '10';
      markerElement.title = this.title || 'Marker';
      
      // Add label if present
      if (this.label) {
        markerElement.innerHTML = `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-weight:bold;font-size:12px;font-family:sans-serif;">${this.label}</div>`;
      }
      
      // Position the marker randomly within the map
      // In a real implementation we would calculate based on projection, but for mock we'll just place it somewhere in the element
      const mapWidth = this.map.element.offsetWidth;
      const mapHeight = this.map.element.offsetHeight;
      
      // Calculate a position based on the marker's lat/lng relative to the map center
      let left = '50%';
      let top = '50%';
      
      if (this.position && this.map.options && this.map.options.center) {
        const center = this.map.options.center;
        const latDiff = this.position.lat - center.lat;
        const lngDiff = this.position.lng - center.lng;
        
        // Scale the differences to pixels (this is very simplified)
        const scale = 5000; // Arbitrary scale factor for mock
        const x = (lngDiff * scale) + (mapWidth / 2);
        const y = (-latDiff * scale) + (mapHeight / 2);
        
        // Ensure the marker stays within the map bounds
        const clampedX = Math.max(10, Math.min(mapWidth - 10, x));
        const clampedY = Math.max(10, Math.min(mapHeight - 10, y));
        
        left = `${clampedX}px`;
        top = `${clampedY}px`;
      }
      
      markerElement.style.left = left;
      markerElement.style.top = top;
      
      // Add click event
      markerElement.addEventListener('click', () => {
        console.log('[MOCK] Marker clicked:', this.title);
        if (this._events && this._events.click) {
          this._events.click();
        }
      });
      
      this.map.element.appendChild(markerElement);
      this._element = markerElement;
    }
    
    setMap(map) {
      console.log('[MOCK] Setting marker map:', map ? 'map instance' : 'null');
      this.map = map;
      
      // Remove the marker element if it exists
      if (this._element && this._element.parentNode) {
        this._element.parentNode.removeChild(this._element);
      }
      
      // Add to new map if it exists
      if (map && map.markers) {
        map.markers.push(this);
        this.renderMockMarker();
      }
    }
  }
  
  // Mock Autocomplete class
  class MockAutocomplete {
    constructor(input, options) {
      console.log('[MOCK] Creating autocomplete with options:', options);
      this.input = input;
      this.options = options;
      this._events = {};
      
      // Add a small indicator to show this is using mock autocomplete
      if (input) {
        input.style.backgroundImage = 'linear-gradient(45deg, #f6f6f6 25%, transparent 25%, transparent 75%, #f6f6f6 75%, #f6f6f6), linear-gradient(45deg, #f6f6f6 25%, transparent 25%, transparent 75%, #f6f6f6 75%, #f6f6f6)';
        input.style.backgroundSize = '6px 6px';
        input.style.backgroundPosition = '0 0, 3px 3px';
        
        // Add classes to help style it
        input.classList.add('mock-autocomplete');
        
        // Add event listeners for mock behavior
        input.addEventListener('focus', () => this.handleInputFocus());
        input.addEventListener('keydown', (e) => {
          // Simulate selecting an address on Enter key
          if (e.key === 'Enter' && input.value) {
            this.simulatePlaceSelection();
          }
        });
      }
    }
    
    handleInputFocus() {
      console.log('[MOCK] Autocomplete input focused');
      // Create a basic tooltip to inform user this is a mock
      const tooltip = document.createElement('div');
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = '#334155';
      tooltip.style.color = 'white';
      tooltip.style.padding = '6px 10px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '12px';
      tooltip.style.maxWidth = '250px';
      tooltip.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      tooltip.style.zIndex = '1000';
      tooltip.style.marginTop = '2px';
      tooltip.textContent = 'This is a mock autocomplete. Enter any address and press Enter to simulate selection.';
      
      // Position the tooltip below the input
      const rect = this.input.getBoundingClientRect();
      tooltip.style.top = `${rect.bottom + window.scrollY}px`;
      tooltip.style.left = `${rect.left + window.scrollX}px`;
      
      // Add to document and remove after a delay
      document.body.appendChild(tooltip);
      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 3000);
    }
    
    simulatePlaceSelection() {
      console.log('[MOCK] Simulating place selection for:', this.input.value);
      if (this._events.place_changed) {
        // Call the place_changed event handler
        this._events.place_changed();
      }
    }
    
    addListener(event, callback) {
      console.log(`[MOCK] Adding listener for ${event} event`);
      this._events[event] = callback;
    }
    
    getPlace() {
      // Generate a mock place result based on the input value
      console.log('[MOCK] Getting place for:', this.input.value);
      
      // Generate random lat/lng near New York City
      const baseLat = 40.7128;
      const baseLng = -74.006;
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      return {
        formatted_address: this.input.value,
        name: this.input.value,
        geometry: {
          location: {
            lat: () => baseLat + latOffset,
            lng: () => baseLng + lngOffset
          }
        },
        address_components: [
          { long_name: this.input.value.split(',')[0], short_name: this.input.value.split(',')[0], types: ['street_number'] },
          { long_name: 'Mock Street', short_name: 'Mock St', types: ['route'] },
          { long_name: 'New York', short_name: 'NY', types: ['locality', 'political'] },
          { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
          { long_name: '10001', short_name: '10001', types: ['postal_code'] }
        ],
        place_id: `mock-place-${Date.now()}`
      };
    }
  }
  
  // Helper function to initialize the mock components
  export function setupMockGoogleMaps() {
    if (typeof window !== 'undefined' && !window.google) {
      console.log('[MOCK] Setting up mock Google Maps components');
      MockGoogleMapsAPI.initialize();
      return true;
    }
    return false;
  }
  
  // Load the mock maps API in the browser
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
    console.log('[MOCK] Auto-initializing mock Google Maps components');
    setupMockGoogleMaps();
  }
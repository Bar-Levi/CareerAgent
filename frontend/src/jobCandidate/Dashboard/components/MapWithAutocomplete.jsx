import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

const mapContainerStyle = { width: "100%", height: "400px" };
const center = { lat: 32.0853, lng: 34.7818 };

const predefinedLocations = [
  {
    name: "Gan Yavne, Israel",
    position: { lat: 31.7870, lng: 34.7067 }
  },
  {
    name: "Tel Aviv, Israel",
    position: { lat: 32.0853, lng: 34.7818 }
  },
  {
    name: "Jerusalem, Israel",
    position: { lat: 31.7683, lng: 35.2137 }
  },
  {
    name: "Haifa, Israel",
    position: { lat: 32.7940, lng: 34.9896 }
  }
];

const MapWithAutocomplete = () => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);

  const onAutocompleteLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry?.location) return;

    const newPosition = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    setSelectedPosition(newPosition);
    setSelectedMarker(null);
  }, [autocomplete]);

  const handleMarkerClick = useCallback((location) => {
    console.log(`Clicked on ${location.name} at position:`, location.position);
    setSelectedMarker(location);
    setSelectedPosition(location.position);
  }, []);

  return (
    <div className="relative">
      <div className="relative z-10">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Enter location or select from markers"
            className="w-[90%] p-3 mx-auto my-5 block border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedPosition || center}
        zoom={selectedPosition ? 13 : 8}
        options={{
          gestureHandling: 'greedy',
          streetViewControl: false,
          mapTypeControl: false
        }}
      >
        {selectedPosition && !selectedMarker && (
          <Marker
            position={selectedPosition}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
          />
        )}

        {predefinedLocations.map((location) => (
          <Marker
            key={location.name}
            position={location.position}
            onClick={() => handleMarkerClick(location)}
            onMouseOver={() => setHoveredMarker(location)}
            onMouseOut={() => setHoveredMarker(null)}
            icon={{
              url: selectedMarker?.name === location.name 
                ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }}
          />
        ))}
      </GoogleMap>

      {hoveredMarker && (
        <div 
          className="absolute z-50 bg-white px-4 py-2 rounded-lg shadow-lg transform -translate-x-1/2 pointer-events-none"
          style={{
            left: '50%',
            bottom: '100px'
          }}
        >
          <div className="font-medium">{hoveredMarker.name}</div>
          <div className="text-gray-500 text-xs">Click to select this location</div>
          <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
        </div>
      )}
    </div>
  );
};

export default React.memo(MapWithAutocomplete);
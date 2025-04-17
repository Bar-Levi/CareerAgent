import React, { useState } from 'react';

const LocationSearch = ({ onLocationSelect, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (value) => {
    setQuery(value);
    if (value.length < 3) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}+Israel&addressdetails=1&countrycodes=IL`
      );
      const data = await response.json();
      setSuggestions(data.filter(item => 
        item.address.country === 'Israel' || 
        item.address.country_code === 'il'
      ));
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search location in Israel..."
        className="w-full border rounded-lg p-2"
      />
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onLocationSelect({
                  display_name: suggestion.display_name,
                  coords: [parseFloat(suggestion.lat), parseFloat(suggestion.lon)],
                  address: suggestion.address
                });
                setQuery(suggestion.display_name);
                setSuggestions([]);
              }}
            >
              <div className="font-semibold">{suggestion.display_name}</div>
              <div className="text-sm text-gray-600">
                {[
                  suggestion.address.city,
                  suggestion.address.state,
                  'Israel'
                ].filter(Boolean).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
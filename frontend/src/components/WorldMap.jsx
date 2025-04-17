import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

const WorldMap = ({ filters, sortingMethod }) => {
  const mapRef = useRef();
  const [jobListings, setJobListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobListings = async () => {
      try {
        setIsLoading(true);
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/filteredJobListings?${query}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch job listings");
        }

        // Filter out listings without coordinates
        const listingsWithCoordinates = data.jobListings.filter(job => job.coordinates);
        setJobListings(listingsWithCoordinates);
      } catch (error) {
        console.error("Error fetching job listings:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobListings();
  }, [filters, sortingMethod]);

  // Calculate bounds from jobs with coordinates
  const bounds = jobListings.map((job) => job.coordinates);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading job listings...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
      <MapContainer
        center={[32.0853, 34.7818]}
        zoom={8}
        scrollWheelZoom={true}
        style={{ height: '600px', width: '100%' }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
        
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {jobListings.map((job) => (
          <Marker key={job._id} position={job.coordinates}>
            <Popup>
              <div className="font-semibold">{job.jobRole}</div>
              <div>{job.company}</div>
              <div className="text-sm text-gray-600">{job.location}</div>
            </Popup>
          </Marker>
        ))}
        {bounds.length > 0 && <FitBounds bounds={bounds} />}
      </MapContainer>

  );
};

export default WorldMap;

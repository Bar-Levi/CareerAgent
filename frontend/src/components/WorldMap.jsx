import React, { useRef, useEffect } from 'react';
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

// Multiple job listings for the same cities
const jobListings = [
  { id: 1, title: 'Job in Tel Aviv 1', location: 'Tel Aviv', coords: [32.0853, 34.7818] },
  { id: 2, title: 'Job in Tel Aviv 2', location: 'Tel Aviv', coords: [32.0853, 34.7818] },
  { id: 3, title: 'Job in Gan Yavne 1', location: 'Gan Yavne', coords: [31.67, 34.64] },
  { id: 4, title: 'Job in Gan Yavne 2', location: 'Gan Yavne', coords: [31.66, 34.64] },
  { id: 5, title: 'Job in Ashdod 1', location: 'Ashdod', coords: [31.8014, 34.6431] },
  { id: 6, title: 'Job in Ashdod 2', location: 'Ashdod', coords: [31.8014, 34.6431] },
  { id: 7, title: 'Job in Rehovot 1', location: 'Rehovot', coords: [31.8929, 34.8092] },
  { id: 8, title: 'Job in Rehovot 2', location: 'Rehovot', coords: [31.8929, 34.8092] },
];

// Component to fit map bounds to markers
const FitBounds = ({ bounds }) => {
  
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};


const WorldMap = () => {
  const mapRef = useRef();

  // Calculate unique bounds from all marker coordinates
  const bounds = jobListings.map((job) => job.coords);

  
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
        <Marker key={job.id} position={job.coords}>
          <Popup>
            <strong>{job.title}</strong>
            <br />
            {job.location}
          </Popup>
        </Marker>
      ))}
      <FitBounds bounds={bounds} />
    </MapContainer>
  );
};

export default WorldMap;

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ─── Fix Leaflet’s default icon URLs for bundlers ─────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:        require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:      require('leaflet/dist/images/marker-shadow.png'),
});

// ─── FitBounds helper to zoom/pan to include all markers ────────────────────
const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

const WorldMap = ({ filters, sortingMethod }) => {
  const mapRef = useRef();
  const [jobListings, setJobListings] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  // ─── Fetch filtered job listings ─────────────────────────────────────────
  useEffect(() => {
    const fetchJobListings = async () => {
      try {
        setIsLoading(true);
        const query    = new URLSearchParams(filters).toString();
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/filteredJobListings?${query}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch job listings');
        // Keep only listings with coordinates
        setJobListings(data.jobListings.filter(job => job.coordinates));
      } catch (err) {
        console.error('Error fetching job listings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobListings();
  }, [filters, sortingMethod]);

  // ─── 1. Group listings by exact "lat,lng" ────────────────────────────── :contentReference[oaicite:5]{index=5}
  const groupedByCoords = useMemo(() => {
    return jobListings.reduce((acc, job) => {
      const key = job.coordinates.join(',');
      if (!acc[key]) acc[key] = [];
      acc[key].push(job);
      return acc;
    }, {});
  }, [jobListings]);

  // ─── 2. Compute display positions: spread around center if group > 1 ─── :contentReference[oaicite:6]{index=6}
  const displayMarkers = useMemo(() => {
    const markers = [];
    const OFFSET = 0.00025;
    Object.entries(groupedByCoords).forEach(([key, jobs]) => {
      const [lat, lng] = key.split(',').map(Number);
      const count = jobs.length;
      if (count === 1) {
        markers.push({ job: jobs[0], coords: [lat, lng] });
      } else {
        const angleStep = (2 * Math.PI) / count;
        jobs.forEach((job, idx) => {
          const angle = idx * angleStep;
          const newLat = lat + OFFSET * Math.cos(angle);
          const newLng = lng + OFFSET * Math.sin(angle);
          markers.push({ job, coords: [newLat, newLng] });
        });
      }
    });
    return markers;
  }, [groupedByCoords]);

  // ─── 3. Derive bounds to include every spread marker ──────────────────── :contentReference[oaicite:8]{index=8}
  const bounds = useMemo(
    () => displayMarkers.map(m => m.coords),
    [displayMarkers]
  );

  // ─── Early returns after all Hooks ─────────────────────────────────────
  if (isLoading) return <div className="flex items-center justify-center h-full">Loading…</div>;
  if (error)     return <div className="text-red-500 text-center">{error}</div>;

  // ─── 4. Render the map with spread markers & individual popups ─────────
  return (
    <MapContainer
      bounds={bounds}
      scrollWheelZoom
      style={{ height: '600px', width: '100%' }}
      whenCreated={map => { mapRef.current = map; }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {displayMarkers.map(({ job, coords }) => (
        <Marker key={job._id} position={coords}>
          <Popup>
            <div className="font-semibold">{job.jobRole}</div>
            <div>{job.company}</div>
            <div className="text-sm text-gray-600">{job.location}</div>
            {/* Add more details here... */}
          </Popup>
        </Marker>
      ))}

      {bounds.length > 0 && <FitBounds bounds={bounds} />}
    </MapContainer>
  );
};

export default WorldMap;

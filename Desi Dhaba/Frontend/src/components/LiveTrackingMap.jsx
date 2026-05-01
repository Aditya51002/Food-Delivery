import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiTruck, FiMapPin, FiNavigation } from 'react-icons/fi';

// Custom Map Markers
const customDeliveryIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #f43f5e; color: white; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(244,63,94,0.5);">
          <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const customDestinationIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #10b981; color: white; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(16,185,129,0.5); border-bottom-left-radius: 0; transform: rotate(-45deg);">
          <div style="transform: rotate(45deg);">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Component to dynamically fit map bounds to show both markers
const MapBounds = ({ driverLoc, destLoc }) => {
  const map = useMap();
  useEffect(() => {
    if (driverLoc && destLoc) {
      const bounds = L.latLngBounds([driverLoc, destLoc]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (driverLoc) {
      map.setView(driverLoc, 15);
    } else if (destLoc) {
      map.setView(destLoc, 15);
    }
  }, [map, driverLoc, destLoc]);
  return null;
};

const LiveTrackingMap = ({ orderId, deliveryAddress, socket }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const setupMapData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch initial driver location from backend
        let initialDriverLoc = null;
        try {
          const { data } = await API.get(`/orders/${orderId}/location`);
          if (data && data.lat && data.lng) {
            initialDriverLoc = [data.lat, data.lng];
            if (isMounted) {
              setDriverLocation(initialDriverLoc);
              setLastUpdate(new Date(data.updatedAt));
            }
          }
        } catch (err) {
          console.log("No initial driver location found. Waiting for socket emit...");
        }

        // 2. Geocode the destination address using Nominatim
        let destLoc = null;
        if (deliveryAddress) {
          try {
            const query = encodeURIComponent(deliveryAddress);
            const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const nominatimData = await nominatimRes.json();
            
            if (nominatimData && nominatimData.length > 0) {
              destLoc = [parseFloat(nominatimData[0].lat), parseFloat(nominatimData[0].lon)];
              if (isMounted) setDestinationLocation(destLoc);
            } else {
              console.warn("Could not geocode address exactly. Drawing map without destination pin.");
            }
          } catch (e) {
            console.error("Geocoding failed:", e);
          }
        }

        // 3. Fetch route from OSRM if we have both points
        if (initialDriverLoc && destLoc && isMounted) {
          fetchRoute(initialDriverLoc, destLoc);
        }
      } catch (err) {
        console.error("Map setup error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    setupMapData();

    return () => {
      isMounted = false;
    };
  }, [orderId, deliveryAddress]);

  // Fetch routing polyline using OSRM
  const fetchRoute = async (start, end) => {
    try {
      // OSRM expects longitude,latitude format!
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        // GeoJSON uses [lon, lat], react-leaflet Polyline needs [lat, lon]
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePolyline(coordinates);
      }
    } catch (e) {
      console.error("Routing failed:", e);
    }
  };

  // Listen to live socket updates
  useEffect(() => {
    if (!socket) return;

    const handleLocationUpdate = (data) => {
      if (data && data.lat && data.lng) {
        const newLoc = [data.lat, data.lng];
        setDriverLocation(newLoc);
        setLastUpdate(new Date());
        
        // Recalculate route periodically (optional, we'll just update it here if dest exists)
        if (destinationLocation) {
          fetchRoute(newLoc, destinationLocation);
        }
      }
    };

    socket.on("receive_location", handleLocationUpdate);

    return () => {
      socket.off("receive_location", handleLocationUpdate);
    };
  }, [socket, destinationLocation]);

  if (isLoading) {
    return (
      <div className="w-full h-80 bg-zinc-900/50 rounded-3xl border border-white/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-zinc-800 border-t-emerald-500"></div>
      </div>
    );
  }

  // Fallback default center (e.g. center of India) if nothing is available
  const defaultCenter = [20.5937, 78.9629]; 
  const center = driverLocation || destinationLocation || defaultCenter;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 mt-8 z-0 group">
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg pointer-events-none transition-all">
        <h4 className="text-white font-black text-sm tracking-widest uppercase flex items-center gap-2">
          <FiNavigation className="text-emerald-500" /> Live Tracking
        </h4>
        {lastUpdate && (
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-[400px] z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" // Dark theme map!
        />
        
        {driverLocation && (
          <Marker position={driverLocation} icon={customDeliveryIcon}>
            <Popup className="custom-popup">
              <div className="text-center font-bold">Driver Location</div>
            </Popup>
          </Marker>
        )}

        {destinationLocation && (
          <Marker position={destinationLocation} icon={customDestinationIcon}>
            <Popup className="custom-popup">
              <div className="text-center font-bold">Delivery Destination</div>
            </Popup>
          </Marker>
        )}

        {routePolyline.length > 0 && (
          <Polyline 
            positions={routePolyline} 
            color="#10b981" 
            weight={5} 
            opacity={0.7} 
            dashArray="10, 10" 
            className="animate-pulse"
          />
        )}

        <MapBounds driverLoc={driverLocation} destLoc={destinationLocation} />
      </MapContainer>

      {/* Global styles for dark mode leaflet tweaks */}
      <style>{`
        .leaflet-container {
          background-color: #09090b;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background-color: #18181b;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .custom-popup .leaflet-popup-content {
          margin: 10px 14px;
        }
      `}</style>
    </div>
  );
};

export default LiveTrackingMap;

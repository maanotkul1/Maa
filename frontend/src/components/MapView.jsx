import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapView({ 
  latitude, 
  longitude, 
  onLocationChange, 
  height = '300px',
  markers = [],
  zoom = 13,
  editable = false
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      const initialLat = latitude && !isNaN(latitude) ? parseFloat(latitude) : -6.2088;
      const initialLng = longitude && !isNaN(longitude) ? parseFloat(longitude) : 106.8456;
      
      const map = L.map(mapRef.current).setView([initialLat, initialLng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Add click handler to set location (only if editable)
      if (editable || onLocationChange) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          if (onLocationChange) {
            onLocationChange(lat.toFixed(8), lng.toFixed(8));
          }

          // Update marker
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(map);
          }
        });
      }
    }

    return () => {
      // Cleanup on unmount
    };
  }, []);

  // Update single marker position
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude) && markers.length === 0) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      mapInstanceRef.current.setView([lat, lng], zoom);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
    }
  }, [latitude, longitude, zoom]);

  // Update multiple markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    
    // Clear existing markers
    markersLayerRef.current.clearLayers();
    
    if (markers.length > 0) {
      // Remove single marker if exists
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      const bounds = [];
      
      markers.forEach(marker => {
        if (marker.lat && marker.lng && !isNaN(marker.lat) && !isNaN(marker.lng)) {
          const m = L.marker([marker.lat, marker.lng]);
          
          if (marker.popup) {
            m.bindPopup(marker.popup);
          }
          
          markersLayerRef.current.addLayer(m);
          bounds.push([marker.lat, marker.lng]);
        }
      });

      // Fit bounds if we have markers
      if (bounds.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: '8px', zIndex: 0 }}
      className="border border-gray-300 dark:border-gray-600"
    />
  );
}

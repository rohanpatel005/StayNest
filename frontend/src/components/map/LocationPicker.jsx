import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { Search, MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const LocationPicker = ({ initialLocation, onLocationSelect }) => {
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Default to India
  const [position, setPosition] = useState(
    initialLocation?.latitude ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : defaultCenter
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [locationDetails, setLocationDetails] = useState(
    initialLocation?.latitude ? initialLocation : { address: '', city: '', state: '', country: '', postalCode: '' }
  );

  const markerRef = useRef(null);

  // Reverse geocoding function
  const reverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
          'accept-language': 'en'
        }
      });
      
      const { address, display_name } = response.data;
      
      setLocationDetails({
        address: display_name,
        city: address?.city || address?.town || address?.village || address?.county || '',
        state: address?.state || '',
        country: address?.country || '',
        postalCode: address?.postcode || '',
        latitude: lat,
        longitude: lng
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: searchQuery,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          'accept-language': 'en'
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setPosition({ lat, lng });
    setSearchResults([]);
    setSearchQuery('');
    
    const { address, display_name } = result;
    setLocationDetails({
      address: display_name,
      city: address?.city || address?.town || address?.village || address?.county || '',
      state: address?.state || '',
      country: address?.country || '',
      postalCode: address?.postcode || '',
      latitude: lat,
      longitude: lng
    });
  };

  // Draggable Marker Event Handlers
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition({ lat: latLng.lat, lng: latLng.lng });
          reverseGeocode(latLng.lat, latLng.lng);
        }
      },
    }),
    []
  );

  // Map Click Handler Component
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  // Auto-sync with parent component when locationDetails changes
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (locationDetails.latitude && locationDetails.longitude && locationDetails.address) {
      if (onLocationSelectRef.current) {
        onLocationSelectRef.current(locationDetails);
      }
    }
  }, [locationDetails]);

  // Initial load reverse geocoding if starting with default position and no initialLocation
  useEffect(() => {
    if (!initialLocation?.latitude && !locationDetails.address) {
      reverseGeocode(defaultCenter.lat, defaultCenter.lng);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative z-[1000]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a city, area or address"
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching}
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSelectResult(result)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{result.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="h-[400px] rounded-xl overflow-hidden border relative z-0">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={position} />
          <MapClickHandler />
          <Marker 
            position={position} 
            draggable={true} 
            eventHandlers={eventHandlers} 
            ref={markerRef}
          />
        </MapContainer>
      </div>

      {/* Selected Location Details */}
      <div className="bg-gray-50 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 mb-1">Selected Location</h4>
          {isReverseGeocoding ? (
            <p className="text-sm text-gray-500 animate-pulse">Detecting address...</p>
          ) : locationDetails.address ? (
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" />
              <span className="flex-1">{locationDetails.address}</span>
            </p>
          ) : (
            <p className="text-sm text-red-500">No address detected. Please click the map.</p>
          )}
          {locationDetails.latitude && (
            <p className="text-xs text-gray-400 mt-2">
              Coordinates: {locationDetails.latitude.toFixed(6)}, {locationDetails.longitude.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;

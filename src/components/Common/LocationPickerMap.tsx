import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, Navigation, MapPin, RefreshCw } from 'lucide-react';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
  radiusMeters?: number;
  circleColor?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  onChange,
  height = '220px',
  radiusMeters,
  circleColor = '#0D47A1',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = isNaN(lat) || lat === 0 ? 14.1153 : lat;
    const initialLng = isNaN(lng) || lng === 0 ? 120.9621 : lng;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Draggable Pin Icon
      const pinIcon = L.divIcon({
        className: 'interactive-picker-pin',
        html: `
          <div class="relative group cursor-grab active:cursor-grabbing">
            <div class="w-8 h-8 bg-rose-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-sm animate-bounce">
              📍
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap opacity-90 shadow-md">
              Drag Me
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickLat = Number(e.latlng.lat.toFixed(6));
        const clickLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([clickLat, clickLng]);
        onChange(clickLat, clickLng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Invalidate size after modal render
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker & circle when lat/lng/radius changes externally
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (isNaN(lat) || isNaN(lng)) return;

    const map = mapInstanceRef.current;
    const currentMarkerPos = markerRef.current.getLatLng();

    if (
      Math.abs(currentMarkerPos.lat - lat) > 0.00001 ||
      Math.abs(currentMarkerPos.lng - lng) > 0.00001
    ) {
      markerRef.current.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
    }

    // Render geofence circle if radius is specified
    if (radiusMeters && radiusMeters > 0) {
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(radiusMeters);
      } else {
        circleRef.current = L.circle([lat, lng], {
          radius: radiusMeters,
          color: circleColor,
          weight: 2,
          fillColor: circleColor,
          fillOpacity: 0.15,
          dashArray: '5, 5',
        }).addTo(map);
      }
    } else if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }
  }, [lat, lng, radiusMeters, circleColor]);

  // Geocoding Search
  const handleSearchLocation = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const first = data[0];
        const newLat = Number(parseFloat(first.lat).toFixed(6));
        const newLng = Number(parseFloat(first.lon).toFixed(6));

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
          mapInstanceRef.current.setView([newLat, newLng], 16);
        }
        onChange(newLat, newLng);
      } else {
        setSearchError('Location not found. Please try another landmark or city.');
      }
    } catch {
      setSearchError('Search failed. Please check network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // GPS My Location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const myLat = Number(pos.coords.latitude.toFixed(6));
        const myLng = Number(pos.coords.longitude.toFixed(6));

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([myLat, myLng]);
          mapInstanceRef.current.setView([myLat, myLng], 16);
        }
        onChange(myLat, myLng);
        setIsSearching(false);
      },
      () => {
        setSearchError('Unable to retrieve your current GPS location.');
        setIsSearching(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search address or landmark (e.g. Tagaytay National High)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSearchLocation(e);
              }
            }}
            className="w-full bg-[#E3F2FD]/50 border-2 border-[#0D47A1] rounded-xl pl-9 pr-20 py-1.5 text-xs text-[#0D47A1] font-bold focus:outline-none focus:bg-white placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-[#0D47A1] absolute left-2.5 top-2.5" />
          <button
            type="button"
            onClick={handleSearchLocation}
            disabled={isSearching}
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#0D47A1] hover:bg-[#1565C0] text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Find'}
          </button>
        </div>

        {/* Use My GPS Location */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isSearching}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition-transform"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>My GPS</span>
        </button>
      </div>

      {searchError && (
        <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
          {searchError}
        </div>
      )}

      {/* Embedded Map Canvas */}
      <div
        className="map-card-wrapper relative w-full rounded-2xl overflow-hidden border-2 border-[#0D47A1] shadow-inner isolate z-0"
        style={{
          height,
          isolation: 'isolate',
          contain: 'paint',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        }}
      >
        <div ref={mapContainerRef} className="w-full h-full relative z-0" />

        {/* Tip Badge */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-10 flex justify-center">
          <div className="bg-slate-900/90 backdrop-blur-md text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>Tap on map or drag pin to adjust coordinates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

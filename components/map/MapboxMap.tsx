'use client'

import { useRef, useEffect } from 'react'
// Importar directamente desde el subdirectorio mapbox
import { Map, Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  center?: [number, number]
  zoom?: number
  className?: string
  userLocation?: { latitude: number; longitude: number } | null
  onMapLoad?: (map: unknown) => void
  children?: React.ReactNode
}

export default function MapboxMap({
  center = [1.5, 42.4], // [longitude, latitude] - Centro de Pallars
  zoom = 13,
  className = 'h-full w-full',
  userLocation,
  onMapLoad,
  children,
}: MapboxMapProps) {
  const mapRef = useRef<MapRef>(null)

  useEffect(() => {
    if (mapRef.current) {
      // Trust the parent to provide the correct center (whether it's user, legend, or default)
      mapRef.current.flyTo({
        center: center as [number, number],
        zoom: zoom,
        duration: 2000
      });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (mapRef.current && onMapLoad) {
      onMapLoad(mapRef.current.getMap())
    }
  }, [onMapLoad])

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation?.longitude || center[0],
          latitude: userLocation?.latitude || center[1],
          zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'}
      >
        {/* Controles de navegación */}
        <NavigationControl position="top-right" />
        
        {/* Control de geolocalización */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Marcador de usuario */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="center"
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-400 rounded-full opacity-30 animate-ping" />
            </div>
          </Marker>
        )}
        
        {children}
      </Map>
    </div>
  )
}

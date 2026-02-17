"use client";

import React, { useMemo } from 'react';
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapMarkers from './MapMarkers'; // Reutilitzem els marcadors existents

// Estil Sobirà: CartoDB Positron (Net, ràpid i sense API Key restrictiva)
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

interface MapLibreMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  userLocation?: { latitude: number; longitude: number } | null;
  children?: React.ReactNode;
}

export default function MapLibreMap({ 
    className, 
    center, 
    zoom, 
    userLocation: propUserLocation, 
    children 
}: MapLibreMapProps) {
  // ADAPTATION: useGeolocation returns { location, ... }, aliasing to coordinates to match user code
  const { location: hookCoordinates } = useGeolocation();
  
  // Prioritize prop coordinates over hook coordinates if provided (for flexibility)
  // But strict user logic used hook. We'll use hook as default if no props.
  const coordinates = propUserLocation || hookCoordinates;

  // Punt d'inici per defecte (si no tenim GPS encara)
  const defaultCenter = useMemo(() => ({
    longitude: 1.1234, // Ajustar segons la regió del client (ex: Catalunya)
    latitude: 41.1234,
    zoom: 12
  }), []);

  const initialView = {
    longitude: center ? center[0] : (coordinates?.longitude || defaultCenter.longitude),
    latitude: center ? center[1] : (coordinates?.latitude || defaultCenter.latitude),
    zoom: zoom || defaultCenter.zoom
  };

  return (
    <div className={`w-full h-full relative ${className || ''}`} id="map-container">
      <Map
        initialViewState={initialView}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={false} // Important per llicència OSM/Carto (false to use default or custom control)
      >
        {/* Controls de Navegació Estàndard */}
        <NavigationControl position="bottom-right" showCompass={true} />
        <ScaleControl position="bottom-left" />

        {/* Capa de Marcadors (POIs) - User's logic */}
        <MapMarkers />

        {/* External Children (Markers from MapScreen/HomeScreen) */}
        {children}
      </Map>
    </div>
  );
}

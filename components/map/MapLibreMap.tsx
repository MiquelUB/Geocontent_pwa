"use client";

import React, { useMemo } from 'react';
import Map, { NavigationControl, ScaleControl, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapMarkers from './MapMarkers'; 

// Estil Sobirà: CartoDB Positron (Net, ràpid i sense API Key restrictiva)
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

interface MapLibreMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  userLocation?: { latitude: number; longitude: number } | null;
  children?: React.ReactNode;
  heatmapData?: Array<{ latitude: number; longitude: number; weight?: number }>; // NEW: Heatmap support
}

export default function MapLibreMap({ 
    className, 
    center, 
    zoom, 
    userLocation: propUserLocation, 
    children,
    heatmapData
}: MapLibreMapProps) {
  const { location: hookCoordinates } = useGeolocation();
  const coordinates = propUserLocation || hookCoordinates;

  const defaultCenter = useMemo(() => ({
    longitude: 1.5209, // Center of catalunya roughly (Igualada)
    latitude: 41.5912,
    zoom: 8
  }), []);

  const initialView = {
    longitude: center ? center[0] : (coordinates?.longitude || defaultCenter.longitude),
    latitude: center ? center[1] : (coordinates?.latitude || defaultCenter.latitude),
    zoom: zoom || defaultCenter.zoom
  };

  // Convert Analytics Data to GeoJSON
  const heatmapGeoJSON = useMemo(() => {
    if (!heatmapData) return null;
    return {
      type: 'FeatureCollection',
      features: heatmapData.map(point => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
        properties: { weight: point.weight || 1 }
      }))
    };
  }, [heatmapData]);

  return (
    <div className={`w-full h-full relative ${className || ''}`} id="map-container">
      <Map
        initialViewState={initialView}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={true} />
        <ScaleControl position="bottom-left" />

        <MapMarkers />

        {heatmapGeoJSON && (
            <Source type="geojson" data={heatmapGeoJSON as any}>
                <Layer 
                    id="heatmap-layer"
                    type="heatmap"
                    paint={{
                        "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
                        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
                        "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0, "rgba(33,102,172,0)",
                            0.2, "rgb(103,169,207)",
                            0.4, "rgb(209,229,240)",
                            0.6, "rgb(253,219,199)",
                            0.8, "rgb(239,138,98)",
                            1, "rgb(178,24,43)"
                        ],
                        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
                        "heatmap-opacity": 0.8
                    }}
                />
            </Source>
        )}

        {children}
      </Map>
    </div>
  );
}

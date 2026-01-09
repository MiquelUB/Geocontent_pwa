import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MapPin, ArrowLeft, Filter } from 'lucide-react';
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import MapboxMap from "../map/MapboxMap";
import { Marker } from "react-map-gl/mapbox";
import Image from 'next/image';
import { Legend, NavigateFunction } from "@/lib/types";

import { getLegends } from "@/lib/actions";

interface PallarsMapScreenProps {
  onNavigate: NavigateFunction;
  focusLegend?: Legend;
  userLocation: { latitude: number; longitude: number } | null;
}


export function PallarsMapScreen({ onNavigate, focusLegend, userLocation }: PallarsMapScreenProps) {

  const [selectedLegend, setSelectedLegend] = useState(focusLegend || null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("totes");
  const [legends, setLegends] = useState<Legend[]>([]);

  const getColorByCategory = (category: string) => {
    switch (category) {
        case 'Criatures': return "#8B5A3C";
        case 'Fantasmes': return "#6B7280";
        case 'Tresors': return "#D97706";
        case 'Màgia': return "#7C3AED";
        default: return "#3E4E3F";
    }
  }

  useEffect(() => {
    async function fetchData() {
        console.log('Fetching legends from server...');
        const data = await getLegends();
        console.log('Received legends:', data);
        if (data) {
             const mapped = data.map((l) => ({
                id: l.id,
                title: l.title,
                location: l.location_name || "Pallars",
                category: l.category,
                coordinates: { lat: l.latitude, lng: l.longitude },
                image: l.image_url,
                hero: l.hero_image_url,
                audio: l.audio_url,
                video: l.video_url,
                description: l.description,
                color: getColorByCategory(l.category)
            }));
            setLegends(mapped);
        }
    }
    fetchData();
  }, [getColorByCategory])

  const categories = [
    { id: "totes", label: "Totes", color: "#3E4E3F" },
    { id: "Criatures", label: "Criatures", color: "#8B5A3C" },
    { id: "Fantasmes", label: "Fantasmes", color: "#6B7280" },
    { id: "Tresors", label: "Tresors", color: "#D97706" },
    { id: "Màgia", label: "Màgia", color: "#7C3AED" }
  ];

  const filteredLegends = activeCategory === "totes" 
    ? legends 
    : legends.filter(legend => legend.category === activeCategory);

  return (
    <div className="screen-full bg-background flex flex-col h-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-pallars-green/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('home')}
              className="text-pallars-cream hover:bg-pallars-cream/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-serif font-bold text-pallars-cream">
                Mapa del Pallars
              </h1>
              <p className="text-xs text-pallars-cream/80">
                {filteredLegends.length} llegendes · Jussà i Sobirà
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-pallars-cream hover:bg-pallars-cream/10"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Filtres de categoria */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className={`whitespace-nowrap flex-shrink-0 ${
                    activeCategory === category.id 
                      ? "bg-pallars-cream text-pallars-green" 
                      : "border-pallars-cream text-pallars-cream hover:bg-pallars-cream/10"
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  {category.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mapa principal */}
      <div className="relative w-full h-full bg-gray-100">
        <MapboxMap
          center={legends.length > 0 && legends[0].coordinates ? [legends[0].coordinates.lng, legends[0].coordinates.lat] : [0.95, 42.4]} 
          zoom={legends.length > 0 ? 12 : 10}
          userLocation={userLocation}
        >

          {filteredLegends.map((legend, index) => legend.coordinates && (
            <Marker
              key={legend.id}
              longitude={legend.coordinates.lng}
              latitude={legend.coordinates.lat}
              anchor="bottom"
            >
              <div 
                className="relative cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Marker CLICKED:", legend.title);
                  setSelectedLegend(legend);
                }}
              >
                {/* Debug: {legend.coordinates.lat},{legend.coordinates.lng} */}
                <Image 
                    src="/medieval_map_pin.png" 
                    alt="Map Pin" 
                    width={32}
                    height={32}
                    className="drop-shadow-md"
                />
              </div>
            </Marker>
          ))}
        </MapboxMap>

        {/* Llegenda del mapa */}
        <div className="absolute bottom-24 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10 pointer-events-none">
          <h3 className="font-serif font-semibold text-pallars-green text-sm mb-2">
            Llegenda
          </h3>
          <div className="space-y-1">
            {categories.slice(1).map((category) => (
              <div key={category.id} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-pallars-green">{category.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popup de llegenda seleccionada */}
        {selectedLegend && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 left-4 right-4 z-50"
            onLayoutAnimationComplete={() => console.log("Popup rendered for:", selectedLegend.title)}
          >
            <div className="bg-white rounded-lg p-4 shadow-xl border border-gray-200">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={selectedLegend.image}
                    alt={selectedLegend.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-medium text-pallars-green mb-1">
                    {selectedLegend.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedLegend.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {selectedLegend.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      className="text-xs border-0"
                      style={{ 
                        backgroundColor: `${selectedLegend.color}20`,
                        color: selectedLegend.color 
                      }}
                    >
                      {selectedLegend.category}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLegend(null)}
                        className="text-xs"
                      >
                        Tancar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => onNavigate('legend-detail', selectedLegend)}
                        className="text-xs bg-pallars-green text-pallars-cream"
                      >
                        Veure detall
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

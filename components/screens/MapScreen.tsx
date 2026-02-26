import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MapPin, Navigation, Info, X, ArrowLeft, Filter, HelpCircle } from 'lucide-react';
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import MapLibreMap from "../map/MapLibreMap";
import { Marker, Popup } from "react-map-gl/maplibre";

import { getLegends } from "@/lib/actions";
import { PxxConfig } from "@/projects/active/config";

interface MapScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onOpenHelp: () => void;
  focusLegend?: any;
  userLocation: { latitude: number; longitude: number } | null;
  error?: string | null;
}


export function MapScreen({ onNavigate, onOpenHelp, focusLegend, userLocation, error: geoError }: MapScreenProps) {

  const [selectedLegend, setSelectedLegend] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("totes");
  const [legends, setLegends] = useState<any[]>([]);
  const [viewState, setViewState] = useState({
    longitude: 0.9870,
    latitude: 42.4140,
    zoom: 11
  });

  function getColorByCategory(category: string) {
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
        const mapped = data.map((l: any) => ({
          id: l.id,
          title: l.title,
          location: l.location_name || "Lugar",
          category: l.category,
          latitude: l.latitude,
          longitude: l.longitude,
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
  }, []);

  // If focusLegend provided, center map on it
  useEffect(() => {
    if (focusLegend) {
      setViewState({
        longitude: focusLegend.coordinates.lng,
        latitude: focusLegend.coordinates.lat,
        zoom: 14
      });
      setSelectedLegend(focusLegend);
    } else if (userLocation) {
      setViewState({
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        zoom: 12
      });
    }
  }, [focusLegend, userLocation]);

  const categories = [
    { id: "totes", label: "Todas", color: "#3E4E3F" },
    { id: "Criatures", label: "Criaturas", color: "#8B5A3C" },
    { id: "Fantasmes", label: "Fantasmas", color: "#6B7280" },
    { id: "Tresors", label: "Tesoros", color: "#D97706" },
    { id: "Màgia", label: "Magia", color: "#7C3AED" }
  ];

  const filteredLegends = activeCategory === "totes"
    ? legends
    : legends.filter(legend => legend.category === activeCategory);

  return (
    <div className="screen-full bg-background flex flex-col h-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-primary/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="text-primary-foreground hover:bg-background/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-serif font-bold text-primary-foreground">
                Explorar Mapa
              </h1>
              <p className="text-xs text-primary-foreground/80">
                {filteredLegends.length} lugares encontrados
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenHelp}
              className="text-primary-foreground hover:bg-background/10"
              title="Ayuda"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-primary-foreground hover:bg-background/10"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
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
                  className={`whitespace-nowrap flex-shrink-0 ${activeCategory === category.id
                    ? "bg-background text-primary"
                    : "border-primary-foreground text-primary-foreground hover:bg-background/10"
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

        {/* GPS Status Badge */}
        <div className="flex mt-2 items-center space-x-2">
          {geoError ? (
            <>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[10px] text-red-100 uppercase font-bold tracking-wider italic">{geoError}</span>
            </>
          ) : !userLocation ? (
            <>
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] text-primary-foreground/70 uppercase font-bold tracking-wider italic">Buscant senyal GPS...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] text-primary-foreground/70 uppercase font-bold tracking-wider">Senyal GPS actiu</span>
            </>
          )}
        </div>
      </div>

      {/* Mapa principal */}
      <div className="relative w-full h-full bg-gray-100">
        <MapLibreMap
          center={
            selectedLegend
              ? [
                selectedLegend.coordinates?.lng || selectedLegend.longitude || 0.95,
                selectedLegend.coordinates?.lat || selectedLegend.latitude || 42.4
              ]
              : (userLocation ? [userLocation.longitude, userLocation.latitude] : [0.95, 42.4])
          }
          zoom={selectedLegend ? 14 : 10} // Closer zoom for specific legend
          userLocation={userLocation}
        >

          {filteredLegends.map((legend, index) => (
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
                <Navigation
                  className="w-8 h-8 text-primary drop-shadow-md"
                />
              </div>
            </Marker>
          ))}
        </MapLibreMap>



        {/* Popup de llegenda seleccionada */}
        {selectedLegend && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 left-4 right-4 z-50"
            onLayoutAnimationComplete={() => console.log("Popup rendered for:", selectedLegend.title)}
          >
            <div
              className="bg-white rounded-lg p-4 shadow-xl border border-gray-200 cursor-pointer active:scale-95 transition-transform"
              onClick={() => onNavigate('legend-detail', selectedLegend)}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={selectedLegend.image}
                    alt={selectedLegend.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-medium text-primary mb-1">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLegend(null);
                        }}
                        className="text-xs"
                      >
                        Cerrar
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs bg-primary text-primary-foreground pointer-events-none" // Pointer events none because the parent clicks
                      >
                        Ver detalle
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

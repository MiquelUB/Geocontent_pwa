import { useState, useEffect } from "react";
import { MapPin, Bookmark, Heart, SlidersHorizontal, BarChart, Mountain } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import { getLegends, getAppBranding } from "@/lib/actions";
import { PxxConfig } from "@/projects/active/config";

interface LegendsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

// Difficulty derived deterministically from POI count (no Math.random)
function getDifficulty(poiCount: number): string {
  if (poiCount >= 8) return 'Expert';
  if (poiCount >= 4) return 'Mitjà';
  return 'Fàcil';
}

export function LegendsScreen({ onNavigate }: LegendsScreenProps) {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [legends, setLegends] = useState<any[]>([]);
  const [brand, setBrand] = useState<any>(null);

  // Derive unique locations (towns) from fetched routes
  const [locations, setLocations] = useState<any[]>([{ id: "all", label: "Totes" }]);

  useEffect(() => {
    async function fetchData() {
        const [data, brandData] = await Promise.all([
          getLegends(),
          getAppBranding()
        ]);
        setBrand(brandData);
        if (data) {
             const mapped = data.map((l: any) => ({
                id: l.id,
                title: l.title,
                description: l.description,
                location: l.location_name || '',
                category: l.category || 'mountain',
                image: l.image_url,
                hero: l.hero_image_url,
                // Deterministic values — no Math.random()
                difficulty: getDifficulty(l.poiCount ?? 0),
                poiCount: l.poiCount ?? (l.pois?.length ?? 0),
                pois: l.pois || [],
            }));
             setLegends(mapped);
             
             // Extract unique locations for the filter chips
             const uniqueLocs = Array.from(new Set(mapped.map(l => l.location).filter(Boolean)));
             const locChips = [
                { id: "all", label: "Totes" },
                ...uniqueLocs.map(loc => ({ id: loc, label: loc, icon: '📍' }))
             ];
             setLocations(locChips);
         }
    }
    fetchData();
  }, []);

  const featuredLegend = legends[0];
  // Filter by selected location ("all" shows everything)
  const filteredLegends = selectedLocation === 'all'
    ? legends
    : legends.filter(l => l.location === selectedLocation);

  const activeLabel = locations.find(c => c.id === selectedLocation)?.label ?? 'Totes';


  return (
    <div className="bg-[#f6f7f7] dark:bg-[#171b18] min-h-screen font-serif text-gray-900 dark:text-gray-100 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#171b18]/95 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-primary/10 dark:border-primary/5">
        <div className="flex items-center gap-2" onClick={() => onNavigate('home')}>
            {/* Logo Mark */}
             {brand?.logoUrl ? (
                <div className="w-8 h-8 rounded overflow-hidden">
                    <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-contain bg-white" />
                </div>
            ) : (
                <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded font-serif font-bold text-lg tracking-tighter shadow-sm">
                    {brand?.name?.[0] || 'P'}
                </div>
            )}
            <h1 className="font-serif text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {brand?.name || 'PXX Guide'}
            </h1>
        </div>
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
            <SlidersHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-white dark:border-[#171b18]"></span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        
        {/* Featured / Hero Section */}
        {featuredLegend && (
            <div className="px-6 pt-6 pb-4">
                <div className="flex justify-between items-baseline mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary/80">Editor's Pick</h2>
                    <span className="text-sm text-gray-500 hover:text-primary transition-colors italic cursor-pointer">View all collections</span>
                </div>
                
                {/* Featured Card */}
                <div 
                    onClick={() => onNavigate('legend-detail', featuredLegend)}
                    className="relative w-full h-80 rounded-xl overflow-hidden group shadow-lg cursor-pointer"
                >
                    <ImageWithFallback 
                        src={featuredLegend.hero || featuredLegend.image} 
                        alt={featuredLegend.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <div className="flex gap-2 mb-3">
                            <span className="bg-[#1E5631]/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider text-white border border-white/10">Expert</span>
                        </div>
                        <h3 className="font-serif text-3xl font-bold leading-tight mb-1 drop-shadow-md">{featuredLegend.title}</h3>
                        <p className="font-serif text-gray-200 text-lg italic opacity-90">{featuredLegend.location}</p>
                    </div>
                    
                    {/* Like Button */}
                    <button className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2.5 rounded-full hover:bg-white/20 transition-all text-white border border-white/20">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

        {/* Filter Chips (Horizontal Scroll) */}
        <div className="flex gap-3 px-6 overflow-x-auto pb-6 pt-2 no-scrollbar">
            {locations.map(loc => (
                <button 
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc.id)}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                        selectedLocation === loc.id 
                            ? "bg-primary text-white ring-1 ring-primary/20" 
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    }`}
                >
                    {loc.icon} {loc.label}
                </button>
            ))}
        </div>

        {/* Route List */}
        <div className="px-6 space-y-8">
            {/* Section Header */}
            <div className="flex items-center gap-4">
                <h2 className="font-serif text-2xl text-gray-900 dark:text-white font-bold">
                  {selectedLocation === 'all' ? 'Totes les Rutes' : `Rutes a ${activeLabel}`}
                </h2>
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                <span className="text-sm text-gray-400">{filteredLegends.length} rutes</span>
            </div>

            {/* Empty state */}
            {filteredLegends.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Mountain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-serif text-lg">Cap ruta en aquesta categoria.</p>
                <p className="text-sm mt-1">Crea-les des del panell d'administració.</p>
              </div>
            )}

            {/* Route Cards */}
            {filteredLegends.map((legend, index) => (
                <div 
                    key={legend.id}
                    onClick={() => onNavigate('legend-detail', legend)}
                    className="group relative bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-zinc-800 cursor-pointer"
                >
                    {/* Image Area */}
                    <div className="relative h-64 w-full overflow-hidden">
                        <ImageWithFallback 
                            src={legend.image} 
                            alt={legend.title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                        
                        <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition-all text-white border border-white/20 group-active:scale-95">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-0 left-0 w-full p-5">
                            <h3 className="font-serif text-white text-2xl font-bold mb-3 tracking-wide drop-shadow-md">{legend.title}</h3>
                            
                            {/* Badges Row */}
                            <div className="flex flex-wrap gap-2 text-xs font-medium tracking-wide text-white/90">
                                <div className="flex items-center gap-1 bg-[#1E5631] px-3 py-1 rounded backdrop-blur-sm border border-white/10 shadow-sm">
                                    <BarChart className="w-3.5 h-3.5 opacity-80" />
                                    <span>{legend.difficulty}</span>
                                </div>
                                {legend.poiCount > 0 && (
                                  <div className="flex items-center gap-1 bg-[#1E5631] px-3 py-1 rounded backdrop-blur-sm border border-white/10 shadow-sm">
                                      <MapPin className="w-3.5 h-3.5 opacity-80" />
                                      <span>{legend.poiCount} punts</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 bg-[#1E5631] px-3 py-1 rounded backdrop-blur-sm border border-white/10 shadow-sm">
                                    <Mountain className="w-3.5 h-3.5 opacity-80" />
                                    <span className="capitalize">{legend.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Short Description */}
                    <div className="p-4 bg-white dark:bg-zinc-900">
                        <p className="text-gray-600 dark:text-gray-400 font-serif text-base leading-relaxed line-clamp-2">
                            {legend.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}

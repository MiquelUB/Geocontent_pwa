'use client'

import { MapPin } from 'lucide-react'

interface Marker {
  id: string;
  title: string;
  x: number; // Porcentaje left
  y: number; // Porcentaje top
  type: 'castle' | 'church' | 'cave' | 'poi';
}

interface MapMarkersProps {
  onMarkerClick: (marker: Marker) => void;
}

export default function MapMarkers({ onMarkerClick }: MapMarkersProps) {
  const markers: Marker[] = [
    { id: '1', title: 'Castell de Mur', x: 25, y: 40, type: 'castle' },
    { id: '2', title: 'Sant Pere', x: 45, y: 35, type: 'church' },
    { id: '3', title: 'Cova del Drac', x: 60, y: 60, type: 'cave' },
    { id: '4', title: 'El Pozo de los Deseos', x: 50, y: 50, type: 'poi' } // El de la demo
  ];

  return (
    <div className="md:w-full md:h-full w-[375px] h-[667px] relative mx-auto">
      {markers.map((marker) => (
        <button
          key={marker.id}
          onClick={() => onMarkerClick(marker)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
          style={{ 
            left: `${marker.x}%`, 
            top: `${marker.y}%` 
          }}
        >
            {/* Pin Animado */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform hover:scale-125 ${
                marker.type === 'poi' ? 'bg-[#a33333] border-[#7a2626]' : 'bg-[#faf8f3] border-[#8b7355]'
            } border-2`}>
                <MapPin className={`w-6 h-6 ${marker.type === 'poi' ? 'text-white' : 'text-[#8b7355]'}`} />
                
                {/* Ripple Effect (Ondas) para llamar la atención */}
                <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping opacity-75"></div>
            </div>

            {/* Tooltip con nombre hover */}
            <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#3d2817] text-[#faf8f3] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                {marker.title}
            </span>
        </button>
      ))}
    </div>
  )
}

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageSliderProps {
  images: string[];
  isRecapture?: boolean;
}

export default function ImageSlider({ images: rawImages, isRecapture = false }: ImageSliderProps) {
  const images = (rawImages || []).filter((url) => !!url && url.trim() !== '');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
        Cap imatge disponible
      </div>
    );
  }

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-stone-900 shadow-xl">
      {/* Recapture Badge */}
      {isRecapture && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-terracotta-600/90 text-white text-xs font-bold rounded-full backdrop-blur-sm border border-terracotta-400/30">
          <History size={14} />
          RECUPERACIÓ HISTÒRICA
        </div>
      )}

      {/* Main Image Container */}
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={images[currentIndex]}
          alt={`POI Image ${currentIndex + 1}`}
          fill
          className="object-cover transition-all duration-500 ease-in-out"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Comparison Labels for Recapture */}
        {isRecapture && images.length >= 2 && currentIndex < 2 && (
          <div className="absolute bottom-4 left-4 z-10">
             <span className="px-2 py-1 bg-black/50 text-white text-[10px] font-bold uppercase rounded border border-white/20">
               {currentIndex === 0 ? 'Abans (Històrica)' : 'Ara (Actualitat)'}
             </span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Thumbnail Bar (Optional/Hidden for now but structure ready) */}
    </div>
  );
}

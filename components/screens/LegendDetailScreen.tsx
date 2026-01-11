import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, Play, Pause, Heart, Star, Share2, MapPin, Calendar, Volume2, BookOpen, Lock, Info } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

import { motion } from "motion/react";
import { recordVisit } from "@/lib/actions";

interface LegendDetailScreenProps {
  legend: any;
  onNavigate: (screen: string, data?: any) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  currentUser?: any;
}

export function LegendDetailScreen({ legend, onNavigate, userLocation, currentUser }: LegendDetailScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showFullText, setShowFullText] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fallback for missing legend data
  const safeLegend = legend || {
      title: "Llegenda no trobada",
      description: "No s'ha pogut carregar la informació.",
      image: "",
      location: "Desconegut",
      categoryLabel: "Desconegut",
      date: "",
      rating: 0,
      coordinates: { lat: 0, lng: 0 } // Ensure coordinates exist
  };
  
  // Calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  }

  const distance = userLocation && safeLegend.coordinates 
    ? calculateDistance(
        userLocation.latitude, 
        userLocation.longitude, 
        safeLegend.coordinates.lat, 
        safeLegend.coordinates.lng
      )
    : null;

  const UNLOCK_DISTANCE = 100; // meters
  const isUnlocked = distance !== null && distance <= UNLOCK_DISTANCE;

  // Record visit when unlocked
  useEffect(() => {
    if (isUnlocked && currentUser?.id && safeLegend.id) {
       // Fire and forget
       recordVisit(currentUser.id, safeLegend.id)
         .then(res => {
            if (res.success && res.newLevel) {
                // Optional: Show level up toast/notification
                console.log("Leveled up!", res.newLevel);
            }
         });
    }
  }, [isUnlocked, currentUser, safeLegend.id]);

  // Generate summary logic

  const getSummary = (text: string) => {
    if (!text) return "";
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };


  const handlePlayAudio = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
  };

  const handleShare = () => {
    alert("Llegenda compartida!");
  };

  const handleViewOnMap = () => {
    onNavigate('map', safeLegend);
  };

  return (
    <div className="screen bg-background">
      {/* Header image */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative h-64 overflow-hidden"
      >
        <ImageWithFallback
          src={safeLegend.hero || safeLegend.image} // Use hero if available
          alt={safeLegend.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        
        {/* Header controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('legends')}
            className="bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleFavorite}
              className={`bg-black/20 backdrop-blur-sm ${
                isFavorite ? 'text-red-400' : 'text-white'
              } hover:bg-black/40`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              className="bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className="bg-pallars-brown text-pallars-cream border-0 mb-2">
            {safeLegend.categoryLabel}
          </Badge>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">
            {safeLegend.title}
          </h1>
          <div className="flex items-center space-x-4 text-white/80 text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{safeLegend.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{safeLegend.date}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Rating */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{safeLegend.rating}</span>
            <span className="text-muted-foreground text-sm">(127 valoracions)</span>
          </div>
          
          {/* User rating */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground mr-2">Valora:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRating(rating)}
                className="p-1"
              >
                <Star 
                  className={`w-4 h-4 ${
                    rating <= userRating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {/* Distance Indicator */}
           <div className="col-span-2 mb-2">
             {distance !== null ? (
               <div className={`text-center p-2 rounded-lg text-sm font-medium ${isUnlocked ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                 {isUnlocked ? (
                   <span className="flex items-center justify-center gap-2">
                     <Lock className="w-4 h-4 text-green-600" /> Contingut desbloquejat (a {Math.round(distance)}m)
                   </span>
                 ) : (
                   <span className="flex items-center justify-center gap-2">
                     <Lock className="w-4 h-4 text-orange-600" /> Apropa't {Math.round(distance - UNLOCK_DISTANCE)}m més per desbloquejar
                   </span>
                 )}
               </div>
             ) : (
                <div className="bg-gray-100 p-2 rounded-lg text-sm text-center text-gray-600">
                    Accedeix a la ubicació per desbloquejar el contingut
                </div>
             )}

           </div>

          {safeLegend.audio && (
              <>
                <audio ref={audioRef} src={safeLegend.audio} onEnded={() => setIsPlaying(false)} />
                <Button 
                    onClick={handlePlayAudio}
                    disabled={!isUnlocked}
                    className={`pallars-button ${isPlaying ? 'secondary' : ''} flex items-center justify-center space-x-2 ${!isUnlocked && 'opacity-50 cursor-not-allowed'}`}
                >
                    {isUnlocked ? (
                        isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
                    ) : <Lock className="w-4 h-4" />}
                    <Volume2 className="w-4 h-4" />
                    <span>{isUnlocked ? (isPlaying ? 'Pausa' : 'Audio') : 'Bloquejat'}</span>
                </Button>
              </>
          )}

          {safeLegend.video && (
             <Button 
                onClick={() => isUnlocked && window.open(safeLegend.video, '_blank')}
                disabled={!isUnlocked}
                className={`bg-red-600 text-white hover:bg-red-700 flex items-center justify-center space-x-2 ${!isUnlocked && 'opacity-50 cursor-not-allowed'}`}
             >
                {isUnlocked ? <Play className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isUnlocked ? 'Video' : 'Bloquejat'}</span>
             </Button>
          )}

        </motion.div>


        {/* Text content */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-lg font-serif font-semibold text-pallars-green mb-3">
            La llegenda
          </h2>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">
              {isUnlocked ? safeLegend.description : getSummary(safeLegend.description)}
            </p>

          </div>
        </motion.div>


        {/* Map location button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={handleViewOnMap}
            variant="outline"
            className="w-full border-pallars-brown text-pallars-brown hover:bg-pallars-brown/10 flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Veure ubicació al mapa</span>
          </Button>
        </motion.div>


      </div>
    </div>
  );
}


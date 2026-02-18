import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, Play, Pause, Heart, Star, Share2, MapPin, Calendar, Volume2, Lock } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion, useScroll, useTransform } from "motion/react";
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
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Parallax effect for hero
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Fallback for missing legend data
  const safeLegend = legend || {
      title: "Lugar no encontrado",
      description: "No se ha podido cargar la información.",
      image: "",
      location: "Desconocido",
      categoryLabel: "Desconocido",
      date: "",
      rating: 0,
      coordinates: { lat: 0, lng: 0 }
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
                console.log("Leveled up!", res.newLevel);
            }
         });
    }
  }, [isUnlocked, currentUser, safeLegend.id]);


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

  const handleRating = (rating: number) => {
    setUserRating(rating);
  };

  const handleViewOnMap = () => {
    onNavigate('map', safeLegend);
  };

  return (
    <div className="screen bg-background min-h-screen">
      {/* Editorial Hero Image with Parallax */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <motion.div 
            style={{ y }}
            className="absolute inset-0 w-full h-full"
        >
             <ImageWithFallback
                src={safeLegend.hero || safeLegend.image} 
                alt={safeLegend.title}
                className="w-full h-full object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background"></div>
        </motion.div>

        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
           <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onNavigate('legends')}
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded-full"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex gap-2">
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded-full"
                >
                     <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => alert('Shared')}
                    className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded-full"
                >
                     <Share2 className="w-5 h-5" />
                </Button>
            </div>
        </div>
        
        {/* Title Overlay (Fades out on scroll) */}
        <motion.div 
            style={{ opacity }}
            className="absolute bottom-12 left-6 right-6 z-10"
        >
             <div className="flex items-center text-white/80 font-medium tracking-widest uppercase text-xs mb-2">
                <MapPin className="w-3 h-3 mr-2" />
                {safeLegend.location}
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 leading-none drop-shadow-md">
                {safeLegend.title}
            </h1>
            <div className="flex gap-2">
                 <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 text-xs backdrop-blur-md">
                    {safeLegend.categoryLabel}
                </Badge>
                 <Badge className="bg-primary/80 hover:bg-primary/90 text-white border-0 px-3 py-1 text-xs backdrop-blur-md">
                    National Monument
                </Badge>
            </div>
        </motion.div>
      </div>

      {/* Content "Paper" Sheet */}
      <div className="relative -mt-10 bg-background rounded-t-[2.5rem] z-20 px-8 py-10 min-h-[50vh] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        
        {/* Romanesque Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-primary/10 pb-8 mb-8">
            <div className="text-center">
                 <div className="text-2xl font-serif font-bold text-primary">{safeLegend.date || '1066 AD'}</div>
                 <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1">Year</div>
            </div>
             <div className="text-center md:border-l border-primary/10">
                 <div className="text-xl font-serif font-bold text-primary">Romanesque</div>
                 <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1">Style</div>
            </div>
             <div className="text-center md:border-l border-primary/10">
                 <div className="text-xl font-serif font-bold text-primary">Doña Mayor</div>
                 <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1">Founder</div>
            </div>
             <div className="text-center md:border-l border-primary/10">
                 <div className="text-xl font-serif font-bold text-primary">{Math.round(distance || 0)}m</div>
                 <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1">Distance</div>
            </div>
        </div>

        {/* Content Body with "Historical Notes" visual style */}
        <div className="mb-12">
            <h3 className="font-serif font-bold text-lg text-primary mb-4 flex items-center">
                <span className="w-8 h-px bg-primary/40 mr-3"></span>
                Historical Notes
            </h3>
            <div className="prose prose-lg prose-stone max-w-none text-foreground/80 leading-relaxed font-serif">
                <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-[-8px]">
                    {safeLegend.description}
                </p>
                <p>
                    Considered one of the purest examples of Romanesque architecture in the world, San Martín stands as a testament to the 11th-century pilgrimage route to Santiago.
                </p>
            </div>
        </div>

        {/* Interaction Zone */}
        <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif font-bold text-primary text-xl mb-4">Experience</h3>
            
            {/* Audio Player */}
            {safeLegend.audio && (
            <div className={`p-4 rounded-xl flex items-center justify-between transition-colors ${
                isUnlocked 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-stone-200 text-stone-500 cursor-not-allowed'
            }`}>
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-white/20' : 'bg-black/10'}`}>
                         <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-sm">Audio Guide</div>
                        <div className="text-xs opacity-80">{isPlaying ? 'Playing...' : 'Tap to listen'}</div>
                    </div>
                 </div>
                 
                 <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handlePlayAudio}
                    disabled={!isUnlocked}
                    className={`hover:bg-white/20 rounded-full h-12 w-12 ${!isUnlocked && 'opacity-50'}`}
                >
                     {isUnlocked ? (
                        isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />
                     ) : <Lock className="w-5 h-5" />}
                </Button>
                 <audio ref={audioRef} src={safeLegend.audio} onEnded={() => setIsPlaying(false)} />
            </div>
            )}

             {/* Video Player Button */}
            {safeLegend.video && (
             <Button
                className={`w-full py-6 text-lg font-serif ${isUnlocked ? 'bg-secondary text-white hover:bg-secondary/90' : 'bg-stone-200 text-stone-500'}`}
                onClick={() => isUnlocked && window.open(safeLegend.video, '_blank')}
                disabled={!isUnlocked}
            >
                {isUnlocked ? <Play className="w-5 h-5 mr-2 fill-current" /> : <Lock className="w-5 h-5 mr-2" />}
                Watch Video
            </Button>
            )}

             {/* Map Button */}
             <Button 
                variant="outline"
                className="w-full py-6 border-primary text-primary hover:bg-primary/5 font-serif text-lg"
                onClick={handleViewOnMap}
            >
                <MapPin className="w-5 h-5 mr-2" />
                View on Map
            </Button>

            {/* Locked State Message */}
            {!isUnlocked && distance !== null && (
                 <div className="text-center text-sm text-stone-500 mt-4 italic font-serif">
                    Move {Math.round(distance - UNLOCK_DISTANCE)}m closer to unlock full experience
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}


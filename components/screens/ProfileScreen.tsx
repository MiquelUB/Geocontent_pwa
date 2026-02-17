import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Share2, Star, MapPin, Calendar, Heart, Eye } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";

import { useEffect, useState, useRef } from "react";
import { getUserProfile, getVisitedLegends, updateProfileAvatar, getLegends } from "@/lib/actions";
import { Camera, X } from "lucide-react";




const PRESET_AVATARS: string[] = [];

interface ProfileScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  currentUser?: any; // Add user prop
}

export function ProfileScreen({ onNavigate, currentUser }: ProfileScreenProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [visitedLegends, setVisitedLegends] = useState<any[]>([]);
  const [totalLegendsCount, setTotalLegendsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Avatar state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
        if (!currentUser?.id) return;
        
        try {
            const [profile, visited, allLegends] = await Promise.all([
                getUserProfile(currentUser.id),
                getVisitedLegends(currentUser.id),
                getLegends()
            ]);
            
            setUserProfile(profile);
            setVisitedLegends(visited || []);
            setTotalLegendsCount(allLegends ? allLegends.length : 10); // Default to 10 if fail
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchProfileData();
  }, [currentUser]);
  
  const handleUpdateAvatar = async (url: string) => {
      setUpdatingAvatar(true);
      const res = await updateProfileAvatar(currentUser.id, url);
      if (res.success) {
          setUserProfile((prev: any) => ({ ...prev, avatar_url: url }));
          setIsAvatarModalOpen(false);
      }
      setUpdatingAvatar(false);
  };


  // Derived state from real data
  const level = userProfile?.level || 1;
  const xp = userProfile?.xp || 0;
  
  // XP Thresholds: 1:0-200, 2:201-500, 3:501-1000, 4:1000+
  const getNextLevelXp = (lvl: number) => {
    if (lvl === 1) return 200;
    if (lvl === 2) return 500;
    if (lvl === 3) return 1000;
    return 2000; // Cap
  };
  
  const nextLevelXp = getNextLevelXp(level);
  const prevLevelXp = level === 1 ? 0 : getNextLevelXp(level - 1);
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
  if (!userProfile) return <div className="p-10 text-center">No se ha encontrado el usuario.</div>;



  // Calculate Achievements dynamically
  const calculateAchievements = () => {
      const visitedCount = visitedLegends.length;
      const level = userProfile?.level || 1;
      
      return [] as any[];
  };

  const achievements = calculateAchievements();


  const handleShare = async () => {
    const shareData = {
      title: 'GeoContent Core',
      text: `¡Mira mi progreso en ${userProfile?.username || 'esta aplicación'}!`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('¡Enlace copiado al portapapeles!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-pallars-green p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pallars-cream rounded-full flex items-center justify-center">
              <span className="text-sm font-serif font-bold text-pallars-green">M</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-pallars-cream">
              Mi Perfil
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              className="text-pallars-cream hover:bg-pallars-cream/10"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="p-4">
        {/* Perfil usuari */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="pallars-card mb-6 p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 relative group">
              <ImageWithFallback
                src={userProfile.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"}
                alt={userProfile.username}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-serif font-semibold text-pallars-green mb-0.5 truncate">
                {userProfile.username}
              </h2>
              <p className="text-xs text-muted-foreground mb-2 truncate">
                {userProfile.email}
              </p>
              
              {/* Nivell i progressió */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-pallars-brown text-pallars-cream border-0 text-xs px-2 py-0.5">
                    Nivel {level}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {xp}/{nextLevelXp} XP
                  </span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
                <p className="text-[10px] leading-tight text-muted-foreground text-right break-words">
                  {nextLevelXp - xp} XP para el siguiente nivel
                </p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Estadístiques */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          <div className="pallars-card text-center border-0 bg-gradient-to-br from-pallars-green/5 to-pallars-green/10 p-3">
            <div className="w-8 h-8 bg-pallars-green rounded-full flex items-center justify-center mx-auto mb-1.5">
              <Eye className="w-4 h-4 text-pallars-cream" />
            </div>
            <p className="text-xl font-bold text-pallars-green mb-0.5">{visitedLegends.length}</p>
            <p className="text-[10px] leading-tight text-muted-foreground break-words px-1">Visitados</p>
          </div>

          
          <div className="pallars-card text-center border-0 bg-gradient-to-br from-red-50 to-red-100 p-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-1.5">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-red-600 mb-0.5">--</p>
            <p className="text-[10px] leading-tight text-muted-foreground break-words px-1">Favorites</p>
          </div>
          
          <div className="pallars-card text-center border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 p-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-1.5">
              <Star className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-yellow-600 mb-0.5">--</p>
            <p className="text-[10px] leading-tight text-muted-foreground break-words px-1">Valoraciones</p>
          </div>
        </motion.div>

        {/* Assoliments */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-serif font-semibold text-pallars-green mb-3">
            Logros
          </h3>
          
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + (achievement.id * 0.1) }}
                className={`pallars-card border-0 p-4 ${
                  achievement.completed ? 'bg-gradient-to-br from-green-50 to-green-100/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0 mt-0.5">{achievement.icon}</div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className={`font-semibold text-sm leading-snug ${
                        achievement.completed ? 'text-pallars-green' : 'text-gray-700'
                      }`}>
                        {achievement.title}
                      </h4>
                      {achievement.completed && (
                        <Badge className="bg-green-500 text-white text-[10px] h-5 px-2 flex-shrink-0 border-0">
                          ¡Hecho!
                        </Badge>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {achievement.description}
                    </p>
                    
                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Progreso</span>
                        <span className="text-pallars-green font-semibold">
                          {achievement.current}/{achievement.target}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.current / achievement.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Historial recent */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-serif font-semibold text-pallars-green">
              Visitados recientemente
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('legends')}
              className="text-pallars-brown hover:bg-pallars-brown/10"
            >
              Veure tot
            </Button>
          </div>
          
          <div className="space-y-3">
            {visitedLegends.map((legend, index) => (
              <motion.div
                key={legend.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                onClick={() => onNavigate('legend-detail', legend)}
                className="pallars-card cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={legend.image_url}
                      alt={legend.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-pallars-green truncate">
                      {legend.title}
                    </h4>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{legend.location_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(legend.visited_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {visitedLegends.length === 0 && (
                <div className="text-center p-4 text-gray-500 text-sm">Aún no has visitado ningún lugar. ¡Acércate para desbloquearlos!</div>
            )}

          </div>
        </motion.div>

        {/* Botó compartir app */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Button 
            onClick={handleShare}
            className="w-full pallars-button secondary flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir aplicación</span>
          </Button>
        </motion.div>
      </div>

      {/* Avatar Selection Dialog */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl w-full max-w-sm p-4"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-serif font-bold text-pallars-green">Elige tu avatar</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsAvatarModalOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {PRESET_AVATARS.map((url, i) => (
                        <button 
                            key={i}
                            onClick={() => handleUpdateAvatar(url)}
                            disabled={updatingAvatar}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                userProfile?.avatar_url === url 
                                    ? 'border-pallars-green ring-2 ring-pallars-green/20' 
                                    : 'border-transparent hover:border-pallars-green/50'
                            }`}
                        >
                            <img src={url} className="w-full h-full object-cover" alt={`Avatar ${i+1}`} />
                        </button>
                    ))}
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                    Selecciona una imagen para actualizar tu perfil.
                </p>
            </motion.div>
        </div>
      )}

    </div>
  );
}



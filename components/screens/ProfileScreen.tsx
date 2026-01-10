import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Share2, Settings, Star, MapPin, Calendar, Heart, Eye } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";

import { useEffect, useState, useRef } from "react";
import { getUserProfile, getVisitedLegends, updateProfileAvatar, getLegends } from "@/lib/actions";
import { Camera, X } from "lucide-react";




const PRESET_AVATARS = [
  "/avatars/avatar_bruixa.png",
  "/avatars/avatar_monje.png",
  "/avatars/avatar_noia.png",
  "/avatars/avatar_viajero.png",
];

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

  if (loading) return <div className="p-10 text-center">Carregant perfil...</div>;
  if (!userProfile) return <div className="p-10 text-center">No s'ha trobat l'usuari.</div>;



  // Calculate Achievements dynamically
  const calculateAchievements = () => {
      const visitedCount = visitedLegends.length;
      const level = userProfile?.level || 1;
      
      return [
        {
            id: 1,
            title: "Explorador Novell",
            description: "Visita la teva primera llegenda",
            icon: "🎯",
            current: visitedCount,
            target: 1,
            completed: visitedCount >= 1
        },
        {
            id: 2,
            title: "Rastrejador",
            description: "Visita 3 llegendes",
            icon: "🧭",
            current: visitedCount,
            target: 3,
            completed: visitedCount >= 3
        },
        {
            id: 3,
            title: "Mestre del Pallars", // Example hard target or dynamic total
            description: "Completa totes les llegendes",
            icon: "👑",
            current: visitedCount,
            target: totalLegendsCount || 10,
            completed: visitedCount >= (totalLegendsCount || 10)
        }
      ];
  };

  const achievements = calculateAchievements();


  const handleShare = () => {
    alert("Perfil compartit! 'Descobreix les llegendes del Pallars amb Mistic Pallars!'");
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
              El meu perfil
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
            <Button 
              variant="ghost" 
              size="sm"
              className="text-pallars-cream hover:bg-pallars-cream/10"
            >
              <Settings className="w-5 h-5" />
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
          className="pallars-card mb-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 relative group">
              <ImageWithFallback
                src={userProfile.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"}
                alt={userProfile.username}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-serif font-semibold text-pallars-green mb-1">
                {userProfile.username}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                {userProfile.email}
              </p>
              
              {/* Nivell i progressió */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-pallars-brown text-pallars-cream border-0">
                    Nivell {level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {xp}/{nextLevelXp} XP
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {nextLevelXp - xp} XP per al següent nivell
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
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="pallars-card text-center border-0 bg-gradient-to-br from-pallars-green/5 to-pallars-green/10">
            <div className="w-8 h-8 bg-pallars-green rounded-full flex items-center justify-center mx-auto mb-2">
              <Eye className="w-4 h-4 text-pallars-cream" />
            </div>
            <p className="text-2xl font-bold text-pallars-green">{visitedLegends.length}</p>
            <p className="text-xs text-muted-foreground">Visitades</p>
          </div>

          
          <div className="pallars-card text-center border-0 bg-gradient-to-br from-red-50 to-red-100">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-red-600">--</p>

            <p className="text-xs text-muted-foreground">Favorites</p>
          </div>
          
          <div className="pallars-card text-center border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">--</p>

            <p className="text-xs text-muted-foreground">Valoracions</p>
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
            Assoliments
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`pallars-card border-0 p-3 h-auto`}
              >
                  <div className="flex justify-between items-start mb-2">
                     <div className="text-2xl mr-3">{achievement.icon}</div>
                     <div className="flex-1">
                        <h4 className={`font-medium text-sm leading-tight mb-1 ${
                            achievement.completed ? 'text-pallars-green' : 'text-gray-600'
                        }`}>
                            {achievement.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mb-2">
                            {achievement.description}
                        </p>
                     </div>
                     {achievement.completed && (
                         <Badge className="bg-green-500 text-[10px] h-5 px-1.5">Fet!</Badge>
                     )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Progrés</span>
                          <span>{achievement.current}/{achievement.target}</span>
                      </div>
                      <Progress value={(achievement.current / achievement.target) * 100} className="h-1.5" />
                  </div>
              </div>
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
              Visitades recentment
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
                <div className="text-center p-4 text-gray-500 text-sm">Encara no has visitat cap llegenda. Apropa't per desbloquejar-les!</div>
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
            <span>Compartir Mistic Pallars</span>
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
                    <h3 className="text-lg font-serif font-bold text-pallars-green">Tria el teu avatar</h3>
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
                    Selecciona una imatge per actualitzar el teu perfil.
                </p>
            </motion.div>
        </div>
      )}

    </div>
  );
}



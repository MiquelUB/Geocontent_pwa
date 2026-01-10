"use client";

import { useState, useEffect } from "react";
import { PallarsHomeScreen } from "../components/screens/PallarsHomeScreen";
import { PallarsLegendsScreen } from "../components/screens/PallarsLegendsScreen";
import { LegendDetailScreen } from "../components/screens/LegendDetailScreen";
import { PallarsMapScreen } from "../components/screens/PallarsMapScreen";
import { ProfileScreen } from "../components/screens/ProfileScreen";
import { SplashScreen } from "../components/screens/SplashScreen";
import { ErrorScreen } from "../components/screens/ErrorScreen";
import { PallarsBottomNavigation } from "../components/PallarsBottomNavigation";
import { useGeolocation } from "../hooks/useGeolocation";
import { SimpleLogin } from "../components/auth/SimpleLogin";



export default function Home() {
  const [currentScreen, setCurrentScreen] = useState("splash");
  const [navigationData, setNavigationData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [errorType, setErrorType] = useState<"no-connection" | "gps-denied" | "general" | null>(null);
  
  const { location, error: geoError } = useGeolocation();



    useEffect(() => {
        if (geoError) {
          console.log("Geolocation error:", geoError); 
          // Optional: handle GPS error state here if strict dependency
        }
    }, [geoError]);

  // Simulació de càrrega inicial i comprovacions
  useEffect(() => {
    // Aquí es farien les comprovacions reals de xarxa, GPS, etc.
    const checkStatus = async () => {
      try {
        // Simular un retard de xarxa o càrrega
        // await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular check de connexió
        const isOnline = navigator.onLine;
        if (!isOnline) {
          setErrorType("no-connection");
          return;
        }

        // Check for persisted user session with VALIDATION
        const savedUserSting = localStorage.getItem("pallars_user");
        if (savedUserSting) {
           try {
             // Dynamic import to ensuring we call the server action from client safely
             const { getUserProfile } = await import("@/lib/actions");
             
             const savedUser = JSON.parse(savedUserSting);
             
             if (savedUser?.id) {
               console.log("Validating session for:", savedUser.id);
               const profile = await getUserProfile(savedUser.id);
               
               if (profile) {
                 console.log("Session valid.");
                 setCurrentUser(profile);
               } else {
                 console.warn("Invalid session found (User local but not in DB). Clearing.");
                 localStorage.removeItem("pallars_user");
                 setCurrentUser(null);
               }
             } else {
                localStorage.removeItem("pallars_user");
                setCurrentUser(null);
             }
           } catch (err) {
             console.error("Error parsing/validating user session:", err);
             localStorage.removeItem("pallars_user");
             setCurrentUser(null);
           }
        }


        setIsLoaded(true);
      } catch (e) {

        console.error("Error en inicialitzar:", e);
        setErrorType("general");
      }
    };

    checkStatus();
  }, []);


  const handleNavigate = (screen: string, data?: any) => {
    setNavigationData(data);
    setCurrentScreen(screen);
  };

  const handleSplashComplete = () => {
    if (errorType) {
      setCurrentScreen("error");
    } else if (currentUser) {
      setCurrentScreen("home");
    } else {
      setCurrentScreen("login"); // Require login if no user
    }
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setCurrentScreen("home");
  };

  const handleRetry = () => {

    setErrorType(null);
    setCurrentScreen("splash");
    // Tornar a executar la lògica de càrrega
    window.location.reload();
  };

  // Renderitzat condicionals de pantalles
  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onComplete={handleSplashComplete} />;
      case "login":
        return <SimpleLogin onLoginSuccess={handleLoginSuccess} />;
      case "home":
        return <PallarsHomeScreen onNavigate={handleNavigate} />;

      case "legends":
        return <PallarsLegendsScreen onNavigate={handleNavigate} />;
      case "legend-detail":
        return <LegendDetailScreen legend={navigationData} onNavigate={handleNavigate} userLocation={location} currentUser={currentUser} />;
      case "map":
        return <PallarsMapScreen onNavigate={handleNavigate} focusLegend={navigationData} userLocation={location} />;

      case "profile":
        return <ProfileScreen onNavigate={handleNavigate} currentUser={currentUser} />
;
      case "error":
        return (
          <ErrorScreen 
            type={errorType || "general"} 
            onRetry={handleRetry} 
            onNavigate={handleNavigate}
          />
        );
      default:
        return <PallarsHomeScreen onNavigate={handleNavigate} />;
    }
  };

  // Determinar si cal mostrar la navegació inferior
  // Show on all screens EXCEPT splash and error
  const showBottomNav = !["splash", "error", "login"].includes(currentScreen);



  return (
    <div className="mobile-app bg-background text-foreground h-screen w-full overflow-hidden flex flex-col">
      <main className="flex-1 relative overflow-auto scrollbar-hide">
        {renderScreen()}
      </main>
      
      {showBottomNav && (
        <PallarsBottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={handleNavigate} 
        />
      )}
    </div>
  );
}

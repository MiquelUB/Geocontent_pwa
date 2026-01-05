import { useEffect } from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-pallars-green relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pallars-cream"></div>
        <div className="absolute bottom-20 right-8 w-24 h-24 rounded-full bg-pallars-brown"></div>
        <div className="absolute top-1/3 right-16 w-16 h-16 rounded-full bg-pallars-cream"></div>
      </div>

      <div className="flex flex-col items-center space-y-8 z-10">
        {/* Logo principal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1,
            ease: "easeOut"
          }}
          className="text-center"
        >
          <div className="mb-4">
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ 
                duration: 1.5,
                delay: 0.2,
                ease: "easeOut"
              }}
              className="w-24 h-24 mx-auto mb-6 bg-pallars-cream rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-3xl font-serif font-bold text-pallars-green">M</span>
            </motion.div>
          </div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.8,
              delay: 0.5
            }}
            className="text-4xl font-serif font-bold text-pallars-cream mb-2"
          >
            Mistic Pallars
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.8,
              delay: 0.7
            }}
            className="text-lg text-pallars-cream/80"
          >
            Llegendes dels Pirineus
          </motion.p>
        </motion.div>

        {/* Indicador de càrrega */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.5,
            delay: 1.5
          }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-pallars-cream rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-pallars-cream/60">Carregant màgia...</p>
        </motion.div>
      </div>

      {/* Elements decoratius */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 2
        }}
      >
        <div className="flex items-center space-x-2 text-pallars-cream/60 text-xs">
          <span>Pallars Jussà</span>
          <div className="w-1 h-1 bg-pallars-cream/60 rounded-full"></div>
          <span>Pallars Sobirà</span>
        </div>
      </motion.div>
    </div>
  );
}

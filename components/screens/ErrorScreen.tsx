import { Button } from "../ui/button";
import { Wifi, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface ErrorScreenProps {
  type: "no-connection" | "gps-denied" | "general";
  onRetry: () => void;
  onNavigate: (screen: string) => void;
}

export function ErrorScreen({ type, onRetry, onNavigate }: ErrorScreenProps) {
  const errorConfig = {
    "no-connection": {
      icon: Wifi,
      title: "Sense connexió",
      message: "No pots accedir a les llegendes sense connexió a internet. Comprova la teva xarxa i torna-ho a provar.",
      action: "Tornar a provar",
      color: "#6B7280"
    },
    "gps-denied": {
      icon: MapPin,
      title: "Ubicació requerida",
      message: "Per descobrir les llegendes més properes, necessitem accés a la teva ubicació. Activa el GPS i dona permisos a l'app.",
      action: "Configurar ubicació",
      color: "#3E4E3F"
    },
    "general": {
      icon: AlertTriangle,
      title: "Alguna cosa ha anat malament",
      message: "Hi ha hagut un error inesperat. Si el problema persisteix, contacta amb nosaltres.",
      action: "Tornar a provar",
      color: "#d4183d"
    }
  };

  const config = errorConfig[type] || errorConfig["general"];
  const Icon = config.icon;

  return (
    <div className="screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Header amb logo */}
      <div className="absolute top-0 left-0 right-0 bg-pallars-green p-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-pallars-cream rounded-full flex items-center justify-center">
            <span className="text-sm font-serif font-bold text-pallars-green">M</span>
          </div>
          <h1 className="text-lg font-serif font-bold text-pallars-cream">
            Mistic Pallars
          </h1>
        </div>
      </div>

      <div className="space-y-6 max-w-sm mt-12 w-full">
        {/* Icona d'error */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto"
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon 
              className="w-10 h-10"
              style={{ color: config.color }}
            />
          </div>
        </motion.div>

        {/* Títol i missatge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-serif font-bold text-pallars-green">
            {config.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {config.message}
          </p>
        </motion.div>

        {/* Botons d'acció */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button 
            onClick={onRetry}
            className="w-full pallars-button flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{config.action}</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => onNavigate('home')}
            className="w-full border-pallars-green text-pallars-green hover:bg-pallars-green/10"
          >
            Tornar a l'inici
          </Button>
        </motion.div>

        {/* Informació adicional per GPS */}
        {type === "gps-denied" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground space-y-2 mt-4 text-left p-4 bg-muted/50 rounded-lg"
          >
            <p className="font-medium">Com activar la ubicació:</p>
            <ol className="text-left space-y-1">
              <li>1. Ves a Configuració del dispositiu</li>
              <li>2. Cerca "Ubicació" o "GPS"</li>
              <li>3. Activa els serveis d'ubicació</li>
              <li>4. Dona permisos a Mistic Pallars</li>
            </ol>
          </motion.div>
        )}
      </div>

      {/* Decoració de fons */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pallars-green/5 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground w-full text-center">
        Llegendes dels Pirineus · Pallars Jussà i Sobirà
      </div>
    </div>
  );
}

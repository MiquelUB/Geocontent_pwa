import { PxxConfig } from "@/projects/active/config";

export interface OnboardingStep {
  id: string;
  title: string;
  content: {
    icon: string;
    text: string;
  }[];
  visual?: string;
  ctaText: string;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'features',
    title: `¿Qué puedes hacer en ${PxxConfig.appName}?`,
    content: [
      {
        icon: '🗺️',
        text: 'EXPLORAR MAPA\nVisualiza los puntos de interés en un mapa interactivo.'
      },
      {
        icon: '📍',
        text: 'DESCUBRIR CONTENIDO\nAccede a historias y archivos multimedia desbloqueables.'
      },
      {
        icon: '👤',
        text: 'PERFIL PERSONAL\nConsulta tu progreso, nivel y logros desbloqueados.'
      }
    ],
    ctaText: 'Siguiente'
  },
  {
    id: 'gamification',
    title: '¿Cómo funciona el sistema de puntos?',
    content: [
      {
        icon: '⭐',
        text: 'VISITAR LUGARES\nGana puntos al visitar cada ubicación.'
      },
      {
        icon: '📈',
        text: 'SUBIR DE NIVEL\nAcumula experiencia para alcanzar nuevos niveles.'
      },
      {
        icon: '🏆',
        text: 'DESBLOQUEAR LOGROS\nCompleta objetivos especiales.'
      }
    ],
    ctaText: 'Siguiente'
  },
  {
    id: 'geolocation',
    title: '¿Cómo encontrar lugares cercanos?',
    content: [
      {
        icon: '📍',
        text: 'ACTIVA TU UBICACIÓN\nPermite el acceso al GPS para ver puntos de interés cerca de ti.'
      },
      {
        icon: '💡',
        text: 'Consejo: Para desbloquear los archivos multimedia debes visitar los lugares en persona.'
      }
    ],
    ctaText: 'Siguiente'
  },
  {
    id: 'achievements',
    title: '¿Cuáles son los retos?',
    content: [
      {
        icon: '🧭',
        text: 'Explorador Novel\nVisita tu primer lugar\n0/1'
      },
      {
        icon: '👑',
        text: 'Maestro Explorador\nConquista todas las historias'
      }
    ],
    ctaText: '¡Empieza a Explorar!'
  }
];

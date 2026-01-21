// Contingut de l'onboarding en català
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

export const onboardingStepsCA: OnboardingStep[] = [
  {
    id: 'features',
    title: 'Què pots fer a Mistic Pallars?',
    content: [
      {
        icon: '🗺️',
        text: 'EXPLORAR MAPA\nVisualitza totes les llegendes del Pallars en un mapa interactiu'
      },
      {
        icon: '📍',
        text: 'DESCOBRIR LLEGENDES\nAccedeix a històries completes amb ubicació, categoria i detalls'
      },
      {
        icon: '👤',
        text: 'PERFIL PERSONAL\nConsulta el teu progrés, nivell i assoliments desbloquejats'
      }
    ],
    ctaText: 'Següent'
  },
  {
    id: 'gamification',
    title: 'Com funciona el sistema de punts?',
    content: [
      {
        icon: '✅',
        text: 'VISITAR LLEGENDES\nMarca llegendes com a visitades per guanyar XP'
      },
      {
        icon: '⭐',
        text: 'PUJAR DE NIVELL\nAcumula experiència per assolir nous nivells'
      },
      {
        icon: '🏆',
        text: 'DESBLOQUEJAR ASSOLIMENTS\nCompleta objectius especials:\n  • Visita la teva primera llegenda\n  • Descobreix 10 llegendes\n  • Explora totes les categories'
      }
    ],
    ctaText: 'Següent'
  },
  {
    id: 'geolocation',
    title: 'Com trobar llegendes properes?',
    content: [
      {
        icon: '1️⃣',
        text: 'ACTIVA LA TEVA UBICACIÓ\nPermet accés al GPS per veure llegendes a prop teu'
      },
      {
        icon: '2️⃣',
        text: 'EXPLORA EL MAPA\nLes llegendes més properes apareixen destacades'
      },
      {
        icon: '3️⃣',
        text: 'VISITA UBICACIONS\nQuan estiguis a prop, marca la llegenda com a visitada'
      }
    ],
    ctaText: 'Següent'
  },
  {
    id: 'achievements',
    title: 'A què pots aspirar?',
    content: [
      {
        icon: '📊',
        text: 'COL·LECCIONISTA\nDescobreix totes les llegendes del Pallars'
      },
      {
        icon: '🗺️',
        text: 'EXPLORADOR\nVisita llegendes a totes les comarques'
      },
      {
        icon: '⭐',
        text: 'EXPERT\nAssoleix el nivell màxim (Nivell 10)'
      },
      {
        icon: '🏅',
        text: 'ESPECIALISTA\nCompleta totes les categories:\n  • Dracs i criatures\n  • Fantasmes i aparicions\n  • Tresors i llocs màgics\n  • Herois i personatges històrics'
      }
    ],
    ctaText: 'Comença a Explorar!'
  }
];

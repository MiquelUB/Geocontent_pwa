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
        text: 'EXPLORAR MAPA\nVisualitza les llegendes del Pallars en un mapa interactiu.'
      },
      {
        icon: '📍',
        text: 'DESCOBRIR LLEGENDES\nAccedeix a històries completes, desbloquejant arxius multimedia.'
      },
      {
        icon: '👤',
        text: 'PERFIL PERSONAL\nConsulta el teu progrés, nivell i assoliments desbloquejats.'
      }
    ],
    ctaText: 'Següent'
  },
  {
    id: 'gamification',
    title: 'Com funciona el sistema de punts?',
    content: [
      {
        icon: '⭐',
        text: 'VISITAR LLEGENDES\nDona estrelles a cada llegenda.'
      },
      {
        icon: '📈',
        text: 'PUJAR DE NIVELL\nAcumula experiència per assolir nous nivells.'
      },
      {
        icon: '🏆',
        text: 'DESBLOQUEJAR ASSOLIMENTS\nCompleta objectius especials.'
      }
    ],
    ctaText: 'Següent'
  },
  {
    id: 'geolocation',
    title: 'Com trobar llegendes properes?',
    content: [
      {
        icon: '📍',
        text: 'ACTIVA LA TEVA UBICACIÓ\nPermet accés al GPS per veure llegendes a prop teu.'
      },
      {
        icon: '🗺️',
        text: 'EXPLORA EL MAPA\nLes llegendes més properes apareixen aprop de la teva ubicació.'
      },
      {
        icon: '💡',
        text: 'Consell: Per desbloquejar els archius multimedia de les llegendes ha de visitar-les en persona.'
      }
    ],
    ctaText: 'Següent'
  },
  {
    id: 'achievements',
    title: 'Quins són els reptes?',
    content: [
      {
        icon: '🧭',
        text: 'Explorador Novell\nVisita la teva primera llegenda\n0/1'
      },
      {
        icon: '🗺️',
        text: 'Rastrejador\nVisita 3 llegendes\n0/3'
      },
      {
        icon: '👑',
        text: 'Mestre del Pallars\nConqueriu totes les històries'
      }
    ],
    ctaText: 'Comença a Explorar!'
  }
];

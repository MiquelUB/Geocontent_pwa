'use client';

import { X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function OnboardingModal({ isOpen, onComplete, onSkip, onNavigate }: OnboardingModalProps) {
  if (!isOpen) return null;

  const handleStart = () => {
    onComplete();
    if (onNavigate) {
      onNavigate('map');
    }
  };

  const InstructionItem = ({ title, desc }: { title: string, desc: string }) => (
    <div className="flex flex-col space-y-1">
      <h3 className="font-serif text-[1.1rem] leading-snug font-bold tracking-tight text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md h-[90vh] md:h-auto max-h-[850px] bg-background border border-primary/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">

        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-primary/5 bg-background z-10">
          <h2 className="text-3xl font-serif font-black tracking-tighter text-primary">
            Quadern de Camp Digital
          </h2>
          <button
            onClick={onSkip}
            className="p-2 rounded-full bg-secondary/10 hover:bg-secondary/20 transition-colors text-secondary"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrolling Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          <div className="space-y-7">

            <InstructionItem
              title="APARCA I CAMINA"
              desc="Els carrers són estrets, fets per a les persones. Si us plau, deixa el cotxe al pàrquing i gaudeix a peu."
            />

            <InstructionItem
              title="EL SILENCI ÉS PATRIMONI"
              desc="Gaudeix de la calma. Sense altaveus ni crits. Respecta els animals, ells són a casa seva."
            />

            <InstructionItem
              title="ANTICIPA'T A LA COBERTURA"
              desc="Baixa't els continguts indicats abans de sortir. Així tindràs els mapes i àudios quan falli el 5G."
            />

            <InstructionItem
              title="TIME SLIDER"
              desc="Mou el dit per veure el passat (o l'ànima) del paisatge."
            />

            <InstructionItem
              title="EL TEU LLEGAT"
              desc="Completa la ruta per segellar el teu Passaport. No col·leccionem dades, col·leccionem moments."
            />

            <InstructionItem
              title="GPS DE PRECISIÓ"
              desc="Activa la ubicació per trobar els secrets. Tip: El Bluetooth ajuda a afinar la posició."
            />

          </div>
        </div>

        {/* Footer actions - Fixed */}
        <div className="p-6 pt-5 bg-gradient-to-t from-background via-background to-background/90 border-t border-primary/5 z-10">
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 font-serif font-bold text-lg tracking-widest text-primary-foreground bg-primary rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] uppercase"
          >
            Comença a Caminar
          </button>
        </div>
      </div>
    </div>
  );
}

import { Lock, Mountain, Droplets, Trees } from "lucide-react";
import { cn } from "@/lib/utils";

interface PassportStampProps {
  id: string;
  name: string;
  date?: string;
  isUnlocked: boolean;
  onClick: () => void;
  index?: number; 
}

export function PassportStamp({ id, name, date, isUnlocked, onClick, index = 0 }: PassportStampProps) {
  // Rotations from HTML: -12deg, 8deg, -5deg
  const rotations = ['-rotate-[12deg]', 'rotate-[8deg]', '-rotate-[5deg]'];
  const rotationClass = rotations[index % 3];

  // Gradients for unlocked stamps
  const gradients = [
    'from-primary to-transparent',
    'from-blue-400 to-transparent',
    'from-green-600 to-transparent'
  ];
  const gradientClass = gradients[index % 3];

  // Icons matching the HTML reference
  const getIcon = () => {
    switch (index % 3) {
        case 0: return <Mountain className="w-8 h-8 text-primary" />;
        case 1: return <Droplets className="w-8 h-8 text-blue-500" />;
        case 2: return <Trees className="w-8 h-8 text-green-700" />;
        default: return <Mountain className="w-8 h-8 text-primary" />;
    }
  };

  const getBorderColor = () => {
    switch (index % 3) {
        case 0: return 'border-primary/40';
        case 1: return 'border-blue-400/40';
        case 2: return 'border-green-600/40';
        default: return 'border-primary/40';
    }
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "aspect-square flex flex-col items-center justify-center p-2 rounded-xl border shadow-sm relative overflow-hidden group transition-all duration-300",
        isUnlocked 
          ? "bg-white dark:bg-white/5 border-primary/20 hover:scale-105" 
          : "border-dashed border-gray-300 dark:border-gray-700 bg-transparent opacity-60 cursor-not-allowed"
      )}
    >
      {isUnlocked ? (
        <>
            <div className={cn("absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]", gradientClass)}></div>
            <div className={cn(
                "w-16 h-16 rounded-full border-2 flex items-center justify-center mb-2 bg-[#F9F7F2] dark:bg-transparent",
                rotationClass,
                getBorderColor()
            )}>
                {getIcon()}
            </div>
            <p className="font-serif text-sm font-bold text-center leading-tight text-[#1e2b25] dark:text-gray-200 line-clamp-1">{name}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{date}</p>
        </>
      ) : (
        <>
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="font-serif text-xs text-center text-gray-400 dark:text-gray-500">Per descobrir</p>
        </>
      )}
    </button>
  );
}

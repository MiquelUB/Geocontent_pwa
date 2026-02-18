import { useState } from "react";
import { PassportStamp } from "./PassportStamp";
import { QuizModal } from "./QuizModal";

const MOCK_STAMPS = [
  { id: "1", name: "Pic del Vent", date: "12/10/23", unlocked: true },
  { id: "2", name: "Riu Blau", date: "05/11/23", unlocked: true },
  { id: "3", name: "Bosc Antic", date: "22/11/23", unlocked: true },
  { id: "4", name: "Sant Climent", date: "Per descobrir", unlocked: false },
  { id: "5", name: "Estany Negre", date: "Per descobrir", unlocked: false },
  { id: "6", name: "Vall Fosca", date: "Per descobrir", unlocked: false },
];

export function PassportGrid() {
  const [stamps, setStamps] = useState(MOCK_STAMPS);
  const [selectedStamp, setSelectedStamp] = useState<typeof MOCK_STAMPS[0] | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleStampClick = (stamp: typeof MOCK_STAMPS[0]) => {
    if (!stamp.unlocked) {
      setSelectedStamp(stamp);
      setIsQuizOpen(true);
    }
  };

  const handleQuizSuccess = () => {
    if (selectedStamp) {
      setStamps(prev => prev.map(s => 
        s.id === selectedStamp.id 
          ? { ...s, unlocked: true, date: new Date().toLocaleDateString('es-ES') } 
          : s
      ));
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {stamps.map((stamp, index) => (
          <PassportStamp
            key={stamp.id}
            {...stamp}
            isUnlocked={stamp.unlocked}
            onClick={() => handleStampClick(stamp)}
            index={index}
          />
        ))}
      </div>

      {selectedStamp && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onSuccess={handleQuizSuccess}
          legendName={selectedStamp.name}
        />
      )}
    </>
  );
}

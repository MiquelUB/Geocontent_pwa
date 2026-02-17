'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { onboardingSteps, type OnboardingStep } from '@/lib/onboarding-content';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onSkip();
    setCurrentStep(0); // Reset for next time
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1}/{onboardingSteps.length}
          </span>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {step.title}
          </h2>

          {/* Content Items */}
          <div className="space-y-4">
            {step.content.map((item, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip for geolocation step */}
          {step.id === 'geolocation' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Consejo:</strong> Algunos lugares tienen contenido especial que solo se desbloquea al visitarlos en persona.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-4">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-blue-600 dark:bg-blue-400 w-6'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
            >
              {step.ctaText}
            </button>
          </div>

          {/* Skip Link */}
          {!isLastStep && (
            <button
              onClick={handleClose}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Saltar tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); // Start as true to avoid flash
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen onboarding
    const seen = localStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(!!seen);
    setIsLoading(false);

    // Show onboarding on first visit after a small delay
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500); // 500ms delay for better UX

      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
    setIsOpen(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
    setIsOpen(false);
  };

  const reopenOnboarding = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    isLoading,
    hasSeenOnboarding,
    completeOnboarding,
    skipOnboarding,
    reopenOnboarding,
  };
}

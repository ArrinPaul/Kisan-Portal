"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface FarmerModeContextType {
  isFarmerMode: boolean;
  setFarmerMode: (value: boolean) => void;
  toggleFarmerMode: () => void;
}

const FarmerModeContext = createContext<FarmerModeContextType | undefined>(undefined);

export function FarmerModeProvider({ children }: { children: React.ReactNode }) {
  const [isFarmerMode, setIsFarmerModeState] = useState<boolean>(true); // Default to Farmer Mode for farmer-first focus
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = window.localStorage.getItem('kisan-alert.farmer-mode');
    if (stored !== null) {
      setIsFarmerModeState(stored === 'true');
    }
  }, []);

  const setFarmerMode = (value: boolean) => {
    setIsFarmerModeState(value);
    window.localStorage.setItem('kisan-alert.farmer-mode', String(value));
    
    // Auto-routing behavior for page navigation between modes:
    if (value && pathname === '/dashboard') {
      router.push('/kisan');
    } else if (!value && pathname === '/kisan') {
      router.push('/dashboard');
    }
  };

  const toggleFarmerMode = () => {
    setFarmerMode(!isFarmerMode);
  };

  return (
    <FarmerModeContext.Provider value={{ isFarmerMode, setFarmerMode, toggleFarmerMode }}>
      {children}
    </FarmerModeContext.Provider>
  );
}

export function useFarmerMode() {
  const context = useContext(FarmerModeContext);
  if (context === undefined) {
    throw new Error('useFarmerMode must be used within a FarmerModeProvider');
  }
  return context;
}

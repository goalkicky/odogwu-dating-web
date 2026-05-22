'use client';
import React, { createContext, useContext, useState } from 'react';

export interface OnboardingData {
  fullName: string;
  dateOfBirth: string;
  gender: string | null;
  interestedIn: string | null;
  bio: string;
  photos: string[];
  latitude: number;
  longitude: number;
  city: string;
}

export interface OnboardingContextType {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
}

const defaultData: OnboardingData = {
  fullName: '',
  dateOfBirth: '',
  gender: null,
  interestedIn: null,
  bio: '',
  photos: [],
  latitude: 0,
  longitude: 0,
  city: '',
};

const OnboardingContext = createContext<OnboardingContextType>({
  data: defaultData,
  updateData: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const updateData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

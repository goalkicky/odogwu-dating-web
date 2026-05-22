import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../../types';

interface OnboardingData {
  fullName: string;
  dateOfBirth: string;
  gender: UserProfile['gender'] | null;
  interestedIn: UserProfile['interestedIn'] | null;
  bio: string;
  photos: string[];
  latitude: number;
  longitude: number;
  city: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
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
  currentStep: 0,
  totalSteps: 6,
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6;

  const updateData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{ data, updateData, currentStep, totalSteps, nextStep, prevStep, goToStep }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

'use client';
import React from 'react';
import { OnboardingProvider } from '@/store/OnboardingContext';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

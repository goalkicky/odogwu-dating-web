import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === currentStep ? '24px' : '8px',
            height: '8px',
            borderRadius: '4px',
            backgroundColor: i === currentStep ? '#FF375F' : i < currentStep ? '#FF6B8A' : '#2A2A2A',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

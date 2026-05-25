'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TransgenderIcon, ManIcon, WomanIcon, PeopleIcon, EllipsisIcon, CheckmarkCircleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useOnboarding } from '@/store/OnboardingContext';

const genders = [
  { value: 'male', icon: <ManIcon size={28} />, label: 'Male' },
  { value: 'female', icon: <WomanIcon size={28} />, label: 'Female' },
  { value: 'non-binary', icon: <PeopleIcon size={28} />, label: 'Non-binary' },
  { value: 'other', icon: <EllipsisIcon size={28} />, label: 'Other' },
];

export default function GenderPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState(data.gender);

  const handleSelect = (value: string) => {
    setSelected(value);
    updateData({ gender: value });
  };

  const handleNext = () => {
    if (!selected) return;
    router.push('/onboarding/interest');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #1A0000, #0D0D0D)', display: 'flex', flexDirection: 'column', padding: '60px 24px 0' }}>
      <OnboardingProgress currentStep={2} totalSteps={6} />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #FF375F, #FF6B8A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TransgenderIcon size={36} color="white" />
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 8 }}>What&apos;s your gender?</h1>
      <p style={{ fontSize: 16, color: '#ABABAB', textAlign: 'center', marginBottom: 32 }}>Select the option that best describes you</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {genders.map((g) => {
          const isSelected = selected === g.value;
          return (
            <button
              key={g.value}
              onClick={() => handleSelect(g.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '18px',
                gap: '14px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                background: isSelected
                   ? 'linear-gradient(135deg, #FF375F, #FF3B30)'
                  : 'linear-gradient(135deg, #1A1A1A, #242424)',
                color: isSelected ? 'white' : '#ABABAB',
              }}
            >
              {React.cloneElement(g.icon, { color: isSelected ? 'white' : '#ABABAB' })}
              <span style={{ flex: 1, fontSize: 17, fontWeight: 600, textAlign: 'left' }}>{g.label}</span>
              {isSelected && <CheckmarkCircleIcon size={22} color="white" />}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />
      <Button title="Continue" onPress={handleNext} variant="gradient" size="lg" style={{ width: '100%', marginBottom: 40 }} disabled={!selected} />
    </div>
  );
}

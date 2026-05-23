'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, ManIcon, WomanIcon, PeopleIcon, EllipsisIcon, CheckmarkCircleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useOnboarding } from '@/store/OnboardingContext';

const interests = [
  { value: 'male', icon: <ManIcon size={28} />, label: 'Men' },
  { value: 'female', icon: <WomanIcon size={28} />, label: 'Women' },
  { value: 'both', icon: <PeopleIcon size={28} />, label: 'Everyone' },
  { value: 'non-binary', icon: <EllipsisIcon size={28} />, label: 'Non-binary' },
];

export default function InterestPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState(data.interestedIn);

  const handleSelect = (value: string) => {
    setSelected(value);
    updateData({ interestedIn: value });
  };

  const handleNext = () => {
    if (!selected) return;
    router.push('/onboarding/location');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #0A1A0A, #0D0D0D)', display: 'flex', flexDirection: 'column', padding: '60px 24px 0' }}>
      <OnboardingProgress currentStep={3} totalSteps={6} />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #34C759, #30D158)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeartIcon size={36} color="white" />
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 8 }}>Who are you interested in?</h1>
      <p style={{ fontSize: 16, color: '#ABABAB', textAlign: 'center', marginBottom: 32 }}>You can change this later</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {interests.map((item) => {
          const isSelected = selected === item.value;
          return (
            <button
              key={item.value}
              onClick={() => handleSelect(item.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '18px',
                gap: '14px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                background: isSelected
                  ? 'linear-gradient(135deg, #34C759, #30D158)'
                  : 'linear-gradient(135deg, #1A1A1A, #242424)',
                color: isSelected ? 'white' : '#ABABAB',
              }}
            >
              {React.cloneElement(item.icon, { color: isSelected ? 'white' : '#ABABAB' })}
              <span style={{ flex: 1, fontSize: 17, fontWeight: 600, textAlign: 'left' }}>{item.label}</span>
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

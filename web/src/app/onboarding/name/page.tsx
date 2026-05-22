'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PersonIcon } from '@/components/Icons';
import Input from '@/components/Input';
import Button from '@/components/Button';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useOnboarding } from '@/store/OnboardingContext';

export default function NamePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (data.fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    router.push('/onboarding/dob');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #1A0A1A, #0D0D0D)', display: 'flex', flexDirection: 'column', padding: '60px 24px 0' }}>
      <OnboardingProgress currentStep={0} totalSteps={6} />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #FF375F, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PersonIcon size={36} color="white" />
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 8 }}>What&apos;s your full name?</h1>
      <p style={{ fontSize: 16, color: '#ABABAB', textAlign: 'center', marginBottom: 32 }}>This is how you&apos;ll appear on your profile</p>

      <div style={{ marginBottom: 24 }}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={data.fullName}
          onChange={(e) => { updateData({ fullName: e.target.value }); setError(''); }}
          error={error}
          autoFocus
        />
      </div>

      <div style={{ flex: 1 }} />
      <Button title="Continue" onPress={handleNext} variant="gradient" size="lg" style={{ width: '100%', marginBottom: 40 }} />
    </div>
  );
}

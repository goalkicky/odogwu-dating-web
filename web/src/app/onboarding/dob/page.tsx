'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon } from '@/components/Icons';
import Button from '@/components/Button';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useOnboarding } from '@/store/OnboardingContext';

export default function DOBPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [error, setError] = useState('');

  const formatDate = (d: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const calculateAge = (d: Date) => {
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ dateOfBirth: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (!data.dateOfBirth) {
      setError('Please select your date of birth');
      return;
    }
    const age = calculateAge(new Date(data.dateOfBirth));
    if (age < 18) {
      setError('You must be at least 18 years old');
      return;
    }
    setError('');
    router.push('/onboarding/gender');
  };

  const age = data.dateOfBirth ? calculateAge(new Date(data.dateOfBirth)) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #0A0A1A, #0D0D0D)', display: 'flex', flexDirection: 'column', padding: '60px 24px 0' }}>
      <OnboardingProgress currentStep={1} totalSteps={6} />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #6C63FF, #5A52E0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarIcon size={36} color="white" />
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 8 }}>Your date of birth?</h1>
      <p style={{ fontSize: 16, color: '#ABABAB', textAlign: 'center', marginBottom: 32 }}>This won&apos;t be shown publicly</p>

      <div style={{ backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #2A2A2A' }}>
        <label style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 8 }}>Date of Birth</label>
        {data.dateOfBirth ? (
          <span style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>{formatDate(new Date(data.dateOfBirth))}</span>
        ) : (
          <span style={{ color: '#6B6B6B', fontSize: 20 }}>Select your birthday</span>
        )}
        {age && <span style={{ color: '#FF375F', fontSize: 15, fontWeight: 600, marginTop: 8 }}>{age} years old</span>}
      </div>

      {error && <p style={{ color: '#FF3B30', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>}

      <div style={{ marginTop: 16 }}>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]}
          min="1940-01-01"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid #2A2A2A',
            backgroundColor: '#1A1A1A',
            color: 'white',
            fontSize: 16,
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />
      <Button title="Continue" onPress={handleNext} variant="gradient" size="lg" style={{ width: '100%', marginBottom: 40 }} />
    </div>
  );
}

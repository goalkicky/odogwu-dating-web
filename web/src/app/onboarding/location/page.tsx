'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocationIcon, LocateIcon, CheckmarkCircleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useOnboarding } from '@/store/OnboardingContext';

export default function LocationPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geo = await res.json();
        const city = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.state || 'Unknown';
        updateData({ latitude, longitude, city });
      } catch {
        updateData({ latitude, longitude, city: 'Unknown' });
      }
    } catch {
      setPermissionDenied(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #0A0A1A, #0D0D0D)', display: 'flex', flexDirection: 'column', padding: '60px 24px 0' }}>
      <OnboardingProgress currentStep={4} totalSteps={6} />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #007AFF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LocationIcon size={36} color="white" />
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 8 }}>Your location</h1>
      <p style={{ fontSize: 16, color: '#ABABAB', textAlign: 'center', marginBottom: 32 }}>We&apos;ll show people near you</p>

      <div style={{ backgroundColor: '#1A1A1A', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #2A2A2A' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <LocateIcon size={40} color="#6B6B6B" />
            <span style={{ color: '#6B6B6B', fontSize: 15 }}>Detecting your location...</span>
          </div>
        ) : data.city ? (
          <>
            <CheckmarkCircleIcon size={40} color="#34C759" />
            <span style={{ color: 'white', fontSize: 22, fontWeight: 700, marginTop: 12 }}>{data.city}</span>
            <span style={{ color: '#6B6B6B', fontSize: 13, marginTop: 4 }}>{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</span>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <LocationIcon size={40} color="#FF3B30" />
            <span style={{ color: '#FF3B30', fontSize: 15 }}>Location access denied</span>
            <button
              onClick={requestLocation}
              style={{ padding: '10px 20px', borderRadius: 9999, border: 'none', backgroundColor: '#242424', color: 'white', cursor: 'pointer', fontSize: 14 }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <Button title="Continue" onPress={() => router.push('/onboarding/photo')} variant="gradient" size="lg" style={{ width: '100%', marginBottom: 40 }} disabled={!data.city} />
    </div>
  );
}

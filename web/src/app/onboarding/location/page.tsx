'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LocationIcon, LocateIcon, CheckmarkCircleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useOnboarding } from '@/store/OnboardingContext';

export default function LocationPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [ipLoading, setIpLoading] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const requestedRef = useRef(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        setLoading(false);
        return;
      }
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
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
      tryIpGeolocation();
    }
    setLoading(false);
  };

  const tryIpGeolocation = async () => {
    setIpLoading(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error('IP geolocation failed');
      const geo = await res.json();
      if (geo.city) {
        updateData({ latitude: geo.latitude, longitude: geo.longitude, city: geo.city });
      }
    } catch {
      // IP geolocation also failed, user can enter manually
    }
    setIpLoading(false);
  };

  const handleManualSubmit = () => {
    if (manualCity.trim()) {
      updateData({ city: manualCity.trim(), latitude: 0, longitude: 0 });
    }
  };

  useEffect(() => {
    if (!data.city && !requestedRef.current) {
      requestedRef.current = true;
      requestLocation();
    }
  }, [data.city]);

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
            {data.latitude !== 0 && (
              <span style={{ color: '#6B6B6B', fontSize: 13, marginTop: 4 }}>{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</span>
            )}
          </>
        ) : ipLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <LocateIcon size={40} color="#6B6B6B" />
            <span style={{ color: '#6B6B6B', fontSize: 15 }}>Detecting location via IP...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
            <LocationIcon size={40} color="#FF3B30" />
            <span style={{ color: '#FF3B30', fontSize: 15 }}>Location access denied</span>
            <button
              onClick={requestLocation}
              style={{ padding: '10px 20px', borderRadius: 9999, border: 'none', backgroundColor: '#242424', color: 'white', cursor: 'pointer', fontSize: 14 }}
            >
              Try Again
            </button>

            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <div style={{ flex: 1, height: 1, background: '#2A2A2A' }} />
              <span style={{ color: '#6B6B6B', fontSize: 12 }}>or enter manually</span>
              <div style={{ flex: 1, height: 1, background: '#2A2A2A' }} />
            </div>

            <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 8 }}>
              <input
                type="text"
                placeholder="Enter your city..."
                value={manualCity}
                onChange={e => setManualCity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #2A2A2A',
                  background: '#242424', color: 'white', fontSize: 15, outline: 'none',
                }}
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCity.trim()}
                style={{
                  padding: '12px 16px', borderRadius: 12, border: 'none',
                  background: manualCity.trim() ? 'linear-gradient(135deg, #007AFF, #00D4FF)' : '#2A2A2A',
                  color: 'white', cursor: manualCity.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 600, opacity: manualCity.trim() ? 1 : 0.5,
                }}
              >
                Set
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <Button title="Continue" onPress={() => router.push('/onboarding/photo')} variant="gradient" size="lg" style={{ width: '100%', marginBottom: 40 }} disabled={!data.city} />
    </div>
  );
}

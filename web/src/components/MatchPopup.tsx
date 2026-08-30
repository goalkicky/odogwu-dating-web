'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon } from '@/components/Icons';

interface MatchPopupProps {
  matchedUser: { fullName: string; photos: string[]; age?: number } | null;
  matchId?: string;
  myPhotoUrl?: string;
  onClose: () => void;
}

export default function MatchPopup({ matchedUser, matchId, myPhotoUrl, onClose }: MatchPopupProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = () => {
    setExiting(true);
    setTimeout(onClose, 350);
  };

  if (!matchedUser) return null;

  const myPhoto = myPhotoUrl || '';
  const theirPhoto = matchedUser.photos?.[0] || '';
  const firstName = (matchedUser.fullName || 'Someone').split(' ')[0];
  const age = matchedUser.age || '';

  const handleSendMessage = () => {
    close();
    if (matchId) {
      setTimeout(() => router.push(`/chat/${matchId}`), 400);
    } else {
      setTimeout(() => router.push('/matches'), 400);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: exiting ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.85)',
        backdropFilter: exiting ? 'blur(0px)' : 'blur(20px)',
        WebkitBackdropFilter: exiting ? 'blur(0px)' : 'blur(20px)',
        transition: 'background 0.35s ease, backdrop-filter 0.35s ease',
        opacity: visible && !exiting ? 1 : 0,
        transitionProperty: 'opacity, background, backdrop-filter',
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 380, padding: '48px 28px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          opacity: visible && !exiting ? 1 : 0,
          transform: visible && !exiting ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(40px)',
          transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Sparkle particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="match-sparkle"
            style={{
              position: 'absolute',
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#FFE600' : i % 3 === 1 ? '#FF2E5F' : '#B44CFF',
              top: `${10 + Math.random() * 70}%`,
              left: `${5 + Math.random() * 90}%`,
              animation: `sparkleFloat ${1.5 + Math.random() * 2}s ease-in-out ${Math.random() * 0.8}s infinite alternate`,
              boxShadow: `0 0 ${8 + Math.random() * 12}px currentColor`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Heart burst icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF2E5F, #B44CFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(255,46,95,0.5), 0 0 80px rgba(180,76,255,0.3)',
          marginBottom: 20,
          animation: 'matchHeartPulse 1.2s ease-in-out infinite',
        }}>
          <HeartIcon size={28} color="white" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 32, fontWeight: 900, letterSpacing: -0.5,
          background: 'linear-gradient(135deg, #FF2E5F, #FFE600, #B44CFF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
        }}>
          It&apos;s a Match!
        </h1>

        <p style={{ fontSize: 16, color: '#ABABAB', marginBottom: 32, lineHeight: '24px' }}>
          You and <span style={{ color: 'white', fontWeight: 700 }}>{firstName}{age ? `, ${age}` : ''}</span> liked each other
        </p>

        {/* Profile photos side by side */}
        <div style={{ position: 'relative', width: 160, height: 80, marginBottom: 36 }}>
          {/* My photo (left) */}
          <div style={{
            position: 'absolute', left: 0, width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF2E5F, #FF7BA0)',
            padding: 3,
            boxShadow: '0 4px 24px rgba(255,46,95,0.4)',
            zIndex: 2,
            animation: 'matchPhotoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
              background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {myPhoto ? (
                <img src={myPhoto} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32 }}>😊</span>
              )}
            </div>
          </div>
          {/* Their photo (right) */}
          <div style={{
            position: 'absolute', right: 0, width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #B44CFF, #B47CFF)',
            padding: 3,
            boxShadow: '0 4px 24px rgba(180,76,255,0.4)',
            zIndex: 1,
            animation: 'matchPhotoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
              background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {theirPhoto ? (
                <img src={theirPhoto} alt={firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32 }}>😊</span>
              )}
            </div>
          </div>
          {/* Overlapping hearts in center */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            animation: 'matchHeartPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.6s both',
          }}>
            <HeartIcon size={22} color="#FFE600" />
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={handleSendMessage}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 14,
            background: 'linear-gradient(135deg, #FF2E5F, #FF7BA0)',
            border: 'none', color: 'white', fontSize: 16, fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(255,46,95,0.45)',
            marginBottom: 12,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Send a Message
        </button>
        <button
          onClick={close}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ABABAB', fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          Keep Swiping
        </button>
      </div>

      <style jsx global>{`
        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(0.6); opacity: 0.3; }
          100% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        @keyframes matchHeartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes matchPhotoIn {
          0% { opacity: 0; transform: scale(0.4) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes matchHeartPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

'use client';
import React from 'react';

interface ActionButtonProps {
  onPress: () => void;
  size?: number;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'superlike' | 'boost';
  disabled?: boolean;
}

const gradientColors: Record<string, string> = {
  danger: 'linear-gradient(135deg, #FF4530, #FF6B6B)',
  superlike: 'linear-gradient(135deg, #22E5FF, #0AA6CE)',
  boost: 'linear-gradient(135deg, #FFE600, #FFB62B)',
  primary: 'linear-gradient(135deg, #FF2E5F, #FF4530)',
  secondary: 'linear-gradient(135deg, #1A1A1A, #242424)',
};

const borderColors: Record<string, string> = {
  danger: '#FF4530',
  superlike: '#22E5FF',
  boost: '#FFE600',
  primary: '#FF4530',
  secondary: '#2A2A2A',
};

const glows: Record<string, string> = {
  danger: '0 0 24px rgba(255,69,48,0.45)',
  superlike: '0 0 24px rgba(79,195,247,0.4)',
  boost: '0 0 24px rgba(255,230,0,0.4)',
  primary: '0 0 28px rgba(255,46,95,0.5)',
  secondary: 'none',
};

export default function ActionButton({
  onPress,
  size = 60,
  children,
  variant = 'primary',
  disabled,
}: ActionButtonProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{
        width: size + 10,
        height: size + 10,
        borderRadius: (size + 10) / 2,
        border: `2px solid ${borderColors[variant]}`,
        background: 'linear-gradient(135deg, rgba(26,26,26,0.9), rgba(36,36,36,0.9))',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        padding: 0,
        boxShadow: variant === 'primary' ? glows[variant] : '0 6px 24px rgba(0,0,0,0.4)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          background: gradientColors[variant],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `inset 0 -4px 12px rgba(0,0,0,0.25), inset 0 2px 6px rgba(255,255,255,0.25), ${variant === 'primary' ? '0 0 20px rgba(255,46,95,0.35)' : 'none'}`,
        }}
      >
        {children}
      </div>
    </button>
  );
}

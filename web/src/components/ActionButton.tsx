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
  danger: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
  superlike: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
  boost: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
  primary: 'linear-gradient(135deg, #FF375F, #FF3B30)',
  secondary: 'linear-gradient(135deg, #1A1A1A, #242424)',
};

const borderColors: Record<string, string> = {
  danger: '#FF3B30',
  superlike: '#FF3B30',
  boost: '#FF375F',
  primary: '#FF3B30',
  secondary: '#2A2A2A',
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
        width: size + 8,
        height: size + 8,
        borderRadius: (size + 8) / 2,
        border: `2px solid ${borderColors[variant]}`,
        background: 'linear-gradient(135deg, #1A1A1A, #242424)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        padding: 0,
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
        }}
      >
        {children}
      </div>
    </button>
  );
}

import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function GradientBackground({
  children,
  colors = 'linear-gradient(135deg, #1A0000, #2D0000, #1A0000)',
  style,
  className,
}: GradientBackgroundProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

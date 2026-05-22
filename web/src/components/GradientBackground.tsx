import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function GradientBackground({
  children,
  colors = 'linear-gradient(135deg, #0D0D0D, #0A0A1A, #0D0D0D)',
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

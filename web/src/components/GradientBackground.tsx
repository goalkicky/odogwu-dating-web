import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function GradientBackground({
  children,
  colors,
  style,
  className,
}: GradientBackgroundProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: colors || 'linear-gradient(180deg, #08080C 0%, #0D0D0D 100%)',
        ...style,
      }}
      className={className}
    >
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      <div className="aurora aurora-3" />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

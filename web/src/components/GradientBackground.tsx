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
        minHeight: '100svh',
        position: 'relative',
        background: colors || 'linear-gradient(180deg, #08080C 0%, #0D0D0D 100%)',
        ...style,
      }}
      className={className}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

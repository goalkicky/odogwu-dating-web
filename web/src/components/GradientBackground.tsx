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
        background: colors || 'radial-gradient(1200px 800px at 20% -10%, rgba(255,46,95,0.14) 0%, transparent 50%), radial-gradient(1000px 700px at 100% 20%, rgba(180,76,255,0.13) 0%, transparent 50%), linear-gradient(180deg, #08080E 0%, #04040A 100%)',
        ...style,
      }}
      className={className}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="aurora aurora-4" />
      </div>
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>
    </div>
  );
}

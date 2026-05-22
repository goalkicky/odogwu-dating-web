'use client';
import React from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  style,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '10px 20px', fontSize: '14px' },
    md: { padding: '14px 28px', fontSize: '16px' },
    lg: { padding: '18px 36px', fontSize: '18px' },
  };

  const sizeStyle = sizes[size];

  const baseStyle: React.CSSProperties = {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    fontWeight: 700,
    display: 'inline-flex',
    flexDirection: 'row',
    gap: '8px',
    ...sizeStyle,
    ...style,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#FF375F', color: '#FFFFFF' },
    secondary: { backgroundColor: '#242424', color: '#FFFFFF' },
    outline: { backgroundColor: 'transparent', border: '2px solid #FF375F', color: '#FF375F' },
    ghost: { backgroundColor: 'transparent', color: '#ABABAB' },
  };

  if (variant === 'gradient') {
    return (
      <button
        onClick={onPress}
        disabled={isDisabled}
        style={{ ...baseStyle, border: 'none', padding: 0, background: 'none', ...style }}
        className={className}
      >
        <div
          style={{
            padding: `${sizeStyle.padding}px`.includes('px') ? sizeStyle.padding : undefined,
            paddingTop: sizeStyle.padding,
            paddingBottom: sizeStyle.padding,
            paddingLeft: '28px',
            paddingRight: '28px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          {loading ? (
            <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          ) : (
            <>
              {icon}
              <span style={{ color: 'white', fontSize: sizeStyle.fontSize, fontWeight: 700 }}>{title}</span>
            </>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onPress}
      disabled={isDisabled}
      style={{ ...baseStyle, ...variants[variant] }}
      className={className}
    >
      {loading ? (
        <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: variant === 'outline' ? '#FF375F' : 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      ) : (
        <>
          {icon}
          <span>{title}</span>
        </>
      )}
    </button>
  );
}

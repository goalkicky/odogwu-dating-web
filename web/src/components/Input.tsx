'use client';
import React from 'react';

interface InputProps {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
  type?: string;
  maxLength?: number;
  className?: string;
}

export default function Input({ label, error, prefix, className = '', ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && <label style={{ color: '#ABABAB', fontSize: '14px', fontWeight: 600, marginLeft: '4px' }}>{label}</label>}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1A1A1A',
          border: `1.5px solid ${error ? '#FF3B30' : '#2A2A2A'}`,
          borderRadius: '12px',
          padding: '0 16px',
        }}
      >
        {prefix && <div style={{ marginRight: '8px' }}>{prefix}</div>}
        <input
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: '16px',
            padding: '14px 0',
            background: 'none',
            border: 'none',
            outline: 'none',
            width: '100%',
          }}
          {...props}
        />
      </div>
      {error && <span style={{ color: '#FF3B30', fontSize: '12px', marginLeft: '4px' }}>{error}</span>}
    </div>
  );
}

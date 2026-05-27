'use client';
import React from 'react';

const VIDEO_URL = 'https://kamsirmdlabs.com/img/odogwu.mp4';

export default function VideoCarouselBackground() {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
    }}>
      <video
        autoPlay muted loop playsInline
        src={VIDEO_URL}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.75) 100%)',
      }} />
    </div>
  );
}

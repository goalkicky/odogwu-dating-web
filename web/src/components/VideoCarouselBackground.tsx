'use client';
import React, { useState, useEffect, useRef } from 'react';

const VIDEOS = [
  'https://assets.mixkit.co/videos/1054/1054-720.mp4',
  'https://assets.mixkit.co/videos/51640/51640-720.mp4',
  'https://assets.mixkit.co/videos/100945/100945-720.mp4',
  'https://assets.mixkit.co/videos/100774/100774-720.mp4',
];

export default function VideoCarouselBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [showNext, setShowNext] = useState(false);
  const currentRef = useRef<HTMLVideoElement>(null);
  const nextRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const duration = 6000;
    const crossfade = 1200;
    let timeout: ReturnType<typeof setTimeout>;

    const advance = () => {
      setShowNext(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % VIDEOS.length);
        setNextIndex(prev => (prev + 1) % VIDEOS.length);
        setShowNext(false);
      }, crossfade);
      timeout = setTimeout(advance, duration);
    };

    timeout = setTimeout(advance, duration);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
    }}>
      <video
        ref={currentRef}
        key={`current-${currentIndex}`}
        autoPlay muted loop playsInline
        src={VIDEOS[currentIndex]}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: showNext ? 0 : 1,
          transition: 'opacity 1.2s ease-in-out',
        }}
      />
      <video
        ref={nextRef}
        key={`next-${nextIndex}`}
        autoPlay muted loop playsInline
        src={VIDEOS[nextIndex]}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: showNext ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.75) 100%)',
      }} />
    </div>
  );
}

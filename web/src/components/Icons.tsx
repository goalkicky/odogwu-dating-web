import React from 'react';

type IconProps = { size?: number; color?: string; className?: string };

const s = (size?: number) => size || 24;

export const FlameIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

export const PersonIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

export const ManIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M10 22V8h4v4"/><path d="M6 14l-2 3h4l2-3"/><path d="M18 14l2 3h-4l-2-3"/>
  </svg>
);

export const WomanIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="M8 13l-2 4"/><path d="M16 13l2 4"/><path d="M8 21l4-5 4 5"/>
  </svg>
);

export const PeopleIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export const CalendarIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export const LocationIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

export const CameraIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);

export const ImagesIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);

export const HeartIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

export const CloseIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const StarIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const FlashIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

export const RefreshIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

export const ChatIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export const DiamondIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 9h20"/><path d="M12 2l4.5 7H7.5L12 2z"/><path d="M12 22l-4.5-7h9L12 22z"/><path d="M2 9l4.5 6h11L22 9"/>
  </svg>
);

export const SparklesIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/><path d="M18 15l1 2.5L21.5 18l-2.5 1L18 21.5l-1-2.5L14.5 18l2.5-1z"/>
  </svg>
);

export const ShieldIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);

export const ChevronBackIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

export const ChevronForwardIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export const CheckmarkIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const CheckmarkCircleIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);

export const CheckmarkDoneIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="2 12 7 17 13 7"/><polyline points="9 12 12 17 22 7"/>
  </svg>
);

export const CallIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export const VideoIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

export const MicIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

export const MicOffIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><path d="M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><path d="M12 19v3"/>
  </svg>
);

export const VolumeIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

export const SettingsIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export const BellIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export const HelpIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const InfoIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export const OptionsIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

export const FilterIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

export const HappyIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

export const SendIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export const StopIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
  </svg>
);

export const PencilIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);

export const CloseCircleIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

export const GoogleIcon = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" className={className}>
    <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export const InfiniteIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
  </svg>
);

export const EyeIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export const GlobeIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export const KeypadIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="17" y="3" width="4" height="4" rx="1"/><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><rect x="3" y="17" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/>
  </svg>
);

export const TransgenderIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="4"/><path d="M12 12v8"/><path d="M8 20h8"/><path d="M12 16l-3-3"/><path d="M15 13l-3 3"/>
  </svg>
);

export const EllipsisIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
);

export const LocateIcon = ({ size, color, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s(size)} height={s(size)} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
  </svg>
);

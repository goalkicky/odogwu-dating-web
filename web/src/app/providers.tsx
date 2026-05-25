'use client';
import React from 'react';
import { AuthProvider } from '@/store/AuthContext';
import { CallProvider } from '@/store/CallContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><CallProvider>{children}</CallProvider></AuthProvider>;
}

'use client';
import React from 'react';
import { AuthProvider } from '@/store/AuthContext';
import { CallProvider } from '@/store/CallContext';
import ProfileCompletionReminder from '@/components/ProfileCompletionReminder';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><CallProvider>{children}<ProfileCompletionReminder /></CallProvider></AuthProvider>;
}

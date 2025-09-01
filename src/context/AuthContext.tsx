'use client';

import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  // NextAuth removed; keep component as a passthrough to avoid widespread layout edits
  return <>{children}</>;
} 
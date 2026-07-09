'use client';

import React from 'react';
import { GameProvider } from '../lib/GameContext';
import TopControls from './TopControls';
import Toasts from './Toasts';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <TopControls />
      <Toasts />
      {children}
    </GameProvider>
  );
}

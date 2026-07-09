'use client';

import React, { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { toggleMuted, isMuted } from '../lib/sounds';

export default function TopControls() {
  const { darkMode, toggleDarkMode, connected, reconnecting } = useGame();
  const [muted, setMutedState] = useState(false);

  // isMuted() lit le localStorage, indisponible au premier rendu serveur/hydratation.
  React.useEffect(() => setMutedState(isMuted()), []);

  return (
    <div className="fixed top-4 left-4 z-[90] flex gap-2 items-center">
      <button
        type="button"
        className="w-11 h-11 rounded-full card flex items-center justify-center text-lg"
        onClick={toggleDarkMode}
        title="Basculer le theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button
        type="button"
        className="w-11 h-11 rounded-full card flex items-center justify-center text-lg"
        onClick={() => setMutedState(toggleMuted())}
        title="Activer/couper le son"
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {!connected && (
        <span className="ml-1 rounded-full bg-red-500 text-white text-xs font-bold px-3 py-1.5 animate-pulse">
          {reconnecting ? 'Reconnexion...' : 'Deconnecte'}
        </span>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { toggleMuted, isMuted } from '../lib/sounds';

const iconStroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Ampoule (mode cahier) / lune (mode tableau), griffonnees au crayon. */
function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ filter: 'url(#sketch)' }} aria-hidden="true">
      {dark ? (
        <path d="M 17 3 Q 9 4 8.5 12 Q 8 20 17 21 Q 8 24 4 15 Q 2 6 17 3 Z" {...iconStroke} />
      ) : (
        <>
          <circle cx="12" cy="12" r="4.5" {...iconStroke} />
          <path d="M 12 3 L 12 5.5 M 12 18.5 L 12 21 M 3 12 L 5.5 12 M 18.5 12 L 21 12" {...iconStroke} />
          <path d="M 5.6 5.6 L 7.4 7.4 M 16.6 16.6 L 18.4 18.4 M 18.4 5.6 L 16.6 7.4 M 7.4 16.6 L 5.6 18.4" {...iconStroke} />
        </>
      )}
    </svg>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ filter: 'url(#sketch)' }} aria-hidden="true">
      <path d="M 4 9.5 L 8 9.5 L 13 5 L 13 19 L 8 14.5 L 4 14.5 Z" {...iconStroke} />
      {muted ? (
        <path d="M 16 9 L 21 15 M 21 9 L 16 15" {...iconStroke} />
      ) : (
        <>
          <path d="M 16 9.5 Q 18 12 16 14.5" {...iconStroke} />
          <path d="M 18.5 7.5 Q 21.5 12 18.5 16.5" {...iconStroke} />
        </>
      )}
    </svg>
  );
}

export default function TopControls() {
  const { darkMode, toggleDarkMode, connected, reconnecting } = useGame();
  const [muted, setMutedState] = useState(false);

  // isMuted() lit le localStorage, indisponible au premier rendu serveur/hydratation.
  React.useEffect(() => setMutedState(isMuted()), []);

  return (
    <div className="fixed top-4 left-4 z-[90] flex gap-2 items-center">
      <button
        type="button"
        className="sketch w-10 h-10 flex items-center justify-center text-graphite hover:bg-highlighter/50"
        onClick={toggleDarkMode}
        title="Basculer le theme"
      >
        <ThemeIcon dark={darkMode} />
      </button>
      <button
        type="button"
        className="sketch w-10 h-10 flex items-center justify-center text-graphite hover:bg-highlighter/50"
        onClick={() => setMutedState(toggleMuted())}
        title="Activer/couper le son"
      >
        <SoundIcon muted={muted} />
      </button>

      {!connected && (
        <span className="postit-note no-chalk font-body text-sm px-3 py-1.5">
          {reconnecting ? 'Reconnexion...' : 'Deconnecte'}
        </span>
      )}
    </div>
  );
}

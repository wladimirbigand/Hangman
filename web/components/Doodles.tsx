'use client';

import React from 'react';

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Bonhomme baton, etoile, coeur... : les griffonnages qu'on fait en marge. */
const DOODLES: ((key: string) => React.ReactElement)[] = [
  // Bonhomme baton
  () => (
    <>
      <circle cx="12" cy="6" r="3.4" {...stroke} />
      <path d="M 12 9.5 Q 11.5 13 12 16.5" {...stroke} />
      <path d="M 12 11 Q 8.5 12.5 6 14" {...stroke} />
      <path d="M 12 11 Q 15.5 12.5 18 14" {...stroke} />
      <path d="M 12 16.5 Q 10 19 8 21.5" {...stroke} />
      <path d="M 12 16.5 Q 14 19 16 21.5" {...stroke} />
    </>
  ),
  // Etoile
  () => <path d="M 12 2.5 L 14.6 9 L 21.5 9.6 L 16.2 14 L 18 20.8 L 12 17 L 6 20.8 L 7.8 14 L 2.5 9.6 L 9.4 9 Z" {...stroke} />,
  // Coeur
  () => <path d="M 12 20.5 C 4 14.5 3 10 5.5 7 C 8 4.2 11 5.5 12 8 C 13 5.5 16 4.2 18.5 7 C 21 10 20 14.5 12 20.5 Z" {...stroke} />,
  // Fleur
  () => (
    <>
      <circle cx="12" cy="9" r="2.6" {...stroke} />
      <path d="M 12 6.4 Q 9 2 6.5 5.5 Q 5 8 9.4 9" {...stroke} />
      <path d="M 12 6.4 Q 15 2 17.5 5.5 Q 19 8 14.6 9" {...stroke} />
      <path d="M 12 11.6 Q 12.5 17 12 21.5" {...stroke} />
    </>
  ),
  // Nuage
  () => <path d="M 5 16 Q 2.5 13 5.5 11 Q 5.5 6.5 10 7 Q 12.5 3.5 16 6.5 Q 20.5 6.5 20 11 Q 22.5 13.5 19 16 Z" {...stroke} />,
  // Eclair
  () => <path d="M 13.5 2.5 L 6.5 13 L 11 13.5 L 9.5 21.5 L 17.5 10.5 L 12.5 10 Z" {...stroke} />,
  // Fusee
  () => (
    <>
      <path d="M 12 2.5 Q 16.5 8 16 14.5 L 8 14.5 Q 7.5 8 12 2.5 Z" {...stroke} />
      <path d="M 8 12 Q 5 14 5.5 18 L 8 15" {...stroke} />
      <path d="M 16 12 Q 19 14 18.5 18 L 16 15" {...stroke} />
      <path d="M 10.5 17 Q 12 21 13.5 17" {...stroke} />
    </>
  ),
  // Soleil
  () => (
    <>
      <circle cx="12" cy="12" r="4.6" {...stroke} />
      <path d="M 12 3 L 12 5.5 M 12 18.5 L 12 21 M 3 12 L 5.5 12 M 18.5 12 L 21 12" {...stroke} />
      <path d="M 5.6 5.6 L 7.4 7.4 M 16.6 16.6 L 18.4 18.4 M 18.4 5.6 L 16.6 7.4 M 7.4 16.6 L 5.6 18.4" {...stroke} />
    </>
  ),
];

/** Meme joueur => toujours le meme griffonnage (hash stable sur son id). */
function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function PlayerDoodle({ id, className = 'w-6 h-6' }: { id: string; className?: string }) {
  const index = hash(id) % DOODLES.length;
  const tilt = (hash(id) % 7) - 3;

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0`}
      style={{ filter: 'url(#sketch)', rotate: `${tilt}deg` }}
      aria-hidden="true"
    >
      {DOODLES[index]('d')}
    </svg>
  );
}

/** Petite etoile griffonnee, pour les confettis "dessines" du podium. */
export function DoodleStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ filter: 'url(#sketch)' }} aria-hidden="true">
      <path d="M 12 2.5 L 14.6 9 L 21.5 9.6 L 16.2 14 L 18 20.8 L 12 17 L 6 20.8 L 7.8 14 L 2.5 9.6 L 9.4 9 Z" {...stroke} />
    </svg>
  );
}

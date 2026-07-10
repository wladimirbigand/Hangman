import React from 'react';

/**
 * Filtres SVG partages, montes une seule fois dans le layout et reutilises via
 * `filter: url(#sketch)`. feTurbulence + feDisplacementMap deforment legerement
 * les traits pour leur donner l'irregularite d'un dessin au crayon.
 *
 * Deux intensites : `sketch` (traits fins, clavier/icones) et `sketch-strong`
 * (le pendu, ou le tremblement doit se voir).
 */
export default function SketchFilters() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      <defs>
        <filter id="sketch" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sketch-strong" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

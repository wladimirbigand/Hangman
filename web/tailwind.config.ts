import type { Config } from 'tailwindcss';

/**
 * Theme "cahier d'ecolier" : les couleurs sont celles d'une trousse (crayon a
 * papier, stylo bleu, stylo rouge du prof, feutre vert, surligneur jaune).
 * Le mode sombre est un tableau noir de classe, pilote par les variables CSS
 * definies dans globals.css — d'ou les couleurs `paper`/`ink-soft` en var().
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Couleurs sensibles au theme (crayon sur papier / craie sur tableau).
        // Canaux RGB bruts => les modificateurs d'opacite (`/40`) fonctionnent.
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        graphite: 'rgb(var(--graphite-rgb) / <alpha-value>)',
        'graphite-soft': 'rgb(var(--graphite-soft-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        redpen: 'rgb(var(--redpen-rgb) / <alpha-value>)',
        greenpen: 'rgb(var(--greenpen-rgb) / <alpha-value>)',
        rule: 'var(--rule)',
        // Couleurs fixes (identiques quel que soit le theme). Litterales, et non
        // var(), pour que les modificateurs d'opacite (`bg-highlighter/60`) marchent.
        highlighter: '#F9E547',
        postit: '#FDF3A7',
        margin: '#D98A8A',
      },
      fontFamily: {
        display: ['var(--font-caveat)', 'Comic Sans MS', 'cursive'],
        body: ['var(--font-patrick)', 'Comic Sans MS', 'cursive'],
        marker: ['var(--font-marker)', 'Impact', 'cursive'],
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' },
        },
        // Tremblement nerveux quand le temps presse
        jitter: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-1px, 1px) rotate(-2deg)' },
          '50%': { transform: 'translate(1px, -1px) rotate(2deg)' },
          '75%': { transform: 'translate(-1px, -1px) rotate(-1deg)' },
        },
        // Le trait se dessine, comme trace a la main
        draw: {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
        // Apparition d'une lettre "ecrite" : legere rotation + scale
        scribbleIn: {
          '0%': { opacity: '0', transform: 'scale(0.6) rotate(-8deg)' },
          '70%': { opacity: '1', transform: 'scale(1.08) rotate(3deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        jitter: 'jitter 0.25s linear infinite',
        scribbleIn: 'scribbleIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;

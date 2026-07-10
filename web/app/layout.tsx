import type { Metadata } from 'next';
import { Caveat, Patrick_Hand, Permanent_Marker } from 'next/font/google';
import Providers from '../components/Providers';
import SketchFilters from '../components/SketchFilters';
import './globals.css';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-caveat', display: 'swap' });
const patrickHand = Patrick_Hand({ subsets: ['latin'], weight: '400', variable: '--font-patrick', display: 'swap' });
const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-marker',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Le Pendu - Multijoueur',
  description: 'Jeu du Pendu multijoueur en temps reel entre amis',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✏️</text></svg>',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${caveat.variable} ${patrickHand.variable} ${permanentMarker.variable}`}>
      <body>
        <SketchFilters />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '../lib/GameContext';
import JoinModal from './JoinModal';
import Lobby from './Lobby';
import Game from './Game';

export default function RoomClient({ code }: { code: string }) {
  const { ready, room, tryRejoin } = useGame();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Le socket (donc tryRejoin) n'existe qu'apres le montage cote client ;
    // tant que ready est faux, on attend au lieu de conclure "salle inconnue".
    if (!ready) return;
    setChecked(false);
    if (room && room.code === code) {
      setChecked(true);
      return;
    }
    tryRejoin(code).finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, ready]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display text-2xl animate-pulse">Connexion a la salle...</p>
      </div>
    );
  }

  if (!room || room.code !== code) {
    return <JoinModal code={code} />;
  }

  if (room.status === 'lobby') return <Lobby />;
  return <Game />;
}

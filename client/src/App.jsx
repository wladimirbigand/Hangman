import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { toggleMuted, isMuted } from './utils/sounds';
import Home from './components/Home';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Toasts from './components/Toasts';

function RoomRoute() {
  const { code } = useParams();
  const { room, tryRejoin } = useGame();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(false);
    if (room && room.code === code) {
      setChecked(true);
      return;
    }
    tryRejoin(code).finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-bold animate-pulse">Connexion a la salle...</p>
      </div>
    );
  }

  if (!room || room.code !== code) {
    return <JoinRoom code={code} />;
  }

  if (room.status === 'lobby') return <Lobby />;
  return <Game />;
}

function TopControls() {
  const { darkMode, toggleDarkMode } = useGame();
  const [muted, setMutedState] = useState(isMuted());

  return (
    <div className="fixed top-4 left-4 z-[90] flex gap-2">
      <button
        className="w-11 h-11 rounded-full card flex items-center justify-center text-lg"
        onClick={toggleDarkMode}
        title="Basculer le theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button
        className="w-11 h-11 rounded-full card flex items-center justify-center text-lg"
        onClick={() => setMutedState(toggleMuted())}
        title="Activer/couper le son"
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <TopControls />
        <Toasts />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/room/:code" element={<RoomRoute />} />
        </Routes>
      </HashRouter>
    </GameProvider>
  );
}

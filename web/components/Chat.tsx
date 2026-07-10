'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../lib/types';
import { PlayerDoodle } from './Doodles';

export default function Chat({ messages, onSend }: { messages: ChatMessage[]; onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onSend(clean);
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 min-h-[160px] max-h-64">
        {messages.length === 0 && (
          <p className="font-display text-lg text-graphite-soft text-center mt-6 -rotate-1">
            Rien d&apos;ecrit pour l&apos;instant... dis bonjour !
          </p>
        )}

        {/* Chaque message est un petit mot plie qu'on se passe en classe. */}
        {messages.map((m, i) => (
          <div
            key={m.id}
            className="sketch bg-transparent px-3 py-1.5 self-start max-w-[95%]"
            style={{ rotate: `${((i % 3) - 1) * 0.6}deg` }}
          >
            <div className="flex items-baseline gap-1.5">
              <PlayerDoodle id={m.pseudo} className="w-4 h-4 text-ink self-center" />
              <span className="font-display font-bold text-ink">{m.pseudo}</span>
              <span className="text-graphite-soft">—</span>
              <span className="font-body break-words">{m.text}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <input
          className="input flex-1 py-2"
          placeholder="Ecris un mot..."
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-secondary px-4 py-2">
          Envoyer
        </button>
      </form>
    </div>
  );
}

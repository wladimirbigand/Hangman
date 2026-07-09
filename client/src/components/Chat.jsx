import React, { useEffect, useRef, useState } from 'react';

export default function Chat({ messages, onSend }) {
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onSend(clean);
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 min-h-[160px] max-h-64">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center mt-6">
            Pas encore de messages. Dis bonjour !
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-bold" style={{ color: m.color }}>
              {m.pseudo}
            </span>
            <span className="text-slate-500 dark:text-slate-400">: </span>
            <span className="break-words">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <input
          className="input flex-1 py-2"
          placeholder="Ecris un message..."
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary px-4 py-2">
          Envoyer
        </button>
      </form>
    </div>
  );
}

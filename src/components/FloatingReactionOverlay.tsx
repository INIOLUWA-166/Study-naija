import React, { useState } from 'react';
import { tournamentAudio } from '../utils/tournamentAudio';

interface FloatingReaction {
  id: string;
  emoji: string;
  leftPercent: number;
}

export const FloatingReactionOverlay: React.FC = () => {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const triggerReaction = (emoji: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const leftPercent = 20 + Math.random() * 60; // 20% to 80% screen width
    setReactions(prev => [...prev, { id, emoji, leftPercent }]);

    // Play subtle chime or sound
    if (emoji === '🐐') {
      tournamentAudio.playGoatHorn();
    } else if (emoji === '👏' || emoji === '🔥' || emoji === '🏆') {
      tournamentAudio.playCrowdCheer(1.2);
    } else {
      tournamentAudio.playCorrect();
    }

    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  return (
    <>
      {/* Floating Emojis Animation Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map(r => (
          <div
            key={r.id}
            className="absolute bottom-20 text-3xl sm:text-4xl animate-float-up opacity-90 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] select-none"
            style={{
              left: `${r.leftPercent}%`,
              animation: 'floatUp 1.8s ease-out forwards'
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-200px) scale(1.3) rotate(-10deg);
            opacity: 0.95;
          }
          100% {
            transform: translateY(-450px) scale(1.6) rotate(15deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export const FloatingReactionToolbar: React.FC<{ onTriggerEmoji?: (emoji: string) => void }> = ({ onTriggerEmoji }) => {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const handleSendEmoji = (emoji: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const leftPercent = 35 + Math.random() * 30;
    setReactions(prev => [...prev, { id, emoji, leftPercent }]);

    if (emoji === '🐐') {
      tournamentAudio.playGoatHorn();
    } else if (emoji === '👏' || emoji === '🔥' || emoji === '🏆') {
      tournamentAudio.playCrowdCheer(1.2);
    } else {
      tournamentAudio.playCorrect();
    }

    if (onTriggerEmoji) onTriggerEmoji(emoji);

    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Local floating reactions container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {reactions.map(r => (
          <div
            key={r.id}
            className="absolute bottom-12 text-3xl select-none pointer-events-none"
            style={{
              left: `${r.leftPercent}%`,
              animation: 'floatUpToolbar 1.6s ease-out forwards'
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Emoji Chips */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2 hidden sm:inline">
          Live Cheers:
        </span>
        {[
          { emoji: '👏', label: 'Cheer' },
          { emoji: '🔥', label: 'Fire' },
          { emoji: '🐐', label: 'G.O.A.T' },
          { emoji: '⚡', label: 'Speed' },
          { emoji: '🏆', label: 'Trophy' }
        ].map(item => (
          <button
            key={item.emoji}
            type="button"
            onClick={() => handleSendEmoji(item.emoji)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400/50 border border-slate-700/60 text-base sm:text-lg transition-transform hover:scale-125 cursor-pointer active:scale-95"
            title={`Send ${item.label}`}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes floatUpToolbar {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 1;
          }
          60% {
            transform: translateY(-120px) scale(1.4);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-240px) scale(1.7);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

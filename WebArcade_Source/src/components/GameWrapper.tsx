import type { ReactNode } from 'react';
import { Trophy, Home, RotateCcw, Play } from 'lucide-react';

interface GameWrapperProps {
  title: string;
  description: string;
  gameState: 'menu' | 'playing' | 'gameover';
  score: number;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
  onBackToHub: () => void;
  children: ReactNode;
}

export function GameWrapper({
  title,
  description,
  gameState,
  score,
  highScore,
  onStart,
  onRestart,
  onBackToHub,
  children,
}: GameWrapperProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-zinc-950 text-white relative">
      {/* Top HUD */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onBackToHub}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Home size={18} /> Hub
        </button>
        <div className="flex gap-6 font-mono text-xl">
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 text-xs uppercase tracking-wider">Score</span>
            <span className="text-cyan-400">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 text-xs uppercase tracking-wider">Best</span>
            <span className="text-amber-400 flex items-center gap-1">
              <Trophy size={16} /> {highScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl shadow-cyan-900/20 border border-zinc-800">
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
              {title}
            </h1>
            <p className="text-zinc-400 mb-8 max-w-md text-center">{description}</p>
            <button 
              onClick={onStart}
              className="flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/25"
            >
              <Play fill="currentColor" /> Play Now
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 backdrop-blur-md">
            <h2 className="text-5xl font-black mb-2 text-red-500">GAME OVER</h2>
            <p className="text-2xl text-zinc-300 mb-8 font-mono">Final Score: <span className="text-cyan-400">{score}</span></p>
            
            <div className="flex gap-4">
              <button 
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw /> Play Again
              </button>
              <button 
                onClick={onBackToHub}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Home /> Menu
              </button>
            </div>
          </div>
        )}

        {/* Game Render Area */}
        <div className="w-full h-full relative">
          {children}
        </div>
      </div>
    </div>
  );
}

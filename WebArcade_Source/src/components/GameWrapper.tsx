import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Trophy, Home, RotateCcw, Play, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameWrapperProps {
  title: string;
  description: string;
  guide?: string;
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
  guide,
  gameState,
  score,
  highScore,
  onStart,
  onRestart,
  onBackToHub,
  children,
}: GameWrapperProps) {
  useEffect(() => {
    if (gameState === 'playing') {
      soundManager.startBGM();
    } else {
      soundManager.stopBGM();
    }
    return () => soundManager.stopBGM();
  }, [gameState]);

  return (
    <div className="flex flex-col w-full h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Top HUD (Relative, not fixed, so it takes up exact space) */}
      <div className="flex-none w-full p-4 flex justify-between items-center bg-zinc-950 border-b border-zinc-800 shadow-md z-10">
        <button 
          onClick={onBackToHub}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors shadow-sm"
        >
          <Home size={18} /> Hub
        </button>
        <div className="flex gap-6 font-mono text-xl">
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 text-xs uppercase tracking-wider">Score</span>
            <span className="text-cyan-400 font-bold">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 text-xs uppercase tracking-wider">Best</span>
            <span className="text-amber-400 flex items-center gap-1 font-bold">
              <Trophy size={16} /> {highScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Container (Fills remaining space perfectly) */}
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col min-h-0 relative">
        <div className="relative flex-1 w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10 border border-zinc-800">
          
          {gameState === 'menu' && (
            <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center z-30 p-6 overflow-y-auto">
              <div className="max-w-2xl w-full flex flex-col items-center my-auto py-8">
                <h1 className="text-4xl sm:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight text-center drop-shadow-md">
                  {title}
                </h1>
                <p className="text-zinc-300 mb-8 text-center text-lg">{description}</p>
                
                {guide && (
                  <div className="mb-10 p-5 bg-zinc-900/80 border border-zinc-700 rounded-xl w-full text-zinc-300 shadow-inner">
                    <h3 className="flex items-center gap-2 text-cyan-400 font-bold mb-3 uppercase tracking-wider text-sm"><HelpCircle size={16} /> How to Play</h3>
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{guide}</p>
                  </div>
                )}

                <button 
                  onClick={onStart}
                  className="flex items-center gap-2 px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-xl transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)]"
                >
                  <Play fill="currentColor" /> START GAME
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-30 backdrop-blur-md p-6">
              <h2 className="text-5xl font-black mb-2 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] text-center">GAME OVER</h2>
              <p className="text-2xl text-zinc-300 mb-8 font-mono">Final Score: <span className="text-cyan-400 font-bold">{score}</span></p>
              
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
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGameLoop } from '../hooks/useGameLoop';

const WORDS = [
  "algorithm", "bandwidth", "compile", "database", "encryption", 
  "firewall", "gateway", "hardware", "iteration", "javascript", 
  "kernel", "latency", "malware", "network", "offline", 
  "protocol", "query", "router", "server", "terminal", 
  "uptime", "variable", "webhook", "xml", "yield", "zip",
  "cyber", "neon", "matrix", "hacker", "proxy", "mainframe"
];

interface FallingWord {
  id: number;
  text: string;
  y: number;
  x: number;
  speed: number;
}

interface Props {
  onBack: () => void;
}

export function SpeedTyper({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('speedtyper-highscore', 0);
  
  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  
  const nextWordId = useRef(0);
  const timeSinceLastSpawn = useRef(0);
  const baseSpeed = useRef(0.05); // pixels per ms
  const spawnRate = useRef(2000); // ms between spawns

  const spawnWord = useCallback(() => {
    const text = WORDS[Math.floor(Math.random() * WORDS.length)];
    // Random X between 10% and 80% to avoid edges
    const x = 10 + Math.random() * 70;
    
    setWords(prev => [
      ...prev,
      {
        id: nextWordId.current++,
        text,
        x,
        y: -10, // Start just above screen
        speed: baseSpeed.current + (Math.random() * 0.02)
      }
    ]);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setWords([]);
    setCurrentInput('');
    nextWordId.current = 0;
    timeSinceLastSpawn.current = 0;
    baseSpeed.current = 0.05;
    spawnRate.current = 2000;
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore, setHighScore]);

  // Handle typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      // Ignore modifiers and non-character keys
      if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Escape') return;

      if (e.key === 'Escape') {
        setCurrentInput('');
        return;
      }

      if (e.key === 'Backspace') {
        setCurrentInput(prev => prev.slice(0, -1));
        return;
      }

      // Add typed char
      const newChar = e.key.toLowerCase();
      if (/[a-z]/.test(newChar)) {
        setCurrentInput(prev => {
          const newInput = prev + newChar;
          
          // Check if it matches any word
          // We do this in a state updater callback to have latest words?
          // Actually, we can check words directly in an effect or here.
          // Let's use setWords to see if we can destroy a word.
          let matched = false;
          setWords(currentWords => {
            const index = currentWords.findIndex(w => w.text === newInput);
            if (index !== -1) {
              matched = true;
              setScore(s => s + newInput.length * 10);
              // Increase difficulty slightly
              baseSpeed.current += 0.001;
              spawnRate.current = Math.max(500, spawnRate.current - 20);
              
              const nextWords = [...currentWords];
              nextWords.splice(index, 1);
              return nextWords;
            }
            return currentWords;
          });

          return matched ? '' : newInput;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useGameLoop((deltaTime) => {
    if (gameState !== 'playing') return;

    timeSinceLastSpawn.current += deltaTime;
    if (timeSinceLastSpawn.current > spawnRate.current) {
      spawnWord();
      timeSinceLastSpawn.current = 0;
    }

    setWords(prevWords => {
      let gameOver = false;
      const nextWords = prevWords.map(w => {
        const newY = w.y + (w.speed * deltaTime);
        if (newY > 100) {
          gameOver = true;
        }
        return { ...w, y: newY };
      });

      if (gameOver) {
        handleGameOver();
      }

      return nextWords;
    });
  }, gameState === 'playing');

  return (
    <GameWrapper
      title="Speed Typer"
      description="Type the falling words before they reach the bottom of the screen to defend your base."
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        {/* Play Area */}
        {words.map(word => {
          // Check if current input matches the start of this word
          const isMatching = currentInput.length > 0 && word.text.startsWith(currentInput);
          
          return (
            <div
              key={word.id}
              className={`absolute text-2xl font-mono px-3 py-1 rounded-md bg-zinc-900/80 backdrop-blur-sm border transition-colors duration-75
                ${isMatching ? 'border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'border-zinc-800 text-zinc-400'}`}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              {isMatching ? (
                <>
                  <span className="text-white bg-orange-600/30 rounded-sm">{word.text.slice(0, currentInput.length)}</span>
                  <span>{word.text.slice(currentInput.length)}</span>
                </>
              ) : (
                word.text
              )}
            </div>
          );
        })}

        {/* Defense Line */}
        <div className="absolute bottom-0 w-full h-2 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
        
        {/* Input Display */}
        {gameState === 'playing' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <span className="text-xs text-zinc-500 mb-1 uppercase tracking-widest">Targeting</span>
            <div className="h-14 px-8 min-w-[200px] flex items-center justify-center bg-zinc-900/90 border border-zinc-700 rounded-full text-3xl font-mono text-white shadow-2xl backdrop-blur-md">
              {currentInput || <span className="text-zinc-600 font-sans text-xl">Type to defend...</span>}
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}

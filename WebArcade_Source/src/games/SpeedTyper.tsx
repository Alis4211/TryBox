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

type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

export function SpeedTyper({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useLocalStorage('speedtyper-highscore', 0);
  
  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  
  const nextWordId = useRef(0);
  const timeSinceLastSpawn = useRef(0);
  
  // Game logic refs
  const baseSpeed = useRef(0.02);
  const spawnRate = useRef(3000);
  const wordsToSpawn = useRef(1);

  const getDifficultySettings = (diff: Difficulty, currentLevel: number) => {
    let speed = 0.02; // Beginner base
    let rate = 3000;
    let spawnCount = 1;

    if (diff === 'Intermediate') {
      speed = 0.04;
      rate = 2000;
    } else if (diff === 'Expert') {
      speed = 0.06;
      rate = 1500;
    }

    // Scale with level
    speed += (currentLevel * 0.005);
    rate = Math.max(500, rate - (currentLevel * 100));
    
    // Every 5 levels, spawn an extra word at a time
    spawnCount = 1 + Math.floor(currentLevel / 5);

    return { speed, rate, spawnCount };
  };

  const spawnWord = useCallback(() => {
    setWords(prev => {
      const newWords = [...prev];
      for (let i = 0; i < wordsToSpawn.current; i++) {
        const text = WORDS[Math.floor(Math.random() * WORDS.length)];
        const x = 10 + Math.random() * 70;
        
        // Avoid spawning words too close vertically
        const yOffset = i * -15; 

        newWords.push({
          id: nextWordId.current++,
          text,
          x,
          y: -10 + yOffset,
          speed: baseSpeed.current + (Math.random() * 0.01)
        });
      }
      return newWords;
    });
  }, []);

  const startGame = () => {
    const settings = getDifficultySettings(difficulty, 1);
    baseSpeed.current = settings.speed;
    spawnRate.current = settings.rate;
    wordsToSpawn.current = settings.spawnCount;

    setGameState('playing');
    setScore(0);
    setLevel(1);
    setWords([]);
    setCurrentInput('');
    nextWordId.current = 0;
    timeSinceLastSpawn.current = 0;
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore, setHighScore]);

  // Level progression
  useEffect(() => {
    if (score > 0 && score % 100 === 0) {
      const newLevel = Math.floor(score / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        const settings = getDifficultySettings(difficulty, newLevel);
        baseSpeed.current = settings.speed;
        spawnRate.current = settings.rate;
        wordsToSpawn.current = settings.spawnCount;
      }
    }
  }, [score, level, difficulty]);

  // Handle typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Escape') return;

      if (e.key === 'Escape') {
        setCurrentInput('');
        return;
      }

      if (e.key === 'Backspace') {
        setCurrentInput(prev => prev.slice(0, -1));
        return;
      }

      const newChar = e.key.toLowerCase();
      if (/[a-z]/.test(newChar)) {
        setCurrentInput(prev => {
          const newInput = prev + newChar;
          
          let matched = false;
          setWords(currentWords => {
            const index = currentWords.findIndex(w => w.text === newInput);
            if (index !== -1) {
              matched = true;
              setScore(s => s + 10);
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
      guide="• Words will fall from the top of the screen.\n• Type the words exactly as they appear.\n• You do NOT need to press Enter.\n• If you make a mistake, press Backspace.\n• If a single word reaches the bottom red line, it is GAME OVER!"
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      {/* Difficulty Selector in Menu */}
      {gameState === 'menu' && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-full">
          <span className="text-zinc-400 mb-2 uppercase text-sm font-bold tracking-wider">Select Difficulty</span>
          <div className="flex gap-4">
            {(['Beginner', 'Intermediate', 'Expert'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm sm:text-base ${
                  difficulty === diff 
                    ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        
        {/* HUD Stats */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 font-mono text-zinc-400 text-sm sm:text-base">
            <p>LEVEL: <span className="text-white font-bold">{level}</span></p>
            <p>DIFFICULTY: <span className="text-orange-400">{difficulty}</span></p>
          </div>
        )}

        {/* Play Area */}
        {words.map(word => {
          const isMatching = currentInput.length > 0 && word.text.startsWith(currentInput);
          
          return (
            <div
              key={word.id}
              className={`absolute text-lg sm:text-2xl font-mono px-2 sm:px-3 py-1 rounded-md bg-zinc-900/80 backdrop-blur-sm border transition-colors duration-75
                ${isMatching ? 'border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110' : 'border-zinc-800 text-zinc-400'}`}
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
            <div className="h-12 sm:h-14 px-6 sm:px-8 min-w-[150px] sm:min-w-[200px] flex items-center justify-center bg-zinc-900/90 border border-zinc-700 rounded-full text-2xl sm:text-3xl font-mono text-white shadow-2xl backdrop-blur-md">
              {currentInput || <span className="text-zinc-600 font-sans text-lg sm:text-xl">Type to defend...</span>}
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}

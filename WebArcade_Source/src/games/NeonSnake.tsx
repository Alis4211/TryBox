import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Props {
  onBack: () => void;
}

export function NeonSnake({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('neonsnake-highscore', 0);
  
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Ensure food doesn't spawn on snake
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setFood(generateFood([{ x: 10, y: 10 }]));
    setIsPaused(false);
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore, setHighScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
        case 'Escape':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (direction) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    // Increase speed slightly as snake gets longer, up to a limit
    const currentSpeed = Math.max(50, INITIAL_SPEED - (snake.length * 2));
    const intervalId = setInterval(moveSnake, currentSpeed);
    
    return () => clearInterval(intervalId);
  }, [gameState, direction, food, isPaused, generateFood, handleGameOver, snake.length]);

  return (
    <GameWrapper
      title="Neon Snake"
      description="Classic snake with a cyberpunk twist. Collect glowing orbs and grow."
      guide="• Use W, A, S, D or Arrow Keys to move the snake.\n• Eat the glowing cyan orbs to grow longer and increase your score.\n• Do not hit the walls or your own tail!\n• Press Spacebar to Pause."
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full flex items-center justify-center p-8">
        <div 
          className="aspect-square w-full max-w-2xl bg-zinc-950/80 rounded-lg relative overflow-hidden border border-zinc-800 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {/* Grid lines (optional, adds to retro feel) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:5%] pointer-events-none" />

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`
                  rounded-sm transition-all duration-75
                  ${isHead ? 'bg-emerald-400 z-10 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : 'bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.4)]'}
                `}
                style={{
                  gridColumnStart: segment.x + 1,
                  gridRowStart: segment.y + 1,
                  margin: '1px'
                }}
              />
            );
          })}

          {/* Food */}
          <div
            className="bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,1)] animate-pulse"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
              margin: '2px'
            }}
          />

          {isPaused && gameState === 'playing' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-20">
              <span className="text-4xl font-black text-white tracking-widest">PAUSED</span>
            </div>
          )}
        </div>
      </div>
    </GameWrapper>
  );
}

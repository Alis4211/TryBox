import { useState, useEffect, useRef, useCallback } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGameLoop } from '../hooks/useGameLoop';
import { Rocket } from 'lucide-react';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: 'asteroid' | 'powerup';
}

interface Props {
  onBack: () => void;
}

export function OrbitalDodge({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('orbitaldodge-highscore', 0);
  
  const [playerX, setPlayerX] = useState(50); // percentage 0-100
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  const nextObstacleId = useRef(0);
  const timeSinceLastSpawn = useRef(0);
  const gameSpeedMultiplier = useRef(1);
  const scoreRef = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  const spawnObstacle = useCallback(() => {
    const isPowerup = Math.random() < 0.1; // 10% chance
    const size = isPowerup ? 4 : (4 + Math.random() * 8); // asteroid size 4 to 12
    const x = Math.random() * (100 - size);
    
    setObstacles(prev => [
      ...prev,
      {
        id: nextObstacleId.current++,
        x,
        y: -10,
        size,
        speed: (0.04 + Math.random() * 0.04) * gameSpeedMultiplier.current,
        type: isPowerup ? 'powerup' : 'asteroid'
      }
    ]);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setPlayerX(50);
    setObstacles([]);
    nextObstacleId.current = 0;
    timeSinceLastSpawn.current = 0;
    gameSpeedMultiplier.current = 1;
    keys.current = {};
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (scoreRef.current > highScore) {
      setHighScore(Math.floor(scoreRef.current));
    }
  }, [highScore, setHighScore]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useGameLoop((deltaTime) => {
    if (gameState !== 'playing') return;

    // Move player
    setPlayerX(prev => {
      let newX = prev;
      if (keys.current['ArrowLeft'] || keys.current['a']) newX -= 0.05 * deltaTime;
      if (keys.current['ArrowRight'] || keys.current['d']) newX += 0.05 * deltaTime;
      return Math.max(0, Math.min(100, newX));
    });

    // Score ticks up over time
    scoreRef.current += deltaTime * 0.01;
    setScore(Math.floor(scoreRef.current));
    gameSpeedMultiplier.current = 1 + (scoreRef.current / 500); // gets faster

    // Spawning
    timeSinceLastSpawn.current += deltaTime;
    const currentSpawnRate = Math.max(200, 1000 - (scoreRef.current * 2));
    
    if (timeSinceLastSpawn.current > currentSpawnRate) {
      spawnObstacle();
      timeSinceLastSpawn.current = 0;
    }

    // Move obstacles and collision
    setObstacles(prev => {
      let gameOver = false;
      const nextObstacles: Obstacle[] = [];
      const playerRadius = 3; // rough percentage radius for collision

      for (const obs of prev) {
        const newY = obs.y + (obs.speed * deltaTime);
        
        // Check collision
        // Simplified AABB collision using percentages
        // Player is at x: playerX, y: 90
        const isXCollision = (playerX + playerRadius > obs.x) && (playerX - playerRadius < obs.x + obs.size);
        const isYCollision = (90 + playerRadius > newY) && (90 - playerRadius < newY + obs.size);

        if (isXCollision && isYCollision) {
          if (obs.type === 'asteroid') {
            gameOver = true;
          } else {
            // Powerup
            scoreRef.current += 100;
            setScore(Math.floor(scoreRef.current));
            continue; // don't keep powerup
          }
        }

        if (newY < 110) {
          nextObstacles.push({ ...obs, y: newY });
        }
      }

      if (gameOver) {
        handleGameOver();
      }

      return nextObstacles;
    });
  }, gameState === 'playing');

  return (
    <GameWrapper
      title="Orbital Dodge"
      description="Pilot your ship through a dense asteroid field. Use Left/Right arrows or A/D to move."
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        {/* Starfield background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        {/* Player */}
        <div 
          className="absolute bottom-[10%] -translate-x-1/2 flex items-center justify-center text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
          style={{ left: `${playerX}%` }}
        >
          <Rocket size={40} className="transform -rotate-45" />
          {/* Thruster */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-2 h-8 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 animate-pulse rounded-full" />
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            className={`absolute rounded-md ${
              obs.type === 'asteroid' 
                ? 'bg-zinc-600 border border-zinc-500 shadow-xl' 
                : 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] rounded-full animate-bounce'
            }`}
            style={{
              left: `${obs.x}%`,
              top: `${obs.y}%`,
              width: `${obs.size}%`,
              height: `${obs.size}%`,
              // Add a bit of random rotation to asteroids
              transform: obs.type === 'asteroid' ? `rotate(${obs.id * 45}deg)` : 'none'
            }}
          />
        ))}
      </div>
    </GameWrapper>
  );
}

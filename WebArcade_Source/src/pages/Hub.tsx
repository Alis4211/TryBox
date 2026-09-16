import { Gamepad2, BrainCircuit, Keyboard, Rocket, Palette } from 'lucide-react';

interface HubProps {
  onSelectGame: (gameId: string) => void;
}

const GAMES = [
  {
    id: 'snake',
    title: 'Neon Snake',
    description: 'Classic snake with a cyberpunk twist. Collect glowing orbs and grow.',
    icon: Gamepad2,
    color: 'from-green-500 to-emerald-700',
    shadow: 'shadow-green-500/20'
  },
  {
    id: 'memory',
    title: 'Memory Matrix',
    description: 'Test your cognitive limits. Match futuristic pairs quickly.',
    icon: BrainCircuit,
    color: 'from-blue-500 to-indigo-700',
    shadow: 'shadow-blue-500/20'
  },
  {
    id: 'typer',
    title: 'Speed Typer',
    description: 'Defend your base by typing incoming words before they hit you.',
    icon: Keyboard,
    color: 'from-orange-500 to-red-700',
    shadow: 'shadow-orange-500/20'
  },
  {
    id: 'dodge',
    title: 'Orbital Dodge',
    description: 'Pilot your ship through an asteroid field and collect power-ups.',
    icon: Rocket,
    color: 'from-purple-500 to-fuchsia-700',
    shadow: 'shadow-purple-500/20'
  },
  {
    id: 'simon',
    title: "Simon's Sequence",
    description: 'Follow the pattern. Repeat the flashing colors correctly to advance.',
    icon: Palette,
    color: 'from-pink-500 to-rose-700',
    shadow: 'shadow-pink-500/20'
  }
];

export function Hub({ onSelectGame }: HubProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 overflow-y-auto">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 pb-20">
        <header className="mb-12 sm:mb-20 text-center pt-8 sm:pt-16">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter animate-pulse">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              ARCADE NEXUS
            </span>
          </h1>
          <p className="text-lg sm:text-2xl text-zinc-400 font-mono tracking-widest uppercase">Select your challenge</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className={`group relative flex flex-col items-start p-6 sm:p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800 hover:border-zinc-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${game.shadow} text-left overflow-hidden`}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${game.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className={`p-4 rounded-2xl mb-6 bg-gradient-to-br ${game.color} bg-opacity-20 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon size={36} className="text-white" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black mb-3 text-zinc-100 group-hover:text-white tracking-tight">{game.title}</h2>
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed font-medium">
                  {game.description}
                </p>
                
                <div className="mt-6 flex items-center text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transform translate-x-[-20px] group-hover:translate-x-0 transition-all duration-300">
                  PLAY NOW <span className="ml-2 animate-bounce">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

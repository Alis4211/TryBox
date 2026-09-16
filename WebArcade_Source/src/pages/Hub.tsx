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
  },
  {
    id: 'memory',
    title: 'Memory Matrix',
    description: 'Test your cognitive limits. Match futuristic pairs quickly.',
    icon: BrainCircuit,
    color: 'from-blue-500 to-indigo-700',
  },
  {
    id: 'typer',
    title: 'Speed Typer',
    description: 'Defend your base by typing incoming words before they hit you.',
    icon: Keyboard,
    color: 'from-orange-500 to-red-700',
  },
  {
    id: 'dodge',
    title: 'Orbital Dodge',
    description: 'Pilot your ship through an asteroid field and collect power-ups.',
    icon: Rocket,
    color: 'from-purple-500 to-fuchsia-700',
  },
  {
    id: 'simon',
    title: "Simon's Sequence",
    description: 'Follow the pattern. Repeat the flashing colors correctly to advance.',
    icon: Palette,
    color: 'from-pink-500 to-rose-700',
  }
];

export function Hub({ onSelectGame }: HubProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 text-center pt-12">
          <h1 className="text-6xl font-black mb-4 tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              ARCADE NEXUS
            </span>
          </h1>
          <p className="text-xl text-zinc-400">Select a mini-game to begin your challenge</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className="group relative flex flex-col items-start p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all hover:scale-[1.02] active:scale-[0.98] text-left overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${game.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className={`p-4 rounded-xl mb-6 bg-gradient-to-br ${game.color} bg-opacity-10`}>
                  <Icon size={32} className="text-white" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2 text-zinc-100 group-hover:text-white">{game.title}</h2>
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                  {game.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

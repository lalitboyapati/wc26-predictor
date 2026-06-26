import type { Player } from '../types';
import { POS_COLORS } from '../lib/positionColors';

interface Props {
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeam: string;
  awayTeam: string;
  onPlayerClick: (player: Player) => void;
  selectedPlayerId?: string;
}

function PlayerDot({
  player,
  onClick,
  isSelected,
}: {
  player: Player;
  onClick: () => void;
  isSelected: boolean;
}) {
  const color = POS_COLORS[player.position] ?? '#6b7280';
  const initials = player.name.split(' ').map(w => w[0]).slice(0, 2).join('');

  return (
    <button
      onClick={onClick}
      aria-label={`${player.name} (${player.position})`}
      style={{
        position: 'absolute',
        left: `${player.pitchX}%`,
        top: `${player.pitchY}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      className="group focus:outline-none w-11 h-11 flex items-center justify-center"
    >
      {/* Pulse ring on selected — respects reduced-motion */}
      {isSelected && (
        <span
          className="absolute inset-0 rounded-full motion-safe:animate-ping"
          style={{ backgroundColor: color, opacity: 0.4 }}
        />
      )}
      {/* Dot */}
      <span
        className={`relative flex items-center justify-center rounded-full font-bold text-white shadow-lg transition-all duration-150
          ${isSelected ? 'scale-125 ring-2 ring-white' : 'group-hover:scale-110'}
          w-8 h-8 text-[9px] sm:w-9 sm:h-9 sm:text-[10px]`}
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
      >
        {initials}
      </span>
      {/* Name tooltip */}
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap
          bg-gray-900 border border-gray-700 text-gray-100 text-[10px] px-2 py-0.5 rounded
          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
      >
        {player.name}
      </span>
    </button>
  );
}

export default function SoccerPitch({
  homePlayers,
  awayPlayers,
  homeTeam,
  awayTeam,
  onPlayerClick,
  selectedPlayerId,
}: Props) {
  return (
    <div className="relative w-full" style={{ paddingBottom: '62%' }}>
      {/* Pitch background */}
      <div
        className="absolute inset-0 overflow-hidden rounded-xl border border-white/10"
        style={{
          background: 'repeating-linear-gradient(90deg, #14532d 0%, #14532d 9%, #166534 9%, #166534 18%)',
        }}
      >
        {/* SVG pitch markings */}
        <svg
          viewBox="0 0 100 62"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <rect x="2" y="2" width="96" height="58" className="pitch-line" />
          <line x1="50" y1="2" x2="50" y2="60" className="pitch-line" />
          <circle cx="50" cy="31" r="9.15" className="pitch-line" />
          <circle cx="50" cy="31" r="0.5" fill="rgba(255,255,255,0.6)" />
          <rect x="2" y="14" width="16.5" height="34" className="pitch-line" />
          <rect x="2" y="22" width="5.5" height="18" className="pitch-line" />
          <rect x="81.5" y="14" width="16.5" height="34" className="pitch-line" />
          <rect x="92.5" y="22" width="5.5" height="18" className="pitch-line" />
          <circle cx="12" cy="31" r="0.5" fill="rgba(255,255,255,0.6)" />
          <circle cx="88" cy="31" r="0.5" fill="rgba(255,255,255,0.6)" />
          <rect x="0" y="26" width="2" height="10" className="pitch-line" />
          <rect x="98" y="26" width="2" height="10" className="pitch-line" />
        </svg>

        {/* Team labels */}
        <div className="absolute top-2 left-3 text-white/75 text-[11px] font-semibold">{homeTeam}</div>
        <div className="absolute top-2 right-3 text-white/75 text-[11px] font-semibold">{awayTeam}</div>

        {/* Attacking direction arrows */}
        <div className="absolute bottom-2 left-4 text-white/40 text-[10px]">← attacking</div>
        <div className="absolute bottom-2 right-4 text-white/40 text-[10px]">attacking →</div>
      </div>

      {/* Player dots */}
      {homePlayers.map(p => (
        <PlayerDot
          key={p.id}
          player={p}
          onClick={() => onPlayerClick(p)}
          isSelected={p.id === selectedPlayerId}
        />
      ))}
      {awayPlayers.map(p => (
        <PlayerDot
          key={p.id}
          player={p}
          onClick={() => onPlayerClick(p)}
          isSelected={p.id === selectedPlayerId}
        />
      ))}

      {/* Legend */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {Object.entries(POS_COLORS).map(([pos, color]) => (
          <div key={pos} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/60 text-[10px]">{pos}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

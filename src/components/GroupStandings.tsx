import type { Group } from '../lib/groups';
import Flag from './Flag';

/**
 * A single group's standings table. The top 2 rows (auto-qualifiers) get a
 * green accent; 3rd place (potential best-third qualifier) gets amber.
 */
export default function GroupStandings({ group }: { group: Group }) {
  return (
    <div className="rounded-xl bg-gray-800/50 border border-gray-700 overflow-hidden">
      <div className="px-3 py-2 bg-gradient-to-r from-violet-700/40 to-fuchsia-700/30 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Group {group.label}</h3>
        <span className="text-[10px] uppercase tracking-wide text-white/50">Projected</span>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500 border-b border-gray-700/60">
            <th className="text-left font-medium px-3 py-1.5 w-6">#</th>
            <th className="text-left font-medium py-1.5">Team</th>
            <th className="text-center font-medium px-1 w-6" title="Played">P</th>
            <th className="text-center font-medium px-1 w-6" title="Won">W</th>
            <th className="text-center font-medium px-1 w-6" title="Drawn">D</th>
            <th className="text-center font-medium px-1 w-6" title="Lost">L</th>
            <th className="text-center font-medium px-1 w-8" title="Goal difference">GD</th>
            <th className="text-center font-bold px-2 w-8" title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map(s => {
            const accent =
              s.rank <= 2 ? 'border-l-2 border-l-emerald-500' :
              s.rank === 3 ? 'border-l-2 border-l-amber-500' :
              'border-l-2 border-l-transparent';
            return (
              <tr key={s.team} className={`${accent} border-b border-gray-800 last:border-0 hover:bg-white/5`}>
                <td className="px-3 py-1.5 text-gray-500">{s.rank}</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-2">
                    <Flag code={s.flagCode} name={s.team} size={20} className="w-4 h-3 flex-shrink-0" />
                    <span className="text-gray-200 truncate max-w-[110px]">{s.team}</span>
                  </div>
                </td>
                <td className="text-center text-gray-400">{s.played}</td>
                <td className="text-center text-gray-400">{s.win}</td>
                <td className="text-center text-gray-400">{s.draw}</td>
                <td className="text-center text-gray-400">{s.loss}</td>
                <td className={`text-center font-mono ${s.gd > 0 ? 'text-emerald-400' : s.gd < 0 ? 'text-rose-400' : 'text-gray-400'}`}>
                  {s.gd > 0 ? '+' : ''}{s.gd}
                </td>
                <td className="text-center font-bold text-white">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

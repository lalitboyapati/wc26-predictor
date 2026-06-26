import type { Group } from '../lib/groups';
import Flag from './Flag';

/** A single group's standings table. Top 2 = sky accent, 3rd = gold. */
export default function GroupStandings({ group }: { group: Group }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.014] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <h3 className="text-sm font-bold text-white">Group {group.label}</h3>
        <span className="text-[11px] text-gray-400">Projected</span>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-[13px] tabular-nums">
        <thead>
          <tr className="text-gray-400 text-[11px]">
            <th className="text-left font-medium px-4 pt-2.5 pb-1 w-5">#</th>
            <th className="text-left font-medium pt-2.5 pb-1">Team</th>
            <th className="text-center font-medium px-1 w-6">P</th>
            <th className="text-center font-medium px-1 w-6">W</th>
            <th className="text-center font-medium px-1 w-6">D</th>
            <th className="text-center font-medium px-1 w-6">L</th>
            <th className="text-center font-medium px-1 w-8">GD</th>
            <th className="text-center font-medium px-3 w-9">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map(s => {
            const dot =
              s.rank <= 2 ? 'bg-sky-400' :
              s.rank === 3 ? 'bg-gold' : 'bg-transparent';
            return (
              <tr key={s.team} className="border-t border-white/[0.04] hover:bg-white/[0.03]">
                <td className="px-4 py-2 text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className={`w-1 h-3.5 rounded-full ${dot}`} />
                    {s.rank}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <Flag code={s.flagCode} name={s.team} size={20} className="w-4 h-3 rounded-sm flex-shrink-0" />
                    <span className="text-gray-200 truncate max-w-[120px]">{s.team}</span>
                  </div>
                </td>
                <td className="text-center text-gray-400">{s.played}</td>
                <td className="text-center text-gray-300">{s.win}</td>
                <td className="text-center text-gray-300">{s.draw}</td>
                <td className="text-center text-gray-300">{s.loss}</td>
                <td className={`text-center ${s.gd > 0 ? 'text-sky-300' : s.gd < 0 ? 'text-rose-300' : 'text-gray-400'}`}>
                  {s.gd > 0 ? '+' : ''}{s.gd}
                </td>
                <td className="text-center font-bold text-white">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

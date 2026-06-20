import type { Group } from '../lib/groups';
import Flag from './Flag';

/** A single group's standings table. Top 2 = green accent, 3rd = amber. */
export default function GroupStandings({ group }: { group: Group }) {
  return (
    <div className="border border-white/10 bg-white/[0.015]">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-[12px] tracking-[0.2em] text-accent">GROUP {group.label}</h3>
        <span className="text-[9px] tracking-wider text-gray-600">PROJECTED</span>
      </div>

      <table className="w-full text-[11px] tabular-nums">
        <thead>
          <tr className="text-gray-600 border-b border-white/5 tracking-wider">
            <th className="text-left font-normal px-3 py-1.5 w-5">#</th>
            <th className="text-left font-normal py-1.5">TEAM</th>
            <th className="text-center font-normal px-1 w-5">P</th>
            <th className="text-center font-normal px-1 w-5">W</th>
            <th className="text-center font-normal px-1 w-5">D</th>
            <th className="text-center font-normal px-1 w-5">L</th>
            <th className="text-center font-normal px-1 w-7">GD</th>
            <th className="text-center font-normal px-2 w-7">PTS</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map(s => {
            const accent =
              s.rank <= 2 ? 'border-l-2 border-l-accent' :
              s.rank === 3 ? 'border-l-2 border-l-amber-500' :
              'border-l-2 border-l-transparent';
            return (
              <tr key={s.team} className={`${accent} border-b border-white/5 last:border-0 hover:bg-white/[0.03]`}>
                <td className="px-3 py-1.5 text-gray-600">{s.rank}</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-2">
                    <Flag code={s.flagCode} name={s.team} size={20} className="w-4 h-[11px] flex-shrink-0" />
                    <span className="text-gray-300 truncate max-w-[120px]">{s.team}</span>
                  </div>
                </td>
                <td className="text-center text-gray-500">{s.played}</td>
                <td className="text-center text-gray-400">{s.win}</td>
                <td className="text-center text-gray-400">{s.draw}</td>
                <td className="text-center text-gray-400">{s.loss}</td>
                <td className={`text-center ${s.gd > 0 ? 'text-accent' : s.gd < 0 ? 'text-rose-400' : 'text-gray-500'}`}>
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

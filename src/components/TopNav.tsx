import { Link, useLocation } from 'react-router-dom';

export default function TopNav() {
  const { pathname } = useLocation();
  const onBracket = pathname.startsWith('/bracket');
  const onGroups = pathname.startsWith('/groups');
  const onSchedule = !onBracket && !onGroups;

  return (
    <header className="border-b border-white/10 bg-gradient-to-r from-violet-700 via-fuchsia-700 to-rose-600 sticky top-0 z-30 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">⚽</span>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">
              WORLD CUP <span className="text-yellow-300">2026</span>
            </h1>
            <p className="text-[10px] text-white/70 leading-none mt-0.5">Predictor &amp; Analytics</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
              ${onSchedule ? 'bg-white/90 text-violet-900' : 'text-white/80 hover:text-white'}`}
          >
            📅 Schedule
          </Link>
          <Link
            to="/groups"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
              ${onGroups ? 'bg-white/90 text-violet-900' : 'text-white/80 hover:text-white'}`}
          >
            📊 Groups
          </Link>
          <Link
            to="/bracket"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
              ${onBracket ? 'bg-white/90 text-violet-900' : 'text-white/80 hover:text-white'}`}
          >
            🏆 Bracket
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Upcoming' },
  { to: '/schedule', label: 'All Fixtures' },
  { to: '/groups', label: 'Groups' },
  { to: '/bracket', label: 'Bracket' },
];

export default function TopNav() {
  const { pathname } = useLocation();
  const active = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gold text-ink-900 text-lg">
            ⚽
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight text-white">
              World Cup <span className="text-gold">’26</span>
            </div>
            <div className="text-[11px] text-gray-400 -mt-0.5">Match Predictor</div>
          </div>
        </Link>

        {/* Tabs */}
        <nav className="flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] p-1">
          {TABS.map(t => {
            const on = active(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                aria-current={on ? 'page' : undefined}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap
                  ${on ? 'bg-gold text-ink-900' : 'text-gray-400 hover:text-white'}`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

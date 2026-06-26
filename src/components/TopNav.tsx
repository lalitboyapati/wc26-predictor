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

  const tabCls = (on: boolean) =>
    `rounded-full font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-ink-900 ${
      on ? 'bg-gold text-ink-900' : 'text-gray-400 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-gold focus:text-ink-900 focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none"
      >
        Skip to content
      </a>

      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        {/* Brand + desktop nav */}
        <div className="flex items-center justify-between gap-4 h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gold text-ink-900 text-lg">
              ⚽
            </span>
            <div className="leading-tight">
              <div className="text-[15px] font-extrabold tracking-tight text-white">
                World Cup <span className="text-gold">'26</span>
              </div>
              <div className="hidden sm:block text-[11px] text-gray-400 -mt-0.5">Match Predictor</div>
            </div>
          </Link>

          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] p-1">
            {TABS.map(t => {
              const on = active(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  aria-current={on ? 'page' : undefined}
                  className={`px-3.5 py-1.5 text-[13px] ${tabCls(on)}`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile nav — separate scrollable row so tabs never collide with brand */}
        <div className="sm:hidden overflow-x-auto no-scrollbar pb-2.5">
          <nav aria-label="Main navigation" className="flex w-max gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] p-1 mx-auto">
            {TABS.map(t => {
              const on = active(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  aria-current={on ? 'page' : undefined}
                  className={`px-3 py-3 text-[12px] ${tabCls(on)}`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

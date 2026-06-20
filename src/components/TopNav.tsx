import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'SCHEDULE' },
  { to: '/groups', label: 'GROUPS' },
  { to: '/bracket', label: 'BRACKET' },
];

export default function TopNav() {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === '/' ? pathname === '/' || pathname.startsWith('/match') : pathname.startsWith(to));

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top row: brand + status */}
        <div className="flex items-center justify-between py-2.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid place-items-center w-7 h-7 border border-accent/40 text-accent text-sm font-bold">⚽</span>
            <span className="text-sm font-bold tracking-[0.2em] text-white">
              WC26 <span className="text-accent">// PREDICTOR</span>
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-[11px] tracking-wider text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-accent blink" />
            <span className="text-gray-400">FIFA WORLD CUP 2026</span>
            <span className="text-gray-700">·</span>
            <span>AI MODEL</span>
          </div>
        </div>

        {/* Tab row */}
        <nav className="flex items-center gap-6 -mb-px">
          {TABS.map(t => {
            const active = isActive(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative py-2.5 text-[12px] tracking-[0.15em] transition-colors
                  ${active ? 'text-accent' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t.label}
                {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

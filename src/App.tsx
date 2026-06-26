import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import UpcomingPage from './pages/UpcomingPage';
import SchedulePage from './pages/SchedulePage';

const MatchDetailPage = lazy(() => import('./pages/MatchDetailPage'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const BracketPage = lazy(() => import('./pages/BracketPage'));

function PageLoader() {
  return <div className="min-h-screen" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<UpcomingPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/match/:id" element={<MatchDetailPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/bracket" element={<BracketPage />} />
        </Routes>
      </Suspense>
      <Analytics />
    </BrowserRouter>
  );
}

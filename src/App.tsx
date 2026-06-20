import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UpcomingPage from './pages/UpcomingPage';
import SchedulePage from './pages/SchedulePage';
import MatchDetailPage from './pages/MatchDetailPage';
import GroupsPage from './pages/GroupsPage';
import BracketPage from './pages/BracketPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UpcomingPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/match/:id" element={<MatchDetailPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/bracket" element={<BracketPage />} />
      </Routes>
    </BrowserRouter>
  );
}

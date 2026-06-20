import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MatchListPage from './pages/MatchListPage';
import MatchDetailPage from './pages/MatchDetailPage';
import BracketPage from './pages/BracketPage';
import GroupsPage from './pages/GroupsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MatchListPage />} />
        <Route path="/match/:id" element={<MatchDetailPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/bracket" element={<BracketPage />} />
      </Routes>
    </BrowserRouter>
  );
}

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import CallbackHandler from './components/CallbackHandler';
import GameSetup from './pages/GameSetup';
import SongSelection from './pages/SongSelection';
import GuessPhase from './pages/GuessPhase';
import Scoreboard from './pages/Scoreboard';

const App: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<CallbackHandler />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-setup/:sessionId" element={<GameSetup />} />
          <Route path="/song-selection/:sessionId" element={<SongSelection />} />
          <Route path="/guess-phase/:sessionId" element={<GuessPhase />}/>
          <Route path="/scoreboard/:sessionId" element={<Scoreboard />}/>
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch all route */}
        </Routes>
      </Router>
  );
};

export default App;
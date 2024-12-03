import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import CallbackHandler from './components/CallbackHandler';
import { UserProfileProvider } from './context/UserProfileContext';
import { GameSessionProvider } from './context/GameSessionContext';
import GameSetup from './pages/GameSetup';
import GamePlay from './pages/GamePlay';

const App: React.FC = () => {
  return (
    <UserProfileProvider>
      <GameSessionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/callback" element={<CallbackHandler />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game-setup/:sessionId" element={<GameSetup />} />
            <Route path="/game-play/:sessionId" element={<GamePlay />} />
            <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch all route */}
          </Routes>
        </Router>
      </GameSessionProvider>
    </UserProfileProvider>
  );
};

export default App;
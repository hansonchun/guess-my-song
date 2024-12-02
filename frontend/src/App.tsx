import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import CallbackHandler from './components/CallbackHandler';
import { UserProfileProvider } from './context/UserProfileContext';
import GameSetup from './pages/GameSetup';

const App: React.FC = () => {
  return (
    <UserProfileProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<CallbackHandler />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-setup/:sessionId" element={<GameSetup/>}/>
          {/* Add any other routes that need protection with ProtectedRoute */}
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch all route */}
        </Routes>
      </Router>
    </UserProfileProvider>
  );
};

export default App;
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CallbackHandler from './components/CallbackHandler';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<CallbackHandler />} />
        <Route  path="/dashboard" element={<Dashboard />} />
        {/* Add any other routes that need protection with ProtectedRoute */}
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch all route */}
      </Routes>
    </Router>
  );
};

export default App;
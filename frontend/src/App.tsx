import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

// This component will be used to handle the callback logic
const CallbackHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      navigate('/');
    } else {
      const access_token = searchParams.get('access_token');
      const refresh_token = searchParams.get('refresh_token');
      // Here you might want to dispatch these tokens to a state management solution or store them securely
      console.log('Logged in:', access_token, refresh_token);
      navigate('/dashboard');
    }
  }, [location, navigate]);

  return <div>Processing login...</div>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<CallbackHandler />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add any other routes */}
      </Routes>
    </Router>
  );
};

export default App;
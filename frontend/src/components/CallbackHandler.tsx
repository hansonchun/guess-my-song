import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CallbackHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');

    if (code) {
      console.log('Received code:', code);

      // Redirect to your own backend's tokens endpoint
      const tokensUrl = `http://localhost:5000/auth/tokens?code=${code}`;
      window.location.href = tokensUrl;
    } else {
      console.error('Code missing from Spotify callback.');
      navigate('/'); // Redirect to home or error page if code is missing
    }

  }, [location, navigate]);

  return <div>Processing login...</div>;
};

export default CallbackHandler;
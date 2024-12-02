import React from 'react';

const Login: React.FC = () => {
  const handleLogin = () => {
    const searchParams = new URLSearchParams(window.location.search);
    
    const loginUrl = `http://localhost:5000/auth/login`;
    window.location.href = loginUrl;
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
};

export default Login;
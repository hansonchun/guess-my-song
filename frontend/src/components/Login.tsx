import { Button } from '@fluentui/react-components';
import React from 'react';

const Login: React.FC = () => {
  const handleLogin = () => {
    const loginUrl = `http://localhost:5000/auth/login`;
    window.location.href = loginUrl;
  };

  return (
    <div>
      <Button onClick={handleLogin}>Login with Spotify</Button>
    </div>
  );
};

export default Login;
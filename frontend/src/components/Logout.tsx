import { Button } from '@fluentui/react-components';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage or wherever you've stored the tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // If you're using cookies or sessions, clear them here
    
    navigate('/');  // This will redirect to the login page
  };

  return <Button onClick={handleLogout}>Logout</Button>;
};

export default Logout;
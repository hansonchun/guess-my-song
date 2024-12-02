const fetch = require('node-fetch');

const userController = {
    getUserProfile: async (req, res) => {
      try {
        const accessToken = req.cookies.accessToken;
  
        if (!accessToken) {
          return res.status(401).json({ error: 'No access token found' });
        }
  
        const response = await fetch('https://api.spotify.com/v1/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
  
        if (response.status !== 200) {
          return res.status(response.status).json({ error: data.error ? data.error.message : 'Unknown error' });
        }
  
        res.json(data);
  
      } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to retrieve user profile' });
      }
    }
  };
  
  module.exports = userController;
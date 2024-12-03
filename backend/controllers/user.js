const fetch = require('node-fetch');
const { admin, db } = require('../firebase');

const userController = {
  getCurrentUserProfile: async (req, res) => {
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
      console.error('Error fetching current user profile:', error);
      res.status(500).json({ error: 'Failed to retrieve current user profile' });
    }
  },
  getUserProfile: async (req, res) => {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        return res.status(401).json({ error: 'No access token found' });
      }

      const userId = req.params.userId;

      const response = await fetch(`https://api.spotify.com/v1/users/${userId}`, {
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
  },
  fetchUserGames: async (req, res) => {
    const userId = req.params.userId;

    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists || !userDoc.data().gameSessions || userDoc.data().gameSessions.length === 0) {
        // User doesn't exist or has no games, return empty response
        return res.status(200).json([]);
      }

      const gameSessionsIds = userDoc.data().gameSessions;

      // Fetch game sessions only if there are IDs to fetch
      if (gameSessionsIds.length > 0) {
        const gameSessionsRefs = gameSessionsIds.map(id => db.collection('gameSessions').doc(id));
        const gameSessions = await admin.firestore().getAll(...gameSessionsRefs);

        const userGames = gameSessions.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(userGames);
      } else {
        // If gameSessionsIds is empty but the document exists, still return an empty array
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching user games:', error);
      res.status(500).json({ error: 'Failed to fetch users games' });
    }
  },
};

module.exports = userController;
const fetch = require('node-fetch');
const gameSessionController = require('./gameSession');

const playlistController = {
    createPlaylist: async (req, res) => {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }

        try {
            const { name, description = '', userId, public = false, collaborative = false } = req.body;

            const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: `${name} (${generateRandomSuffix()})`,
                    description,
                    public,
                    collaborative
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const playlistData = await response.json();
            const session = await gameSessionController.createGameSession(userId, playlistData.id);
            res.json({
                message: 'Playlist created',
                playlist: playlistData,
                sessionId: session.gameSessionId,
                inviteLink: session.inviteLink
            });

        } catch (error) {
            console.error('Error creating playlist:', error);
            res.status(500).json({ error: 'Failed to create playlist' });
        }
    },

    addTracksToPlaylist: async (req, res) => {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }

        try {
            const { playlistId, trackUris } = req.body;

            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uris: trackUris })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result = await response.json();
            res.json({ message: 'Tracks added to playlist', result });

        } catch (error) {
            console.error('Error adding tracks to playlist:', error);
            res.status(500).json({ error: 'Failed to add tracks to playlist' });
        }
    }
};

const generateRandomSuffix = () => Math.random().toString(36).substr(2, 5);

module.exports = playlistController;
const fetch = require('node-fetch');
const { db, admin } = require('../firebase');

const playlistController = {
    createPlaylist: async (req, res) => {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }

        try {
            const { name, description = '', hostId, public = false, collaborative = false } = req.body;
            const playlistName = `${name} (${generateRandomSuffix()})`;

            const response = await fetch(`https://api.spotify.com/v1/users/${hostId}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    description,
                    public,
                    collaborative
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const playlistData = await response.json();
            res.json({
                message: 'Playlist created',
                playlist: playlistData
            });

        } catch (error) {
            console.error('Error creating playlist:', error);
            res.status(500).json({ error: 'Failed to create playlist' });
        }
    },
    addSongToPlaylist: async (req, res) => {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }
    
        const { trackId, userId, sessionId } = req.body;
        const playlistId = req.params.playlistId;

        try {
            const gameSessionRef = db.collection('gameSessions').doc(sessionId);
            const gameSessionDoc = await gameSessionRef.get();
    
            if (!gameSessionDoc.exists) {
                return res.status(404).json({ error: 'Game session not found' });
            }
    
            const gameSessionData = gameSessionDoc.data();

            // Check if this user has already added a song
            if (gameSessionData.users[userId] && gameSessionData.users[userId].addedSongUri) {
                return res.status(400).json({ error: 'You have already added a song to this game session' });
            }
    
            // Add song to Spotify playlist
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${trackId}`] // Format the trackId as a Spotify URI
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                return res.status(response.status).json({ error: errorText });
            }
    
            // Update Firestore with the song URI for the user and add to addedSongs array
            const updateData = {
                [`users.${userId}.addedTrackId`]: trackId,
                addedSongs: admin.firestore.FieldValue.arrayUnion(trackId)
            };
    
            await gameSessionRef.update(updateData);
    
            res.json({ message: 'Song added to playlist successfully', status: gameSessionData.status });
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            res.status(500).json({ error: 'Failed to add song to playlist' });
        }
    }
};

const generateRandomSuffix = () => Math.random().toString(36).substr(2, 5);

module.exports = playlistController;
const fetch = require('node-fetch');

const searchController = {
    searchSongs: async (req, res) => {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }

        const { query } = req.query;

        try {
            // Base URL for Spotify API search endpoint
            const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            res.json(data.tracks.items); // Assuming you want to return tracks
        } catch (error) {
            console.error('Error searching songs:', error);
            res.status(500).json({ error: 'Failed to search for songs' });
        }
    }
};

module.exports = searchController;
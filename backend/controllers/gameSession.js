const { admin, db } = require('../firebase');

const gameSessionController = {
    createGameSession: async (hostId, playlistId) => {
        try {
            const gameSessionRef = await db.collection('gameSessions').add({
                hostId: hostId,
                playlistId: playlistId,
                status: 'waiting',
                players: {
                    [hostId]: { joinedAt: admin.firestore.FieldValue.serverTimestamp() }
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                inviteLink: ''
            })

            const gameSessionId = gameSessionRef.id;
            const inviteLink = `${process.env.FRONTEND_URL}/join-game/${gameSessionId}`;

            await gameSessionRef.update({ inviteLink: inviteLink });

            // Check if the host exists in the players collection, if not, create them
            const hostRef = db.collection('players').doc(hostId);
            const hostDoc = await hostRef.get();

            if (!hostDoc.exists) {
                await hostRef.set({
                    gameSessions: [gameSessionId]
                });
            } else {
                console.log('creating players table with host');
                // If the host already exists, add the game session to their list
                await hostRef.update({
                    gameSessions: admin.firestore.FieldValue.arrayUnion(gameSessionId)
                });
            }

            return { gameSessionId, inviteLink };
        }
        catch (error) {
            console.error('Error creating game session:', error);
            throw error;
        }

    },
    joinGameSession: async (req, res) => {
        const { gameSessionId } = req.params;
        const { userId } = req.query;

        try {
            const gameSessionRef = db.collection('gameSessions').doc(gameSessionId);
            const playerRef = db.collection('players').doc(userId);

            // Check if both game session and player exist
            const [gameSessionSnap, playerSnap] = await Promise.all([
                gameSessionRef.get(),
                playerRef.get()
            ]);

            if (!gameSessionSnap.exists) {
                return res.status(404).json({ error: 'Game session not found' });
            }

            if (!playerSnap.exists) {
                // Optionally create a player document if it doesn't exist
                await playerRef.set({ gameSessions: [] });
            }

            // Check game status
            if (gameSessionSnap.data().status !== 'waiting') {
                return res.status(400).json({ error: 'Game has already started or is not joinable' });
            }

            // Add player to game session
            await gameSessionRef.update({
                players: {
                    [userId]: {
                        joinedAt: admin.firestore.FieldValue.serverTimestamp()
                    }
                }
            }, { merge: true });

            // Add game session to player's list of sessions
            await playerRef.update({
                gameSessions: admin.firestore.FieldValue.arrayUnion(gameSessionId)
            });

            res.json({ message: 'Successfully joined the game', sessionId: gameSessionSnap.id });
        } catch (error) {
            console.error('Error joining game:', error);
            res.status(500).json({ error: 'Failed to join game' });
        }
    },
    fetchPlayerGames: async (req, res) => {
        const playerId = req.params.playerId;

        try {
            const playerRef = db.collection('players').doc(playerId);
            const playerDoc = await playerRef.get();
    
            if (!playerDoc.exists) {
                // Instead of returning an error, create the player document
                await playerRef.set({
                    gameSessions: []
                });
                return res.status(200).json([]); // Return an empty array if no games exist yet
            }
    
            const gameSessionsIds = playerDoc.data().gameSessions || [];
    
            // Fetch detailed information about each game session
            const gameSessionsRefs = gameSessionsIds.map(id => db.collection('gameSessions').doc(id));
            const gameSessions = await admin.firestore().getAll(...gameSessionsRefs);
    
            const playerGames = gameSessions.map(doc => ({ id: doc.id, ...doc.data() }));
    
            res.json(playerGames); // This will be an array of game sessions or an empty array
        } catch (error) {
            console.error('Error fetching player games:', error);
            res.status(500).json({ error: 'Failed to fetch player games' });
        }
    },
    fetchGameSession: async (req, res) => {
        try {
            const gameSessionId = req.params.sessionId;

            if (!gameSessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }

            // Fetch the game session document
            const gameSessionRef = db.collection('gameSessions').doc(gameSessionId);
            const gameSessionDoc = await gameSessionRef.get();

            if (!gameSessionDoc.exists) {
                return res.status(404).json({ error: 'Game session not found' });
            }

            // Prepare the data to send back, excluding any server-side timestamp objects
            const gameSessionData = gameSessionDoc.data();
            const formattedData = {
                ...gameSessionData,
                // Convert Firestore Timestamp to a more readable format if necessary
                createdAt: gameSessionData.createdAt.toDate().toISOString()
            };

            res.json(formattedData);

        } catch (error) {
            console.error('Error fetching game session:', error);
            res.status(500).json({ error: 'Failed to fetch game session' });
        }
    },
    // Add other session-related methods here, like joinSession, getSessionInfo, etc.
};

module.exports = gameSessionController;
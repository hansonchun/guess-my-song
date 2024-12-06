const { admin, db } = require('../firebase');

const gameSessionController = {
    createGameSession: async (req, res) => {
        try {
            const { hostId, hostName, playlistId, playlistName } = req.body;

            const gameSessionRef = await db.collection('gameSessions').add({
                hostId: hostId,
                playlistName: playlistName,
                playlistId: playlistId,
                status: 'waiting',
                users: {
                    [hostId]: {
                        displayName: hostName,
                        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
                        score: 0,
                        addedTrackId: '',
                        isGuessed: false
                    }
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                inviteLink: '',
                addedSongs: [],
                currentSongToGuess: ''
            })

            const gameSessionId = gameSessionRef.id;
            const inviteLink = `${process.env.FRONTEND_URL}/join-game/${gameSessionId}`;

            await gameSessionRef.update({ inviteLink: inviteLink });

            // Check if the host exists in the users collection, if not, create them
            const hostRef = db.collection('users').doc(hostId);
            const hostDoc = await hostRef.get();

            if (!hostDoc.exists) {
                await hostRef.set({
                    gameSessions: [gameSessionId]
                });
            } else {
                // If the host already exists, add the game session to their list
                await hostRef.update({
                    gameSessions: admin.firestore.FieldValue.arrayUnion(gameSessionId)
                });
            }

            res.json({ gameSessionId, inviteLink });
        }
        catch (error) {
            console.error('Error creating game session:', error);
            throw error;
        }
    },
    joinGameSession: async (req, res) => {
        const { sessionId } = req.params;
        const { userId } = req.body; // Assume userId is sent from the client after authentication

        try {
            const gameSessionRef = db.collection('gameSessions').doc(sessionId);
            const gameSessionDoc = await gameSessionRef.get();

            if (!gameSessionDoc.exists) {
                return res.status(404).json({ error: 'Game session not found' });
            }

            const gameSession = gameSessionDoc.data();

            // Check if the game is in a joinable state (e.g., not started or completed)
            if (gameSession.status !== 'waiting') {
                return res.status(400).json({ error: 'This game has already started or ended' });
            }

            // Add or update the user in the game session
            await gameSessionRef.update({
                ['users.' + userId]: {
                    id: userId,
                    score: 0,
                    isGuessed: false,
                    addedTrackId: null // Assuming this is set when they choose a song
                }
            }, { merge: true });

            res.status(200).json({ message: 'Joined game session successfully' });
        } catch (error) {
            console.error('Error joining game session:', error);
            res.status(500).json({ error: 'Failed to join game session' });
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
    startGameSession: async(req, res) => {
        const { sessionId } = req.params

        try {
            const gameSessionRef = db.collection('gameSessions').doc(sessionId);
            const gameSessionDoc = await gameSessionRef.get();

            if (!gameSessionDoc.exists) {
                return res.status(404).json({ error: 'Game session not found' });
            }

            const gameSessionData = gameSessionDoc.data();

            // Check if the game can be started
            if (gameSessionData.status !== 'waiting') {
                return res.status(400).json({ error: 'Game is not in waiting status' });
            }

            // Update the game session status to 'started'
            await gameSessionRef.update({
                status: 'started',
                startedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            res.json({ message: 'Game session started', status: 'started' });
        } catch (error) {
            console.error('Error starting game session:', error);
            res.status(500).json({ error: 'Failed to start game session' });
        }
    }
};

module.exports = gameSessionController;
const { admin, db } = require('../firebase');

const gameSessionController = {
    createGameSession: async (hostId, hostName, playlistId, playlistName) => {
        try {
            const gameSessionRef = await db.collection('gameSessions').add({
                hostId: hostId,
                playlistName: playlistName,
                playlistId: playlistId,
                status: 'waiting',
                users: {
                    [hostId]: { 
                        displayName: hostName, 
                        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
                        score: 0
                    }
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                inviteLink: ''
            })

            const gameSessionId = gameSessionRef.id;
            const inviteLink = `join-game/${gameSessionId}`;

            await gameSessionRef.update({ inviteLink: inviteLink });

            // Check if the host exists in the users collection, if not, create them
            const hostRef = db.collection('users').doc(hostId);
            const hostDoc = await hostRef.get();

            if (!hostDoc.exists) {
                await hostRef.set({
                    gameSessions: [gameSessionId]
                });
            } else {
                console.log('creating users table with host');
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
            const userRef = db.collection('users').doc(userId);

            // Check if both game session and user exist
            const [gameSessionSnap, userSnap] = await Promise.all([
                gameSessionRef.get(),
                userRef.get()
            ]);

            if (!gameSessionSnap.exists) {
                return res.status(404).json({ error: 'Game session not found' });
            }

            if (!userSnap.exists) {
                // Optionally create a user document if it doesn't exist
                await userRef.set({ gameSessions: [] });
            }

            // Check game status
            if (gameSessionSnap.data().status !== 'waiting') {
                return res.status(400).json({ error: 'Game has already started or is not joinable' });
            }

            // Add user to game session
            await gameSessionRef.update({
                users: {
                    [userId]: {
                        joinedAt: admin.firestore.FieldValue.serverTimestamp()
                    }
                }
            }, { merge: true });

            // Add game session to user's list of sessions
            await userRef.update({
                gameSessions: admin.firestore.FieldValue.arrayUnion(gameSessionId)
            });

            res.json({ message: 'Successfully joined the game', sessionId: gameSessionSnap.id });
        } catch (error) {
            console.error('Error joining game:', error);
            res.status(500).json({ error: 'Failed to join game' });
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
};

module.exports = gameSessionController;
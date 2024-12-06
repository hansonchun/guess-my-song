const { admin, db } = require('../firebase');

const gameController = {
    makeGuess: async (req, res) => {
        const { sessionId } = req.params;
        const { userId, guessSongId } = req.body;
    
        try {
            const gameSessionRef = db.collection('gameSessions').doc(sessionId);
            const gameSessionDoc = await gameSessionRef.get();
    
            if (!gameSessionDoc.exists) {
                return res.status(404).json({ error: 'Game session not found' });
            }
    
            const gameSessionData = gameSessionDoc.data();
            const isGuessCorrect = guessSongId === gameSessionData.currentSongToGuess;
    
            // Get the current user data to merge with the new data
            const currentUser = gameSessionData.users[userId] || {};

            // Update user's information in the game session, merging with existing data
            await gameSessionRef.update({
                ['users.' + userId]: {
                    ...currentUser,
                    isGuessed: true,
                    score: admin.firestore.FieldValue.increment(isGuessCorrect ? 1 : 0),
                }
            });
    
            // Respond with success status and guess result
            res.status(200).json({ 
                message: 'Guess recorded', 
                guessedCorrectly: isGuessCorrect
            });
        }
        catch (error) {
            console.error('Error making guess:', error);
            res.status(500).json({ error: 'Failed to make guess' });
        }
    }
}

module.exports = gameController;
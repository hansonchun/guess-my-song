const WebSocket = require('ws');
const { db } = require('./firebase');

module.exports = {
    setupWebSocket: () => {
        const wss = new WebSocket.Server({ port: 8080 });

        wss.on('connection', (ws, req) => {
            console.log('Client connected');
            
            ws.on('error', console.error);

            ws.on('message', function message(data, isBinary) {
                try {
                    const message = isBinary ? data : JSON.parse(data);
                    if (message.type === 'LISTEN_FOR_GAME') {
                        const { gameSessionId } = message.data;
                        const gameSessionRef = db.collection('gameSessions').doc(gameSessionId);

                        const unsubscribe = gameSessionRef.onSnapshot((doc) => {
                            if (doc.exists) {
                                const gameSession = doc.data();
                                const allPlayersAddedSong = Object.values(gameSession.users || {}).every(user => user.addedTrackId);

                                console.log(gameSession);
                                console.log(allPlayersAddedSong);

                                if (allPlayersAddedSong && gameSession.status === 'started') {
                                    gameSessionRef.update({
                                        status: 'guessing',
                                        currentSongToGuess: gameSession.addedSongs[Math.floor(Math.random() * gameSession.addedSongs.length)]
                                    }).then(() => {
                                        wss.clients.forEach(client => {
                                            if (client.readyState === WebSocket.OPEN) {
                                                client.send(JSON.stringify({
                                                    type: 'GUESSING_PHASE_STARTED',
                                                    data: gameSession
                                                }), { binary: false });
                                            }
                                        });
                                    }).catch(console.error);
                                } else {
                                    ws.send(JSON.stringify({
                                        type: 'SESSION_UPDATE',
                                        data: gameSession
                                    }), { binary: false });
                                }
                            }
                        }, (error) => {
                            console.error('Error listening to game session:', error);
                            ws.send(JSON.stringify({ type: 'ERROR', message: 'Failed to listen to game session' }));
                        });

                        ws.on('close', () => {
                            console.log('Client disconnected');
                            unsubscribe();
                        });
                    } else {
                        console.log('Received message:', data);
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format' }));
                }
            });

            // Handle WebSocket errors
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                ws.close();
            });
        });
    }
};
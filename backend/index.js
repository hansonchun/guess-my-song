const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { setupWebSocket } = require('./websocket');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

const authController = require('./controllers/auth');
const userController = require('./controllers/user');
const playlistController = require('./controllers/playlist');
const gameSessionController = require('./controllers/gameSession');
const searchController = require('./controllers/search');
const gameController = require('./controllers/game');

// auth routes
app.get('/auth/login', authController.login);
app.get('/auth/tokens', authController.tokens);

// user routes
app.get('/api/users/current-user-profile', userController.getCurrentUserProfile);
app.get('/api/users/user-profile/:userId', userController.getUserProfile);
app.get('/api/users/:userId/games', userController.fetchUserGames);

// playlist routes
app.post('/api/playlists/create', playlistController.createPlaylist);
app.post('/api/playlists/:playlistId/add', playlistController.addSongToPlaylist);

// gameSession routes
app.get('/api/game-sessions/:sessionId', gameSessionController.fetchGameSession);
app.post('/api/game-sessions/create', gameSessionController.createGameSession);
app.post('/api/game-sessions/:sessionId/join', gameSessionController.joinGameSession);
app.post('/api/game-sessions/:sessionId/start', gameSessionController.startGameSession);

// game routes
app.post('/api/game/:sessionId/guess', gameController.makeGuess);

// search routes
app.get('/api/search', searchController.searchSongs);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`); 
    console.log("Setting up WebSocket server...");
    setupWebSocket();
});

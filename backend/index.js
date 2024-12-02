const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authController = require('./controllers/auth');
const userController = require('./controllers/user');
const playlistController = require('./controllers/playlist');
const gameSessionController = require('./controllers/gameSession');

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// auth routes
app.get('/auth/login', authController.login);
app.get('/auth/tokens', authController.tokens);

// user routes
app.get('/api/user-profile', userController.getUserProfile);

// playlist routes
app.post('/api/playlists/create', playlistController.createPlaylist);
app.post('/api/playlists/:playlistId/tracks', playlistController.addTracksToPlaylist)

// gameSession routes
app.get('/api/game-sessions/:sessionId', gameSessionController.fetchGameSession);
app.post('/api/game-sessions/:gameSessionId/join', gameSessionController.joinGameSession);

// player routes
app.get('/api/players/:playerId/games', gameSessionController.fetchPlayerGames);

app.listen(5000, () => console.log('Listening on 5000'));
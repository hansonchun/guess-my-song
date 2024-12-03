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
app.get('/api/users/current-user-profile', userController.getCurrentUserProfile);
app.get('/api/users/user-profile/:userId', userController.getUserProfile);
app.get('/api/users/:userId/games', userController.fetchUserGames);

// playlist routes
app.post('/api/playlists/create', playlistController.createPlaylist);
app.post('/api/playlists/:playlistId/tracks', playlistController.addTracksToPlaylist)

// gameSession routes
app.post('/api/game-sessions/create', gameSessionController.createGameSession);
app.post('/api/game-sessions/:gameSessionId/join', gameSessionController.joinGameSession);
app.get('/api/game-sessions/:sessionId', gameSessionController.fetchGameSession);

app.listen(5000, () => console.log('Listening on 5000'));
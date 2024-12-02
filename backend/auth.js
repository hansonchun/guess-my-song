const dotenv = require('dotenv');
const fetch = require('node-fetch');
const querystring = require('querystring');

dotenv.config();

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const authController = {
  login: (req, res) => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
  
    res.cookie('spotify_auth_state', state);
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state
      }));
  },

  callback: async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie('spotify_auth_state');

      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: querystring.stringify({
            code: code,
            redirect_uri: process.env.REDIRECT_URI,
            grant_type: 'authorization_code'
          })
        });

        if (response.ok) {
          const data = await response.json();
          res.redirect(`/?access_token=${data.access_token}&refresh_token=${data.refresh_token}`);
        } else {
          console.error('Error exchanging code for token:', response.statusText);
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      } catch (error) {
        console.error('Error:', error);
        res.redirect('/#' +
          querystring.stringify({
            error: 'server_error'
          }));
      }
    }
  }
};

module.exports = authController;
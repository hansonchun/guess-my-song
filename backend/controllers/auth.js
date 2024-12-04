const fetch = require('node-fetch');
const querystring = require('querystring');

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
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state
      }));
  },
  tokens: async (req, res) => {
    const { code } = req.query;

    try {
      // Exchange the code for an access token and a refresh token
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: querystring.stringify({
          code: code,
          redirect_uri: process.env.REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      const responseData = await response.json();

      if (responseData.error) {
        res.redirect('/#' +
          querystring.stringify({
            error: responseData.error.message
          }));
      } else {
        // Here you would typically save the tokens. 
        // In production, you might want to use a database for this.
        // For now, we'll just send them back in the response.
        res.cookie('accessToken', responseData.access_token, { httpOnly: true });
        res.cookie('refreshToken', responseData.refresh_token, { httpOnly: true });

        res.redirect(process.env.FRONTEND_URL + '/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    }
  }
};

module.exports = authController;
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authController = require('./auth');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/auth/login', authController.login);
app.get('/auth/tokens', authController.tokens);

app.listen(5000, () => console.log('Listening on 5000'));
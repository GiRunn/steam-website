
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameDetailRoutes = require('./modules/game/routes/gameDetailRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/games', gameDetailRoutes);

module.exports = app;
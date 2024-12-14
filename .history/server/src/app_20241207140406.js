const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', gameRoutes);

module.exports = app;
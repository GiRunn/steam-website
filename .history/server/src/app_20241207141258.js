const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// 添加一个测试路由
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.use('/api/v1', gameRoutes);

module.exports = app;
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  process.exit(0);
});
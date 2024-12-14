// src/config/config.js - 配置文件
const config = {
    development: {
      port: process.env.PORT || 3000,
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'steam_website'
      },
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      corsOptions: {
        origin: 'http://localhost', // 前端开发服务器地址
        credentials: true
      }
    },
    production: {
      // 生产环境配置，后续根据需要添加
    }
  };
  
  const env = process.env.NODE_ENV || 'development';
  module.exports = config[env];
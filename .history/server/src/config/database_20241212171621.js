// server/src/config/database.js
const { Pool } = require('pg');

const poolConfig = {
  // 连接池配置
  max: 100,                        // 最大连接数
  min: 20,                         // 最小保持连接数
  idleTimeoutMillis: 5000,         // 连接超时时间
  connectionTimeoutMillis: 2000,   // 连接获取超时
  maxUses: 5000,                   // 每个连接的最大使用次数
  
  // 数据库连接配置
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // SSL配置
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
};

// 创建连接池实例
const pool = new Pool(poolConfig);

// 连接错误处理
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// 连接池监控
pool.on('connect', (client) => {
  console.info('New client connected', { 
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  });
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params)
};
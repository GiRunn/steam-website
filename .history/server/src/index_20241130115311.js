// src/index.js - 后端服务器入口文件
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 基础中间件配置
app.use(express.json());  // 用于解析 JSON 请求体
app.use(express.urlencoded({ extended: true }));  // 用于解析 URL-encoded 请求体
app.use(cors());  // 启用 CORS，允许前端访问

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
// src/index.js - 整合后的后端服务器入口文件
const express = require('express');
const cors = require('cors');
const path = require('path');
const GameController = require('./controllers/game.controller');

const app = express();

// 基础中间件配置
app.use(express.json());  // 用于解析 JSON 请求体
app.use(express.urlencoded({ extended: true }));  // 用于解析 URL-encoded 请求体
app.use(cors());  // 启用 CORS，允许前端访问

// 基础路由测试
app.get('/', (req, res) => {
  res.json({ message: '欢迎访问Steam网站后端服务' });
});

// 测试API路由
app.get('/api/test', (req, res) => {
  res.json({ 
    状态: '成功',
    数据: {
      信息: 'API测试成功',
      时间: new Date().toLocaleString()
    }
  });
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    状态: '正常',
    信息: '服务器运行正常',
    时间: new Date().toLocaleString()
  });
});

// 游戏相关路由
// 获取游戏列表
app.get('/api/games', GameController.getGames);
// 搜索游戏
app.get('/api/games/search', GameController.searchGames);
// 按价格过滤游戏
app.get('/api/games/filter/price', GameController.filterByPrice);
// 获取游戏详情 (注意：这个路由要放在最后，避免与其他路由冲突)
app.get('/api/games/:gameId', GameController.getGameDetail);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err.stack);
  res.status(500).json({
    状态: '错误',
    信息: '服务器内部错误',
    详细信息: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    状态: '错误',
    信息: '未找到该接口'
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器启动成功！`);
  console.log(`运行端口: ${PORT}`);
  console.log(`测试地址: http://localhost:${PORT}/api/test`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`游戏列表: http://localhost:${PORT}/api/games`);
});
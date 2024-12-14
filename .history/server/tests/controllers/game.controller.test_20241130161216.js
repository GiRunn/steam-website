// tests/controllers/game.controller.test.js - 游戏控制器测试
const request = require('supertest');
const app = require('../../src/app');
const Game = require('../../src/models/game.model');
const mongoose = require('mongoose');

describe('Game Controller Tests', () => {
  // 测试数据
  const testGame = {
    _id: new mongoose.Types.ObjectId(),
    title: '测试游戏',
    description: '这是一个测试游戏',
    price: 99.99,
    category: '动作',
    tags: ['动作', '冒险'],
    viewCount: 0
  };

  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    // 清空测试数据
    await Game.deleteMany({});
    // 插入测试数据
    await Game.create(testGame);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 测试获取游戏列表
  describe('GET /api/games', () => {
    it('should return games list with pagination', async () => {
      const response = await request(app)
        .get('/api/games')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.pagination).toBeDefined();
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/games')
        .query({ page: 'invalid', limit: -1 });

      expect(response.status).toBe(400);
    });
  });

  // 测试获取游戏详情
  describe('GET /api/games/:gameId', () => {
    it('should return game details', async () => {
      const response = await request(app)
        .get(`/api/games/${testGame._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe(testGame.title);
    });

    it('should handle invalid game ID', async () => {
      const response = await request(app)
        .get('/api/games/invalid-id');

      expect(response.status).toBe(400);
    });

    it('should handle non-existent game', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/games/${nonExistentId}`);

      expect(response.status).toBe(404);
    });
  });

  // 测试游戏搜索
  describe('GET /api/games/search', () => {
    it('should return search results', async () => {
      const response = await request(app)
        .get('/api/games/search')
        .query({ q: '测试' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should handle empty search term', async () => {
      const response = await request(app)
        .get('/api/games/search')
        .query({ q: '' });

      expect(response.status).toBe(400);
    });
  });

  // 测试价格过滤
  describe('GET /api/games/filter/price', () => {
    it('should return filtered games', async () => {
      const response = await request(app)
        .get('/api/games/filter/price')
        .query({ min: 50, max: 200 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should handle invalid price range', async () => {
      const response = await request(app)
        .get('/api/games/filter/price')
        .query({ min: 200, max: 50 });

      expect(response.status).toBe(400);
    });
  });
});
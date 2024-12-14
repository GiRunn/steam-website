const GameMediaRepository = require('./repositories/gameMediaRepository');
const GameMediaService = require('./services/gameMediaService');
const GameMediaController = require('./controllers/gameMediaController');
const GameMediaRoutes = require('./routes/gameMediaRoutes');

class GameMediaModule {
  constructor(db, redis) {
    // 初始化依赖
    this.repository = new GameMediaRepository(db, redis);
    this.service = new GameMediaService(this.repository);
    this.controller = new GameMediaController(this.service);
    this.routes = new GameMediaRoutes(this.controller);
  }

  // 获取路由配置
  getRoutes() {
    return this.routes.getRouter();
  }
}

// 导出模块工厂函数
module.exports = (db, redis) => {
  const module = new GameMediaModule(db, redis);
  return module.getRoutes();
};
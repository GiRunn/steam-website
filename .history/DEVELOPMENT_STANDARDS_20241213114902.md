# Steam Website 开发规范文档

## 1. 项目架构规范

### 1.1 后端目录结构
```
server/
├── src/
│   ├── config/                 # 配置文件
│   │   ├── database.js        # PostgreSQL数据库配置
│   │   └── redis.js          # Redis配置
│   │
│   ├── middleware/            # 中间件
│   │   ├── auth.js           # JWT认证
│   │   └── performanceMonitor.js  # 性能监控
│   │
│   ├── modules/              # 业务模块
│   │   ├── game/            # 游戏详情模块
│   │   │   ├── repositories/  # 数据访问层
│   │   │   │   └── gameDetailRepository.js
│   │   │   ├── services/     # 业务逻辑层
│   │   │   │   └── gameDetailService.js
│   │   │   ├── controllers/  # 控制器层
│   │   │   │   └── gameDetailController.js
│   │   │   └── routes/      # 路由层
│   │   │       └── gameDetailRoutes.js
│   │   │
│   │   ├── gameOverview/    # 游戏概览模块
│   │   │   ├── repositories/
│   │   │   │   └── gameOverviewRepository.js
│   │   │   ├── services/
│   │   │   │   └── gameOverviewService.js
│   │   │   ├── controllers/
│   │   │   │   └── gameOverviewController.js
│   │   │   ├── routes/
│   │   │   │   └── gameOverviewRoutes.js
│   │   │   └── index.js
│   │   │
│   │   └── gameFeature/     # 游戏特征模块
│   │       ├── repositories/
│   │       │   └── gameFeatureRepository.js
│   │       ├── services/
│   │       │   └── gameFeatureService.js
│   │       ├── controllers/
│   │       │   └── gameFeatureController.js
│   │       ├── routes/
│   │       │   └── gameFeatureRoutes.js
│   │       └── index.js
│   │
│   ├── tests/               # 测试文件
│   │   ├── config/         # 配置测试
│   │   │   └── database.test.js
│   │   ├── middleware/     # 中间件测试
│   │   │   └── performanceMonitor.test.js
│   │   └── manual/        # 手动测试脚本
│   │       └── testDatabasePool.js
│   │
│   ├── app.js              # Express应用配置
│   └── index.js            # 服务器入口文件
│
├── .env                    # 环境变量配置
└── package.json           # 项目依赖配置
```

### 1.2 模块划分规范

#### 1.2.1 四层架构
每个业务模块必须遵循以下四层架构：
1. Repository层（数据访问层）
2. Service层（业务逻辑层）
3. Controller层（控制器层）
4. Route层（路由层）

#### 1.2.2 模块职责

**Repository层**
```javascript
// gameDetailRepository.js 示例
class GameDetailRepository {
    async findById(id) {
        // 数据库操作
        const result = await db.query('SELECT * FROM games WHERE id = $1', [id]);
        return result.rows[0];
    }
    
    async updateGameDetail(id, data, transaction) {
        // 事务操作
    }
}
```

**Service层**
```javascript
// gameDetailService.js 示例
class GameDetailService {
    constructor(repository, redisClient) {
        this.repository = repository;
        this.redisClient = redisClient;
    }

    async getGameDetail(id) {
        // 缓存检查
        const cached = await this.redisClient.get(`game:${id}`);
        if (cached) return JSON.parse(cached);

        // 业务逻辑
        const game = await this.repository.findById(id);
        if (!game) throw new NotFoundError('Game not found');

        // 缓存存储
        await this.redisClient.setex(`game:${id}`, 3600, JSON.stringify(game));
        return game;
    }
}
```

**Controller层**
```javascript
// gameDetailController.js 示例
class GameDetailController {
    constructor(service) {
        this.service = service;
    }

    async getDetail(req, res) {
        try {
            const { id } = req.params;
            const result = await this.service.getGameDetail(id);
            
            res.json({
                code: 200,
                message: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
```

**Route层**
```javascript
// gameDetailRoutes.js 示例
const router = express.Router();
const auth = require('../../middleware/auth');

router.get('/games/:id', 
    auth.verifyToken,
    rateLimit({ windowMs: 15*60*1000, max: 100 }),
    controller.getDetail.bind(controller)
);
```

### 1.3 数据库操作规范

#### 1.3.1 连接池配置
```javascript
// database.js
module.exports = {
    pool: {
        max: 20,               // 最大连接数
        min: 5,                // 最小连接数
        idle: 10000,           // 连接空闲超时
        acquire: 30000,        // 连接获取超时
        evict: 30000           // 连接清除超时
    },
    retry: {
        max: 3                 // 最大重试次数
    }
};
```

#### 1.3.2 Redis缓存规范
```javascript
// redis.js
module.exports = {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        db: 0
    },
    options: {
        retry_strategy: function (options) {
            if (options.total_retry_time > 1000 * 60 * 60) {
                return new Error('Retry time exhausted');
            }
            return Math.min(options.attempt * 100, 3000);
        }
    }
};
```

### 1.4 错误处理规范

#### 1.4.1 自定义错误类
```javascript
// errors/customErrors.js
class APIError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
    }
}

class NotFoundError extends APIError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
```

#### 1.4.2 错误中间件
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    logger.error({
        error: err.name,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(status).json({
        code: status,
        message: message,
        timestamp: new Date().toISOString()
    });
};
```

### 1.5 性能监控规范

#### 1.5.1 请求监控
```javascript
// middleware/performanceMonitor.js
const performanceMonitor = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;

        logger.info({
            path: req.path,
            method: req.method,
            duration: `${duration.toFixed(2)}ms`,
            status: res.statusCode
        });

        // 性能告警
        if (duration > 500) {
            logger.warn({
                type: 'SLOW_REQUEST',
                path: req.path,
                duration: duration
            });
        }
    });

    next();
};
```

### 1.6 测试规范

#### 1.6.1 单元测试
```javascript
// tests/services/gameDetail.test.js
describe('GameDetailService', () => {
    let service;
    let mockRepository;
    let mockRedis;

    beforeEach(() => {
        mockRepository = {
            findById: jest.fn()
        };
        mockRedis = {
            get: jest.fn(),
            setex: jest.fn()
        };
        service = new GameDetailService(mockRepository, mockRedis);
    });

    it('should return cached data if exists', async () => {
        const mockGame = { id: 1, name: 'Test Game' };
        mockRedis.get.mockResolvedValue(JSON.stringify(mockGame));

        const result = await service.getGameDetail(1);
        expect(result).toEqual(mockGame);
        expect(mockRepository.findById).not.toHaveBeenCalled();
    });
});
```

### 1.7 文档规范

#### 1.7.1 API文档
使用Swagger/OpenAPI规范编写API文档：

```yaml
paths:
  /api/v1/games/{id}:
    get:
      summary: 获取游戏详情
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        200:
          description: 成功返回游戏详情
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GameDetail'
```

#### 1.7.2 代码注释
```javascript
/**
 * 获取游戏详情
 * @param {number} id - 游戏ID
 * @returns {Promise<Object>} 游戏详情对象
 * @throws {NotFoundError} 当游戏不存在时
 */
async getGameDetail(id) {
    // 实现逻辑
}
```

## 2. 性能规范

### 2.1 性能指标要求
```javascript
// 响应时间目标
const PERFORMANCE_TARGETS = {
    P95_RESPONSE_TIME: 100,  // ms
    P99_RESPONSE_TIME: 200,  // ms
    TIMEOUT: 3000,           // ms
    MAX_REQUEST_SIZE: 10,    // MB
    MAX_RESPONSE_SIZE: 5,    // MB
    MAX_QUERY_RESULTS: 1000,
    DEFAULT_PAGE_SIZE: 20
};

// 并发处理
const CONCURRENCY_CONFIG = {
    MAX_CONCURRENT_REQUESTS: 5000,
    DB_POOL_MAX: 100,
    DB_POOL_MIN: 20,
    CONNECTION_TIMEOUT: 5000  // ms
};
```

### 2.2 缓存配置规范
```javascript
// redis.js
module.exports = {
    // 缓存时间配置
    cacheDuration: {
        HOT_DATA: 60 * 60,        // 1小时
        LIST_DATA: 5 * 60,        // 5分钟
        STATS_DATA: 10 * 60,      // 10分钟
        USER_SESSION: 24 * 60 * 60, // 24小时
        RATE_LIMIT: 60            // 1分钟
    },

    // 缓存预热配置
    preloadConfig: {
        TOP_GAMES_COUNT: 100,
        PRELOAD_SCHEDULE: '0 2 * * *',  // 每天凌晨2点
        TAG_UPDATE_INTERVAL: '0 * * * *' // 每小时
    },

    // 缓存防护配置
    protection: {
        BLOOM_FILTER_SIZE: 100000,
        NULL_CACHE_DURATION: 300,  // 5分钟
        MUTEX_TIMEOUT: 3000        // 3秒
    }
};
```

## 3. 安全规范

### 3.1 API访问限制
```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// 普通接口限制
const standardLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: '请求频率超限'
});

// 敏感接口限制
const sensitiveLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: '请求频率超限'
});

// 登录接口限制
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: '登录尝试次数过多'
});
```

### 3.2 SQL注入防护
```javascript
// utils/sqlSanitizer.js
const sqlSanitizer = {
    validateInput(input) {
        // 字符串长度限制
        if (input.length > MAX_INPUT_LENGTH) {
            throw new ValidationError('输入超长');
        }

        // 特殊字符过滤
        if (FORBIDDEN_CHARS.test(input)) {
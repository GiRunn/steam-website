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
            throw new ValidationError('包含非法字符');
        }

        return input;
    },

    // 参数化查询示例
    async query(text, params) {
        return await pool.query(text, params.map(this.validateInput));
    }
};
```

### 3.3 数据安全
```javascript
// utils/encryption.js
const crypto = require('crypto');

const encryption = {
    // AES-256加密
    encrypt(text, key) {
        const cipher = crypto.createCipher('aes-256-gcm', key);
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    },

    // 数据脱敏
    maskData(data, type) {
        switch(type) {
            case 'email':
                return data.replace(/(?<=.{3}).(?=.*@)/g, '*');
            case 'phone':
                return data.replace(/(?<=.{3}).*(?=.{4})/g, '*****');
            default:
                return data;
        }
    }
};
```

## 4. 监控告警规范

### 4.1 性能监控
```javascript
// middleware/performanceMonitor.js
const monitor = {
    thresholds: {
        CPU_USAGE: 80,
        MEMORY_USAGE: 80,
        DISK_USAGE: 85,
        RESPONSE_TIME: 1000,
        ERROR_RATE: 1,
        CONCURRENT_CONNECTIONS: 3000
    },

    async checkSystem() {
        const metrics = await this.collectMetrics();
        this.evaluateMetrics(metrics);
    }
};
```

### 4.2 告警配置
```javascript
// utils/alerting.js
const alerting = {
    levels: {
        P0: {
            responseTime: 0,    // 立即响应
            conditions: {
                serviceDown: true,
                errorRate: 10,
                cpuUsage: 90
            }
        },
        P1: {
            responseTime: 30,   // 30分钟内响应
            conditions: {
                responseTime: 1000,
                errorRate: 5,
                cpuUsage: 85
            }
        }
    }
};
```

### 4.3 日志配置
```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    },
    format: winston.format.json(),
    defaultMeta: {
        service: 'steam-backend'
    },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

## 5. DDoS防护配置

### 5.1 基础防护
```javascript
// middleware/ddosProtection.js
const protection = {
    config: {
        MAX_CONNECTIONS_PER_IP: 100,
        MAX_NEW_CONNECTIONS_PER_SEC: 50,
        MAX_REQUEST_SIZE: '10mb',
        MAX_URI_LENGTH: 2048
    },

    async protect(req, res, next) {
        if (await this.isBlacklisted(req.ip)) {
            return res.status(403).send('Access denied');
        }
        
        if (this.exceedsThresholds(req)) {
            await this.blacklistIP(req.ip);
            return res.status(429).send('Too many requests');
        }
        
        next();
    }
};
```

## 6. 错误码规范

### 6.1 错误码定义
```javascript
// constants/errorCodes.js
const ErrorCodes = {
    // 系统级错误 (1xxx)
    SYSTEM_ERROR: {
        code: 1000,
        message: '系统内部错误'
    },
    SERVICE_UNAVAILABLE: {
        code: 1001,
        message: '服务暂时不可用'
    },
    REQUEST_TIMEOUT: {
        code: 1002,
        message: '请求超时'
    },

    // 权限类错误 (2xxx)
    UNAUTHORIZED: {
        code: 2001,
        message: '未授权访问'
    },
    RATE_LIMIT_EXCEEDED: {
        code: 2002,
        message: '访问频率超限'
    },

    // 参数类错误 (3xxx)
    INVALID_PARAMS: {
        code: 3001,
        message: '参数不合法'
    },
    MISSING_PARAMS: {
        code: 3002,
        message: '参数缺失'
    }
};

module.exports = ErrorCodes;
```

### 6.2 错误处理示例
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    // 获取错误码
    const errorCode = ErrorCodes[err.type] || ErrorCodes.SYSTEM_ERROR;

    // 记录错误日志
    logger.error({
        code: errorCode.code,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        requestId: req.id,
        userId: req.user?.id,
        path: req.path,
        timestamp: new Date().toISOString()
    });

    // 返回错误响应
    res.status(errorCode.httpStatus || 500).json({
        code: errorCode.code,
        message: errorCode.message,
        timestamp: new Date().toISOString()
    });
};
```

## 20. 测试规范

### 20.1 单元测试规范
```javascript
// 测试文件命名: *.test.js
describe('ModuleName', () => {
    // 1. 基础功能测试
    describe('Basic Functionality', () => {
        it('should perform basic operation correctly', () => {
            // 测试基本功能
        });
    });

    // 2. 边界条件测试
    describe('Edge Cases', () => {
        it('should handle empty input', () => {
            // 测试空输入
        });
        it('should handle maximum values', () => {
            // 测试最大值
        });
    });

    // 3. 错误处理测试
    describe('Error Handling', () => {
        it('should throw specific error for invalid input', () => {
            // 测试错误处理
        });
    });
});
```

### 20.2 数据库测试规范
```javascript
// database.test.js
describe('Database Tests', () => {
    // 1. 连接测试
    describe('Connection Tests', () => {
        it('should establish basic connection', async () => {
            // 测试基本连接
        });
        
        it('should handle concurrent connections', async () => {
            // 测试并发连接
        });
    });

    // 2. 连接池测试
    describe('Pool Tests', () => {
        it('should respect max pool size', async () => {
            // 测试最大连接数
        });
        
        it('should handle connection timeouts', async () => {
            // 测试连接超时
        });
    });

    // 3. 错误恢复测试
    describe('Error Recovery', () => {
        it('should recover from query errors', async () => {
            // 测试查询错误恢复
        });
        
        it('should handle transaction rollbacks', async () => {
            // 测试事务回滚
        });
    });

    // 4. 长时间运行测试
    describe('Long Running Operations', () => {
        it('should handle long queries', async () => {
            // 测试长时间查询
        });
        
        it('should support query cancellation', async () => {
            // 测试查询取消
        });
    });
});
```

### 20.3 性能监控测试规范
```javascript
// performanceMonitor.test.js
describe('Performance Monitoring', () => {
    // 1. 响应时间测试
    describe('Response Time', () => {
        it('should measure response time accurately', () => {
            // 测试响应时间测量
        });
        
        it('should trigger alerts for slow responses', () => {
            // 测试慢响应告警
        });
    });

    // 2. 资源使用测试
    describe('Resource Usage', () => {
        it('should monitor memory usage', () => {
            // 测试内存监控
        });
        
        it('should track CPU utilization', () => {
            // 测试CPU监控
        });
    });

    // 3. 并发测试
    describe('Concurrency', () => {
        it('should handle multiple simultaneous requests', () => {
            // 测试并发请求
        });
        
        it('should maintain performance under load', () => {
            // 测试负载性能
        });
    });
});
```

### 20.4 集成测试规范
```javascript
// integration.test.js
describe('Integration Tests', () => {
    // 1. API端点测试
    describe('API Endpoints', () => {
        it('should handle complete request flow', async () => {
            // 测试完整请求流程
        });
    });

    // 2. 中间件集成测试
    describe('Middleware Integration', () => {
        it('should process request through all middleware', async () => {
            // 测试中间件链
        });
    });

    // 3. 数据流测试
    describe('Data Flow', () => {
        it('should maintain data integrity through layers', async () => {
            // 测试数据完整性
        });
    });
});
```

### 20.5 测试覆盖率要求
```javascript
// 覆盖率目标
const coverageTargets = {
    statements: 80,
    branches: 75,
    functions: 85,
    lines: 80
};

// 关键模块覆盖率要求
const criticalModuleCoverage = {
    statements: 90,
    branches: 85,
    functions: 95,
    lines: 90
};
```

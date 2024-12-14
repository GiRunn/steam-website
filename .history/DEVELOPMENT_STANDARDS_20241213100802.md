# Steam Website 开发规范文档

## 1. 项目架构规范

### 1.1 目录结构

```
steam-website/
├── frontend/          # 前端代码
│   ├── src/          # 源代码
│   ├── public/       # 静态资源
│   └── tests/        # 测试文件
├── backend/          # 后端代码
│   ├── src/          # 源代码
│   │   ├── controllers/  # 控制器
│   │   ├── models/      # 数据模型
│   │   ├── services/    # 业务逻辑
│   │   ├── middleware/  # 中间件
│   │   └── utils/       # 工具函数
│   ├── config/       # 配置文件
│   └── tests/        # 测试文件
├── database/         # 数据库相关文件
└── docs/            # 项目文档
```

## 2. API 开发规范

### 2.1 API 设计原则

#### 2.1.1 基础规范
- 所有API都必须使用HTTPS
- API版本号统一放在URL中: `/api/v1/`
- 使用标准的HTTP方法和状态码
- 所有接口都需要进行认证和鉴权
- 返回数据统一使用JSON格式

#### 2.1.2 统一响应格式
```json
{
    "code": 200,           // 状态码
    "message": "success",  // 状态描述
    "data": {             // 业务数据
        // 具体数据
    },
    "timestamp": "2024-03-20T10:00:00Z"  // 响应时间戳
}
```

#### 2.1.3 错误码规范
- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

### 2.2 API 文档规范

#### 2.2.1 接口文档模板
```yaml
接口名称: 获取游戏列表
接口地址: /api/v1/games
请求方式: GET
接口描述: 获取游戏商店的游戏列表

请求参数:
  - 参数名: page
    类型: integer
    是否必须: 否
    描述: 页码，默认1
  
  - 参数名: size
    类型: integer
    是否必须:否
    描述: 每页数量，默认20

响应参数:
  - 参数名: total
    类型: integer
    描述: 总记录数
  
  - 参数名: items
    类型: array
    描述: 游戏列表数据

示例响应:
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 100,
        "items": [...]
    }
}
```

### 2.3 接口安全规范

#### 2.3.1 认证机制
- 使用JWT进行身份认证
- Token在Header中通过Bearer方式传递
- Token过期时间设置为2小时
- 提供刷新Token机制

#### 2.3.2 数据验证
```javascript
// 请求参数验证示例
const validateGameCreate = {
    title: Joi.string().required().min(2).max(100),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    categoryId: Joi.number().required()
};
```

#### 2.3.3 安全措施
- 实现请求频率限制
- 实现IP黑名单机制
- 敏感数据加密传输
- 实现CSRF防护
- 添加必要的日志记录

### 2.4 数据库操作规范

#### 2.4.1 查询规范
```sql
-- 推荐的查询写法
SELECT g.id, g.title, c.name as category_name
FROM games g
LEFT JOIN categories c ON g.category_id = c.id
WHERE g.status = 1
LIMIT 20 OFFSET 0;
```

#### 2.4.2 事务处理
```javascript
// 事务处理示例
const transaction = await sequelize.transaction();
try {
    await Game.create(gameData, { transaction });
    await GameDetail.create(detailData, { transaction });
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
    throw error;
}
```

### 2.5 代码示例

#### 2.5.1 控制器示例
```javascript
class GameController {
    async list(req, res) {
        try {
            const { page = 1, size = 20 } = req.query;
            const result = await gameService.getGames({ page, size });
            
            return res.json({
                code: 200,
                message: 'success',
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
}
```

#### 2.5.2 服务层示例
```javascript
class GameService {
    async getGames({ page, size }) {
        const offset = (page - 1) * size;
        
        const result = await Game.findAndCountAll({
            offset,
            limit: size,
            include: [{
                model: Category,
                attributes: ['name']
            }]
        });
        
        return {
            total: result.count,
            items: result.rows
        };
    }
}
```

### 2.6 测试规范

#### 2.6.1 单元测试
```javascript
describe('GameService', () => {
    it('should return game list', async () => {
        const result = await gameService.getGames({ page: 1, size: 20 });
        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('items');
        expect(Array.isArray(result.items)).toBeTruthy();
    });
});
```

### 2.7 日志规范

#### 2.7.1 日志记录
```javascript
// 日志配置
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// 使用示例
logger.info('API调用', {
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body,
    userId: req.user?.id,
    timestamp: new Date()
});
```

## 3. 部署规范

### 3.1 环境配置
- 开发环境(development)
- 测试环境(testing)
- 预生产环境(staging)
- 生产环境(production)

### 3.2 配置管理
```javascript
// config/index.js
module.exports = {
    development: {
        port: 3000,
        database: {
            host: 'localhost',
            port: 3306,
            name: 'steam_dev'
        }
    },
    production: {
        port: process.env.PORT,
        database: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            name: process.env.DB_NAME
        }
    }
};
```

## 4. 监控告警规范

### 4.1 监控指标
- API响应时间
- 错误率统计
- 服务器资源使用情况
- 数据库性能指标
- 业务指标监控

### 4.2 告警配置
- 接口响应时间超过500ms
- 错误率超过1%
- CPU使用率超过80%
- 内存使用率超过80%
- 磁盘使用率超过85%
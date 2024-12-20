# 管理员监控系统 - 后端服务

admin-monitor/backend/
├── src/
│ ├── app.ts # 应用程序入口文件
│ ├── config/ # 配置文件目录
│ │ └── database.ts # 数据库配置
│ ├── controllers/ # 控制器目录
│ │ └── MonitorController.ts # 监控系统控制器
│ ├── services/ # 服务层目录
│ │ ├── base/ # 基础服务
│ │ │ └── BaseService.ts # 基础服务类
│ │ ├── database/ # 数据库相关服务
│ │ │ ├── ConnectionService.ts # 连接监控服务
│ │ │ ├── DatabaseMetricsService.ts # 数据库指标服务
│ │ │ └── PerformanceService.ts # 性能监控服务
│ │ ├── review/ # 评论系统服务
│ │ │ ├── ReviewAnalyticsService.ts # 评论分析服务
│ │ │ └── ReviewMetricsService.ts # 评论指标服务
│ │ ├── system/ # 系统服务
│ │ │ ├── SecurityService.ts # 安全监控服务
│ │ │ └── SystemMetricsService.ts # 系统指标服务
│ │ ├── index.ts # 服务导出文件
│ │ └── MonitorService.ts # 监控服务聚合
│ └── database/ # 数据库脚本
│ └── setup_monitoring.sql # 监控表结构初始化脚本
├── package.json # 项目依赖配置
└── tsconfig.json # TypeScript配置

## 核心功能模块详解

### 1. 核心控制器和服务

#### MonitorController.ts
主要职责：处理所有HTTP请求，对应前端显示的所有数据面板

核心方法：
- `getSystemMetrics()` - 获取系统指标（CPU使用率、内存使用）
- `getDatabaseMetrics()` - 获取数据库指标（大小、连接数）
- `getConnectionStatus()` - 获取连接状态（总连接数、活跃连接）
- `getReviewSystemStats()` - 获取评论系统统计
- `getSecurityEvents()` - 获取安全监控数据

#### MonitorService.ts
主要职责：
- 整合所有监控服务
- 协调不同服务之间的数据流
- 实现定时任务（每5分钟采集一次指标）

### 2. 专门的监控服务

#### SystemMetricsService.ts
负责系统级指标监控，提供以下数据：
- CPU使用率趋势图
- 内存使用趋势图
- 系统资源使用统计

#### DatabaseMetricsService.ts
负责数据库指标监控，提供以下数据：
- 数据库大小
- 连接数统计
- 数据库性能指标

#### ConnectionService.ts
负责数据库连接监控，提供连接监控表格数据：
| 监控项 | 说明 |
|-------|------|
| PID | 进程ID |
| 用户名 | 连接用户 |
| 客户端IP | 访问来源 |
| 数据库名 | 当前数据库 |
| 连接状态 | 活跃/空闲 |
| 当前查询 | 执行的SQL |
| 连接时间 | 建立连接的时间 |
| 最后活动时间 | 最近活动时间 |

#### ReviewMetricsService.ts
负责评论系统监控，提供以下数据：
- 总评论数
- 平均评分
- 评论趋势
- 评论分布统计

#### SecurityService.ts
负责安全监控，提供安全监控表格数据：
| 监控项 | 说明 |
|-------|------|
| 事件类型 | 安全事件分类 |
| 描述 | 事件详细信息 |
| IP地址 | 事件来源IP |
| 用户代理 | 客户端信息 |
| 时间 | 发生时间 |
| 严重程度 | 事件等级 |

#### PerformanceService.ts
负责性能监控，提供以下数据：
- 平均查询时间
- 缓存命中率
- 连接状态分布
- 性能趋势图

### 3. 数据库相关文件

#### setup_monitoring.sql
- 创建监控所需的数据库表
- 设置分区表结构
- 创建监控视图
- 插入测试数据

### 4. 配置文件

#### database.ts
- 数据库连接配置
- 连接池管理
- 超时设置

### 5. 基础设施

#### BaseService.ts
- 提供基础服务功能
- 统一错误处理
- 数据库连接管理

### 6. 项目配置

#### package.json
- 项目依赖管理
- 启动脚本
- 开发工具配置

#### tsconfig.json
- TypeScript配置
- 编译选项
- 模块解析设置

## 项目概述
这是一个用于游戏平台的管理员监控系统后端服务，主要用于监控数据库性能、系统指标、评论系统等关键指标。

## 技术栈
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Cron Jobs

## 项目结构 

## API 接口列表

### 系统监控
- GET /system-metrics - 获取系统指标
- GET /system-metrics/history - 获取历史系统指标

### 数据库监控
- GET /database-metrics - 获取数据库指标
- GET /database-performance-details - 获取数据库性能详情
- GET /optimization-suggestions - 获取优化建议

### 连接监控
- GET /connection-status - 获取连接状态
- GET /connections/details - 获取连接详情

### 评论系统监控
- GET /review-system/stats - 获取评论系统统计
- GET /review-system/metrics - 获取评论系统指标
- GET /review-system/anomalies - 获取异常情况

### 安全监控
- GET /security/events - 获取安全事件

## 定时任务
系统每5分钟自动执行一次指标采集任务，保存到数据库中用于历史趋势分析。

## 部署说明
1. 安装依赖：`npm install`
2. 编译TypeScript：`npm run build`
3. 启动服务：`npm start`
4. 开发模式：`npm run dev`

## 环境要求
- Node.js >= 14.x
- PostgreSQL >= 12.x
- TypeScript >= 4.4.x

## 配置说明
数据库配置在 `src/config/database.ts` 中，包括：
- host: 数据库主机
- port: 数据库端口
- database: 数据库名称
- user: 数据库用户
- password: 数据库密码
- max: 最大连接数
- idleTimeoutMillis: 空闲超时
- connectionTimeoutMillis: 连接超时

## 安全考虑
- 实现了SQL注入检测
- 监控可疑数据库操作
- 记录异常登录行为
- 实现请求频率限制
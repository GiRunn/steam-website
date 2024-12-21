# 管理员监控系统文档

## 项构

admin-monitor/
├── backend/ # 后端服务
│ └── src/
│ ├── app.ts # 应用程序入口
│ ├── config/ # 配置文件
│ ├── controllers/ # 控制器
│ ├── services/ # 服务层
│ └── database/ # 数据库相关
└── frontend/ # 前端应用
└── src/
├── components/ # 组件
├── pages/ # 页面
└── services/ # 服务


## 前端组件说明

### 1. 连接监控组件
**文件：** `frontend/src/components/Monitoring/ConnectionMonitor/index.tsx`
**前端页面特征：** 数据库连接监控
**用途：** 显示数据库连接详情，包括PID、用户名、客户端IP、数据库、状态、当前查询、连接时间、最后活动
**API：** `http://localhost:8877/connections/details`
**后端API文件：** `backend/src/services/database/ConnectionService.ts`

### 2. 分区监控组件
**文件：** `frontend/src/components/Monitoring/PartitionMonitor/index.tsx`
**前端页面特征：** 数据库分区状态监控
**用途：** 显示分区表信息，包括表名、分区名、大小、记录数、死元组率、最后清理时间、最后分析时间、状态
**API：** `http://localhost:8877/partitions/status`
**后端API文件：** `backend/src/services/review/ReviewAnalyticsService.ts`

### 3. 优化建议组件
**文件：** `frontend/src/components/Monitoring/OptimizationMonitor/index.tsx`
**前端页面特征：** 数据库优化建议
**用途：** 显示表优化建议和索引优化建议；表名	记录数	死元组数	死元组率
**API：** `http://localhost:8877/optimization-suggestions`
**后端API文件：** `backend/src/services/database/PerformanceService.ts`

### 4. 评论系统监控组件
**文件：** `frontend/src/components/Monitoring/ReviewSystemMonitor/index.tsx`
**前端页面特征：** 评论系统监控
**用途：** 显示评论系统统计信息
**API：** `http://localhost:8877/review-system/stats`
**后端API文件：** `backend/src/services/review/ReviewMetricsService.ts`

### 5. 安全监控组件
**文件：** `frontend/src/components/Monitoring/SecurityMonitor/index.tsx`
**前端页面特征：** 安全事件监控
**用途：** 显示安全事件和告警信息
**API：** `http://localhost:8877/security/events`
**后端API文件：** `backend/src/services/system/SecurityService.ts`

## 后端服务说明

### 1. 基础服务
**文件：** `backend/src/services/base/BaseService.ts`
**用途：** 提供基础服务类，包含数据库连接池管理和错误处理

### 2. 数据库指标服务
**文件：** `backend/src/services/database/DatabaseMetricsService.ts`
**用途：** 提供数据库相关指标，如大小、连接数等
**API端点：** `/database-metrics`

### 3. 性能监控服务
**文件：** `backend/src/services/database/PerformanceService.ts`
**用途：** 提供数据库性能指标和优化建议
**API端点：** 
- `/performance-metrics`
- `/optimization-suggestions`
- `/database-performance-details`

### 4. 评论系统服务
**文件：** `backend/src/services/review/ReviewMetricsService.ts`
**用途：** 提供评论系统相关指标
**API端点：**
- `/review-system/stats`
- `/review-system/metrics`
- `/review-system/anomalies`

### 5. 系统指标服务
**文件：** `backend/src/services/system/SystemMetricsService.ts`
**用途：** 提供系统级指标，如CPU使用率、内存使用等
**API端点：**
- `/system-metrics`
- `/system-metrics/history`

## API 端点列表

### 系统监控
1. `GET /system-metrics` - 获取系统指标
2. `GET /system-metrics/history` - 获取系统指标历史数据

### 数据库监控
1. `GET /database-metrics` - 获取数据库指标
2. `GET /database-performance-details` - 获取数据库性能详情
3. `GET /performance-metrics` - 获取性能指标
4. `GET /optimization-suggestions` - 获取数据库优化建议

### 连接监控
1. `GET /connection-status` - 获取数据库连接状态
2. `GET /connections/details` - 获取连接详细信息
3. `GET /connections/long-running` - 获取长时间运行的查询

### 评论系统监控
1. `GET /review-system/stats` - 获取评论系统统计
2. `GET /review-system/metrics` - 获取评论系统指标
3. `GET /review-system/anomalies` - 获取评论系统异常情况

### 分区监控
1. `GET /partitions/status` - 获取数据库分区状态

### 安全监控
1. `GET /security/events` - 获取安全事件

## 定时任务
系统每5分钟自动执行一次指标采集任务，保存到数据库中用于历史趋势分析。

## 开发规范
详见：
- `backend/DEVELOPMENT_STANDARDS.md` - 后端开发规范
- `frontend/FRONTEND_STANDARDS.md` - 前端开发规范
- `backend/DATABASE_STANDARDS.md` - 数据库开发规范
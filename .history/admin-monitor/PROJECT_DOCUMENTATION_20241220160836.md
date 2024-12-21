# 管理员监控系统文档

## 前端组件列表

组件名 | 文件路径 | API路径 | 刷新频率 | 后端服务文件
---|---|---|---|---
连接监控 | `ConnectionMonitor/index.tsx` | `/connections/details` | 60秒 | `ConnectionService.ts`
分区监控 | `PartitionMonitor/index.tsx` | `/partitions/status` | 60秒 | `ReviewAnalyticsService.ts`
优化建议 | `OptimizationMonitor/index.tsx` | `/optimization-suggestions` | 60秒 | `PerformanceService.ts`
评论系统监控 | `ReviewSystemMonitor/index.tsx` | `/review-system/stats` | 60秒 | `ReviewMetricsService.ts`
安全监控 | `SecurityMonitor/index.tsx` | `/security/events` | 30秒 | `SecurityService.ts`

## 组件显示字段

### 连接监控组件
字段名 | 说明 | 类型 | 特殊显示
---|---|---|---
PID | 进程ID | number | -
用户名 | 连接用户 | string | -
客户端IP | 连接来源 | string | -
数据库 | 数据库名称 | string | -
状态 | 连接状态 | string | 带颜色标识
当前查询 | SQL语句 | string | 长文本截断
连接时间 | 建立连接时间 | datetime | 格式化显示
最后活动 | 最后活动时间 | datetime | 格式化显示

### 分区监控组件
字段名 | 说明 | 类型 | 特殊显示
---|---|---|---
表名 | 分区表名称 | string | -
分区名 | 分区名称 | string | -
大小 | 分区大小 | string | 自动单位转换
记录数 | 总记录数 | number | -
死元组率 | 死元组百分比 | number | 进度条显示
最后清理时间 | vacuum时间 | datetime | 格式化显示
最后分析时间 | analyze时间 | datetime | 格式化显示
状态 | 分区状态 | string | 状态标签

### 优化建议组件
#### 表优化
字段名 | 说明 | 类型 | 特殊显示
---|---|---|---
表名 | 数据表名称 | string | -
记录数 | 总记录数 | number | -
死元组数 | 死元组数量 | number | -
死元组率 | 死元组百分比 | number | 进度条显示

#### 索引优化
字段名 | 说明 | 类型 | 特殊显示
---|---|---|---
表名 | 数据表名称 | string | -
索引名 | 索引名称 | string | -
扫描次数 | 索引使用次数 | number | -
读取行数 | 通过索引读取的行数 | number | -
建议 | 优化建议 | string | 状态标签

## 监控阈值设置

监控项 | 警告阈值 | 严重阈值 | 刷新频率
---|---|---|---
CPU使用率 | 70% | 90% | 5分钟
内存使用 | 80% | 95% | 5分钟
连接数 | 100 | 150 | 1分钟
死元组率 | 20% | 50% | 1小时
查询执行时间 | 3秒 | 10秒 | 实时
缓存命中率 | 低于90% | 低于80% | 5分钟

## 数据库表结构

表名 | 用途 | 分区策略 | 主要字段
---|---|---|---
reviews_partitioned | 评论存储 | 按月分区 | id, game_id, user_id, rating, content, timestamps
monitoring_history | 监控历史 | 按月分区 | id, metric_type, metric_value (jsonb), collected_at
system_metrics | 系统指标 | 按周分区 | id, metric_name, value, timestamp
security_events | 安全事件 | 按月分区 | id, event_type, description, severity, timestamp

## 后端服务说明

服务名称 | 文件路径 | 主要功能 | API端点
---|---|---|---
BaseService | `base/BaseService.ts` | 数据库连接池管理、错误处理 | -
ConnectionService | `database/ConnectionService.ts` | 连接监控、查询分析 | `/connections/*`
DatabaseMetricsService | `database/DatabaseMetricsService.ts` | 数据库指标收集 | `/database-metrics`
PerformanceService | `database/PerformanceService.ts` | 性能监控、优化建议 | `/performance-*`
ReviewMetricsService | `review/ReviewMetricsService.ts` | 评论系统监控 | `/review-system/*`
ReviewAnalyticsService | `review/ReviewAnalyticsService.ts` | 评论分析、分区监控 | `/partitions/*`
SecurityService | `system/SecurityService.ts` | 安全事件监控 | `/security/*`
SystemMetricsService | `system/SystemMetricsService.ts` | 系统指标监控 | `/system-metrics/*`

## API响应格式

API | 响应数据结构 | 说明
---|---|---
`/connections/details` | `{ pid: number, username: string, ... }` | 连接详情
`/partitions/status` | `{ table_name: string, size: string, ... }` | 分区状态
`/optimization-suggestions` | `{ table_suggestions: [], index_suggestions: [] }` | 优化建议
`/review-system/stats` | `{ total_reviews: number, avg_rating: number, ... }` | 评论统计
`/security/events` | `{ events: [], alerts: [] }` | 安全事件
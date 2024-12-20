import express from 'express';
import MonitorController from './controllers/MonitorController';
import MonitorService from './services/MonitorService';
import pool from './config/database';
import { CronJob } from 'cron';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8877;

const monitorService = new MonitorService();
const monitorController = new MonitorController(monitorService);

app.use(express.json());

// 配置安全中间件
app.use(helmet({
  // 禁用一些不必要的安全头
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));

// 更宽松的CORS配置
const corsOptions = {
  origin: [
    'http://localhost:5520',  // 前端地址
    'http://localhost:8877',  // 后端地址
    '*'  // 开发阶段可以使用，生产环境需要限制
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 移除所有速率限制
// 对于管理员账户，不需要限制请求频率

// API路由 - 保持不变
app.get('/system-metrics', (req, res) => monitorController.getSystemMetrics(req, res));
app.get('/database-metrics', (req, res) => monitorController.getDatabaseMetrics(req, res));
app.get('/connection-status', (req, res) => monitorController.getConnectionStatus(req, res));
app.get('/connections/details', (req, res) => monitorController.getConnectionDetails(req, res));
app.get('/review-system/stats', (req, res) => monitorController.getReviewSystemStats(req, res));
app.get('/review-system/metrics', (req, res) => monitorController.getReviewSystemMetrics(req, res));
app.get('/review-system/anomalies', (req, res) => monitorController.getReviewSystemAnomalies(req, res));
app.get('/partitions/status', (req, res) => monitorController.getPartitionStatus(req, res));
app.get('/performance-metrics', (req, res) => monitorController.getPerformanceMetrics(req, res));
app.get('/database-performance-details', (req, res) => monitorController.getDatabasePerformanceDetails(req, res));
app.get('/optimization-suggestions', (req, res) => monitorController.getOptimizationSuggestions(req, res));
app.get('/system-metrics/history', (req, res) => monitorController.getSystemMetricsHistory(req, res));
app.get('/security/events', (req, res) => monitorController.getSecurityEvents(req, res));
app.get('/connections/long-running', (req, res) => monitorController.getLongRunningQueries(req, res));

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: err.message
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`管理员监控服务运行在 http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    pool.end(() => {
        console.log('数据库连接池已关闭');
        process.exit(0);
    });
});

// 在 app.ts 中添加定时任务
const monitoringJob = new CronJob('*/5 * * * *', async () => {
    try {
        await monitorService.saveMonitoringMetrics();
        console.log('Monitoring metrics saved successfully');
    } catch (error) {
        console.error('Error saving monitoring metrics:', error);
    }
});

// 启动定时任务
monitoringJob.start(); 
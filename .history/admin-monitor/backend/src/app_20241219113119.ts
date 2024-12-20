import express from 'express';
import MonitorController from './controllers/MonitorController';
import MonitorService from './services/MonitorService';
import pool from './config/database';

const app = express();
const PORT = process.env.PORT || 8877;

const monitorService = new MonitorService();
const monitorController = new MonitorController(monitorService);

app.use(express.json());

// CORS配置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API路由
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
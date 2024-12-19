import express from 'express';
import MonitorController from './controllers/MonitorController';
import MonitorService from './services/MonitorService';
import pool from './config/database';

const app = express();
const PORT = process.env.PORT || 8877;

const monitorService = new MonitorService();
const monitorController = new MonitorController(monitorService);

app.use(express.json());

// 跨域支持
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 路由
app.get('/system-metrics', (req, res) => monitorController.getSystemMetrics(req, res));
app.get('/database-metrics', (req, res) => monitorController.getDatabaseMetrics(req, res));
app.get('/connection-status', (req, res) => monitorController.getConnectionStatus(req, res));
app.get('/database-performance', (req, res) => monitorController.getDatabasePerformance(req, res));
app.get('/review-system/metrics', (req, res) => monitorController.getReviewSystemMetrics(req, res));
app.get('/review-system/anomalies', (req, res) => monitorController.getReviewSystemAnomalies(req, res));
app.get('/partition-stats', (req, res) => monitorController.getPartitionStats(req, res));
app.get('/performance-metrics', (req, res) => monitorController.getPerformanceMetrics(req, res));
app.get('/database-performance-details', (req, res) => monitorController.getDatabasePerformanceDetails(req, res));
app.get('/optimization-suggestions', (req, res) => monitorController.getOptimizationSuggestions(req, res));
app.get('/system-metrics/history', (req, res) => monitorController.getSystemMetricsHistory(req, res));

// 立即收集指标并记录日志
monitorService.collectMetrics()
    .then(() => console.log('初始指标收集完成'))
    .catch(error => console.error('初始指标收集失败:', error));

app.listen(PORT, () => {
    console.log(`管理员监控服务运行在 http://localhost:${PORT}`);
}); 
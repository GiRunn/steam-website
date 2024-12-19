import express from 'express';
import MonitorController from './controllers/MonitorController';
import MonitorService from './services/MonitorService';
import pool from './config/database';

const app = express();
const PORT = process.env.PORT || 8877;

const monitorService = new MonitorService(pool);
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

app.listen(PORT, () => {
    console.log(`管理员监控服务运行在 http://localhost:${PORT}`);
}); 
import { Request, Response } from 'express';
import MonitorService from '../services/MonitorService';

class MonitorController {
    private monitorService: MonitorService;

    constructor(monitorService: MonitorService) {
        this.monitorService = monitorService;
    }

    async getSystemMetrics(req: Request, res: Response) {
        try {
            const metrics = await this.monitorService.getSystemMetrics();
            res.json({
                code: 200,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '获取系统指标失败',
                error: error.message
            });
        }
    }

    async getDatabaseMetrics(req: Request, res: Response) {
        try {
            const metrics = await this.monitorService.getDatabaseMetrics();
            res.json({
                code: 200,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: '获取数据库指标失败',
                error: error.message
            });
        }
    }
}

export default MonitorController; 
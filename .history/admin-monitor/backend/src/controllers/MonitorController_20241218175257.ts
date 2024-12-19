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
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取系统指标失败',
                error: error.message
            });
        }
    }

    async getSystemAnomalies(req: Request, res: Response) {
        try {
            const anomalies = await this.monitorService.getSystemAnomalies();
            res.json({
                code: 200,
                data: anomalies,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取系统异常失败',
                error: error.message
            });
        }
    }
}

export default MonitorController;
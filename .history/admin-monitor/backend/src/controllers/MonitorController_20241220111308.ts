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
            console.error('Controller Error:', error);
            console.error('SQL Query:', error.query);
            console.error('Error Position:', error.position);
            res.status(500).json({
                code: 500,
                message: '获取系统指标失败',
                error: error.message,
                detail: error.detail,
                hint: error.hint
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
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取数据库指标失败',
                error: error.message
            });
        }
    }

    async getConnectionStatus(req: Request, res: Response) {
        try {
            const status = await this.monitorService.getConnectionStatus();
            res.json({
                code: 200,
                data: status,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('Error fetching connection status:', error);
            res.status(500).json({
                code: 500,
                message: '获取连接状态失败',
                error: error.message
            });
        }
    }

    async getDatabasePerformance(req: Request, res: Response) {
        try {
            const performance = await this.monitorService.getDatabasePerformance();
            res.json({
                code: 200,
                data: performance,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取数据库性能指标失败',
                error: error.message
            });
        }
    }

    async getReviewSystemMetrics(req: Request, res: Response) {
        try {
            const metrics = await this.monitorService.getReviewSystemMetrics();
            res.json({
                code: 200,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取评论系统指标失败',
                error: error.message
            });
        }
    }

    async getReviewSystemAnomalies(req: Request, res: Response) {
        try {
            const anomalies = await this.monitorService.getReviewSystemAnomalies();
            res.json({
                code: 200,
                data: anomalies,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取评论系统异常失败',
                error: error.message
            });
        }
    }

    async getPartitionStatus(req: Request, res: Response) {
        try {
            const status = await this.monitorService.getPartitionStatus();
            res.json({
                code: 200,
                data: status.partitions,
                message: status.message
            });
        } catch (error: any) {
            console.error('Error fetching partition status:', error);
            res.status(500).json({
                code: 500,
                message: error.message || '获取分区状态失败',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async getPerformanceMetrics(req: Request, res: Response) {
        try {
            const metrics = await this.monitorService.getPerformanceMetrics();
            res.json({
                code: 200,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取性能指标失败',
                error: error.message
            });
        }
    }

    async getDatabasePerformanceDetails(req: Request, res: Response) {
        try {
            const details = await this.monitorService.getDatabasePerformanceDetails();
            res.json({
                code: 200,
                data: details,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取数据库性能详情失败',
                error: error.message
            });
        }
    }

    async getOptimizationSuggestions(req: Request, res: Response) {
        try {
            const suggestions = await this.monitorService.getOptimizationSuggestions();
            res.json({
                code: 200,
                data: suggestions,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('Error fetching optimization suggestions:', error);
            res.status(500).json({
                code: 500,
                message: '获取数据库优化建议失败',
                error: error.message
            });
        }
    }

    async getSystemMetricsHistory(req: Request, res: Response) {
        try {
            const timeRange = req.query.timeRange as string || '1h';
            const metrics = await this.monitorService.getSystemMetricsHistory(timeRange);
            res.json({
                code: 200,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取系统指标历史数据失败',
                error: error.message
            });
        }
    }

    async getConnectionDetails(req: Request, res: Response) {
        try {
            const details = await this.monitorService.getConnectionDetails();
            res.json({
                code: 200,
                data: details,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取连接详情失败',
                error: error.message
            });
        }
    }

    async getReviewSystemStats(req: Request, res: Response) {
        try {
            const stats = await this.monitorService.getReviewSystemStats();
            res.json({
                code: 200,
                data: stats,
                timestamp: new Date().toISOString(),
                message: '获取成功'
            });
        } catch (error: any) {
            console.error('获取评论系统统计失败:', error);
            res.status(500).json({
                code: 500,
                message: '获取评论系统统计失败',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async getSecurityEvents(req: Request, res: Response) {
        try {
            const events = await this.monitorService.getSecurityEvents();
            res.json({
                code: 200,
                data: events,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取安全事件失败',
                error: error.message
            });
        }
    }

    async getLongRunningQueries(req: Request, res: Response) {
        try {
            const queries = await this.monitorService.getLongRunningQueries();
            res.json({
                code: 200,
                data: queries,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                code: 500,
                message: '获取长时间运行查询失败',
                error: error.message
            });
        }
    }
}

export default MonitorController;
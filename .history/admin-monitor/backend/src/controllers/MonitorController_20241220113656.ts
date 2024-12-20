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
                状态码: 200,
                数据: metrics,
                描述: '系统指标获取成功',
                时间戳: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                状态码: 500,
                消息: '系统指标获取失败',
                错误详情: error.message,
                建议: '请检查系统运行状态或联系技术支持'
            });
        }
    }

    async getDatabaseMetrics(req: Request, res: Response) {
        try {
            const metrics = await this.monitorService.getDatabaseMetrics();
            res.json({
                状态码: 200,
                数据: metrics,
                描述: '数据库指标获取成功',
                时间戳: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                状态码: 500,
                消息: '数据库指标获取失败',
                错误详情: error.message,
                建议: '请检查数据库连接或联系数据库管理员'
            });
        }
    }

    async getConnectionStatus(req: Request, res: Response) {
        try {
            const status = await this.monitorService.getConnectionStatus();
            res.json({
                状态码: 200,
                数据: status,
                描述: '数据库连接状态获取成功',
                时间戳: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                状态码: 500,
                消息: '数据库连接状态获取失败',
                错误详情: error.message,
                建议: '请检查网络连接和数据库服务'
            });
        }
    }

    async getConnectionDetails(req: Request, res: Response) {
        try {
            const details = await this.monitorService.getConnectionDetails();
            res.json({
                状态码: 200,
                数据: details,
                描述: '连接详细信息获取成功',
                总连接数: details.length,
                时间戳: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                状态码: 500,
                消息: '连接详细信息获取失败',
                错误详情: error.message,
                建议: '请检查数据库连接权限'
            });
        }
    }

    async getReviewSystemStats(req: Request, res: Response) {
        try {
            const stats = await this.monitorService.getReviewSystemStats();
            
            res.json({
                状态码: 200,
                数据: stats || {
                    总评论数: 0,
                    今日评论数: 0,
                    活跃评论数: 0,
                    已删除评论数: 0,
                    平均评分: 0,
                    总回复数: 0,
                    评论分布: []
                },
                描述: '评论系统统计获取成功',
                时间戳: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                状态码: 500,
                消息: '评论系统统计获取失败',
                错误详情: error.message,
                建议: '请检查评论系统服务状态'
            });
        }
    }

    async getSecurityEvents(req: Request, res: Response) {
        try {
            const events = await this.monitorService.getSecurityEvents();
            res.json({
                状态码: 200,
                数据: events,
                描述: '安全事件获取成功',
                事件总数: events.length,
                时间戳: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(500).json({
                状态码: 500,
                消息: '安全事件获取失败',
                错误详情: error.message,
                建议: '请立即检查系统安全状况'
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
                timestamp: new Date().toISOString(),
                message: '获取连接详情成功'
            });
        } catch (error: any) {
            console.error('获取连接详情失败:', error);
            res.status(500).json({
                code: 500,
                message: '获取连接详情失败',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async getReviewSystemStats(req: Request, res: Response) {
        try {
            const stats = await this.monitorService.getReviewSystemStats();
            
            // 确保始终返回标准格式
            res.json({
                code: 200,
                data: stats || {
                    total_reviews: 0,
                    reviews_today: 0,
                    active_reviews: 0,
                    deleted_reviews: 0,
                    average_rating: 0,
                    total_replies: 0,
                    review_distribution: []
                },
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
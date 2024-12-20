import { 
    SystemMetricsService,
    DatabaseMetricsService,
    ConnectionService,
    PerformanceService,
    ReviewMetricsService,
    ReviewAnalyticsService,
    SecurityService 
} from './index';

export default class MonitorService {
    private systemMetrics: SystemMetricsService;
    private databaseMetrics: DatabaseMetricsService;
    private connectionService: ConnectionService;
    private performanceService: PerformanceService;
    private reviewMetrics: ReviewMetricsService;
    private reviewAnalytics: ReviewAnalyticsService;
    private securityService: SecurityService;

    // 添加告警阈值配置
    private readonly ALERT_THRESHOLDS = {
        cpu_usage: 80,
        memory_usage: 85,
        disk_usage: 90,
        connection_usage: 80,
        slow_query_count: 10
    };

    constructor() {
        this.systemMetrics = new SystemMetricsService();
        this.databaseMetrics = new DatabaseMetricsService();
        this.connectionService = new ConnectionService();
        this.performanceService = new PerformanceService();
        this.reviewMetrics = new ReviewMetricsService();
        this.reviewAnalytics = new ReviewAnalyticsService();
        this.securityService = new SecurityService();
    }

    // 系统指标
    async getSystemMetrics() {
        return this.systemMetrics.getSystemMetrics();
    }

    async getSystemMetricsHistory(timeRange: string) {
        return this.systemMetrics.getSystemMetricsHistory(timeRange);
    }

    // 数据库指标
    async getDatabaseMetrics() {
        return this.databaseMetrics.getDatabaseMetrics();
    }

    async getDatabasePerformance() {
        return this.performanceService.getDatabasePerformance();
    }

    async getDatabasePerformanceDetails() {
        return this.performanceService.getDatabasePerformanceDetails();
    }

    // 连接状态
    async getConnectionStatus() {
        return this.connectionService.getConnectionStatus();
    }

    async getConnectionDetails() {
        return this.connectionService.getConnectionDetails();
    }

    // 性能指标
    async getPerformanceMetrics() {
        return this.performanceService.getPerformanceMetrics();
    }

    async getOptimizationSuggestions() {
        return this.performanceService.getOptimizationSuggestions();
    }

    // 评论系统指标
    async getReviewSystemMetrics() {
        return this.reviewMetrics.getReviewSystemMetrics();
    }

    async getReviewSystemAnomalies() {
        return this.reviewMetrics.getReviewSystemAnomalies();
    }

    // 评论系统分析
    async getReviewSystemStats() {
        return this.reviewAnalytics.getReviewSystemStats();
    }

    async getPartitionStatus() {
        return this.reviewAnalytics.getPartitionStatus();
    }

    // 安全事件
    async getSecurityEvents() {
        return this.securityService.getSecurityEvents();
    }

    // 监控指标保存
    async saveMonitoringMetrics() {
        return this.systemMetrics.saveMonitoringMetrics();
    }

    // 添加告警检查方法
    async checkAlerts() {
        const metrics = await this.getSystemMetrics();
        const alerts = [];

        if (metrics.cpu_usage > this.ALERT_THRESHOLDS.cpu_usage) {
            alerts.push({
                type: 'warning',
                message: `CPU使用率过高: ${metrics.cpu_usage}%`,
                timestamp: new Date()
            });
        }

        // 添加更多告警检查...

        return alerts;
    }
} 
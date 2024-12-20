import SystemMetricsService from './system/SystemMetricsService';
import DatabaseMetricsService from './database/DatabaseMetricsService';
import ConnectionService from './database/ConnectionService';
import PerformanceService from './database/PerformanceService';
import ReviewMetricsService from './review/ReviewMetricsService';
import ReviewAnalyticsService from './review/ReviewAnalyticsService';
import SecurityService from './system/SecurityService';

export default class MonitorService {
    private systemMetrics: SystemMetricsService;
    private databaseMetrics: DatabaseMetricsService;
    private connectionService: ConnectionService;
    private performanceService: PerformanceService;
    private reviewMetrics: ReviewMetricsService;
    private reviewAnalytics: ReviewAnalyticsService;
    private securityService: SecurityService;

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

    // 数据库指标
    async getDatabaseMetrics() {
        return this.databaseMetrics.getDatabaseMetrics();
    }

    // 其他方法类似...
} 
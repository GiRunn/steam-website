import axios from 'axios';

const BASE_URL = 'http://localhost:8877'; // 后端服务地址

const handleApiError = (error: any, defaultData: any) => {
    console.error('API调用失败:', error);
    return defaultData;
};

export const getSystemMetrics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/system-metrics`);
        return response.data.data;
    } catch (error) {
        return handleApiError(error, [
            { 
                metric_name: 'CPU_USAGE', 
                metric_value: 50.0, 
                metric_unit: 'PERCENT', 
                description: '默认测试数据' 
            }
        ]);
    }
};

export const getDatabaseMetrics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/database-metrics`);
        return response.data.data;
    } catch (error) {
        return handleApiError(error, [
            { 
                database_name: 'games', 
                connections_total: 10, 
                created_at: new Date().toISOString()
            }
        ]);
    }
};

export const getConnectionStatus = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/connection-status`);
        return response.data.data;
    } catch (error) {
        console.error('获取连接状态失败', error);
        return {
            total_connections: 0,
            active_connections: 0,
            idle_connections: 0,
            max_connections: 100
        };
    }
};

export const getDatabasePerformance = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/database-performance`);
        return response.data.data;
    } catch (error) {
        console.error('获取数据库性能指标失败', error);
        return {
            database_name: 'games',
            total_transactions: 0,
            transactions_per_second: 0,
            cache_hit_ratio: 0,
            index_hit_ratio: 0
        };
    }
};

export const getReviewSystemMetrics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/review-system/metrics`);
        return response.data.data;
    } catch (error) {
        console.error('获取评论系统指标失败', error);
        return {
            total_reviews: 0,
            avg_rating: 0,
            reviews_last_hour: 0,
            unique_games_reviewed: 0,
            avg_playtime: 0
        };
    }
};

export const getReviewSystemAnomalies = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/review-system/anomalies`);
        return response.data.data;
    } catch (error) {
        console.error('获取评论系统异常失败', error);
        return [];
    }
};
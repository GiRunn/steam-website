import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8877';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000
});

const handleApiError = (error: any) => {
    console.error('API调用失败:', error);
    throw error;
};

const retryRequest = async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return retryRequest(fn, retries - 1);
        }
        throw error;
    }
};

export const getSystemMetrics = () => 
    retryRequest(() => api.get('/system-metrics')
        .then(response => response.data)
        .catch(handleApiError));

export const getDatabaseMetrics = () => 
    retryRequest(() => api.get('/database-metrics')
        .then(response => response.data)
        .catch(handleApiError));

export const getConnectionStatus = async () => {
    try {
        const response = await api.get('/connection-status');
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
        const response = await api.get('/database-performance');
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
        const response = await api.get('/review-system/metrics');
        return response.data.data;
    } catch (error) {
        console.error('获取评论系统指标失败', error);
        return {
            total_reviews: 0,
            avg_rating: 0,
            reviews_last_hour: 0,
            unique_games_reviewed: 0,
            total_replies: 0,
            avg_review_length: 0
        };
    }
};

export const getReviewSystemAnomalies = async () => {
    try {
        const response = await api.get('/review-system/anomalies');
        return response.data.data;
    } catch (error) {
        console.error('获取评论系统异常失败', error);
        return [];
    }
};

export const getPartitionStatus = async () => {
    try {
        const response = await api.get('/partitions/status');
        if (response.data.code === 200) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            throw new Error(response.data.message || '获取分区状态失败');
        }
    } catch (error: any) {
        if (error.response?.status === 500) {
            // 如果是服务器错误，返回友好的错误信息
            return {
                success: false,
                data: [],
                message: error.response.data?.message || '服务器内部错误'
            };
        } else if (error.request) {
            // 如果请求未收到响应
            return {
                success: false,
                data: [],
                message: '无法连接到服务器，请检查网络连接'
            };
        } else {
            // 其他错误
            return {
                success: false,
                data: [],
                message: error.message || '请求配置错误'
            };
        }
    }
};

export const getPerformanceMetrics = async () => {
    try {
        const response = await api.get('/performance-metrics');
        return response.data.data;
    } catch (error) {
        console.error('获取性能指标失败', error);
        return {
            cache_hit_ratio: 0,
            transactions_per_second: 0,
            active_connections: 0,
            idle_connections: 0
        };
    }
};

export const getDatabasePerformanceDetails = async () => {
    try {
        const response = await api.get('/database-performance-details');
        return response.data.data || {
            query_performance: {
                avg_query_time: 0,
                cache_hit_ratio: 0
            },
            connection_stats: {
                active_connections: 0,
                idle_connections: 0,
                idle_in_transaction: 0,
                waiting_connections: 0
            },
            query_stats: []
        };
    } catch (error) {
        console.error('获取数据库性能详情失败:', error);
        return {
            query_performance: {
                avg_query_time: 0,
                cache_hit_ratio: 0
            },
            connection_stats: {
                active_connections: 0,
                idle_connections: 0,
                idle_in_transaction: 0,
                waiting_connections: 0
            },
            query_stats: []
        };
    }
};

export const getOptimizationSuggestions = async () => {
    try {
        const response = await api.get('/optimization-suggestions');
        return response.data.data || {
            slow_queries: [],
            table_suggestions: [],
            index_suggestions: []
        };
    } catch (error) {
        console.error('获取数据库优化建议失败', error);
        return {
            slow_queries: [],
            table_suggestions: [],
            index_suggestions: []
        };
    }
};

export const getSystemMetricsHistory = async (timeRange: string = '1h') => {
    try {
        const response = await api.get('/system-metrics/history', {
            params: { timeRange }
        });
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        console.error('获取系统指标历史数据失败:', error);
        return [];
    }
};
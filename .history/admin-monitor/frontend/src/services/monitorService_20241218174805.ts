import axios from 'axios';

const BASE_URL = 'http://localhost:8877'; // 后端服务地址

export const getSystemMetrics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/system-metrics`);
        return response.data.data;
    } catch (error) {
        console.error('获取系统指标失败', error);
        throw error;
    }
};

export const getDatabaseMetrics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/database-metrics`);
        return response.data.data;
    } catch (error) {
        console.error('获取数据库指标失败', error);
        throw error;
    }
};

// 新增的性能指标获取方法
export const getConnectionStatus = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/connection-status`);
        return response.data.data;
    } catch (error) {
        console.error('获取连接状态失败', error);
        throw error;
    }
};

export const getDatabasePerformance = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/database-performance`);
        return response.data.data;
    } catch (error) {
        console.error('获取数据库性能指标失败', error);
        throw error;
    }
};
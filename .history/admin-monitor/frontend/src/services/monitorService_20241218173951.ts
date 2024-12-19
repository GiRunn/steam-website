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
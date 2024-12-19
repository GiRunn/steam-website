import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8877';
const REFRESH_INTERVAL = parseInt(process.env.REACT_APP_MONITOR_REFRESH_INTERVAL || '30000');

export const getSystemMetrics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/system-metrics`);
        return response.data.data || [];
    } catch (error) {
        console.error('获取系统指标失败', error);
        return [];
    }
};

export const getDatabaseMetrics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/database-metrics`);
        return response.data.data || [];
    } catch (error) {
        console.error('获取数据库指标失败', error);
        return [];
    }
};

export { REFRESH_INTERVAL }; 
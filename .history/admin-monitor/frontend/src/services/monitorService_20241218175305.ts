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
                created_at: new Date().toISOString()
            }
        ]);
    }
};

export const getSystemAnomalies = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/system-anomalies`);
        return response.data.data;
    } catch (error) {
        return handleApiError(error, []);
    }
};
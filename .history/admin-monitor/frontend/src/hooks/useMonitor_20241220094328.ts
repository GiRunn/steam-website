import { useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8877';

export const useMonitor = () => {
  const getReviewSystemMetrics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/review-system/metrics`);
      return response.data.data;
    } catch (error) {
      console.error('获取评论系统指标失败:', error);
      throw error;
    }
  }, []);

  const getReviewSystemStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/review-system/stats`);
      return response.data.data;
    } catch (error) {
      console.error('获取评论系统统计失败:', error);
      throw error;
    }
  }, []);

  return {
    getReviewSystemMetrics,
    getReviewSystemStats
  };
};

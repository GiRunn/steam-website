// src/pages/store/activity-detail/hooks/useActivityData.js
import { useState, useEffect } from 'react';
import { fetchActivityDetail } from '../services/api';

export const useActivityData = (activityId) => {
  const [activityData, setActivityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadActivityData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchActivityDetail(activityId);
        setActivityData(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivityData();
  }, [activityId]);

  return { activityData, isLoading, error };
};
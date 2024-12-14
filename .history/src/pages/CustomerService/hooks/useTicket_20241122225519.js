// E:\Steam\steam-website\src\pages\CustomerService\hooks\useTicket.js
import { useState } from 'react';
import { ticketTypes } from '../constants/ticketConfig';

export const useTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTicket = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // API调用实现
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = (data) => {
    const errors = {};
    if (!data.type || !ticketTypes.includes(data.type)) {
      errors.type = '请选择工单类型';
    }
    if (!data.title?.trim()) {
      errors.title = '请输入工单标题';
    }
    if (!data.content?.trim()) {
      errors.content = '请输入工单内容';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return {
    loading,
    error,
    createTicket,
    validateTicket
  };
};
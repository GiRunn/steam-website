import axios, { isAxiosError } from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8877',  // 后端基础 URL
  timeout: 10000,  // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 对响应数据做更详细的处理
    if (response.data && response.data.code === 200) {
      return response.data.data || response.data;
    }
    
    // 如果响应不符合预期，尝试返回原始响应
    return response;
  },
  error => {
    // 对响应错误做些什么
    console.error('请求错误:', error);
    
    // 尝试从错误响应中提取有用信息
    if (isAxiosError(error) && error.response) {
      console.error('错误详情:', error.response.data);
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export { isAxiosError };  // 导出 isAxiosError
export default instance; 
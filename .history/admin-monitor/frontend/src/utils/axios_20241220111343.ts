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
    // 对响应数据做些什么
    return response.data;
  },
  error => {
    // 对响应错误做些什么
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

export { isAxiosError };  // 导出 isAxiosError
export default instance; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemeStyles } from './themeConfig';

// 创建主题上下文
const ThemeContext = createContext();

// 主题提供者组件
export const ThemeProvider = ({ children }) => {
  // 默认使用深色模式
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // 获取当前主题样式
  const theme = getThemeStyles(isDarkMode);
  
  // 切换主题模式
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    // 保存主题偏好到本地存储
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };
  
  // 初始化时从本地存储加载主题偏好
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // 如果没有保存的偏好，则根据系统偏好设置
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义钩子，用于在组件中访问主题
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 
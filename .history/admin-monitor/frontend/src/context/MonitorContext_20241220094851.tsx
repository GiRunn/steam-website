import React, { createContext, useContext } from 'react';
import { useMonitor } from '../hooks/useMonitor';

// 定义监控数据的类型
interface MonitorData {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_status: string;
  uptime: number;
}

// 定义上下文的类型
interface MonitorContextType {
  data: MonitorData | null;
  loading: boolean;
  error: string | null;
}

const MonitorContext = createContext<MonitorContextType | undefined>(undefined);

export const MonitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用 useMonitor hook 并提供 endpoint
  const monitorData = useMonitor<MonitorData>('/api/monitor/system');
  
  return (
    <MonitorContext.Provider value={monitorData}>
      {children}
    </MonitorContext.Provider>
  );
};

export const useMonitorContext = () => {
  const context = useContext(MonitorContext);
  if (!context) {
    throw new Error('useMonitorContext must be used within MonitorProvider');
  }
  return context;
}; 
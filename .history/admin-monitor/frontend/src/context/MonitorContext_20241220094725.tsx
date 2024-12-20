import React, { createContext, useContext, ReactNode } from 'react';

interface MonitorContextType {
  apiUrl: string;
  refreshInterval: number;
}

const MonitorContext = createContext<MonitorContextType>({
  apiUrl: process.env.REACT_APP_API_URL || '',
  refreshInterval: 30000,
});

interface MonitorProviderProps {
  children: ReactNode;
  apiUrl?: string;
  refreshInterval?: number;
}

export const MonitorProvider: React.FC<MonitorProviderProps> = ({
  children,
  apiUrl = process.env.REACT_APP_API_URL || '',
  refreshInterval = 30000,
}) => {
  return (
    <MonitorContext.Provider value={{ apiUrl, refreshInterval }}>
      {children}
    </MonitorContext.Provider>
  );
};

export const useMonitorContext = () => useContext(MonitorContext); 
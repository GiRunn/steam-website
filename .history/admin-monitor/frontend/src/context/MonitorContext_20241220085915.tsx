import React, { createContext, useContext } from 'react';
import { useMonitor } from '../hooks/useMonitor';

const MonitorContext = createContext<ReturnType<typeof useMonitor> | undefined>(undefined);

export const MonitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const monitorData = useMonitor();
  
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
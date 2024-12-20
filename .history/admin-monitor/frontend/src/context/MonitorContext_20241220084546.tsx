// 监控上下文
export const MonitorContext = createContext({});

export const MonitorProvider = ({ children }) => {
  const monitorState = useMonitor();
  
  return (
    <MonitorContext.Provider value={monitorState}>
      {children}
    </MonitorContext.Provider>
  );
}; 
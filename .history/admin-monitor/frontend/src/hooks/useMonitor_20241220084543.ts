// 监控数据Hook
export const useMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  
  const fetchMetrics = async () => {
    const data = await MonitorAPI.getSystemMetrics();
    setMetrics(data);
  };

  return {
    metrics,
    fetchMetrics
  };
}; 
// 系统监控页面
const SystemMonitor = () => {
  const { metrics, fetchMetrics } = useMonitor();
  
  return (
    <div className="system-monitor">
      <MetricsOverview metrics={metrics} />
      <DatabaseStatus />
      <ReviewSystem />
    </div>
  );
}; 
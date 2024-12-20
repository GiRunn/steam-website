import React from 'react';
import { DatabaseMonitor, SystemMonitor, ReviewSystemMonitor } from '../../Monitoring';
import './styles.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>管理员监控系统</h1>
      </div>
      <div className="dashboard-content">
        <SystemMonitor />
        <DatabaseMonitor />
        <ReviewSystemMonitor />
      </div>
    </div>
  );
};

export default DashboardLayout; 
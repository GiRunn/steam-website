import React from 'react';
import { motion } from 'framer-motion';
import './MonitorLayout.css';

interface MonitorLayoutProps {
  children: React.ReactNode;
}

const MonitorLayout: React.FC<MonitorLayoutProps> = ({ children }) => {
  return (
    <div className="monitor-layout">
      <header className="monitor-header">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="monitor-title"
        >
          Steam 系统监控中心
        </motion.h1>
      </header>
      <main className="monitor-content">
        {children}
      </main>
    </div>
  );
};

export default MonitorLayout; 
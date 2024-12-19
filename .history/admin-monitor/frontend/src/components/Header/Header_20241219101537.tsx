import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

export interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, onThemeToggle, onMenuClick }) => {
  return (
    <header className="main-header">
      <motion.button
        className="menu-button"
        onClick={onMenuClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fas fa-bars"></i>
      </motion.button>
      
      <div className="header-title">
        <h1>管理员监控系统</h1>
      </div>
      
      <motion.button
        className="theme-toggle"
        onClick={onThemeToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className={`fas fa-${isDark ? 'sun' : 'moon'}`}></i>
      </motion.button>
    </header>
  );
};

export default Header; 
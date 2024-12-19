import React from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <motion.button 
      className="theme-toggle"
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div 
        className="toggle-icon"
        animate={{ rotate: isDark ? 180 : 0 }}
      >
        <i className={`fas fa-${isDark ? 'moon' : 'sun'}`}></i>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle; 
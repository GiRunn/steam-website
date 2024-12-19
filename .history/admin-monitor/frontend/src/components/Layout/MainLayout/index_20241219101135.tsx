import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../Header';
import Sidebar from '../Sidebar';
import './styles.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return (
    <div className={`main-layout ${isDark ? 'dark' : 'light'}`}>
      <Header 
        onMenuClick={toggleSidebar}
        isDark={isDark}
        onThemeToggle={toggleTheme}
      />
      
      <div className="layout-container">
        <AnimatePresence mode='wait'>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="sidebar-wrapper"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.main 
          className="main-content"
          layout
          transition={{ duration: 0.3 }}
        >
          <div className="content-wrapper glass-effect">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default MainLayout; 
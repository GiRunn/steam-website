import React, { useState } from 'react';
import { Header } from '../../';
import { MainLayoutProps } from './types';
import './styles.css';

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`main-layout ${isDark ? 'dark' : 'light'}`}>
      <Header 
        onMenuClick={toggleSidebar}
        isDark={isDark}
        onThemeToggle={toggleTheme}
      />
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 
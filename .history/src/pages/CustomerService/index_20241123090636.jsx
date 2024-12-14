// src/pages/CustomerService/index.jsx
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './constants/Header';
import Statistics from './constants/Statistics';
import FAQSection from './constants/FAQSection';
import OnlineService from './constants/OnlineService';
import TicketService from './constants/TicketService';
import { CreateTicketDialog } from './constants/CreateTicket';

/**
 * 客服中心主页面
 * 整合所有客服相关功能模块
 */
const CustomerService = () => {
  const { darkMode, toggleDarkMode, locale, toggleLocale } = useTheme();
  const [showCreateTicket, setShowCreateTicket] = React.useState(false);

  // 处理工单创建对话框
  const handleOpenTicket = () => {
    setShowCreateTicket(true);
  };

  const handleCloseTicket = () => {
    setShowCreateTicket(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      {/* 导航栏 */}
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />
      
      <Suspense fallback={<LoadingScreen />}>
        <main className="container mx-auto px-4 py-8">
          {/* 头部区域 */}
          <Header />

          {/* 统计数据 */}
          <Statistics />
          
          {/* 主要内容区域 */}
          <div className="grid grid-cols-3 gap-8">
            {/* FAQ区域 */}
            <FAQSection className="col-span-2" />

            {/* 服务入口区域 */}
            <div className="space-y-6">
              {/* 工单服务入口 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={handleOpenTicket}
              >
                <TicketService />
              </motion.div>

              {/* 在线客服入口 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <OnlineService />
              </motion.div>
            </div>
          </div>
        </main>
      </Suspense>

      {/* 工单创建对话框 */}
      {showCreateTicket && (
        <CreateTicketDialog onClose={handleCloseTicket} />
      )}

      {/* 页脚 */}
      <Footer 
        darkMode={darkMode}
        locale={locale}
      />
    </div>
  );
};

export default CustomerService;
// src/pages/CustomerService/index.jsx
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './components/Header';  // 修改引入路径
import Statistics from './components/Statistics';  // 修改引入路径
import FAQSection from './components/FAQSection';  // 修改引入路径
import OnlineService from './components/OnlineService';  // 修改引入路径
import TicketService from './components/TicketService';  // 修改引入路径
import { CreateTicketDialog } from './components/CreateTicket';  // 修改引入路径

/**
 * 客服中心主页面
 */
const CustomerService = () => {
  const { darkMode, toggleDarkMode, locale, toggleLocale } = useTheme();
  const [showCreateTicket, setShowCreateTicket] = React.useState(false);

  // 处理工单创建对话框
  const handleOpenTicket = () => setShowCreateTicket(true);
  const handleCloseTicket = () => setShowCreateTicket(false);

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />
      
      <Suspense fallback={<LoadingScreen />}>
        <main className="container mx-auto px-4 py-8">
          <Header />
          <Statistics />
          
          <div className="grid grid-cols-3 gap-8">
            <FAQSection className="col-span-2" />
            <div className="space-y-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={handleOpenTicket}
                className="w-full"
              >
                <TicketService />
              </motion.button>

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

      {showCreateTicket && (
        <CreateTicketDialog onClose={handleCloseTicket} />
      )}

      <Footer 
        darkMode={darkMode}
        locale={locale}
      />
    </div>
  );
};

export default CustomerService;
// E:\Steam\steam-website\src\pages\CustomerService\index.jsx
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './constants/Header';  // 修改
import Statistics from './constants/Statistics';  // 修改
import FAQSection from './constants/FAQSection';  // 修改
import ContactSection from './constants/ContactSection';  // 修改
import { CreateTicketDialog } from './constants/CreateTicket';  // 修改


const CustomerService = () => {
  const { darkMode, toggleDarkMode, locale, toggleLocale } = useTheme();
  const [showCreateTicket, setShowCreateTicket] = React.useState(false);

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
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6"
                onClick={() => setShowCreateTicket(true)}
              >
                <ContactSection />
              </motion.div>
            </div>
          </div>
        </main>
      </Suspense>

      {showCreateTicket && (
        <CreateTicketDialog onClose={() => setShowCreateTicket(false)} />
      )}

      <Footer 
        darkMode={darkMode}
        locale={locale}
      />
    </div>
  );
};

export default CustomerService;
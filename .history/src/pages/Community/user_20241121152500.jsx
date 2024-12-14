// src/pages/Community/user.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';

const CommunityUser = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  const { id } = useParams(); // 获取用户ID

  return (
    <div className="min-h-screen bg-[#0a0f16]">
      <Navbar 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />
      <main className="container mx-auto px-4 py-8">
        <h1>用户主页: {id}</h1>
        {/* 用户信息将在此实现 */}
      </main>
      <Footer
        darkMode={darkMode}
        showVideo={false}
        setShowVideo={() => {}}
        showScrollTop={false}
        t={locale === 'zh' ? require('@/locales/zh').default : require('@/locales/en').default}
      />
    </div>
  );
};

export default CommunityUser;
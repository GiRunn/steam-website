// src/pages/store/activity-detail/components/MediaGallery/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Gift, Ticket, LayoutGrid, X } from 'lucide-react';
import styles from './styles.module.css';

const TabButton = ({ active, icon, label, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`relative px-6 py-3 rounded-lg flex items-center gap-2 transition-all
      ${active ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20"
        initial={false}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10">{icon}</span>
    <span className="relative z-10 font-medium">{label}</span>
  </motion.button>
);

const MediaGallery = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('promotion');

  const tabs = [
    {
      id: 'promotion',
      label: '活动宣传',
      icon: <LayoutGrid className="w-4 h-4" />
    },
    {
      id: 'products',
      label: '参与商品',
      icon: <Gift className="w-4 h-4" />
    },
    {
      id: 'coupons',
      label: '优惠券',
      icon: <Ticket className="w-4 h-4" />
    }
  ];

  const getOverlayContent = (item, type) => {
    switch(type) {
      case 'promotion':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
            <p className="text-sm text-gray-300">{item.description}</p>
          </motion.div>
        );
      case 'products':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-gray-400 line-through">¥{item.price}</span>
              <span className="text-lg font-bold text-purple-400">¥{item.discountPrice}</span>
            </div>
          </motion.div>
        );
      case 'coupons':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-purple-400 mb-2">{item.value}</div>
            <p className="text-sm text-gray-300">{item.conditions}</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-6 py-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-2xl overflow-hidden"
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[#1a1f2b] opacity-90">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
        </div>

        {/* 主要内容区 */}
        <div className="relative p-8">
          {/* 顶部装饰线 */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[2px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500" />
          </motion.div>

          {/* 标题 */}
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-8"
          >
            活动详情
          </motion.h2>

          {/* 标签切换 */}
          <div className="flex gap-4 mb-8 px-4">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* 内容展示区域 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4"
            >
              {data[activeTab]?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  {/* 发光效果 */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
                  
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2b] via-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {getOverlayContent(item, activeTab)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative max-w-4xl w-full mx-4 p-4 rounded-2xl overflow-hidden bg-[#1a1f2b]"
              onClick={e => e.stopPropagation()}
            >
              {/* 背景效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
              
              <div className="relative">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full rounded-xl"
                />
                <div className="mt-4">
                  {getOverlayContent(selectedImage, activeTab)}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
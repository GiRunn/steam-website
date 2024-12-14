// src/pages/store/activity-detail/components/MediaGallery/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, Gift, Ticket, LayoutGrid, X, 
  Calendar, Users, ShoppingCart, Star,
  Wallet, BadgePercent, Timer
} from 'lucide-react';

import { MOCK_GAMES } from '../../../constants';

// TabButton 组件 - 改进样式和动画效果
const TabButton = ({ active, icon, label, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`relative px-8 py-4 rounded-xl flex items-center gap-3 transition-all
      ${active ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-pink-500/30 backdrop-blur-sm"
        initial={false}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 text-lg">{icon}</span>
    <span className="relative z-10 font-semibold tracking-wide">{label}</span>
  </motion.button>
);

// 活动宣传卡片组件 - 增强视觉效果
const PromotionCard = ({ item, onClick }) => {
  const statusColors = {
    ongoing: "from-emerald-400 to-teal-500",
    upcoming: "from-blue-400 to-indigo-500",
    ended: "from-gray-400 to-slate-500"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-lg"
      onClick={onClick}
    >
      {/* 光晕效果 */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-300" />
      
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
          <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full bg-gradient-to-r ${statusColors[item.status]} text-white text-sm font-medium shadow-lg`}>
            {item.statusText}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-fuchsia-300 transition-colors">
            {item.title}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2.5 text-gray-300">
              <Calendar className="w-5 h-5 text-fuchsia-400" />
              <span className="text-sm font-medium">{item.date}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Users className="w-5 h-5 text-fuchsia-400" />
              <span className="text-sm font-medium">{item.participants}人参与</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// 商品卡片组件 - 增强视觉吸引力
const ProductCard = ({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-lg"
      onClick={onClick}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-300" />
      
      <div className="relative">
        <div className="aspect-w-1 aspect-h-1 relative overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          {item.discount > 0 && (
            <div className="absolute top-4 right-4 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white font-bold text-lg shadow-lg">
              -{item.discount}%
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-fuchsia-300 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-fuchsia-400">¥{item.price}</span>
            <span className="text-sm text-gray-400 line-through">¥{item.originalPrice}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-gray-200 font-medium">{item.rating}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ShoppingCart className="w-5 h-5 text-fuchsia-400" />
              <span className="font-medium">{item.reviews?.total || 0}已售</span>
            </div>
          </div>
          {item.tags && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-gray-700/50 text-sm text-gray-200 font-medium backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// 优惠券卡片组件 - 改进视觉层次和交互
const CouponCard = ({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-lg"
      onClick={onClick}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-300" />
      
      <div className="relative p-6">
        <div className="flex items-stretch">
          {/* 左侧金额 */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 border-r border-gray-700/50">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">
              {item.value}
            </span>
            <span className="text-sm text-gray-300 mt-2 font-medium">{item.type}</span>
          </div>
          
          {/* 右侧信息 */}
          <div className="flex-[2] pl-6">
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-fuchsia-300 transition-colors">
              {item.title}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-gray-300">
                <Timer className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-medium">有效期至: {item.expireDate}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Wallet className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-medium">满{item.minAmount}可用</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部条件说明 */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-gray-300">
              <BadgePercent className="w-5 h-5 text-fuchsia-400" />
              <span className="text-sm font-medium">{item.conditions}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-fuchsia-500/25 transition-shadow"
            >
              立即领取
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 主组件 - 优化整体布局和动画
const MediaGallery = ({ data, activityId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('promotion');

  const getActivityProducts = () => {
    return MOCK_GAMES.filter(game => 
      Number(game.activityId) === Number(activityId)
    );
  };

  const tabs = [
    {
      id: 'promotion',
      label: '活动宣传',
      icon: <LayoutGrid className="w-5 h-5" />,
      component: PromotionCard
    },
    {
      id: 'products',
      label: '参与商品',
      icon: <Gift className="w-5 h-5" />,
      component: ProductCard
    },
    {
      id: 'coupons',
      label: '优惠券',
      icon: <Ticket className="w-5 h-5" />,
      component: CouponCard
    }
  ];

  const CurrentCard = tabs.find(tab => tab.id === activeTab)?.component;
  const currentData = activeTab === 'products' ? getActivityProducts() : data[activeTab];
  const showEmptyState = activeTab === 'products' && (!currentData || currentData.length === 0);

  return (
    <div className="w-full px-8 py-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-3xl overflow-hidden"
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-transparent" />
        </div>

        {/* 主要内容区 */}
        <div className="relative p-8">
          {/* 顶部装饰线 */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[2px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          </motion.div>

          {/* 标题 */}
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 mb-12"
          >
            活动详情
          </motion.h2>

          {/* 标签切换 */}
          <div className="flex gap-6 mb-12 px-4">
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4"
            >
              {showEmptyState
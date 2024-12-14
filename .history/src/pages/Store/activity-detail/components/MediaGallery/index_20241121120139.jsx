import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Gift, Ticket, LayoutGrid, X, 
  Calendar, Users, 
  ShoppingCart, Star,
  Wallet, BadgePercent, Timer
} from 'lucide-react';

import { MOCK_GAMES } from '../../../constants';

// TabButton 组件
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

// 商品卡片组件
const ProductCard = ({ item }) => {
  return (
  <Link to={`/store/game/${item.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="group relative rounded-xl overflow-hidden cursor-pointer bg-[#1c2127]"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
        
        <div className="relative">
          <div className="aspect-w-1 aspect-h-1 relative">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {item.discount > 0 && (
              <div className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center rounded-full bg-purple-500 text-white font-bold">
                -{item.discount}%
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-purple-400">¥{item.price}</span>
              <span className="text-sm text-gray-400 line-through">¥{item.originalPrice}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-300 text-sm">{item.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <ShoppingCart className="w-4 h-4" />
                <span>{item.reviews?.total || 0}已售</span>
              </div>
            </div>
            {item.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {item.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 rounded-full bg-[#2a2f3a] text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// 优惠券卡片组件
const CouponCard = ({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="group relative rounded-xl overflow-hidden cursor-pointer bg-[#1c2127]"
      onClick={onClick}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
      
      <div className="relative p-4">
        <div className="flex items-stretch">
          <div className="flex-1 flex flex-col items-center justify-center p-4 border-r border-gray-700">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {item.value}
            </span>
            <span className="text-sm text-gray-400 mt-1">{item.type}</span>
          </div>
          
          <div className="flex-[2] pl-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              {item.title}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Timer className="w-4 h-4" />
                <span>有效期至: {item.expireDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Wallet className="w-4 h-4" />
                <span>满{item.minAmount}可用</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <BadgePercent className="w-4 h-4" />
              <span>{item.conditions}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium"
            >
              立即领取
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 主组件
const MediaGallery = ({ data, activityId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  // 活动商品筛选函数
  const getActivityProducts = () => {
    return MOCK_GAMES.filter(game => 
      Number(game.activityId) === Number(activityId)
    );
  };

  const tabs = [
    {
      id: 'products',
      label: '参与商品',
      icon: <Gift className="w-4 h-4" />,
      component: ProductCard
    },
    {
      id: 'coupons',
      label: '优惠券',
      icon: <Ticket className="w-4 h-4" />,
      component: CouponCard
    }
  ];

  // 获取当前标签页对应的组件和数据
  const CurrentCard = tabs.find(tab => tab.id === activeTab)?.component;
  const currentData = activeTab === 'products' ? getActivityProducts() : data[activeTab];

  // 如果是商品标签且没有数据，显示空状态
  const showEmptyState = activeTab === 'products' && (!currentData || currentData.length === 0);

  return (
    <div className="w-full px-6 py-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#1a1f2b] opacity-90">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
        </div>

        <div className="relative p-8">
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[2px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-8"
          >
            活动详情
          </motion.h2>

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

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4"
            >
              {showEmptyState ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                  <Gift className="w-12 h-12 mb-4" />
                  <p className="text-lg">该活动暂无参与商品</p>
                </div>
              ) : (
                currentData?.map((item, index) => (
                  <CurrentCard
                    key={index}
                    item={item}
                    onClick={() => setSelectedImage(item)}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
              
              <div className="relative">
                <img
                  src={selectedImage.imageUrl || selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full rounded-xl"
                />
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
// src/components/EventSection/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Bell, ArrowRight } from 'lucide-react';
import { getActivityPreviews } from '../../activity-detail/utils/constants';  // 修改导入路径

// EventCard 子组件 - 保持原有的精致设计
const EventCard = ({ event, onSubscribe }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative bg-[#0a0f16] rounded-xl overflow-hidden shadow-sm border border-[#1a2030]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* 修改为新的活动详情页路由 */}
      <Link to={`/store/activity/${event.id}`} className="block">
        <div className="relative aspect-[2/1] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f16] to-[#141b26] animate-pulse" />
          )}
          <motion.img
            src={event.imageUrl} // 修改这里以匹配constants.js中的数据结构
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-transparent opacity-70" />
        </div>

        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <motion.h3 
              className="text-[1.5rem] font-semibold text-white line-clamp-1 pr-3"
            >
              {event.title}
            </motion.h3>
            <motion.button
              className="p-1.5 bg-[#3b82f6] hover:bg-blue-600 rounded-full shadow-lg transition-colors flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSubscribe(event.id);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={14} className="text-white" />
            </motion.button>
          </div>
          
          <p className="text-[1.5rem] text-[#9ca3af] line-clamp-2 mb-3 min-h-[2.5rem]">
            {event.description}
          </p>

          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#3b82f6]" />
              <span className="text-[1.5rem] text-[#9ca3af]">{event.date || event.startDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#3b82f6]" />
              <span className="text-[1.5rem] text-[#9ca3af]">
                ¥{event.price} 起
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// 主组件 - 保持原有的布局结构
const EventSection = () => {
  const [showAll, setShowAll] = useState(false);
  const activities = getActivityPreviews();
  const displayedActivities = showAll ? activities : activities.slice(0, 2);
  
  const handleSubscribe = (eventId) => {
    console.log('Subscribe to event:', eventId);
  };

  return (
    <div className="filter-section">
      <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-[#1a2030]">
        <h2 className="text-[2rem] font-bold text-white">
          活动专区
        </h2>
        {!showAll ? (
          <button 
            onClick={() => setShowAll(true)}
            className="group flex items-center gap-2 text-base text-[#9ca3af] hover:text-[#3b82f6] transition-colors"
          >
            查看全部活动
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {activities?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {displayedActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EventCard 
                  event={activity} 
                  onSubscribe={() => handleSubscribe(activity.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 text-[#9ca3af]"
          >
            <p className="text-lg">暂无活动</p>
            <p className="text-base mt-2">敬请期待更多精彩内容</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showAll && activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8 text-[#9ca3af] text-base"
        >
          已加载全部活动内容
        </motion.div>
      )}
    </div>
  );
};

export default EventSection;
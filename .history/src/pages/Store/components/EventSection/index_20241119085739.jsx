// src/components/EventSection/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Bell, ArrowRight } from 'lucide-react';

// EventCard 子组件
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
      <Link to={`/event/${event.id}`} className="block">
        <div className="relative aspect-[2/1] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f16] to-[#141b26] animate-pulse" />
          )}
          <motion.img
            src={event.image}
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
              className="text-[0.938rem] font-semibold text-white line-clamp-1 pr-3"
            >
              {event.title}
            </motion.h3>
            <motion.button
              className="p-1.5 bg-[#3b82f6] hover:bg-blue-600 rounded-full shadow-lg transition-colors flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSubscribe();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={14} className="text-white" />
            </motion.button>
          </div>
          
          <p className="text-[0.813rem] text-[#9ca3af] line-clamp-2 mb-3 min-h-[2.5rem]">
            {event.description}
          </p>

          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#3b82f6]" />
              <span className="text-[0.813rem] text-[#9ca3af]">{event.startDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#3b82f6]" />
              <span className="text-[0.813rem] text-[#9ca3af]">{event.endDate}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// 主组件
const EventSection = ({ events }) => {
  const handleSubscribe = (eventId) => {
    console.log('Subscribe to event:', eventId);
  };

  return (
    <div className="filter-section"> {/* 使用与 FilterSection 相同的类名来继承样式 */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-[#1a2030]"> {/* 匹配 filter-title 的样式 */}
        <h2 className="text-[1.125rem] font-semibold text-white">
          即将开始的活动
        </h2>
        <Link 
          to="/events" 
          className="group flex items-center gap-1.5 text-[0.813rem] text-[#9ca3af] hover:text-[#3b82f6] transition-colors"
        >
          查看全部活动
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <AnimatePresence>
        {events?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onSubscribe={() => handleSubscribe(event.id)}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-6 text-[#9ca3af]"
          >
            <p className="text-[0.938rem]">暂无活动</p>
            <p className="text-[0.813rem] mt-1">敬请期待更多精彩内容</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventSection;
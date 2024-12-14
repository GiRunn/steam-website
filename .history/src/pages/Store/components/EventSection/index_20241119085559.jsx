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
      className="relative bg-[#151c28] rounded-xl overflow-hidden shadow-lg w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={`/event/${event.id}`} className="block">
        <div className="relative aspect-[2/1] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#151c28] to-[#1a2435] animate-pulse" />
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

        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <motion.h3 
              className="text-base font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors flex-1 pr-4"
            >
              {event.title}
            </motion.h3>
            <motion.button
              className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition-colors flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSubscribe();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={16} className="text-white" />
            </motion.button>
          </div>
          
          <p className="text-sm text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
            {event.description}
          </p>

          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar size={14} className="text-blue-500" />
              <span>{event.startDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock size={14} className="text-blue-500" />
              <span>{event.endDate}</span>
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
    <motion.section
      className="w-full bg-[#0a0f16]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="filter-section"> {/* 使用与 FilterSection 相同的类名 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
            即将开始的活动
          </h2>
          <Link 
            to="/events" 
            className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors"
          >
            查看全部活动
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <AnimatePresence>
          {events?.length > 0 ? (
            <div className="grid grid-cols-2.5 gap-4">
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
              className="flex flex-col items-center justify-center py-8 text-gray-400"
            >
              <p className="text-base">暂无活动</p>
              <p className="text-sm mt-1.5">敬请期待更多精彩内容</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default EventSection;
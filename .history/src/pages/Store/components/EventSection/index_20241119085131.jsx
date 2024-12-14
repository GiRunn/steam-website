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
      className="relative bg-[#151c28] rounded-xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={`/event/${event.id}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
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

        <div className="p-4 space-y-3">
          <motion.h3 
            className="text-lg font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors"
          >
            {event.title}
          </motion.h3>
          
          <p className="text-sm text-gray-400 line-clamp-2">
            {event.description}
          </p>

          <div className="flex justify-between items-center pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={16} className="text-blue-500" />
                <span>{event.startDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={16} className="text-blue-500" />
                <span>{event.endDate}</span>
              </div>
            </div>
            <motion.button
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition-colors"
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
      className="py-12 px-4 bg-[#0a0f16]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
            即将开始的活动
          </h2>
          <Link 
            to="/events" 
            className="group flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            查看全部活动
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <AnimatePresence>
          {events?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className="flex flex-col items-center justify-center py-12 text-gray-400"
            >
              <p className="text-lg">暂无活动</p>
              <p className="text-sm mt-2">敬请期待更多精彩内容</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default EventSection;
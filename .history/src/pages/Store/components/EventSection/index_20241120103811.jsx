// src/components/EventSection/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Bell, ArrowRight } from 'lucide-react';
import { getActivityPreviews } from '../../constants';

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
const EventSection = () => {
  const activities = getActivityPreviews();

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">近期活动</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#1a1f26] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
            >
              <Link to={`/store/activity/${activity.id}`}>
                <div className="relative aspect-video">
                  <img
                    src={activity.thumbnailUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                  <div className="space-y-2 text-gray-400">
                    <p>日期：{activity.date}</p>
                    <p>地点：{activity.location}</p>
                    <p className="text-blue-500 font-semibold">
                      起价：¥{activity.price}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventSection;
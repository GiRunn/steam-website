// src/pages/Store/components/EventSection/EventCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Tag } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { decryptData } from '@/utils/encryption';

const EventCard = ({ event, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // 处理订阅逻辑
    console.log('Subscribed to event:', decryptData(event.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <Link to={`/event/${event.id}`} className="block">
        <div className="relative bg-[#1a1f2e] rounded-xl overflow-hidden">
          {/* 图片容器 */}
          <div className="relative aspect-[2/1] overflow-hidden">
            <motion.img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              loading="lazy"
              animate={{
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent opacity-60" />
          </div>

          {/* 内容区域 */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {event.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 标题和描述 */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
              {event.description}
            </p>

            {/* 活动信息 */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{event.startDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{event.startTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{event.participantsCount.toLocaleString()}人参与</span>
              </div>
            </div>

            {/* 奖励信息 */}
            <div className="mt-4 flex gap-2">
              {event.rewards.map((reward, i) => (
                <Tooltip 
                  key={i}
                  content={
                    reward.type === 'discount' ? '折扣优惠' : 
                    reward.type === 'coupon' ? '优惠券' : '奖励'
                  }
                >
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {reward.value}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* 订阅按钮 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.9 }}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 
          text-white rounded-lg shadow-lg transform transition-all duration-200"
        onClick={handleSubscribe}
      >
        订阅提醒
      </motion.button>
    </motion.div>
  );
};

export default EventCard;
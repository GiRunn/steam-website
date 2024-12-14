import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ACTIVITIES_DATA, getActivityStatus } from '../../utils/constants';

// 图片加载组件
const ActivityImage = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#2a2f3a] to-[#1c2127]">
      {(isLoading || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-500" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading || hasError ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

// 状态样式组件
const getStatusStyle = (status) => {
  switch(status) {
    case 'ongoing':
      return {
        background: 'bg-gradient-to-r from-green-500 to-emerald-500',
        text: '进行中'
      };
    case 'upcoming':
      return {
        background: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        text: '即将开始'
      };
    default:
      return {
        background: 'bg-gradient-to-r from-gray-500 to-gray-400',
        text: '已结束'
      };
  }
};

// 活动卡片组件
const ActivityCard = ({ activity, onClick }) => {
  const status = getActivityStatus(activity.info.startTime, activity.info.endTime);
  const statusStyle = getStatusStyle(status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-[32px] overflow-hidden cursor-pointer bg-[#1c2127]"
      onClick={onClick}
    >
      <div className="absolute -inset-0.5 bg-white/10 rounded-[32px] opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="aspect-[2/1] relative rounded-t-[32px] overflow-hidden">
          <ActivityImage 
            src={activity.banner.imageUrl}
            alt={activity.banner.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c2127] to-transparent opacity-60" />
          <div className={`absolute top-4 right-4 px-4 py-2 rounded-full ${statusStyle.background} text-white text-sm font-medium`}>
            {statusStyle.text}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">
            {activity.banner.title}
          </h3>
          <p className="text-gray-300 text-base mb-4">
            {activity.banner.subtitle}
          </p>
          
          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {activity.info.startTime.split(' ')[0]} - {activity.info.endTime.split(' ')[0]}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            查看详情
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// 主组件
const RelatedActivities = () => {
  const navigate = useNavigate();
  const { id: currentActivityId } = useParams();

  // 过滤掉当前活动
  const relatedActivities = ACTIVITIES_DATA.filter(
    activity => activity.id !== Number(currentActivityId)
  );

  const handleActivityClick = (activityId) => {
    navigate(`/store/activity/${activityId}`);
  };

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
            更多活动
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {relatedActivities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onClick={() => handleActivityClick(activity.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default RelatedActivities;
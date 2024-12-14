import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { ACTIVITIES_DATA, getActivityStatus } from '../../utils/constants';

const RelatedActivities = ({ currentActivityId }) => {
  // 过滤掉当前活动
  const relatedActivities = ACTIVITIES_DATA.filter(
    activity => activity.id !== Number(currentActivityId)
  );

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

        <div className="relative p-8">
          {/* 顶部装饰线 */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {relatedActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-[#1c2127]"
                >
                  {/* 发光效果 */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
                  
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-9 relative">
                      <img
                        src={activity.banner.imageUrl}
                        alt={activity.banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c2127] to-transparent" />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${
                        getActivityStatus(activity.info.startTime, activity.info.endTime) === 'ongoing'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : getActivityStatus(activity.info.startTime, activity.info.endTime) === 'upcoming'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-r from-gray-500 to-gray-400'
                      } text-white text-sm font-medium`}>
                        {getActivityStatus(activity.info.startTime, activity.info.endTime) === 'ongoing'
                          ? '进行中'
                          : getActivityStatus(activity.info.startTime, activity.info.endTime) === 'upcoming'
                          ? '即将开始'
                          : '已结束'
                        }
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-1">
                        {activity.banner.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                        {activity.banner.subtitle}
                      </p>
                      
                      <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {activity.info.startTime.split(' ')[0]} - {activity.info.endTime.split(' ')[0]}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium"
                      >
                        查看详情
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default RelatedActivities;
// E:\Steam\steam-website\src\pages\OnlineSupport\components\UserInfo.jsx
// 用户信息组件 - 展示客服人员信息,采用动态渐变背景和平滑过渡动画

import React from 'react';
import { User, Star, Clock, ThumbsUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion'; // 需要添加framer-motion依赖
import { Tooltip } from '../../../components/ui/Tooltip';

// 头像组件
const Avatar = ({ user }) => (
  <motion.div 
    className="relative"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    {user.avatar ? (
      <img 
        src={user.avatar} 
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700/50 
          transition-all duration-300 hover:ring-blue-500/50"
      />
    ) : (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 
        rounded-full flex items-center justify-center ring-2 ring-gray-700/50">
        <User className="w-6 h-6 text-gray-400" />
      </div>
    )}
    <StatusIndicator status={user.status} />
  </motion.div>
);

// 状态指示器组件
const StatusIndicator = ({ status }) => {
  const getStatusStyle = (status) => {
    const styles = {
      online: 'bg-gradient-to-r from-green-500 to-green-400',
      busy: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
      offline: 'bg-gradient-to-r from-gray-500 to-gray-400'
    };
    return styles[status.toLowerCase()] || styles.offline;
  };

  return (
    <motion.span 
      className={`absolute bottom-0 right-0 w-3 h-3 
        ${getStatusStyle(status)} 
        rounded-full border-2 border-[#0a0f16]`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
    />
  );
};

// 统计指标组件
const Metric = ({ icon: Icon, label, value, tooltip }) => (
  <Tooltip content={tooltip}>
    <motion.div 
      className="flex items-center space-x-1 bg-gray-800/30 px-3 py-1.5 rounded-full
        hover:bg-gray-800/50 transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <Icon className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-blue-500 
        bg-clip-text text-transparent">{value}</span>
    </motion.div>
  </Tooltip>
);

// 专长标签组件
const SpecialtyTag = ({ specialty }) => (
  <motion.span 
    className="text-xs bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 
      px-3 py-1.5 rounded-full hover:from-blue-900/30 hover:to-blue-800/30 
      transition-all duration-300 cursor-default"
    whileHover={{ scale: 1.05 }}
  >
    {specialty}
  </motion.span>
);

const UserInfo = ({ user, className = "" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 
        border border-gray-800/50 rounded-xl p-6 ${className}
        backdrop-blur-sm shadow-xl`}
    >
      <div className="flex items-center justify-between">
        {/* 客服基本信息 */}
        <div className="flex items-center space-x-4">
          <Avatar user={user} />
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">{user.name}</h3>
              {user.verified && (
                <Tooltip content="已认证客服">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-500/20 text-blue-400 text-xs px-2.5 
                      py-1 rounded-full flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>已认证</span>
                  </motion.div>
                </Tooltip>
              )}
            </div>
            <p className="text-sm text-gray-400 flex items-center space-x-1 mt-1">
              <motion.span 
                className={`w-2 h-2 rounded-full ${
                  user.status.toLowerCase() === 'online' ? 'bg-green-500' :
                  user.status.toLowerCase() === 'busy' ? 'bg-yellow-500' : 
                  'bg-gray-500'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span>{user.status}</span>
              {user.statusMessage && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>{user.statusMessage}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* 客服统计信息 */}
        <div className="flex items-center space-x-3">
          <Metric 
            icon={Star}
            label="满意度"
            value={`${user.satisfaction}%`}
            tooltip="用户满意度评分"
          />
          <Metric 
            icon={Clock}
            label="响应"
            value={user.responseTime}
            tooltip="平均响应时间"
          />
          <Metric 
            icon={ThumbsUp}
            label="解决率"
            value={`${user.resolutionRate}%`}
            tooltip="问题解决成功率"
          />
        </div>
      </div>

      {/* 客服专长标签 */}
      {user.specialties && user.specialties.length > 0 && (
        <motion.div 
          className="mt-4 flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm text-gray-500">专长：</span>
          <div className="flex flex-wrap gap-2">
            {user.specialties.map((specialty, index) => (
              <SpecialtyTag key={index} specialty={specialty} />
            ))}
          </div>
        </motion.div>
      )}

      {/* 当前服务状态 */}
      {user.currentLoad && (
        <motion.div 
          className="mt-4 flex items-center space-x-2 bg-gray-800/30 
            rounded-lg px-4 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm text-gray-500">当前状态：</span>
          <span className="text-sm text-gray-400">
            正在服务 
            <span className="text-blue-400 font-medium mx-1">
              {user.currentLoad.current}
            </span> 
            位用户
            {user.currentLoad.queue > 0 && (
              <span>
                (队列中 
                <span className="text-yellow-400 font-medium mx-1">
                  {user.currentLoad.queue}
                </span> 
                位)
              </span>
            )}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

// 默认属性
UserInfo.defaultProps = {
  user: {
    name: "客服专员",
    status: "offline",
    satisfaction: 0,
    responseTime: "暂无数据",
    resolutionRate: 0,
    verified: false
  }
};

export default UserInfo;
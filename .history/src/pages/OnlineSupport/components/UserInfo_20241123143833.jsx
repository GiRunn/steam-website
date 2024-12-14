// E:\Steam\steam-website\src\pages\OnlineSupport\components\UserInfo.jsx
// 用户信息组件 - 展示客服人员信息

import React from 'react';
import { User, Star, Clock, ThumbsUp } from 'lucide-react';
// 从相对路径改为
import { Tooltip } from '../../../components/ui/Tooltip';

const UserInfo = ({ 
  user,
  className = "" 
}) => {
  // 在线状态样式
  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'online':
      case '在线':
        return 'bg-green-500';
      case 'busy':
      case '忙碌':
        return 'bg-yellow-500';
      case 'offline':
      case '离线':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 统计指标组件
  const Metric = ({ icon: Icon, label, value, tooltip }) => (
    <Tooltip content={tooltip}>
      <div className="flex items-center space-x-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm text-gray-300">{value}</span>
      </div>
    </Tooltip>
  );

  return (
    <div className={`border-b border-gray-800 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* 客服基本信息 */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 
                ${getStatusStyle(user.status)} 
                rounded-full border-2 border-gray-900`} 
            />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">{user.name}</h3>
              {user.verified && (
                <Tooltip content="已认证客服">
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-1.5 
                    py-0.5 rounded-full">
                    已认证
                  </span>
                </Tooltip>
              )}
            </div>
            <p className="text-sm text-gray-400 flex items-center space-x-1">
              <span 
                className={`w-2 h-2 ${getStatusStyle(user.status)} rounded-full`} 
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
        <div className="flex items-center space-x-4">
          <Metric 
            icon={Star}
            label="满意度"
            value={`${user.satisfaction}%`}
            tooltip="用户满意度评分"
          />
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
          <Metric 
            icon={Clock}
            label="响应时间"
            value={user.responseTime}
            tooltip="平均响应时间"
          />
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
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
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-sm text-gray-500">专长：</span>
          <div className="flex flex-wrap gap-2">
            {user.specialties.map((specialty, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 当前服务状态 */}
      {user.currentLoad && (
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-sm text-gray-500">当前状态：</span>
          <span className="text-sm text-gray-400">
            正在服务 {user.currentLoad.current} 位用户
            {user.currentLoad.queue > 0 && ` (队列中 ${user.currentLoad.queue} 位)`}
          </span>
        </div>
      )}
    </div>
  );
};

// 默认属性
UserInfo.defaultProps = {
  user: {
    name: "客服专员",
    status: "离线",
    satisfaction: 0,
    responseTime: "暂无数据",
    resolutionRate: 0,
    verified: false
  }
};

export default UserInfo;
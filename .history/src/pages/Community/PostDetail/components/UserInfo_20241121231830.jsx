// src/pages/Community/PostDetail/components/UserInfo.jsx
// 用户信息展示组件
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const UserInfo = ({ user, createdAt }) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <img
        src={user.avatar}
        alt={user.nickname}
        className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
      />
      <div>
        <h3 className="text-lg font-semibold text-blue-400">{user.nickname}</h3>
        <p className="text-sm text-gray-400">
          发布于 {formatDistanceToNow(new Date(createdAt), { locale: zhCN, addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default UserInfo;
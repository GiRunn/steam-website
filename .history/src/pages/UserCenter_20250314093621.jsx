import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Shield, 
  MessageSquare, 
  Bookmark, 
  Users, 
  Wallet,
  Edit3
} from 'lucide-react';

const UserCenter = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState({
    username: '用户名',
    email: 'user@example.com',
    balance: 1000,
    avatar: 'https://via.placeholder.com/150',
    followers: 128,
    following: 56
  });

  const tabs = [
    { id: 'profile', label: '个人信息', icon: User },
    { id: 'orders', label: '订单列表', icon: ShoppingBag },
    { id: 'balance', label: '可用余额', icon: Wallet },
    { id: 'wishlist', label: '关注商品', icon: Heart },
    { id: 'security', label: '账户安全', icon: Shield },
    { id: 'posts', label: '我的发帖', icon: Edit3 },
    { id: 'comments', label: '我的评论', icon: MessageSquare },
    { id: 'collections', label: '我的收藏', icon: Bookmark },
    { id: 'social', label: '粉丝与关注', icon: Users }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <img 
                src={userInfo.avatar} 
                alt="用户头像" 
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{userInfo.username}</h3>
                <p className="text-gray-400">{userInfo.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="用户名"
                className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                  rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="邮箱"
                className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                  rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600">
                保存修改
              </button>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-4">
            {[1, 2, 3].map((order) => (
              <div key={order} className="p-4 bg-[#2a475e]/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white">订单 #{order}</span>
                  <span className="text-green-400">已完成</span>
                </div>
                <div className="mt-2 text-gray-400">
                  <p>购买时间: 2024-03-14</p>
                  <p>总金额: ¥299</p>
                </div>
              </div>
            ))}
          </div>
        );
      // 其他标签页的内容可以根据需要类似实现
      default:
        return (
          <div className="text-center text-gray-400">
            该功能正在开发中...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2838] p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-12 gap-8"
        >
          {/* 侧边栏 */}
          <div className="col-span-3">
            <div className="bg-[#2a475e]/50 rounded-lg p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'text-gray-300 hover:bg-[#2a475e]'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 主要内容区 */}
          <div className="col-span-9">
            <div className="bg-[#2a475e]/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              {renderContent()}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserCenter; 
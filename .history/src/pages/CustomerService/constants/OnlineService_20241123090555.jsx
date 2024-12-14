// src/pages/CustomerService/constants/OnlineService.jsx
import React from 'react';
import { MessageSquare } from 'lucide-react';

/**
 * 在线客服入口组件
 * 提供在线客服服务入口
 */
const OnlineService = () => {
  return (
    <div className="bg-[#0f1621] rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">联系我们</h3>
      <div 
        className="flex items-center gap-4 p-3 bg-[#1a1f2c] rounded-lg
          hover:bg-[#242936] transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => {
          // TODO: 实现在线客服对话框打开逻辑
          console.log('打开在线客服');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            console.log('打开在线客服');
          }
        }}
      >
        <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <div>
          <div className="text-white font-medium">在线客服</div>
          <div className="text-sm text-gray-400">7x24小时</div>
        </div>
      </div>
    </div>
  );
};

export default OnlineService;
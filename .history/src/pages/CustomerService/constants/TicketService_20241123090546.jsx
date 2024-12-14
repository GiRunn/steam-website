// src/pages/CustomerService/constants/TicketService.jsx
import React from 'react';
import { Plus } from 'lucide-react';

/**
 * 工单服务入口组件
 * 提供创建工单的服务入口
 */
const TicketService = () => {
  const handleCreateTicket = () => {
    // TODO: 实现创建工单的逻辑
    console.log('创建工单');
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-2">需要更多帮助？</h3>
      <p className="text-white/80 mb-4">创建工单获取专业客服支持</p>
      <button 
        onClick={handleCreateTicket}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 
          transition-colors rounded-lg px-4 py-2 text-white
          focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <Plus className="w-5 h-5" />
        <span>创建工单</span>
      </button>
    </div>
  );
};

export default TicketService;
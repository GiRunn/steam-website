// src/pages/CustomerService/constants/ContactSection.jsx
import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

/**
 * 头部区域组件
 * 显示帮助提示文本
 */
const HeaderSection = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-white">需要更多帮助？</h3>
      <p className="text-white/80">创建工单获取专业客服支持</p>
    </div>
  );
};

/**
 * 工单创建按钮组件
 * 处理工单创建的交互逻辑
 */
const TicketButton = () => {
  const handleCreateTicket = () => {
    // TODO: 实现创建工单的逻辑
    console.log('创建工单');
  };

  return (
    <button 
      onClick={handleCreateTicket}
      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 
        transition-colors rounded-lg px-4 py-2 text-white
        focus:outline-none focus:ring-2 focus:ring-purple-500/50"
    >
      <Plus className="w-5 h-5" />
      <span>创建工单</span>
    </button>
  );
};

/**
 * 联系信息卡片组件
 * 展示在线客服等联系方式
 */
const ServiceCard = () => {
  return (
    <div className="bg-[#0f1621] rounded-xl p-6 shadow-lg">
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

/**
 * 主组件：客服联系区域
 * 整合所有子组件并维护整体布局
 */
const ContactSection = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <HeaderSection />
        <TicketButton />
      </div>
      <ServiceCard />
    </div>
  );
};

export default ContactSection;
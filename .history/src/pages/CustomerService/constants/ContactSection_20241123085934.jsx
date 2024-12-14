// src/pages/CustomerService/components/ContactSection/index.jsx
import React from 'react';
import SectionHeader from './SectionHeader';
import CreateTicketButton from './CreateTicketButton';
import ContactCard from './ContactCard';

// 主组件 - 整合所有子组件
const ContactSection = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SectionHeader />
        <CreateTicketButton />
      </div>
      <ContactCard />
    </div>
  );
};

// 头部组件 - 显示标题和描述
const SectionHeader = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-white">需要更多帮助？</h3>
      <p className="text-white/80">创建工单获取专业客服支持</p>
    </div>
  );
};

// 创建工单按钮组件
const CreateTicketButton = () => {
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

// 联系卡片组件
const ContactCard = () => {
  return (
    <div className="bg-[#0f1621] rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4">联系我们</h3>
      <div 
        className="flex items-center gap-4 p-3 bg-[#1a1f2c] rounded-lg
          hover:bg-[#242936] transition-colors cursor-pointer"
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

export default ContactSection;
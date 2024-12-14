// E:\Steam\steam-website\src\pages\OnlineSupport\components\QuickReplies.jsx
// 快捷回复组件 - Steam风格设计

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessagesSquare,
  UserCircle,
  Wallet,
  Gamepad2,
  HelpCircle,
  ChevronRight,
  Plus
} from 'lucide-react';

// 快捷回复数据
const defaultQuickReplies = [
  {
    id: 'general',
    text: "您好，请问有什么可以帮助您？",
    icon: MessagesSquare,
    description: "为您提供帮助",
    category: "通用"
  },
  {
    id: 'account',
    text: "账号相关问题",
    icon: UserCircle,
    description: "账号安全与设置",
    category: "账号问题"
  },
  {
    id: 'payment',
    text: "支付相关问题",
    icon: Wallet,
    description: "支付与退款",
    category: "交易"
  },
  {
    id: 'game',
    text: "游戏相关问题",
    icon: Gamepad2,
    description: "游戏问题咨询",
    category: "游戏"
  },
  {
    id: 'other',
    text: "其他问题",
    icon: HelpCircle,
    description: "其他帮助",
    category: "其他"
  }
];

// 快捷回复按钮组件
const QuickReplyButton = ({ reply, onClick, isSelected }) => {
  const Icon = reply.icon;
  
  return (
    <motion.button
      onClick={() => onClick(reply.text)}
      whileHover={{ backgroundColor: 'rgba(62, 103, 184, 0.2)' }}
      whileTap={{ scale: 0.98 }}
      className={`
        group w-full flex items-center gap-3 p-3
        rounded-lg transition-all duration-200
        ${isSelected ? 
          'bg-[#3e67b8]/20 text-[#66c0f4]' : 
          'hover:bg-[#1a2537]'}
      `}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${isSelected ? 
          'bg-[#3e67b8]/20 text-[#66c0f4]' : 
          'bg-[#1a2537] text-gray-400 group-hover:text-[#66c0f4]'}
        transition-colors duration-200
      `}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <h3 className={`
            text-sm font-medium
            ${isSelected ? 'text-[#66c0f4]' : 'text-gray-200 group-hover:text-[#66c0f4]'}
          `}>
            {reply.text}
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {reply.description}
        </p>
      </div>

      <ChevronRight className={`
        w-4 h-4 transition-transform duration-200
        ${isSelected ? 'text-[#66c0f4]' : 'text-gray-600'}
        ${isSelected ? 'translate-x-0' : '-translate-x-2'}
        opacity-0 group-hover:opacity-100 group-hover:translate-x-0
      `} />
    </motion.button>
  );
};

const QuickReplies = ({ 
  onSelect, 
  replies = defaultQuickReplies,
  className = "" 
}) => {
  const [selectedId, setSelectedId] = useState(null);

  // 处理选择
  const handleSelect = (text) => {
    const reply = replies.find(r => r.text === text);
    if (reply) {
      setSelectedId(reply.id);
      onSelect(text);
    }
  };

  return (
    <div className={`
      bg-[#1b2838]/95 backdrop-blur-sm rounded-lg 
      border border-gray-800/50
      ${className}
    `}>
      {/* 标题区域 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-base font-medium text-gray-200">快捷回复</h2>
          <p className="text-xs text-gray-500 mt-0.5">选择常用回复快速响应</p>
        </div>
        <motion.button
          whileHover={{ rotate: 90, backgroundColor: 'rgba(102, 192, 244, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg text-[#66c0f4] hover:bg-[#66c0f4]/10
            transition-colors"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* 回复列表 */}
      <div className="p-2 space-y-1">
        {replies.map((reply, index) => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <QuickReplyButton
              reply={reply}
              onClick={handleSelect}
              isSelected={selectedId === reply.id}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;
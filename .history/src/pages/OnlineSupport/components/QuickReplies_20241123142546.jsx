// E:\Steam\steam-website\src\pages\OnlineSupport\components\QuickReplies.jsx
// 快捷回复组件 - 提供常用回复选项

import React from 'react';
import { motion } from 'framer-motion';

// 快捷回复数据
const defaultQuickReplies = [
  {
    id: 'general',
    text: "您好，请问有什么可以帮助您？"
  },
  {
    id: 'account',
    text: "账号相关问题"
  },
  {
    id: 'payment',
    text: "支付相关问题"
  },
  {
    id: 'game',
    text: "游戏相关问题"
  },
  {
    id: 'other',
    text: "其他问题"
  }
];

const QuickReplies = ({ 
  onSelect, 
  replies = defaultQuickReplies,
  className = "" 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 overflow-x-auto py-2 px-4 bg-gray-900/50 ${className}`}
    >
      {replies.map((reply) => (
        <button
          key={reply.id}
          onClick={() => onSelect(reply.text)}
          className="whitespace-nowrap px-3 py-1 rounded-full text-sm
            bg-gray-800 hover:bg-gray-700 text-gray-300
            transition-colors duration-200"
        >
          {reply.text}
        </button>
      ))}
    </motion.div>
  );
};

export default QuickReplies;
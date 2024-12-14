// E:\Steam\steam-website\src\pages\OnlineSupport\components\QuickReplies.jsx
// 快捷回复组件 - 提供常用回复选项
// 美化版本：添加更多动画和交互效果

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  User, 
  CreditCard, 
  GamepadIcon, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// 快捷回复数据 - 添加图标和类别
const defaultQuickReplies = [
  {
    id: 'general',
    text: "您好，请问有什么可以帮助您？",
    icon: MessageSquare,
    color: 'text-blue-400'
  },
  {
    id: 'account',
    text: "账号相关问题",
    icon: User,
    color: 'text-green-400'
  },
  {
    id: 'payment',
    text: "支付相关问题",
    icon: CreditCard,
    color: 'text-purple-400'
  },
  {
    id: 'game',
    text: "游戏相关问题",
    icon: GamepadIcon,
    color: 'text-yellow-400'
  },
  {
    id: 'other',
    text: "其他问题",
    icon: HelpCircle,
    color: 'text-pink-400'
  }
];

// 快捷回复按钮组件
const QuickReplyButton = ({ reply, onClick }) => {
  const Icon = reply.icon;
  
  return (
    <motion.button
      onClick={() => onClick(reply.text)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl
        bg-gradient-to-r from-gray-800 to-gray-700
        hover:from-gray-700 hover:to-gray-600
        text-sm text-gray-200 transition-all duration-300
        border border-gray-700/50 hover:border-gray-600
        shadow-lg hover:shadow-xl
        group
      `}
    >
      <motion.span
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 15 }}
        className={`${reply.color}`}
      >
        <Icon className="w-4 h-4" />
      </motion.span>
      <span className="group-hover:text-white transition-colors">
        {reply.text}
      </span>
    </motion.button>
  );
};

// 滚动按钮组件
const ScrollButton = ({ direction, onClick, disabled }) => {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      disabled={disabled}
      className={`
        absolute ${direction === 'left' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2
        w-8 h-8 rounded-full flex items-center justify-center
        bg-gray-800/80 backdrop-blur-sm
        hover:bg-gray-700 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        z-10 border border-gray-700/50
      `}
    >
      <Icon className="w-5 h-5 text-gray-400" />
    </motion.button>
  );
};

const QuickReplies = ({ 
  onSelect, 
  replies = defaultQuickReplies,
  className = "" 
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef(null);

  // 处理滚动
  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -200 : 200;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    
    // 更新滚动位置
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  // 监听滚动事件
  const handleScrollEvent = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative
        bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80
        backdrop-blur-sm
        border-t border-b border-gray-800/50
        ${className}
      `}
    >
      {/* 左滚动按钮 */}
      {scrollPosition > 0 && (
        <ScrollButton 
          direction="left" 
          onClick={() => handleScroll('left')}
        />
      )}

      {/* 快捷回复列表 */}
      <motion.div
        ref={containerRef}
        onScroll={handleScrollEvent}
        className="flex gap-3 overflow-x-auto py-4 px-12
          scrollbar-none scroll-smooth"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {replies.map((reply, index) => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <QuickReplyButton 
              reply={reply}
              onClick={onSelect}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 右滚动按钮 */}
      {containerRef.current && 
       scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth && (
        <ScrollButton 
          direction="right" 
          onClick={() => handleScroll('right')}
        />
      )}

      {/* 渐变遮罩 */}
      <div className="absolute top-0 left-0 w-12 h-full
        bg-gradient-to-r from-gray-900/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-full
        bg-gradient-to-l from-gray-900/80 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default QuickReplies;
// E:\Steam\steam-website\src\pages\OnlineSupport\components\QuickReplies.jsx
// 快捷回复组件 - 提供常用回复选项
// 卡片式设计风格

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessagesSquare,
  UserCircle,  // 正确的图标名称
  Wallet,
  Gamepad2,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Plus
} from 'lucide-react';

// 快捷回复数据
const defaultQuickReplies = [
  {
    id: 'general',
    text: "您好，请问有什么可以帮助您？",
    icon: MessagesSquare,
    description: "通用问候语"
  },
  {
    id: 'account',
    text: "账号相关问题",
    icon: UserRound,
    description: "账号安全与设置"
  },
  {
    id: 'payment',
    text: "支付相关问题",
    icon: Wallet,
    description: "支付与退款"
  },
  {
    id: 'game',
    text: "游戏相关问题",
    icon: Gamepad2,
    description: "游戏问题咨询"
  },
  {
    id: 'other',
    text: "其他问题",
    icon: HelpCircle,
    description: "其他帮助"
  }
];

// 快捷回复卡片组件
const QuickReplyCard = ({ reply, onClick, isSelected }) => {
  const Icon = reply.icon;
  
  return (
    <motion.button
      onClick={() => onClick(reply.text)}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative min-w-[160px] p-4 rounded-xl text-left
        border border-gray-800 
        transition-all duration-300 group
        ${isSelected ? 
          'bg-blue-500/10 border-blue-500/50' : 
          'bg-gray-800/50 hover:bg-gray-800 hover:border-gray-700'}
      `}
    >
      <div className="flex flex-col gap-2">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${isSelected ? 
            'bg-blue-500/20 text-blue-400' : 
            'bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-300'}
          transition-colors duration-300
        `}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div>
          <h3 className={`
            text-sm font-medium mb-1
            ${isSelected ? 'text-blue-400' : 'text-gray-200'}
          `}>
            {reply.text}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">
            {reply.description}
          </p>
        </div>
      </div>

      {/* 选中指示器 */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
        />
      )}
    </motion.button>
  );
};

const QuickReplies = ({ 
  onSelect, 
  replies = defaultQuickReplies,
  className = "" 
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // 检查是否需要显示滚动按钮
  React.useEffect(() => {
    const checkScroll = () => {
      const container = containerRef.current;
      if (container) {
        setShowScrollButtons(
          container.scrollWidth > container.clientWidth
        );
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [replies]);

  // 处理选择
  const handleSelect = (text) => {
    const reply = replies.find(r => r.text === text);
    if (reply) {
      setSelectedId(reply.id);
      onSelect(text);
    }
  };

  // 处理滚动
  const scroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 主容器 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#0a0f16]/90 backdrop-blur-sm p-4 rounded-xl
          border border-gray-800/50"
      >
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h2 className="text-lg font-medium text-gray-200">快捷回复</h2>
            <p className="text-sm text-gray-500">选择常用回复快速响应</p>
          </div>
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700
              text-gray-400 hover:text-gray-300 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 滚动容器 */}
        <div className="relative">
          {/* 左滚动按钮 */}
          {showScrollButtons && scrollPosition > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                w-8 h-8 rounded-full bg-gray-800 shadow-lg
                flex items-center justify-center
                hover:bg-gray-700 transition-colors"
              onClick={() => scroll('left')}
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}

          {/* 快捷回复列表 */}
          <div
            ref={containerRef}
            onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
            className="flex gap-4 overflow-x-auto scrollbar-none px-2 py-1
              scroll-smooth"
          >
            {replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuickReplyCard
                  reply={reply}
                  onClick={handleSelect}
                  isSelected={selectedId === reply.id}
                />
              </motion.div>
            ))}
          </div>

          {/* 右滚动按钮 */}
          {showScrollButtons && 
           containerRef.current && 
           scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                w-8 h-8 rounded-full bg-gray-800 shadow-lg
                flex items-center justify-center
                hover:bg-gray-700 transition-colors"
              onClick={() => scroll('right')}
            >
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}

          {/* 渐变遮罩 */}
          {showScrollButtons && (
            <>
              <div className="absolute top-0 left-0 w-12 h-full
                bg-gradient-to-r from-[#0a0f16] to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-12 h-full
                bg-gradient-to-l from-[#0a0f16] to-transparent pointer-events-none" />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuickReplies;
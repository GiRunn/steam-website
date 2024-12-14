// src/pages/OnlineSupport/index.jsx
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { ChatState } from './constants/chatConstants';
import Header from './components/Header';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';
import { BOT_INFO } from './constants/botConfig';
import { motion, AnimatePresence } from 'framer-motion';



import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Clock, BarChart2, Users } from 'lucide-react';

// 动态导入组件 - 删除重复的 BotChat 导入
const QuickReplies = React.lazy(() => import('./components/QuickReplies')
  .catch(() => ({
    default: () => <div className="text-center text-gray-500 py-2">Failed to load quick replies</div>
  }))
);

const MessageList = React.lazy(() => import('./components/MessageList')
  .catch(() => ({
    default: () => <div className="text-center text-gray-500 py-4">Failed to load messages</div>
  }))
);

const MessageInput = React.lazy(() => import('./components/MessageInput')
  .catch(() => ({
    default: () => <div className="text-center text-gray-500 py-2">Failed to load input</div>
  }))
);

const UserInfo = React.lazy(() => import('./components/UserInfo')
  .catch(() => ({
    default: () => <div className="text-center text-gray-500 py-2">Failed to load user info</div>
  }))
);

// 背景动效组件
const BackgroundEffect = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10" />
    <div className="absolute top-0 left-0 w-full h-full">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-screen filter blur-xl animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 200 + 50}px`,
            height: `${Math.random() * 200 + 50}px`,
            background: `radial-gradient(circle, rgba(${Math.random() * 100 + 100}, ${
              Math.random() * 100 + 100
            }, 255, 0.1) 0%, rgba(0,0,0,0) 70%)`,
            animation: `float ${Math.random() * 10 + 20}s linear infinite`,
          }}
        />
      ))}
    </div>
  </div>
);

// 状态指示器组件
const StatusIndicator = ({ status }) => (
  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/30 rounded-full">
    <div
      className={`w-2 h-2 rounded-full ${
        status === ChatState.CONNECTED
          ? 'bg-green-500 animate-pulse'
          : status === ChatState.BOT
          ? 'bg-blue-500 animate-pulse'
          : 'bg-gray-500'
      }`}
    />
    <span className="text-sm font-medium">
      {status === ChatState.CONNECTED
        ? '已连接'
        : status === ChatState.BOT
        ? 'AI 助手模式'
        : '未连接'}
    </span>
  </div>
);

// 消息气泡组件
const MessageBubble = React.memo(({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div
      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-blue-600 text-white ml-auto'
          : 'bg-gray-800/60 backdrop-blur-sm'
      } shadow-lg`}
    >
      <p className="text-sm leading-relaxed">{message.text}</p>
      <div className="mt-1 text-xs opacity-60">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  </motion.div>
));

// 输入框装饰组件
const InputDecorator = ({ children }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg blur" />
    <div className="relative bg-gray-800/30 backdrop-blur-md rounded-lg border border-gray-700/30">
      {children}
    </div>
  </div>
);

// 快捷回复按钮组件
const QuickReplyButton = ({ onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`p-2 rounded-full transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-800/30 hover:bg-gray-700/30 text-gray-300'
    }`}
    onClick={onClick}
  >
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16m-7 6h7"
      />
    </svg>
  </motion.button>
);

// 统计卡片组件
const StatCard = ({ icon: Icon, title, value, trend }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
      {trend && (
        <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  </div>
);

// 装饰性波浪背景
const WaveBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <svg className="absolute w-full h-full" viewBox="0 0 1200 500">
      <defs>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M 0 100 Q 300 150 600 100 Q 900 50 1200 100 L 1200 500 L 0 500 Z"
        fill="url(#wave-gradient)"
        className="animate-wave-slow"
      />
      <path
        d="M 0 150 Q 300 200 600 150 Q 900 100 1200 150 L 1200 500 L 0 500 Z"
        fill="url(#wave-gradient)"
        className="animate-wave-fast"
      />
    </svg>
  </div>
);

const OnlineSupportPage = () => {
  // 使用 useChat hook
  const {
    loading,
    chatState,
    messages,
    isAgentTyping,
    isSoundEnabled,
    serviceAgent,
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
    messageContainerRef,
  } = useChat();

  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const quickRepliesRef = useRef(null);

  // 处理快捷回复选择
  const handleQuickReplySelect = (reply) => {
    handleSendMessage({ text: reply, isUser: true });
    setIsQuickReplyOpen(false);
  };
  
  // 优化的 ResizeObserver 效果
  useEffect(() => {
    if (!quickRepliesRef.current || !messageContainerRef.current) return;

    const messageContainer = messageContainerRef.current;
    let resizeTimeout;

    const handleResize = (entries) => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        for (const entry of entries) {
          const quickReplyHeight = entry.target.querySelector('.quick-reply-dropdown')?.offsetHeight || 0;
          
          if (messageContainer) {
            messageContainer.style.paddingBottom = isQuickReplyOpen ? 
              `${quickReplyHeight + 80}px` : 
              '80px';

            if (isQuickReplyOpen) {
              requestAnimationFrame(() => {
                messageContainer.scrollTop = messageContainer.scrollHeight;
              });
            }
          }
        }
      }, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(quickRepliesRef.current);
    
    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, [isQuickReplyOpen, messageContainerRef]);

  // 加载状态处理
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white relative">
      <WaveBackground />
      
      {/* 头部统计区域 */}
      <div className="max-w-6xl mx-auto pt-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={MessageCircle}
            title="当前会话"
            value="28"
            trend={12}
          />
          <StatCard
            icon={Clock}
            title="平均响应时间"
            value="< 1分钟"
            trend={-5}
          />
          <StatCard
            icon={BarChart2}
            title="满意度"
            value="98%"
            trend={3}
          />
          <StatCard
            icon={Users}
            title="在线客服"
            value="12"
            trend={0}
          />
        </div>
      </div>

      {/* 主聊天区域 - 使用磨砂玻璃效果 */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/30 shadow-2xl">
          <div className="p-6">
            {/* 客服信息卡片 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src="/api/placeholder/40/40"
                    alt="AI助手"
                    className="w-12 h-12 rounded-full border-2 border-blue-500"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">智能助手</h3>
                  <p className="text-sm text-gray-400">在线 · 24/7全天服务</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-blue-400">AI助手</span>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">98%</span> 满意度
                </div>
              </div>
            </div>

            {/* 快速操作按钮组 */}
            <div className="flex flex-wrap gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg backdrop-blur-sm flex items-center space-x-2 border border-gray-600/30 transition-colors"
              >
                <span>支付失败</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg backdrop-blur-sm flex items-center space-x-2 border border-gray-600/30 transition-colors"
              >
                <span>退款咨询</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg backdrop-blur-sm flex items-center space-x-2 border border-gray-600/30 transition-colors"
              >
                <span>订单查询</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg backdrop-blur-sm flex items-center space-x-2 border border-gray-600/30 transition-colors"
              >
                <span>其他问题</span>
              </motion.button>
            </div>

            {/* 聊天窗口 */}
            <div className="bg-gray-900/30 rounded-xl p-4 mb-6 h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {/* 这里放置聊天消息内容 */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <img src="/api/placeholder/32/32" alt="AI" className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">您好！我是您的AI智能助手，请问有什么可以帮您？</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 输入框区域 */}
            <div className="relative">
              <input
                type="text"
                placeholder="请输入您的问题..."
                className="w-full px-4 py-3 bg-gray-800/30 rounded-lg border border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors">
                发送
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Steam在线客服系统 · AI智能助手为您服务</p>
        </div>
      </div>
    </div>
  );
};




export default OnlineSupportPage;
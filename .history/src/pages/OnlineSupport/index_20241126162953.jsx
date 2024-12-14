// src/pages/OnlineSupport/index.jsx
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { ChatState } from './constants/chatConstants';
import Header from './components/Header';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';
import { BOT_INFO } from './constants/botConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Video, MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';

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


// 新增: 公告轮播组件
const AnnouncementCarousel = ({ announcements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Bell className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-gray-300">最新公告</h3>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-gray-400"
        >
          {announcements[currentIndex]}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center space-x-1 mt-3">
        {announcements.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-blue-500 w-3' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// 新增: 服务统计组件
const ServiceStats = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 mb-4">
    {stats.map((stat, index) => (
      <div
        key={index}
        className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30"
      >
        <div className="flex items-center space-x-2 mb-2">
          {stat.icon}
          <span className="text-xs text-gray-400">{stat.label}</span>
        </div>
        <div className="text-lg font-semibold">{stat.value}</div>
        {stat.trend && (
          <div className={`text-xs ${stat.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stat.trend > 0 ? '+' : ''}{stat.trend}%
          </div>
        )}
      </div>
    ))}
  </div>
);

// 新增: 视频教程组件
const VideoTutorials = ({ tutorials }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 mb-4">
    <div className="flex items-center space-x-2 mb-3">
      <Video className="w-4 h-4 text-blue-400" />
      <h3 className="text-sm font-medium text-gray-300">视频教程</h3>
    </div>
    <div className="space-y-3">
      {tutorials.map((tutorial, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-lg cursor-pointer"
        >
          <img
            src={`/api/placeholder/${320}/${180}`}
            alt={tutorial.title}
            className="w-full h-24 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-end">
            <span className="text-xs text-white group-hover:text-blue-400 transition-colors">
              {tutorial.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 新增: 快捷服务组件
const QuickServices = ({ services }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4">
    <div className="flex items-center space-x-2 mb-3">
      <MessageCircle className="w-4 h-4 text-blue-400" />
      <h3 className="text-sm font-medium text-gray-300">快捷服务</h3>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {services.map((service, index) => (
        <button
          key={index}
          className="p-3 bg-gray-700/30 hover:bg-gray-600/30 rounded-lg text-sm text-gray-300 transition-colors"
        >
          {service}
        </button>
      ))}
    </div>
  </div>
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
  // hooks和状态管理
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
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // 模拟数据 - 实际项目中应从API获取
  const mockData = {
    announcements: [
      "系统将于本周六凌晨2点进行例行维护，请提前做好准备",
      "新版本客户端已发布，修复了若干已知问题",
      "618活动即将开始，敬请期待！"
    ],
    stats: [
      { icon: <Users className="w-4 h-4 text-blue-400" />, label: "在线客服", value: "12", trend: 5 },
      { icon: <TrendingUp className="w-4 h-4 text-green-400" />, label: "满意度", value: "98%", trend: 2 },
      { icon: <MessageCircle className="w-4 h-4 text-purple-400" />, label: "今日会话", value: "1,234" },
      { icon: <Clock className="w-4 h-4 text-yellow-400" />, label: "平均响应", value: "30s" }
    ],
    tutorials: [
      { title: "如何使用新版客户端", duration: "5:30" },
      { title: "账号安全保护指南", duration: "4:15" },
      { title: "常见问题解决方案", duration: "7:45" }
    ],
    quickServices: [
      "账号问题",
      "支付问题",
      "商品退款",
      "技术支持"
    ]
  };

  // 处理公告轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncementIndex(prev => 
        (prev + 1) % mockData.announcements.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [mockData.announcements.length]);

  // 处理快捷回复区域的动态高度
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

  // 处理快捷回复选择
  const handleQuickReplySelect = (reply) => {
    handleSendMessage({ text: reply, isUser: true });
    setIsQuickReplyOpen(false);
  };

  // 处理快捷服务选择
  const handleQuickServiceSelect = (service) => {
    handleSendMessage({ 
      text: `我需要关于"${service}"的帮助`, 
      isUser: true 
    });
  };

  // 处理视频教程点击
  const handleTutorialClick = (tutorial) => {
    handleSendMessage({ 
      text: `我想了解"${tutorial.title}"的内容`, 
      isUser: true 
    });
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white relative">
      {/* 背景效果 */}
      <BackgroundEffect />
      
      {/* 顶部导航 */}
      <Header
        chatState={chatState}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={setIsSoundEnabled}
        onEndChat={handleEndChat}
      >
        <StatusIndicator status={chatState} />
      </Header>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-12 gap-4">
          {/* 左侧聊天区域 */}
          <div className="col-span-8">
            <div className="h-[calc(100vh-96px)] flex flex-col relative backdrop-blur-lg bg-gray-900/20 rounded-2xl shadow-2xl">
              <ErrorBoundary fallback={<div>发生错误</div>}>
                <Suspense fallback={<LoadingScreen />}>
                  <div className="flex-1 overflow-hidden flex flex-col relative">
                    <AnimatePresence>
                      {/* 用户信息显示 */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col"
                      >
                        {chatState === ChatState.BOT ? (
                          <UserInfo user={BOT_INFO} />
                        ) : (
                          serviceAgent &&
                          chatState === ChatState.CONNECTED && (
                            <>
                              <UserInfo user={serviceAgent} />
                              <div ref={quickRepliesRef}>
                                <QuickReplies
                                  isOpen={isQuickReplyOpen}
                                  onSelect={handleQuickReplySelect}
                                  onOpenChange={setIsQuickReplyOpen}
                                  className="border-t border-gray-800/30"
                                />
                              </div>
                            </>
                          )
                        )}
                      </motion.div>

                      {/* 消息列表 */}
                      <div
                        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800/50 scrollbar-track-transparent px-4"
                        ref={messageContainerRef}
                      >
                        <MessageList
                          MessageComponent={MessageBubble}
                          messages={messages}
                          isTyping={isAgentTyping}
                          chatState={chatState}
                          onTransferToAgent={handleTransferToAgent}
                          onSendMessage={handleSendMessage}
                        />
                      </div>

                      {/* 输入区域 */}
                      {(chatState === ChatState.CONNECTED ||
                        chatState === ChatState.BOT) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-t border-gray-800/30 p-4"
                        >
                          <InputDecorator>
                            <MessageInput
                              onSend={handleSendMessage}
                              disabled={isAgentTyping || chatState === ChatState.ENDED}
                              isTyping={isAgentTyping}
                              placeholder={
                                isAgentTyping
                                  ? "AI助手正在思考..."
                                  : chatState === ChatState.BOT
                                  ? "请输入您的问题..."
                                  : "输入消息..."
                              }
                              onQuickReplyToggle={() => setIsQuickReplyOpen(!isQuickReplyOpen)}
                              showQuickReplyButton={chatState === ChatState.CONNECTED}
                              QuickReplyButtonComponent={QuickReplyButton}
                              className="bg-transparent"
                            />
                          </InputDecorator>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          {/* 右侧信息区域 */}
          <div className="col-span-4 space-y-4">
            {/* 公告轮播 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AnnouncementCarousel 
                announcements={mockData.announcements}
                currentIndex={currentAnnouncementIndex}
              />
            </motion.div>

            {/* 服务统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ServiceStats stats={mockData.stats} />
            </motion.div>

            {/* 视频教程 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <VideoTutorials 
                tutorials={mockData.tutorials}
                onTutorialClick={handleTutorialClick}
              />
            </motion.div>

            {/* 快捷服务 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <QuickServices 
                services={mockData.quickServices}
                onServiceSelect={handleQuickServiceSelect}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default OnlineSupportPage;
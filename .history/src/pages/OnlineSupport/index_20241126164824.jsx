// E:\Steam\steam-website\src\pages\OnlineSupport\index.jsx

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Video, MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';

// 导入hooks和常量
import { useChat } from './hooks/useChat';
import { ChatState } from './constants/chatConstants';
import { BOT_INFO } from './constants/botConfig';

// 导入全局组件
import Header from './components/Header';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';

// 导入拆分的组件
import AnnouncementCarousel from './components/AnnouncementCarousel';
import BackgroundEffect from './components/BackgroundEffect';
import InputDecorator from './components/InputDecorator';
import MessageBubble from './components/MessageBubble';
import QuickReplyButton from './components/QuickReplyButton';
import QuickServices from './components/QuickServices';
import ServiceStats from './components/ServiceStats';
import StatusIndicator from './components/StatusIndicator';
import VideoTutorials from './components/VideoTutorials';
import WaveBackground from './components/WaveBackground';

// 懒加载组件
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

// 模拟数据类型定义
interface MockData {
  announcements: string[];
  stats: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend?: number;
  }[];
  tutorials: {
    title: string;
    duration: string;
  }[];
  quickServices: string[];
}

const OnlineSupportPage: React.FC = () => {
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
  const quickRepliesRef = useRef<HTMLDivElement>(null);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // 模拟数据
  const mockData: MockData = {
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
      setCurrentAnnouncementIndex(prev => (prev + 1) % mockData.announcements.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [mockData.announcements.length]);

  // 处理快捷回复区域的动态高度
  useEffect(() => {
    if (!quickRepliesRef.current || !messageContainerRef.current) return;

    const messageContainer = messageContainerRef.current;
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = (entries: ResizeObserverEntry[]) => {
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

  // 事件处理函数
  const handleQuickReplySelect = (reply: string) => {
    handleSendMessage({ text: reply, isUser: true });
    setIsQuickReplyOpen(false);
  };

  const handleQuickServiceSelect = (service: string) => {
    handleSendMessage({ 
      text: `我需要关于"${service}"的帮助`, 
      isUser: true 
    });
  };

  const handleTutorialClick = (tutorial: { title: string }) => {
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
      <WaveBackground />
      
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
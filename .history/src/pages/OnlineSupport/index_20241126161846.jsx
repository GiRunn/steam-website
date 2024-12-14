// src/pages/OnlineSupport/index.jsx
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { ChatState } from './constants/chatConstants';
import Header from './components/Header';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';
import { BOT_INFO } from './constants/botConfig';
import { motion, AnimatePresence } from 'framer-motion';

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
      <BackgroundEffect />
      
      <Header
        chatState={chatState}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={setIsSoundEnabled}
        onEndChat={handleEndChat}
      >
        <StatusIndicator status={chatState} />
      </Header>

      <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col relative backdrop-blur-lg bg-gray-900/20 rounded-t-2xl shadow-2xl">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <LoadingScreen />
              </div>
            }
          >
            <div className="flex-1 overflow-hidden flex flex-col relative">
              <AnimatePresence>
                {/* 用户信息区域 */}
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

                {/* 消息列表区域 */}
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
                        onQuickReplyToggle={() =>
                          setIsQuickReplyOpen(!isQuickReplyOpen)
                        }
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
  );
};



export default OnlineSupportPage;
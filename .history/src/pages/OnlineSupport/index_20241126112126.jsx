// src/pages/OnlineSupport/index.jsx

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useChat } from './hooks/useChat';
import { ChatState, MessageType } from './constants/chatConstants';
import Header from './components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';

// 动态导入组件
const AsyncComponents = {
  QuickReplies: React.lazy(() => import('./components/QuickReplies')),
  MessageList: React.lazy(() => import('./components/MessageList')),
  MessageInput: React.lazy(() => import('./components/MessageInput')),
  UserInfo: React.lazy(() => import('./components/UserInfo'))
};

// 组件加载失败时的降级UI
const FallbackComponent = ({ componentName }) => (
  <div className="text-center text-gray-500 py-2">
    Failed to load {componentName}
  </div>
);

const OnlineSupportPage = () => {
  const {
    loading,
    chatState,
    messages,
    isAgentTyping,
    isSoundEnabled,
    serviceAgent,
    messageContainerRef,
    selectedCategory,
    setIsSoundEnabled,
    handleSendMessage,
    handleTransferToAgent,
    handleEndChat,
  } = useChat();

  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const quickRepliesRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 处理快捷回复选择
  const handleQuickReplySelect = useCallback((reply) => {
    handleSendMessage({
      text: reply,
      isUser: true,
      type: MessageType.QUICK_REPLY
    });
    setIsQuickReplyOpen(false);
  }, [handleSendMessage]);

  // 监听滚动位置
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // 监听容器大小变化
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

            requestAnimationFrame(() => {
              if (!showScrollButton) {
                messageContainer.scrollTop = messageContainer.scrollHeight;
              }
            });
          }
        }
      }, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(quickRepliesRef.current);
    
    // 添加滚动监听
    messageContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      messageContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isQuickReplyOpen, messageContainerRef, handleScroll, showScrollButton]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      {/* 页面头部 */}
      <Header 
        chatState={chatState}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={setIsSoundEnabled}
        onEndChat={handleEndChat}
        serviceAgent={serviceAgent}
      />

      <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <LoadingScreen />
            </div>
          }>
            <div className="flex-1 overflow-hidden flex flex-col relative">
              {/* 客服信息显示 */}
              <AnimatePresence>
                {serviceAgent && chatState === ChatState.CONNECTED && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col"
                  >
                    <Suspense fallback={<FallbackComponent componentName="UserInfo" />}>
                      <AsyncComponents.UserInfo user={serviceAgent} />
                    </Suspense>
                    <div ref={quickRepliesRef}>
                      <Suspense fallback={<FallbackComponent componentName="QuickReplies" />}>
                        <AsyncComponents.QuickReplies 
                          isOpen={isQuickReplyOpen}
                          onSelect={handleQuickReplySelect}
                          onOpenChange={setIsQuickReplyOpen}
                          selectedCategory={selectedCategory}
                          className="border-t border-gray-800/30"
                        />
                      </Suspense>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 消息列表区域 */}
              <div 
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800/50 
                  scrollbar-track-transparent relative"
                ref={messageContainerRef}
              >
                <Suspense fallback={<FallbackComponent componentName="MessageList" />}>
                  <AsyncComponents.MessageList 
                    messages={messages}
                    isTyping={isAgentTyping}
                    chatState={chatState}
                    onTransferToAgent={handleTransferToAgent}
                    onSendMessage={handleSendMessage}
                  />
                </Suspense>

                {/* 滚动到底部按钮 */}
                <AnimatePresence>
                  {showScrollButton && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600
                        text-white rounded-full p-2 shadow-lg transition-colors"
                      onClick={scrollToBottom}
                    >
                      <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* 消息输入区域 */}
              {(chatState === ChatState.CONNECTED || chatState === ChatState.BOT) && (
                <div className="border-t border-gray-800/30">
                  <Suspense fallback={<FallbackComponent componentName="MessageInput" />}>
                    <AsyncComponents.MessageInput 
                      onSend={handleSendMessage}
                      disabled={isAgentTyping || chatState === ChatState.ENDED}
                      isTyping={isAgentTyping}
                      placeholder={
                        isAgentTyping ? "客服正在输入中..." : 
                        chatState === ChatState.BOT ? "输入您的问题..." :
                        "输入消息..."
                      }
                      onQuickReplyToggle={() => setIsQuickReplyOpen(!isQuickReplyOpen)}
                      showQuickReplyButton={chatState === ChatState.CONNECTED}
                      className="bg-[#0a0f16]"
                    />
                  </Suspense>
                </div>
              )}
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default OnlineSupportPage;
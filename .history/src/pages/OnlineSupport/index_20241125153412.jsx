// src/pages/OnlineSupport/index.jsx
// 在线客服页面主入口 - 整合智能机器人和人工客服功能的主页面

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { ChatState } from './constants/chatConstants';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';

// 动态导入组件
const BotChat = React.lazy(() => import('./components/BotChat')
  .catch(() => ({
    default: () => <div className="text-center text-gray-500 py-4">Failed to load chat component</div>
  }))
);

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

const OnlineSupportPage = () => {
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
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <LoadingScreen />
            </div>
          }>
            <div className="flex-1 overflow-hidden flex flex-col relative">
              {serviceAgent && chatState === ChatState.CONNECTED && (
                <div className="flex flex-col">
                  <UserInfo user={serviceAgent} />
                  <div ref={quickRepliesRef}>
                    <QuickReplies 
                      isOpen={isQuickReplyOpen}
                      onSelect={(reply) => {
                        handleSendMessage({ text: reply, isUser: true });
                        setIsQuickReplyOpen(false);
                      }}
                      onOpenChange={setIsQuickReplyOpen}
                      className="border-t border-gray-800/30"
                    />
                  </div>
                </div>
              )}

              <div 
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800/50 scrollbar-track-transparent" 
                ref={messageContainerRef}
              >
                <MessageList 
                  messages={messages} 
                  isTyping={isAgentTyping}
                />
                
                {chatState === ChatState.BOT && (
                  <BotChat 
                    onTransferToAgent={handleTransferToAgent}
                    onSendMessage={handleSendMessage}
                  />
                )}
              </div>

              {(chatState === ChatState.CONNECTED || chatState === ChatState.BOT) && (
                <div className="border-t border-gray-800/30">
                  <MessageInput 
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
                  />
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
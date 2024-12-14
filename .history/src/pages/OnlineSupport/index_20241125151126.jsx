// E:\Steam\steam-website\src\pages\OnlineSupport\index.jsx
// 在线客服页面主入口 - 整合智能机器人和人工客服功能的主页面

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { ChatState } from './constants/chatConstants';
import LoadingScreen from '../../components/LoadingScreen';

// 导入子组件
const BotChat = React.lazy(() => import('./components/BotChat'));
const QuickReplies = React.lazy(() => import('./components/QuickReplies'));
const MessageList = React.lazy(() => import('./components/MessageList'));
const MessageInput = React.lazy(() => import('./components/MessageInput'));
const UserInfo = React.lazy(() => import('./components/UserInfo'));

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
    messageContainerRef, // 添加这个
  } = useChat();

  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const quickRepliesRef = useRef(null);
  // 移除 messageListRef，因为我们将使用 messageContainerRef 代替
  
  // 修改监听快捷回复容器的高度变化的 useEffect
  useEffect(() => {
    if (!quickRepliesRef.current || !messageContainerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const quickReplyHeight = entry.target.querySelector('.quick-reply-dropdown')?.offsetHeight || 0;
        
        messageContainerRef.current.style.paddingBottom = isQuickReplyOpen ? 
          `${quickReplyHeight + 80}px` : 
          '80px';

        if (isQuickReplyOpen) {
          setTimeout(() => {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
          }, 100);
        }
      }
    });

    resizeObserver.observe(quickRepliesRef.current);
    return () => resizeObserver.disconnect();
  }, [isQuickReplyOpen, messageContainerRef]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <Suspense fallback={<LoadingScreen />}>
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {serviceAgent && chatState === ChatState.CONNECTED && (
              <>
                <UserInfo user={serviceAgent} />
                <QuickReplies 
                  isOpen={isQuickReplyOpen}
                  onSelect={(reply) => handleSendMessage({ text: reply, isUser: true })}
                  className="border-t border-gray-800/30"
                />
              </>
            )}

            {/* 修改 MessageList 组件，使用 messageContainerRef */}
            <div className="flex-1 overflow-y-auto" ref={messageContainerRef}>
              <MessageList messages={messages} />
              
              {chatState === ChatState.BOT && (
                <BotChat 
                  onTransferToAgent={handleTransferToAgent}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>

            {(chatState === ChatState.CONNECTED || chatState === ChatState.BOT) && (
              <MessageInput 
                onSend={handleSendMessage} 
                disabled={isAgentTyping || chatState === ChatState.ENDED} 
                placeholder={
                  isAgentTyping ? "客服正在输入中..." : 
                  chatState === ChatState.BOT ? "输入您的问题..." :
                  "输入消息..."
                }
              />
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default OnlineSupportPage;
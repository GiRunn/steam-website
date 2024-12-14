// src/pages/OnlineSupport/components/MessageList.jsx
// 消息列表组件 - 展示对话消息历史

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Message from './Message';
import BotChat from './BotChat';
import { Loader2 } from 'lucide-react';
import { ChatState } from '../constants/chatConstants';

const MessageList = ({ 
  messages, 
  isTyping = false,
  chatState,
  onTransferToAgent,
  onSendMessage,
  className = "" 
}) => {
  const endOfMessagesRef = useRef(null);
  const listRef = useRef(null);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  // 对消息进行分类和排序
  const organizedContent = React.useMemo(() => {
    // 初始系统消息和欢迎消息
    const initialMessages = messages.filter(
      msg => msg.type === 'system' || msg.isInitialMessage
    );

    // 用户和机器人的对话消息
    const conversationMessages = messages.filter(
      msg => !msg.type && !msg.isInitialMessage
    );

    // 根据聊天状态决定是否显示机器人选项界面
    const shouldShowBotChat = chatState === ChatState.BOT && 
      // 确保没有进行中的对话
      !conversationMessages.some(msg => msg.isUser);

    return {
      initialMessages,
      conversationMessages,
      shouldShowBotChat
    };
  }, [messages, chatState]);

  // 处理滚动位置
  useEffect(() => {
    if (!listRef.current) return;

    const list = listRef.current;
    const currentScrollHeight = list.scrollHeight;
    const currentScrollTop = list.scrollTop;
    
    const shouldAutoScroll = 
      messages.length <= 3 ||
      (currentScrollHeight - (currentScrollTop + list.clientHeight) < 100) ||
      messages[messages.length - 1]?.isUser;

    if (shouldAutoScroll) {
      requestAnimationFrame(() => {
        endOfMessagesRef.current?.scrollIntoView({ 
          behavior: currentScrollTop === 0 ? 'auto' : 'smooth',
          block: 'end' 
        });
      });
    }

    lastScrollHeightRef.current = currentScrollHeight;
    lastScrollTopRef.current = currentScrollTop;
  }, [messages, isTyping]);

  // 监听滚动事件
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const handleScroll = () => {
      lastScrollTopRef.current = list.scrollTop;
    };

    list.addEventListener('scroll', handleScroll);
    return () => list.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={listRef}
      className={`flex-1 overflow-y-auto px-4 py-6 
        scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent
        ${className}`}
    >
      <AnimatePresence mode="sync">
        <div className="flex flex-col space-y-4">
          {/* 渲染初始系统消息和欢迎消息 */}
          {organizedContent.initialMessages.map((message, index) => (
            <motion.div
              key={`initial-${message.id || index}-${message.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Message 
                {...message}
                isSequential={false}
              />
            </motion.div>
          ))}

          {/* 渲染对话消息 */}
          {organizedContent.conversationMessages.map((message, index) => (
            <motion.div
              key={`conversation-${message.id || index}-${message.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Message 
                {...message}
                isSequential={
                  index > 0 && 
                  organizedContent.conversationMessages[index - 1]?.isUser === message.isUser &&
                  (new Date(message.timestamp) - new Date(organizedContent.conversationMessages[index - 1]?.timestamp)) < 60000
                }
              />
            </motion.div>
          ))}
        </div>

        {/* 正在输入提示 */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-gray-500 text-sm pl-4 mt-4"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>正在输入...</span>
          </motion.div>
        )}

        {/* 用于自动滚动的标记 */}
        <div ref={endOfMessagesRef} className="h-1" />
      </AnimatePresence>
    </div>
  );
};

export default React.memo(MessageList);
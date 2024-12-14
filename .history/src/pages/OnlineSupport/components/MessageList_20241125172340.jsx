// src/pages/OnlineSupport/components/MessageList.jsx
// 消息列表组件 - 展示对话消息历史，包含消息分组和自动滚动功能

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Message from './Message';
import { Loader2 } from 'lucide-react';

const MessageList = ({ 
  messages, 
  isTyping = false,
  className = "" 
}) => {
  const endOfMessagesRef = useRef(null);
  const listRef = useRef(null);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  // 消息分组和排序逻辑
  const organizedMessages = React.useMemo(() => {
    // 先将消息按照时间排序
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // 分离固定在顶部的消息和对话消息
    const pinnedMessages = sortedMessages.filter(
      msg => msg.type === 'system' || msg.isInitialMessage
    );
    
    // 获取真正的对话消息（用户消息和机器人回复）
    const chatMessages = sortedMessages.filter(
      msg => !msg.type && !msg.isInitialMessage
    );

    return [...pinnedMessages, ...chatMessages];
  }, [messages]);

  // 处理滚动位置
  useEffect(() => {
    if (!listRef.current) return;

    const list = listRef.current;
    const currentScrollHeight = list.scrollHeight;
    const currentScrollTop = list.scrollTop;
    
    // 检查是否需要自动滚动
    const shouldAutoScroll = 
      // 如果是第一次加载
      messages.length <= 3 ||
      // 或者用户已经接近底部
      (currentScrollHeight - (currentScrollTop + list.clientHeight) < 100) ||
      // 或者是用户发送的新消息
      messages[messages.length - 1]?.isUser;

    if (shouldAutoScroll) {
      requestAnimationFrame(() => {
        endOfMessagesRef.current?.scrollIntoView({ 
          behavior: currentScrollTop === 0 ? 'auto' : 'smooth',
          block: 'end' 
        });
      });
    }

    // 更新上一次的滚动位置
    lastScrollHeightRef.current = currentScrollHeight;
    lastScrollTopRef.current = currentScrollTop;
  }, [messages, isTyping]);

  // 监听滚动事件，保存最后的滚动位置
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
      className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 
        scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent
        ${className}`}
    >
      <AnimatePresence mode="sync">
        <div className="flex flex-col space-y-4">
          {organizedMessages.map((message, index) => (
            <motion.div
              key={`${message.id || index}-${message.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Message 
                {...message}
                isSequential={
                  index > 0 && 
                  organizedMessages[index - 1]?.isUser === message.isUser &&
                  (new Date(message.timestamp) - new Date(organizedMessages[index - 1]?.timestamp)) < 60000
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
            className="flex items-center gap-2 text-gray-500 text-sm pl-4"
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

// 使用 React.memo 优化性能，避免不必要的重渲染
export default React.memo(MessageList);
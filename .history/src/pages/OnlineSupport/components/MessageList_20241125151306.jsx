// E:\Steam\steam-website\src\pages\OnlineSupport\components\MessageList.jsx
// 消息列表组件 - 展示对话消息历史

import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ 
  messages, 
  className = "" 
}) => {
  const endOfMessagesRef = useRef(null);
  const listRef = useRef(null);

  // 自动滚动到最新消息,并添加判断逻辑
  useEffect(() => {
    if (messages.length > 0) {
      const list = listRef.current;
      const isScrolledToBottom = list && 
        (list.scrollHeight - list.scrollTop - list.clientHeight < 100);

      // 只有当用户已经滚动到底部或者是新消息是用户发送的时候才自动滚动
      if (isScrolledToBottom || messages[messages.length - 1]?.isUser) {
        endOfMessagesRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }
  }, [messages]);

  // 处理滚动事件,优化性能
  const handleScroll = React.useCallback((e) => {
    const target = e.target;
    const isNearBottom = 
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    
    // 这里可以添加是否显示"回到底部"按钮的逻辑
    if (isNearBottom) {
      // 用户滚动到底部时的处理
    }
  }, []);

  return (
    <div 
      ref={listRef}
      className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${className}`}
      onScroll={handleScroll}
    >
      {/* 添加消息分组,按日期分组显示 */}
      {messages.map((message, index) => {
        // 添加时间分割线的逻辑
        const showTimestamp = shouldShowTimestamp(message, messages[index - 1]);
        
        return (
          <React.Fragment key={`${message.id || index}-${message.timestamp}`}>
            {showTimestamp && (
              <div className="flex justify-center my-4">
                <span className="text-xs text-gray-500">
                  {formatMessageDate(message.timestamp)}
                </span>
              </div>
            )}
            <Message {...message} />
          </React.Fragment>
        );
      })}
      <div ref={endOfMessagesRef} className="h-1" />
    </div>
  );
};

// 判断是否需要显示时间戳的辅助函数
const shouldShowTimestamp = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;

  const current = new Date(currentMessage.timestamp);
  const previous = new Date(previousMessage.timestamp);

  // 如果两条消息相隔超过5分钟,显示时间戳
  return (current - previous) > 5 * 60 * 1000;
};

// 格式化消息日期的辅助函数
const formatMessageDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // 如果是今天的消息
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  // 如果是昨天的消息
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  // 其他日期的消息
  return date.toLocaleDateString([], { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default React.memo(MessageList);
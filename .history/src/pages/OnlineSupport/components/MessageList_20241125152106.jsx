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

  // 对消息进行排序和过滤
  const organizedMessages = React.useMemo(() => {
    // 初始系统消息
    const systemMessages = messages.filter(msg => 
      msg.type === 'system' && msg.isInitialMessage
    );
    
    // 其他所有消息（包括用户消息和机器人回复）
    const chatMessages = messages.filter(msg => 
      !msg.isInitialMessage
    );

    return [...systemMessages, ...chatMessages];
  }, [messages]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messages.length > 0) {
      const list = listRef.current;
      const isScrolledToBottom = list && 
        (list.scrollHeight - list.scrollTop - list.clientHeight < 100);
        
      if (isScrolledToBottom || messages[messages.length - 1]?.isUser) {
        endOfMessagesRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end' 
        });
      }
    }
  }, [messages]);

  // 处理滚动事件
  const handleScroll = React.useCallback((e) => {
    const target = e.target;
    const isNearBottom = 
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
      
    if (isNearBottom) {
      // 用户滚动到底部时的处理
      // 这里可以添加加载更多历史消息的逻辑
    }
  }, []);

  return (
    <div 
      ref={listRef}
      className={`flex-1 overflow-y-auto px-4 py-6 ${className}`}
      onScroll={handleScroll}
    >
      {/* 主消息列表 */}
      <div className="space-y-4">
        {organizedMessages.map((message, index) => {
          // 计算是否需要显示时间分割线
          const prevMessage = organizedMessages[index - 1];
          const showTimestamp = shouldShowTimestamp(message, prevMessage);
          
          return (
            <React.Fragment key={`${message.id}-${message.timestamp}`}>
              {showTimestamp && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-500">
                    {formatMessageDate(message.timestamp)}
                  </span>
                </div>
              )}
              <Message 
                {...message}
                isSequential={
                  index > 0 && 
                  !showTimestamp &&
                  prevMessage?.isUser === message.isUser
                }
              />
            </React.Fragment>
          );
        })}
      </div>
      
      {/* 用于自动滚动的锚点 */}
      <div ref={endOfMessagesRef} className="h-1" />
    </div>
  );
};

// 判断是否需要显示时间戳的辅助函数
const shouldShowTimestamp = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;

  const current = new Date(currentMessage.timestamp);
  const previous = new Date(previousMessage.timestamp);

  // 如果两条消息相隔超过5分钟，显示时间
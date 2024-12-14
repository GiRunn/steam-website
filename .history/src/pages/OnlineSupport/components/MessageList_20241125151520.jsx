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

  // 对消息进行分类和排序
  const organizedMessages = React.useMemo(() => {
    // 将消息按照类型分组
    const systemMessages = messages.filter(msg => msg.type === 'system');
    const botInitialMessages = messages.filter(
      msg => msg.isBot && !msg.isResponse
    );
    const conversationMessages = messages.filter(
      msg => !msg.type && (msg.isUser || (msg.isBot && msg.isResponse))
    );

    // 确保顺序: 系统消息 -> 机器人初始消息 -> 对话消息
    return [
      ...systemMessages,
      ...botInitialMessages,
      ...conversationMessages
    ];
  }, [messages]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messages.length > 0) {
      const list = listRef.current;
      // 只有当列表接近底部或者是新消息是用户发送的时候才自动滚动
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

  return (
    <div 
      ref={listRef}
      className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${className}`}
    >
      <div className="flex flex-col space-y-4">
        {organizedMessages.map((message, index) => (
          <Message 
            key={`${message.id || index}-${message.timestamp}`}
            {...message}
            isSequential={
              index > 0 && 
              organizedMessages[index - 1]?.isUser === message.isUser &&
              (new Date(message.timestamp) - new Date(organizedMessages[index - 1]?.timestamp)) < 60000
            }
          />
        ))}
      </div>
      <div ref={endOfMessagesRef} className="h-1" />
    </div>
  );
};

export default React.memo(MessageList);
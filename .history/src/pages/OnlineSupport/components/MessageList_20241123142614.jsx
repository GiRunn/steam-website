// E:\Steam\steam-website\src\pages\OnlineSupport\components\MessageList.jsx
// 消息列表组件 - 展示对话消息历史

import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ 
  messages, 
  className = "" 
}) => {
  const endOfMessagesRef = useRef(null);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messages.length > 0) {
      endOfMessagesRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${className}`}>
      {messages.map((message, index) => (
        <Message 
          key={`${message.id || index}-${message.timestamp}`}
          {...message} 
        />
      ))}
      <div ref={endOfMessagesRef} className="h-1" />
    </div>
  );
};

export default MessageList;
// src/pages/OnlineSupport/components/Message.jsx

import React from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { Bot } from 'lucide-react';

const Message = ({ 
  content,
  isUser,
  timestamp,
  isBot,
  isSystem,
  agent
}) => {
  // 系统消息样式
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-800/50 text-gray-400 text-sm px-4 py-1.5 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(
      "flex gap-3 my-2",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* 头像 */}
      <div className={classNames(
        "w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-blue-500" : "bg-gray-700"
      )}>
        {isUser ? (
          <span className="text-sm">我</span>
        ) : (
          agent ? (
            <span className="text-sm">{agent.name[0]}</span>
          ) : (
            <Bot className="w-5 h-5" />
          )
        )}
      </div>
      
      {/* 消息内容 */}
      <div className={classNames(
        "max-w-[70%] break-words",
        isUser ? "items-end" : "items-start"
      )}>
        {/* 发送者名称 */}
        {!isUser && (
          <div className="text-sm text-gray-400 mb-1">
            {agent ? agent.name : "Steam 助手"}
          </div>
        )}
        
        {/* 消息气泡 */}
        <div className={classNames(
          "px-4 py-2 rounded-lg",
          isUser ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-200"
        )}>
          {typeof content === 'string' ? (
            content.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))
          ) : (
            content
          )}
        </div>
        
        {/* 时间戳 */}
        <div className="text-xs text-gray-500 mt-1">
          {format(new Date(timestamp), 'HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Message);
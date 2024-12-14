// E:\Steam\steam-website\src\pages\OnlineSupport\components\Message.jsx
// 单条消息组件 - 展示单条对话消息

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Check } from 'lucide-react';

const MessageStatus = ({ status }) => {
  if (!status) return null;

  return (
    <span className="text-xs">
      {status === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
      {status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400" />}
      {status === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
    </span>
  );
};

const Message = ({ 
  content, 
  isUser, 
  timestamp, 
  status, 
  type = 'text',
  attachments = []
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        max-w-[70%] 
        ${isUser ? 'bg-blue-600' : 'bg-gray-800'} 
        ${type === 'system' ? 'bg-gray-700/50 text-center max-w-full w-full' : ''}
        rounded-lg px-4 py-2 text-white
      `}>
        {/* 文本内容 */}
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        
        {/* 附件展示 */}
        {attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachments.map((attachment, index) => (
              <div 
                key={index}
                className="bg-gray-700/50 rounded p-2 text-sm flex items-center space-x-2"
              >
                {/* 这里可以根据attachment.type展示不同的图标和处理方式 */}
                <span>{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* 消息元信息 */}
        <div className="flex items-center justify-end mt-1 space-x-2">
          <span className="text-xs text-gray-400">{timestamp}</span>
          {isUser && <MessageStatus status={status} />}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
// E:\Steam\steam-website\src\pages\OnlineSupport\components\Message.jsx
// 单条消息组件 - 展示单条对话消息，支持头像显示

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Check, User } from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';

// 头像组件
const Avatar = ({ src, name, isUser }) => {
  return (
    <Tooltip content={name || (isUser ? '我' : '客服')}>
      <motion.div 
        className="flex-shrink-0"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {src ? (
          <img 
            src={src} 
            alt={name || (isUser ? '我' : '客服')}
            className={`w-8 h-8 rounded-full object-cover
              ring-2 transition-shadow duration-300
              ${isUser 
                ? 'ring-blue-500/50 hover:ring-blue-500' 
                : 'ring-gray-500/50 hover:ring-gray-400'}`}
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center
            ${isUser 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
              : 'bg-gradient-to-r from-gray-700 to-gray-600'}
            ring-2 transition-shadow duration-300
            ${isUser 
              ? 'ring-blue-500/50 hover:ring-blue-500' 
              : 'ring-gray-500/50 hover:ring-gray-400'}`}
          >
            <User className="w-4 h-4 text-gray-200" />
          </div>
        )}
      </motion.div>
    </Tooltip>
  );
};

// 消息状态组件
const MessageStatus = ({ status }) => {
  if (!status) return null;

  return (
    <motion.span 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="text-xs"
    >
      {status === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
      {status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400" />}
      {status === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
    </motion.span>
  );
};

// 格式化时间函数
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Time formatting error:', error);
    return '';
  }
};

const Message = ({ 
  content, 
  isUser, 
  timestamp, 
  status, 
  type = 'text',
  attachments = [],
  avatar, // 头像URL
  userName // 用户名称
}) => {
  const formattedTime = formatTime(timestamp);

  // 系统消息样式
  if (type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <div className="bg-gray-800/40 backdrop-blur-sm px-4 py-2 rounded-full
          text-sm text-gray-400 border border-gray-700/30">
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-2 mb-4 group
        ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
    >
      {/* 头像 */}
      <Avatar src={avatar} name={userName} isUser={isUser} />

      {/* 消息内容区 */}
      <div className="flex flex-col space-y-1 max-w-[70%]">
        {/* 用户名 - 仅在非用户消息时显示 */}
        {!isUser && userName && (
          <span className="text-xs text-gray-400 ml-1">{userName}</span>
        )}
        
        <div className={`
          relative
          ${isUser ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-gray-800 to-gray-700'} 
          rounded-2xl px-4 py-2 text-white shadow-lg
          ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
        `}>
          {/* 文本内容 */}
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          
          {/* 附件展示 */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`
                    ${isUser ? 'bg-blue-700/30' : 'bg-black/20'} 
                    rounded-lg p-2 text-sm flex items-center space-x-2
                    hover:bg-opacity-50 transition-colors duration-300
                  `}
                >
                  <span className="truncate">{attachment.name}</span>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* 消息元信息 */}
          <div className={`
            flex items-center space-x-2 mt-1
            ${isUser ? 'justify-end' : 'justify-start'}
            opacity-60 group-hover:opacity-100 transition-opacity duration-300
          `}>
            {formattedTime && (
              <span className="text-xs text-gray-200">{formattedTime}</span>
            )}
            {isUser && <MessageStatus status={status} />}
          </div>

          {/* 消息尾部装饰 */}
          <div className={`absolute top-0 w-2 h-2 
            ${isUser ? 
              '-right-1 bg-blue-500 transform rotate-45' : 
              '-left-1 bg-gray-700 transform rotate-45'}`} 
          />
        </div>
      </div>
    </motion.div>
  );
};

// 默认属性
Message.defaultProps = {
  content: '',
  isUser: false,
  timestamp: null,
  status: null,
  type: 'text',
  attachments: [],
  avatar: null,
  userName: null
};

export default Message;
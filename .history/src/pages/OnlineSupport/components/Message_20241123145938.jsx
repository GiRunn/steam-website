// E:\Steam\steam-website\src\pages\OnlineSupport\components\Message.jsx
// 单条消息组件 - 展示单条对话消息
// 优化版本：添加更多动画效果和视觉反馈

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCheck, 
  Check, 
  File, 
  Download, 
  Image as ImageIcon,
  FileText,
  Play,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns'; // 需要添加date-fns依赖
import { Tooltip } from '../../../components/ui/Tooltip';

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    // 处理不同格式的时间戳
    let date;
    if (typeof timestamp === 'string') {
      // 尝试解析ISO格式的字符串
      date = parseISO(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return '';
    }

    // 验证日期是否有效
    if (!isValid(date)) {
      return '';
    }

    return format(date, 'HH:mm');
  } catch (error) {
    console.error('Time formatting error:', error);
    return '';
  }
};

// 消息状态组件
const MessageStatus = ({ status }) => {
  if (!status) return null;

  const statusConfig = {
    sent: {
      icon: Check,
      color: 'text-gray-400',
      tooltip: '已发送'
    },
    delivered: {
      icon: CheckCheck,
      color: 'text-gray-400',
      tooltip: '已送达'
    },
    read: {
      icon: CheckCheck,
      color: 'text-blue-400',
      tooltip: '已读'
    }
  };

  const config = statusConfig[status];
  if (!config) return null;

  const StatusIcon = config.icon;

  return (
    <Tooltip content={config.tooltip}>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-xs"
      >
        <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
      </motion.span>
    </Tooltip>
  );
};

// 附件类型图标组件
const AttachmentIcon = ({ type }) => {
  let Icon = Paperclip;
  let color = 'text-gray-400';

  if (type.startsWith('image/')) {
    Icon = ImageIcon;
    color = 'text-green-400';
  } else if (type.includes('pdf')) {
    Icon = FileText;
    color = 'text-red-400';
  } else if (type.startsWith('video/')) {
    Icon = Play;
    color = 'text-purple-400';
  } else if (type.includes('document')) {
    Icon = File;
    color = 'text-blue-400';
  }

  return <Icon className={`w-4 h-4 ${color}`} />;
};

// 附件组件
const Attachment = ({ attachment, isUser }) => {
  const isImage = attachment.type.startsWith('image/');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        rounded-lg overflow-hidden transition-all duration-300
        ${isUser ? 'bg-blue-500/30' : 'bg-gray-700/50'}
        hover:bg-opacity-70
      `}
    >
      {isImage ? (
        <div className="relative group">
          <img 
            src={attachment.url || URL.createObjectURL(attachment.file)}
            alt={attachment.name}
            className="max-w-[300px] max-h-[200px] object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
            transition-opacity duration-300 flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
        </div>
      ) : (
        <div className="p-3 flex items-center space-x-3">
          <AttachmentIcon type={attachment.type} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200 truncate">{attachment.name}</p>
            <p className="text-xs text-gray-400">
              {(attachment.size / 1024).toFixed(1)}KB
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-gray-300"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// 系统消息组件
const SystemMessage = ({ content, timestamp }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-center my-4"
  >
    <div className="bg-gray-800/40 backdrop-blur-sm px-4 py-2 rounded-full
      text-sm text-gray-400 flex items-center space-x-2 border border-gray-700/30">
      <span>{content}</span>
      {timestamp && (
        <>
          <span className="w-1 h-1 bg-gray-600 rounded-full" />
          <span className="text-xs">{timestamp}</span>
        </>
      )}
    </div>
  </motion.div>
);

// 主消息组件
const Message = ({ 
  content, 
  isUser, 
  timestamp, 
  status, 
  type = 'text',
  attachments = [],
  avatar,
  userName
}) => {
  if (type === 'system') {
    return <SystemMessage content={content} timestamp={timestamp} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div className={`
        relative max-w-[70%]
        ${isUser ? 'order-last' : 'order-first'}
      `}>
        {/* 用户头像 */}
        {!isUser && userName && (
          <div className="absolute -top-6 left-0 text-sm text-gray-400">
            {userName}
          </div>
        )}

        {/* 消息内容 */}
        <div className={`
          rounded-2xl px-4 py-2.5
          ${isUser ? 
            'bg-gradient-to-br from-blue-600 to-blue-500 text-white' : 
            'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-100'}
          ${attachments.length > 0 ? 'space-y-3' : ''}
          shadow-lg
        `}>
          {/* 文本内容 */}
          {content && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </p>
          )}
          
          {/* 附件展示 */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <Attachment 
                  key={index} 
                  attachment={attachment}
                  isUser={isUser}
                />
              ))}
            </div>
          )}
          
          {/* 消息元信息 */}
          <div className={`
            flex items-center space-x-2 mt-1
            ${isUser ? 'justify-end' : 'justify-start'}
            opacity-60 group-hover:opacity-100 transition-opacity duration-300
          `}>
            <span className="text-xs">
              {format(new Date(timestamp), 'HH:mm')}
            </span>
            {isUser && <MessageStatus status={status} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 默认属性
Message.defaultProps = {
  content: '',
  isUser: false,
  timestamp: new Date().toISOString(),
  status: null,
  type: 'text',
  attachments: []
};

export default Message;
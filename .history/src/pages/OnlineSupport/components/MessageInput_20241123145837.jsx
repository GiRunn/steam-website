// E:\Steam\steam-website\src\pages\OnlineSupport\components\MessageInput.jsx
// 消息输入组件 - 处理消息输入、表情、附件等功能
// 优化版本：添加更多动画效果和交互体验

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  Image, 
  Smile, 
  Send,
  X,
  FileText,
  File,
  AlertCircle
} from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';


// E:\Steam\steam-website\src\pages\OnlineSupport\components\Message.jsx
// 单条消息组件 - 展示单条对话消息
// 修复时间戳处理逻辑

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
import { format, isValid, parseISO } from 'date-fns'; // 添加isValid和parseISO
import { Tooltip } from '../../../components/ui/Tooltip';

// ... 其他组件代码保持不变 ...

// 格式化时间的工具函数
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
    return <SystemMessage content={content} timestamp={formatMessageTime(timestamp)} />;
  }

  const formattedTime = formatMessageTime(timestamp);

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
            {formattedTime && (
              <span className="text-xs">
                {formattedTime}
              </span>
            )}
            {isUser && <MessageStatus status={status} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 文件类型图标映射
const FileTypeIcon = ({ type }) => {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

// 附件预览组件
const AttachmentPreview = ({ attachment, onRemove }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg px-3 py-1.5
      flex items-center space-x-2 group hover:from-gray-700 hover:to-gray-600
      transition-all duration-300 border border-gray-600/30"
  >
    <FileTypeIcon type={attachment.type} />
    <span className="text-sm text-gray-300 truncate max-w-[150px]">
      {attachment.name}
    </span>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onRemove()}
      className="text-gray-400 hover:text-red-400 transition-colors"
    >
      <X className="w-4 h-4" />
    </motion.button>
  </motion.div>
);

// 表情选择器组件
const EmojiPicker = ({ onSelect, onClose }) => {
  const emojis = ['😊', '👍', '🎮', '❤️', '😄', '🎯', '💡', '✨', 
                  '🤔', '👀', '🎉', '🌟', '💪', '🙏', '👋', '🔥'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full mb-2 bg-gradient-to-b from-gray-800 to-gray-700
        rounded-xl border border-gray-600/30 shadow-lg p-3 backdrop-blur-sm"
    >
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-sm text-gray-300 font-medium">快捷表情</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      <motion.div 
        className="grid grid-cols-8 gap-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.03
            }
          }
        }}
      >
        {emojis.map((emoji, i) => (
          <motion.button
            key={i}
            variants={{
              hidden: { opacity: 0, scale: 0.3 },
              visible: { opacity: 1, scale: 1 }
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(emoji)}
            className="text-xl hover:bg-gray-600/30 p-1.5 rounded-lg
              transition-colors duration-200"
          >
            {emoji}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

// 工具按钮组件
const ToolButton = ({ icon: Icon, label, onClick, active = false }) => (
  <Tooltip content={label}>
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`p-2 rounded-lg text-gray-400 transition-all duration-200
        ${active ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-700'}`}
    >
      <Icon className="w-5 h-5" />
    </motion.button>
  </Tooltip>
);

// 主组件
const MessageInput = ({ 
  onSend, 
  disabled = false,
  placeholder = "输入消息...",
  maxLength = 1000,
  className = ""
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isOverSize, setIsOverSize] = useState(false);
  const fileInputRef = useRef(null);

  // 文件大小限制（20MB）
  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend({ 
        text: message,
        attachments 
      });
      setMessage('');
      setAttachments([]);
      setShowEmoji(false);
    }
  }, [message, attachments, disabled, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const oversizedFiles = files.some(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles) {
      setIsOverSize(true);
      setTimeout(() => setIsOverSize(false), 3000);
      return;
    }

    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    // 重置input值，允许重复选择相同文件
    e.target.value = '';
  }, []);

  return (
    <div className={`border-t border-gray-800 p-4 space-y-3 ${className}`}>
      {/* 文件大小警告 */}
      <AnimatePresence>
        {isOverSize && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center space-x-2 text-yellow-500 text-sm bg-yellow-500/10
              px-3 py-2 rounded-lg"
          >
            <AlertCircle className="w-4 h-4" />
            <span>文件大小不能超过 20MB</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 附件预览 */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {attachments.map((attachment, index) => (
              <AttachmentPreview
                key={index}
                attachment={attachment}
                onRemove={() => {
                  setAttachments(prev => prev.filter((_, i) => i !== index));
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表情选择器 */}
      <AnimatePresence>
        {showEmoji && (
          <div className="relative">
            <EmojiPicker
              onSelect={(emoji) => {
                setMessage(prev => prev + emoji);
                setShowEmoji(false);
              }}
              onClose={() => setShowEmoji(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= maxLength) {
                  setMessage(newValue);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "客服正在输入中..." : placeholder}
              disabled={disabled}
              className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none min-h-[44px] max-h-[120px]
                border border-gray-700/50 transition-all duration-300"
              rows={1}
            />
            <AnimatePresence>
              {message.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-3 bottom-2 text-xs"
                >
                  <span className={`${
                    message.length > maxLength * 0.8 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {message.length}/{maxLength}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 工具按钮组 */}
          <div className="flex items-center space-x-1">
            <ToolButton
              icon={Smile}
              label="添加表情"
              onClick={() => setShowEmoji(!showEmoji)}
              active={showEmoji}
            />
            <ToolButton
              icon={Paperclip}
              label="添加附件"
              onClick={() => fileInputRef.current?.click()}
            />
            <ToolButton
              icon={Image}
              label="发送图片"
              onClick={() => {
                fileInputRef.current.accept = "image/*";
                fileInputRef.current?.click();
              }}
            />
            <motion.button
              type="submit"
              disabled={!message.trim() || disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r from-blue-600 to-blue-500 
                text-white p-2 px-4 rounded-lg flex items-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg
                ${message.trim() ? 'hover:from-blue-500 hover:to-blue-400' : ''}`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
      </form>
    </div>
  );
};

// 默认属性 - 修改默认时间戳
Message.defaultProps = {
  content: '',
  isUser: false,
  timestamp: new Date().toISOString(), // 确保默认时间戳是有效的ISO字符串
  status: null,
  type: 'text',
  attachments: []
};

export default MessageInput;
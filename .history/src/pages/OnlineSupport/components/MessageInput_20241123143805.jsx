// E:\Steam\steam-website\src\pages\OnlineSupport\components\MessageInput.jsx
// 消息输入组件 - 处理消息输入、表情、附件等功能

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  Image, 
  Smile, 
  Send,
  X
} from 'lucide-react';
// 从相对路径改为
import { Tooltip } from '../../../components/ui/Tooltip';

// 表情选择器组件
const EmojiPicker = ({ onSelect, onClose }) => {
  const emojis = ['😊', '👍', '🎮', '❤️', '😄', '🎯', '💡', '✨', 
                  '🤔', '👀', '🎉', '🌟', '💪', '🙏', '👋', '🔥'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full mb-2 p-2 bg-gray-800 rounded-lg
        border border-gray-700 shadow-lg"
    >
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-sm text-gray-400">表情符号</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {emojis.map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="text-xl hover:bg-gray-700 p-1 rounded
              transition-colors duration-200"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

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
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend({ 
        text: message,
        attachments 
      });
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`border-t border-gray-800 p-4 space-y-2 ${className}`}>
      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded px-2 py-1 text-sm 
                flex items-center space-x-2"
            >
              <span className="text-gray-300 truncate max-w-[150px]">
                {attachment.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center space-x-2">
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
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none min-h-[44px] max-h-[120px]"
              rows={1}
            />
            {message.length > 0 && (
              <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* 工具按钮 */}
          <div className="flex items-center space-x-2">
            <Tooltip content="添加表情">
              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 
                  hover:text-gray-300 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip content="添加附件">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 
                  hover:text-gray-300 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip content="发送图片">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 
                  hover:text-gray-300 transition-colors"
              >
                <Image className="w-5 h-5" />
              </button>
            </Tooltip>

            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="bg-blue-600 text-white p-2 rounded-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
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

export default MessageInput;
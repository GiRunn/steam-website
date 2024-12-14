// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 评论区回复编辑器 - 专门用于评论区的轻量级回复输入组件

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommentReplyEditor = ({ 
  onSubmit, 
  onCancel,
  replyTo,
  maxLength = 500,
  placeholder = "写下你的回复..." 
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  // 自动聚焦输入框
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  // 处理提交
  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxLength || isLoading) return;
    
    try {
      setIsLoading(true);
      await onSubmit(content.trim());
      setContent('');
      onCancel?.();
    } catch (error) {
      console.error('Reply submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理快捷键
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="bg-[#141822] rounded-xl border border-gray-800/50 overflow-hidden"
    >
      {/* 回复标题 */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800/30">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-medium text-gray-300">
            回复 {replyTo ? `@${replyTo}` : ''}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-300 rounded-lg
            hover:bg-gray-700/50 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 输入区域 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            const newContent = e.target.value;
            if (newContent.length <= maxLength) {
              setContent(newContent);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`
            w-full bg-transparent text-gray-200 placeholder-gray-500
            px-4 py-3 min-h-[80px] max-h-[160px]
            resize-none outline-none
            font-['Inter']
            ${isLoading ? 'opacity-50' : ''}
          `}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#374151 transparent'
          }}
        />

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 
          bg-[#0d111a]/50 border-t border-gray-800/30">
          <div className="flex items-center gap-2">
            {/* 字数计数 */}
            <span className={`
              text-xs transition-colors duration-200
              ${content.length > maxLength * 0.8 
                ? content.length > maxLength 
                  ? 'text-red-400' 
                  : 'text-yellow-400'
                : 'text-gray-500'
              }
              font-['SF_Pro_Text']
            `}>
              {content.length} / {maxLength}
            </span>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || isLoading}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg
                text-sm font-medium transition-all duration-200
                ${content.trim() && content.length <= maxLength && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }
                font-['SF_Pro_Text']
              `}
            >
              <Send className="w-4 h-4" />
              <span>发送</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReplyEditor;
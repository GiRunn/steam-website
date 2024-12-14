// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 评论区回复编辑器 - 优化后的UI设计

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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // 限制最大高度
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
      className="bg-[#0a0f16] rounded-xl border border-gray-800 overflow-hidden
        shadow-lg backdrop-blur-sm"
    >
      {/* 回复标题 */}
      <div className="px-4 py-3 flex items-center justify-between 
        border-b border-gray-800/50 bg-gray-800/20">
        <div className="flex items-center gap-2">
          <span className="font-['SF_Pro_Display'] text-lg font-semibold text-gray-200">
            {replyTo ? `回复 @${replyTo}` : '写下你的回复'}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg
            hover:bg-gray-700/50 transition-all duration-200
            active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 输入区域 */}
      <div className="relative bg-[#141822]/50">
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
            w-full bg-transparent
            text-gray-300 placeholder-gray-500
            px-4 py-3 min-h-[100px] max-h-[200px]
            resize-none outline-none
            font-['Inter'] text-base leading-relaxed
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            transition-all duration-200
            focus:ring-1 focus:ring-blue-500/30
          `}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#374151 transparent'
          }}
        />

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 
          bg-[#0d111a] border-t border-gray-800/50">
          <div className="flex items-center gap-4">
            {/* 快捷提示 */}
            <span className="text-sm text-gray-500 font-['SF_Pro_Text']">
              按 <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-xs">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-xs">Enter</kbd> 发送
            </span>
            
            {/* 字数计数 */}
            <span className={`
              text-sm transition-colors duration-200
              font-['SF_Pro_Text']
              ${content.length > maxLength * 0.8 
                ? content.length > maxLength 
                  ? 'text-red-400' 
                  : 'text-yellow-400'
                : 'text-gray-500'
              }
            `}>
              {content.length} / {maxLength}
            </span>
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              font-['SF_Pro_Text'] text-sm font-medium
              transition-all duration-200
              ${content.trim() && content.length <= maxLength && !isLoading
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
              }
              disabled:opacity-50
              shadow-sm
            `}
          >
            <Send className="w-4 h-4" />
            <span>发送回复</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReplyEditor;
// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 评论回复编辑器组件 - 优化版本

import React, { useState, useRef, useEffect } from 'react';
import { AtSign, Hash, Smile, Image as ImageIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 工具栏按钮子组件
const ToolbarButton = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-2 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800/50
      transition-all duration-200 disabled:opacity-50 disabled:hover:bg-transparent
      group relative"
    aria-label={label}
  >
    <Icon className="w-4 h-4" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 
      text-xs bg-gray-800 text-gray-300 rounded opacity-0 group-hover:opacity-100
      transition-opacity duration-200 whitespace-nowrap">
      {label}
    </span>
  </button>
);

// 主评论编辑器组件
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

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  // 处理提交逻辑
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

  // 快捷键处理
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-[#0a0f16] rounded-lg overflow-hidden border border-gray-800/50
        focus-within:border-blue-500/30 transition-colors duration-300"
    >
      <div className="relative">
        {/* 回复对象提示 */}
        {replyTo && (
          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-800/30">
            回复 <span className="text-blue-400">@{replyTo}</span>
          </div>
        )}
        
        {/* 文本输入区域 */}
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
          className="w-full bg-transparent text-gray-200 placeholder-gray-600
            px-4 py-3 min-h-[120px] max-h-[200px]
            resize-none outline-none
            font-['Inter'] text-sm leading-relaxed"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#374151 transparent'
          }}
        />
        
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 
          border-t border-gray-800/30 bg-gray-900/20">
          <div className="flex items-center gap-1">
            <ToolbarButton icon={AtSign} label="提及用户" />
            <ToolbarButton icon={Hash} label="添加话题" />
            <ToolbarButton icon={Smile} label="插入表情" />
            <ToolbarButton icon={ImageIcon} label="上传图片" />
          </div>

          <div className="flex items-center gap-4">
            {/* 字数统计 */}
            <span className={`text-xs transition-colors duration-200 
              ${content.length > maxLength * 0.8 
                ? 'text-yellow-500' 
                : content.length === maxLength 
                  ? 'text-red-500' 
                  : 'text-gray-500'}`}>
              {content.length} / {maxLength}
            </span>
            
            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || isLoading}
              className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 
                disabled:bg-gray-800/50 disabled:text-gray-600
                px-4 py-1.5 rounded-md text-sm font-medium
                transition-all duration-200
                flex items-center gap-2"
            >
              发送回复
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReplyEditor;
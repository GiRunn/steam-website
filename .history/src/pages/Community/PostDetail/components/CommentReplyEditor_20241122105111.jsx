// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 文件作用：回复编辑器组件，用于输入和提交回复内容

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';

const CommentReplyEditor = ({
  replyTo,
  onSubmit,
  onCancel,
  maxLength = 500,
  placeholder = '写下你的回复...'
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);
  
  useEffect(() => {
    // 自动聚焦输入框
    textareaRef.current?.focus();
  }, []);

  // 处理提交
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    try {
      await onSubmit(content);
      setContent(''); // 清空输入
      onCancel(); // 关闭编辑器
    } catch (error) {
      console.error('回复提交失败:', error);
    }
  };

  // 处理回车提交
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      {/* 编辑器头部 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400 font-['SF_Pro_Text']">
          回复 <span className="text-blue-400">@{replyTo}</span>
        </span>
        <span className="text-xs text-gray-500">
          {content.length}/{maxLength}
        </span>
      </div>

      {/* 文本输入区 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows="3"
          className="w-full bg-gray-900/50 rounded-lg p-3 
            text-gray-200 placeholder-gray-500
            resize-none outline-none
            border border-gray-700/50 focus:border-blue-500/50
            transition-colors duration-200
            font-['SF_Pro_Text']"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-3 mt-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="px-4 py-2 rounded-lg
            text-gray-400 hover:text-gray-300
            bg-gray-700/50 hover:bg-gray-700
            transition-colors duration-200
            flex items-center gap-2
            text-sm font-['SF_Pro_Text']"
        >
          <X className="w-4 h-4" />
          取消
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`
            px-4 py-2 rounded-lg
            flex items-center gap-2
            text-sm font-['SF_Pro_Text']
            ${content.trim() 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}
            transition-colors duration-200
          `}
        >
          <Send className="w-4 h-4" />
          发送回复
        </motion.button>
      </div>
    </div>
  );
};

export default CommentReplyEditor;
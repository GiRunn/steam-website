// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 评论区回复编辑器 - 极简设计风格

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#0a0f16] rounded-lg overflow-hidden border border-gray-800/50"
    >
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
          className="w-full bg-transparent text-gray-200 placeholder-gray-600
            px-4 py-3 h-[120px]
            resize-none outline-none
            font-['Inter'] text-base"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '::-webkit-scrollbar': { display: 'none' }
          }}
        />
        
        <div className="flex items-center justify-between px-4 py-2 
          border-t border-gray-800/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-['SF_Pro_Text']">
              按 <span className="text-gray-500">⌘</span> + <span className="text-gray-500">Enter</span> 发送
            </span>
            <span className="text-sm text-gray-600 font-['SF_Pro_Text'] ml-4">
              {content.length} / {maxLength}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className="text-blue-500 hover:text-blue-400 disabled:text-gray-600
              flex items-center gap-1 text-sm font-['SF_Pro_Text']"
          >
            发送回复
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReplyEditor;
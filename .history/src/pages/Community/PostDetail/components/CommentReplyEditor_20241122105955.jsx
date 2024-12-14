// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 极简风格的评论回复编辑器

import React, { useState, useRef, useEffect } from 'react';
import { AtSign, Hash, Smile, Image as ImageIcon, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CommentReplyEditor = ({ 
  onSubmit, 
  onCancel,
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

  return (
    <div className="relative border border-blue-500/20 rounded focus-within:border-blue-500/50
      transition-colors duration-200">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          if (newContent.length <= maxLength) {
            setContent(newContent);
          }
        }}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full bg-transparent text-gray-200 placeholder-gray-600
          px-3 py-2 h-[100px] resize-none outline-none text-sm"
      />
      
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-800/20">
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-gray-500 hover:text-gray-400">
            <AtSign className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-400">
            <Hash className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-400">
            <Smile className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-400">
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {content.length} / {maxLength}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className="text-xs text-gray-400 hover:text-gray-300 
              flex items-center gap-1 disabled:text-gray-600"
          >
            发送
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentReplyEditor;
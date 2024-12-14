// src/pages/Community/components/CommentEditor.jsx
// 现代简约风格评论编辑器组件 - 提供评论编辑、图片上传等功能

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 加载状态子组件
const LoadingSpinner = ({ text = "发送中..." }) => (
  <div className="absolute inset-0 bg-[#0a0f16]/80 backdrop-blur-sm 
    flex items-center justify-center rounded-lg z-50">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      <span className="text-sm text-gray-300 font-medium">{text}</span>
    </div>
  </div>
);

// 图片预览子组件
const AttachmentPreview = ({ files, onRemove }) => {
  if (!files?.length) return null;

  return (
    <div className="mt-3 grid grid-cols-4 gap-3">
      {files.map((file, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative group"
        >
          <div className="relative overflow-hidden rounded-lg aspect-square">
            <img
              src={URL.createObjectURL(file)}
              alt={`附件 ${index + 1}`}
              className="w-full h-full object-cover transform 
                group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t 
              from-black/50 via-transparent opacity-0 
              group-hover:opacity-100 transition-opacity duration-300"/>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 p-1.5 
              bg-[#0a0f16] text-gray-400 rounded-full
              shadow-lg border border-gray-800/50
              opacity-0 group-hover:opacity-100 
              hover:text-red-400 hover:border-red-500/50
              transform hover:scale-110
              transition-all duration-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// 主评论编辑器组件
const CommentEditor = ({
  onSubmit,
  maxLength = 500,
  placeholder = "写下你的想法...",
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  // 处理图片上传
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 4;

    if (files.length + attachments.length > maxFiles) {
      setError(`最多只能上传${maxFiles}张图片`);
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) {
        setError('只支持上传图片文件');
        return false;
      }
      if (!isValidSize) {
        setError('图片大小不能超过5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
      setError('');
    }
    e.target.value = '';
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!content.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('content', content.trim());
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await onSubmit(formData);
      
      setContent('');
      setAttachments([]);
      setIsFocused(false);
      
    } catch (err) {
      setError('发送失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 快捷键支持
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-lg
        border transition-colors duration-200
        ${isFocused 
          ? 'bg-[#0a0f16] border-blue-500/30' 
          : 'bg-[#0a0f16]/80 border-gray-800/30 hover:border-gray-800'
        }`}
    >
      {isLoading && <LoadingSpinner />}

      <div className="p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => {
            const newContent = e.target.value;
            if (newContent.length <= maxLength) {
              setContent(newContent);
              setError('');
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full bg-transparent text-gray-200 
            placeholder-gray-600/50 outline-none resize-none
            min-h-[120px] leading-relaxed text-base
            transition-colors duration-200"
        />

        <AnimatePresence>
          <AttachmentPreview 
            files={attachments}
            onRemove={index => {
              setAttachments(prev => prev.filter((_, i) => i !== index));
            }}
          />
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400 flex items-center gap-2"
          >
            <div className="w-1 h-1 rounded-full bg-red-400" />
            {error}
          </motion.div>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between 
        border-t border-gray-800/20 bg-[#0a0f16]/40">
        <div className="flex items-center gap-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= 4 || isLoading}
            className="text-gray-500 hover:text-gray-300
              transition-all duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-110 active:scale-95"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
              content.length > maxLength 
                ? 'bg-red-500'
                : content.length > maxLength * 0.8 
                ? 'bg-yellow-500'
                : 'bg-gray-600'
            }`} />
            <span className={`text-sm transition-colors duration-200 ${
              content.length > maxLength 
                ? 'text-red-400' 
                : content.length > maxLength * 0.8
                ? 'text-yellow-400'
                : 'text-gray-600'
            }`}>
              {content.length} / {maxLength}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            按 <kbd className="px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-400">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-400">Enter</kbd> 发送
          </span>
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
              text-sm font-medium transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              enabled:hover:scale-105 active:scale-95
              bg-blue-500 text-white shadow-lg shadow-blue-500/20
              hover:bg-blue-400 hover:shadow-blue-400/30"
          >
            发送
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentEditor;
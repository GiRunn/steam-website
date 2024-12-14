// src/pages/Community/components/CommentEditor.jsx
// 现代简约风格评论编辑器组件 - 增强交互动效版本

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 加载状态子组件
const LoadingSpinner = ({ text = "发送中..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-[#0a0f16]/90 backdrop-blur-sm 
      flex items-center justify-center rounded-lg z-50"
  >
    <motion.div 
      className="flex flex-col items-center gap-2"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      <span className="text-sm text-gray-300 font-medium">{text}</span>
    </motion.div>
  </motion.div>
);

// 图片预览子组件
const AttachmentPreview = ({ files, onRemove }) => {
  if (!files?.length) return null;

  return (
    <motion.div 
      className="mt-2 grid grid-cols-4 gap-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {files.map((file, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-900/50">
            <img
              src={URL.createObjectURL(file)}
              alt={`附件 ${index + 1}`}
              className="w-full h-full object-cover transform 
                group-hover:scale-110 transition-transform duration-500"
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <motion.button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 p-1.5 
              bg-[#0a0f16] text-gray-400 rounded-full
              shadow-lg opacity-0 group-hover:opacity-100
              hover:text-red-400 hover:shadow-red-500/20"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      ))}
    </motion.div>
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`; // 减小最大高度
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
      className={`relative overflow-hidden rounded-lg mr-6
        transition-all duration-300 ease-out
        ${isFocused 
          ? 'bg-[#0a0f16] shadow-lg shadow-blue-500/5' 
          : 'bg-[#0a0f16]/80'
        }`}
    >
      <AnimatePresence>
        {isLoading && <LoadingSpinner />}
      </AnimatePresence>

      <div className="py-2 px-4">
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
    min-h-[90px] leading-relaxed text-base
    transition-colors duration-200
    focus:ring-0 focus:outline-none" // 添加这一行
/>

        <AnimatePresence>
          <AttachmentPreview 
            files={attachments}
            onRemove={index => {
              setAttachments(prev => prev.filter((_, i) => i !== index));
            }}
          />
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-red-400 flex items-center gap-2"
            >
              <motion.div 
                className="w-1 h-1 rounded-full bg-red-400"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        className="px-4 py-2 flex items-center justify-between 
          border-t border-gray-800/20 bg-[#0a0f16]/40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= 4 || isLoading}
            className="text-gray-500 hover:text-gray-300
              transition-colors duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ImageIcon className="w-5 h-5" />
          </motion.button>
          
          <motion.div 
            className="flex items-center gap-2"
            initial={false}
            animate={{
              scale: content.length > maxLength * 0.8 ? [1, 1.1, 1] : 1,
              transition: { duration: 0.3 }
            }}
          >
            <motion.div 
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                content.length > maxLength 
                  ? 'bg-red-500'
                  : content.length > maxLength * 0.8 
                  ? 'bg-yellow-500'
                  : 'bg-gray-600'
              }`}
              animate={{
                scale: content.length > maxLength ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.5, repeat: content.length > maxLength ? Infinity : 0 }}
            />
            <span className={`text-sm transition-colors duration-300 ${
              content.length > maxLength 
                ? 'text-red-400' 
                : content.length > maxLength * 0.8
                ? 'text-yellow-400'
                : 'text-gray-600'
            }`}>
              {content.length} / {maxLength}
            </span>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <motion.span 
            className="text-xs text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-400">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-400">Enter</kbd>
          </motion.span>
          
          <motion.button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg
              text-sm font-medium 
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-blue-500 text-white shadow-lg shadow-blue-500/20
              hover:bg-blue-400 hover:shadow-blue-400/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            发送
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommentEditor;
// src/pages/Community/components/CommentEditor.jsx
// 轻量级评论编辑器组件 - 简约设计风格

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 加载状态组件
const LoadingSpinner = ({ text = "发送中..." }) => (
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm 
    flex items-center justify-center rounded-xl z-50">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      <span className="text-sm text-gray-200">{text}</span>
    </div>
  </div>
);

// 附件预览组件
const AttachmentPreview = ({ files, onRemove }) => {
  if (!files?.length) return null;

  return (
    <div className="mt-3 grid grid-cols-4 gap-2">
      {files.map((file, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative group"
        >
          <img
            src={URL.createObjectURL(file)}
            alt={`附件 ${index + 1}`}
            className="w-full h-20 object-cover rounded-lg border border-gray-800/50"
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-1 -right-1 p-1.5 
              bg-gray-900 text-gray-400 rounded-full
              opacity-0 group-hover:opacity-100
              hover:text-white transition-all duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

const CommentEditor = ({
  onSubmit,
  maxLength = 500,
  placeholder = "写下你的评论...",
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (files.length + attachments.length > 4) {
      setError('最多只能上传4张图片');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= maxSize;
      return isValidType && isValidSize;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    setError('');
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-[#141822] rounded-xl overflow-hidden 
        border border-gray-800/50"
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
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full bg-transparent text-gray-200 
            placeholder-gray-600 outline-none resize-none
            min-h-[100px] leading-relaxed"
          style={{
            background: 'linear-gradient(145deg, rgba(20,24,34,0.3), rgba(17,21,31,0.3))'
          }}
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
          <div className="mt-2 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between 
        border-t border-gray-800/30 bg-[#0d111a]/50">
        <div className="flex items-center gap-4">
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
            disabled={attachments.length >= 4}
            className="text-gray-500 hover:text-gray-400 
              transition-colors disabled:opacity-50
              disabled:cursor-not-allowed"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <span className={`text-sm ${
            content.length > maxLength * 0.8 
              ? content.length > maxLength 
                ? 'text-red-400' 
                : 'text-yellow-400'
              : 'text-gray-600'
          }`}>
            {content.length} / {maxLength}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || content.length > maxLength || isLoading}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg
            text-sm font-medium transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
        >
          发送
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default CommentEditor;
// src/pages/Community/components/CommunityHeader.jsx
// 评论区编辑器组件 - 支持表情、图片上传、@提及、话题标签等功能

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, Smile, Hash, 
  AtSign, X, Loader2, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 图片预览组件
const ImagePreview = ({ images, onRemove }) => {
  if (!images?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative group"
        >
          <img
            src={URL.createObjectURL(image)}
            alt={`预览图 ${index + 1}`}
            className="w-20 h-20 object-cover rounded-lg
              border border-gray-700/50"
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 p-1 
              bg-red-500 text-white rounded-full
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// 工具栏按钮组件
const ToolbarButton = ({ icon: Icon, label, onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      p-2 rounded-lg transition-colors duration-200
      ${active 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
      }
    `}
    title={label}
  >
    <Icon className="w-5 h-5" />
  </motion.button>
);

// 主评论编辑器组件
const CommentEditor = ({
  onSubmit,
  replyTo = null,
  maxLength = 1000,
  placeholder = "写下你的评论...",
  allowImages = true,
  allowEmoji = true,
}) => {
  // 状态管理
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // refs
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  }, [content]);

  // 处理图片上传
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validImages.length + images.length > 4) {
      alert('最多只能上传4张图片');
      return;
    }

    setImages(prev => [...prev, ...validImages]);
    e.target.value = null;
  }, [images]);

  // 处理图片移除
  const handleImageRemove = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 处理评论提交
  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxLength || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // 创建FormData对象上传图片
      const formData = new FormData();
      formData.append('content', content.trim());
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      if (replyTo) {
        formData.append('replyTo', replyTo);
      }

      await onSubmit(formData);
      
      // 清空表单
      setContent('');
      setImages([]);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Comment submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 键盘快捷键
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
      className="bg-[#0a0f16] rounded-lg overflow-hidden 
        border border-gray-800/50 shadow-lg"
    >
      <div className="relative">
        {/* 文本编辑区 */}
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
          disabled={isSubmitting}
          className="w-full bg-transparent text-gray-200 
            placeholder-gray-600 px-4 pt-4 
            min-h-[120px] max-h-[300px]
            resize-none outline-none
            font-['Inter'] text-base
            scrollbar-thin scrollbar-track-transparent
            scrollbar-thumb-gray-700/50"
        />

        {/* 图片预览 */}
        <AnimatePresence>
          <ImagePreview 
            images={images} 
            onRemove={handleImageRemove} 
          />
        </AnimatePresence>

        {/* 工具栏 */}
        <div className="flex items-center justify-between 
          px-4 py-3 border-t border-gray-800/30">
          <div className="flex items-center gap-2">
            {allowImages && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <ToolbarButton
                  icon={Camera}
                  label="上传图片"
                  onClick={() => fileInputRef.current?.click()}
                />
              </>
            )}
            {allowEmoji && (
              <ToolbarButton
                icon={Smile}
                label="插入表情"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                active={showEmojiPicker}
              />
            )}
            <ToolbarButton
              icon={AtSign}
              label="提及用户"
              onClick={() => setContent(prev => `${prev}@`)}
            />
            <ToolbarButton
              icon={Hash}
              label="添加话题"
              onClick={() => setContent(prev => `${prev}#`)}
            />
          </div>

          {/* 字数统计和提交按钮 */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-['SF_Pro_Text']">
              {content.length} / {maxLength}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || isSubmitting}
              className="flex items-center gap-2 px-4 py-2
                bg-blue-500 text-white rounded-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="font-['SF_Pro_Text']">
                发送
              </span>
            </motion.button>
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className="absolute bottom-3 left-4 
          text-sm text-gray-600 font-['SF_Pro_Text']">
          按 <kbd className="text-gray-500">⌘</kbd> + 
          <kbd className="text-gray-500">Enter</kbd> 发送
        </div>
      </div>
    </motion.div>
  );
};

export default CommentEditor;
// src/pages/Community/components/CommentEditor.jsx
// 简约风格的评论编辑器组件 - 专注于写作体验

import React, { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

// 图片预览组件
const ImagePreview = ({ images, onRemove }) => {
  if (!images?.length) return null;
  
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <img
            src={URL.createObjectURL(image)}
            alt={`预览图 ${index + 1}`}
            className="w-16 h-16 object-cover rounded-md 
              ring-1 ring-gray-700/50"
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-1.5 -right-1.5 
              bg-gray-900 text-gray-400 rounded-full
              w-5 h-5 flex items-center justify-center
              opacity-0 group-hover:opacity-100 
              transition-opacity duration-200
              hover:text-gray-200"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

const CommentEditor = ({
  onSubmit,
  maxLength = 500,
  placeholder = "写下你的评论...",
  allowImages = true
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      alert('最多只能上传4张图片');
      return;
    }
    setImages(prev => [...prev, ...files]);
    e.target.value = null;
  };

  // 提交评论
  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('content', content.trim());
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      
      await onSubmit(formData);
      setContent('');
      setImages([]);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setIsSubmitting(false);
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
      className="bg-[#0a0f16] rounded-xl overflow-hidden 
        ring-1 ring-gray-800/50"
    >
      <div className="px-4 pt-3">
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
            placeholder-gray-600 outline-none resize-none
            min-h-[100px] leading-relaxed text-[15px]
            font-['Inter']"
        />
        
        <ImagePreview 
          images={images} 
          onRemove={(index) => {
            setImages(prev => prev.filter((_, i) => i !== index));
          }}
        />
      </div>

      <div className="px-4 py-3 flex items-center justify-between 
        border-t border-gray-800/30 mt-2">
        <div className="flex items-center gap-4">
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
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-gray-400 
                  transition-colors"
                title="添加图片"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
            </>
          )}
          <span className="text-sm text-gray-600">
            {content.length} / {maxLength}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="flex items-center gap-2 px-4 py-1.5
            text-sm text-gray-300 hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors rounded-full
            ring-1 ring-gray-700 hover:ring-gray-600"
        >
          发送
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default CommentEditor;
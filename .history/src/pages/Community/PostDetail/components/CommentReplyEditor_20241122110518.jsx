// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 现代感极简风格评论回复编辑器
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CommentReplyEditor = ({
  onSubmit,
  onCancel,
  maxLength = 500,
  placeholder = "写下你的回复..."
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${isFocused ? 'z-10' : 'z-0'}`}
    >
      {/* 背景光晕效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 
        blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative">
        <div className={`relative rounded-2xl overflow-hidden backdrop-blur-sm
          bg-gradient-to-b from-gray-900/90 to-gray-900/70
          shadow-lg group-hover:shadow-xl transition-all duration-300
          border border-gray-800/30 group-hover:border-gray-700/50
          ${isFocused ? 'shadow-blue-500/10' : ''}`}
        >
          {/* 输入区域 */}
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
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full bg-transparent text-gray-200 placeholder-gray-600/50
                px-6 py-4 h-[120px] block
                resize-none outline-none
                text-base leading-relaxed
                transition-all duration-300
                backdrop-blur-md"
              style={{
                textShadow: '0 0 30px rgba(0,0,0,0.5)'
              }}
            />

            {/* 渐变边框效果 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 
              opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
              style={{ mixBlendMode: 'overlay' }} 
            />
          </div>

          {/* 底部工具栏 */}
          <div className="relative px-6 py-3 flex items-center justify-between
            border-t border-gray-800/30 backdrop-blur-md
            bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80"
          >
            <div className="text-xs text-gray-500">
              按 <span className="text-gray-400">⌘</span> + <span className="text-gray-400">Enter</span> 发送
            </div>

            <div className="flex items-center gap-4">
              {/* 字数统计 */}
              <span className={`text-sm transition-colors duration-300 ${
                content.length > maxLength * 0.8 
                  ? content.length >= maxLength 
                    ? 'text-red-400/80' 
                    : 'text-amber-400/80'
                  : 'text-gray-500/80'
              }`}>
                {content.length} / {maxLength}
              </span>

              {/* 发送按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!content.trim() || content.length > maxLength || isLoading}
                className="relative group/btn px-5 py-1.5 rounded-full overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300"
              >
                {/* 按钮背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20
                  group-hover/btn:from-blue-500/30 group-hover/btn:via-purple-500/30 group-hover/btn:to-blue-500/30
                  transition-all duration-300" />
                
                {/* 按钮内容 */}
                <div className="relative flex items-center gap-2 text-sm font-medium">
                  <span className="text-blue-400 group-hover/btn:text-blue-300 transition-colors duration-300">
                    发送回复
                  </span>
                  <Send className="w-3.5 h-3.5 text-blue-400 group-hover/btn:text-blue-300 
                    transition-colors duration-300" />
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReplyEditor;
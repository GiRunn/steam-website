// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 极简风格评论回复编辑器 - 与帖子组件风格保持一致
import React, { useState, useRef, useEffect } from 'react';
import { Send, AtSign, Hash, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// 工具栏图标按钮组件
const IconButton = ({ icon: Icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-1.5 text-gray-500 hover:text-gray-300 
      disabled:text-gray-700 transition-colors duration-200"
  >
    <Icon className="w-4 h-4" />
  </button>
);

const CommentReplyEditor = ({
  onSubmit,
  onCancel,
  maxLength = 500,
  placeholder = "写下你的回复..."
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  // 自动聚焦
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // 提交处理
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
      exit={{ opacity: 0 }}
      className="bg-[#0a0f16] rounded-lg overflow-hidden"
    >
      <div className="relative border border-gray-800/50 rounded-lg 
        focus-within:border-blue-500/20 hover:border-gray-700/50
        transition-colors duration-300"
      >
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
            px-4 py-3 h-[120px]
            resize-none outline-none
            text-base leading-relaxed
            scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
        />
        
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 
          border-t border-gray-800/30 bg-gray-900/20"
        >
          <div className="flex items-center gap-1">
            <IconButton icon={AtSign} />
            <IconButton icon={Hash} />
            <IconButton icon={ImageIcon} />
          </div>

          <div className="flex items-center gap-4">
            {/* 字数统计 */}
            <span className={`text-sm ${
              content.length > maxLength * 0.8 
                ? 'text-yellow-500/80' 
                : 'text-gray-600'
            }`}>
              {content.length} / {maxLength}
            </span>

            {/* 发送按钮 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || isLoading}
              className="px-4 py-1.5 rounded-md text-sm
                bg-gradient-to-r from-blue-500/20 to-purple-500/20
                text-blue-400 font-medium
                disabled:from-gray-800/50 disabled:to-gray-800/50
                disabled:text-gray-600
                transition-all duration-200
                flex items-center gap-2"
            >
              发送
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReplyEditor;
// src/pages/Community/PostDetail/components/CommentReplyEditor.jsx
// 现代化的评论回复编辑器 - 支持提及、表情、图片等多媒体功能

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Smile,
  AtSign,
  Hash,
  Paperclip,
  X,
  MoreHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 工具栏按钮组件
const ToolbarButton = ({ icon: Icon, label, onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      p-2 rounded-lg text-gray-400
      hover:text-gray-200 hover:bg-gray-700/30
      transition-all duration-200
      ${active ? 'bg-gray-700/50 text-blue-400' : ''}
    `}
    title={label}
  >
    <Icon className="w-4 h-4" />
  </motion.button>
);

// 提及面板组件
const MentionPanel = ({ onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute bottom-full left-0 mb-2 w-64
      bg-[#1a1f2d] rounded-lg shadow-xl border border-gray-800/50
      overflow-hidden"
  >
    <div className="p-2 border-b border-gray-800/30 flex justify-between items-center">
      <span className="text-sm text-gray-400 font-medium">提及用户</span>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="max-h-48 overflow-y-auto">
      {['用户A', '用户B', '用户C'].map((user) => (
        <button
          key={user}
          onClick={() => onSelect(user)}
          className="w-full p-2 text-left hover:bg-gray-700/30
            text-gray-300 text-sm flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded-full bg-gray-600" />
          <span>{user}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

// 表情选择面板
const EmojiPanel = ({ onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute bottom-full right-0 mb-2
      bg-[#1a1f2d] rounded-lg shadow-xl border border-gray-800/50
      p-2 grid grid-cols-6 gap-1"
  >
    {['😊', '😂', '🎉', '👍', '❤️', '🚀', '😅', '🤔', '👀', '🎨', '🌟', '✨'].map(emoji => (
      <button
        key={emoji}
        onClick={() => onSelect(emoji)}
        className="p-2 text-xl hover:bg-gray-700/30 rounded"
      >
        {emoji}
      </button>
    ))}
  </motion.div>
);

const CommentReplyEditor = ({ 
  onSubmit, 
  onCancel,
  replyTo,
  maxLength = 500,
  placeholder = "写下你的回复..." 
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCursorPosition(start + text.length);
      
      // 恢复光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const handleMentionSelect = (user) => {
    insertAtCursor(`@${user} `);
    setShowMentions(false);
  };

  const handleEmojiSelect = (emoji) => {
    insertAtCursor(emoji);
    setShowEmojis(false);
  };

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
    if (e.key === 'Tab') {
      e.preventDefault();
      insertAtCursor('    ');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-[#141822] rounded-xl border border-gray-800/50 overflow-hidden
        shadow-lg backdrop-blur-sm"
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
              setCursorPosition(e.target.selectionStart);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`
            w-full bg-transparent text-gray-200 placeholder-gray-500/80
            px-4 pt-4 pb-12 min-h-[120px] max-h-[300px]
            resize-none outline-none
            font-['Inter'] text-[15px] leading-relaxed
            ${isLoading ? 'opacity-50' : ''}
            transition-colors duration-200
            focus:ring-1 focus:ring-blue-500/20
          `}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#374151 transparent'
          }}
        />

        {/* 工具栏 */}
        <div className="absolute left-0 bottom-0 right-0 px-4 py-2
          border-t border-gray-800/30 bg-gray-900/20
          flex items-center justify-between"
        >
          <div className="flex items-center gap-1 relative">
            <ToolbarButton 
              icon={AtSign} 
              label="提及用户"
              onClick={() => setShowMentions(!showMentions)}
              active={showMentions}
            />
            <ToolbarButton 
              icon={Hash} 
              label="添加话题"
              onClick={() => insertAtCursor('#')}
            />
            <ToolbarButton 
              icon={Smile}
              label="插入表情"
              onClick={() => setShowEmojis(!showEmojis)}
              active={showEmojis}
            />
            <ToolbarButton 
              icon={ImageIcon}
              label="上传图片"
            />
            
            {/* 提及面板 */}
            <AnimatePresence>
              {showMentions && (
                <MentionPanel
                  onSelect={handleMentionSelect}
                  onClose={() => setShowMentions(false)}
                />
              )}
            </AnimatePresence>

            {/* 表情面板 */}
            <AnimatePresence>
              {showEmojis && (
                <EmojiPanel
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojis(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <span className={`
              text-xs transition-colors duration-200
              ${content.length > maxLength * 0.8 
                ? content.length > maxLength 
                  ? 'text-red-400' 
                  : 'text-yellow-400'
                : 'text-gray-500'
              }
              font-['SF_Pro_Text']
            `}>
              {content.length} / {maxLength}
            </span>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || isLoading}
              className={`
                px-3 h-8 rounded-lg
                text-sm font-medium
                flex items-center gap-2
                transition-all duration-200
                ${content.trim() && content.length <= maxLength && !isLoading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                }
                disabled:opacity-50
              `}
            >
              <span className="font-['SF_Pro_Text']">发送</span>
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentReplyEditor;
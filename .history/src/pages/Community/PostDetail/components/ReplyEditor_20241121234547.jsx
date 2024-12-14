// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 回复编辑器组件 - 支持两侧表情选择器

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, Hash, AtSign, Link2, MessageCircle, PenTool, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

// 工具栏按钮组件
const ToolButton = ({ icon: Icon, label, onClick, isActive, badge }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      group flex items-center gap-2 px-4 py-2.5 rounded-xl
      transition-all duration-300 relative
      ${isActive 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'hover:bg-gray-700/50 text-gray-400 hover:text-blue-400'}
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
    {badge && (
      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
        {badge}
      </span>
    )}
    <motion.div
      className="absolute inset-0 rounded-xl bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
      layoutId={`tool-highlight-${label}`}
    />
  </motion.button>
);

const ReplyEditor = ({ onSubmit, replyTo = null }) => {
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState('right');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // 自动调整文本框高度
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({ content, attachments });
    setContent('');
    setAttachments([]);
    setIsExpanded(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const toggleEmojiPicker = (position) => {
    if (showEmoji && emojiPosition === position) {
      setShowEmoji(false);
    } else {
      setShowEmoji(true);
      setEmojiPosition(position);
    }
  };

  return (
    <motion.div 
      layout
      className="relative z-10 max-w-4xl mx-auto"
    >
      <div className={`
        relative overflow-visible backdrop-blur-xl rounded-2xl
        shadow-2xl border border-gray-700/50
        transition-all duration-300 ease-in-out
        ${isExpanded 
          ? 'bg-gray-900/90 mt-8 p-6' 
          : 'bg-gray-800/80 p-4'}
      `}>
        {/* 编辑器头部 */}
        <motion.div 
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 flex items-center gap-3">
              <PenTool className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-200">
                {replyTo ? `回复 @${replyTo}` : '写下你的回复'}
              </h3>
            </div>
            {replyTo && (
              <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full">
                <MessageCircle className="w-4 h-4 inline-block mr-1" />
                回复中
              </span>
            )}
          </div>
        </motion.div>

        {/* 文本编辑区 */}
 {/* 文本编辑区 - 移除左侧表情按钮 */}
 <div className="relative group">
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={isExpanded ? "在这里输入你的回复内容，支持 @用户名 和 #话题标签..." : "写下你的回复..."}
            className={`
              w-full bg-gray-800/50 text-gray-200 placeholder-gray-500
              rounded-xl resize-none p-4 pr-12
              border-2 border-transparent scrollbar-none
              focus:outline-none focus:border-blue-500/30
              transition-all duration-300
              ${isExpanded ? 'min-h-[120px]' : 'h-[56px]'}
            `}
          />

        {/* 附件预览 */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap gap-3"
            >
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="relative group px-3 py-2 bg-gray-800/50 rounded-lg flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{file.name}</span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 工具栏 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center gap-2 mt-4 border-t border-gray-700/50 pt-4"
            >
              <ToolButton 
                icon={AtSign}
                label="提及用户"
                onClick={() => setSelectedTool('mention')}
                isActive={selectedTool === 'mention'}
              />
              <ToolButton 
                icon={Hash}
                label="添加话题"
                onClick={() => setSelectedTool('topic')}
                isActive={selectedTool === 'topic'}
              />
              <ToolButton 
                icon={Link2}
                label="插入链接"
                onClick={() => setSelectedTool('link')}
                isActive={selectedTool === 'link'}
              />
              <ToolButton 
                icon={ImageIcon}
                label="上传图片"
                onClick={() => fileInputRef.current?.click()}
                isActive={selectedTool === 'image'}
                badge={attachments.length || null}
              />
              <ToolButton 
                icon={Smile}
                label="表情"
                onClick={() => setShowEmoji(!showEmoji)}
                isActive={showEmoji}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表情选择器 */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`absolute ${emojiPosition}-0 top-full mt-2 shadow-xl`}
            >
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setContent(prev => prev + emojiObject.emoji);
                  setShowEmoji(false);
                }}
                theme="dark"
                width={320}
                height={400}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部工具栏 */}
        <motion.div 
          layout="position"
          className={`
            flex items-center justify-between
            ${isExpanded ? 'mt-6' : 'mt-4'}
          `}
        >
          <div className="flex items-center gap-4">
            {content.trim() && (
              <span className="text-sm text-gray-500">
                {content.length} / 1000
              </span>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`
              relative overflow-hidden
              flex items-center gap-2 px-6 py-2.5
              rounded-xl font-medium text-sm
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${content.trim() 
                ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/20' 
                : 'bg-gray-700 text-gray-400'}
            `}
          >
            <Send className="w-4 h-4" />
            <span>{isExpanded ? '发送回复' : '回复'}</span>
          </motion.button>
        </motion.div>

        {/* 隐藏的文件输入框 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* 编辑器底部提示 */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center text-sm text-gray-500"
        >
          支持快捷键 Ctrl + Enter 发送
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReplyEditor;
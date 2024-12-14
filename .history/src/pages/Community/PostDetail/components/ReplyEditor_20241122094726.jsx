// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 优化后的回复编辑器组件 - 简化动画、改进表情选择器位置

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Smile, Hash, AtSign, Link2, MessageCircle, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

// 工具按钮组件
const ToolButton = ({ icon: Icon, label, onClick, isActive, badge }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-2 rounded-lg
      transition-colors duration-200
      ${isActive 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'hover:bg-[#1a1f2e] text-gray-400 hover:text-blue-400'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
    {badge && (
      <span className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const ReplyEditor = ({ onSubmit, replyTo = null }) => {
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // 自动调整文本框高度
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 点击外部关闭表情选择器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  return (
    <div className="relative max-w-4xl mx-auto z-10">
      <div className={`
        relative bg-[#0a0f16] rounded-2xl
        shadow-lg border border-gray-800
        transition-all duration-200
        ${isExpanded ? 'p-6' : 'p-4'}
      `}>
        {/* 编辑器头部 */}
        {isExpanded && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 flex items-center gap-2">
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
        )}

        {/* 文本编辑区 */}
        <div className="relative">
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={isExpanded ? "在这里输入你的回复内容，支持 @用户名 和 #话题标签..." : "写下你的回复..."}
            className={`
              w-full bg-[#141822] text-gray-200 placeholder-gray-500
              rounded-xl resize-none p-4
              border border-gray-700/50 focus:border-blue-500/50
              focus:outline-none transition-colors duration-200
              ${isExpanded ? 'min-h-[120px]' : 'h-[56px]'}
            `}
          />
          
          {/* 快捷工具栏 */}
          {!isExpanded && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* 附件预览 */}
        {attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="group px-3 py-2 bg-[#141822] rounded-lg flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{file.name}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 扩展工具栏 */}
        {isExpanded && (
          <div className="flex items-center gap-2 mt-4 border-t border-gray-800 pt-4">
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
          </div>
        )}

        {/* 底部操作栏 */}
        <div className={`
          flex items-center justify-between
          ${isExpanded ? 'mt-6' : 'mt-4'}
        `}>
          <div className="flex items-center gap-4">
            {content.trim() && (
              <span className="text-sm text-gray-500">
                {content.length} / 1000
              </span>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl
              font-medium text-sm transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${content.trim() 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:brightness-110' 
                : 'bg-gray-700 text-gray-400'}
            `}
          >
            <Send className="w-4 h-4" />
            <span>{isExpanded ? '发送回复' : '回复'}</span>
          </button>
        </div>

        {/* 表情选择器 */}
        {showEmoji && (
          <div 
            ref={emojiPickerRef}
            className="absolute left-0 bottom-full mb-2 z-50 shadow-xl"
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
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* 提示文本 */}
      {isExpanded && (
        <div className="mt-2 text-center text-sm text-gray-500">
          支持快捷键 Ctrl + Enter 发送
        </div>
      )}
    </div>
  );
};

export default ReplyEditor;
// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 回复编辑器组件 - 保持展开状态的现代设计

import React, { useState, useRef, useEffect, memo, lazy, Suspense } from 'react';
import { 
  Send, Image as ImageIcon, Smile, Hash, 
  AtSign, Link2, MessageCircle, X, AlertCircle,
  Loader2
} from 'lucide-react';

// 懒加载表情选择器
const EmojiPicker = lazy(() => import('emoji-picker-react'));

const LoadingSpinner = memo(() => (
  <div 
    className="absolute inset-0 bg-black/50 
      backdrop-blur-sm flex items-center justify-center 
      rounded-2xl z-50"
    role="status"
    aria-label="加载中"
  >
    <div className="relative">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      <div className="mt-2 text-sm text-gray-200">发送中...</div/pages/Community/index.jsxv/pages/Community/index.jsxv>
    </div>
  </div>
));

// ToolButton 组件保持原样
const ToolButton = memo(({ icon: Icon, label, onClick, isActive, badge, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    role="button"
    className={`
      group flex items-center gap-2 px-3 py-2 rounded-lg
      transition-all duration-300 ease-out
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${isActive 
        ? 'bg-blue-500/20 text-blue-400 scale-105' 
        : 'hover:bg-[#1e2435] text-gray-400 hover:text-blue-400 hover:scale-105'
      }
      active:scale-95
    `}
  >
    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
    <span className="text-sm font-medium hidden sm:inline-block">{label}</span>
    {badge && (
      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
        {badge}
      </span>
    )}
  </button>
));

// 错误提示组件
const ErrorMessage = memo(({ message }) => {
  if (!message) return null;
  
  return (
    <div 
      role="alert"
      className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-fadeIn"
    >
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
});

const ReplyEditor = ({ onSubmit, replyTo = null, maxLength = 1000 }) => {
  // 状态管理
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxLength) return;
    
    try {
      setIsLoading(true);
      setError('');

      const sanitizedContent = content.trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const formData = new FormData();
      formData.append('content', sanitizedContent);
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) setError('只能上传图片文件');
      if (!isValidSize) setError('图片大小不能超过5MB');
      
      return isValidType && isValidSize;
    });

    if (validFiles.length + attachments.length > 9) {
      setError('最多只能上传9张图片');
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  return (
    <div className="relative max-w-4xl mx-auto z-10">
      <div 
        className={`
          relative bg-[#141822] rounded-2xl
          shadow-lg border border-gray-800/50
          backdrop-blur-xl backdrop-saturate-150
          transition-all duration-300 ease-out
          hover:border-gray-700/50
          p-6
          motion-safe:animate-in
          motion-safe:fade-in-0
          motion-safe:zoom-in-95
          motion-safe:duration-500
        `}
        role="form"
        aria-label="回复编辑器"
        style={{
          background: 'linear-gradient(145deg, rgba(20, 24, 34, 0.9), rgba(17, 21, 31, 0.95))'
        }}
      >
        {isLoading && <LoadingSpinner />}

        {/* 编辑器头部 */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-800/50 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-200">
              {replyTo ? `回复 @${replyTo}` : '写下你的回复'}
            </h3>
            {replyTo && (
              <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full">
                <MessageCircle className="w-4 h-4 inline-block mr-1" />
                回复中
              </span>
            )}
          </div>
        </div>

        {/* 文本编辑区 */}
        <div className="relative">
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => {
              const newContent = e.target.value;
              if (newContent.length <= maxLength) {
                setContent(newContent);
                setError('');
              }
            }}
            placeholder="在这里输入你的回复内容，支持 @用户名 和 #话题标签..."
            className={`
              w-full bg-[#0d111a] text-gray-200 placeholder-gray-500
              rounded-xl resize-none p-4 min-h-[120px]
              border border-gray-700/30 
              focus:border-blue-500/50
              focus:ring-2 focus:ring-blue-500/20
              focus:outline-none
              transition-all duration-300 ease-out
              scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
              backdrop-blur-sm
              ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''}
            `}
          />
        </div>

        {/* 错误提示 */}
        <ErrorMessage message={error} />

        {/* 附件列表 */}
        {attachments.length > 0 && (
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-4">
            {attachments.map((file, index) => (
              <div 
                key={index}
                className="group relative w-20 h-20 rounded-lg bg-[#0d111a] 
                  border border-gray-700/30 overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  onLoad={() => URL.revokeObjectURL(file)}
                />
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 工具栏 */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-800/30">
          <ToolButton 
            icon={AtSign}
            label="提及用户"
            onClick={() => {
              setContent(prev => prev + '@');
              editorRef.current?.focus();
            }}
            isActive={selectedTool === 'mention'}
          />
          <ToolButton 
            icon={Hash}
            label="添加话题"
            onClick={() => {
              setContent(prev => prev + '#');
              editorRef.current?.focus();
            }}
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
            disabled={attachments.length >= 9}
          />
          <ToolButton 
            icon={Smile}
            label="表情"
            onClick={() => setShowEmoji(!showEmoji)}
            isActive={showEmoji}
          />
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between mt-6">
          <span className={`
            text-sm transition-colors
            ${content.length > maxLength * 0.8 
              ? content.length > maxLength 
                ? 'text-red-400' 
                : 'text-yellow-400'
              : 'text-gray-500'
            }
          `}>
            {content.length} / {maxLength}
          </span>
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl
              font-medium text-sm transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105 active:scale-95
              ${content.trim() && content.length <= maxLength
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:brightness-110'
                : 'bg-gray-700 text-gray-400'
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>发送回复</span>
          </button>
        </div>

        {/* 表情选择器 */}
        {showEmoji && (
          <div 
            ref={emojiPickerRef}
            className="absolute left-0 bottom-full mb-2 z-50 shadow-xl rounded-xl overflow-hidden
              motion-safe:animate-in motion-safe:fade-in-0 
              motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
          >
            <Suspense fallback={
              <div className="w-[320px] h-[400px] bg-[#1a1f2e] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            }>
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setContent(prev => prev + emojiObject.emoji);
                  setShowEmoji(false);
                }}
                theme="dark"
                width={320}
                height={400}
                lazyLoadEmojis={true}
                searchPlaceholder="搜索表情..."
              />
            </Suspense>
          </div>
        )}

        {/* 文件输入 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          className="hidden"
          aria-label="上传图片"
        />
      </div>

      {/* 快捷键提示 */}
      <div className="mt-2 text-center text-sm text-gray-500">
        支持快捷键 {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter 发送
      </div>
    </div>
  );
};

export default ReplyEditor;
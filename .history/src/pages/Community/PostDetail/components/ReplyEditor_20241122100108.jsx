// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 现代化的回复编辑器组件，采用子组件方式组织，支持完整的输入控制和媒体处理
// 作用：提供社区回复功能的编辑器界面，支持富文本输入、表情、图片上传等功能

import React, { useState, useRef, useEffect, memo, lazy, Suspense } from 'react';
import { 
  Send, Image as ImageIcon, Smile, Hash, 
  AtSign, Link2, MessageCircle, X, AlertCircle,
  Loader2, ChevronDown
} from 'lucide-react';

// 懒加载表情选择器组件
const EmojiPicker = lazy(() => import('emoji-picker-react'));

// 添加新的动画样式
const fadeInAnimation = {
  enter: 'transition-all duration-300 ease-out',
  enterFrom: 'opacity-0 translate-y-2',
  enterTo: 'opacity-100 translate-y-0',
  leave: 'transition-all duration-200 ease-in',
  leaveFrom: 'opacity-100 translate-y-0',
  leaveTo: 'opacity-0 translate-y-2',
};

// 更新 ErrorMessage 组件动画
const ErrorMessage = memo(({ message }) => {
  if (!message) return null;
  
  return (
    <div 
      role="alert"
      className={`
        mt-2 text-sm text-red-400 flex items-center gap-1
        animate-in fade-in slide-in-from-top-1
        duration-300 ease-out
      `}
    >
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
});


// ===== 加载中状态组件 =====
const LoadingSpinner = memo(() => (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-50">
    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
  </div>
));

// ===== 编辑器头部组件 =====
const EditorHeader = memo(({ replyTo, onClose }) => (
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
    <button
      onClick={onClose}
      className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
      aria-label="最小化编辑器"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
));

// ===== 工具按钮组件 =====
const ToolButton = memo(({ icon: Icon, label, onClick, isActive, badge, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    role="button"
    className={`
      group flex items-center gap-2 px-3 py-2 rounded-lg
      transition-all duration-200 relative
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${isActive 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'hover:bg-[#1a1f2e] text-gray-400 hover:text-blue-400'
      }
    `}
  >
    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
    <span className="text-sm font-medium hidden sm:inline-block">{label}</span>
    {badge && (
      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
        {badge}
      </span>
    )}
  </button>
));

// ===== 工具栏组件 =====
const Toolbar = memo(({ 
  attachments, 
  showEmoji, 
  setShowEmoji, 
  onImageClick, 
  onAtClick,
  onHashClick,
  onLinkClick,
  selectedTool 
}) => (
  <div className="flex flex-wrap items-center gap-2 mt-4 border-t border-gray-800/50 pt-4">
    <ToolButton 
      icon={AtSign}
      label="提及用户"
      onClick={onAtClick}
      isActive={selectedTool === 'mention'}
    />
    <ToolButton 
      icon={Hash}
      label="添加话题"
      onClick={onHashClick}
      isActive={selectedTool === 'topic'}
    />
    <ToolButton 
      icon={Link2}
      label="插入链接"
      onClick={onLinkClick}
      isActive={selectedTool === 'link'}
    />
    <ToolButton 
      icon={ImageIcon}
      label="上传图片"
      onClick={onImageClick}
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
));

// ===== 附件预览组件 =====
const AttachmentPreview = memo(({ file, onRemove, index }) => {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.onerror = () => setError(true);
    reader.readAsDataURL(file);
    
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [file]);

  if (error) return null;

  return (
    <div 
      className="group relative"
      role="figure"
      aria-label={`附件 ${index + 1}: ${file.name}`}
    >
      {preview ? (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onRemove}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              aria-label={`删除附件 ${file.name}`}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-20 h-20 rounded-lg bg-[#141822] flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <p className="mt-1 text-xs text-gray-400 truncate max-w-[80px]">
        {file.name}
      </p>
    </div>
  );
});

// ===== 附件列表组件 =====
const AttachmentList = memo(({ attachments, onRemove }) => {
  if (!attachments.length) return null;

  return (
    <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-4">
      {attachments.map((file, index) => (
        <AttachmentPreview
          key={index}
          file={file}
          index={index}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
});

// ===== 字符计数器组件 =====
const CharacterCounter = memo(({ current, max }) => (
  <span className={`
    text-sm transition-colors
    ${current > max * 0.8 ? 'text-yellow-500' : 'text-gray-500'}
    ${current > max ? 'text-red-500' : ''}
  `}>
    {current} / {max}
  </span>
));

// ===== 提交按钮组件 =====
const SubmitButton = memo(({ onClick, disabled, isExpanded, isLoading }) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`
      flex items-center gap-2 px-6 py-2.5 rounded-xl
      font-medium text-sm transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95
      ${disabled
        ? 'bg-gray-700 text-gray-400'
        : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'}
    `}
  >
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Send className="w-4 h-4" />
    )}
    <span>{isExpanded ? '发送回复' : '回复'}</span>
  </button>
));

// ===== 主编辑器组件 =====
const ReplyEditor = ({ onSubmit, replyTo = null, maxLength = 1000 }) => {
  // 状态管理
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // 初始化自动高度调整
  useEffect(() => {
    const adjustHeight = () => {
      if (editorRef.current) {
        editorRef.current.style.height = 'auto';
        editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
      }
    };
    adjustHeight();
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

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setShowEmoji(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  // 文件处理函数
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

  // 提交处理函数
  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxLength) return;
    
    try {
      setIsLoading(true);
      setError('');

      // XSS 防护
      const sanitizedContent = content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // 构建提交数据
      const formData = new FormData();
      formData.append('content', sanitizedContent);
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await onSubmit(formData);
      
      // 重置状态
      setContent('');
      setAttachments([]);
      setIsExpanded(false);
      
    } catch (err) {
      setError('发送失败，请重试');
    } finally {
      setIsLoading(false);
    }
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
          ${isExpanded ? 'p-6 scale-100' : 'p-4 scale-[0.99]'}
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
        {isExpanded && (
          <EditorHeader 
            replyTo={replyTo} 
            onClose={() => setIsExpanded(false)} 
          />
        )}

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
            onFocus={() => setIsExpanded(true)}
            placeholder={isExpanded 
              ? "在这里输入你的回复内容，支持 @用户名 和 #话题标签..." 
              : "写下你的回复..."
            }
            className={`
              w-full bg-[#0d111a] text-gray-200 placeholder-gray-500
              rounded-xl resize-none p-4
              border border-gray-700/30 
              focus:border-blue-500/50
              focus:ring-2 focus:ring-blue-500/20
              focus:outline-none
              transition-all duration-300 ease-out
              scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
              backdrop-blur-sm
              ${isExpanded ? 'min-h-[120px]' : 'h-[56px]'}
              ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''}
            `}

            aria-label="回复内容"
            aria-invalid={!!error}
            aria-describedby={error ? "error-message" : undefined}
          />
          
          {/* 简洁工具栏 - 仅在未展开时显示 */}
          {!isExpanded && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <ToolButton
                icon={Smile}
                label="表情"
                onClick={() => setShowEmoji(!showEmoji)}
                isActive={showEmoji}
              />
              <ToolButton
                icon={ImageIcon}
                label="上传图片"
                onClick={() => fileInputRef.current?.click()}
                badge={attachments.length || null}
              />
            </div>
          )}

          {/* 字数限制提示 - 仅在接近限制时显示 */}
          {content.length > maxLength * 0.8 && (
            <div 
              className={`
                absolute right-3 bottom-2 text-xs
                ${content.length > maxLength ? 'text-red-400' : 'text-yellow-400'}
              `}
            >
              {content.length}/{maxLength}
            </div>
          )}
        </div>

        {/* 错误提示 */}
        <ErrorMessage message={error} />

        {/* 附件预览区 */}
        <AttachmentList 
          attachments={attachments}
          onRemove={(index) => {
            setAttachments(prev => prev.filter((_, i) => i !== index));
          }}
        />

        {/* 扩展工具栏 - 展开时显示 */}
        {isExpanded && (
          <Toolbar 
            attachments={attachments}
            showEmoji={showEmoji}
            setShowEmoji={setShowEmoji}
            onImageClick={() => fileInputRef.current?.click()}
            onAtClick={() => {
              setContent(prev => prev + '@');
              editorRef.current?.focus();
            }}
            onHashClick={() => {
              setContent(prev => prev + '#');
              editorRef.current?.focus();
            }}
            onLinkClick={() => setSelectedTool('link')}
            selectedTool={selectedTool}
          />
        )}

        {/* 底部操作栏 */}
        <div className={`
          flex items-center justify-between
          transition-all duration-300 ease-out
          ${isExpanded ? 'mt-6' : 'mt-4'}
        `}>
          <div className="flex items-center gap-4">
            <CharacterCounter 
              current={content.length}
              max={maxLength}
            />
            {isExpanded && attachments.length > 0 && (
              <span className="text-sm text-gray-500">
                已添加 {attachments.length} 张图片
              </span>
            )}
          </div>
          
          <SubmitButton 
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxLength}
            isExpanded={isExpanded}
            isLoading={isLoading}
          />
        </div>

        {/* 表情选择器 */}
        {showEmoji && (
          <div 
            ref={emojiPickerRef}
            className="absolute left-0 bottom-full mb-2 z-50 shadow-xl animate-fadeIn"
          >
            <Suspense fallback={
              <div className="w-[320px] h-[400px] bg-[#1a1f2e] rounded-lg flex items-center justify-center">
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

        {/* 隐藏的文件输入 */}
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

      {/* 底部提示 */}
      {isExpanded && (
        <div className="mt-2 text-center text-sm text-gray-500">
          支持快捷键 {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter 发送
        </div>
      )}
    </div>
  );
};

export default ReplyEditor;
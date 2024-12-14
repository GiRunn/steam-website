// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 简化的回复编辑器组件 - 移除模糊效果，采用固定展开样式

import React, { useState, useRef, useEffect, memo, lazy, Suspense } from 'react';
import { 
  Send, Image as ImageIcon, Smile, 
  AtSign, Hash, Link2, X
} from 'lucide-react';

// 懒加载表情选择器
const EmojiPicker = lazy(() => import('emoji-picker-react'));

// ToolButton 组件
const ToolButton = memo(({ icon: Icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`
      flex items-center gap-2 px-3 py-2
      transition-colors duration-200
      ${isActive 
        ? 'text-blue-400' 
        : 'text-gray-400 hover:text-blue-400'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm">{label}</span>
  </button>
));

const ReplyEditor = ({ onSubmit, maxLength = 1000 }) => {
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // 键盘快捷键
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

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    const formData = new FormData();
    formData.append('content', content.trim());
    attachments.forEach(file => {
      formData.append('attachments', file);
    });

    await onSubmit(formData);
    setContent('');
    setAttachments([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div className="bg-[#1a1f2e] rounded-lg border border-gray-800">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg text-gray-200">写下你的回复</h3>
          <button className="text-gray-400 hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 编辑区域 */}
        <div className="p-4">
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => {
              const newContent = e.target.value;
              if (newContent.length <= maxLength) {
                setContent(newContent);
              }
            }}
            placeholder="在这里输入你的回复内容，支持 @用户名 和 #话题标签..."
            className="w-full min-h-[120px] bg-[#0d111a] text-gray-200 
              placeholder-gray-500 rounded-lg p-3
              border border-gray-800 focus:border-blue-500/50
              focus:outline-none resize-none"
          />
        </div>

        {/* 工具栏 */}
        <div className="px-4 py-3 flex items-center gap-2 border-t border-gray-800">
          <ToolButton 
            icon={AtSign}
            label="提及用户"
            onClick={() => {
              setContent(prev => prev + '@');
              editorRef.current?.focus();
            }}
          />
          <ToolButton 
            icon={Hash}
            label="添加话题"
            onClick={() => {
              setContent(prev => prev + '#');
              editorRef.current?.focus();
            }}
          />
          <ToolButton 
            icon={Link2}
            label="插入链接"
            onClick={() => {}}
          />
          <ToolButton 
            icon={ImageIcon}
            label="上传图片"
            onClick={() => fileInputRef.current?.click()}
          />
          <ToolButton 
            icon={Smile}
            label="表情"
            onClick={() => setShowEmoji(!showEmoji)}
            isActive={showEmoji}
          />
        </div>

        {/* 底部状态栏 */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
          <div className="text-sm text-gray-500">
            {content.length} / {maxLength}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              text-sm font-medium
              ${content.trim() 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
              transition-colors duration-200
            `}
          >
            <Send className="w-4 h-4" />
            发送回复
          </button>
        </div>
      </div>

      {/* 快捷键提示 */}
      <div className="mt-2 text-center text-sm text-gray-500">
        支持快捷键 Ctrl + Enter 发送
      </div>

      {/* 表情选择器 */}
      {showEmoji && (
        <div 
          ref={emojiPickerRef}
          className="absolute mt-2 z-50 shadow-xl"
        >
          <Suspense fallback={<div className="w-[320px] h-[400px] bg-[#1a1f2e] rounded-lg" />}>
            <EmojiPicker
              onEmojiClick={(emojiObject) => {
                setContent(prev => prev + emojiObject.emoji);
                setShowEmoji(false);
              }}
              theme="dark"
              width={320}
              height={400}
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
      />
    </div>
  );
};

export default ReplyEditor;
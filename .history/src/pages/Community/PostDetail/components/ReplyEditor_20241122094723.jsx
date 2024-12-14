// src/pages/Community/PostDetail/components/ReplyEditor/index.jsx
// 现代化回复编辑器组件 - 简约设计风格

import React, { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, Smile, Hash, AtSign, Link as LinkIcon, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton } from './ActionButton';
import { FilePreview } from './FilePreview';
import './styles.css';

const ReplyEditor = ({ onSubmit, replyTo = null, maxLength = 1000 }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // 自动展开/收起
  useEffect(() => {
    if (content || files.length > 0) {
      setIsExpanded(true);
    }
  }, [content, files]);

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSubmit) {
        handleSubmit();
      }
      if (e.key === 'Escape' && !content && !files.length) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content, files]);

  // 点击外部收起
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target) &&
        !content && 
        !files.length
      ) {
        setIsExpanded(false);
        setShowEmoji(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [content, files]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ content: content.trim(), files });
    setContent('');
    setFiles([]);
    setIsExpanded(false);
    setShowEmoji(false);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = null; // 重置input以允许重复选择相同文件
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e) => {
    const pastedFiles = Array.from(e.clipboardData.files);
    if (pastedFiles.length > 0) {
      setFiles(prev => [...prev, ...pastedFiles]);
    }
  };

  const insertText = (text) => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    setContent(newContent);
    
    // 设置光标位置
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const canSubmit = content.trim().length > 0 && content.length <= maxLength;
  const progress = (content.length / maxLength) * 100;

  return (
    <motion.div 
      ref={containerRef}
      initial={false}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      className="relative w-full max-w-4xl mx-auto"
    >
      <div className={`
        relative overflow-hidden
        rounded-2xl border transition-all duration-300
        ${isExpanded 
          ? 'border-blue-500/20 shadow-lg shadow-blue-500/5 bg-[#0a0f16]' 
          : 'border-gray-800 bg-[#0a0f16]/80'
        }
      `}>
        {/* 编辑器主体 */}
        <div className="relative">
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onPaste={handlePaste}
            placeholder={isExpanded ? "写下你的想法..." : "发表评论..."}
            className={`
              w-full bg-transparent text-gray-100
              placeholder-gray-500 resize-none p-4
              focus:outline-none transition-all duration-300
              ${isExpanded ? 'min-h-[120px]' : 'h-[52px]'}
            `}
            style={{
              fontSize: isExpanded ? '0.9375rem' : '0.875rem',
            }}
          />

          {/* 进度条 */}
          {isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-800/50">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
        </div>

        {/* 附件预览 */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 space-y-2 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pb-4">
                {files.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 工具栏 */}
        <motion.div 
          className={`
            flex items-center justify-between
            px-4 py-2 border-t border-gray-800/50
          `}
          variants={{
            expanded: { opacity: 1 },
            collapsed: { opacity: 0.8 }
          }}
        >
          <div className="flex items-center gap-1">
            <ActionButton
              icon={AtSign}
              tooltip="提及用户"
              onClick={() => insertText('@')}
            />
            <ActionButton
              icon={Hash}
              tooltip="添加话题"
              onClick={() => insertText('#')}
            />
            <ActionButton
              icon={LinkIcon}
              tooltip="插入链接"
              onClick={() => insertText('[]() ')}
            />
            <ActionButton
              icon={ImagePlus}
              tooltip="上传图片"
              onClick={() => fileInputRef.current?.click()}
              badge={files.length || null}
            />
            <ActionButton
              icon={Smile}
              tooltip="插入表情"
              onClick={() => setShowEmoji(!showEmoji)}
              isActive={showEmoji}
            />
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <span className={`
                text-xs transition-colors
                ${content.length > maxLength ? 'text-red-400' : 'text-gray-500'}
              `}>
                {content.length} / {maxLength}
              </span>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`
                relative overflow-hidden group
                flex items-center gap-2 px-4 h-8
                rounded-full text-sm font-medium
                transition-all duration-300
                ${canSubmit
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-110 text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <Send className="w-4 h-4" />
              <span>{isExpanded ? '发送' : '回复'}</span>
            </button>
          </div>
        </motion.div>

        {/* 表情选择器 */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 bottom-full mb-2 z-50"
            >
              <EmojiPicker
                onEmojiClick={({ emoji }) => {
                  insertText(emoji);
                  setShowEmoji(false);
                }}
                theme="dark"
                width={320}
                height={400}
                lazyLoadEmojis
                searchPlaceHolder="搜索表情..."
                previewConfig={{
                  defaultEmoji: "1f60a",
                  defaultCaption: "选择一个表情"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />
    </motion.div>
  );
};

// 文件预览组件
const FilePreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="group relative"
    >
      <img
        src={preview}
        alt={file.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full
                   text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

// 工具栏按钮组件
const ActionButton = ({ icon: Icon, tooltip, onClick, isActive, badge }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      relative group p-2 rounded-lg
      transition-colors duration-200
      ${isActive 
        ? 'text-blue-400 bg-blue-500/10' 
        : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/5'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    {tooltip && (
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1
                    text-xs text-white bg-gray-800 rounded
                    opacity-0 group-hover:opacity-100 transition-opacity">
        {tooltip}
      </div>
    )}
    {badge && (
      <span className="absolute -top-1 -right-1 w-4 h-4 text-xs
                     bg-blue-500 text-white rounded-full
                     flex items-center justify-center">
        {badge}
      </span>
    )}
  </motion.button>
);

export default ReplyEditor;
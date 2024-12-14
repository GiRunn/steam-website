// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 现代简约风格回复编辑器组件

import React, { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, Smile, Hash, AtSign, Link2, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

// 工具按钮组件
const ToolButton = React.memo(({ icon: Icon, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`
      p-2 rounded-full transition-all duration-200
      hover:bg-white/5 active:scale-95
      ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'}
    `}
  >
    <Icon size={18} />
  </button>
));

// 图片预览组件
const ImagePreview = React.memo(({ file, onRemove }) => {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="group relative">
      <img
        src={preview}
        alt={file.name}
        className="w-[72px] h-[72px] object-cover rounded-xl ring-1 ring-white/10"
      />
      <button
        onClick={onRemove}
        className="absolute -right-1.5 -top-1.5 p-1 rounded-full bg-white/10 
                 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 
                 transition-all duration-200 hover:bg-white/20"
      >
        <X size={14} />
      </button>
    </div>
  );
});

// 主编辑器组件
const ReplyEditor = ({ onSubmit, maxLength = 1000 }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // 自动调整高度
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      const scrollHeight = editorRef.current.scrollHeight;
      editorRef.current.style.height = scrollHeight + 'px';
    }
  }, [content]);

  // 点击外部处理
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowEmoji(false);
        !content.trim() && setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [content]);

  // 处理提交
  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ content: content.trim(), files });
    setContent('');
    setFiles([]);
    setIsFocused(false);
    setShowEmoji(false);
  };

  // 处理文件选择
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = null;
  };

  // 处理粘贴
  const handlePaste = (e) => {
    const pastedFiles = Array.from(e.clipboardData.files);
    if (pastedFiles.length > 0) {
      setFiles(prev => [...prev, ...pastedFiles]);
    }
  };

  const canSubmit = content.trim().length > 0 && content.length <= maxLength;

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-3xl mx-auto"
    >
      <motion.div
        animate={isFocused ? {
          scale: 1,
          y: 0,
          opacity: 1,
        } : {
          scale: 0.98,
          y: 0,
          opacity: 0.95,
        }}
        transition={{ duration: 0.2 }}
        className={`
          relative rounded-2xl bg-[#0a0f16]
          transition-shadow duration-300 overflow-hidden
          ${isFocused 
            ? 'shadow-[0_0_30px_rgba(0,0,0,0.4)] ring-1 ring-white/10' 
            : 'shadow-lg'
          }
        `}
      >
        {/* 输入区域 */}
        <div className="relative">
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onPaste={handlePaste}
            placeholder="写下你的想法..."
            className={`
              w-full bg-transparent text-gray-200
              placeholder-gray-500/50 resize-none p-4 pl-5
              min-h-[56px] focus:outline-none
              ${isFocused ? 'min-h-[120px]' : ''}
            `}
            style={{
              fontSize: '0.9375rem',
              lineHeight: '1.5',
            }}
          />

          {/* 文字计数 */}
          {content.length > 0 && (
            <div className={`
              absolute right-4 top-3 text-xs
              transition-colors duration-200
              ${content.length > maxLength ? 'text-red-400' : 'text-gray-500'}
            `}>
              {content.length} / {maxLength}
            </div>
          )}
        </div>

        {/* 图片预览区 */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4"
            >
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, index) => (
                  <ImagePreview
                    key={index}
                    file={file}
                    onRemove={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 工具栏 */}
        <div className={`
          flex items-center justify-between gap-2
          px-2 py-1.5 bg-white/[0.02]
          ${isFocused ? 'border-t border-white/[0.05]' : ''}
        `}>
          <div className="flex items-center">
            <ToolButton
              icon={AtSign}
              onClick={() => {
                const textArea = editorRef.current;
                const start = textArea.selectionStart;
                setContent(prev => prev.slice(0, start) + '@' + prev.slice(textArea.selectionEnd));
                setTimeout(() => {
                  textArea.focus();
                  textArea.setSelectionRange(start + 1, start + 1);
                }, 0);
              }}
            />
            <ToolButton
              icon={Hash}
              onClick={() => {
                const textArea = editorRef.current;
                const start = textArea.selectionStart;
                setContent(prev => prev.slice(0, start) + '#' + prev.slice(textArea.selectionEnd));
                setTimeout(() => {
                  textArea.focus();
                  textArea.setSelectionRange(start + 1, start + 1);
                }, 0);
              }}
            />
            <ToolButton
              icon={Link2}
              onClick={() => {
                const textArea = editorRef.current;
                const start = textArea.selectionStart;
                setContent(prev => prev.slice(0, start) + '[]()' + prev.slice(textArea.selectionEnd));
                setTimeout(() => {
                  textArea.focus();
                  textArea.setSelectionRange(start + 1, start + 1);
                }, 0);
              }}
            />
            <ToolButton
              icon={ImagePlus}
              onClick={() => fileInputRef.current?.click()}
            />
            <ToolButton
              icon={Smile}
              onClick={() => setShowEmoji(!showEmoji)}
              isActive={showEmoji}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              flex items-center gap-1.5 px-4 h-8
              rounded-full text-sm font-medium
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${canSubmit
                ? 'bg-blue-500 text-white hover:bg-blue-400' 
                : 'bg-white/5 text-gray-400'
              }
            `}
          >
            <Send size={16} />
            <span>发送</span>
          </motion.button>
        </div>

        {/* 表情选择器 */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute left-0 bottom-full mb-2 shadow-2xl"
            >
              <EmojiPicker
                onEmojiClick={({ emoji }) => {
                  const textArea = editorRef.current;
                  const start = textArea.selectionStart;
                  setContent(prev => prev.slice(0, start) + emoji + prev.slice(textArea.selectionEnd));
                  setTimeout(() => {
                    textArea.focus();
                    textArea.setSelectionRange(start + emoji.length, start + emoji.length);
                  }, 0);
                  setShowEmoji(false);
                }}
                theme="dark"
                width={320}
                height={400}
                searchPlaceHolder="搜索表情..."
                previewConfig={{
                  defaultEmoji: "1f60a",
                  defaultCaption: "选择一个表情"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
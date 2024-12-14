// src/pages/Community/components/CreatePost/index.jsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Film, Hash, Send, Plus, Trash2, Smile, AtSign, AlertCircle } from 'lucide-react';
import { Editor, EditorState, convertToRaw, ContentState, Modifier, SelectionState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import useClickOutside from '@/hooks/useClickOutside'; // 假设有这个hook

// =============== 常量 ===============
const CONSTANTS = {
  TITLE_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 2000,
  TAG_MAX_LENGTH: 20,
  MAX_TAGS: 5,
  MAX_MEDIA: 4,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm']
};

// =============== 工具函数 ===============
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// =============== 标题输入组件 ===============
const TitleInput = ({ title, setTitle, error }) => (
  <div className="relative">
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="输入标题..."
      maxLength={CONSTANTS.TITLE_MAX_LENGTH}
      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors
        ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500'}`}
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
      {title.length}/{CONSTANTS.TITLE_MAX_LENGTH}
    </span>
  </div>
);

// =============== 工具栏按钮组件 ===============
const ToolbarButton = ({ icon: Icon, label, onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    title={label}
  >
    <Icon className="w-5 h-5" />
  </button>
);

// =============== 媒体上传按钮组件 ===============
const MediaUploadButton = ({ type, disabled, onChange }) => (
  <label className={`p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
    <input
      type="file"
      accept={type === 'image' ? CONSTANTS.ALLOWED_IMAGE_TYPES.join(',') : CONSTANTS.ALLOWED_VIDEO_TYPES.join(',')}
      multiple={type === 'image'}
      className="hidden"
      onChange={onChange}
      disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
    />
    {type === 'image' ? <Image className="w-5 h-5" /> : <Film className="w-5 h-5" />}
  </label>
);

// =============== 媒体预览组件 ===============
const MediaPreview = ({ media, onRemove }) => (
  <div className="grid grid-cols-2 gap-4">
    {media.map((item) => (
      <div key={item.id} className="relative group">
        {item.type === 'image' ? (
          <img
            src={item.preview}
            alt=""
            className="w-full h-40 object-cover rounded-lg bg-white/5"
          />
        ) : (
          <video
            src={item.preview}
            className="w-full h-40 object-cover rounded-lg bg-white/5"
            controls
          />
        )}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          {formatFileSize(item.file.size)}
        </div>
      </div>
    ))}
  </div>
);

// =============== 标签组件 ===============
const TagInput = ({ tags, onAddTag, onRemoveTag }) => {
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showTagInput) {
      inputRef.current?.focus();
    }
  }, [showTagInput]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < CONSTANTS.MAX_TAGS) {
      onAddTag(newTag.trim());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-300 flex items-center gap-2 group"
        >
          <Hash className="w-4 h-4" />
          {tag}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {showTagInput ? (
        <form onSubmit={handleAddTag} className="inline-flex">
          <input
            ref={inputRef}
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onBlur={() => {
              if (!newTag.trim()) {
                setShowTagInput(false);
              }
            }}
            placeholder="添加标签..."
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            maxLength={CONSTANTS.TAG_MAX_LENGTH}
          />
        </form>
      ) : tags.length < CONSTANTS.MAX_TAGS && (
        <button
          type="button"
          onClick={() => setShowTagInput(true)}
          className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          添加标签
        </button>
      )}
    </div>
  );
};

// =============== 错误提示组件 ===============
const ErrorMessage = ({ error }) => (
  <AnimatePresence>
    {error && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 text-red-400 text-sm"
      >
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

// =============== 用户提及弹窗组件 ===============
const MentionPopup = ({ searchText, onSelect, style }) => {
  const popupRef = useRef(null);
  
  // 模拟用户数据
  const users = [
    { id: 1, name: '用户A', avatar: '/api/placeholder/40/40' },
    { id: 2, name: '用户B', avatar: '/api/placeholder/40/40' },
    { id: 3, name: '用户C', avatar: '/api/placeholder/40/40' },
  ];

  const filteredUsers = searchText
    ? users.filter(user => user.name.toLowerCase().includes(searchText.toLowerCase()))
    : users;

  return (
    <div
      ref={popupRef}
      style={style}
      className="absolute z-50 bg-[#1a2433] border border-white/10 rounded-lg shadow-xl p-2 w-64 max-h-60 overflow-y-auto"
    >
      {filteredUsers.length > 0 ? (
        filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => onSelect(user)}
            className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
          >
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full bg-white/10" />
            <span className="text-white">{user.name}</span>
          </div>
        ))
      ) : (
        <div className="text-gray-400 text-sm p-2">无匹配用户</div>
      )}
    </div>
  );
};

// =============== 编辑器组件 ===============
const ContentEditor = ({
  editorState,
  onChange,
  showEmojiPicker,
  onEmojiSelect,
  onEmojiPickerClose,
  showMentionPopup,
  mentionPosition,
  mentionSearch,
  onMentionSelect,
  editorRef
}) => {
  const emojiPickerRef = useRef(null);
  
  useClickOutside(emojiPickerRef, onEmojiPickerClose);

  const getEmojiPickerPosition = () => {
    if (!editorRef.current) return {};
    const rect = editorRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const showAbove = rect.bottom + 435 > windowHeight;
    
    return {
      position: 'absolute',
      right: '0',
      [showAbove ? 'bottom' : 'top']: '100%',
      marginBottom: showAbove ? '10px' : undefined,
      marginTop: !showAbove ? '10px' : undefined,
      zIndex: 1000
    };
  };

  return (
    <div className="relative" ref={editorRef}>
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
        <Editor
          editorState={editorState}
          onChange={onChange}
          placeholder="分享你的想法..."
          spellCheck={false}
        />
      </div>

      <div className="absolute right-3 bottom-3 text-sm text-gray-400">
        {editorState.getCurrentContent().getPlainText().length}/{CONSTANTS.CONTENT_MAX_LENGTH}
      </div>

      {/* 表情选择器 */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={emojiPickerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={getEmojiPickerPosition()}
          >
            <div className="shadow-xl rounded-lg overflow-hidden">
              <Picker
                data={data}
                onEmojiSelect={onEmojiSelect}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
                searchPosition="none"
                perLine={8}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 用户提及弹窗 */}
      <AnimatePresence>
        {showMentionPopup && (
          <MentionPopup
            searchText={mentionSearch}
            onSelect={onMentionSelect}
            style={{
              position: 'absolute',
              top: `${mentionPosition.top}px`,
              left: `${mentionPosition.left}px`,
              zIndex: 1000
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
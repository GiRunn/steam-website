// src/pages/Community/components/CreatePost/index.jsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Film, Hash, Send, Plus, Trash2, Smile, AtSign, AlertCircle } from 'lucide-react';
import { Editor, EditorState, convertToRaw, ContentState, Modifier, SelectionState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import useClickOutside from '../../../../hooks/useClickOutside';

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
    
    const editorRect = editorRef.current.getBoundingClientRect();
    const pickerHeight = 435; // emoji picker 的高度
    const pickerWidth = 352;  // emoji picker 的宽度
  
    // 计算垂直居中位置
    const centerY = editorRect.height / 2;
    const pickerTop = centerY - (pickerHeight / 2);
  
    // 默认显示在右侧
    let position = {
      position: 'absolute',
      top: `${pickerTop}px`,
      left: `${editorRect.width + 10}px`, // 距离编辑器右边缘 10px
      zIndex: 1000
    };
  
    // 检查右侧空间是否足够
    const spaceRight = window.innerWidth - (editorRect.right + pickerWidth + 20); // 额外 20px 边距
    
    // 如果右侧空间不足，则显示在左侧
    if (spaceRight < 0) {
      position = {
        ...position,
        left: 'auto',
        right: `${editorRect.width + 10}px`
      };
    }
  
    return position;
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
            className="fixed shadow-xl" // 改为 fixed 定位
          >
            <div className="rounded-lg overflow-hidden bg-[#1a2433] border border-white/10">
              <Picker
                data={data}
                onEmojiSelect={onEmojiSelect}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
                searchPosition="none"
                perLine={8}
                emojiSize={22}
                emojiButtonSize={32}
                maxFrequentRows={0}
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

// =============== 底部工具栏组件 ===============
const BottomToolbar = ({
  onMediaUpload,
  mediaCount,
  onEmojiToggle,
  onMentionClick,
  isSubmitting,
  canSubmit,
  onSubmit
}) => (
  <div className="flex items-center justify-between p-6 border-t border-white/10">
    <div className="flex items-center gap-2">
      <MediaUploadButton
        type="image"
        disabled={mediaCount >= CONSTANTS.MAX_MEDIA}
        onChange={onMediaUpload}
      />
      <MediaUploadButton
        type="video"
        disabled={mediaCount >= CONSTANTS.MAX_MEDIA}
        onChange={onMediaUpload}
      />
      <ToolbarButton
        icon={Smile}
        label="插入表情"
        onClick={onEmojiToggle}
      />
      <ToolbarButton
        icon={AtSign}
        label="提及用户"
        onClick={onMentionClick}
      />
    </div>

    <button
      type="button"
      onClick={onSubmit}
      disabled={!canSubmit || isSubmitting}
      className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium 
        hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
      <span>{isSubmitting ? '发布中...' : '发布'}</span>
    </button>
  </div>
);

// =============== 主组件 ===============
const CreatePostModal = ({ isOpen, onClose }) => {
  // 状态管理
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [tags, setTags] = useState([]);
  const [media, setMedia] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // refs
  const editorRef = useRef(null);
  const modalRef = useRef(null);

  // 点击外部关闭弹窗
  useClickOutside(modalRef, (e) => {
    if (isSubmitting) return;
    if (e.target.closest('.emoji-mart')) return;
    onClose();
  });

  // 处理媒体上传
  const handleMediaUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    
    // 文件验证
    const validFiles = files.filter(file => {
      // 检查文件大小
      if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        setError(`文件 ${file.name} 超过${CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB限制`);
        return false;
      }
      
      // 检查文件类型
      const isImage = CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = CONSTANTS.ALLOWED_VIDEO_TYPES.includes(file.type);
      
      if (!isImage && !isVideo) {
        setError(`文件 ${file.name} 格式不支持`);
        return false;
      }
      
      return true;
    });

    if (media.length + validFiles.length > CONSTANTS.MAX_MEDIA) {
      setError(`最多只能上传${CONSTANTS.MAX_MEDIA}个媒体文件`);
      return;
    }

    const newMedia = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    
    setMedia(prev => [...prev, ...newMedia]);
    setError('');
    
    // 清空input value,允许重复选择相同文件
    event.target.value = '';
  }, [media]);

  // 处理emoji选择
  const handleEmojiSelect = useCallback((emoji) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEmoji = Modifier.insertText(
      contentState,
      editorState.getSelection(),
      emoji.native
    );
    const newEditorState = EditorState.push(
      editorState,
      contentStateWithEmoji,
      'insert-characters'
    );
    setEditorState(newEditorState);
  }, [editorState]);

  // 处理编辑器变化
  const handleEditorChange = useCallback((newEditorState) => {
    const selection = newEditorState.getSelection();
    const content = newEditorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();
    const cursor = selection.getStartOffset();

    // 检查是否正在输入@
    if (text.slice(0, cursor).endsWith('@')) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const rangeBounds = window.getSelection().getRangeAt(0).getBoundingClientRect();
      
      setMentionPosition({
        top: rangeBounds.bottom - editorRect.top,
        left: rangeBounds.left - editorRect.left
      });
      setShowMentionPopup(true);
      setMentionSearch('');
    } else if (showMentionPopup) {
      const lastAtPos = text.lastIndexOf('@', cursor - 1);
      if (lastAtPos !== -1) {
        setMentionSearch(text.slice(lastAtPos + 1, cursor));
      } else {
        setShowMentionPopup(false);
      }
    }

    // 检查内容长度
    const newText = content.getPlainText();
    if (newText.length > CONSTANTS.CONTENT_MAX_LENGTH) {
      return;
    }

    setEditorState(newEditorState);
  }, [showMentionPopup]);

  // 处理提及用户
  const handleMention = useCallback((user) => {
    try {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const blockKey = selection.getStartKey();
      const block = contentState.getBlockForKey(blockKey);
      const text = block.getText();
      const cursor = selection.getStartOffset();
      
      // 找到@符号的位置
      const lastAtPos = text.lastIndexOf('@', cursor);
      if (lastAtPos === -1) return;

      // 创建新的选区,从@符号到当前光标位置
      const newSelection = new SelectionState({
        anchorKey: blockKey,
        anchorOffset: lastAtPos,
        focusKey: blockKey,
        focusOffset: cursor
      });

      // 插入用户名
      const contentStateWithMention = Modifier.replaceText(
        contentState,
        newSelection,
        `@${user.name} `
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithMention,
        'insert-mention'
      );

      setEditorState(newEditorState);
      setShowMentionPopup(false);
      setMentionSearch('');
    } catch (error) {
      console.error('Error handling mention:', error);
      setError('插入用户名失败,请重试');
    }
  }, [editorState]);

  // 发布帖子
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('请填写标题');
      return;
    }

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    if (!content.trim()) {
      setError('请填写内容');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 上传媒体文件
      const mediaUrls = await Promise.all(
        media.map(async (item) => {
          const formData = new FormData();
          formData.append('file', item.file);
          // TODO: 实现文件上传API
          // const response = await uploadFile(formData);
          // return response.url;
          return 'https://example.com/media/1'; // 模拟
        })
      );

      // 提取提及的用户
      const mentions = [];
      const contentText = editorState.getCurrentContent().getPlainText();
      const mentionRegex = /@(\w+)/g;
      let match;
      while ((match = mentionRegex.exec(contentText)) !== null) {
        mentions.push(match[1]);
      }

      // 发布帖子数据
      const postData = {
        title: title.trim(),
        content,
        tags,
        media: mediaUrls,
        mentions,
        created_at: new Date().toISOString()
      };

      // TODO: 调用发布API
      // await createPost(postData);
      console.log('Publishing post:', postData);
      
      // 重置表单
      setTitle('');
      setEditorState(EditorState.createEmpty());
      setTags([]);
      setMedia([]);
      setError('');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      setError(error.message || '发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 清理工作
  useEffect(() => {
    return () => {
      // 清理媒体预览URL
      media.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [media]);

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0f1724] rounded-2xl shadow-xl"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">发布内容</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-6">
          <TitleInput
            title={title}
            setTitle={setTitle}
            error={error && !title.trim()}
          />
          
          <ContentEditor
            editorState={editorState}
            onChange={handleEditorChange}
            showEmojiPicker={showEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            onEmojiPickerClose={() => setShowEmojiPicker(false)}
            showMentionPopup={showMentionPopup}
            mentionPosition={mentionPosition}
            mentionSearch={mentionSearch}
            onMentionSelect={handleMention}
            editorRef={editorRef}
          />

          {media.length > 0 && (
            <MediaPreview
              media={media}
              onRemove={(id) => {
                const item = media.find(m => m.id === id);
                if (item?.preview) {
                  URL.revokeObjectURL(item.preview);
                }
                setMedia(media.filter(m => m.id !== id));
              }}
            />
          )}

          <TagInput
            tags={tags}
            onAddTag={(tag) => setTags([...tags, tag])}
            onRemoveTag={(tag) => setTags(tags.filter(t => t !== tag))}
          />

          <ErrorMessage error={error} />
        </div>

        <BottomToolbar
          onMediaUpload={handleMediaUpload}
          mediaCount={media.length}
          onEmojiToggle={() => setShowEmojiPicker(!showEmojiPicker)}
          onMentionClick={() => {
            const newContent = Modifier.insertText(
              editorState.getCurrentContent(),
              editorState.getSelection(),
              '@'
            );
            const newEditorState = EditorState.push(
              editorState,
              newContent,
              'insert-characters'
            );
            setEditorState(newEditorState);
            editorRef.current?.focus();
          }}
          isSubmitting={isSubmitting}
          canSubmit={!!title.trim() && editorState.getCurrentContent().hasText()}
          onSubmit={handleSubmit}
        />
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;
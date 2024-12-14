import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Film, Hash, Send, Plus, Trash2, Smile, AtSign, Link, AlertCircle } from 'lucide-react';
import { Editor } from 'draft-js';
import { EditorState, convertToRaw, ContentState, Modifier } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

// 输入字数限制常量
const CONSTANTS = {
  TITLE_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 2000,
  TAG_MAX_LENGTH: 20,
  MAX_TAGS: 5,
  MAX_MEDIA: 4,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// 媒体预览组件
const MediaPreview = ({ media, onRemove }) => (
  <div className="grid grid-cols-2 gap-4">
    {media.map((item) => (
      <div key={item.id} className="relative group">
        {item.type === 'image' ? (
          <img
            src={item.preview}
            alt=""
            className="w-full h-40 object-cover rounded-lg"
          />
        ) : (
          <video
            src={item.preview}
            className="w-full h-40 object-cover rounded-lg"
            controls
          />
        )}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          {(item.file.size / 1024 / 1024).toFixed(1)}MB
        </div>
      </div>
    ))}
  </div>
);

// 标签组件
const TagsInput = ({ tags, onAddTag, onRemoveTag }) => {
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

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
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="添加标签..."
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            autoFocus
            maxLength={CONSTANTS.TAG_MAX_LENGTH}
          />
        </form>
      ) : tags.length < CONSTANTS.MAX_TAGS && (
        <button
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

// 艾特用户弹窗组件
const MentionPopup = ({ searchText, onSelect, onClose, style }) => {
  // 模拟用户数据，实际项目中应该从API获取
  const users = [
    { id: 1, name: '用户A', avatar: 'https://via.placeholder.com/40' },
    { id: 2, name: '用户B', avatar: 'https://via.placeholder.com/40' },
    // ... 更多用户
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div
      style={style}
      className="absolute z-50 bg-[#1a2433] border border-white/10 rounded-lg shadow-xl p-2 w-64"
    >
      {filteredUsers.map(user => (
        <div
          key={user.id}
          onClick={() => onSelect(user)}
          className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
        >
          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
          <span className="text-white">{user.name}</span>
        </div>
      ))}
    </div>
  );
};


// 内容编辑器组件
const ContentEditor = ({ 
  editorState, 
  onChange, 
  showEmojiPicker, 
  onEmojiSelect,
  showMentionPopup,
  mentionPosition,
  mentionSearch,
  onMentionSelect,
  editorRef 
}) => {
  // 计算表情选择器的位置
  const getEmojiPickerPosition = () => {
    if (!editorRef.current) return {};
    const rect = editorRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // 如果编辑器下方空间不够,则显示在上方
    const showAbove = rect.bottom + 400 > windowHeight;
    
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
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 艾特用户弹窗 */}
      <AnimatePresence>
        {showMentionPopup && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: `${mentionPosition.top}px`,
              left: `${mentionPosition.left}px`,
              zIndex: 1000
            }}
          >
            <MentionPopup
              searchText={mentionSearch}
              onSelect={onMentionSelect}
              onClose={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 错误提示组件
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

// 媒体上传按钮组件
const MediaUploadButton = ({ type, disabled, onChange }) => (
  <label className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
    <input
      type="file"
      accept={type === 'image' ? 'image/*' : 'video/*'}
      multiple={type === 'image'}
      className="hidden"
      onChange={onChange}
      disabled={disabled}
    />
    {type === 'image' ? <Image className="w-5 h-5" /> : <Film className="w-5 h-5" />}
  </label>
);

// 底部工具栏组件
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
        label="艾特用户" 
        onClick={onMentionClick} 
      />
    </div>

    <button
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


// 主组件
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
  
  const editorRef = useRef(null);

  // 处理媒体上传
  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // 文件验证
    const validFiles = files.filter(file => {
      if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        setError(`文件 ${file.name} 超过10MB限制`);
        return false;
      }
      if (!file.type.match(/^(image|video)/)) {
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
    
    setMedia([...media, ...newMedia]);
    setError('');
  };

  // 处理emoji选择
  const handleEmojiSelect = (emoji) => {
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
    setShowEmojiPicker(false);
  };

  // 处理艾特用户
  const handleMention = (user) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithMention = Modifier.replaceText(
      contentState,
      editorState.getSelection().merge({
        anchorOffset: editorState.getSelection().getAnchorOffset() - mentionSearch.length - 1,
        focusOffset: editorState.getSelection().getFocusOffset(),
      }),
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
  };

  // 监听编辑器变化
  const handleEditorChange = (newEditorState) => {
    const selection = newEditorState.getSelection();
    const content = newEditorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();
    const cursor = selection.getStartOffset();

    // 检查是否正在输入@
    if (text.slice(0, cursor).endsWith('@')) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const cursorRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
      
      setMentionPosition({
        top: cursorRect.bottom - editorRect.top,
        left: cursorRect.left - editorRect.left,
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

    setEditorState(newEditorState);
  };

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
      // 先上传媒体文件
      const mediaUrls = await Promise.all(
        media.map(async (item) => {
          const formData = new FormData();
          formData.append('file', item.file);
          // TODO: 实现文件上传逻辑
          return 'https://example.com/media/1'; // 模拟返回的URL
        })
      );

      // 发布帖子
      const postData = {
        title,
        content,
        tags,
        mediaUrls,
        mentions: [], // TODO: 解析内容中的@提及
        created_at: new Date().toISOString(),
      };

      // TODO: 调用发布接口
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
      setError('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0f1724] rounded-2xl shadow-xl"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">发布内容</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-6">
          {/* 标题输入 */}
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入标题..."
              maxLength={CONSTANTS.TITLE_MAX_LENGTH}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              {title.length}/{CONSTANTS.TITLE_MAX_LENGTH}
            </span>
          </div>

          {/* 内容编辑器 */}
          <div 
            className="relative"
            ref={editorRef}
          >
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
              <Editor
                editorState={editorState}
                onChange={handleEditorChange}
                placeholder="分享你的想法..."
                spellCheck={false}
                className="min-h-[180px]"
              />
            </div>
            
            {/* 字数统计 */}
            <div className="absolute right-3 bottom-3 text-sm text-gray-400">
              {editorState.getCurrentContent().getPlainText().length}/{CONSTANTS.CONTENT_MAX_LENGTH}
            </div>

            {/* 艾特用户弹窗 */}
            <AnimatePresence>
              {showMentionPopup && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MentionPopup
                    searchText={mentionSearch}
                    onSelect={handleMention}
                    onClose={() => setShowMentionPopup(false)}
                    style={{
                      top: mentionPosition.top + 'px',
                      left: mentionPosition.left + 'px'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 表情选择器 */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2"
                >
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="dark"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 媒体预览 */}
          {media.length > 0 && (
            <MediaPreview
              media={media}
              onRemove={(id) => setMedia(media.filter(item => item.id !== id))}
            />
          )}

          {/* 标签输入 */}
          <TagsInput
            tags={tags}
            onAddTag={(tag) => setTags([...tags, tag])}
            onRemoveTag={(tag) => setTags(tags.filter(t => t !== tag))}
          />

          {/* 错误提示 */}
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
        </div>

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            {/* 图片上传 */}
            <label className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
                disabled={media.length >= CONSTANTS.MAX_MEDIA}
              />
              <Image className="w-5 h-5" />
            </label>

            {/* 视频上传 */}
            <label className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleMediaUpload}
                disabled={media.length >= CONSTANTS.MAX_MEDIA}
              />
              <Film className="w-5 h-5" />
            </label>

            {/* 表情按钮 */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* 艾特用户按钮 */}
            <button
              onClick={() => {
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
                editorRef.current.focus();
              }}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <AtSign className="w-5 h-5" />
            </button>
          </div>

          {/* 发布按钮 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !editorState.getCurrentContent().hasText()}
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
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;
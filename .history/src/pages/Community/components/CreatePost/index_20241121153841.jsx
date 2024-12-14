// src/pages/Community/components/CreatePost/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Film, Hash, Send, Plus, Trash2 } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose }) => {
  // 状态管理
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [media, setMedia] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);

  // 处理媒体上传
  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    
    setMedia([...media, ...newMedia]);
  };

  // 删除媒体
  const handleRemoveMedia = (mediaId) => {
    setMedia(media.filter(item => item.id !== mediaId));
  };

  // 添加标签
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 发布帖子
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    try {
      // TODO: 这里添加实际的发布逻辑
      console.log({
        title,
        content,
        tags,
        media
      });
      
      onClose();
      // 重置表单
      setTitle('');
      setContent('');
      setTags([]);
      setMedia([]);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('发布失败，请重试');
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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入标题..."
            maxLength={100}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />

          {/* 内容输入 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的想法..."
            rows={5}
            maxLength={2000}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />

          {/* 媒体预览 */}
          {media.length > 0 && (
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
                    onClick={() => handleRemoveMedia(item.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 标签展示 */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-300 flex items-center gap-2 group"
              >
                <Hash className="w-4 h-4" />
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
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
                  maxLength={20}
                />
              </form>
            ) : tags.length < 5 && (
              <button
                onClick={() => setShowTagInput(true)}
                className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加标签
              </button>
            )}
          </div>
        </div>

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <label className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
                disabled={media.length >= 4}
              />
              <Image className="w-5 h-5" />
            </label>
            <label className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleMediaUpload}
                disabled={media.length >= 4}
              />
              <Film className="w-5 h-5" />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium 
              hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>发布</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;
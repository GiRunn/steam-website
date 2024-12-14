// src/pages/Community/components/CreatePost/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Image, Film, Hash, Send } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0f1724] rounded-2xl shadow-xl p-6"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">发布内容</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容编辑区 */}
        <div className="space-y-4">
          {/* 标题输入 */}
          <input
            type="text"
            placeholder="输入标题..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />

          {/* 内容输入 */}
          <textarea
            placeholder="分享你的想法..."
            rows={5}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          />

          {/* 工具栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Film className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Hash className="w-5 h-5" />
              </button>
            </div>

            <button 
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-shadow flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>发布</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;
// src/pages/Community/PostDetail/components/ShareDrawer/index.jsx
import React from 'react';
import { X, Link, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShareDrawer = ({ isOpen, onClose, postId, title = '' }) => {
  // 生成分享链接
  const shareUrl = `${window.location.origin}/community/post/${postId}`;
  
  // 复制链接函数
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // 这里可以添加一个成功提示
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 社交媒体分享函数
  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* 抽屉内容 - 修改为左侧展示 */}
          <motion.div
            initial={{ x: '-100%' }}  {/* 改为从左侧开始 */}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}    {/* 改为向左退出 */}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-[#0a0f16] border-r border-gray-800/50 z-50 
                     shadow-xl overflow-y-auto"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
              <h3 className="text-lg font-['SF_Pro_Display'] text-gray-200">分享内容</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-800/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 分享选项 */}
            <div className="p-4 space-y-4">
              {/* 复制链接 */}
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                         bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <Link className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 font-['SF_Pro_Text']">复制链接</span>
              </button>

              {/* 分享到 Twitter */}
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                         bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <Twitter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 font-['SF_Pro_Text']">分享到 Twitter</span>
              </button>

              {/* 分享到 Facebook */}
              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                         bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <Facebook className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 font-['SF_Pro_Text']">分享到 Facebook</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareDrawer;
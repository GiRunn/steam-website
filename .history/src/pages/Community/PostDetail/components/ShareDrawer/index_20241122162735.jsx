// src/pages/Community/PostDetail/components/ShareDrawer/index.jsx
import React, { useState } from 'react';
import { Share2, Copy, X, Link2, QrCode } from 'lucide-react';
import PropTypes from 'prop-types';

const ShareMethod = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center justify-center p-4 rounded-lg
      ${disabled 
        ? 'bg-gray-800/20 cursor-not-allowed' 
        : 'bg-gray-800/50 hover:bg-gray-700/50'
      }
      transition-all duration-200
    `}
  >
    <Icon className="w-6 h-6 mb-2 text-blue-400" />
    <span className="text-sm text-gray-300">{label}</span>
  </button>
);

const ShareDrawer = ({ isOpen, onClose, postId, postTitle }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/community/post/${postId}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="share-modal-title" role="dialog">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-[#0a0f16] rounded-t-xl p-6 transform transition-transform duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 id="share-modal-title" className="text-lg font-medium">分享帖子</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="关闭分享窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <ShareMethod
            icon={Link2}
            label="复制链接"
            onClick={handleCopyLink}
          />
          <ShareMethod
            icon={QrCode}
            label="生成二维码"
          />
          <ShareMethod
            icon={Share2}
            label="系统分享"
          />
        </div>

        <div className="relative">
          <input
            type="text"
            value={`${window.location.origin}/community/post/${postId}`}
            readOnly
            className="w-full bg-gray-800/50 rounded-lg px-4 py-3 pr-20 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleCopyLink}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              px-3 py-1 rounded-md text-sm
              ${copied ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
              transition-colors
            `}
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>
    </div>
  );
};

ShareMethod.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

ShareDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  postId: PropTypes.number.isRequired,
  postTitle: PropTypes.string
};

export default ShareDrawer;
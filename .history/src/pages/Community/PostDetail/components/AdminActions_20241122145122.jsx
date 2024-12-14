import React from 'react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { motion } from 'framer-motion';

// 子组件：操作按钮
const ActionButton = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const getVariantStyles = () => {
    const baseStyles = `
      relative flex items-center gap-2 px-4 py-2 rounded-md
      font-medium text-sm transition-all duration-200
      hover:scale-[1.02] active:scale-[0.98]
      group
    `;

    const variants = {
      default: `
        bg-[#1a1f2e] text-gray-400
        hover:bg-[#252a3c] hover:text-gray-300
        border border-gray-800/30
      `,
      warning: `
        bg-red-950/30 text-red-400
        hover:bg-red-950/50 hover:text-red-300
        border border-red-900/30
      `,
      active: `
        bg-yellow-950/30 text-yellow-400
        hover:bg-yellow-950/50 hover:text-yellow-300
        border border-yellow-900/30
      `
    };

    return `${baseStyles} ${variants[variant]}`;
  };

  return (
    <motion.button 
      onClick={onClick}
      className={getVariantStyles()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pin Icon */}
      {Icon === 'pin' && (
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )}
      
      {/* Delete Icon */}
      {Icon === 'trash' && (
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
      <span>{label}</span>
      
      {/* 按钮光效 */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};

// 主组件
const AdminActions = ({ isPinned = false, postId, onPin, onDelete }) => {
  const handlePin = () => {
    if (onPin) onPin(postId, !isPinned);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('确定要删除这个帖子吗？此操作不可撤销。')) {
      onDelete(postId);
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-800/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Tooltip content={isPinned ? "取消置顶这个帖子" : "置顶这个帖子"}>
        <ActionButton
          icon="pin"
          label={isPinned ? '取消置顶' : '置顶'}
          onClick={handlePin}
          variant={isPinned ? 'active' : 'default'}
        />
      </Tooltip>

      <Tooltip content="删除这个帖子">
        <ActionButton
          icon="trash"
          label="删除"
          onClick={handleDelete}
          variant="warning"
        />
      </Tooltip>
    </motion.div>
  );
};

export default AdminActions;
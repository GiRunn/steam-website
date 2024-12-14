import React from 'react';
import { Tooltip } from '../../../../components/ui/Tooltip'; // 修正为相对路径
import { Pin, Trash2 } from 'lucide-react';

// 子组件：操作按钮
const ActionButton = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  // 根据不同variant返回不同的样式类名
  const getVariantStyles = () => {
    const baseStyles = `
      relative flex items-center gap-2 px-4 py-2 rounded-md
      font-medium text-sm transition-all duration-200
      hover:scale-[1.02] active:scale-[0.98]
    `;

    const variants = {
      default: `
        bg-gray-800/40 text-gray-400
        hover:bg-gray-800/60 hover:text-gray-300
        border border-gray-700/30
      `,
      warning: `
        bg-red-500/10 text-red-400
        hover:bg-red-500/20 hover:text-red-300
        border border-red-900/30
      `,
      active: `
        bg-yellow-500/10 text-yellow-400
        hover:bg-yellow-500/20 hover:text-yellow-300
        border border-yellow-900/30
      `
    };

    return `${baseStyles} ${variants[variant]}`;
  };

  return (
    <button 
      onClick={onClick}
      className={getVariantStyles()}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      
      {/* 按钮光效 */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
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
    <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-800/30">
      <Tooltip delayDuration={300}>
        <Tooltip.Trigger asChild>
          <div>
            <ActionButton
              icon={Pin}
              label={isPinned ? '取消置顶' : '置顶'}
              onClick={handlePin}
              variant={isPinned ? 'active' : 'default'}
            />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="text-sm">{isPinned ? '取消置顶这个帖子' : '置顶这个帖子'}</p>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip delayDuration={300}>
        <Tooltip.Trigger asChild>
          <div>
            <ActionButton
              icon={Trash2}
              label="删除"
              onClick={handleDelete}
              variant="warning"
            />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="text-sm">删除这个帖子</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
};

export default AdminActions;
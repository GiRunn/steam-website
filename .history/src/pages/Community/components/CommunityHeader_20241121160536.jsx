// src/pages/Community/components/CommunityHeader.jsx
// 该文件作用: 社区页面的头部组件,包含社区标题、统计信息、操作按钮和公告展示功能
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Plus,
  BarChart,
  Users,
  MessageCircle,
  Eye,
  ChevronDown,
  Flame,
  X
} from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { Dialog, DialogContent } from '../../../components/ui/Dialog';
import PropTypes from 'prop-types'; // 添加这行
import { COMMUNITY_HEADER_CONSTANTS as CONSTANTS } from '../constants';

// 统计项子组件 - 展示单个统计指标
const StatisticItem = React.memo(({ icon: Icon, label, value }) => (
  <Tooltip content={label}>
    <div className="flex items-center gap-1">
      <Icon className="w-4 h-4" />
      <span>{value}</span>
    </div>
  </Tooltip>
));

// 标题区域子组件 - 包含Logo和统计信息
const HeaderTitle = React.memo(() => (
  <div className="flex items-center gap-6">
    {/* Logo区域 */}
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl shadow-lg shadow-blue-500/25">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <div className="mt-2 w-px h-16 bg-gradient-to-b from-blue-500 to-transparent" />
    </div>

    {/* 标题和统计信息 */}
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
      >
        {CONSTANTS.title}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-2 flex items-center gap-4 text-gray-400"
      >
        {CONSTANTS.statistics.map(stat => (
          <StatisticItem
            key={stat.id}
            icon={stat.id === 'activeUsers' ? Users : stat.id === 'todayPosts' ? MessageCircle : Eye}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </motion.div>
    </div>
  </div>
));

// 操作按钮区域子组件 - 包含数据查看和发帖按钮
const ActionButtons = React.memo(({ onCreatePost }) => (
  <div className="flex items-center gap-4">
    {/* 数据查看按钮 */}
    <Tooltip content="查看数据">
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
      >
        <BarChart className="w-5 h-5" />
        <span>{CONSTANTS.buttons.communityData}</span>
      </motion.button>
    </Tooltip>

    {/* 发帖按钮 */}
    <Tooltip content="发布新帖">
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreatePost}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/25"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>{CONSTANTS.buttons.createPost}</span>
        </div>
      </motion.button>
    </Tooltip>
  </div>
));

// 公告卡片子组件 - 展示单个公告预览
const AnnouncementCard = React.memo(({ announcement, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 * index }}
    onClick={() => onClick(announcement)}
    className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 cursor-pointer"
  >
    {/* 背景渐变效果 */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* 公告内容 */}
    <div className="relative flex items-start gap-3">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
        <div className="w-full h-full bg-[#0f1724] rounded-[7px] flex items-center justify-center">
          <Flame className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      <div className="flex-1 min-w-0"> {/* 添加 min-w-0 防止文本溢出 */}
        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors duration-300 truncate">
          {announcement.title}
        </h3>
        <p className="mt-1 text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
          {announcement.summary}
        </p>
      </div>

      <Tooltip content="展开查看">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors duration-300"
          onClick={(e) => {
            e.stopPropagation(); // 防止触发父元素的点击事件
            onClick(announcement);
          }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </Tooltip>
    </div>
  </motion.div>
));

// 公告详情弹窗子组件 - 展示公告完整内容
const AnnouncementDialog = React.memo(({ announcement, isOpen, onClose }) => {
  if (!announcement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl p-0 border-none bg-[#0f1724] overflow-hidden"
        onEscapeKeyDown={onClose} // 添加ESC键关闭支持
        onPointerDownOutside={onClose} // 添加点击外部关闭支持
      >
        {/* 主要内容区域 */}
        <div className="relative p-6">
          {/* 关闭按钮 */}
          <div 
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors group cursor-pointer"
            onClick={onClose}  // 确保点击事件正确绑定
            role="button"
            tabIndex={0}
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>

          {/* 内容区域 */}
          <div className="space-y-6">
            {/* 标题区域 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
                <div className="w-full h-full bg-[#0f1724] rounded-[7px] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white truncate">
                  {announcement.title}
                </h2>
              </div>
            </div>

            {/* 公告内容 */}
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />

            {/* 媒体内容 */}
            {announcement.media && announcement.media.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {announcement.media.map((item, index) => (
                  <div key={index} className="rounded-xl overflow-hidden bg-black/20">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.alt}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        controls
                        poster={item.poster}
                        className="w-full"
                        preload="none"
                      >
                        <source src={item.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

AnnouncementDialog.propTypes = {
  announcement: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    media: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['image', 'video']).isRequired,
      url: PropTypes.string.isRequired,
      alt: PropTypes.string,
      poster: PropTypes.string,
    })),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

// 装饰背景子组件 - 提供视觉效果
const DecorativeBackground = React.memo(() => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-pattern opacity-5" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
  </div>
));

// 主组件
const CommunityHeader = ({ onCreatePost }) => {
  // 状态管理
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f1724] to-[#141d2e] rounded-2xl p-8">
        <DecorativeBackground />
        
        <div className="relative">
          {/* 头部区域 */}
          <div className="flex items-center justify-between mb-8">
            <HeaderTitle />
            <ActionButtons onCreatePost={onCreatePost} />
          </div>
          
          {/* 公告卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONSTANTS.announcements.map((announcement, index) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                index={index}
                onClick={(announcement) => setSelectedAnnouncement(announcement)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 公告详情弹窗 */}
      <AnnouncementDialog
        announcement={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};

// 属性类型检查
CommunityHeader.propTypes = {
  onCreatePost: PropTypes.func.isRequired,
};

export default CommunityHeader;
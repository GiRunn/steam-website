// E:\Steam\steam-website\src\pages\VideoGuides\constants.js
// 用途：存储视频指南页面所需的常量配置

import { BookOpen, Star, Shield, Download } from 'lucide-react';

// 视频分类常量
export const VIDEO_CATEGORIES = [
  { 
    id: 'getting-started',
    name: '新手入门',
    icon: BookOpen,
    color: 'blue',
    description: '适合刚接触游戏商城的用户'
  },
  { 
    id: 'purchase',
    name: '购买指南',
    icon: Star,
    color: 'yellow',
    description: '如何购买、支付和管理订单'
  },
  { 
    id: 'account',
    name: '账户安全',
    icon: Shield,
    color: 'green',
    description: '账户设置和安全建议'
  },
  {
    id: 'download',
    name: '下载安装',
    icon: Download,
    color: 'purple',
    description: '游戏下载和安装指南'
  }
];

// 视频列表数据
export const VIDEO_GUIDES = [
  {
    id: 1,
    title: '如何购买游戏',
    description: '详细介绍在游戏商城购买游戏的完整流程...',
    thumbnail: '/api/placeholder/640/360',
    duration: '5:32',
    category: 'purchase',
    views: 12500,
    likes: 890,
    featured: true,
    tags: ['购买', '支付', '新手指南'],
    date: '2024-01-15'
  },
  // 可以添加更多视频数据
];

// 排序选项配置
export const SORT_OPTIONS = [
  { value: 'newest', label: '最新发布' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'views', label: '观看最多' }
];

// 视图模式配置
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};
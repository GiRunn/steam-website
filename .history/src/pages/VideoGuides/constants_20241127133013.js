// E:\Steam\steam-website\src\pages\VideoGuides\constants.js
// 用途：存储视频指南页面所需的常量配置

import { BookOpen, Star, Shield, Download } from 'lucide-react';

// API 配置
export const API_CONFIG = {
  BASE_URL: '/api/videos',  // 视频API的基础URL
  ENDPOINTS: {
    LIST: '/list',         // 获取视频列表
    DETAIL: '/detail',     // 获取视频详情
    VIEWS: '/views',       // 更新观看次数
    LIKES: '/likes'        // 更新点赞数
  }
};

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
    description: '详细介绍在游戏商城购买游戏的完整流程，包括账户充值、支付方式选择、订单确认等步骤。',
    thumbnail: '/api/placeholder/640/360',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // 示例YouTube视频
    duration: '5:32',
    category: 'purchase',
    views: 12500,
    likes: 890,
    featured: true,
    tags: ['购买', '支付', '新手指南'],
    date: '2024-01-15'
  },
  {
    id: 2,
    title: '账户安全设置指南',
    description: '了解如何保护您的游戏账户安全，包括双重认证、密码设置、安全问题等重要设置。',
    thumbnail: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7', // 示例Bilibili视频
    duration: '7:15',
    category: 'account',
    views: 8300,
    likes: 655,
    featured: false,
    tags: ['账户安全', '设置', '双重认证'],
    date: '2024-01-14'
  },
  {
    id: 3,
    title: '游戏下载和安装教程',
    description: '完整演示游戏下载和安装过程，包括系统要求检查、下载设置、安装位置选择等内容。',
    thumbnail: '/api/placeholder/640/360',
    videoUrl: '/videos/game-installation-guide.mp4', // 示例本地视频
    duration: '8:45',
    category: 'download',
    views: 15200,
    likes: 1230,
    featured: true,
    tags: ['下载', '安装', '教程'],
    date: '2024-01-13'
  },
  {
    id: 4,
    title: '新手入门指南',
    description: '为新用户提供全面的平台使用指南，包括界面介绍、基本功能操作、常见问题解答等。',
    thumbnail: '/api/placeholder/640/360',
    videoUrl: 'https://www.youtube.com/watch?v=abcdefghijk', // 示例YouTube视频
    duration: '10:20',
    category: 'getting-started',
    views: 25600,
    likes: 2100,
    featured: true,
    tags: ['新手指南', '基础', '入门'],
    date: '2024-01-12'
  }
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

// 播放器类型配置
export const PLAYER_TYPES = {
  YOUTUBE: 'youtube',
  BILIBILI: 'bilibili',
  DIRECT: 'direct'
};

// 页面配置
export const PAGE_CONFIG = {
  TITLE: '使用指导视频',
  SUBTITLE: '通过专业视频教程，轻松了解游戏商城的各项功能和使用技巧',
  ITEMS_PER_PAGE: 12,
  DEFAULT_SORT: 'newest',
  DEFAULT_VIEW_MODE: VIEW_MODES.GRID
};

// 错误消息配置
export const ERROR_MESSAGES = {
  LOAD_ERROR: '加载视频失败，请稍后重试',
  PLAY_ERROR: '播放视频时出现错误，请刷新页面重试',
  NO_RESULTS: '未找到相关视频',
  API_ERROR: '服务器请求失败，请检查网络连接'
};
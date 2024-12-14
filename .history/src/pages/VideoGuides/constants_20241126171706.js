import { BookOpen, Star, Shield, Download } from 'lucide-react';

// 视频分类数据
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

// 视频数据
export const VIDEO_GUIDES = [
  {
    id: 1,
    title: '如何购买游戏',
    description: '详细介绍在游戏商城购买游戏的完整流程，包括支付方式选择、订单确认等步骤。',
    thumbnail: '/api/placeholder/640/360',
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
    description: '学习如何保护你的游戏账户安全，包括双重认证、密码管理等重要设置。',
    thumbnail: '/api/placeholder/640/360',
    duration: '4:45',
    category: 'account',
    views: 8900,
    likes: 720,
    featured: false,
    tags: ['账户安全', '设置', '双重认证'],
    date: '2024-01-20'
  },
  {
    id: 3,
    title: '游戏下载和安装教程',
    description: '从下载到安装，完整演示游戏安装过程和常见问题解决方案。',
    thumbnail: '/api/placeholder/640/360',
    duration: '6:15',
    category: 'download',
    views: 15600,
    likes: 1200,
    featured: true,
    tags: ['下载', '安装', '问题解决'],
    date: '2024-01-25'
  }
];

// 排序选项
export const SORT_OPTIONS = [
  { value: 'newest', label: '最新发布' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'views', label: '观看最多' }
];

// 每页显示数量
export const PAGE_SIZE = 10;
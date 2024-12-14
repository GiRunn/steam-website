import { BookOpen, Star, Shield, Download } from 'lucide-react';

// 视频分类数据
export const VIDEO_CATEGORIES = [
  { 
    id: 'all',
    name: '全部',
    icon: null,
    color: 'blue',
    description: '显示所有视频指南'
  },
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
// 视频分类数据
export const VIDEO_CATEGORIES = [
  { 
    id: 'all',
    name: '全部',
    icon: null,
    color: 'blue',
    description: '显示所有视频指南'
  },
  { 
    id: 'getting-started',
    name: '新手入门',
    icon: () => <BookOpen size={20} />,  // 修改为函数组件
    color: 'blue',
    description: '适合刚接触游戏商城的用户'
  },
  { 
    id: 'purchase',
    name: '购买指南',
    icon: () => <Star size={20} />,  // 修改为函数组件
    color: 'yellow',
    description: '如何购买、支付和管理订单'
  },
  { 
    id: 'account',
    name: '账户安全',
    icon: () => <Shield size={20} />,  // 修改为函数组件
    color: 'green',
    description: '账户设置和安全建议'
  },
  {
    id: 'download',
    name: '下载安装',
    icon: () => <Download size={20} />,  // 修改为函数组件
    color: 'purple',
    description: '游戏下载和安装指南'
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
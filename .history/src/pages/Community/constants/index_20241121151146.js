// src/pages/Community/constants/index.js

import {
    CheckCircle,
    HelpCircle,
    MessageCircle,
    Tag,
    Star,
    Award,
  } from 'lucide-react';
  
  // 帖子类型常量
  export const POST_TYPES = [
    { id: 'all', name: '全部', icon: Tag },
    { id: 'announcement', name: '公告', icon: CheckCircle, color: 'blue' },
    { id: 'question', name: '求助', icon: HelpCircle, color: 'orange' },
    { id: 'discussion', name: '讨论', icon: MessageCircle, color: 'green' },
    { id: 'guide', name: '攻略', icon: Star, color: 'yellow' },
    { id: 'feedback', name: '反馈', icon: Award, color: 'purple' }  
  ];
  
  // 热门标签数据
  export const TRENDING_TAGS = [
    { id: 1, name: '更新', count: 1234 },
    { id: 2, name: '活动', count: 856 },
    { id: 3, name: '攻略', count: 654 },
    { id: 4, name: 'BUG', count: 432 },
    { id: 5, name: '建议', count: 321 }
  ];
  
  // 模拟帖子数据
  export const MOCK_POSTS = [
    {
      id: 1,
      type: 'announcement',
      title: '重大更新：全新版本即将发布！',  
      content: '我们很高兴地宣布，游戏将在下周推出重大更新。此次更新包含全新的游戏内容、性能优化和更多精彩特性...',
      author: {
        id: 'admin1',
        name: '游戏官方',
        avatar: '/api/placeholder/32/32',
        type: 'official',
        badge: 'admin'  
      },
      cover: '/api/placeholder/800/400',
      media: [
        { type: 'image', url: '/api/placeholder/800/400' }  
      ],
      stats: {
        views: 12500,
        likes: 3200,
        comments: 856
      },
      tags: ['更新', '官方公告'],
      pinned: true,
      createdAt: '2024-01-15T10:00:00Z',
      highlighted: true
    }
  ];
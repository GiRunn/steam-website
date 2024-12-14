// src/pages/Community/PostDetail/index.jsx
// 社区帖子详情页 - 包含主要内容展示和互动功能

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, Bookmark, Flag, Eye, Clock } from 'lucide-react';
import { MOCK_POSTS } from '../constants';
import PostContent from './components/PostContent';
import UserInfo from './components/UserInfo';
import Interactions from './components/Interactions';
import ReplyEditor from './components/ReplyEditor';
import ReplyList from './components/PostDetail/ReplyList';
import AdminActions from './components/AdminActions';
import RelatedPosts from './components/RelatedPosts';


import { 
  Share2, 
  Bookmark, 
  Flag, 
  Eye, 
  Clock, 
  ThumbsUp,
  MessageCircle, 
  Award, 
  TrendingUp, 
  Users, 
  Activity,
  Bell, 
  Calendar, 
  Zap
} from 'lucide-react';

// 新增的子组件: 帖子元数据展示
const PostMetadata = ({ views, lastActive, readTime }) => (
  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
    <div className="flex items-center">
      <Eye className="w-4 h-4 mr-1" />
      <span>{views} 次浏览</span>
    </div>
    <div className="flex items-center">
      <Clock className="w-4 h-4 mr-1" />
      <span>阅读时间 {readTime} 分钟</span>
    </div>
    <div className="flex items-center">
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
      <span>最后活跃 {lastActive}</span>
    </div>
  </div>
);

// 新增的子组件: 快捷操作栏
const QuickActions = ({ onShare, onBookmark, onReport, isBookmarked }) => (
  <div className="flex items-center justify-end space-x-4 mb-4">
    <button className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
      <Share2 className="w-5 h-5 mr-1" />
      <span>分享</span>
    </button>
    <button 
      className={`flex items-center transition-colors ${
        isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
      }`}
    >
      <Bookmark className="w-5 h-5 mr-1" />
      <span>{isBookmarked ? '已收藏' : '收藏'}</span>
    </button>
    <button className="flex items-center text-gray-400 hover:text-red-400 transition-colors">
      <Flag className="w-5 h-5 mr-1" />
      <span>举报</span>
    </button>
  </div>
);

// 新增的子组件: 标签列表
const TagList = ({ tags }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {tags.map((tag, index) => (
      <span 
        key={index}
        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
      >
        {tag}
      </span>
    ))}
  </div>
);

const SubscribeNotification = () => (
  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Bell className="w-5 h-5 text-yellow-400 mr-2" />
        <div>
          <h3 className="font-medium">订阅帖子更新</h3>
          <p className="text-sm text-gray-400">获取最新回复和更新提醒</p>
        </div>
      </div>
      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center">
        <Zap className="w-4 h-4 mr-1" />
        订阅
      </button>
    </div>
  </div>
);

const RecentEvents = () => (
  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
    <h3 className="text-lg font-medium mb-4 flex items-center">
      <Calendar className="w-5 h-5 mr-2 text-blue-400" />
      近期活动
    </h3>
    <div className="space-y-4">
      {[
        { title: '年度玩家大会', date: '2024/12/01', status: '报名中' },
        { title: '冬季版本预览', date: '2024/12/15', status: '即将开始' },
        { title: '圣诞特别活动', date: '2024/12/24', status: '准备中' }
      ].map((event, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
            <div>
              <div className="text-gray-200">{event.title}</div>
              <div className="text-sm text-gray-500">{event.date}</div>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
            {event.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);


const PostStats = ({ stats }) => (
  <div className="grid grid-cols-4 gap-4 mb-6">
    {[
      { icon: Eye, label: '浏览', value: stats.views, color: 'text-blue-400' },
      { icon: ThumbsUp, label: '获赞', value: stats.likes, color: 'text-red-400' },
      { icon: MessageCircle, label: '评论', value: stats.comments, color: 'text-green-400' },
      { icon: Bookmark, label: '收藏', value: stats.bookmarks, color: 'text-yellow-400' },
    ].map((stat, index) => (
      <div key={index} className="bg-gray-800/50 rounded-lg p-4 text-center">
        <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
        <div className="text-lg font-semibold">{stat.value}</div>
        <div className="text-sm text-gray-400">{stat.label}</div>
      </div>
    ))}
  </div>
);

const CommunityActivities = () => (
  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
    <h3 className="text-lg font-medium mb-4 flex items-center">
      <Activity className="w-5 h-5 mr-2 text-purple-400" />
      社区动态
    </h3>
    <div className="space-y-4">
      {[
        { type: '活动', title: '每周截图分享活动', time: '2小时前' },
        { type: '公告', title: '社区规范更新提醒', time: '4小时前' },
        { type: '活动', title: '玩家创作大赛开始报名', time: '1天前' },
      ].map((activity, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex-1">
            <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
              activity.type === '活动' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {activity.type}
            </span>
            <span className="text-gray-300 hover:text-blue-400 cursor-pointer">
              {activity.title}
            </span>
          </div>
          <span className="text-sm text-gray-500">{activity.time}</span>
        </div>
      ))}
    </div>
  </div>
);

const ActiveUsers = () => (
  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
    <h3 className="text-lg font-medium mb-4 flex items-center">
      <Users className="w-5 h-5 mr-2 text-green-400" />
      活跃用户
    </h3>
    <div className="grid grid-cols-4 gap-2">
      {Array(8).fill(0).map((_, index) => (
        <div key={index} className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-700 mx-auto mb-2 relative">
            <img
              src={`/api/placeholder/48/48`}
              alt="用户头像"
              className="rounded-full"
            />
            {index < 3 && (
              <div className="absolute -top-1 -right-1">
                <Award className="w-4 h-4 text-yellow-400" />
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400 block truncate">用户{index + 1}</span>
        </div>
      ))}
    </div>
  </div>
);


const HotTopics = () => (
  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
    <h3 className="text-lg font-medium mb-4 flex items-center">
      <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
      热门话题
    </h3>
    <div className="space-y-3">
      {['版本更新情报', '游戏攻略分享', '玩家作品展示', '社区活动'].map((topic, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-gray-300 hover:text-blue-400 cursor-pointer">
            #{topic}
          </span>
          <span className="text-sm text-gray-500">
            {Math.floor(Math.random() * 1000)}讨论
          </span>
        </div>
      ))}
    </div>
  </div>
);

// 新增的子组件: 帖子导航
const PostNavigation = ({ prevPost, nextPost }) => (
  <div className="grid grid-cols-2 gap-4 mt-8 border-t border-gray-800/50 pt-6">
    <button 
      onClick={() => prevPost && navigate(`/community/post/${prevPost.id}`)}
      className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
        prevPost 
          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300' 
          : 'bg-gray-800/20 text-gray-600 cursor-not-allowed'
      }`}
      disabled={!prevPost}
    >
      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      上一篇
    </button>
    
    <button 
      onClick={() => nextPost && navigate(`/community/post/${nextPost.id}`)}
      className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
        nextPost 
          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300' 
          : 'bg-gray-800/20 text-gray-600 cursor-not-allowed'
      }`}
      disabled={!nextPost}
    >
      下一篇
      <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const post = MOCK_POSTS.find(p => p.id === Number(id));

  if (!post) return <div>帖子不存在</div>;

  // 模拟数据
  const mockTags = ['游戏更新', '官方公告', '重要'];
  const mockMetadata = {
    views: 12500,
    lastActive: '10分钟前',
    readTime: 5
  };
  const mockStats = {
    views: 12500,
    likes: 3200,
    comments: 856,
    bookmarks: 420
  };
  const mockNavigation = {
    prevPost: { id: 1 },
    nextPost: { id: 3 }
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <button
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center text-blue-400 hover:text-blue-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回社区
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <PostStats stats={mockStats} />
            <div className="bg-gray-800/50 rounded-lg p-6">
              <QuickActions 
                isBookmarked={isBookmarked}
                onBookmark={() => setIsBookmarked(!isBookmarked)}
              />
              <UserInfo author={post.author} createdAt={post.createdAt} />
              <TagList tags={mockTags} />
              <PostMetadata {...mockMetadata} />
              <PostContent post={post} />
              <Interactions stats={post.stats} />
              {post.author.type === 'official' && (
                <AdminActions isPinned={post.pinned} postId={post.id} />
              )}
            </div>
            
            <ReplyList replies={post.replies} />
            <ReplyEditor postId={post.id} />
            <PostNavigation {...mockNavigation} />
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <SubscribeNotification />
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">作者信息</h3>
              <UserInfo author={post.author} createdAt={post.createdAt} />
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>发帖总数</span>
                  <span>128</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>获赞总数</span>
                  <span>3.2k</span>
                </div>
              </div>
            </div>
            <HotTopics />
            <ActiveUsers />
            <CommunityActivities />
            <RecentEvents />
            <RelatedPosts currentPostId={post.id} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
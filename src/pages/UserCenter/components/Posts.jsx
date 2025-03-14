import React, { useState } from 'react';
import { Edit3, MessageSquare, ThumbsUp, Eye, MoreHorizontal, Trash2, Edit, Calendar } from 'lucide-react';

const Posts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showDropdown, setShowDropdown] = useState(null);
  
  // 模拟帖子数据
  const posts = [
    {
      id: 1,
      title: '《赛博朋克2077》新DLC体验分享',
      content: '最近体验了《赛博朋克2077》的新DLC，感觉游戏优化提升了不少，剧情也很吸引人...',
      date: '2024-03-10',
      category: '游戏评测',
      views: 1245,
      likes: 89,
      comments: 32,
      status: 'published'
    },
    {
      id: 2,
      title: '求推荐类似《艾尔登法环》的游戏',
      content: '最近通关了《艾尔登法环》，想找一些类似的高难度动作RPG游戏，有什么好的推荐吗？',
      date: '2024-02-25',
      category: '游戏讨论',
      views: 876,
      likes: 45,
      comments: 67,
      status: 'published'
    },
    {
      id: 3,
      title: '我的Steam收藏夹整理分享',
      content: '经过一番整理，我把我的Steam收藏夹分成了几个类别，分享给大家...',
      date: '2024-02-15',
      category: '经验分享',
      views: 532,
      likes: 28,
      comments: 15,
      status: 'draft'
    },
    {
      id: 4,
      title: '2024年最值得期待的十款游戏',
      content: '根据目前公布的信息，我整理了2024年最值得期待的十款游戏，包括...',
      date: '2024-01-20',
      category: '游戏资讯',
      views: 2103,
      likes: 156,
      comments: 48,
      status: 'published'
    },
    {
      id: 5,
      title: '独立游戏开发者访谈：从零开始的游戏之旅',
      content: '最近有幸采访了几位独立游戏开发者，他们分享了从零开始开发游戏的经历...',
      date: '2024-01-05',
      category: '开发者故事',
      views: 687,
      likes: 72,
      comments: 23,
      status: 'published'
    }
  ];

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => post.status === activeTab);

  const handleDeletePost = (id) => {
    // 删除帖子的逻辑
    alert(`删除帖子 ID: ${id}`);
    setShowDropdown(null);
  };

  const handleEditPost = (id) => {
    // 编辑帖子的逻辑
    alert(`编辑帖子 ID: ${id}`);
    setShowDropdown(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 标签切换 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'all'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          全部帖子
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'published'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          已发布
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'draft'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          草稿
        </button>
      </div>

      {/* 发帖统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总发帖数</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </div>
            <Edit3 className="h-8 w-8 text-blue-400 opacity-70" />
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总浏览量</p>
              <p className="text-2xl font-bold text-white">
                {posts.reduce((sum, post) => sum + post.views, 0)}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-400 opacity-70" />
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总点赞数</p>
              <p className="text-2xl font-bold text-white">
                {posts.reduce((sum, post) => sum + post.likes, 0)}
              </p>
            </div>
            <ThumbsUp className="h-8 w-8 text-purple-400 opacity-70" />
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-white hover:text-blue-400 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    {post.status === 'draft' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                        草稿
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mt-2 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> {post.comments}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-[#2a475e] rounded-full transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  
                  {showDropdown === post.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-[#2a475e] rounded-lg shadow-lg z-10 py-1 border border-gray-700">
                      <button 
                        onClick={() => handleEditPost(post.id)}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#1e3a50] flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" /> 编辑
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#1e3a50] flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> 删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">暂无帖子</p>
          </div>
        )}
      </div>

      {/* 分页 */}
      <div className="flex justify-center mt-6">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white disabled:opacity-50">
            上一页
          </button>
          <button className="px-3 py-1 rounded-md bg-blue-500 text-white">1</button>
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">2</button>
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">3</button>
          <span className="text-gray-400">...</span>
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">10</button>
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">
            下一页
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Posts; 
import React, { useState } from 'react';
import { Bookmark, Tag, ShoppingCart, Calendar, MoreHorizontal, Trash2, ExternalLink, Star, DollarSign, Gamepad2 } from 'lucide-react';

const Collections = () => {
  const [activeTab, setActiveTab] = useState('games');
  const [showDropdown, setShowDropdown] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // 模拟收藏的游戏数据
  const games = [
    {
      id: 1,
      title: '赛博朋克2077',
      image: 'https://picsum.photos/300/150?random=1',
      price: 199,
      discount: 0.5,
      tags: ['角色扮演', '开放世界', '科幻'],
      releaseDate: '2020-12-10',
      developer: 'CD Projekt Red',
      rating: 4.2
    },
    {
      id: 2,
      title: '艾尔登法环',
      image: 'https://picsum.photos/300/150?random=2',
      price: 298,
      discount: 0.15,
      tags: ['动作角色扮演', '开放世界', '黑暗奇幻'],
      releaseDate: '2022-02-25',
      developer: 'FromSoftware',
      rating: 4.8
    },
    {
      id: 3,
      title: '博德之门3',
      image: 'https://picsum.photos/300/150?random=3',
      price: 268,
      discount: 0,
      tags: ['角色扮演', '回合制', '奇幻'],
      releaseDate: '2023-08-03',
      developer: 'Larian Studios',
      rating: 4.9
    },
    {
      id: 4,
      title: '死亡搁浅',
      image: 'https://picsum.photos/300/150?random=4',
      price: 248,
      discount: 0.6,
      tags: ['动作冒险', '开放世界', '科幻'],
      releaseDate: '2019-11-08',
      developer: 'Kojima Productions',
      rating: 4.5
    },
    {
      id: 5,
      title: '荒野大镖客：救赎2',
      image: 'https://picsum.photos/300/150?random=5',
      price: 199,
      discount: 0.5,
      tags: ['动作冒险', '开放世界', '西部'],
      releaseDate: '2018-10-26',
      developer: 'Rockstar Games',
      rating: 4.7
    },
    {
      id: 6,
      title: '巫师3：狂猎',
      image: 'https://picsum.photos/300/150?random=6',
      price: 127,
      discount: 0.7,
      tags: ['角色扮演', '开放世界', '奇幻'],
      releaseDate: '2015-05-19',
      developer: 'CD Projekt Red',
      rating: 4.9
    }
  ];
  
  // 模拟收藏的帖子数据
  const posts = [
    {
      id: 1,
      title: '2024年最值得期待的十款游戏',
      author: 'GameExpert',
      date: '2024-01-20',
      category: '游戏资讯',
      views: 2103,
      likes: 156
    },
    {
      id: 2,
      title: '独立游戏开发者访谈：从零开始的游戏之旅',
      author: 'IndieGameLover',
      date: '2024-01-05',
      category: '开发者故事',
      views: 687,
      likes: 72
    },
    {
      id: 3,
      title: '游戏中的叙事设计：如何讲述一个引人入胜的故事',
      author: 'StoryTeller',
      date: '2023-12-15',
      category: '游戏设计',
      views: 1245,
      likes: 98
    },
    {
      id: 4,
      title: '电子竞技的未来：趋势与挑战',
      author: 'ESportsFan',
      date: '2023-11-28',
      category: '电子竞技',
      views: 1876,
      likes: 134
    }
  ];

  const handleRemoveCollection = (id, type) => {
    // 移除收藏的逻辑
    alert(`移除${type === 'game' ? '游戏' : '帖子'} ID: ${id}`);
    setShowDropdown(null);
  };

  const handleViewItem = (id, type) => {
    // 查看项目的逻辑
    alert(`查看${type === 'game' ? '游戏' : '帖子'} ID: ${id}`);
  };

  const renderGameItem = (game) => {
    const discountedPrice = game.price * (1 - game.discount);
    
    return (
      <div key={game.id} className={`relative group ${viewMode === 'grid' ? 'bg-[#1e3a50] rounded-lg overflow-hidden border border-blue-500/20 hover:border-blue-500/40 transition-colors' : 'bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors flex'}`}>
        {viewMode === 'grid' ? (
          <>
            <div className="relative">
              <img 
                src={game.image} 
                alt={game.title} 
                className="w-full h-40 object-cover"
              />
              {game.discount > 0 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{Math.round(game.discount * 100)}%
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => handleViewItem(game.id, 'game')}>
                {game.title}
              </h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {game.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
                {game.tags.length > 2 && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                    +{game.tags.length - 2}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(game.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill={i < Math.floor(game.rating) ? 'currentColor' : 'none'} />
                  ))}
                  <span className="text-gray-400 text-xs ml-1">{game.rating}</span>
                </div>
                <div className="flex items-center">
                  {game.discount > 0 && (
                    <span className="text-gray-400 text-xs line-through mr-1">¥{game.price}</span>
                  )}
                  <span className="text-white font-medium">¥{discountedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setShowDropdown(showDropdown === `game-${game.id}` ? null : `game-${game.id}`)}
                className="p-2 bg-[#2a475e]/90 text-gray-300 hover:text-white rounded-full"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              {showDropdown === `game-${game.id}` && (
                <div className="absolute right-0 mt-1 w-36 bg-[#2a475e] rounded-lg shadow-lg z-10 py-1 border border-gray-700">
                  <button 
                    onClick={() => handleViewItem(game.id, 'game')}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#1e3a50] flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" /> 查看详情
                  </button>
                  <button 
                    onClick={() => handleRemoveCollection(game.id, 'game')}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#1e3a50] flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> 取消收藏
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 mr-4">
              <img 
                src={game.image} 
                alt={game.title} 
                className="w-24 h-16 object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => handleViewItem(game.id, 'game')}>
                {game.title}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {game.releaseDate}
                </span>
                <span className="flex items-center gap-1">
                  <Gamepad2 className="h-4 w-4" /> {game.developer}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {game.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end justify-between ml-4">
              <div className="flex items-center">
                {game.discount > 0 && (
                  <span className="text-gray-400 text-xs line-through mr-1">¥{game.price}</span>
                )}
                <span className="text-white font-medium">¥{discountedPrice.toFixed(2)}</span>
                {game.discount > 0 && (
                  <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                    -{Math.round(game.discount * 100)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => handleViewItem(game.id, 'game')}
                  className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-full transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleRemoveCollection(game.id, 'game')}
                  className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPostItem = (post) => {
    return (
      <div key={post.id} className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
        <div className="flex justify-between">
          <div className="flex-1">
            <h3 
              className="text-lg font-medium text-white hover:text-blue-400 transition-colors cursor-pointer"
              onClick={() => handleViewItem(post.id, 'post')}
            >
              {post.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span>作者: {post.author}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {post.date}
              </span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                {post.category}
              </span>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(showDropdown === `post-${post.id}` ? null : `post-${post.id}`)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a475e] rounded-full transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            
            {showDropdown === `post-${post.id}` && (
              <div className="absolute right-0 mt-1 w-36 bg-[#2a475e] rounded-lg shadow-lg z-10 py-1 border border-gray-700">
                <button 
                  onClick={() => handleViewItem(post.id, 'post')}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#1e3a50] flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" /> 查看帖子
                </button>
                <button 
                  onClick={() => handleRemoveCollection(post.id, 'post')}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#1e3a50] flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> 取消收藏
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 标签切换 */}
      <div className="flex justify-between items-center">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'games'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            收藏游戏
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            收藏帖子
          </button>
        </div>
        
        {activeTab === 'games' && (
          <div className="flex bg-[#2a475e] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              网格视图
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              列表视图
            </button>
          </div>
        )}
      </div>

      {/* 收藏统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">收藏游戏</p>
              <p className="text-2xl font-bold text-white">{games.length}</p>
            </div>
            <Gamepad2 className="h-8 w-8 text-blue-400 opacity-70" />
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">收藏帖子</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </div>
            <Bookmark className="h-8 w-8 text-purple-400 opacity-70" />
          </div>
        </div>
      </div>

      {/* 收藏列表 */}
      {activeTab === 'games' ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {games.length > 0 ? (
            games.map(game => renderGameItem(game))
          ) : (
            <div className="text-center py-8 col-span-full">
              <p className="text-gray-400">暂无收藏游戏</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => renderPostItem(post))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">暂无收藏帖子</p>
            </div>
          )}
        </div>
      )}

      {/* 分页 */}
      <div className="flex justify-center mt-6">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white disabled:opacity-50">
            上一页
          </button>
          <button className="px-3 py-1 rounded-md bg-blue-500 text-white">1</button>
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">2</button>
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">
            下一页
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Collections; 
import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Calendar, MoreHorizontal, Trash2, Edit, ExternalLink } from 'lucide-react';

const Comments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showDropdown, setShowDropdown] = useState(null);
  
  // 模拟评论数据
  const comments = [
    {
      id: 1,
      content: '这款游戏的画面真的很惊艳，尤其是光影效果，但是优化还有待提高，我的3080在4K分辨率下帧数经常不稳定。',
      date: '2024-03-12',
      postTitle: '《赛博朋克2077》新DLC体验分享',
      postId: 101,
      likes: 24,
      dislikes: 2,
      status: 'approved'
    },
    {
      id: 2,
      content: '我推荐《只狼：影逝二度》，虽然不是开放世界，但战斗系统非常精彩，难度也很有挑战性。',
      date: '2024-03-05',
      postTitle: '求推荐类似《艾尔登法环》的游戏',
      postId: 102,
      likes: 18,
      dislikes: 0,
      status: 'approved'
    },
    {
      id: 3,
      content: '我也有类似的分类方式，不过我还会按照游戏时长来分类，方便我在不同时间段选择游戏。',
      date: '2024-02-20',
      postTitle: '我的Steam收藏夹整理分享',
      postId: 103,
      likes: 7,
      dislikes: 1,
      status: 'pending'
    },
    {
      id: 4,
      content: '《星空》应该也在这个榜单上，虽然发售时有些问题，但贝塞斯达一直在更新修复，游戏内容还是很丰富的。',
      date: '2024-02-10',
      postTitle: '2024年最值得期待的十款游戏',
      postId: 104,
      likes: 15,
      dislikes: 8,
      status: 'approved'
    },
    {
      id: 5,
      content: '这些开发者的故事真的很鼓舞人心，让我也想尝试开发一款小游戏。请问有没有推荐给新手的游戏引擎？',
      date: '2024-01-15',
      postTitle: '独立游戏开发者访谈：从零开始的游戏之旅',
      postId: 105,
      likes: 12,
      dislikes: 0,
      status: 'approved'
    }
  ];

  const filteredComments = activeTab === 'all' 
    ? comments 
    : comments.filter(comment => comment.status === activeTab);

  const handleDeleteComment = (id) => {
    // 删除评论的逻辑
    alert(`删除评论 ID: ${id}`);
    setShowDropdown(null);
  };

  const handleEditComment = (id) => {
    // 编辑评论的逻辑
    alert(`编辑评论 ID: ${id}`);
    setShowDropdown(null);
  };

  const handleViewPost = (postId) => {
    // 查看帖子的逻辑
    alert(`查看帖子 ID: ${postId}`);
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
          全部评论
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'approved'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          已通过
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'pending'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          待审核
        </button>
      </div>

      {/* 评论统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总评论数</p>
              <p className="text-2xl font-bold text-white">{comments.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-400 opacity-70" />
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">获赞总数</p>
              <p className="text-2xl font-bold text-white">
                {comments.reduce((sum, comment) => sum + comment.likes, 0)}
              </p>
            </div>
            <ThumbsUp className="h-8 w-8 text-green-400 opacity-70" />
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">被踩总数</p>
              <p className="text-2xl font-bold text-white">
                {comments.reduce((sum, comment) => sum + comment.dislikes, 0)}
              </p>
            </div>
            <ThumbsDown className="h-8 w-8 text-red-400 opacity-70" />
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 
                      className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-sm"
                      onClick={() => handleViewPost(comment.postId)}
                    >
                      回复: {comment.postTitle}
                    </h3>
                    {comment.status === 'pending' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                        待审核
                      </span>
                    )}
                  </div>
                  <p className="text-white mt-2">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {comment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" /> {comment.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4" /> {comment.dislikes}
                    </span>
                    <button
                      onClick={() => handleViewPost(comment.postId)}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="h-4 w-4" /> 查看原帖
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(showDropdown === comment.id ? null : comment.id)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-[#2a475e] rounded-full transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  
                  {showDropdown === comment.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-[#2a475e] rounded-lg shadow-lg z-10 py-1 border border-gray-700">
                      <button 
                        onClick={() => handleEditComment(comment.id)}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#1e3a50] flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" /> 编辑
                      </button>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
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
            <p className="text-gray-400">暂无评论</p>
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

export default Comments; 
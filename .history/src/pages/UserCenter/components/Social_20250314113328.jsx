import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, Search, MessageSquare, ExternalLink } from 'lucide-react';

const Social = ({ userInfo }) => {
  const [activeTab, setActiveTab] = useState('followers');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 模拟粉丝数据
  const followers = [
    {
      id: 1,
      username: 'GameMaster',
      avatar: 'https://picsum.photos/100/100?random=1',
      bio: '资深游戏玩家，喜欢RPG和FPS游戏',
      followDate: '2024-03-01',
      isFollowing: true
    },
    {
      id: 2,
      username: 'PixelArtist',
      avatar: 'https://picsum.photos/100/100?random=2',
      bio: '独立游戏开发者，专注于像素风格游戏',
      followDate: '2024-02-15',
      isFollowing: false
    },
    {
      id: 3,
      username: 'StreamerPro',
      avatar: 'https://picsum.photos/100/100?random=3',
      bio: '全职游戏主播，每天直播各类游戏',
      followDate: '2024-02-10',
      isFollowing: true
    },
    {
      id: 4,
      username: 'CasualGamer',
      avatar: 'https://picsum.photos/100/100?random=4',
      bio: '休闲玩家，喜欢独立游戏和解谜游戏',
      followDate: '2024-01-25',
      isFollowing: false
    },
    {
      id: 5,
      username: 'GameReviewer',
      avatar: 'https://picsum.photos/100/100?random=5',
      bio: '游戏评测人，专注于深度游戏分析',
      followDate: '2024-01-15',
      isFollowing: true
    }
  ];
  
  // 模拟关注数据
  const following = [
    {
      id: 6,
      username: 'GameDeveloper',
      avatar: 'https://picsum.photos/100/100?random=6',
      bio: 'AAA游戏开发者，目前在某大型游戏公司工作',
      followDate: '2024-03-05',
      isFollowing: true
    },
    {
      id: 7,
      username: 'ESportsPlayer',
      avatar: 'https://picsum.photos/100/100?random=7',
      bio: '职业电竞选手，主玩MOBA和FPS游戏',
      followDate: '2024-02-28',
      isFollowing: true
    },
    {
      id: 8,
      username: 'GameCollector',
      avatar: 'https://picsum.photos/100/100?random=8',
      bio: '游戏收藏家，拥有上千款游戏',
      followDate: '2024-02-20',
      isFollowing: true
    },
    {
      id: 9,
      username: 'ModCreator',
      avatar: 'https://picsum.photos/100/100?random=9',
      bio: '游戏模组制作者，专注于开放世界游戏的模组',
      followDate: '2024-02-05',
      isFollowing: true
    },
    {
      id: 10,
      username: 'GameWriter',
      avatar: 'https://picsum.photos/100/100?random=10',
      bio: '游戏剧情编剧，热爱讲述引人入胜的故事',
      followDate: '2024-01-10',
      isFollowing: true
    }
  ];

  const handleToggleFollow = (id, currentStatus) => {
    // 关注/取消关注的逻辑
    alert(`${currentStatus ? '取消关注' : '关注'} 用户 ID: ${id}`);
  };

  const handleSendMessage = (id) => {
    // 发送消息的逻辑
    alert(`向用户 ID: ${id} 发送消息`);
  };

  const handleViewProfile = (id) => {
    // 查看用户资料的逻辑
    alert(`查看用户 ID: ${id} 的资料`);
  };

  const filteredData = activeTab === 'followers' 
    ? followers.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    : following.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 标签切换和搜索 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'followers'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            我的粉丝 ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'following'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            我的关注 ({following.length})
          </button>
        </div>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-[#2a475e]/50 border border-gray-600 
              rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* 社交统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">粉丝数量</p>
              <p className="text-2xl font-bold text-white">{followers.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">关注数量</p>
              <p className="text-2xl font-bold text-white">{following.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((user) => (
            <div key={user.id} className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                />
                <div className="ml-4 flex-1">
                  <h3 
                    className="text-lg font-medium text-white hover:text-blue-400 transition-colors cursor-pointer"
                    onClick={() => handleViewProfile(user.id)}
                  >
                    {user.username}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-1">{user.bio}</p>
                  <p className="text-gray-500 text-xs mt-1">关注时间: {user.followDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendMessage(user.id)}
                    className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-full transition-colors"
                    title="发送消息"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleViewProfile(user.id)}
                    className="p-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-full transition-colors"
                    title="查看资料"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </button>
                  {activeTab === 'followers' ? (
                    <button
                      onClick={() => handleToggleFollow(user.id, user.isFollowing)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        user.isFollowing
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {user.isFollowing ? '已关注' : '关注'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleFollow(user.id, true)}
                      className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full transition-colors"
                      title="取消关注"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {searchTerm ? '没有找到匹配的用户' : `暂无${activeTab === 'followers' ? '粉丝' : '关注'}`}
            </p>
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
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">
            下一页
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Social; 
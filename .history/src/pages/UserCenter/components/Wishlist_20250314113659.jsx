import React, { useState } from 'react';
import { Heart, ShoppingCart, Tag, Calendar, Search, Filter, Trash2, Bell, BellOff, ExternalLink, Star } from 'lucide-react';

const Wishlist = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  
  // 模拟关注商品数据
  const wishlistItems = [
    {
      id: 1,
      title: '博德之门3',
      image: 'https://picsum.photos/300/150?random=1',
      price: 268,
      originalPrice: 268,
      discount: 0,
      releaseDate: '2023-08-03',
      tags: ['角色扮演', '回合制', '奇幻'],
      rating: 4.9,
      notifications: true,
      addedDate: '2024-02-15'
    },
    {
      id: 2,
      title: '星空',
      image: 'https://picsum.photos/300/150?random=2',
      price: 298,
      originalPrice: 398,
      discount: 0.25,
      releaseDate: '2023-09-06',
      tags: ['角色扮演', '开放世界', '科幻'],
      rating: 4.1,
      notifications: true,
      addedDate: '2024-02-10'
    },
    {
      id: 3,
      title: '黑神话：悟空',
      image: 'https://picsum.photos/300/150?random=3',
      price: 268,
      originalPrice: 268,
      discount: 0,
      releaseDate: '2024-08-20',
      tags: ['动作冒险', '中国神话', '单人'],
      rating: 0,
      notifications: true,
      addedDate: '2024-01-25',
      isPreorder: true
    },
    {
      id: 4,
      title: '地狱边境',
      image: 'https://picsum.photos/300/150?random=4',
      price: 18,
      originalPrice: 48,
      discount: 0.625,
      releaseDate: '2010-07-21',
      tags: ['解谜', '平台', '独立'],
      rating: 4.8,
      notifications: false,
      addedDate: '2024-01-15'
    },
    {
      id: 5,
      title: '霍格沃茨之遗',
      image: 'https://picsum.photos/300/150?random=5',
      price: 199,
      originalPrice: 299,
      discount: 0.33,
      releaseDate: '2023-02-10',
      tags: ['动作角色扮演', '开放世界', '奇幻'],
      rating: 4.3,
      notifications: true,
      addedDate: '2024-01-05'
    },
    {
      id: 6,
      title: '最终幻想16',
      image: 'https://picsum.photos/300/150?random=6',
      price: 298,
      originalPrice: 298,
      discount: 0,
      releaseDate: '2023-06-22',
      tags: ['角色扮演', '动作', '奇幻'],
      rating: 4.5,
      notifications: false,
      addedDate: '2023-12-20'
    }
  ];

  // 排序和过滤
  const sortedAndFilteredItems = [...wishlistItems]
    .filter(item => {
      // 按搜索词过滤
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 按价格范围过滤
      if (priceRange.min && item.price < parseFloat(priceRange.min)) return false;
      if (priceRange.max && item.price > parseFloat(priceRange.max)) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'discount':
          return b.discount - a.discount;
        case 'rating':
          return b.rating - a.rating;
        case 'date':
        default:
          return new Date(b.addedDate) - new Date(a.addedDate);
      }
    });

  const handleRemoveFromWishlist = (id) => {
    // 移除关注商品的逻辑
    alert(`从关注列表中移除商品 ID: ${id}`);
  };

  const handleToggleNotifications = (id, currentStatus) => {
    // 切换价格变动通知的逻辑
    alert(`${currentStatus ? '关闭' : '开启'}商品 ID: ${id} 的价格变动通知`);
  };

  const handleAddToCart = (id) => {
    // 添加到购物车的逻辑
    alert(`将商品 ID: ${id} 添加到购物车`);
  };

  const handleViewDetails = (id) => {
    // 查看商品详情的逻辑
    alert(`查看商品 ID: ${id} 的详情`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 关注商品统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">关注商品</p>
              <p className="text-2xl font-bold text-white">{wishlistItems.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">折扣商品</p>
              <p className="text-2xl font-bold text-white">
                {wishlistItems.filter(item => item.discount > 0).length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Tag className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总价值</p>
              <p className="text-2xl font-bold text-white">
                ¥ {wishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选和排序 */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="搜索关注商品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-[#2a475e]/50 border border-gray-600 
                  rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-[#2a475e] text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  最低价格
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                    rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="¥"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  最高价格
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                    rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="¥"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  排序方式
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                    rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="date">添加时间（最新）</option>
                  <option value="price-asc">价格（从低到高）</option>
                  <option value="price-desc">价格（从高到低）</option>
                  <option value="name">名称</option>
                  <option value="discount">折扣</option>
                  <option value="rating">评分</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 关注商品列表 */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {sortedAndFilteredItems.length > 0 ? (
          sortedAndFilteredItems.map((item) => (
            <div key={item.id} className={`relative group ${viewMode === 'grid' ? 'bg-[#1e3a50] rounded-lg overflow-hidden border border-blue-500/20 hover:border-blue-500/40 transition-colors' : 'bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors flex'}`}>
              {viewMode === 'grid' ? (
                <>
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-40 object-cover"
                    />
                    {item.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round(item.discount * 100)}%
                      </div>
                    )}
                    {item.isPreorder && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                        预购
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => handleViewDetails(item.id)}>
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {item.rating > 0 ? (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill={i < Math.floor(item.rating) ? 'currentColor' : 'none'} />
                            ))}
                            <span className="text-gray-400 text-xs ml-1">{item.rating}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">暂无评分</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        {item.discount > 0 && (
                          <span className="text-gray-400 text-xs line-through mr-1">¥{item.originalPrice}</span>
                        )}
                        <span className="text-white font-medium">¥{item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {item.releaseDate}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleNotifications(item.id, item.notifications)}
                          className={`p-1.5 rounded-full transition-colors ${
                            item.notifications 
                              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                              : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                          }`}
                          title={item.notifications ? '关闭价格通知' : '开启价格通知'}
                        >
                          {item.notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleAddToCart(item.id)}
                          className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-full transition-colors"
                          title="添加到购物车"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full transition-colors"
                          title="取消关注"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 mr-4">
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-24 h-16 object-cover rounded"
                      />
                      {item.discount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          -{Math.round(item.discount * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => handleViewDetails(item.id)}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {item.releaseDate}
                      </span>
                      {item.isPreorder && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          预购
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between ml-4">
                    <div className="flex items-center">
                      {item.discount > 0 && (
                        <span className="text-gray-400 text-xs line-through mr-1">¥{item.originalPrice}</span>
                      )}
                      <span className="text-white font-medium">¥{item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleToggleNotifications(item.id, item.notifications)}
                        className={`p-1.5 rounded-full transition-colors ${
                          item.notifications 
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                            : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                        }`}
                        title={item.notifications ? '关闭价格通知' : '开启价格通知'}
                      >
                        {item.notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-full transition-colors"
                        title="查看详情"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-full transition-colors"
                        title="添加到购物车"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full transition-colors"
                        title="取消关注"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 col-span-full">
            <p className="text-gray-400">暂无关注商品</p>
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

export default Wishlist; 
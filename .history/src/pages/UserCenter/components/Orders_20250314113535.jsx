import React, { useState } from 'react';
import { ShoppingBag, Calendar, Tag, Search, Filter, Download, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // 模拟订单数据
  const orders = [
    {
      id: 'ORD-2024-0001',
      date: '2024-03-10',
      total: 199.5,
      status: 'completed',
      paymentMethod: '支付宝',
      items: [
        {
          id: 1,
          name: '赛博朋克2077',
          price: 199,
          discount: 0.5,
          image: 'https://picsum.photos/100/50?random=1',
          type: 'game'
        }
      ]
    },
    {
      id: 'ORD-2024-0002',
      date: '2024-02-25',
      total: 298,
      status: 'completed',
      paymentMethod: '微信支付',
      items: [
        {
          id: 2,
          name: '艾尔登法环',
          price: 298,
          discount: 0,
          image: 'https://picsum.photos/100/50?random=2',
          type: 'game'
        }
      ]
    },
    {
      id: 'ORD-2024-0003',
      date: '2024-02-15',
      total: 50,
      status: 'completed',
      paymentMethod: '余额支付',
      items: [
        {
          id: 3,
          name: '游戏内道具包',
          price: 50,
          discount: 0,
          image: 'https://picsum.photos/100/50?random=3',
          type: 'dlc'
        }
      ]
    },
    {
      id: 'ORD-2024-0004',
      date: '2024-02-05',
      total: 45,
      status: 'completed',
      paymentMethod: '银联',
      items: [
        {
          id: 4,
          name: '传送门2',
          price: 45,
          discount: 0,
          image: 'https://picsum.photos/100/50?random=4',
          type: 'game'
        }
      ]
    },
    {
      id: 'ORD-2024-0005',
      date: '2024-01-20',
      total: 327,
      status: 'completed',
      paymentMethod: '支付宝',
      items: [
        {
          id: 5,
          name: '博德之门3',
          price: 268,
          discount: 0,
          image: 'https://picsum.photos/100/50?random=5',
          type: 'game'
        },
        {
          id: 6,
          name: '季票',
          price: 59,
          discount: 0,
          image: 'https://picsum.photos/100/50?random=6',
          type: 'dlc'
        }
      ]
    },
    {
      id: 'ORD-2024-0006',
      date: '2024-01-10',
      total: 60,
      status: 'refunded',
      paymentMethod: '微信支付',
      items: [
        {
          id: 7,
          name: '死亡搁浅',
          price: 60,
          discount: 0,
          image: 'https://picsum.photos/100/50?random=7',
          type: 'game'
        }
      ]
    }
  ];

  // 过滤订单
  const filteredOrders = orders
    .filter(order => {
      // 按状态过滤
      if (activeTab === 'completed' && order.status !== 'completed') return false;
      if (activeTab === 'refunded' && order.status !== 'refunded') return false;
      
      // 按搜索词过滤
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(searchLower);
        const matchesItems = order.items.some(item => item.name.toLowerCase().includes(searchLower));
        if (!matchesId && !matchesItems) return false;
      }
      
      // 按日期范围过滤
      if (dateRange.start && new Date(order.date) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(order.date) > new Date(dateRange.end)) return false;
      
      return true;
    });

  const handleExportOrders = () => {
    // 导出订单记录逻辑
    alert('导出订单记录');
  };

  const handleViewOrderDetails = (orderId) => {
    // 查看订单详情逻辑
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">已完成</span>;
      case 'refunded':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">已退款</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">未知</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 订单统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总订单数</p>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总消费</p>
              <p className="text-2xl font-bold text-white">
                ¥ {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
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
              <p className="text-gray-400 text-sm">购买游戏</p>
              <p className="text-2xl font-bold text-white">
                {orders.reduce((sum, order) => sum + order.items.filter(item => item.type === 'game').length, 0)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 订单筛选 */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              全部订单
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              已完成
            </button>
            <button
              onClick={() => setActiveTab('refunded')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'refunded'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              已退款
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="搜索订单..."
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
            <button
              onClick={handleExportOrders}
              className="p-2 bg-[#2a475e] text-gray-300 hover:text-white rounded-lg transition-colors"
              title="导出订单"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                开始日期
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                  rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                结束日期
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                  rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 订单列表 */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#1e3a50] rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors overflow-hidden">
              <div 
                className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
                onClick={() => handleViewOrderDetails(order.id)}
              >
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-lg font-medium text-white">{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {order.date}
                    </span>
                    <span>支付方式: {order.paymentMethod}</span>
                    <span>商品数量: {order.items.length}</span>
                  </div>
                </div>
                <div className="flex items-center mt-3 md:mt-0">
                  <div className="text-lg font-bold text-white mr-4">
                    ¥ {order.total.toFixed(2)}
                  </div>
                  {expandedOrder === order.id ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
              
              {expandedOrder === order.id && (
                <div className="border-t border-gray-700 p-4 bg-[#1b2838]/50">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">订单详情</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-10 object-cover rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <h5 className="text-white font-medium">{item.name}</h5>
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                              {item.type === 'game' ? '游戏' : 'DLC'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <span className="text-gray-400">单价: ¥{item.price.toFixed(2)}</span>
                            {item.discount > 0 && (
                              <span className="text-green-400">-{Math.round(item.discount * 100)}%</span>
                            )}
                          </div>
                        </div>
                        <button
                          className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-full transition-colors"
                          title="查看详情"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between">
                    <div>
                      <span className="text-gray-400 text-sm">订单编号: {order.id}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">总计</div>
                      <div className="text-lg font-bold text-white">¥ {order.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">暂无订单记录</p>
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
          <button className="px-3 py-1 rounded-md bg-[#2a475e] text-gray-400 hover:text-white">
            下一页
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Orders; 
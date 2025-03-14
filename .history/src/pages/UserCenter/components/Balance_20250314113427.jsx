import React, { useState } from 'react';
import { Wallet, CreditCard, Calendar, ArrowUpRight, ArrowDownLeft, Filter, Download, Search } from 'lucide-react';

const Balance = ({ userInfo }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // 模拟交易数据
  const transactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 200,
      date: '2024-03-10',
      method: '支付宝',
      status: 'completed',
      description: '账户充值'
    },
    {
      id: 2,
      type: 'purchase',
      amount: -120,
      date: '2024-03-08',
      method: '余额支付',
      status: 'completed',
      description: '购买游戏《赛博朋克2077》'
    },
    {
      id: 3,
      type: 'refund',
      amount: 60,
      date: '2024-03-05',
      method: '退款至余额',
      status: 'completed',
      description: '退款《死亡搁浅》'
    },
    {
      id: 4,
      type: 'deposit',
      amount: 500,
      date: '2024-02-25',
      method: '微信支付',
      status: 'completed',
      description: '账户充值'
    },
    {
      id: 5,
      type: 'purchase',
      amount: -298,
      date: '2024-02-20',
      method: '余额支付',
      status: 'completed',
      description: '购买游戏《艾尔登法环》'
    },
    {
      id: 6,
      type: 'purchase',
      amount: -50,
      date: '2024-02-15',
      method: '余额支付',
      status: 'completed',
      description: '购买游戏内道具'
    },
    {
      id: 7,
      type: 'deposit',
      amount: 100,
      date: '2024-02-10',
      method: '银联',
      status: 'completed',
      description: '账户充值'
    },
    {
      id: 8,
      type: 'purchase',
      amount: -45,
      date: '2024-02-05',
      method: '余额支付',
      status: 'completed',
      description: '购买游戏《传送门2》'
    }
  ];

  // 过滤交易记录
  const filteredTransactions = transactions
    .filter(transaction => {
      // 按类型过滤
      if (activeTab === 'deposit' && transaction.type !== 'deposit') return false;
      if (activeTab === 'purchase' && transaction.type !== 'purchase') return false;
      if (activeTab === 'refund' && transaction.type !== 'refund') return false;
      
      // 按搜索词过滤
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // 按日期范围过滤
      if (dateRange.start && new Date(transaction.date) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(transaction.date) > new Date(dateRange.end)) return false;
      
      return true;
    });

  // 计算总收入和支出
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleRecharge = () => {
    // 充值逻辑
    alert('打开充值窗口');
  };

  const handleExportTransactions = () => {
    // 导出交易记录逻辑
    alert('导出交易记录');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-5 w-5 text-green-400" />;
      case 'purchase':
        return <ArrowUpRight className="h-5 w-5 text-red-400" />;
      case 'refund':
        return <ArrowDownLeft className="h-5 w-5 text-blue-400" />;
      default:
        return <ArrowDownLeft className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'text-green-400';
      case 'purchase':
        return 'text-red-400';
      case 'refund':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'deposit':
        return '充值';
      case 'purchase':
        return '购买';
      case 'refund':
        return '退款';
      default:
        return '其他';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 余额卡片 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 text-sm">当前余额</p>
            <h2 className="text-3xl font-bold text-white mt-1">¥ {userInfo?.balance.toFixed(2) || '0.00'}</h2>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleRecharge}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                充值
              </button>
              <button
                onClick={handleExportTransactions}
                className="px-4 py-2 bg-blue-500/30 text-white rounded-lg font-medium hover:bg-blue-500/40 transition-colors flex items-center gap-1"
              >
                <Download className="h-4 w-4" /> 导出记录
              </button>
            </div>
          </div>
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* 收支统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总收入</p>
              <p className="text-2xl font-bold text-green-400">¥ {totalIncome.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <ArrowDownLeft className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总支出</p>
              <p className="text-2xl font-bold text-red-400">¥ {totalExpense.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 交易记录筛选 */}
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
              全部记录
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'deposit'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              充值记录
            </button>
            <button
              onClick={() => setActiveTab('purchase')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'purchase'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              消费记录
            </button>
            <button
              onClick={() => setActiveTab('refund')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'refund'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              退款记录
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="搜索交易..."
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

      {/* 交易记录列表 */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-[#1e3a50] rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#2a475e] flex items-center justify-center mr-4">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-white font-medium">{transaction.description}</h3>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                      transaction.type === 'purchase' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {getTransactionLabel(transaction.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {transaction.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> {transaction.method}
                    </span>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">暂无交易记录</p>
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

export default Balance; 
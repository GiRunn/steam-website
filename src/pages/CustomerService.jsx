// CustomerService.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import enLocale from '../locales/en';//页脚
import zhLocale from '../locales/zh';//页脚
import Footer from '../components/Footer';//页脚
import en from '../locales/en';//页脚
import zh from '../locales/zh';//页脚


import {
    Search,
    MessageCircle,
    HelpCircle,
    AlertCircle,
    FileText,
    CheckCircle,
    Clock,
    ChevronDown,
    
    Mail,
    Phone,
    MessageSquare,
    Send,
    Plus,
    
    User,
    Lock,


    CreditCard,
    Gift,
    Download,
    X,  // 添加这行
    Upload  // 添加这行
  } from 'lucide-react';

// 常见问题分类
const FAQ_CATEGORIES = [
  { id: 'account', name: '账号相关', icon: User, color: 'blue' },
  { id: 'security', name: '安全设置', icon: Lock, color: 'green' },
  { id: 'payment', name: '支付问题', icon: CreditCard, color: 'purple' },
  { id: 'game', name: '游戏相关', icon: Gift, color: 'yellow' },
  { id: 'download', name: '下载问题', icon: Download, color: 'orange' },
  { id: 'other', name: '其他问题', icon: HelpCircle, color: 'gray' }
];

// 常见问题数据
const FAQ_DATA = {
  account: [
    {
      id: 1,
      question: '如何修改账号密码？',
      answer: '您可以在账号设置中点击"修改密码"，按照提示完成密码修改。为了账号安全，建议定期更换密码。',
      views: 1234,
      helpful: 456
    },
    // ... 更多问题
  ],
  // ... 其他分类的问题
};


// 工单状态数据
const TICKET_STATUS = {
  total: 12500,
  processing: 234,
  resolved: 12266,
  satisfaction: 98.5,
  avgResponseTime: '2小时15分钟'
};

const CustomerService = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('account');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false); //页脚
  const [showVideo, setShowVideo] = useState(false); //页脚
  //页脚
  const translations = {
    en: en,
    zh: zh,
  };
    // 获取当前语言包/页脚
  const t = locale === 'zh' ? zhLocale : enLocale;

  const [showCreateTicket, setShowCreateTicket] = useState(false);

  return (
    <div className="min-h-screen bg-[#1b2838] text-white">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      <main className="container mx-auto px-4 py-8">
        {/* 头部搜索区域 */}
        <div className="mb-12">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#1e2837] to-[#253447] rounded-2xl p-8">
            {/* 背景装饰 */}
            <div className="absolute inset-0">
              {/* 使用 CSS 渐变替代背景图 */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
                  backgroundSize: '20px 20px'
                }}
              />
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <div className="max-w-2xl mx-auto text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4"
                >
                  有什么可以帮您？
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-lg"
                >
                  搜索您需要的帮助，或浏览下方的常见问题
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto relative"
              >
                <input
                  type="text"
                  placeholder="搜索问题..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-14 pl-14 pr-4 bg-gradient-to-r from-[#253447] to-[#2a3b4d] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* 服务统计 */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {[
            { label: '总服务工单', value: TICKET_STATUS.total, icon: FileText, color: 'blue' },
            { label: '处理中', value: TICKET_STATUS.processing, icon: Clock, color: 'yellow' },
            { label: '已解决', value: TICKET_STATUS.resolved, icon: CheckCircle, color: 'green' },
            { label: '满意度', value: `${TICKET_STATUS.satisfaction}%`, icon: MessageCircle, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1e2837] rounded-xl p-6 hover:bg-[#253447] transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* FAQ和工单区域 */}
        <div className="grid grid-cols-3 gap-8">
          {/* FAQ区域 */}
          <div className="col-span-2 space-y-6">
            <div className="bg-[#1e2837] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">常见问题</h2>
              
              {/* FAQ分类 */}
              <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-6">
                {FAQ_CATEGORIES.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                      ${currentCategory === category.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* FAQ列表 */}
              <div className="space-y-4">
                {FAQ_DATA[currentCategory]?.map((faq) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#253447] rounded-xl p-4 hover:bg-[#2a3b4d] transition-colors cursor-pointer"
                  >
                    <div
                      className="flex items-start justify-between gap-4"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-2">{faq.question}</h3>
                        <AnimatePresence>
                          {expandedFAQ === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-gray-400 text-sm"
                            >
                              {faq.answer}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                          expandedFAQ === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* 工单和联系方式 */}
          <div className="space-y-6">
            {/* 创建工单 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white cursor-pointer"
              onClick={() => setShowCreateTicket(true)}
            >
              <h3 className="text-lg font-bold mb-2">需要更多帮助？</h3>
              <p className="text-white/80 mb-4">创建工单获取专业客服支持</p>
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-4 py-2">
                <Plus className="w-5 h-5" />
                <span>创建工单</span>
              </button>
            </motion.div>

            {/* 联系方式 */}
            <div className="bg-[#1e2837] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">联系我们</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white">在线客服</div>
                    <div className="text-sm text-gray-400">7x24小时</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
         {/* 页脚 */}
          <div className={darkMode ? 'dark' : ''}>
            <Footer
              darkMode={darkMode}
              t={locale === 'zh' ? zhLocale : enLocale}  // 确保正确传递翻译对象
              showVideo={showVideo}
              setShowVideo={setShowVideo}
              showScrollTop={showScrollTop}
            />
          </div>
      </main>

      {/* 创建工单弹窗 */}
      <AnimatePresence>
        {showCreateTicket && (
          <CreateTicketDialog onClose={() => setShowCreateTicket(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// 创建工单弹窗组件
const CreateTicketDialog = ({ onClose }) => {
  const [type, setType] = useState('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: 实现工单提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1e2837] rounded-2xl w-full max-w-2xl m-4 overflow-hidden shadow-2xl"
      >
        {/* 弹窗头部 */}
        <div className="relative bg-gradient-to-r from-[#253447] to-[#2a3b4d] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">创建工单</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* 工单表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 工单类型 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">工单类型</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'question', name: '问题咨询', icon: HelpCircle },
                { id: 'feedback', name: '意见反馈', icon: MessageCircle },
                { id: 'complaint', name: '投诉建议', icon: AlertCircle },
                { id: 'other', name: '其他', icon: FileText }
              ].map(item => (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setType(item.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                    type === item.id
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 标题输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">工单标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请简要描述您的问题..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 内容输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">详细描述</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请详细描述您遇到的问题..."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* 附件上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">上传附件 (可选)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-medium">点击上传</span> 或拖拽文件至此处
                  </p>
                  <p className="text-xs text-gray-500">
                    支持 PNG, JPG, PDF 格式文件
                  </p>
                </div>
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>

          {/* 紧急程度 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">紧急程度</label>
            <div className="flex items-center gap-4">
              {['low', 'medium', 'high'].map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    className="form-radio text-blue-500 focus:ring-blue-500 bg-white/5 border-white/10"
                  />
                  <span className="text-gray-400">
                    {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
            >
              取消
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg
                ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-blue-500/25'}`}
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? '提交中...' : '提交工单'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CustomerService;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Layers, 
  Info,
  Settings,
  Globe
} from 'lucide-react';

// 配置数据
const requirements = {
  minimum: [
    { icon: Monitor, label: '操作系统', value: 'Windows 10 64-bit' },
    { icon: Cpu, label: '处理器', value: 'Intel Core i5-8400 / AMD Ryzen 5 2600' },
    { icon: Layers, label: '内存', value: '12 GB RAM' },
    { icon: Monitor, label: '显卡', value: 'NVIDIA GTX 1060 6GB / AMD RX 580' },
    { icon: HardDrive, label: '存储空间', value: '100 GB可用空间' }
  ],
  recommended: [
    { icon: Monitor, label: '操作系统', value: 'Windows 10/11 64-bit' },
    { icon: Cpu, label: '处理器', value: 'Intel Core i7-10700K / AMD Ryzen 7 5800X' },
    { icon: Layers, label: '内存', value: '16 GB RAM' },
    { icon: Monitor, label: '显卡', value: 'NVIDIA RTX 3070 / AMD RX 6800 XT' },
    { icon: HardDrive, label: '存储空间', value: '100 GB SSD' }
  ]
};

// 标题组件
const SectionTitle = ({ children }) => (
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-3xl font-bold text-white"
  >
    {children}
  </motion.h2>
);

// 配置切换标签组件
const ConfigTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'minimum', label: '最低配置' },
    { id: 'recommended', label: '推荐配置' }
  ];

  return (
    <div className="flex gap-4">
      {tabs.map((tab) => (
        <TabButton 
          key={tab.id}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
          label={tab.label}
        />
      ))}
    </div>
  );
};

// 单个标签按钮组件
const TabButton = ({ isActive, onClick, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative px-6 py-3 rounded-xl font-medium text-lg
      overflow-hidden group ${
        isActive
          ? 'text-white'
          : 'text-gray-400 hover:text-white'
      }`}
  >
    <div className={`absolute inset-0 rounded-xl transition-colors
      ${isActive 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
        : 'bg-white/5 group-hover:bg-white/10'}`} 
    />
    <span className="relative">{label}</span>
  </motion.button>
);

// 单个配置项组件
const RequirementItem = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ delay: index * 0.1 }}
    className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors
      group relative overflow-hidden"
  >
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/20 
          to-purple-600/20 group-hover:from-blue-600/30 
          group-hover:to-purple-600/30 transition-colors">
          <item.icon className="w-6 h-6 text-blue-400 
            group-hover:text-blue-300 transition-colors" />
        </div>
        <div className="text-gray-400">{item.label}</div>
      </div>
      <div className="text-white font-medium pl-16">{item.value}</div>
    </div>

    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 
      to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

// 配置列表组件
const RequirementsList = ({ activeTab }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <AnimatePresence mode="wait">
      {requirements[activeTab].map((item, index) => (
        <RequirementItem key={item.label} item={item} index={index} />
      ))}
    </AnimatePresence>
  </div>
);

// 额外信息项组件
const InfoItem = ({ icon: Icon, title, content }) => (
  <div className="flex items-start gap-4">
    <Icon className="w-6 h-6 text-blue-400 flex-shrink-0" />
    <div>
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <p className="text-gray-400">{content}</p>
    </div>
  </div>
);

// 额外信息组件
const AdditionalInfo = () => {
  const infoItems = [
    {
      icon: Settings,
      title: "图形设置",
      content: "支持NVIDIA DLSS和AMD FSR技术，可实现更高帧率和更好的画质。游戏内置丰富的图形选项，可根据配置自定义最佳效果。"
    },
    {
      icon: Globe,
      title: "网络要求",
      content: "需要稳定的网络连接用于在线多人游戏和云存档同步。建议网速不低于10Mbps以获得最佳游戏体验。"
    },
    {
      icon: Info,
      title: "其他说明",
      content: "游戏支持键盘鼠标和手柄操作。为获得最佳体验，建议使用SSD存储设备。游戏持续更新中，配置需求可能随版本更新而调整。"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-xl bg-white/5 space-y-6"
    >
      {infoItems.map((item) => (
        <InfoItem 
          key={item.title}
          icon={item.icon}
          title={item.title}
          content={item.content}
        />
      ))}
    </motion.div>
  );
};

// 主组件
const Requirements = () => {
  const [activeTab, setActiveTab] = useState('minimum');

  return (
    <section className="space-y-8">
      <SectionTitle>系统需求</SectionTitle>
      <ConfigTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <RequirementsList activeTab={activeTab} />
      <AdditionalInfo />
    </section>
  );
};

export default Requirements;
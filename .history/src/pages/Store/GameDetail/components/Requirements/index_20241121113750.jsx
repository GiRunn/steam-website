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

// 模拟配置数据
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

const Requirements = () => {
  const [activeTab, setActiveTab] = useState('minimum');

  return (
    <section className="space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-white"
      >
        系统需求
      </motion.h2>

      {/* 配置切换 */}
      <div className="flex gap-4">
        {[
          { id: 'minimum', label: '最低配置' },
          { id: 'recommended', label: '推荐配置' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 rounded-xl font-medium text-lg
              overflow-hidden group ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
          >
            {/* 背景效果 */}
            <div className={`absolute inset-0 rounded-xl transition-colors
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-white/5 group-hover:bg-white/10'}`} 
            />
            <span className="relative">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* 配置详情 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {requirements[activeTab].map((item, index) => (
            <motion.div
              key={item.label}
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

              {/* 背景动画 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 
                to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 额外信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-xl bg-white/5 space-y-6"
      >
        <div className="flex items-start gap-4">
          <Settings className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-white font-medium mb-2">图形设置</h3>
            <p className="text-gray-400">
              支持NVIDIA DLSS和AMD FSR技术，可实现更高帧率和更好的画质。
              游戏内置丰富的图形选项，可根据配置自定义最佳效果。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Globe className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-white font-medium mb-2">网络要求</h3>
            <p className="text-gray-400">
              需要稳定的网络连接用于在线多人游戏和云存档同步。
              建议网速不低于10Mbps以获得最佳游戏体验。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-white font-medium mb-2">其他说明</h3>
            <p className="text-gray-400">
              游戏支持键盘鼠标和手柄操作。为获得最佳体验，建议使用SSD存储设备。
              游戏持续更新中，配置需求可能随版本更新而调整。
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Requirements;
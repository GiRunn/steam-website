import React from 'react';
import { motion } from 'framer-motion';

const VideoHeader = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 mb-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          使用指导视频
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-white/80 max-w-2xl"
        >
          通过专业视频教程，轻松了解游戏商城的各项功能和使用技巧
        </motion.p>
      </div>
    </div>
  );
};

export default VideoHeader;
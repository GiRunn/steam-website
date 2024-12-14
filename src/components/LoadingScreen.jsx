// components/LoadingScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad } from 'lucide-react';


const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center">
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />
        {/* 动态光效 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Logo动画 */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8
        }}
        className="relative flex flex-col items-center"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <div className="relative">
            {/* Logo背景光效 */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
            />
            {/* Logo图标 */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 
                rounded-2xl p-5 shadow-xl"
            >
              <Gamepad className="w-full h-full text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* 文字标题 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.5
          }}
          className="text-4xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-blue-400 to-purple-400 mb-8"
        >
          GAME STORE
        </motion.h1>

        {/* 加载动画 */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                y: [-10, 0, -10],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          ))}
        </div>

        {/* 加载文字 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-gray-400"
        >
          正在加载精彩内容...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
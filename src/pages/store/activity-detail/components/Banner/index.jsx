// src/pages/store/activity-detail/components/Banner/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

const Banner = ({ data }) => {
  // 添加数据检查和日志
  console.log('Banner data:', data);
  
  if (!data) {
    console.log('No banner data provided');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mb-8" // 移除 styles.banner 改用直接的 Tailwind 类
    >
      <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
        <motion.img
          src={data.imageUrl}
          alt={data.title}
          className="w-full h-full object-cover"
          loading="lazy"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-transparent to-transparent opacity-90">
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-4 text-white"
            >
              {data.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300"
            >
              {data.subtitle}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Banner;
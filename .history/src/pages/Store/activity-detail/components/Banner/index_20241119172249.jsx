// src/pages/store/activity-detail/components/Banner/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

const Banner = ({ data }) => {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={styles.banner}
    >
      <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
        <img
          src={data.imageUrl}
          alt={data.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] to-transparent">
          <div className="absolute bottom-0 left-0 p-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-4"
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
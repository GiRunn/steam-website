// src/pages/store/activity-detail/components/RelatedActivities/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

const RelatedActivities = ({ data }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold mb-6">相关活动</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={styles.activityCard}
          >
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              <img
                src={activity.imageUrl}
                alt={activity.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                {activity.title}
              </h3>
              <p className="text-gray-400">{activity.date}</p>
              
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                查看详情
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default RelatedActivities;
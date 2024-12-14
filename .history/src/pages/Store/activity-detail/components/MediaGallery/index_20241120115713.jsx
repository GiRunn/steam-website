// src/pages/store/activity-detail/components/MediaGallery/index.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Gift, Ticket, LayoutGrid } from 'lucide-react';
import styles from './styles.module.css';

const MediaGallery = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('promotion'); // 'promotion' | 'products' | 'coupons'

  const tabs = [
    {
      id: 'promotion',
      label: '活动宣传',
      icon: <LayoutGrid className="w-4 h-4" />
    },
    {
      id: 'products',
      label: '参与商品',
      icon: <Gift className="w-4 h-4" />
    },
    {
      id: 'coupons',
      label: '优惠券',
      icon: <Ticket className="w-4 h-4" />
    }
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // 根据不同类型显示不同的内容描述
  const getOverlayContent = (item, type) => {
    switch(type) {
      case 'promotion':
        return (
          <>
            <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
            <p className="text-sm opacity-80">{item.description}</p>
          </>
        );
      case 'products':
        return (
          <>
            <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-yellow-400">¥{item.price}</p>
            <p className="text-sm opacity-80">优惠价: ¥{item.discountPrice}</p>
          </>
        );
      case 'coupons':
        return (
          <>
            <div className="text-xl font-bold text-yellow-400 mb-1">{item.value}</div>
            <p className="text-sm opacity-80">{item.conditions}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={styles.container}
    >
      <h2 className={styles.title}>活动详情</h2>

      {/* 标签切换 */}
      <div className={styles.tabContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 内容展示区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.gridContainer}
        >
          {data[activeTab]?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={styles.card}
              onClick={() => handleImageClick(item)}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={styles.image}
                  loading="lazy"
                />
                <div className={styles.overlay}>
                  {getOverlayContent(item, activeTab)}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modal}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className={styles.modalImage}
              />
              <div className={styles.modalInfo}>
                {getOverlayContent(selectedImage, activeTab)}
              </div>
              <button
                className={styles.closeButton}
                onClick={closeModal}
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default MediaGallery;
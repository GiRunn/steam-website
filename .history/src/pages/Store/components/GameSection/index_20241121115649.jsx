// src/pages/store/components/GameSection/index.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star, Tag, Calendar, Clock } from 'lucide-react';
import { getGameActivityInfo } from '../../activity-detail/utils/constants';
import './styles.css';

// 活动标签组件
const ActivityBadge = ({ activity }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      className="activity-badge-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`activity-badge ${activity.badge.color}`}
      >
        <Tag className="w-3 h-3 mr-1" />
        <span>{activity.badge.text}</span>
      </motion.div>
      
      {/* 活动详情提示框 */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="activity-tooltip"
          >
            <h4 className="tooltip-title">{activity.name}</h4>
            <div className="tooltip-info">
              <div className="tooltip-row">
                <Calendar className="w-3 h-3" />
                <span>{new Date(activity.startTime).toLocaleDateString()} - {new Date(activity.endTime).toLocaleDateString()}</span>
              </div>
              <div className="tooltip-row">
                <Clock className="w-3 h-3" />
                <span>剩余 {Math.max(0, Math.floor((new Date(activity.endTime) - new Date()) / (1000 * 60 * 60 * 24)))} 天</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const GameCard = ({ game, index }) => {
  // 获取游戏当前参与的活动
  const activeActivities = getGameActivityInfo(game.id);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link 
      to={`/store/game/${game.id}`}
      className="game-card-link"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="game-card group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 游戏封面 */}
        <div className="card-image-container">
          <motion.img
            src={game.image}
            alt={game.title}
            className="card-image"
            animate={{
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* 折扣标签 */}
          {game.discount > 0 && (
            <motion.div 
              className="discount-badge"
              animate={{
                scale: isHovered ? 1.1 : 1
              }}
            >
              -{game.discount}%
            </motion.div>
          )}
          
          {/* 活动标签 */}
          {activeActivities.length > 0 && (
            <div className="activity-badges">
              {activeActivities.map((activity, idx) => (
                <ActivityBadge 
                  key={`${game.id}-activity-${idx}`}
                  activity={activity}
                />
              ))}
            </div>
          )}
          
          {/* 悬停遮罩 */}
          <motion.div 
            className="image-overlay"
            animate={{
              opacity: isHovered ? 1 : 0
            }}
          />
        </div>

        {/* 游戏信息 */}
        <div className="card-content">
          <div className="card-header">
            <h3 className="game-title">
              {game.title}
              {game.type === 'dlc' && (
                <span className="dlc-badge">DLC</span>
              )}
            </h3>
            {game.rating > 0 && (
              <div className="rating">
                <Star className="star-icon" />
                <span>{game.rating}</span>
              </div>
            )}
          </div>

          {/* 标签 */}
          <div className="tags-container">
            {game.tags.map((tag, tagIndex) => (
              <motion.span 
                key={tagIndex} 
                className="tag"
                whileHover={{ scale: 1.05 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* 价格和操作 */}
          <div className="card-footer">
            <div className="price-container">
              {game.discount > 0 ? (
                <>
                  <span className="original-price">
                    ¥{game.originalPrice}
                  </span>
                  <motion.span 
                    className="discounted-price"
                    animate={{
                      scale: isHovered ? 1.05 : 1
                    }}
                  >
                    ¥{game.price}
                  </motion.span>
                </>
              ) : (
                <span className="regular-price">
                  ¥{game.price}
                </span>
              )}
            </div>

            <div className="actions">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="wishlist-btn"
                onClick={(e) => {
                  e.preventDefault();
                  // 收藏逻辑
                }}
              >
                <Heart className="heart-icon" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="buy-btn"
                onClick={(e) => {
                  e.preventDefault();
                  // 购买逻辑
                }}
              >
                {game.type === 'dlc' ? '预购' : '购买'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const GameSection = ({ games, currentPage, itemsPerPage }) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleGames = games.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="game-section">
      <AnimatePresence mode="wait">
        <div className="games-grid">
          {visibleGames.map((game, index) => (
            <GameCard 
              key={game.id} 
              game={game} 
              index={index} 
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default GameSection;
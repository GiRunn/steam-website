import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import './styles.css';

const VideoSection = ({ videoList, setShowVideo }) => {
  const [displayCount, setDisplayCount] = useState(4);
  
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 4, videoList.length));
  };

  return (
    <section className="video-section">
      <div className="section-header">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent 
          bg-gradient-to-r from-blue-400 to-purple-400">精彩视频</h2>
        <Link to="/videos" className="view-all-link group">
          查看全部
          <ArrowRight className="arrow-icon group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="videos-grid">
        {videoList.slice(0, displayCount).map((video, index) => (
          <motion.div 
            key={video.id}
            className="video-card group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.15 }}
            onClick={() => setShowVideo(true)}
          >
            <div className="video-thumbnail">
              <img 
                src={video.thumbnail}
                alt={video.title}
                className="thumbnail-image group-hover:scale-110"
              />
              
              <div className="play-overlay group-hover:opacity-100">
                <Play className="play-icon group-hover:scale-110" />
              </div>

              <div className="hover-effect group-hover:translate-x-[200%]" />
            </div>

            <div className="video-info">
              <h3 className="video-title group-hover:text-steam-blue">{video.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {displayCount < videoList.length && (
        <div className="load-more">
          <button
            onClick={loadMore}
            className="load-more-button"
          >
            加载更多
          </button>
        </div>
      )}
    </section>
  );
};

VideoSection.propTypes = {
  videoList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
      videoUrl: PropTypes.string.isRequired
    })
  ).isRequired,
  setShowVideo: PropTypes.func.isRequired
};

export default VideoSection;
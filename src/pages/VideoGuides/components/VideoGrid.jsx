// E:\Steam\steam-website\src\pages\VideoGuides\components\VideoGrid.jsx
// 用途：视频列表的网格布局组件，负责展示视频卡片列表

import React from 'react';
import VideoCard from './VideoCard';
import { VIEW_MODES } from '../constants';

const VideoGrid = ({ 
  videos, 
  viewMode, 
  playingVideo, 
  onPlayVideo 
}) => {
  return (
    <div className={`grid ${
      viewMode === VIEW_MODES.GRID 
        ? 'grid-cols-1 lg:grid-cols-2 gap-8'
        : 'grid-cols-1 gap-6'
    }`}>
      {videos.map((video) => (
        <VideoCard 
          key={video.id}
          video={video}
          viewMode={viewMode}
          onPlay={() => onPlayVideo(video.id)}
          isPlaying={playingVideo === video.id}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
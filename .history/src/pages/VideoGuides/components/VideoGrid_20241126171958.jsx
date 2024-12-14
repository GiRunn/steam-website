import React from 'react';
import VideoCard from './VideoCard';

const VideoGrid = ({ videos, viewMode, playingVideo, setPlayingVideo }) => {
  return (
    <div
      className={`grid ${
        viewMode === 'grid'
          ? 'grid-cols-1 lg:grid-cols-2 gap-8'
          : 'grid-cols-1 gap-6'
      }`}
    >
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          viewMode={viewMode}
          onPlay={() => setPlayingVideo(video.id)}
          isPlaying={playingVideo === video.id}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
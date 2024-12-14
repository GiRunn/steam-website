import React from 'react';
import { Video } from 'lucide-react';

interface Tutorial {
  title: string;
  duration: string;
}

interface VideoTutorialsProps {
  tutorials: Tutorial[];
  onTutorialClick?: (tutorial: Tutorial) => void;
}

const VideoTutorials: React.FC<VideoTutorialsProps> = ({ tutorials, onTutorialClick }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 mb-4">
    <div className="flex items-center space-x-2 mb-3">
      <Video className="w-4 h-4 text-blue-400" />
      <h3 className="text-sm font-medium text-gray-300">视频教程</h3>
    </div>
    <div className="space-y-3">
      {tutorials.map((tutorial, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-lg cursor-pointer"
          onClick={() => onTutorialClick?.(tutorial)}
        >
          <img
            src={`/api/placeholder/320/180`}
            alt={tutorial.title}
            className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-end justify-between">
            <span className="text-xs text-white group-hover:text-blue-400 transition-colors">
              {tutorial.title}
            </span>
            <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
              {tutorial.duration}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default VideoTutorials;
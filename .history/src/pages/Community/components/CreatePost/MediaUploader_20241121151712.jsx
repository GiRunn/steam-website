// src/pages/Community/components/CreatePost/MediaUploader.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, FileVideo, X } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

const MediaUploader = ({ mediaFiles, setMediaFiles }) => {
  const handleFileUpload = (type) => {
    // 实际项目中这里会处理文件上传
    console.log('Upload file of type:', type);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Tooltip content="支持jpg、png格式">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFileUpload('image')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>上传图片</span>
          </motion.button>
        </Tooltip>
        
        <Tooltip content="支持mp4格式">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFileUpload('video')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
          >
            <FileVideo className="w-5 h-5" />  
            <span>上传视频</span>
          </motion.button>
        </Tooltip>
      </div>

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {mediaFiles.map((file, index) => (
            <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
              <img src={file.preview} alt="" className="w-full h-full object-cover" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setMediaFiles(mediaFiles.filter((_, i) => i !== index));
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
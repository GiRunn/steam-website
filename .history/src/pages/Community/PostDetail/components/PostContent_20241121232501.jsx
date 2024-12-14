// src/pages/Community/PostDetail/components/PostContent.jsx
// 帖子内容展示组件 - 负责展示帖子的标题、内容、媒体和标签等信息
import React, { useState } from 'react';
import { motion } from 'framer-motion'; // 需要在前端添加依赖: framer-motion
import { Image } from '@/components/ui/image'; // 假设使用了shadcn/ui的组件
import { Tooltip } from '../../../../components/ui/Tooltip';
// 媒体内容组件
const MediaItem = ({ item }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
      className="relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {item.type === 'image' ? (
        <Image
          src={item.url}
          alt=""
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          onLoadingComplete={() => setIsLoaded(true)}
        />
      ) : (
        <video
          src={item.url}
          controls
          className="w-full h-full"
          onLoadedData={() => setIsLoaded(true)}
        />
      )}
    </motion.div>
  );
};

// 标签组件
const Tag = ({ children }) => (
  <motion.span
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
               text-blue-400 rounded-full text-sm font-medium shadow-sm 
               hover:shadow-md transition-all duration-300 cursor-pointer"
  >
    #{children}
  </motion.span>
);

const PostContent = ({ post }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8 mt-8"
  >
    <motion.h1 
      className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 
                 bg-clip-text text-transparent leading-tight"
    >
      {post.title}
    </motion.h1>
    
    <motion.div 
      className="prose prose-invert max-w-none prose-lg 
                 prose-p:leading-relaxed prose-headings:text-gray-100
                 prose-a:text-blue-400 hover:prose-a:text-blue-300
                 prose-strong:text-gray-100 prose-code:text-blue-300
                 prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-gray-700"
    >
      {post.content}
    </motion.div>
 
    {post.media?.length > 0 && (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {post.media.map((item, index) => (
          <MediaItem key={index} item={item} />
        ))}
      </motion.div>
    )}
 
    {post.tags?.length > 0 && (
      <motion.div 
        className="flex flex-wrap gap-3"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {post.tags.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </motion.div>
    )}
  </motion.div>
);

export default PostContent;
// src/pages/Community/PostDetail/components/PostContent.jsx
// 帖子内容展示组件
import React from 'react';

const PostContent = ({ post }) => (
  <div className="space-y-6 mt-6">
    <h1 className="text-2xl font-bold">{post.title}</h1>
    
    <div className="prose prose-invert max-w-none">
      {post.content}
    </div>
 
    {post.media?.length > 0 && (
      <div className="grid grid-cols-2 gap-4">
        {post.media.map((item, index) => (
          <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={item.url} controls className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
    )}
 
    {post.tags?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {post.tags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            #{tag}
          </span>
        ))}
      </div>
    )}
  </div>
 );

export default PostContent;


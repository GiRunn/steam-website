// src/pages/Community/PostDetail/components/UserInfo.jsx
// 用户信息展示组件
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const UserInfo = ({ author, createdAt }) => (
 <div className="flex items-center space-x-4">
   <img 
     src={author.avatar} 
     alt={author.name} 
     className="w-12 h-12 rounded-full object-cover"
   />
   <div>
     <div className="flex items-center space-x-2">
       <h3 className="font-medium text-lg">{author.name}</h3>
       {author.type === 'official' && (
         <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
           官方
         </span>
       )}
       {author.badge && (
         <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
           {author.badge}
         </span>
       )}
     </div>
     <time className="text-sm text-gray-400">
       {new Date(createdAt).toLocaleString('zh-CN')}
     </time>
   </div>
 </div>
);

export default UserInfo;
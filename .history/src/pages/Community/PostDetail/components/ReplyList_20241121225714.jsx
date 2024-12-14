// src/pages/Community/PostDetail/components/ReplyList.jsx
// 回复列表组件
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'framer-motion';

const Reply = ({ reply }) => (
 <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   className="border-b border-gray-700 last:border-0"
 >
   <div className="flex items-start space-x-4 p-4">
     <img
       src={reply.user.avatar}
       alt={reply.user.nickname}
       className="w-10 h-10 rounded-full object-cover"
     />
     
     <div className="flex-1">
       <div className="flex justify-between items-center mb-2">
         <h4 className="text-blue-400 font-medium">{reply.user.nickname}</h4>
         <span className="text-sm text-gray-500">
           {formatDistanceToNow(new Date(reply.createdAt), { 
             locale: zhCN, 
             addSuffix: true 
           })}
         </span>
       </div>
       
       <p className="text-gray-300">{reply.content}</p>
       
       <div className="mt-2 flex items-center space-x-4">
         <button className="text-gray-500 hover:text-blue-400 text-sm">
           回复
         </button>
         <button className="text-gray-500 hover:text-red-400 text-sm">
           举报
         </button>
       </div>
     </div>
   </div>
 </motion.div>
);

const ReplyList = ({ replies }) => (
  <div className="bg-gray-800/50 rounded-lg">
    <div className="p-4 border-b border-gray-700">
      <h3 className="text-lg font-medium">全部回复 ({replies.length})</h3>
    </div>
    
    <div className="divide-y divide-gray-700">
      {replies.map((reply) => (
        <div key={reply.id} className="p-4">
          <div className="flex space-x-4">
            <img
              src={reply.author.avatar}
              alt={reply.author.name}
              className="w-10 h-10 rounded-full"
            />
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-blue-400 font-medium">
                  {reply.author.name}
                </h4>
                <time className="text-sm text-gray-500">
                  {new Date(reply.createdAt).toLocaleString('zh-CN')}
                </time>
              </div>
              
              <p className="text-gray-300">{reply.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
 );

export default ReplyList;
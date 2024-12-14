// src/pages/Community/PostDetail/components/ReplyList.jsx
// 回复列表组件 - 展示帖子的回复内容，包含回复者信息、回复内容及交互功能
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { MessageSquare, Flag, Heart } from 'lucide-react'; // 需要安装 lucide-react

// 回复项组件
const ReplyItem = ({ reply }) => {
 return (
   <motion.div
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     className="group hover:bg-gray-800/30 transition-colors duration-200"
   >
     <div className="p-6 flex gap-4">
       <motion.img
         whileHover={{ scale: 1.05 }}
         src={reply.author.avatar}
         alt={reply.author.name}
         className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700/50 hover:ring-blue-500/50 transition-all duration-300"
       />
       
       <div className="flex-1 space-y-3">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <h4 className="font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
               {reply.author.name}
             </h4>
             <span className="px-2 py-0.5 text-xs bg-gray-700/50 text-gray-400 rounded-full">
               Level 3
             </span>
           </div>
           
           <time className="text-sm text-gray-500 font-medium">
             {formatDistanceToNow(new Date(reply.createdAt), {
               locale: zhCN,
               addSuffix: true
             })}
           </time>
         </div>
         
         <motion.p 
           initial={{ opacity: 0.8 }}
           animate={{ opacity: 1 }}
           className="text-gray-300 leading-relaxed"
         >
           {reply.content}
         </motion.p>

         <div className="flex items-center gap-6 pt-2">
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors text-sm"
           >
             <Heart className="w-4 h-4" />
             <span>12</span>
           </motion.button>

           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors text-sm"
           >
             <MessageSquare className="w-4 h-4" />
             <span>回复</span>
           </motion.button>

           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm"
           >
             <Flag className="w-4 h-4" />
             <span>举报</span>
           </motion.button>
         </div>
       </div>
     </div>
   </motion.div>
 );
};

const ReplyList = ({ replies }) => {
 return (
   <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     className="bg-gray-800/30 rounded-xl backdrop-blur-sm shadow-lg"
   >
     <div className="px-6 py-4 border-b border-gray-700/50">
       <div className="flex items-center justify-between">
         <h3 className="text-lg font-medium text-gray-100">
           全部回复
           <span className="ml-2 px-2 py-0.5 text-sm bg-blue-500/20 text-blue-400 rounded-full">
             {replies.length}
           </span>
         </h3>
         
         <select className="bg-gray-700/50 text-gray-300 rounded-lg px-3 py-1.5 text-sm border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
           <option>最新回复</option>
           <option>最早回复</option>
           <option>最多点赞</option>
         </select>
       </div>
     </div>

     <div className="divide-y divide-gray-700/50">
       {replies.map((reply) => (
         <ReplyItem key={reply.id} reply={reply} />
       ))}
     </div>
   </motion.div>
 );
};

export default ReplyList;
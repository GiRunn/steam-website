// src/pages/Community/PostDetail/components/Interactions.jsx
// 交互功能组件(点赞、回复数等)
import React from 'react';
import { motion } from 'framer-motion';

const Interactions = ({ likes, replies, onLike }) => {
 return (
   <div className="flex items-center space-x-6 py-4 border-t border-gray-700">
     <motion.button
       whileTap={{ scale: 0.95 }}
       onClick={onLike}
       className="flex items-center space-x-2 text-gray-400 hover:text-red-400
                  transition-colors duration-300"
     >
       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
               d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
       </svg>
       <span>{likes}</span>
     </motion.button>

     <div className="flex items-center space-x-2 text-gray-400">
       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
               d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
       </svg>
       <span>{replies} 条回复</span>
     </div>
   </div>
 );
};

export default Interactions;
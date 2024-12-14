// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 回复编辑组件 - 用于创建新的回复
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react'; // 需要安装 emoji-picker-react

const ReplyEditor = ({ onSubmit }) => {
 const [content, setContent] = useState('');
 const [showEmoji, setShowEmoji] = useState(false);
 const [isFocused, setIsFocused] = useState(false);

 const handleSubmit = () => {
   if (!content.trim()) return;
   onSubmit(content);
   setContent('');
 };

 return (
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 shadow-lg"
   >
     <div className={`
       relative border-2 rounded-xl transition-all duration-300
       ${isFocused ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-gray-700/50'}
     `}>
       <textarea
         value={content}
         onChange={(e) => setContent(e.target.value)}
         onFocus={() => setIsFocused(true)}
         onBlur={() => setIsFocused(false)}
         placeholder="写下你的回复..."
         className="w-full min-h-[120px] p-4 bg-transparent text-gray-200 placeholder-gray-500 
                    resize-none focus:outline-none"
       />

       <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700/50">
         <div className="flex items-center gap-4">
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             className="text-gray-400 hover:text-blue-400 transition-colors"
           >
             <ImageIcon className="w-5 h-5" />
           </motion.button>

           <div className="relative">
             <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => setShowEmoji(!showEmoji)}
               className="text-gray-400 hover:text-blue-400 transition-colors"
             >
               <Smile className="w-5 h-5" />
             </motion.button>

             {showEmoji && (
               <div className="absolute bottom-full mb-2 z-50">
                 <EmojiPicker
                   onEmojiClick={(emojiObject) => {
                     setContent(prev => prev + emojiObject.emoji);
                     setShowEmoji(false);
                   }}
                   theme="dark"
                 />
               </div>
             )}
           </div>
         </div>

         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={handleSubmit}
           disabled={!content.trim()}
           className={`
             flex items-center gap-2 px-6 py-2 rounded-full font-medium
             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
             ${content.trim() 
               ? 'bg-blue-500 hover:bg-blue-600 text-white' 
               : 'bg-gray-700 text-gray-400'}
           `}
         >
           <Send className="w-4 h-4" />
           <span>发送</span>
         </motion.button>
       </div>
     </div>
   </motion.div>
 );
};

export default ReplyEditor;
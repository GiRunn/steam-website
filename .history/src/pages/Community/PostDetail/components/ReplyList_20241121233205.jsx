// src/pages/Community/PostDetail/components/ReplyEditor.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, X, AtSign, Link2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const ToolButton = ({ icon: Icon, label, onClick, isActive }) => (
 <motion.button
   whileHover={{ scale: 1.05 }}
   whileTap={{ scale: 0.95 }}
   onClick={onClick}
   className={`
     flex items-center gap-2 px-4 py-2 rounded-lg 
     transition-colors duration-200
     ${isActive 
       ? 'bg-blue-500/20 text-blue-400' 
       : 'text-gray-400 hover:bg-gray-700/50 hover:text-blue-400'}
   `}
 >
   <Icon className="w-5 h-5" />
   <span className="text-sm font-medium">{label}</span>
 </motion.button>
);

const ReplyEditor = ({ onSubmit }) => {
 const [content, setContent] = useState('');
 const [showEmoji, setShowEmoji] = useState(false);
 const [isExpanded, setIsExpanded] = useState(false);
 const [selectedTool, setSelectedTool] = useState(null);

 const handleSubmit = () => {
   if (!content.trim()) return;
   onSubmit(content);
   setContent('');
   setIsExpanded(false);
 };

 return (
   <motion.div 
     layout
     className="relative z-10"
   >
     <div className={`
       relative bg-gray-900/80 backdrop-blur-xl rounded-2xl
       shadow-2xl border border-gray-700/50
       transition-all duration-300 ease-in-out
       ${isExpanded ? 'mt-8 p-6' : 'p-4'}
     `}>
       {/* 编辑器头部 */}
       {isExpanded && (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex items-center justify-between mb-4"
         >
           <h3 className="text-lg font-semibold text-gray-200">
             写下你的回复
           </h3>
           <button 
             onClick={() => setIsExpanded(false)}
             className="text-gray-500 hover:text-gray-300"
           >
             <X className="w-5 h-5" />
           </button>
         </motion.div>
       )}

       {/* 文本编辑区 */}
       <div className="relative">
         <textarea
           value={content}
           onChange={(e) => setContent(e.target.value)}
           onFocus={() => setIsExpanded(true)}
           placeholder="写下你的想法..."
           className={`
             w-full bg-gray-800/50 text-gray-200 placeholder-gray-500
             rounded-xl resize-none p-4 border-2 border-transparent
             focus:outline-none focus:border-blue-500/50
             transition-all duration-300
             ${isExpanded ? 'min-h-[180px]' : 'h-[56px]'}
           `}
         />

         {/* 快捷工具栏 */}
         <AnimatePresence>
           {isExpanded && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="flex items-center gap-2 mt-4"
             >
               <ToolButton 
                 icon={AtSign}
                 label="提及"
                 onClick={() => setSelectedTool('mention')}
                 isActive={selectedTool === 'mention'}
               />
               <ToolButton 
                 icon={Link2}
                 label="链接"
                 onClick={() => setSelectedTool('link')}
                 isActive={selectedTool === 'link'}
               />
               <ToolButton 
                 icon={ImageIcon}
                 label="图片"
                 onClick={() => setSelectedTool('image')}
                 isActive={selectedTool === 'image'}
               />
               <ToolButton 
                 icon={Smile}
                 label="表情"
                 onClick={() => setShowEmoji(!showEmoji)}
                 isActive={showEmoji}
               />
             </motion.div>
           )}
         </AnimatePresence>
       </div>

       {/* 表情选择器 */}
       <AnimatePresence>
         {showEmoji && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             className="absolute right-0 top-full mt-2"
           >
             <EmojiPicker
               onEmojiClick={(emojiObject) => {
                 setContent(prev => prev + emojiObject.emoji);
                 setShowEmoji(false);
               }}
               theme="dark"
             />
           </motion.div>
         )}
       </AnimatePresence>

       {/* 底部工具栏 */}
       <motion.div 
         layout="position"
         className={`
           flex items-center justify-end gap-4 
           ${isExpanded ? 'mt-6' : 'mt-4'}
         `}
       >
         {content.trim() && (
           <span className="text-sm text-gray-500">
             {content.length} / 1000
           </span>
         )}
         
         <motion.button
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.98 }}
           onClick={handleSubmit}
           disabled={!content.trim()}
           className={`
             relative overflow-hidden
             flex items-center gap-2 px-6 py-2.5
             rounded-xl font-medium text-sm
             transition-all duration-300
             disabled:opacity-50 disabled:cursor-not-allowed
             ${content.trim() 
               ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/20' 
               : 'bg-gray-700 text-gray-400'}
           `}
         >
           <Send className="w-4 h-4" />
           <span>{isExpanded ? '发送回复' : '回复'}</span>
         </motion.button>
       </motion.div>
     </div>
   </motion.div>
 );
};

export default ReplyEditor;
// src/pages/Community/PostDetail/components/ReplyEditor.jsx
// 回复编辑器组件
import React, { useState } from 'react';

const ReplyEditor = ({ onSubmit }) => {
 const [content, setContent] = useState('');

 const handleSubmit = (e) => {
   e.preventDefault();
   if (!content.trim()) return;
   
   onSubmit(content);
   setContent('');
 };

 return (
   <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-6">
     <textarea
       value={content}
       onChange={(e) => setContent(e.target.value)}
       placeholder="写下你的回复..."
       className="w-full h-32 px-4 py-3 bg-gray-900 rounded-lg 
                text-gray-100 placeholder-gray-500 focus:ring-2 
                focus:ring-blue-500 outline-none resize-none"
     />
     
     <div className="mt-4 flex justify-end">
       <button
         type="submit"
         disabled={!content.trim()}
         className="px-6 py-2 bg-blue-500 text-white rounded-lg
                  hover:bg-blue-600 transition-colors duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed"
       >
         发送回复
       </button>
     </div>
   </form>
 );
};

export default ReplyEditor;
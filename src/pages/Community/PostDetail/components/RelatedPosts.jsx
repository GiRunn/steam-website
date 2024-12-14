// src/pages/Community/PostDetail/components/RelatedPosts.jsx
// 相关帖子推荐组件
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RelatedPostCard = ({ post }) => (
 <motion.div
   whileHover={{ y: -4 }}
   className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800 
              transition-colors duration-300"
 >
   <Link to={`/community/post/${post.id}`}>
     {post.coverImage && (
       <img
         src={post.coverImage}
         alt={post.title}
         className="w-full h-40 object-cover"
       />
     )}
     
     <div className="p-4">
       <h4 className="text-lg font-medium mb-2 line-clamp-2">
         {post.title}
       </h4>
       
       <div className="flex items-center justify-between text-sm text-gray-400">
         <div className="flex items-center space-x-2">
           <img
             src={post.author.avatar}
             alt={post.author.nickname}
             className="w-6 h-6 rounded-full"
           />
           <span>{post.author.nickname}</span>
         </div>
         
         <div className="flex items-center space-x-3">
           <span>{post.likes} 赞</span>
           <span>{post.replies} 回复</span>
         </div>
       </div>
     </div>
   </Link>
 </motion.div>
);

const RelatedPosts = ({ currentPostId }) => {
 const [relatedPosts, setRelatedPosts] = React.useState([]);

 React.useEffect(() => {
   // 获取相关帖子的API调用
   // const fetchRelatedPosts = async () => {
   //   const response = await api.getRelatedPosts(currentPostId);
   //   setRelatedPosts(response.data);
   // };
   // fetchRelatedPosts();
 }, [currentPostId]);

 return (
   <div className="space-y-4">
     <h3 className="text-xl font-medium mb-4">相关推荐</h3>
     
     <div className="space-y-4">
       {relatedPosts.map((post) => (
         <RelatedPostCard key={post.id} post={post} />
       ))}
     </div>
   </div>
 );
};

export default RelatedPosts;
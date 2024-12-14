// src/pages/Community/PostDetail/index.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_POSTS } from '../constants';
import PostContent from './components/PostContent';
import UserInfo from './components/UserInfo';
import Interactions from './components/Interactions';
import ReplyEditor from './components/ReplyEditor';
import ReplyList from '<div className="" />
<components />
<PostDetail />ReplyList';

import AdminActions from './components/AdminActions';
import RelatedPosts from './components/RelatedPosts';

const PostDetail = () => {
 const navigate = useNavigate();
 const { id } = useParams();
 const post = MOCK_POSTS.find(p => p.id === Number(id));

 if (!post) return <div>帖子不存在</div>;

 return (
   <div className="min-h-screen bg-[#0a0f16] text-white">
     <main className="container mx-auto px-4 py-8 max-w-7xl">
       <button
         onClick={() => navigate('/community')}
         className="mb-6 flex items-center text-blue-400 hover:text-blue-300"
       >
         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
         </svg>
         返回社区
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
           <div className="bg-gray-800/50 rounded-lg p-6">
             <UserInfo author={post.author} createdAt={post.createdAt} />
             <PostContent post={post} />
             <Interactions stats={post.stats} />
             {post.author.type === 'official' && (
               <AdminActions isPinned={post.pinned} postId={post.id} />
             )}
           </div>
          
           <ReplyList replies={post.replies} />
           <ReplyEditor postId={post.id} />
         </div>

         <aside className="lg:col-span-4">
           <RelatedPosts currentPostId={post.id} />
         </aside>
       </div>
     </main>
   </div>
 );
};

export default PostDetail;
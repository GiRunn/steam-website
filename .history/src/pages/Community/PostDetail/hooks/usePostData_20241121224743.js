// src/pages/Community/PostDetail/hooks/usePostData.js
// 处理帖子数据和交互逻辑的自定义Hook
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const usePostData = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 这里应该是实际的API调用
    const fetchPost = async () => {
      try {
        // const response = await api.getPostById(id);
        // setPost(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      // await api.likePost(id);
      setPost(prev => ({
        ...prev,
        likes: prev.likes + 1,
        isLiked: true
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleReply = async (content) => {
    try {
      // const response = await api.replyToPost(id, content);
      setPost(prev => ({
        ...prev,
        replies: [...prev.replies, response.data],
        replyCount: prev.replyCount + 1
      }));
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这个帖子吗？')) return;
    try {
      // await api.deletePost(id);
      // 删除成功后跳转
      window.location.href = '/community';
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handlePin = async () => {
    try {
      // await api.togglePinPost(id);
      setPost(prev => ({
        ...prev,
        isPinned: !prev.isPinned
      }));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  return {
    post,
    loading,
    handleLike,
    handleReply,
    handleDelete,
    handlePin
  };
};
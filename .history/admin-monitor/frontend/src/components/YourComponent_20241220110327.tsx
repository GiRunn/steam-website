const fetchReviewStats = async () => {
  try {
    const response = await axios.get('/api/correct/review/stats');
    setData(response.data);
  } catch (error) {
    console.error("获取评论统计失败:", error);
  }
}; 
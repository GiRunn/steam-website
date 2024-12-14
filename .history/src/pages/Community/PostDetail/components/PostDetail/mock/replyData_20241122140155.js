// E:\Steam\steam-website\src\pages\Community\PostDetail\components\PostDetail\mock\replyData.js
// 评论系统的模拟数据

// 模拟的用户头像数据
const avatars = {
    admin: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4",
    moderator: "https://api.dicebear.com/7.x/avataaars/svg?seed=moderator&backgroundColor=c0aede",
    user1: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=ffdfbf",
    user2: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=d1d4f9",
    user3: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3&backgroundColor=ffd5dc",
    user4: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4&backgroundColor=c1f4c5"
  };
  
  // 模拟的回复数据
  export const mockRepliesData = [
    {
      id: '1',
      content: '这篇文章写得很棒！分享了很多实用的经验，特别是关于React性能优化的部分让我收获很多。希望能看到更多类似的文章。👍',
      author: {
        name: '张小明',
        avatar: avatars.admin,
        isAdmin: true,
        badges: [
          { type: 'admin', text: '管理员' }
        ],
        isOnline: true
      },
      createdAt: '2024-03-20T08:30:00Z',
      likes: 42,
      mentions: [],
      topics: ['React', '前端优化'],
      images: [
        {
          url: 'https://api.dicebear.com/7.x/shapes/svg?seed=code-snippet',
          description: '代码示例'
        }
      ],
      replies: [
        {
          id: '1-1',
          content: '确实很实用，我已经在项目中运用了这些优化技巧，效果显著！',
          author: {
            name: '李工程师',
            avatar: avatars.user1,
            badges: [
              { type: 'vip', text: 'VIP会员' }
            ],
            isOnline: false
          },
          createdAt: '2024-03-20T09:15:00Z',
          likes: 15,
          comments: [
            {
              id: '1-1-1',
              content: '能分享一下具体的优化效果吗？比如性能提升了多少？',
              author: {
                name: '技术探索者',
                avatar: avatars.user2
              },
              createdAt: '2024-03-20T09:30:00Z',
              likes: 8
            },
            {
              id: '1-1-2',
              content: '在我们的项目中，首屏加载时间减少了40%！主要是通过代码分割和懒加载实现的。',
              author: {
                name: '李工程师',
                avatar: avatars.user1
              },
              createdAt: '2024-03-20T09:45:00Z',
              likes: 12
            }
          ]
        }
      ]
    },
    {
      id: '2',
      content: '对于文章中提到的状态管理方案，我有不同的见解。我觉得在大型应用中，Redux仍然是更好的选择。它提供了更完善的开发者工具和中间件生态。',
      author: {
        name: '资深前端',
        avatar: avatars.moderator,
        badges: [
          { type: 'moderator', text: '社区版主' }
        ],
        isOnline: true
      },
      createdAt: '2024-03-20T10:00:00Z',
      likes: 38,
      mentions: [],
      topics: ['Redux', '状态管理'],
      replies: [
        {
          id: '2-1',
          content: '同意这个观点。特别是在团队协作的场景下，Redux的规范和可预测性确实很重要。我们团队之前就因为状态管理不当导致了不少问题。',
          author: {
            name: '团队主管',
            avatar: avatars.user3
          },
          createdAt: '2024-03-20T10:30:00Z',
          likes: 20,
          comments: [
            {
              id: '2-1-1',
              content: '不过Redux的模板代码确实有点多，对于中小型项目来说有点过重了。现在我们团队在小项目中更倾向于使用Context + useReducer的组合。',
              author: {
                name: '初学者',
                avatar: avatars.user4
              },
              createdAt: '2024-03-20T11:00:00Z',
              likes: 5
            }
          ]
        }
      ]
    }
  ];
  
  // 模拟文章数据
  export const mockArticleData = {
    id: 'article-1',
    title: 'React性能优化最佳实践 - 从理论到实战',
    author: {
      name: '技术派',
      avatar: avatars.admin,
      badges: [{ type: 'admin', text: '官方' }]
    },
    publishDate: '2024-03-20T08:00:00Z',
    readCount: 3240,
    likeCount: 156,
    commentCount: 48
  };
  
  export default mockRepliesData;
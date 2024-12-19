// services/api.js
export const eventService = {
    getEvents: async (params = { limit: 2 }) => {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      return [
        {
          id: 1,
          title: "春节特惠",
          description: "数千款游戏低至1折，还有新春限定道具等你来领！",
          // 使用可访问的图片URL
          image: "https://picsum.photos/800/400?random=1",  // 随机图片1
          date: "2024-02-10",
          time: "10:00",
          isSticky: true,
          status: 'published'
        },
        {
          id: 2,
          title: "周年庆典",
          description: "参与活动获得限定皮肤和独特奖励",
          // 使用可访问的图片URL
          image: "https://picsum.photos/800/400?random=2",  // 随机图片2
          date: "2024-03-15",
          time: "14:00",
          isSticky: false,
          status: 'published'
        }
      ];
    }
  };
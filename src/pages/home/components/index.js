/**
 * 展示类型常量
 */
export const DISPLAY_TYPES = {
    GRID: 'grid',      // 网格展示
    LIST: 'list',      // 列表展示
    FEATURED: 'featured' // 特色展示
  };
  
  /**
   * 内容类型常量
   */
  export const CONTENT_TYPES = {
    NEW: 'new',           // 新品
    HOT: 'hot',          // 热门
    RECOMMENDED: 'recommended', // 推荐
    SPECIAL: 'special'    // 特惠
  };
  
  /**
   * 模拟游戏数据
   * @type {Array<Object>} 游戏数据列表
   */
  export const MOCK_GAMES = [
    {
      id: 1,
      sectionId: 'new-releases',
      title: "赛博朋克 2077",
      coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
      description: "在赛博朋克 2077 这款开放世界动作冒险 RPG 中，您将在夜之城这座权力、魅力和义体改造的都市扮演一名雇佣兵。",
      developer: "CD PROJEKT RED",
      publisher: "CD PROJEKT RED",
      releaseDate: "2020-12-10",
      tags: [
        { id: 1, name: "开放世界" },
        { id: 2, name: "RPG" },
        { id: 3, name: "赛博朋克" }
      ],
      rating: 4.5,
      originalPrice: 298,
      currentPrice: 149,
      discount: 50,
      videos: [{ id: 1, url: "https://cdn.akamai.steamstatic.com/steam/apps/256812115/movie480.webm" }]
    },
    // ... 其他游戏数据
  ];
  
  /**
   * 视频列表数据
   */
  export const MOCK_VIDEOS = [
    {
      id: 1,
      title: '游戏预告片 1',
      thumbnail: 'https://picsum.photos/300/169',
      videoUrl: 'https://www.youtube.com/embed/video1',
    },
    // ... 其他视频数据
  ];
  
  /**
   * 特惠商品数据
   */
  export const MOCK_OFFERS = [
    {
      id: 1,
      title: 'Game Title 1',
      image: 'https://picsum.photos/300/150',
      discount: 75,
      originalPrice: 59.99,
      currentPrice: 14.99,
      endTime: '48:00',
    },
    // ... 其他特惠数据
  ];
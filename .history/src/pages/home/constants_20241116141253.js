export const DISPLAY_TYPES = {
    GRID: 'grid',
    LIST: 'list',
    FEATURED: 'featured'
  };
  
  export const CONTENT_TYPES = {
    NEW: 'new',
    HOT: 'hot',
    RECOMMENDED: 'recommended',
    SPECIAL: 'special'
  };
  

  export const GAME_FILTERS = [
    { id: 'all', name: '全部游戏' },
    { id: 'new-releases', name: '新品上市' },
    { id: 'specials', name: '特别优惠' },
    { id: 'top-sellers', name: '热销游戏' },
    { id: 'upcoming', name: '即将推出' }
  ];

  //游戏组件信息
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
    {
      id: 2,
      sectionId: 'new-releases',
      title: "奥利给",
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
    {
      id: 1,
      sectionId: 'new-releases',
      title: "小黄人",
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
    }
  ];
  


  export const MOCK_VIDEOS = [
    {
      id: 1,
      title: '游戏预告片 1',
      thumbnail: 'https://picsum.photos/300/169',
      videoUrl: 'https://www.youtube.com/embed/video1',
    },
    {
      id: 2,
      title: '游戏预告片 2',
      thumbnail: 'https://picsum.photos/300/169',
      videoUrl: 'https://www.youtube.com/embed/video2',
    }
  ];
  
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
    {
      id: 2,
      title: 'Game Title 2',
      image: 'https://picsum.photos/300/150',
      discount: 50,
      originalPrice: 49.99,
      currentPrice: 24.99,
      endTime: '24:00',
    }
  ];

  //合作伙伴信息

  export const MOCK_PARTNERS = [
    {
      id: 1,
      name: '腾讯游戏',
      image: 'https://picsum.photos/300/169?random=1',
      description: '全球领先的游戏开发商'
    },
    {
      id: 2,
      name: '网易游戏',
      image: 'https://picsum.photos/300/169?random=2',
      description: '创新游戏体验的领导者'
    },
    {
      id: 3,
      name: 'Steam',
      image: 'https://picsum.photos/300/169?random=3',
      description: '全球最大的游戏分发平台'
    },
    {
      id: 4,
      name: 'Epic Games',
      image: 'https://picsum.photos/300/169?random=4',
      description: '虚幻引擎与游戏开发先驱'
    },
    {
      id: 5,
      name: 'Unity',
      image: 'https://picsum.photos/300/169?random=5',
      description: '领先的游戏开发引擎'
    }
  ];
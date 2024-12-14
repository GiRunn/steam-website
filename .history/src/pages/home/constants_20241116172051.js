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
  
//商品组件分类
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
      sectionId: 'upcoming',
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
      id: 3,
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
    },
    {
      id: 4,
      sectionId: 'new-releases',
      title: "2Take1",
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
      originalPrice: 888,
      currentPrice: 788,
      discount: 50,
      videos: [{ id: 1, url: "https://cdn.akamai.steamstatic.com/steam/apps/256812115/movie480.webm" }]
    },
    {
      id: 5,
      sectionId: 'new-releases',
      title: "Stand",
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
  

//官网游戏组件卡片信息
  export const MOCK_VIDEOS = [
    {
      id: 1,
      title: '赛博朋克 2077 预告片',
      description: '2077年的黑暗未来...',
      thumbnail: 'https://picsum.photos/800/450?random=1',
      videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256812115/movie480.webm'
    },
    {
      id: 2,
      title: 'GTA Online 更新预告',
      description: '全新的在线体验...',
      thumbnail: 'https://picsum.photos/800/450?random=2',
      videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256812116/movie480.webm'
    },
    {
      id: 3,
      title: '求生之路 3 预告片',
      description: '与朋友一起生存...',
      thumbnail: 'https://picsum.photos/800/450?random=3',
      videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256812117/movie480.webm'
    },
    {
      id: 4,
      title: '文明 7 预告片',
      description: '建立你的帝国...',
      thumbnail: 'https://picsum.photos/800/450?random=4',
      videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256812118/movie480.webm'
    },
    {
      id: 5,
      title: '刺客信条：复兴 预告片',
      description: '重返古代文明...',
      thumbnail: 'https://picsum.photos/800/450?random=5',
      videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256812119/movie480.webm'
    },
    {
      id: 6,
      title: '半条命 3 预告片',
      description: '继续科幻冒险...',
      thumbnail: 'https://picsum.photos/800/450?random=6',
      videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256812120/movie480.webm'
    }
  ];
  
  //官网首页视频展示内容信息
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

  // E:\Steam\steam-website\src\pages\home\constants.js
// ... 其他已有的常量


//官网图文介绍细腻系
export const FEATURES_CONTENT = {
  title: "次世代游戏体验",
  subtitle: "打造极致游戏平台，连接全球游戏玩家。在这里，发现无限可能。",
  mainFeature: {
    title: "开创游戏新纪元",
    description: "我们致力于为玩家提供最优质的游戏体验。通过持续创新和技术突破，打造一个真正以玩家为中心的游戏平台。无论您是休闲玩家还是专业玩家，都能在这里找到属于自己的游戏天地。",
    buttonText: "立即体验"
  },
  features: [
    {
      id: 1,
      icon: "shield",
      title: "安全保障",
      description: "全球顶级的安全防护系统，为您的游戏体验保驾护航"
    },
    {
      id: 2,
      icon: "gamepad",
      title: "海量游戏",
      description: "超过50,000款精品游戏，覆盖所有热门品类"
    },
    {
      id: 3,
      icon: "users",
      title: "社区互动",
      description: "数亿玩家在线互动，分享游戏心得与攻略"
    },
    {
      id: 4,
      icon: "trophy",
      title: "成就系统",
      description: "完整的成就体系，记录您的每一个精彩时刻"
    }
  ]
};
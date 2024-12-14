//src/pages/store/constants.js

// 排序选项
export const SORT_OPTIONS = {
    RELEASE_DATE: 'releaseDate',
    PRICE_ASC: 'priceAsc', 
    PRICE_DESC: 'priceDesc',
    RATING: 'rating',
    POPULARITY: 'popularity'
  };
  
  // 价格区间
  export const PRICE_RANGES = [
    { id: 'free', label: '免费游戏', count: 328, min: 0, max: 0 },
    { id: 'under50', label: '￥50以下', count: 1205, min: 0.01, max: 50 },
    { id: '50to200', label: '￥50-200', count: 867, min: 50, max: 200 },
    { id: 'above200', label: '￥200以上', count: 432, min: 200, max: null }
  ];
  
  // 游戏类型
  export const GAME_GENRES = [
    { id: 'action', label: '动作', count: 1524 },
    { id: 'adventure', label: '冒险', count: 982 },
    { id: 'rpg', label: 'RPG', count: 756 },
    { id: 'strategy', label: '策略', count: 445 },
    { id: 'simulation', label: '模拟', count: 678 },
    { id: 'sports', label: '体育', count: 234 }
  ];
  
  // 特殊标签
  export const SPECIAL_TAGS = [
    { id: 'singleplayer', label: '单人' },
    { id: 'multiplayer', label: '多人' },
    { id: 'coop', label: '在线合作' },
    { id: 'vr', label: 'VR支持' },
    { id: 'controller', label: '手柄支持' },
    { id: 'achievements', label: '成就系统' },
    { id: 'cloud', label: '云存档' },
    { id: 'mods', label: '模组支持' }
  ];
  
  // 加密密钥
  export const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-fallback-key';
  
  // API接口地址
  export const API_ENDPOINTS = {
    GAMES: '/api/games',
    EVENTS: '/api/events',
    STATS: '/api/stats',
    RECOMMENDATIONS: '/api/recommendations'
  };
  
  // 安全配置
  export const SECURITY_CONFIG = {
    maxRequestsPerMinute: 60,
    maxItemsPerPage: 48,
    allowedImageDomains: ['steamcdn-a.akamaihd.net', 'cdn.cloudflare.steamstatic.com'],
    csrfTokenHeader: 'X-CSRF-Token'
  };
  
  // 分页配置
  export const PAGINATION_CONFIG = {
    itemsPerPageOptions: [12, 24, 36, 48],
    defaultItemsPerPage: 24,
    maxPagesToShow: 5
  };
  
  // 示例数据 - 活动数据
  export const MOCK_EVENTS = [
    {
      id: 1,
      title: "新春佳节特惠",
      description: "超过1000款游戏参与折扣,最高立减90%！还有新春限定皮肤等你来拿！",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
      startDate: "2024-02-10",
      endDate: "2024-02-24",
      discount: "90%",
      featured: true
    },
    {
      id: 2, 
      title: "周年庆典活动",
      description: "Steam陪伴大家已经20年！参与活动赢取独特奖励和纪念徽章！",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg", 
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      discount: "75%",
      featured: true
    }
  ];
  
  // 示例数据 - 统计数据
  export const MOCK_STATISTICS = [
    {
      id: 'online_players',
      label: '在线玩家',
      value: '1,234,567',
      change: '+12.5%',
      trend: 'up',
      icon: 'Users'
    },
    {
      id: 'total_games',
      label: '游戏总数',
      value: '50,000+',
      change: '+156',
      trend: 'up',
      icon: 'Gamepad'
    },
    {
      id: 'downloads_today',
      label: '今日下载',
      value: '89,432',
      change: '-5.2%',
      trend: 'down',
      icon: 'Download'
    },
    {
      id: 'achievements',
      label: '成就解锁',
      value: '12.5M',
      change: '+8.7%',
      trend: 'up',
      icon: 'Trophy'
    }
  ];
  
  // 示例数据 - 游戏数据
  export const MOCK_GAMES = [
    {
      id: 1,
      title: "赛博朋克2077",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
      rating: 4.8,
      tags: ['RPG', '开放世界', '科幻'],
      releaseDate: '2020-12-10',
      publisher: "CD PROJEKT RED",
      playerCount: "单人",
      description: "在赛博朋克2077中，您将在最危险的未来都市夜之城寻找永生的关键。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 95,
        total: 12580
      }
    },
    {
      id: 2,
      title: "艾尔登法环",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 3,
      title: "2TAKE1",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 4,
      title: "幻影",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 5,
      title: "Stand",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 6,
      title: "X-C",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 7,
      title: "奥迪A8",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 8,
      title: "艾尔登法环",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 9,
      title: "艾尔登法环",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 10,
      title: "艾尔登法环",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 11,
      title: "艾尔登法环",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 13,
      title: "艾尔登法环",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    },
    {
      id: 13,
      title: "艾尔登法环",
      price: 298,
      originalPrice: 398,
      discount: 25,
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg", 
      rating: 4.9,
      tags: ['动作', 'RPG', '魂系列'],
      releaseDate: '2022-02-25',
      publisher: "FromSoftware",
      playerCount: "单人/多人",
      description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
      features: ['4K Ultra HD', 'HDR', '手柄支持'],
      reviews: {
        positive: 98,
        total: 23456
      }
    }
  ];
  
  // 示例数据 - 推荐游戏
  export const MOCK_RECOMMENDED_GAMES = [
    {
      id: 1,
      title: "荒野大镖客：救赎2",
      description: "在这款史诗般的西部世界中开启你的冒险",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
      rating: 4.9
    },
    {
      id: 2,
      title: "死亡搁浅",
      description: "小岛秀夫突破性的动作冒险游戏",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1190460/header.jpg",
      rating: 4.7
    },
    {
      id: 3,
      title: "只狼：影逝二度",
      description: "在战国时代的日本展开你的冒险",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg",
      rating: 4.8
    }
  ];



  //----------------------------------------------------------------------------
  // 以下为活动数据
export const ACTIVITIES_DATA = [
  {
    id: 1,
    banner: {
      imageUrl: "/images/activity-banner.jpg",
      title: "2024年度电竞嘉年华",
      subtitle: "线下专业电竞赛事活动"
    },
    info: {
      title: "活动详情",
      description: "这是一场专业级别的电竞赛事活动，融合了多个热门游戏项目的比赛...",
      date: "2024-12-01",
      location: "上海市电竞中心",
      capacity: 1000,
      price: {
        regular: 299,
        vip: 599
      },
      highlights: [
        "专业选手现场表演赛",
        "明星选手见面会",
        "游戏周边限定礼品",
        "VIP专属观赛区域"
      ],
      tags: ["电竞", "游戏", "线下活动", "比赛"]
    },
    schedule: [
      {
        time: "09:00",
        title: "开幕式",
        description: "活动开幕仪式及嘉宾致辞"
      },
      {
        time: "10:00",
        title: "小组赛",
        description: "各项目小组赛同时开始"
      }
      // ... 其他日程
    ],
    media: {
      images: [
        {
          url: "/images/activity-1.jpg",
          title: "现场图片1"
        }
        // ... 其他图片
      ],
      videos: [
        {
          url: "/videos/promo.mp4",
          title: "活动宣传片",
          thumbnail: "/images/video-thumb.jpg"
        }
      ]
    },
    // EventSection展示所需的简要信息
    preview: {
      thumbnailUrl: "/images/activity-banner.jpg",
      title: "2024年度电竞嘉年华",
      date: "2024-12-01",
      location: "上海市电竞中心",
      price: 299
    }
  },
  // ... 其他活动数据
];

export const getActivityById = (id) => {
  return ACTIVITIES_DATA.find(activity => activity.id === parseInt(id));
};

// 导出获取活动预览列表的辅助函数
export const getActivityPreviews = () => {
  return ACTIVITIES_DATA.map(activity => ({
    id: activity.id,
    ...activity.preview
  }));
};

  //----------------------------------------------------------------------------
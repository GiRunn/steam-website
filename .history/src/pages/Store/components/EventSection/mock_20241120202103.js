/**
 * 文件路径: src/pages/store/components/EventSection/mock.js
 * 文件作用: 定义活动区块相关的Mock数据
 */


   */
  export const MOCK_EVENTS = [
    {
      id: 1,
      type: EVENT_TYPES.DLC,
      order: 1, // 排序权重
      style: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff'
      },
      banner: {
        imageUrl: "https://media.st.dl.eccdnx.com/steam/apps/2378810/library_hero.jpg",
        title: "赛博朋克2077 - 黑色狂潮",
        subtitle: "夜之城最新资料片限时特惠",
        // 横幅尺寸配置
        size: {
          desktop: { width: 616, height: 353 },
          mobile: { width: 300, height: 150 }
        }
      },
      info: {
        title: "赛博朋克2077 黑色狂潮限时特惠",
        startTime: "2024-08-15 00:00:00",
        endTime: "2024-08-30 23:59:59",
        discount: 25, // 最高折扣
        description: "《赛博朋克2077：黑色狂潮》现已发布！活动期间购买即可享受85折优惠。",
        // SEO信息
        seo: {
          title: "赛博朋克2077：黑色狂潮 DLC - Steam夏季特惠",
          keywords: ["赛博朋克2077", "黑色狂潮", "DLC", "特惠"],
          description: "在Steam平台购买赛博朋克2077：黑色狂潮DLC，限时享受85折优惠。探索全新剧情，揭开夜之城的黑暗秘密。"
        }
      },
      // 活动标签
      badges: [
        {
          text: "新品预售",
          color: "green"
        },
        {
          text: "限时特惠",
          color: "red"
        }
      ],
      // 跳转链接
      link: {
        type: "activity", // 跳转类型: activity=活动详情, game=游戏详情
        path: "/store/activity/1"
      },
      // 参与游戏ID列表
      gameIds: [1, "1-dlc"]
    },
    {
      id: 2,
      type: EVENT_TYPES.SEASON,
      order: 2,
      style: {
        backgroundColor: '#2a475e',
        textColor: '#ffffff'
      },
      banner: {
        imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/clusters/sale_autumn2023_assets/54b5034d9f06cca8a2402f82/page_bg_simplified_schinese.jpg?t=1700686393",
        title: "Steam夏季特卖",
        subtitle: "数千款游戏超低折扣",
        size: {
          desktop: { width: 616, height: 353 },
          mobile: { width: 300, height: 150 }
        }
      },
      info: {
        title: "Steam夏季特卖",
        startTime: "2024-08-01 00:00:00",
        endTime: "2024-08-31 23:59:59",
        discount: 90, // 最高折扣
        description: "Steam夏季特卖现已开启！数千款游戏低至1折，还有免费游戏等你来领！",
        seo: {
          title: "Steam夏季特卖 - 超多游戏折扣中",
          keywords: ["Steam", "夏季特卖", "游戏折扣", "特惠"],
          description: "Steam夏季特卖活动开启，海量游戏低至1折，还有独家游戏优惠和限时免费游戏等你来拿。"
        }
      },
      badges: [
        {
          text: "夏季特卖",
          color: "blue"
        },
        {
          text: "折扣90%",
          color: "red"
        }
      ],
      link: {
        type: "activity",
        path: "/store/activity/2"
      },
      // 该活动关联的所有游戏ID
      gameIds: [1, 2, 3, 4, 5]
    }
  ];
  
  /**
   * 工具函数
   */
  
  /**
   * 获取活动状态
   */
  export const getEventStatus = (startTime, endTime) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
  
    if (now < start) return EVENT_STATUS.UPCOMING;
    if (now > end) return EVENT_STATUS.ENDED;
    return EVENT_STATUS.ONGOING;
  };
  
  /**
   * 获取活动数据
   */
  export const getEventById = (eventId) => {
    return MOCK_EVENTS.find(event => event.id === eventId);
  };
  
  /**
   * 获取进行中的活动
   */
  export const getOngoingEvents = () => {
    return MOCK_EVENTS.filter(event => {
      const status = getEventStatus(event.info.startTime, event.info.endTime);
      return status === EVENT_STATUS.ONGOING;
    }).sort((a, b) => a.order - b.order);
  };